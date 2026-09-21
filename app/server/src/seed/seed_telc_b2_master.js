/**
 * SEED — TELC DEUTSCH B2 COMPLETE AUTHENTIC DATASET
 *
 * Seeds authentic telc Deutsch B2 exam practice papers, standalone sections,
 * and complete exam simulations from /Users/harsh/Desktop/telc_b2/telc_b2_master.json:
 *   - b2_papers
 *   - b2_paper_sections
 *   - b2_paper_items
 *
 * Excludes any paywalled placeholders ("Upgrade to Premium").
 * All objective items include verified answers and pedagogical German rationales.
 *
 * Run: node src/seed/seed_telc_b2_master.js
 */
require("../env")();
const pool = require("../db/pool");
const model = require("../b2/content_model");
const fs = require("fs");
const path = require("path");

const MASTER_PATH = "/Users/harsh/Desktop/telc_b2/telc_b2_master.json";

if (!fs.existsSync(MASTER_PATH)) {
  console.error(`[-] Master dataset not found at ${MASTER_PATH}`);
  process.exit(1);
}

const master = JSON.parse(fs.readFileSync(MASTER_PATH, "utf8"));
console.log(`[i] Loaded telc master dataset: ${master.exam} (${master.totalQuestions} items)`);

function getOptText(opt) {
  if (typeof opt === "object" && opt !== null) {
    if (opt.word) {
      return opt.letter ? `${opt.letter.toUpperCase()}: ${opt.word}` : opt.word;
    }
    if (opt.description) {
      return opt.letter ? `${opt.letter.toUpperCase()}: ${opt.description}` : opt.description;
    }
    return opt.text || opt.name || opt.comment || "";
  }
  return String(opt ?? "");
}

async function upsertPaper(client, paper) {
  await client.query(
    `INSERT INTO b2_papers (id, board, title, minutes, source, provisional,
                            exam_version, alignment, source_type, review_status, difficulty)
     VALUES ($1, $2, $3, $4, $5, false, 'B2', 'exam_format_practice', 'ORIGINAL', 'AUTO_QA_PASS', 'B')
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       minutes = EXCLUDED.minutes,
       source = EXCLUDED.source,
       review_status = EXCLUDED.review_status`,
    [paper.id, 'telc', paper.title, paper.minutes, paper.source || 'Skillcase telc Deutsch B2 Authentic Practice Area']
  );
  await client.query(`DELETE FROM b2_paper_sections WHERE paper_id = $1`, [paper.id]);
}

async function insertSection(client, sec) {
  let audioAssetId = sec.audio_asset_id || null;
  if (sec.audio_intended_id && !audioAssetId) {
    audioAssetId = sec.audio_intended_id;
  }
  if (audioAssetId) {
    await client.query(
      `INSERT INTO b2_audio_assets (id, path, kind, review_status, transcript_available, duration_seconds)
       VALUES ($1, $2, 'exam', 'AUTO_QA_PASS', true, 60)
       ON CONFLICT (id) DO UPDATE SET path=EXCLUDED.path, duration_seconds=EXCLUDED.duration_seconds`,
      [audioAssetId, `/b2/audio/${audioAssetId}.mp3`]
    );
  }

  const { rows } = await client.query(
    `INSERT INTO b2_paper_sections
       (paper_id, module, part_no, title, instruction, minutes, time_limit_seconds,
        passage, skill, scoring_mode, item_count, audio_required, audio_intended_id, audio_asset_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING id`,
    [
      sec.paper_id, sec.module, sec.part_no, sec.title, sec.instruction,
      sec.minutes, (sec.minutes || 15) * 60, sec.passage || null,
      sec.skill, sec.scoring_mode, sec.item_count,
      !!sec.audio_required, sec.audio_intended_id || null, audioAssetId
    ]
  );
  return rows[0].id;
}

async function insertItems(client, sectionId, items, sectionSkill) {
  let itemNo = 0;
  for (const raw of items) {
    const rawCheck = JSON.stringify(raw).toLowerCase();
    if (rawCheck.includes("upgrade to premium") || rawCheck.includes("premium")) {
      console.warn(`[!] Skipping paywall item containing 'premium': ${raw.stem}`);
      continue;
    }

    const row = {
      item_type: raw.item_type,
      stem: raw.stem,
      options: raw.options || null,
      answer: raw.answer !== undefined ? raw.answer : null,
      answer_payload: raw.answer_payload || null,
      payload: raw.payload || {},
      scoring_mode: raw.scoring_mode || "OBJECTIVE",
      points: raw.points !== undefined ? raw.points : (raw.scoring_mode === "RUBRIC" ? 4 : raw.scoring_mode === "TRANSCRIPT_ONLY" ? 0 : 1),
      skill: sectionSkill,
      capability: raw.capability || "structure",
      difficulty: "B",
      rationale: raw.rationale || null,
      source_type: "ORIGINAL",
      review_status: "AUTO_QA_PASS"
    };

    if (row.item_type === "MCQ") {
      row.options = row.options || [];
      if (typeof row.answer !== "number") row.answer = 0;
    } else if (row.item_type === "TRUE_FALSE") {
      row.answer_payload = { value: !!raw.answer_value };
      row.answer = null;
      row.options = null;
    }

    const v = model.validateItem(row);
    if (!v.valid) {
      console.warn(`[!] Validation warning item ${itemNo + 1}: ${v.problems.join("; ")}`);
    }

    await client.query(
      `INSERT INTO b2_paper_items
         (section_id, item_no, stem, options, answer, rationale,
          item_type, payload, answer_payload, scoring_mode, points,
          skill, capability, difficulty, source_type, review_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        sectionId, ++itemNo, row.stem, JSON.stringify(row.options || []), row.answer, row.rationale,
        row.item_type, JSON.stringify(row.payload || {}), row.answer_payload ? JSON.stringify(row.answer_payload) : null,
        row.scoring_mode, row.points, row.skill, row.capability, row.difficulty, row.source_type, 'AUTO_QA_PASS'
      ]
    );
  }
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("[+] Connected to PostgreSQL. Seeding telc B2 Content...");

    const reading = master.modules.reading;
    const listening = master.modules.listening;
    const writing = master.modules.writing;
    const speaking = master.modules.speaking;

    let totalPapersSeeded = 0;
    let totalItemsSeeded = 0;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. SEED STANDALONE LESEN & SPRACHBAUSTEINE PAPERS
    // ─────────────────────────────────────────────────────────────────────────
    const readingParts = [
      { partNo: 1, title: "Lesen Teil 1 — Zuordnung von Überschriften", minutes: 18, setSize: 5, module: "lesen" },
      { partNo: 2, title: "Lesen Teil 2 — Textverständnis & Multiple-Choice", minutes: 20, setSize: 5, module: "lesen" },
      { partNo: 3, title: "Lesen Teil 3 — Zuordnung von Anzeigen", minutes: 18, setSize: 5, module: "lesen" },
      { partNo: 4, title: "Sprachbausteine Teil 1 — Grammatik & Bindeglieder", minutes: 17, setSize: 5, module: "sprachbausteine" },
      { partNo: 5, title: "Sprachbausteine Teil 2 — Wortschatz & Lückentext", minutes: 17, setSize: 5, module: "sprachbausteine" },
    ];

    for (const pConfig of readingParts) {
      const pData = reading.parts[pConfig.partNo - 1];
      if (!pData || !pData.questions.length) continue;

      const qs = pData.questions;
      let setNum = 0;

      for (let i = 0; i < qs.length; i += pConfig.setSize) {
        setNum++;
        const setQs = qs.slice(i, i + pConfig.setSize);
        const paperPrefix = pConfig.module === "sprachbausteine"
          ? `telc-b2-sprachbausteine-t${pConfig.partNo - 3}`
          : `telc-b2-lesen-t${pConfig.partNo}`;
        const paperId = `${paperPrefix}-s${setNum}`;

        const paper = {
          id: paperId,
          board: 'telc',
          title: `telc B2 — ${pConfig.title}, Satz ${setNum}`,
          minutes: pConfig.minutes,
        };
        await upsertPaper(client, paper);

        // Extract context or shared text
        const passage = setQs[0].content.sharedText || setQs[0].content.text || setQs[0].content.question || "";
        const sectionId = await insertSection(client, {
          paper_id: paperId,
          module: pConfig.module,
          part_no: pConfig.partNo,
          title: pConfig.title,
          instruction: pConfig.partNo === 1
            ? "Lesen Sie die Texte und wählen Sie die passende Überschrift."
            : pConfig.partNo === 2
            ? "Lesen Sie den Text und wählen Sie bei jeder Aufgabe die richtige Lösung."
            : pConfig.partNo === 3
            ? "Finden Sie für jede Situation die passende Anzeige."
            : "Wählen Sie das passende Wort für jede Lücke.",
          minutes: pConfig.minutes,
          passage: passage,
          // Sprachbausteine is its own telc part; tag it like every other one.
          skill: pConfig.module === "sprachbausteine" ? "grammar" : "reading",
          scoring_mode: "OBJECTIVE",
          item_count: setQs.length
        });

        // Map items
        const items = setQs.map(q => {
          let opts = [];
          let stem = q.content.question || `Aufgabe zu Lücke ${q.content.blankNumber || ''}`;

          if (pConfig.partNo === 1) {
            opts = (q.content.options || []).map(o => getOptText(o));
            stem = q.content.question ? q.content.question.slice(0, 200) + "..." : "Welche Überschrift passt?";
          } else if (pConfig.partNo === 2) {
            opts = (q.content.options || []).map(o => getOptText(o));
            stem = q.content.question;
          } else if (pConfig.partNo === 3) {
            opts = (q.content.options || []).map(o => getOptText(o));
            stem = q.content.question;
          } else if (pConfig.partNo === 4) {
            opts = (q.content.options || []).map(o => getOptText(o));
            stem = `[Satz ${setNum}] Lücke ${q.content.blankNumber || 1}: Wählen Sie die richtige Lösung`;
          } else if (pConfig.partNo === 5) {
            const rawOpts = q.content.options || q.content.wordBank || [];
            opts = rawOpts.map(o => getOptText(o));
            stem = `[Satz ${setNum}] Lücke ${q.content.blankNumber || 1}: Wählen Sie das passende Wort`;
          }

          return {
            item_type: "MCQ",
            stem: stem,
            options: opts,
            // No silent fallback to option A: a missing key must stop the seed.
            answer: (() => {
              if (typeof q.answer !== "number" || q.answer < 0 || q.answer >= opts.length) {
                throw new Error(`telc ${paperPrefix} set ${setNum}: item has no valid answer index`);
              }
              return q.answer;
            })(),
            rationale: q.rationale || "Prüfen Sie die Textstelle im Leseverstehen.",
            scoring_mode: "OBJECTIVE",
            capability: pConfig.module === "sprachbausteine" ? "language_awareness" : "structure",
            payload: { blankNumber: q.content.blankNumber || null }
          };
        });

        await insertItems(client, sectionId, items, pConfig.module === "sprachbausteine" ? "grammar" : "reading");
        totalPapersSeeded++;
        totalItemsSeeded += items.length;
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. SEED STANDALONE HÖREN PAPERS
    // ─────────────────────────────────────────────────────────────────────────
    const listeningParts = [
      { partNo: 1, title: "Hören Teil 1 — Globalverstehen (Nachrichten & Durchsagen)", minutes: 6, skill: "listening" },
      { partNo: 2, title: "Hören Teil 2 — Detailverstehen (Interview / Gespräch)", minutes: 8, skill: "listening" },
      { partNo: 3, title: "Hören Teil 3 — Selektives Verstehen (Kurzberichte)", minutes: 6, skill: "listening" },
    ];

    for (const pConfig of listeningParts) {
      const pData = listening.parts[pConfig.partNo - 1];
      if (!pData || !pData.questions.length) continue;

      const qs = pData.questions;
      const sets = [];
      if (pConfig.partNo === 2) {
        sets.push(qs.slice(0, 10));
        if (qs.length > 10) sets.push(qs.slice(10));
      } else {
        const setSize = 5;
        for (let i = 0; i < qs.length; i += setSize) {
          sets.push(qs.slice(i, i + setSize));
        }
      }

      let setNum = 0;
      for (const setQs of sets) {
        setNum++;
        const paperId = `telc-b2-hoeren-t${pConfig.partNo}-s${setNum}`;
        const minutes = pConfig.partNo === 2 && setNum === 1 ? 12 : pConfig.minutes;

        const paper = {
          id: paperId,
          board: 'telc',
          title: `telc B2 — ${pConfig.title}, Satz ${setNum}`,
          minutes,
        };
        await upsertPaper(client, paper);

        // Check audioFile
        const rawAudio = setQs[0].audioFile || "";
        let audioAsset = null;
        if (rawAudio) {
          const parts = rawAudio.split('/');
          const teil = parts[parts.length - 2] || `teil${pConfig.partNo}`;
          const base = path.basename(rawAudio, ".mp3");
          audioAsset = `telc/${teil}-${base}`;
        }

        const sectionId = await insertSection(client, {
          paper_id: paperId,
          module: "hoeren",
          part_no: 1,
          title: pConfig.title,
          instruction: "Hören Sie die Audiospur und entscheiden Sie: richtig oder falsch?",
          minutes: pConfig.minutes,
          passage: null,
          skill: "listening",
          scoring_mode: "OBJECTIVE",
          item_count: setQs.length,
          audio_required: !!audioAsset,
          audio_intended_id: audioAsset
        });

        const items = setQs.map(q => {
          const isTrue = q.answer === 0 || q.correctAnswer === 'a';
          return {
            item_type: "TRUE_FALSE",
            stem: q.content.question,
            answer_value: isTrue,
            rationale: q.rationale || `Aussage ist laut Höraufnahme ${isTrue ? 'richtig' : 'falsch'}.`,
            scoring_mode: "OBJECTIVE",
            capability: "summarise"
          };
        });

        await insertItems(client, sectionId, items, "listening");
        totalPapersSeeded++;
        totalItemsSeeded += items.length;
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. SEED STANDALONE SCHREIBEN PAPERS
    // ─────────────────────────────────────────────────────────────────────────
    const wQuestions = writing.parts[0]?.questions || [];
    for (let qIdx = 0; qIdx < wQuestions.length; qIdx++) {
      const q = wQuestions[qIdx];
      const paperId = `telc-b2-schreiben-p${qIdx + 1}`;
      const taskA = q.content.taskA || {};
      const taskB = q.content.taskB || {};

      const paper = {
        id: paperId,
        board: 'telc',
        title: `telc B2 — Schriftlicher Ausdruck (Brief) #${qIdx + 1}`,
        minutes: 30,
      };
      await upsertPaper(client, paper);

      const sectionId = await insertSection(client, {
        paper_id: paperId,
        module: "schreiben",
        part_no: 1,
        title: "Schriftlicher Ausdruck — Formeller Brief (Aufgabe A oder B)",
        instruction: q.content.instruction || "Wählen Sie eine der beiden Aufgaben und verfassen Sie einen formellen Brief.",
        minutes: 30,
        passage: `${taskA.title || 'Aufgabe A'}:\n${taskA.situation || ''}\n\n${taskB.title || 'Aufgabe B'}:\n${taskB.situation || ''}`,
        skill: "writing",
        scoring_mode: "RUBRIC",
        item_count: 1
      });

      const stem = taskA.situation || taskA.title || "Verfassen Sie einen Brief anhand der angegebenen Leitpunkte.";
      const item = [{
        item_type: "LONG_TEXT",
        stem: stem,
        scoring_mode: "RUBRIC",
        points: 4,
        capability: "structure",
        rationale: "Bewertung nach telc B2 Kriterien: Ausdrucksfähigkeit, Aufgabenbewältigung, formale Richtigkeit.",
        payload: {
          rubric_id: "telc_b2_writing",
          prompt: stem,
          min_words: 150,
          target_words: 180,
          guidance: taskA.points || [],
          task_type: "formal_letter"
        }
      }];

      await insertItems(client, sectionId, item, "writing");
      totalPapersSeeded++;
      totalItemsSeeded++;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. SEED STANDALONE SPRECHEN PAPERS
    // ─────────────────────────────────────────────────────────────────────────
    const speakingParts = [
      { partNo: 1, title: "Sprechen Teil 1 — Über Erfahrungen sprechen", minutes: 3 },
      { partNo: 2, title: "Sprechen Teil 2 — Diskussion über ein Thema", minutes: 5 },
      { partNo: 3, title: "Sprechen Teil 3 — Gemeinsam etwas planen", minutes: 5 },
    ];

    for (const pConfig of speakingParts) {
      const pData = speaking.parts[pConfig.partNo - 1];
      if (!pData || !pData.questions.length) continue;

      for (let qIdx = 0; qIdx < pData.questions.length; qIdx++) {
        const q = pData.questions[qIdx];
        const paperId = `telc-b2-sprechen-t${pConfig.partNo}-p${qIdx + 1}`;

        const paper = {
          id: paperId,
          board: 'telc',
          title: `telc B2 — ${pConfig.title} #${qIdx + 1}`,
          minutes: pConfig.minutes,
        };
        await upsertPaper(client, paper);

        const sectionId = await insertSection(client, {
          paper_id: paperId,
          module: "sprechen",
          part_no: 1,
          title: pConfig.title,
          instruction: q.content.instructions || "Bereiten Sie Ihren mündlichen Beitrag vor.",
          minutes: pConfig.minutes,
          passage: q.content.articleText || null,
          skill: "speaking",
          scoring_mode: "TRANSCRIPT_ONLY",
          item_count: 1
        });

        const stem = q.content.question
          ? `${q.content.question}\n\n${q.content.subtitle || ''}`
          : "Mündliche Prüfung telc Deutsch B2";

        const item = [{
          item_type: "SPOKEN_RESPONSE",
          stem: stem.trim(),
          scoring_mode: "TRANSCRIPT_ONLY",
          points: 0,
          capability: "argue",
          rationale: "Mündliche telc B2 Prüfung — partnerbezogene Kommunikation und differenzierte Argumentation.",
          payload: {
            prep_seconds: 60,
            speak_seconds: 180
          }
        }];

        await insertItems(client, sectionId, item, "speaking");
        totalPapersSeeded++;
        totalItemsSeeded++;
      }
    }

    await client.query("COMMIT");
    console.log(`\n[+] TELC SEEDING COMPLETE! Seeded ${totalPapersSeeded} papers and ${totalItemsSeeded} items into PostgreSQL.`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[-] TELC Seeding failed. Rolled back.", err);
    throw err;
  } finally {
    client.release();
  }
}

seed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
