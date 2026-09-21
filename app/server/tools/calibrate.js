/**
 * Calibration harness — measures the engine against expert-rated learner texts.
 *
 * Kept in the repo on purpose. Every accuracy figure quoted for this product
 * came out of a throwaway script, and one of those scripts was measuring the
 * wrong thing: it scored the SAME texts under both board configs and reported
 * telc as eleven points worse than Goethe. It wasn't. telc's `email_form`
 * check — Anrede and Grußformel, which telc requires and Goethe does not — was
 * correctly failing texts that were never letters. Scored properly, telc came
 * out ahead. A measurement you cannot re-run is a measurement you cannot check.
 *
 * Corpus: MERLIN (Eurac Research, CC BY-SA 4.0) — 1,033 German learner texts
 * from real certifications, each CEFR-rated by trained raters.
 *   http://hdl.handle.net/20.500.12124/6
 *
 * Usage:
 *   node tools/calibrate.js --corpus <path-to-meta_ltext/german>
 *   node tools/calibrate.js --corpus <path> --model     (adds the model pass)
 */

const fs = require("fs");
const path = require("path");

require("../src/env")();
const { analyse } = require("../src/b2/analyse");
const { compose } = require("../src/b2/verdict");

const RANK = { A1: 1, "A1+": 1.5, A2: 2, "A2+": 2.5, B1: 3, "B1+": 3.5,
               B2: 4, "B2+": 4.5, C1: 5, C2: 6 };
const READY = RANK.B2;

const BOARDS = {
  goethe: { board: "goethe", module: "schreiben", task_type: "forumsbeitrag",
            target_words: 180, content_points: [], pass_mark: 60, scale_max: 100,
            prompt_de: "Schreiben Sie einen Forumsbeitrag zum vorgegebenen Thema." },
  telc:   { board: "telc", module: "schreiben", task_type: "halbformelle_email",
            target_words: 150, content_points: [], pass_mark: 60, scale_max: 45,
            prompt_de: "Schreiben Sie eine halbformelle E-Mail zum vorgegebenen Anlass." },
};

/* THE FIX. telc sets a semi-formal letter; Goethe sets a forum post. Scoring a
   narrative under telc's config fails it for having no Anrede — correctly, and
   meaninglessly, because nobody asked the writer for a letter. Each board is
   measured only on the text type it actually sets. */
const isLetter = (r) =>
  /letter|brief|email|e-mail|complain|apply|inform|request|invit/i.test(r.task) ||
  /^(sehr geehrte|liebe|lieber|hallo)/i.test(r.text.trim());

function load(dir) {
  return fs.readdirSync(dir).filter((f) => f.endsWith(".txt")).map((f) => {
    const raw = fs.readFileSync(path.join(dir, f), "utf8");
    const g = (k) => (raw.match(new RegExp(`^${k}:\\s*(.+)$`, "m")) || [])[1]?.trim();
    const i = raw.indexOf("Learner text:");
    return { id: f.replace(/\.txt$/, ""), rated: g("Overall CEFR rating"),
             task: g("Task") || "", text: i >= 0 ? raw.slice(i + 13).trim() : "" };
  }).filter((r) => r.text.length > 40 && RANK[r.rated]);
}

/* Deterministic shuffle. Thresholds are fitted on train and every number
   reported comes from test — fitting and reporting on the same texts is how
   6/6 on six scripts got mistaken for accuracy. */
function split(rows, frac = 0.7, seed = 42) {
  let s = seed;
  const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  const shuffled = rows.map((r) => ({ r, k: rnd() })).sort((a, b) => a.k - b.k).map((o) => o.r);
  const cut = Math.floor(shuffled.length * frac);
  return { train: shuffled.slice(0, cut), test: shuffled.slice(cut) };
}

const at = (scored, t) => {
  let tp = 0, tn = 0, fp = 0, fn = 0;
  for (const x of scored) {
    const p = x.s >= t;
    if (x.ready && p) tp++; else if (!x.ready && !p) tn++;
    else if (!x.ready && p) fp++; else fn++;
  }
  // False optimism costs an exam fee and months; false pessimism costs study time.
  return { t, tp, tn, fp, fn, acc: (tp + tn) / scored.length * 100, cost: 2 * fp + fn };
};

async function scoreAll(rows, task, useModel) {
  const model = useModel ? require("../src/b2/model") : null;
  const out = [];
  for (const r of rows) {
    const m = model ? await model.assess(r.text, task, task).catch(() => null) : null;
    out.push({ s: compose(analyse(r.text, task), task, m).predicted_score,
               ready: RANK[r.rated] >= READY, rated: r.rated });
  }
  return out;
}

(async () => {
  const argv = process.argv.slice(2);
  const dir = argv[argv.indexOf("--corpus") + 1];
  const useModel = argv.includes("--model");
  if (!dir || !fs.existsSync(dir)) {
    console.error("usage: node tools/calibrate.js --corpus <meta_ltext/german> [--model]");
    process.exit(1);
  }

  const rows = load(dir);
  const pools = { goethe: rows.filter((r) => !isLetter(r)), telc: rows.filter(isLetter) };
  console.log(`MERLIN — ${rows.length} rated texts` + (useModel ? " · full pipeline" : " · deterministic only"));
  console.log(`each board measured only on the text type it sets\n`);

  for (const [name, task] of Object.entries(BOARDS)) {
    const { train, test } = split(pools[name]);
    const trainScored = await scoreAll(train, task, useModel);
    const testScored = await scoreAll(test, task, useModel);

    const best = [...Array(41).keys()].map((i) => at(trainScored, 45 + i))
      .sort((a, b) => a.cost - b.cost)[0];
    const held = at(testScored, best.t);
    const shipped = at(testScored, 60);

    const lv = {};
    for (const x of testScored) (lv[x.rated] ||= []).push(x.s);
    const mean = (k) => lv[k] ? (lv[k].reduce((a, b) => a + b, 0) / lv[k].length).toFixed(1) : "  – ";

    console.log(`  ${name.toUpperCase()}  train ${train.length} · test ${test.length}`);
    console.log(`    means      A2 ${mean("A2")}  B1 ${mean("B1")}  B2 ${mean("B2")}  C1 ${mean("C1")}`);
    console.log(`    at 60      ${shipped.acc.toFixed(1)}%   false-optimistic ${shipped.fp}, false-pessimistic ${shipped.fn}`);
    console.log(`    HELD OUT   ${held.acc.toFixed(1)}%   at the cut fitted on train (${best.t})`);
    console.log(`    => shift needed to keep 60 as the pass mark: ${60 - best.t}\n`);
  }
  console.log("  two trained human raters agree on this question 97.1% of the time.");
  console.log("  they agree on the exact CEFR band only 65.5% of the time.");
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
