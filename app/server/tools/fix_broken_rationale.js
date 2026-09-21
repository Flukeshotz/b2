/**
 * ONE-OFF DATA REPAIR — 60 items imported from the external Goethe/telc
 * master JSON files (outside this repo, on the author's Desktop) carry a
 * rationale where a template failed to interpolate the correct answer's
 * text, leaving a literal empty `""`:
 *
 *   MCQ (15):        Die richtige Antwort ist a) "", da diese Option ...
 *   TRUE_FALSE (45):  Die richtige Antwort ist a) "".
 *
 * These are NOT the same bug with the same fix:
 *
 *   - MCQ: the correct option's real text already exists in this row
 *     (`options[answer]`, formatted "A: text") — reuse it, never invent it.
 *
 *   - TRUE_FALSE: investigating this one further turned up something worse
 *     than a missing interpolation. ALL 45 of these TRUE_FALSE items have
 *     answer_payload.value === true — every single one is "Richtig", zero
 *     "Falsch", across 8 telc Hören papers (telc-b2-hoeren-t1-s1 through
 *     t3-s3). Every OTHER TRUE_FALSE item in the database (130 of them) has
 *     a realistic near-50/50 split. None of these 8 papers' sections has a
 *     transcript to verify against. That is not a plausible real answer
 *     key — it's the same broken generation pipeline defaulting the answer
 *     itself, not just the rationale. Confidently writing "Die richtige
 *     Antwort ist: Richtig" for all 45 would restate a very likely-wrong
 *     answer with false authority — worse than the visible bug it replaces.
 *     So this script does NOT touch answer_payload and does NOT assert an
 *     answer in the rationale. It writes an honest "unverified, flagged for
 *     review" note, and a separate step (see mark_hoeren_drafts.js) pulls
 *     these 8 papers out of being servable until someone can verify the
 *     real answers against real audio.
 *
 *   node tools/fix_broken_rationale.js [--apply]
 * Dry-run by default; prints every change without writing. --apply commits.
 */
require("../src/env")();
const pool = require("../src/db/pool");

const APPLY = process.argv.includes("--apply");

async function main() {
  const { rows } = await pool.query(
    `SELECT id, item_type, options, answer, answer_payload, rationale
       FROM b2_paper_items WHERE rationale LIKE '%""%'`);

  console.log(`Found ${rows.length} items with a broken rationale.\n`);

  let mcqFixed = 0, tfFixed = 0, skipped = 0;
  for (const row of rows) {
    let next = null;

    if (row.item_type === "MCQ") {
      const opt = (row.options || [])[row.answer];
      if (opt == null) { skipped++; console.log(`  SKIP #${row.id}: MCQ with no options[answer]`); continue; }
      const text = String(opt).replace(/^[A-Za-z]:\s*/, "");
      const letter = "abcdefghij"[row.answer] || String(row.answer);
      next = `Die richtige Antwort ist ${letter}) "${text}", da diese Option im Kontext des Textes semantisch und grammatikalisch korrekt anschließt.`;
      mcqFixed++;
    } else if (row.item_type === "TRUE_FALSE") {
      // Deliberately does not assert Richtig/Falsch here — see file header.
      // The answer key itself is suspect (see mark_hoeren_drafts.js); stating
      // one with confidence would be a worse error than the one being fixed.
      next = "This item's answer key could not be verified against a transcript and is flagged for review — not stated here to avoid asserting a possibly-wrong answer.";
      tfFixed++;
    } else {
      skipped++; console.log(`  SKIP #${row.id}: unexpected item_type ${row.item_type}`);
      continue;
    }

    console.log(`  #${row.id} (${row.item_type})`);
    console.log(`    before: ${row.rationale}`);
    console.log(`    after:  ${next}`);

    if (APPLY) {
      await pool.query(`UPDATE b2_paper_items SET rationale=$2 WHERE id=$1`, [row.id, next]);
    }
  }

  console.log(`\n${APPLY ? "Applied" : "Would apply"}: ${mcqFixed} MCQ, ${tfFixed} TRUE_FALSE fixed, ${skipped} skipped.`);
  if (!APPLY) console.log("Dry run only — re-run with --apply to write these changes.");
  await pool.end();
}

main().catch(e => { console.error("FAILED:", e); process.exit(1); });
