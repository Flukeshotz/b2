/**
 * Seed core-2026b into Postgres.
 *
 *   node src/seed/seed_core2026b.js [--force]
 *
 * THE DATABASE IS AUTHORITATIVE. These seed files exist so the content can be
 * written, reviewed and re-created in source control; at runtime the learner API
 * reads b2_papers → b2_paper_sections → b2_paper_items and never opens this
 * directory. Deleting the seed files removes the ability to re-seed, not the
 * assessment a learner sits.
 *
 * An assessment version is stored as a PAPER. That is not a workaround: a
 * version is a structured, sectioned, timed instrument, which is exactly what
 * the paper model represents, and reusing it avoids the parallel content table
 * the architecture brief forbids. `board='custom'` and `alignment='original'`
 * say plainly that it is ours and makes no exam claim.
 *
 * SEEDING DOES NOT MAKE CONTENT PRODUCTION-READY. Every row lands at
 * review_status='AUTO_QA_PASS' only after content_model validation passes, and
 * nothing here can write SME_REVIEWED — that needs a real review record.
 *
 * IDEMPOTENT. Re-running replaces the version's sections and items wholesale
 * (delete-then-insert within one transaction) so a corrected seed file produces
 * a corrected assessment rather than a duplicated one. Completed learner
 * attempts are never touched: they reference item ids as text, not by FK, and
 * b2_assessment_items keeps its own copy of what was asked.
 */

require("../env")();
const pool = require("../db/pool");
const { BLUEPRINT, SLOTS, SPEAKING_SLOT } = require("./b2/core2026b/blueprint");
const model = require("../b2/content_model");

const VERSIONS = [
  require("./b2/core2026b/v1").V1,
  require("./b2/core2026b/v2").V2,
  require("./b2/core2026b/v3").V3,
];

const bySlot = Object.fromEntries([...SLOTS, SPEAKING_SLOT].map(s => [s.slot, s]));

/* The Skillcase rubric for short productive answers. Two dimensions only —
   a 40-word summary cannot carry four. `board='custom'` because it is ours;
   labelling it goethe would be a provenance lie (see migration 011). */
const RUBRICS = [{
  board: "custom", module: "schreiben", task_type: "kurzantwort", version: 1,
  provisional: true,
  dimensions: [
    { id: "inhalt", label: "Inhalt",
      descriptor: "Ist die Aufgabe erfüllt? Sind die geforderten Punkte enthalten?" },
    { id: "sprache", label: "Sprache",
      descriptor: "Ist die Formulierung dem Zweck und der Situation angemessen?" },
  ],
  scale_max: 3, subtest_weight: 0.5, pass_mark: 2, borderline_low: 1, borderline_high: 2,
}];

/* ── shaping one seed item into a database row ───────────────────────────── */

function buildItem(raw, ctx) {
  const spec = bySlot[raw.slot];
  if (!spec) throw new Error(`${ctx.version}: item ${raw.slot} names no blueprint slot`);

  const prov = { ...ctx.provenance, ...(raw.provenance || {}) };
  const row = {
    item_id: `${ctx.version}_${raw.slot}`.toLowerCase(),
    slot: raw.slot,
    item_type: raw.item_type,
    skill: spec.skill,
    capability: spec.capability,
    check_id: spec.check_id,
    difficulty: spec.difficulty,
    stem: raw.stem ?? raw.context ?? null,
    options: null, answer: null, answer_payload: null,
    /* The KNOWLEDGE/SKILL classification is persisted, not just declared in the
       blueprint, because the audit has to compute the real 35/65 split from the
       database. A classification that lives only in a source file is a
       classification nobody can check against what was actually seeded. */
    payload: { band: spec.band },
    scoring_mode: "OBJECTIVE",
    points: 1,
    rationale: raw.why ?? null,
    ...prov,
  };

  switch (raw.item_type) {
    case "MCQ":
      row.options = raw.options;
      row.answer = raw.answer;
      // The situation belongs with the question, not in a separate field the
      // client might forget to render.
      if (raw.context) row.payload = { ...row.payload, context: raw.context };
      break;

    case "MULTI_SELECT":
      row.payload = { ...row.payload, options: raw.options, context: raw.context ?? null };
      row.answer_payload = { correct: raw.correct };
      break;

    case "TRUE_FALSE":
      row.answer_payload = { value: raw.answer_value };
      break;

    case "MATCHING":
      row.payload = { ...row.payload, left: raw.left, right: raw.right, context: raw.context ?? null };
      row.answer_payload = { mapping: raw.mapping };
      break;

    case "GAP_FILL":
      row.payload = { ...row.payload, text: raw.text, match: raw.match ?? "ignore_case" };
      row.answer_payload = { gaps: raw.gaps };
      /* A gap-fill carries its sentence in the payload, but `stem` is NOT NULL
         and is what a learner reads as the task. Without this the item renders
         as a bare text with no instruction. */
      row.stem = raw.stem ?? "Ergänzen Sie die Lücken.";
      break;

    case "ORDERING":
      row.payload = { ...row.payload, items: raw.ordering };
      row.answer_payload = { order: raw.order };
      break;

    case "SHORT_TEXT":
    case "LONG_TEXT":
      /* No key, ever. The database refuses one on these types and so does
         content_model; this is simply where we decline to invent it. */
      row.scoring_mode = "RUBRIC";
      row.points = raw.item_type === "LONG_TEXT" ? 4 : 2;
      row.payload = { ...row.payload, rubric_id: ctx.rubricIds[raw.rubric_key],
                      rubric_key: raw.rubric_key,
                      min_words: raw.min_words, target_words: raw.target_words,
                      guidance: raw.guidance ?? null, expected: raw.expected ?? null };
      break;

    case "SPOKEN_RESPONSE":
      /* Captured, not scored. Outside the comparable core and worth no points,
         so it can never move a learner's result. */
      row.scoring_mode = "TRANSCRIPT_ONLY";
      row.points = 0;
      row.payload = { ...row.payload, speak_seconds: raw.speak_seconds, prep_seconds: raw.prep_seconds,
                      expected: raw.expected ?? null };
      break;

    default:
      throw new Error(`${ctx.version}: unsupported item_type ${raw.item_type}`);
  }

  /* Validate BEFORE the database sees it, so a content mistake reads as a
     sentence about the item rather than a constraint violation. */
  const v = model.validateItem(row);
  if (!v.valid) throw new Error(`${row.item_id}: ${v.problems.join("; ")}`);
  const p = model.validateProvenance(row, { required: true });
  if (!p.valid) throw new Error(`${row.item_id} provenance: ${p.problems.join("; ")}`);

  return row;
}

/** Flatten a version's seed file into ordered rows, grouped by section module. */
function buildSections(version, rubricIds) {
  const ctx = { version: version.id, provenance: version.provenance, rubricIds };
  const out = [];

  const push = (module, meta, items) =>
    out.push({ module, ...meta, items: items.map(r => buildItem(r, ctx)) });

  push("lesen", {
    title: version.reading.title, instruction: version.reading.instruction,
    passage: version.reading.passage, minutes: BLUEPRINT.minutes.lesen,
    skill: "reading", scoring_mode: "OBJECTIVE",
  }, version.reading.items);

  /* `audio_asset_id` is resolved by the caller against b2_audio_assets and left
     NULL when the audio has not been cut yet. Pointing a listening section at
     an unregistered asset id would either violate the foreign key or, worse,
     describe audio that does not exist. A NULL with audio_required=true is the
     honest state: content_model.validateForProduction refuses it, and the audit
     reports it as a gap rather than letting it ship silently. */
  push("hoeren", {
    title: version.listening.situation, instruction: version.listening.instruction,
    minutes: BLUEPRINT.minutes.hoeren, skill: "listening", scoring_mode: "OBJECTIVE",
    audio_required: true, audio_asset_id: version.listening.audio_id,
  }, version.listening.items);

  push("sprachbausteine", {
    title: "Sprache im Kontext", instruction: version.language.instruction,
    minutes: BLUEPRINT.minutes.sprachbausteine, skill: "grammar", scoring_mode: "OBJECTIVE",
  }, version.language.items);

  push("schreiben", {
    title: "Schreiben", instruction: "Bearbeiten Sie die folgenden Aufgaben.",
    minutes: BLUEPRINT.minutes.schreiben, skill: "writing", scoring_mode: "RUBRIC",
  }, version.production.items);

  push("sprechen", {
    title: "Sprechen", instruction: version.speaking.instruction,
    minutes: BLUEPRINT.minutes.sprechen, skill: "speaking", scoring_mode: "TRANSCRIPT_ONLY",
  }, [version.speaking]);

  return out;
}

/* ── the write ───────────────────────────────────────────────────────────── */

async function seedVersion(client, version, rubricIds) {
  const sections = buildSections(version, rubricIds);

  /* Only ATTACH audio that is actually registered — but always RECORD which
     clip the section is waiting for. `audio_asset_id` is a foreign key, so it
     cannot name a clip that does not exist yet; `audio_intended_id` is plain
     text and exists precisely to hold that name. Without it the database can
     only say "some section is missing audio", which is not an actionable
     report once there are two hundred clips to produce. */
  for (const sec of sections) {
    if (!sec.audio_asset_id) continue;
    sec.audio_intended_id = sec.audio_asset_id;
    const { rows } = await client.query(
      `SELECT 1 FROM b2_audio_assets WHERE id=$1`, [sec.audio_asset_id]);
    if (!rows.length) {
      console.log(`  NOTE  ${version.id}: audio "${sec.audio_asset_id}" is not cut yet — ` +
                  `section records it as intended, with no asset attached.`);
      sec.audio_asset_id = null;
    }
  }

  await client.query(
    `INSERT INTO b2_papers (id, board, title, minutes, source, provisional,
                            exam_version, alignment, source_type, review_status, difficulty)
     VALUES ($1,'custom',$2,$3,$4,true,$5,'original','ORIGINAL','AUTO_QA_PASS','B')
     ON CONFLICT (id) DO UPDATE SET
       title=EXCLUDED.title, minutes=EXCLUDED.minutes, exam_version=EXCLUDED.exam_version,
       alignment=EXCLUDED.alignment, review_status=EXCLUDED.review_status`,
    [version.id, version.title, Math.round(BLUEPRINT.totalMinutes),
     `Skillcase, authored. Coverage informed by ${version.provenance.source_book}.`,
     version.group]);

  // Replace wholesale so a corrected seed file yields a corrected assessment.
  await client.query(`DELETE FROM b2_paper_sections WHERE paper_id=$1`, [version.id]);

  let ord = 0;
  for (const sec of sections) {
    const { rows } = await client.query(
      /* `minutes` is an INT and the blueprint uses half-minutes, so the precise
         budget lives in `time_limit_seconds` (added by migration 010) and
         `minutes` keeps its rounded, advisory meaning. Rounding the only copy
         would have quietly turned a 15-minute assessment into a 16-minute one. */
      `INSERT INTO b2_paper_sections
         (paper_id, module, part_no, title, instruction, minutes, time_limit_seconds,
          passage, skill, scoring_mode, item_count, audio_required, audio_asset_id, audio_intended_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
      [version.id, sec.module, ++ord, sec.title, sec.instruction,
       Math.round(sec.minutes), Math.round(sec.minutes * 60),
       sec.passage ?? null, sec.skill, sec.scoring_mode, sec.items.length,
       sec.audio_required ?? false, sec.audio_asset_id ?? null, sec.audio_intended_id ?? null]);
    const sectionId = rows[0].id;

    let itemNo = 0;
    for (const it of sec.items) {
      await client.query(
        `INSERT INTO b2_paper_items
           (section_id, item_no, stem, options, answer, rationale,
            item_type, payload, answer_payload, scoring_mode, points,
            skill, capability, check_id, difficulty,
            source_book, source_chapter, source_module, source_page,
            source_type, adaptation_status, review_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,'AUTO_QA_PASS')`,
        [sectionId, ++itemNo, it.stem,
         JSON.stringify(it.options ?? []), it.answer, it.rationale,
         it.item_type, it.payload ? JSON.stringify(it.payload) : null,
         it.answer_payload ? JSON.stringify(it.answer_payload) : null,
         it.scoring_mode, it.points, it.skill, it.capability, it.check_id, it.difficulty,
         it.source_book, it.source_chapter, it.source_module, it.source_page,
         it.source_type, it.adaptation_status]);
    }
  }
  return sections.reduce((n, s) => n + s.items.length, 0);
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const rubricIds = {};
    for (const r of RUBRICS) {
      const { rows } = await client.query(
        `INSERT INTO b2_rubrics (board, module, task_type, version, provisional, dimensions,
                                 scale_max, subtest_weight, pass_mark, borderline_low, borderline_high)
         VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11)
         ON CONFLICT (board, module, task_type, version)
           DO UPDATE SET dimensions=EXCLUDED.dimensions
         RETURNING id`,
        [r.board, r.module, r.task_type, r.version, r.provisional, JSON.stringify(r.dimensions),
         r.scale_max, r.subtest_weight, r.pass_mark, r.borderline_low, r.borderline_high]);
      rubricIds[r.task_type] = rows[0].id;
    }
    // W1 is a forum post and reuses the existing Goethe Forumsbeitrag rubric —
    // that one IS a board rubric and is labelled honestly as such.
    const fb = await client.query(
      `SELECT id FROM b2_rubrics WHERE board='goethe' AND module='schreiben'
          AND task_type='forumsbeitrag' ORDER BY version DESC LIMIT 1`);
    if (!fb.rows[0]) throw new Error("the goethe/forumsbeitrag rubric is missing — run seed_b2 first");
    rubricIds.forumsbeitrag = fb.rows[0].id;

    let total = 0;
    for (const v of VERSIONS) {
      const n = await seedVersion(client, v, rubricIds);
      console.log(`  ${v.id}: ${n} items`);
      total += n;
    }

    await client.query("COMMIT");
    console.log(`\nSeeded ${VERSIONS.length} version(s), ${total} items, into the database.`);
    console.log("review_status = AUTO_QA_PASS. No item is SME_REVIEWED — no teacher has read it.");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
  await pool.end();
}

if (require.main === module) {
  main().catch(e => { console.error("SEED FAILED:", e.message); process.exit(1); });
}

module.exports = { buildSections, RUBRICS };
