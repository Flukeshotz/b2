// Pure domain logic ported from the prototype — no DOM, no React.

export function subKey(topic, sub) { return `${topic.id}:${sub.key}`; }
export function topicDoneCount(topic, done) { return topic.subs.filter(s => done.includes(subKey(topic, s))).length; }
export function topicFullyDone(topic, done) { return topicDoneCount(topic, done) === topic.subs.length; }
export function nextSub(topic, done) { return topic.subs.find(s => !done.includes(subKey(topic, s))) || topic.subs[0]; }

/* ── LEVELS ──────────────────────────────────────────────────────────────
   `topics` is one shared table across every CEFR level. A row written before
   levels existed carries no `level` at all, so the absent value must read as
   A1 -- not as "unknown" and not as an error. Every level decision in the app
   goes through levelOf() for exactly that reason.

   Splitting by level is what lets A1 keep its linear journey while B2 is
   reached from its own door: A1's unlock maths only ever sees A1 rows, so a
   B2 topic can never sit between lesson 4 and lesson 5, and finishing B2 work
   can never advance the A1 path. */
export const LEVEL_A1 = "a1";
export const LEVEL_B2 = "b2";

export function levelOf(topic) { return topic?.level || LEVEL_A1; }
export function topicsAtLevel(topics, level) { return (topics || []).filter(t => levelOf(t) === level); }

/* The A1 journey's cursor: the first topic not finished, which is the only one
   unlocked. Lifted out of Home.jsx unchanged so it can be regression-tested --
   this single number decides what every A1 learner can and cannot open, and it
   had no test before B2 came near it.

   Callers MUST pass an already level-filtered list. Handing it a mixed list
   would let a B2 row move the A1 cursor, which is the exact bug the level
   column exists to prevent. */
export function openTopicIndex(topics, done) {
  if (!topics?.length) return -1;
  const i = topics.findIndex(t => !topicFullyDone(t, done));
  return i === -1 ? topics.length - 1 : i;
}

/* -1 once every topic is finished, where openTopicIndex saturates at the last
   topic instead. Home needs both: which node to unlock, and whether there is
   any unfinished work left to greet her about. */
export function nextUnfinishedIndex(topics, done) {
  return (topics || []).findIndex(t => !topicFullyDone(t, done));
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// A word only needs a real teach() step if learners must recall and
// produce it themselves. Everything here is glue -- articles, connectors,
// common verb forms -- that shows up inside sentences the learner is
// reading or assembling from a tile bank, never typing from scratch. It
// still needs a correct, honest gloss so tapping it in Explain My Answer
// never shows a broken-looking placeholder. Audited 2026-08-13: every
// word across all build/speak/translate/speakcards/chat sentences in
// a1_curriculum.json that wasn't already taught or covered here.
export const GLOSS = {
  was: "what", kostet: "costs", der: "the", die: "the", das: "the", ist: "is", bin: "am",
  aus: "from", indien: "India", zusammen: "together", guten: "good", tag: "day",
  morgen: "morning", wiedersehen: "goodbye", auf: "(farewell)", priya: "Priya",
  julia: "Julia", pause: "break", fast: "almost", fertig: "done", da: "there",
  neu: "new", hier: "here",
  // 2026-08-13 audit additions
  haben: "to have", habe: "have", hast: "have", hat: "has",
  bis: "until", eine: "a", ein: "a", einen: "a", ihre: "her",
  es: "it", oder: "or", gut: "good", möchten: "would like", möchte: "would like",
  etwas: "something", bald: "soon", ihr: "your", sonst: "otherwise",
  klar: "sure", euro: "euro", erdbeeren: "strawberries", spät: "late",
  dann: "then", muss: "must", los: "go", vierzehn: "fourteen",
  gibt: "gives", zitronen: "lemons", leider: "unfortunately", probiere: "try",
  mit: "with", brauche: "need", kleine: "small", anna: "Anna",
  freut: "pleases", mich: "me", nummer: "number", dreizehn: "thirteen",
  fünfzehn: "fifteen", genau: "exactly", ja: "yes", zu: "to",
  viel: "much", äpfel: "apples", suchen: "look for", sind: "are",
  aber: "but", frische: "fresh", schmeckt: "tastes", ihnen: "them",
  bezahle: "pay", macht: "makes (costs)", groß: "big", schön: "nice",
  kommen: "come", wieder: "again", entschuldigung: "sorry", richtig: "right",
  perfekt: "perfect", oh: "oh", passt: "fits", arbeiten: "work",
  // 2026-08-13, a1l26 audit additions
  arbeite: "work", nicht: "not", schönes: "nice",
  // 2026-08-13, a1l28 audit additions
  lange: "long",
  // 2026-08-13, a1l29 audit additions
  wo: "where", viele: "many", kein: "no / not any", problem: "problem", gleich: "right away",
  // 2026-08-13, a1l30 audit additions -- found by extending gate_gloss.js
  // to also scan chat opts[].de (previously unchecked, see gate_gloss.js)
  ok: "ok", nein: "no", auch: "also / too", sehr: "very", er: "he",
  weiß: "know", also: "so / then", stimmt: "is right",
};

export const GLOSS_EX = {
  kaffee: ["Ich trinke Kaffee.", "Magst du Kaffee?"],
  bitte: ["Kaffee, bitte.", "Ja, bitte."],
  ist: ["Der Kaffee ist teuer.", "Das Essen ist gut."],
};

export const ENCOURAGE = [
  "Good job. Most people don't speak German at all on day one.",
  "You just said it out loud. That's the hard part, done.",
  "That took courage. It gets easier from here.",
  "Most learners stay silent for weeks. You didn't.",
  "Nobody sounds fluent on their first try. You still tried.",
  "That's a real German sentence, out loud, from you.",
  "Every word you say now is one you'll never have to learn again.",
  "You didn't wait until you felt ready. That's the actual skill.",
  "Saying it wrong and saying it anyway -- that's how everyone starts.",
  "That sentence didn't exist for you yesterday. Now it does.",
  "Small and out loud beats big and silent, every time.",
  "You're not memorizing anymore. You're using it.",
];

export const PRAISE = [
  "Genau!", "That's it.", "Perfect.", "Ja! Correct.", "You've got it.",
  "Richtig!", "Nailed it.", "That's the one.", "Exactly right.", "Spot on.",
  "Sehr gut!", "You knew that cold.", "Clean.", "That's correct German.",
  "Yep, that's it.", "Genau richtig.", "No hesitation there.", "Right on.",
  "Correct -- and fast.", "That's how it's said.",
];
export function pickPraise() { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }

// Reserved for a step answered correctly with zero wrong taps first — a
// bigger reaction than routine praise, since first-try is worth noticing.
export const MIND_BLOWN = [
  "Mind. Blown.", "First try. No hesitation.", "You didn't even pause.", "That's not luck. That's fast learning.",
  "Zero mistakes. You just knew it.", "That was instant.", "You're already faster than you think.",
  "No guessing there -- you knew.", "That one was automatic.", "You didn't even think about it. You just said it.",
  "First attempt, dead on.", "That's what fluent starts to feel like.",
];
export function pickMindBlown() { return MIND_BLOWN[Math.floor(Math.random() * MIND_BLOWN.length)]; }

// Looks a word up across every topic's every sub — not just the active
// lesson — so cross-module words resolve correctly in Explain My Answer.
export function glossFor(tok, topics) {
  const clean = tok.replace(/[.,!?]+$/, "").toLowerCase();
  for (const m of topics) {
    for (const sub of m.subs) {
      const hit = sub.teaches.find(([de]) => de.toLowerCase() === clean);
      if (hit) return hit[1];
    }
  }
  if (GLOSS[clean]) return GLOSS[clean];
  // Should be unreachable now that GLOSS covers every audited word (see
  // scripts/gate_gloss.js), but never surface a broken-looking string to
  // a learner if a future module introduces something new.
  return "part of this German phrase";
}

// Finds the full [de,en,icon] triple for a word across every topic's every
// sub — used to push a wrong build/translate answer's words into review.
export function findTaughtWord(clean, topics) {
  for (const m of topics) {
    for (const sub of m.subs) {
      const hit = sub.teaches.find(([de]) => de.toLowerCase() === clean.toLowerCase());
      if (hit) return hit;
    }
  }
  return null;
}

export function wordsForStep(s, teaches) {
  const word = (i) => teaches[i];
  if (s.t === "pick" || s.t === "listen") { const [de] = word(s.t === "pick" ? s.from[0] : s.w); return [de]; }
  if (s.t === "build") return s.de.slice();
  if (s.t === "translate") return s.de.replace(/[.,!?]+$/, "").split(" ");
  if (s.t === "speak") return s.de.replace(/[.!?]+$/, "").split(" ");
  if (s.t === "match") return s.ws.map(i => word(i)[0]);
  if (s.t === "soundmatch") { const [de] = word(s.w); return [de]; }
  if (s.t === "scenetap") { const [de] = word(s.from[0]); return [de]; }
  if (s.t === "keypad") return s.target.map(i => word(i)[0]);
  if (s.t === "race") return s.from.map(i => word(i)[0]);
  if (s.t === "spotmistake") return [s.shouldBe];
  if (s.t === "oddoneout") return [s.items[s.oddIdx][0]];
  if (s.t === "dialogue") return [s.lines[s.interactiveIndex ?? s.lines.length - 1].de];
  if (s.t === "speakcards") return s.cards.map(c => c.de);
  return [];
}

export function rewardLine(acc, cb, secs) {
  if (acc === 100) return "No mistakes. You really know this.";
  if (cb >= 3) return `${cb + 1} right in a row. You're learning fast.`;
  if (secs < 120) return "That was quick. Nice work.";
  return "You took your time and got it right. That's what matters.";
}

/* ── REVIEW INJECTION ────────────────────────────────────────────────────
   Moved here from Lesson.jsx unchanged. It is pure domain logic -- no React,
   no DOM -- and it is the mechanism that keeps review inside lessons instead
   of behind a "Review" tab nobody taps. Untested while it lived in a JSX file
   that Node cannot import; testable here.
*/
const REVIEW_MECHANICS = ["pick", "listen", "soundmatch"]; // rotated so review never feels like the same flashcard twice

// Builds a handful of review steps for words she's missed before, mixing
// mechanics each time instead of always falling back to the same "pick"
// format. `offset` shifts every index past whatever teaches array this gets
// appended to, so the review words don't collide with the sub's own.
export function buildReviewSteps(reviewItems, topics, ownedWords, offset) {
  if (!reviewItems.length) return { steps: [], teaches: [] };

  /* review_queue is one queue per USER, not per level — so once B2 started
     pushing phrases into it, "in Betracht ziehen" would surface inside an A1
     beginner's second lesson. That breaks the standing rule that nothing is
     tested before it is taught, and it is a genuinely bad moment: a learner
     forty words in, asked about a B2 collocation she has never seen.

     Scoping to what the CURRENT lesson set actually taught fixes it in both
     directions and needs no schema change: A1 lessons review A1 words, B2
     lessons review B2 phrases, and neither can serve the other's items. */
  const taughtHere = new Set();
  topics.forEach(t => t.subs.forEach(sub => sub.teaches.forEach(w => taughtHere.add(w[0].toLowerCase()))));
  const eligible = reviewItems.filter(r => taughtHere.has(r.de.toLowerCase()));
  if (!eligible.length) return { steps: [], teaches: [] };

  const reviewWords = eligible.map(r => [r.de, r.en, r.icon]);
  // Pad the decoy pool with words she already owns elsewhere (never
  // anything untaught), so there's always a real option to choose against.
  const seen = new Set(reviewWords.map(w => w[0]));
  const ownedSet = new Set((ownedWords || []).map(w => w.toLowerCase()));
  const extraPool = [];
  topics.forEach(t => t.subs.forEach(sub => sub.teaches.forEach(w => {
    if (!seen.has(w[0]) && ownedSet.has(w[0].toLowerCase())) { seen.add(w[0]); extraPool.push(w); }
  })));
  const teaches = reviewWords.concat(shuffle(extraPool).slice(0, 10));
  const steps = [{ t: "story", lines: ["Let's see what you still remember."] }];
  reviewWords.forEach((tw, i) => {
    const others = teaches.map((_, j) => j).filter(j => j !== i);
    // Pick relies on from[0] being the correct answer (it shuffles for
    // display internally) — never shuffle this array before handing it off.
    const from = [i, ...shuffle(others).slice(0, 2)].map(j => j + offset);
    const mechanic = REVIEW_MECHANICS[Math.floor(Math.random() * REVIEW_MECHANICS.length)];
    if (mechanic === "pick") steps.push({ t: "pick", q: `Which one is <b>${tw[0]}</b>?`, from, reviewWord: tw[0] });
    else if (mechanic === "listen") steps.push({ t: "listen", w: i + offset, from, reviewWord: tw[0] });
    else steps.push({ t: "soundmatch", w: i + offset, from, reviewWord: tw[0] });
  });
  // A small closing beat before sliding into the module's own content --
  // the emotional payoff of the ritual ("I thought I'd forgotten that")
  // deserves its own moment, not just a silent cut into the next story.
  const closingLine = reviewWords.length > 1
    ? "Still in there. Nice."
    : `Still know ${reviewWords[0][0]}. Nice.`;
  steps.push({ t: "story", lines: [closingLine] });
  return { steps, teaches };
}
