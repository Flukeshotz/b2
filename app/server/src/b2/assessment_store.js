/**
 * ASSESSMENT PERSISTENCE — attempts, item attempts, results, history.
 *
 * The half of the loop that assessment_compose.js and assessment_progress.js
 * cannot do: remember. Those two are pure and decide WHAT to ask and WHAT a
 * difference means; this one owns the database and the invariants that only a
 * database can enforce.
 *
 * INVARIANTS, INHERITED FROM exam_attempt.js RATHER THAN REINVENTED.
 * That module earned these the hard way and the comments there explain each
 * scar; the same shapes are used here for the same reasons:
 *
 *   - the most recent attempt is returned, FINISHED OR NOT. Querying only open
 *     attempts means a reload on the results screen silently opens a second,
 *     empty one and the completed sitting disappears.
 *   - finish() is guarded on `finished_at IS NULL` and re-reads afterwards.
 *     rowCount is what says whether THIS call closed it, because RETURNING
 *     hands back the new row and would make every refresh look like the first
 *     submission — the difference between recording one sitting and one per
 *     reload.
 *   - a completed attempt is immutable. Responses stop being writable the
 *     moment it closes.
 *
 * NO AUTHENTICATION EXISTS in this repository. userId is passed explicitly
 * everywhere so that wiring real accounts later is a caller change, not a
 * rewrite — the same convention profile.js uses.
 */

const fs = require("node:fs");
const path = require("node:path");
const pool = require("../db/pool");
const assessment = require("../seed/b2/assessment");
const compose = require("./assessment_compose");
const progressEngine = require("./assessment_progress");
const profile = require("./profile");

const content = require("./assessment_content");
const { BLUEPRINT, ITEMS } = assessment;
const byId = new Map(ITEMS.map(i => [i.id, i]));

/* core-2026b lives in the database; core-2026a stays in the frozen registry.
   This is the single place that knows the difference — everything below asks
   the provider rather than reaching for `byId` directly. */
const isDb = (version) => content.isDbBacked(version);

/* How much we trust an assessment item as evidence. Deliberately the SAME
   weight profile.js already gives a screening, because that is what this is —
   a designed, structured diagnostic rather than a piece of real production. */
const EVIDENCE_WEIGHT = profile.WEIGHTS.screening ?? 0.7;

const DIM_FOR = {
  grammar: "grammar", vocabulary: "vocabulary", reading: "reading",
  listening: "listening", writing: "writing", speaking: "speaking",
};

/* ── READ HELPERS ────────────────────────────────────────────────────────── */

async function attemptRow(attemptId) {
  const { rows } = await pool.query(
    `SELECT id, user_id, kind, assessment_version, started_at, finished_at,
            measured_items, skipped_items, composition, scores
       FROM b2_paper_attempts WHERE id=$1 AND kind='assessment'`, [attemptId]);
  return rows[0] || null;
}

async function itemRows(attemptId) {
  const { rows } = await pool.query(
    `SELECT item_id, slot, version, position, skill, capability, check_id,
            targeted, response, correct, skipped, measured
       FROM b2_assessment_items WHERE attempt_id=$1 ORDER BY position`, [attemptId]);
  return rows;
}

/** Every item this learner has ever been SHOWN, across all attempts. */
async function seenItemIds(userId) {
  const { rows } = await pool.query(
    `SELECT DISTINCT i.item_id
       FROM b2_assessment_items i
       JOIN b2_paper_attempts a ON a.id = i.attempt_id
      WHERE a.user_id=$1 AND a.kind='assessment'`, [userId]);
  return rows.map(r => r.item_id);
}

async function satVersions(userId) {
  const { rows } = await pool.query(
    `SELECT DISTINCT assessment_version FROM b2_paper_attempts
      WHERE user_id=$1 AND kind='assessment' AND finished_at IS NOT NULL`, [userId]);
  return rows.map(r => r.assessment_version);
}

/** The evidence weaknessSet() needs. Capability-level, not dimension-level. */
async function evidenceRows(userId) {
  const { rows } = await pool.query(
    `SELECT capability, dimension, outcome, weight, source_kind, source_ref, created_at
       FROM b2_evidence WHERE user_id=$1 AND capability IS NOT NULL
      ORDER BY created_at DESC LIMIT 400`, [userId]);
  return rows;
}

/* The active production diagnostic. core-2026a is frozen and historical; every
   NEW sitting is a core-2026b version. Ordered so a learner's first sitting is
   v1, her retest is v2, and a second retest is v3 — the three were authored as
   parallel forms for exactly this progression, and picking one at random (or
   always v1) would either break comparability or let her see the same paper
   twice. */
const CURRENT_DIAGNOSTIC_VERSIONS = ["core-2026b-v1", "core-2026b-v2", "core-2026b-v3", "core-2026b-v4", "core-2026b-v5", "core-2026b-v6", "core-2026b-v7", "core-2026b-v8", "core-2026b-v9", "core-2026b-v10"];

/** The next core-2026b version this learner has not yet completed, or null once
    all three are used up. Server-authoritative: the client never guesses a
    version id, it asks this. */
async function currentDiagnosticVersion(userId) {
  const sat = await satVersions(userId);
  return CURRENT_DIAGNOSTIC_VERSIONS.find(v => !sat.includes(v)) ?? null;
}

/* ── START ───────────────────────────────────────────────────────────────── */

/**
 * Open an assessment, or hand back the one already in progress.
 *
 * REFRESH SAFETY. An unfinished attempt is RESUMED, never duplicated: a reload
 * on question four must not silently abandon the first three answers and start
 * a second sitting that history will later count as a separate assessment.
 */
/**
 * Start a DB-backed core-2026b version.
 *
 * Deliberately a separate entry point rather than a branch inside the
 * core-2026a composer: that composer selects items from the frozen registry
 * pool, and a production version is a fixed, authored instrument rather than a
 * composition. Mixing the two would put the frozen path at risk to serve the
 * new one.
 */
async function startVersion(userId, version) {
  if (!isDb(version)) throw new Error(`${version} is not a database-backed version`);

  const open = await pool.query(
    `SELECT id FROM b2_paper_attempts
      WHERE user_id=$1 AND kind='assessment' AND finished_at IS NULL
      ORDER BY id DESC LIMIT 1`, [userId]);
  if (open.rows[0]) return { ...(await getAssessment(open.rows[0].id)), resumed: true };

  const items = await content.itemsOf(version);
  if (!items.length) return { error: "unknown_version" };

  /* TWO CALLS CAN RACE THE "is one already open?" CHECK ABOVE — a page reload
     racing React StrictMode's double effect-invocation did exactly this live,
     producing two open attempts a few milliseconds apart: both SELECTs above
     ran before either INSERT committed. Migration 014's partial unique index
     (one open assessment attempt per user) turns the LOSING insert into a
     23505 rather than a silent second row, and the loser simply resumes the
     row that won — which is what "start, or resume the one already open"
     should have meant all along.

     ONE TRANSACTION FOR THE ATTEMPT ROW AND ALL OF ITS ITEM ROWS. The very
     first live run of the 23505 path crashed the process elsewhere (an
     unhandled rejection this fix's own first version left uncaught) midway
     through the item loop below and left the attempt row behind with 5 of its
     24 items — a sitting that could never be finished correctly and that
     "resume" kept handing back broken. A single transaction means any failure
     here leaves no row at all, never a half-built one. */
  const client = await pool.connect();
  let attemptId;
  try {
    await client.query("BEGIN");
    const { rows: made } = await client.query(
      `INSERT INTO b2_paper_attempts (user_id, kind, assessment_version, composition, responses)
       VALUES ($1,'assessment',$2,$3::jsonb,'{}'::jsonb) RETURNING id`,
      [userId, version, JSON.stringify({
        comparableGroup: content.groupOf(version),
        mode: "fixed_version", targetCapabilities: [],
        composition: { targetedSlots: 0, broadSlots: items.length, targetedCoverage: 0 },
        explanation: [`Fixed production version ${version}, served from the database.`],
        blueprintSlots: items.filter(i => i.module !== "sprechen").length,
      })]);
    attemptId = made[0].id;

    for (const [pos, it] of items.entries()) {
      await client.query(
        `INSERT INTO b2_assessment_items
           (attempt_id, item_id, slot, version, position, skill, capability, check_id, targeted)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false)
         ON CONFLICT (attempt_id, item_id) DO NOTHING`,
        [attemptId, it.item_id, it.slot, version, pos + 1, it.skill, it.capability, it.check_id]);
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    if (e.code !== "23505") throw e;
    const won = await pool.query(
      `SELECT id FROM b2_paper_attempts
        WHERE user_id=$1 AND kind='assessment' AND finished_at IS NULL
        ORDER BY id DESC LIMIT 1`, [userId]);
    return { ...(await getAssessment(won.rows[0].id)), resumed: true };
  } finally {
    client.release();
  }
  return { ...(await getAssessment(attemptId)), resumed: false };
}

async function startAssessment(userId, { force = false } = {}) {
  if (!force) {
    const { rows } = await pool.query(
      `SELECT id FROM b2_paper_attempts
        WHERE user_id=$1 AND kind='assessment' AND finished_at IS NULL
        ORDER BY id DESC LIMIT 1`, [userId]);
    if (rows[0]) return { ...(await getAssessment(rows[0].id)), resumed: true };
  }

  const [seen, sat, evidence] = await Promise.all([
    seenItemIds(userId), satVersions(userId), evidenceRows(userId),
  ]);
  const weaknesses = compose.weaknessSet(evidence);
  const plan = compose.composeAssessment({ seenItemIds: seen, weaknesses, satVersions: sat });

  /* Nothing left to ask is a real state, not an error to paper over. The caller
     is told plainly rather than handed a rerun of a sitting she has already
     done, which would measure recall and be scored as if it measured German.

     EXHAUSTION IS JUDGED ON THE COMPARABLE CORE, NOT ON THE ITEM COUNT.
     Counting every item let a genuinely exhausted pool through: all 20 scored
     slots were used up, one unused SPEAKING prompt remained, and `items.length`
     was 1 — so an attempt was created containing nothing but the single
     component that is explicitly not recorded and not measured. The learner was
     shown "1 von 1 · Sprechen … it never counts towards your result", and that
     sitting would have entered her history as a completed assessment measuring
     nothing. Two such rows exist in the database from finding this.

     The floor is the same one the blueprint uses for a comparable result: below
     it the sitting cannot say anything about her German, so it must not be
     started. */
  const corePlanned = plan.items.filter(i => i.skill !== "speaking").length;
  if (corePlanned < BLUEPRINT.skip.minMeasuredForComparableResult) {
    return { exhausted: true, plan, attemptId: null, comparableItemsAvailable: corePlanned,
             message: "You have already worked through every assessment we have. New material is needed before another test can tell you anything new." };
  }

  /* The version label. A bespoke retest is not "v2" even when most of its items
     come from v2 — it is its own composition, and calling it v2 would let a
     later comparison assume a structure it never had. */
  const versions = [...new Set(plan.items.map(i => i.version))];
  const version = plan.mode === "initial"
    ? plan.baselineVersion
    : (versions.length === 1 ? versions[0] : `mixed:${versions.sort().join("+")}`);

  /* Same race as startVersion, and the same fix: one transaction for the
     attempt row and every item row, so a losing 23505 or any other failure
     leaves no row behind rather than a half-built one. */
  const client = await pool.connect();
  let attemptId;
  try {
    await client.query("BEGIN");
    const { rows: made } = await client.query(
      `INSERT INTO b2_paper_attempts (user_id, kind, assessment_version, composition, responses)
       VALUES ($1,'assessment',$2,$3::jsonb,'{}'::jsonb) RETURNING id`,
      [userId, version, JSON.stringify({
        // Recorded on the attempt, not looked up later: the blueprint may move on,
        // and this sitting was built to the group as it stood today.
        comparableGroup: BLUEPRINT.comparableGroup,
        mode: plan.mode, targetCapabilities: plan.targetCapabilities,
        composition: plan.composition, coverageShortfall: plan.coverageShortfall,
        exhausted: plan.exhausted, explanation: plan.explanation,
        blueprintSlots: BLUEPRINT.slots.length,
      })]);
    attemptId = made[0].id;

    /* A ROW PER ITEM, WRITTEN AT START. Its existence is what records "shown" —
       which is how shown-and-skipped stays distinguishable from never-shown once
       the sitting is over. */
    for (const [pos, it] of plan.items.entries()) {
      const meta = byId.get(it.itemId);
      await client.query(
        `INSERT INTO b2_assessment_items
           (attempt_id, item_id, slot, version, position, skill, capability, check_id, targeted)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (attempt_id, item_id) DO NOTHING`,
        [attemptId, it.itemId, it.slot, it.version, pos + 1, it.skill,
         it.capability, meta?.check_id ?? null, !!it.targeted]);
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    if (e.code !== "23505") throw e;
    const won = await pool.query(
      `SELECT id FROM b2_paper_attempts
        WHERE user_id=$1 AND kind='assessment' AND finished_at IS NULL
        ORDER BY id DESC LIMIT 1`, [userId]);
    return { ...(await getAssessment(won.rows[0].id)), resumed: true };
  } finally {
    client.release();
  }

  return { ...(await getAssessment(attemptId)), resumed: false };
}

/* ── READ ────────────────────────────────────────────────────────────────── */

/** Strip the key. A learner who can read the answer out of the payload is not
    being assessed — the same rule /api/b2/screening already applies. */
function safeContent(meta) {
  if (!meta) return null;
  const { answer, why, ...safe } = meta.content;
  return safe;
}

async function getAssessment(attemptId) {
  const a = await attemptRow(attemptId);
  if (!a) return null;
  const rows = await itemRows(attemptId);

  return {
    attemptId: a.id,
    version: a.assessment_version,
    startedAt: a.started_at,
    completedAt: a.finished_at,
    status: a.finished_at ? "completed" : "in_progress",
    composition: a.composition,
    totalMinutes: BLUEPRINT.time.targetMinutes,
    /* Item content comes from the PROVIDER, which knows that core-2026a lives
       in the frozen registry and core-2026b lives in the database. Reaching for
       `byId` here would have served a core-2026b attempt a payload of nulls. */
    items: await Promise.all(rows.map(async r => ({
      itemId: r.item_id, slot: r.slot, position: r.position,
      skill: r.skill, capability: r.capability,
      // The learner's own state, so a refresh restores exactly where she was.
      response: r.response, skipped: r.skipped, answered: r.measured || r.skipped,
      content: isDb(a.assessment_version)
        ? content.safeItem(await content.getItem(r.item_id))
        : safeContent(byId.get(r.item_id)),
    }))),
    /* The passage a reading item is about, the audio a listening item is about,
       the prompt for writing and speaking. Sent per version-and-skill rather
       than repeated on each item, because three reading items share one text.
       Without it a reading item is three options and no passage. */
    context: isDb(a.assessment_version)
      ? (await content.safeVersion(a.assessment_version)).context
      : Object.fromEntries([...new Set(rows.map(r => r.skill))].map(skill => {
      const v = rows.find(r => r.skill === skill).version;
      const ctx = assessment.sectionContext(v, skill);
      if (ctx?.audioFile) {
        /* Whether the audio actually EXISTS is a fact about the filesystem, not
           about the content. V2 and V3 listening was authored as transcripts and
           has never been synthesised, so the client must be able to tell the
           learner that instead of rendering a player that plays nothing. */
        ctx.available = fs.existsSync(
          path.join(__dirname, "../../public/b2/audio", `${ctx.audioFile}.mp3`));
      }
      return [skill, ctx];
      })),
  };
}

/* ── ANSWER ──────────────────────────────────────────────────────────────── */

/**
 * Record one response.
 *
 * Objective items are graded here against the registry key. Writing and
 * speaking are NOT graded: they are stored and left `correct: null`, because
 * neither has a key and inventing one is how a product starts lying.
 *
 * A completed attempt refuses the write — see the `finished_at IS NULL` guard.
 */
async function answerItem(attemptId, itemId, response) {
  const a = await attemptRow(attemptId);
  if (!a) return { error: "unknown_attempt" };
  if (a.finished_at) return { error: "already_completed" };

  const meta = await content.getItem(itemId);
  if (!meta) return { error: "unknown_item" };

  /* Grading goes through the provider, which knows how to mark each of the ten
     item types. `Number(response) === answer` was right when every item was an
     MCQ; a MATCHING answer is an object and an ORDERING answer is an array, and
     it would have silently marked both of those wrong. */
  const objective = meta.legacy
    ? meta.content?.answer != null
    : (meta.scoring_mode ?? "OBJECTIVE") === "OBJECTIVE";
  const correct = objective
    ? (meta.legacy ? Number(response) === meta.content.answer : content.grade(meta, response))
    : null;

  /* MATCHING/ORDERING/MULTI_SELECT/GAP_FILL answers are objects and arrays, not
     scalars. `String(response)` on those yields "[object Object]" or a
     comma-joined list with no way back to the original shape — grading above
     still worked because it ran against the live value, but anything reading
     `response` back afterwards (review tooling, this table) saw a lossy
     stringification. Only non-scalars need JSON: a plain string/number/boolean
     round-trips fine through `String()` and switching those to `JSON.stringify`
     would wrap every text answer in quotes it never had before. */
  const stored = (response !== null && typeof response === "object")
    ? JSON.stringify(response) : String(response);
  const { rowCount } = await pool.query(
    `UPDATE b2_assessment_items
        SET response=$3, correct=$4, measured=$5, skipped=false, updated_at=now()
      WHERE attempt_id=$1 AND item_id=$2`,
    [attemptId, itemId, stored, correct, objective]);
  if (!rowCount) return { error: "item_not_in_attempt" };

  // Answers stay changeable until the attempt closes, so no evidence is written
  // here — it is written once, at finish, from the final state.
  return { saved: true, itemId };
}

/**
 * Mark an item skipped.
 *
 * SKIPPED IS NOT WRONG. `correct` stays NULL and `measured` stays false, so the
 * item lowers the denominator and never the numerator, produces no evidence,
 * and can never create a weakness. The row still exists, which is what keeps
 * "shown and skipped" distinct from "never shown".
 */
async function skipItem(attemptId, itemId) {
  const a = await attemptRow(attemptId);
  if (!a) return { error: "unknown_attempt" };
  if (a.finished_at) return { error: "already_completed" };

  const { rowCount } = await pool.query(
    `UPDATE b2_assessment_items
        SET skipped=true, measured=false, correct=NULL, response=NULL, updated_at=now()
      WHERE attempt_id=$1 AND item_id=$2`, [attemptId, itemId]);
  if (!rowCount) return { error: "item_not_in_attempt" };
  return { saved: true, itemId, state: "not_measured" };
}

/* ── FINISH ──────────────────────────────────────────────────────────────── */

/**
 * Close the attempt and write its evidence.
 *
 * IDEMPOTENT. The UPDATE is guarded on the attempt still being open and
 * rowCount decides whether this call is the one that closed it; a second POST,
 * or a reload of the result screen, returns the stored result rather than
 * scoring again and writing a second set of evidence rows. Getting this wrong
 * means one refresh becomes one more demonstration of ability.
 */
async function finishAssessment(attemptId) {
  const a = await attemptRow(attemptId);
  if (!a) return { error: "unknown_attempt" };

  const rows = await itemRows(attemptId);
  const measured = rows.filter(r => r.measured);
  const skipped = rows.filter(r => r.skipped);

  const scored = progressEngine.scoreAttempt({
    attemptId, version: a.assessment_version, completedAt: a.finished_at || new Date().toISOString(),
    items: rows.map(r => ({ slot: r.slot, itemId: r.item_id, capability: r.capability,
                            skill: r.skill, skipped: r.skipped, correct: r.correct })),
  });

  const { rowCount } = await pool.query(
    `UPDATE b2_paper_attempts
        SET finished_at=now(), measured_items=$2, skipped_items=$3, scores=$4::jsonb
      WHERE id=$1 AND finished_at IS NULL`,
    [attemptId, measured.length, skipped.length, JSON.stringify(scored)]);

  /* Evidence is written exactly once, by the call that actually closed the
     attempt. A reload must not add a second copy of the same sitting — that
     would inflate the item count the reliability model reads and turn one
     screening into two "occasions". */
  if (rowCount === 1) {
    const evidence = measured
      .filter(r => r.capability && DIM_FOR[r.skill])
      .map(r => ({
        dimension: DIM_FOR[r.skill],
        capability: r.capability,
        checkId: r.check_id || null,
        outcome: r.correct ? 1 : 0,
        weight: EVIDENCE_WEIGHT,
        sourceKind: "screening",
        // One attempt is ONE occasion however many items it holds — the prefix
        // before the colon is what profile.js counts as a sitting.
        sourceRef: `assessment_${attemptId}:${r.item_id}`,
      }));
    if (evidence.length) await profile.recordMany(a.user_id, evidence);
  }

  return { ...(await result(attemptId)), wasOpen: rowCount === 1 };
}

/* ── RESULT ──────────────────────────────────────────────────────────────── */

/**
 * Where do I stand — from THIS assessment.
 *
 * Deliberately separates assessment PERFORMANCE from the standing/profile
 * evidence. It reports what was measured, what was not, where she was stronger
 * and what to practise. It does not report a Goethe score, a telc score, a pass
 * probability, a CEFR level or a mastery percentage, because none of those is
 * defensible on twenty items and no calibration exists.
 */
async function result(attemptId) {
  const a = await attemptRow(attemptId);
  if (!a) return null;
  const rows = await itemRows(attemptId);
  const scored = a.scores || progressEngine.scoreAttempt({
    attemptId, items: rows.map(r => ({ slot: r.slot, itemId: r.item_id, capability: r.capability,
                                       skill: r.skill, skipped: r.skipped, correct: r.correct })) });

  const bySkill = scored.bySkill || {};
  const entries = Object.entries(bySkill);
  const enough = entries.filter(([, v]) => v.measured >= progressEngine.MIN_PER_SKILL);

  /* "Stronger" and "practise next" are PARTITIONED, never sliced off a sorted
     list. Slicing produced a genuinely misleading result the first time this
     ran live: with only three measured skills, `slice(0,2)` and `slice(-2)`
     overlap, so reading was reported as a strength AND as the thing to practise
     — on 0 out of 3. A learner reading "stronger: reading" there would have
     been told the opposite of the truth.

     The split is the band boundary profile.js already uses between `developing`
     and `good`, so the assessment and the profile cannot disagree about who is
     strong. If nothing clears it, `stronger` is empty — which is the honest
     answer to a weak sitting, and better than promoting the least-bad skill. */
  const STRONG_AT = 0.62;
  const strong = enough.filter(([, v]) => v.score >= STRONG_AT)
    .sort((x, y) => y[1].score - x[1].score);
  const weak = enough.filter(([, v]) => v.score < STRONG_AT)
    .sort((x, y) => x[1].score - y[1].score);

  const notMeasured = [
    ...entries.filter(([, v]) => v.measured < progressEngine.MIN_PER_SKILL).map(([k]) => k),
    /* Writing and speaking carry no objective key, so they were never in the
       comparable score at all — "not measured" here means "not scored", which
       is different from "she skipped it" and has to read that way. */
    ...(rows.some(r => r.skill === "writing") ? ["writing"] : []),
    ...(rows.some(r => r.skill === "speaking") ? ["speaking"] : []),
  ];

  const next = await profile.nextAction(a.user_id).catch(() => null);

  return {
    attemptId: a.id,
    version: a.assessment_version,
    startedAt: a.started_at,
    completedAt: a.finished_at,
    status: a.finished_at ? "completed" : "in_progress",
    measured: scored.measured,
    skipped: scored.skipped,
    correct: scored.correct,
    measuredAreas: enough.map(([skill, v]) => ({ skill, measured: v.measured, correct: v.correct })),
    notMeasured: [...new Set(notMeasured)],
    stronger: strong.slice(0, 2).map(([k]) => k),
    practiseNext: weak.slice(0, 2).map(([k]) => k),
    targetedCapabilities: a.composition?.targetCapabilities ?? [],
    recommendation: next && { title: next.title, topicId: next.topicId,
                              capability: next.capability, reason: next.reason,
                              minutes: next.minutes },
    /* Carried on the response so a client cannot present this as an exam
       result by accident. */
    claim: "Assessment result",
    notAnExamScore: true,
  };
}

/* ── HISTORY AND PROGRESS ────────────────────────────────────────────────── */

async function history(userId) {
  const { rows } = await pool.query(
    `SELECT id, assessment_version, started_at, finished_at,
            measured_items, skipped_items, composition, scores
       FROM b2_paper_attempts
      WHERE user_id=$1 AND kind='assessment'
      ORDER BY COALESCE(finished_at, started_at) DESC`, [userId]);
  return rows.map(r => ({
    attemptId: r.id, version: r.assessment_version,
    startedAt: r.started_at, completedAt: r.finished_at,
    status: r.finished_at ? "completed" : "in_progress",
    measured: r.measured_items, skipped: r.skipped_items,
    score: r.scores?.score ?? null,
    targetedCapabilities: r.composition?.targetCapabilities ?? [],
    mode: r.composition?.mode ?? null,
  }));
}

/** The shape the Phase 2 Progress component already accepts. */
async function progress(userId) {
  const { rows } = await pool.query(
    `SELECT a.id, a.assessment_version, a.finished_at, a.composition
       FROM b2_paper_attempts a
      WHERE a.user_id=$1 AND a.kind='assessment' AND a.finished_at IS NOT NULL
      ORDER BY a.finished_at DESC LIMIT 5`, [userId]);

  const attempts = [];
  for (const r of rows) {
    const items = await itemRows(r.id);
    attempts.push({
      attemptId: r.id, version: r.assessment_version, completedAt: r.finished_at,
      // Absent on attempts sat before the field existed — comparable() reads
      // that absence as core-2026a rather than as unknown.
      comparableGroup: r.composition?.comparableGroup ?? null,
      items: items.map(i => ({ slot: i.slot, itemId: i.item_id, capability: i.capability,
                               skill: i.skill, skipped: i.skipped, correct: i.correct })),
    });
  }
  return progressEngine.progress(attempts);
}

module.exports = {
  startAssessment, startVersion, getAssessment, answerItem, skipItem,
  finishAssessment, result, history, progress, currentDiagnosticVersion,
  seenItemIds, satVersions, evidenceRows,
};
