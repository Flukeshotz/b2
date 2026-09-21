/**
 * THE EXAM SECTION ENGINE — validation, single-play state, deterministic scoring.
 *
 * An exam section differs from every other experience in this product in one
 * way that changes the whole design: THE PLAY IS IRREVERSIBLE. Everywhere else,
 * a learner who reloads loses nothing. Here, a learner who reloads must not
 * regain a listen — and equally, a learner whose audio failed to load must not
 * lose one. Those two requirements pull in opposite directions, and the only
 * honest place to settle them is the server.
 *
 * So the play is a two-step handshake:
 *
 *   request  the learner asks for the audio. The server hands back a URL and
 *            records that a request happened. NOTHING is consumed yet — a
 *            request that never becomes sound is a failed load, not a listen.
 *   confirm  the client reports that playback actually started. Only now is the
 *            text marked heard, and from that moment no URL is ever issued for
 *            it again, through any route, after any reload.
 *
 * A repeated request before any confirmation returns the SAME url and does not
 * consume anything, so retrying a broken load is free. Repeated requests are
 * counted and surfaced as an integrity note rather than blocked: with no auth
 * and one demo user, refusing a retry would punish the honest failure case to
 * deter a cheat that only harms the cheat's own practice.
 *
 * SCORING IS PLAIN COUNTING. One point or none, per the Durchführungsbestimm-
 * ungen. No partial credit, no conversion to Goethe Ergebnispunkte, no
 * pass/fail — goethe_b2.js refuses the conversion for a partial module, and
 * this file never asks for it.
 */

const blueprint = require("./exam/goethe_b2");

/* ── CONTENT VALIDATION ───────────────────────────────────────────────────
   Run before anything is published. Every rule is a way an item stops testing
   listening without looking wrong. */

const norm = (s) => String(s || "").toLowerCase().replace(/[^\wäöüß ]+/g, " ").replace(/\s+/g, " ").trim();
const contentWords = (s) => norm(s).split(" ").filter(w => w.length > 3);

/**
 * How much of an option is lifted VERBATIM AND CONTIGUOUSLY from the transcript,
 * as a fraction of the option's length.
 *
 * Not a bag-of-words overlap. That was the first version and it was nearly
 * inert: in a well-built item every option is made of words from the text —
 * Donnerstag, Freitag, Montag all appear — so all three scored 1.00 and no key
 * could ever stand out. What makes an item solvable without listening is not
 * shared vocabulary, it is a RUN: a phrase the learner can spot in the passage
 * and match whole. So the measure is the longest common word sequence.
 */
function overlap(option, transcript) {
  const o = norm(option).split(" ").filter(Boolean);
  const t = norm(transcript).split(" ").filter(Boolean);
  if (!o.length) return 0;
  let best = 0;
  /* Classic longest-common-substring over word arrays. The texts are a few
     dozen words, so the quadratic table costs nothing. */
  const dp = Array.from({ length: o.length + 1 }, () => new Array(t.length + 1).fill(0));
  for (let i = 1; i <= o.length; i++) {
    for (let j = 1; j <= t.length; j++) {
      if (o[i - 1] === t[j - 1]) { dp[i][j] = dp[i - 1][j - 1] + 1; best = Math.max(best, dp[i][j]); }
    }
  }
  return best / o.length;
}

function validateSection(section, texts) {
  const fails = [], warns = [];
  const F = (m) => fails.push(m), W = (m) => warns.push(m);
  const bp = blueprint.teil(section.teil);

  if (!bp) { F(`unknown Teil ${section.teil}`); return { ok: false, fails, warns }; }

  /* 1 — SHAPE, against the official blueprint rather than against a number
     somebody typed here. */
  if (texts.length !== bp.texts) F(`Teil ${bp.no} has ${bp.texts} texts in the exam; this has ${texts.length}`);
  const items = texts.flatMap(t => t.items || []);
  if (items.length !== bp.items) F(`Teil ${bp.no} has ${bp.items} items; this has ${items.length}`);
  for (const t of texts) {
    const per = bp.items / bp.texts;
    if ((t.items || []).length !== per) F(`text ${t.no}: ${per} items per text, found ${(t.items || []).length}`);
  }
  for (const { type, count } of bp.shape) {
    const n = items.filter(i => i.type === type).length;
    if (n !== count) F(`Teil ${bp.no} needs ${count}× ${type}; found ${n}`);
  }

  /* 2 — ANSWER KEYS. The class of error no reviewer catches by reading. */
  for (const t of texts) {
    const transcript = (t.turns || []).map(x => x.de).join(" ");
    if (!transcript.trim()) F(`text ${t.no}: no transcript`);
    if (!t.situation) F(`text ${t.no}: no situation — the exam always sets the scene first`);

    for (const [i, item] of (t.items || []).entries()) {
      const at = `text ${t.no} item ${i + 1}`;
      if (!item.stem) { F(`${at}: no stem`); continue; }
      if (!item.because) F(`${at}: no explanation — a key without a reason teaches nothing`);

      if (item.type === "rf") {
        if (typeof item.answer !== "boolean") F(`${at}: a Richtig/Falsch item needs a boolean answer`);
      } else if (item.type === "mc3") {
        const opts = item.options || [];
        if (opts.length !== 3) F(`${at}: three options, found ${opts.length}`);
        if (new Set(opts.map(norm)).size !== opts.length) F(`${at}: duplicate options`);
        if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer >= opts.length)
          F(`${at}: answer index ${item.answer} is out of range`);
        else {
          /* 3 — ANSWER LEAKAGE. If the key repeats the transcript's words more
             closely than every distractor, the item can be solved by matching
             strings — which is a reading skill, and this is the listening
             module. The margin is deliberate: keys naturally share SOME wording
             with the text, so only a clear lead is a failure. */
          /* THE RULE, and it is a threshold on nothing: the key must not be a
             COMPLETE verbatim span of the transcript when some distractor is
             not. A partial run is normal and healthy — a good distractor is
             usually lifted from the passage too, which is exactly what makes it
             tempting. What breaks the item is a key the learner can find whole
             in the text and match without understanding a word of it. */
          const keyOverlap = overlap(opts[item.answer], transcript);
          const others = opts.map((o, k) => k === item.answer ? -1 : overlap(o, transcript));
          if (keyOverlap >= 0.95 && Math.min(...others.filter(x => x >= 0)) < 0.95)
            F(`${at}: the correct option is a verbatim span of the transcript ` +
              `while a distractor is not — spottable without understanding it`);
          /* A distractor nobody could choose is not a distractor. */
          for (const [k, o] of opts.entries()) {
            if (k === item.answer) continue;
            if (contentWords(o).length < 2) W(`${at}: option ${k} is too thin to be plausible`);
          }
        }
      } else F(`${at}: unknown item type "${item.type}"`);
    }
  }

  /* 4 — THE ANSWER PATTERN. All five R/F items answering "falsch", or every MC
     keyed to the same position, is guessable without listening at all. */
  const rf = items.filter(i => i.type === "rf").map(i => i.answer);
  /* Not just "all the same". A learner who answers b every time and scores 4/5
     has beaten the section without listening to a word, so the bar is the
     PROPORTION sharing a position, not unanimity. */
  const mc = items.filter(i => i.type === "mc3").map(i => i.answer);
  if (mc.length >= 3) {
    const counts = mc.reduce((m, a) => (m[a] = (m[a] || 0) + 1, m), {});
    const [best, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (n / mc.length > 0.6)
      F(`${n} of ${mc.length} multiple-choice keys are option ${Number(best) + 1} — ` +
        `always guessing that position would score ${n}/${mc.length} without listening`);
  }
  const rfCounts = rf.reduce((m, a) => (m[a] = (m[a] || 0) + 1, m), {});
  const rfWorst = Math.max(0, ...Object.values(rfCounts));
  if (rf.length >= 3 && rfWorst / rf.length > 0.8)
    F(`${rfWorst} of ${rf.length} Richtig/Falsch keys are the same — guessable without listening`);

  return { ok: fails.length === 0, fails, warns };
}

/* ── SCORING ──────────────────────────────────────────────────────────────── */

/**
 * @param items   [{ itemNo, type, answer }]   the key
 * @param given   { itemNo: response }          what the learner marked
 * @param heard   Set of text numbers actually listened to
 *
 * An item whose text was never heard is UNSCORED, not wrong. Marking it wrong
 * would be a claim about listening we did not observe.
 */
function score(items, given, heard) {
  const rows = items.map(it => {
    const listened = heard.has(it.textNo);
    const response = given[it.itemNo];
    const answered = response !== undefined && response !== null;
    const correct = answered && listened && String(response) === String(it.answer);
    return { ...it, listened, answered, correct, response: answered ? response : null };
  });
  const scorable = rows.filter(r => r.listened);
  return {
    rows,
    correct: rows.filter(r => r.correct).length,
    scorable: scorable.length,
    total: items.length,
    /* Deliberately NOT a percentage and NOT a band. See goethe_b2.ergebnispunkte. */
    unheard: rows.filter(r => !r.listened).length,
  };
}

/**
 * Evidence from a section. Only from texts the learner actually heard, and only
 * once the section is complete — a half-finished attempt is not a demonstration.
 */
function evidenceFor(result, { complete }) {
  if (!complete || result.scorable === 0) return [];
  return [{
    dimension: "listening",
    capability: "understand_speech",
    outcome: result.correct / result.scorable,
    /* Ten short items under exam conditions is a real signal but a narrow one:
       one section, one sitting, one text type. */
    weight: 0.5,
  }];
}

module.exports = { validateSection, score, evidenceFor, overlap };
