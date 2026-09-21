// Deterministic pass — docs/04-architecture.md §4.
//
// Everything in here is computed, free, instant and explainable. It exists for
// three reasons, in this order: it bounds cost (model spend stays on the four
// dimensions that genuinely need inference); it gives the learner findings they
// can verify themselves, which is what buys trust in the parts they can't; and
// it means a verdict still says something true when the model is unavailable.
//
// Every check returns evidence from the learner's own text. A finding with no
// evidence is not displayed -- same rule the model pass follows.

const CONNECTORS = {
  konzessiv:   ["obwohl", "obgleich", "trotzdem", "dennoch", "allerdings", "jedoch", "zwar", "gleichwohl"],
  kausal:      ["weil", "denn", "deshalb", "deswegen", "daher", "folglich", "somit", "da"],
  additiv:     ["außerdem", "zudem", "ferner", "ebenso", "überdies"],
  adversativ:  ["hingegen", "dagegen", "andererseits", "einerseits", "während"],
  konditional: ["wenn", "falls", "sofern", "sobald"],
  final:       ["damit"],
  basis:       ["und", "aber", "oder", "dass"],
};

// Nomen-Verb-Verbindungen. Matched as noun + verb stem because the verb is the
// fixed part -- "unter Druck haben" is exactly the error we want to catch, so
// matching the noun alone would score it as correct.
const NVV = [
  { id: "in_betracht_ziehen",  label: "in Betracht ziehen",      re: /in\s+betracht\s+(zieh|gezogen|zog)/i },
  { id: "zur_verfuegung",      label: "zur Verfügung stehen",    re: /zur\s+verf(ü|ue)gung\s+(steh|stand|gestanden)/i },
  { id: "unter_druck",         label: "unter Druck stehen",      re: /unter\s+([\wäöüß]+\s+)?(kosten)?druck\s+(steh|stand|gestanden)/i },
  { id: "grenzen_stossen",     label: "an seine Grenzen stoßen", re: /grenzen\s+(sto(ß|ss)|stie(ß|ss)|gesto(ß|ss)en)/i },
  { id: "lupe_nehmen",         label: "unter die Lupe nehmen",   re: /unter\s+die\s+lupe\s+(nehm|nimm|nahm|genommen)/i },
  { id: "standpunkt",          label: "einen Standpunkt vertreten", re: /standpunkt\s+(vertret|vertrat)/i },
];

const KONJ2 = /\b(w(ü|ue)rde[nst]?|w(ä|ae)re[nst]?|h(ä|ae)tte[nst]?|k(ö|oe)nnte[nst]?|m(ü|ue)sste[nst]?|sollte[nst]?|d(ü|ue)rfte[nst]?|lie(ß|ss)e[n]?|g(ä|ae)be|k(ä|ae)me|br(ä|ae)uchte)\b/gi;

// Colloquial forms in a written exam task. Kept deliberately short and
// defensible -- a long list produces false positives on words that are fine in
// context, and a register flag the learner disagrees with costs more trust than
// it earns.
const COLLOQUIAL = /\b(echt|voll|krass|mega|halt|irgendwie|bl(ö|oe)d|zeug|kriege[nt]?|kriegt|okay|ok)\b/gi;

// wegen/trotz/angesichts + Genitiv. Only dative articles are flagged: they are
// unambiguous. Bare-adjective cases ("wegen starke Schmerzen") are left alone
// because distinguishing them from correct usage needs parsing, and a wrong
// grammar accusation is worse than a missed one.
const GENITIV_DATIVE = /\b(wegen|trotz|angesichts|aufgrund|innerhalb|au(ß|ss)erhalb)\s+(dem|den|einem|einen)\b/gi;

// telc's Schriftlicher Ausdruck is a HALBFORMELLE E-MAIL replying to an advert,
// and "Kommunikative Gestaltung" explicitly scores Anrede and Schluss. Goethe's
// forum post does not. So these two checks run for telc task types only --
// penalising a Goethe forum post for lacking "Sehr geehrte Damen und Herren"
// would be marking against the wrong board's rubric.
const ANREDE = /(sehr geehrte[rs]?\s|liebe[rs]?\s|guten\s+(tag|morgen))/i;
const SCHLUSS = /(mit freundlichen gr(ü|ue)(ß|ss)en|freundliche gr(ü|ue)(ß|ss)e|viele gr(ü|ue)(ß|ss)e|beste gr(ü|ue)(ß|ss)e|herzliche gr(ü|ue)(ß|ss)e)/i;

function words(text) {
  return (text.trim().match(/[\wäöüßÄÖÜ'-]+/g) || []).length;
}

function uniq(arr) {
  return arr.filter((v, i) => arr.indexOf(v) === i);
}

function findConnectors(text) {
  const found = [];
  const cats = [];
  for (const [cat, list] of Object.entries(CONNECTORS)) {
    for (const c of list) {
      if (new RegExp(`(^|[^\\wäöüß])${c}([^\\wäöüß]|$)`, "i").test(text)) {
        found.push(c);
        cats.push(cat);
      }
    }
  }
  return { found: uniq(found), cats: uniq(cats) };
}

// ── RANGE ───────────────────────────────────────────────────────────────────
// Accuracy alone cannot establish B2. A learner who writes only short main
// clauses makes few mistakes and, under a purely error-subtractive score, beats
// someone attempting subordination and slipping. That is backwards, and it
// rewards exactly the habit the exam punishes.
//
// Measured here on evidence a B2 rubric actually names: subordination, clause
// length, connector variety, lexical spread and abstraction. Nothing about being
// correct -- that is the other half, scored separately.

const SUBORDINATORS = /\b(dass|weil|obwohl|obgleich|während|wenn|falls|sofern|damit|indem|nachdem|bevor|seitdem|sobald|solange|da|ob|zumal|wobei|wohingegen)\b/gi;
const RELATIVES = /\b(der|die|das|dem|den|dessen|deren|welche[rsnm]?)\s+[a-zäöüß]+\s+(?:[a-zäöüß]+\s+)*(?:ist|sind|war|waren|hat|haben|wird|werden)\b/gi;
const PASSIVE = /\b(wird|wurde|werden|wurden|worden)\b/gi;
// Abstract / academic register — the vocabulary layer that separates B1 from B2.
const ABSTRACT = /\b\w{5,}(ung|heit|keit|schaft|barkeit|losigkeit|ismus|ität|anz|enz|tum|nis)\b|\b\w{6,}(lich|bar|haft|sam|fähig|mäßig|weise|wertig)\b/gi;

function rangeProfile(text) {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.split(/\s+/).length > 2);
  const words = (text.match(/[\wäöüßÄÖÜ'-]+/g) || []);
  const avgLen = sentences.length ? words.length / sentences.length : 0;

  const sub = uniq((text.match(SUBORDINATORS) || []).map(w => w.toLowerCase()));
  const rel = (text.match(RELATIVES) || []).length;
  const pass = (text.match(PASSIVE) || []).length;
  const abst = uniq((text.match(ABSTRACT) || []).map(w => w.toLowerCase()));

  // Type-token ratio on content words — a plain proxy for lexical spread.
  const content = words.filter(w => w.length > 4).map(w => w.toLowerCase());
  const ttr = content.length ? uniq(content).length / content.length : 0;

  return { sentences: sentences.length, avgLen, subordinators: sub, relatives: rel, passive: pass, abstract: abst, ttr };
}

function mostRepeated(text) {
  const counts = {};
  let max = 0;
  let word = null;
  for (const w of text.toLowerCase().match(/[a-zäöüß]{5,}/g) || []) {
    counts[w] = (counts[w] || 0) + 1;
    if (counts[w] > max) { max = counts[w]; word = w; }
  }
  return { word, count: max };
}

// Content points are matched heuristically and MUST be surfaced as heuristic --
// docs/04-architecture.md OPEN 3. A missed content point is heavily penalised by
// the real rubric regardless of language quality, so a false "missing" here is
// alarming to the learner and a false "present" is worse.
// Detectors are stored data, not code. A malformed pattern must degrade to
// "not detected" rather than throwing and taking the submission with it — a
// learner losing their written answer to our bad regex is unforgivable.
function safeTest(pattern, text) {
  // `new RegExp(undefined)` compiles to an empty pattern that matches
  // everything, so a content point with no detector silently scored as covered
  // — and since telc voids a text whose Content is "D", a matcher that can
  // never fail also disables the zero rule. Absent means unassessable, which
  // must never read as satisfied.
  if (typeof pattern !== "string" || !pattern.trim()) return false;
  try { return new RegExp(pattern, "i").test(text); } catch { return false; }
}

/* ── CONTENT POINTS ──────────────────────────────────────────────────────
   A flat alternation of surface strings scored 48% on an adversarial set of
   forty B2 sentences — 14 false negatives, 7 false positives. It cannot be
   fixed by adding alternatives, because the two failures have different causes:

     MISSES come from German's word order and its preference for nominal
     causality. "ich halte" never matches "Eine Anwesenheitspflicht HALTE ICH
     für falsch"; "weil" never matches "Aufgrund der Unterbrechungen".

     FALSE HITS come from a marker firing in a clause that is not about the
     thing being asked for. "weil ihr Zug ausgefallen war" is a reason, but not
     the learner's reason for their position, and no amount of alternation
     distinguishes the two.

   So a detector becomes a small rule evaluated PER SENTENCE:

     any      signal families — any one of them fires
     anchors  the same sentence must also be about the right thing
     none     disqualifiers, also sentence-level

   Sentence scope is what fixes the false hits: the reason and the topic have to
   be in the same breath. `any` families are what fix the misses: inversion,
   nominalisation and marker-free narration each get their own pattern rather
   than being crammed into one alternation.

   Still deterministic, still data — the rules are JSON strings on the task, so
   the teacher review page can show them and a change is a content change, not a
   deploy. And the result now records WHICH sentence satisfied the point, which
   is what a reviewer actually needs in order to disagree with it. */
/* Sentence boundaries, conservatively.
   Three things this must NOT do, all found by the adversarial set:
   — split on ";" or ":", which join clauses in one breath. "Der wichtigste
     Punkt dafür ist die Konzentration: zu Hause schaffe ich mehr" is one
     thought, and cutting it hid the first person from the second half.
   — split after an initial. "Nadja W. hat recht" became two sentences, so the
     name and the agreement could never be seen together.
   — split before a lowercase letter, which is almost always an abbreviation. */
function splitSentences(text) {
  return String(text)
    .split(/(?<![A-ZÄÖÜ])(?<=[.!?])\s+(?=[A-ZÄÖÜ„"(\d])|\n+/)
    .map(s => s.trim()).filter(Boolean);
}

function matchPoint(text, p) {
  /* Legacy tasks carry a single `detector` string. Left exactly as it was:
     changing how eight already-authored tasks are scored is not part of fixing
     this one, and a silent re-scoring of existing content would be worse than
     the brittleness. */
  if (!p.any) {
    const ok = safeTest(p.detector, text);
    return { state: ok ? "covered" : "missing", ok, sentence: null, signal: null };
  }

  const anchors = p.anchors || [];
  const none = p.none || [];
  /* Some moves take two sentences. Naming a position and then agreeing with it
     — "Kerstin_M schreibt, … . Da stimme ich ihr zu." — is the normal shape in
     German, and a one-sentence window can never see it. The window is per rule
     rather than global: widening it everywhere would let a marker in one
     sentence borrow the topic of the next, which is the false positive this
     scoping exists to prevent. */
  const sentences = splitSentences(text);
  const win = Math.max(1, p.window || 1);
  let nearMiss = null;
  for (let i = 0; i < sentences.length; i++) {
    const chunk = sentences.slice(i, i + win).join(" ");
    const hit = p.any.find(re => safeTest(re, chunk));
    if (!hit) continue;
    if (none.some(re => safeTest(re, chunk))) { nearMiss = nearMiss || chunk; continue; }
    if (anchors.length && !anchors.some(re => safeTest(re, chunk))) { nearMiss = nearMiss || chunk; continue; }
    return { state: "covered", ok: true, sentence: chunk, signal: hit };
  }
  /* THREE STATES, NOT TWO.
     On unseen German these rules score around 71%, and every residual error is
     semantic rather than lexical: a reason given by juxtaposition carries no
     marker at all, and no pattern separates "a reason" from "the learner's
     reason for their own position". More alternatives cannot fix that, and
     pretending otherwise would keep telling learners they missed a point they
     covered — on the check the rubric weighs most heavily.

     So a signal that fired but was blocked by an anchor or a disqualifier is
     reported as UNSURE rather than as missing. The distinction is what lets the
     rest of the system refuse to act on a guess: writing_loop will not select
     content_points as the one weakness on the strength of unsure points alone,
     and the learner is shown the sentence we matched so a wrong verdict is
     arguable rather than silent. */
  if (nearMiss) return { state: "unsure", ok: false, sentence: nearMiss, signal: null };
  return { state: "missing", ok: false, sentence: null, signal: null };
}

function checkContentPoints(text, contentPoints) {
  return (contentPoints || []).map(p => {
    const m = matchPoint(text, p);
    return { id: p.id, label: p.label_de || p.id, ok: m.ok, state: m.state,
             sentence: m.sentence, signal: m.signal };
  });
}

/**
 * @param {string} text        the learner's submission
 * @param {object} task        { target_words, content_points }
 * @returns {{ metrics: object, findings: Array }}
 */
function analyse(text, task = {}) {
  const wc = words(text);
  const target = task.target_words || 150;
  const conn = findConnectors(text);
  const nvv = NVV.filter(v => v.re.test(text));
  const konj2 = uniq((text.match(KONJ2) || []).map(s => s.toLowerCase()));
  const colloquial = uniq((text.match(COLLOQUIAL) || []).map(s => s.toLowerCase()));
  const genitiv = uniq((text.match(GENITIV_DATIVE) || []).map(s => s.replace(/\s+/g, " ").toLowerCase()));
  const points = checkContentPoints(text, task.content_points);
  const isEmail = task.task_type === "halbformelle_email";
  const missing = points.filter(p => !p.ok);
  const repeat = mostRepeated(text);
  const range = rangeProfile(text);
  const hasKonzessiv = conn.cats.includes("konzessiv");

  const findings = [];
  const add = (check_id, state, detail, evidence = [], weakness = null) =>
    findings.push({ check_id, state, detail, evidence, weakness });

  /* A MINIMUM, not a range. Both boards say so in their own instructions —
     telc "Schreiben Sie wenigstens 150 Wörter", Goethe "mindestens 180" — and
     neither sets an upper bound. Capping at 127% of target penalised exactly
     the wrong people: on 1,033 rated texts it pushed telc's C1 mean BELOW its
     B2 mean, because a strong 200-word answer is 133% of telc's 150 and only
     111% of Goethe's 180. That single check made the same text score
     differently for the two boards on 296 of those texts.

     Over-length that actually rambles shows up as incoherence, which is
     Kommunikative Gestaltung's job — the same separation of concerns telc
     draws between Sprache and Inhalt. */
  add("word_count",
    wc >= target * 0.8 ? "pass" : wc >= target * 0.6 ? "warn" : "fail",
    wc >= target * 0.8
      ? `${wc} Wörter geschrieben, Mindestlänge ${target} erreicht.`
      : `${wc} Wörter geschrieben, mindestens ${target} erwartet.`,
    []);

  /* telc asks for "three guiding points, or two guiding points and another
     aspect" — not all of them. Requiring every point was stricter than the
     board, and on a four-point task it turned a full-credit answer into a
     warning, which then dragged Criterion I toward the voiding band. */
  const covered = points.length - missing.length;
  const unsure = points.filter(p => p.state === "unsure");
  /* Points we are unsure about are NOT counted against the learner. A check
     that fails on a guess is worse than a check that says less. */
  const definitelyMissing = missing.filter(p => p.state !== "unsure");
  const needed = Math.min(3, points.length);
  /* A TASK WITH NO CONTENT POINTS HAS NOTHING TO CHECK, and "Alle 0
     Inhaltspunkte erkennbar behandelt" was being recorded as a passed check —
     evidence that the learner covered every point of a task that asked for
     none. A check with nothing to measure is omitted, not passed. */
  /* Unsure points count as covered for the STATE — we do not fail a learner on
     a point we cannot read — but they are named separately in the detail so the
     reviewer and the learner both know which verdicts are soft. */
  const confident = points.length - definitelyMissing.length;
  if (points.length) add("content_points",
    confident >= needed ? "pass" : confident >= needed - 1 ? "warn" : "fail",
    definitelyMissing.length === 0
      ? (unsure.length
          ? `${points.length - unsure.length}/${points.length} klar erkannt; bei „${unsure.map(u => u.label).join("“, „")}“ sind wir uns nicht sicher.`
          : `Alle ${points.length} Inhaltspunkte erkennbar behandelt.`)
      : `${confident}/${points.length} erkannt. Nicht erkannt: ${definitelyMissing.map(m => m.label).join(", ")}.` +
        (unsure.length ? ` Unsicher: ${unsure.map(u => u.label).join(", ")}.` : "") + " Heuristisch erkannt.",
    definitelyMissing.map(m => m.label),
    definitelyMissing.length ? "content_point_missing" : null);

  add("connector_range",
    conn.found.length >= 5 && hasKonzessiv ? "pass" : conn.found.length >= 4 ? "warn" : "fail",
    conn.found.length
      ? `Gefunden: ${conn.found.join(", ")}. ${hasKonzessiv ? "Konzessiv vorhanden." : "Kein konzessiver Konnektor — auf B2 erwartet man obwohl, zwar…aber, dennoch."}`
      : "Keine Konnektoren gefunden.",
    conn.found,
    hasKonzessiv ? null : "konnektoren_range");

  add("nvv",
    nvv.length >= 2 ? "pass" : nvv.length === 1 ? "warn" : "fail",
    nvv.length
      ? `Verwendet: ${nvv.map(v => v.label).join(", ")}.`
      : "Keine der Zielverbindungen verwendet, obwohl sie im Lesetext vorkamen.",
    nvv.map(v => v.label),
    nvv.length ? null : "nvv_absent");

  add("konjunktiv2",
    konj2.length >= 2 ? "pass" : konj2.length === 1 ? "warn" : "fail",
    konj2.length
      ? `Gefunden: ${konj2.join(", ")}.`
      : "Kein Konjunktiv II. Ein Vorschlag im Indikativ wirkt als Behauptung, nicht als Vorschlag.",
    konj2,
    konj2.length >= 2 ? null : "konjunktiv2_argument");

  /* telc's Language criterion awards its top band for "no errors or only one
     or two errors without affecting the communicative aim". Failing a text
     outright on a single „wegen dem" was stricter than the board itself, and
     was the harshest rule we had. One slip is now a warning. */
  add("genitiv_praep",
    genitiv.length === 0 ? "pass" : genitiv.length <= 2 ? "warn" : "fail",
    genitiv.length
      ? `Dativ statt Genitiv: ${genitiv.join(", ")} — korrekt wäre z. B. wegen des / wegen der.`
      : "Keine Dativformen nach wegen, trotz, angesichts gefunden.",
    genitiv,
    genitiv.length ? "genitiv_praep" : null);

  add("register",
    colloquial.length === 0 ? "pass" : "warn",
    colloquial.length
      ? `Umgangssprachlich für eine schriftliche Aufgabe: ${colloquial.join(", ")}.`
      : "Durchgehend schriftsprachlich.",
    colloquial,
    colloquial.length ? "register_break" : null);

  if (isEmail) {
    const hasAnrede = ANREDE.test(text);
    const hasSchluss = SCHLUSS.test(text);
    add("email_form",
      hasAnrede && hasSchluss ? "pass" : hasAnrede || hasSchluss ? "warn" : "fail",
      hasAnrede && hasSchluss
        ? "Anrede und Grußformel vorhanden."
        : `Fehlt: ${[!hasAnrede && "Anrede", !hasSchluss && "Grußformel"].filter(Boolean).join(" und ")}. Die telc-Bewertung zählt beides unter „Kommunikative Gestaltung".`,
      [hasAnrede ? "Anrede ✓" : "Anrede ✗", hasSchluss ? "Gruß ✓" : "Gruß ✗"],
      hasAnrede && hasSchluss ? null : "email_form_missing");
  }

  // Range checks. These can FAIL a text that contains no errors at all, which is
  // the point: a flawless A2 sentence set is not a B2 performance.
  add("sentence_complexity",
    range.avgLen >= 15 && range.subordinators.length >= 3 ? "pass" : range.avgLen >= 11 || range.subordinators.length >= 2 ? "warn" : "fail",
    `Ø ${range.avgLen.toFixed(1)} Wörter pro Satz, ${range.subordinators.length} verschiedene Nebensatz-Einleitungen` +
    (range.subordinators.length ? ` (${range.subordinators.join(", ")}).` : ". Auf B2 erwartet man komplexere Sätze."),
    range.subordinators,
    range.avgLen >= 11 || range.subordinators.length >= 2 ? null : "range_simple");

  add("lexical_range",
    range.abstract.length >= 4 && range.ttr >= 0.75 ? "pass" : range.abstract.length >= 2 ? "warn" : "fail",
    /* NO TYPE-TOKEN RATIO IN THE LEARNER'S SENTENCE. This read "Wortvielfalt
       90%", which is `ttr` — an internal measure that still gates the band
       below and is unchanged. A percentage a learner cannot reproduce, next to
       a number that sounds like a grade, teaches nothing and invites her to
       read 90% as nine out of ten. The words we found, and what B2 expects of
       them, is the same information in language she can act on. */
    range.abstract.length
      ? `Abstrakte Nomen: ${range.abstract.slice(0, 5).join(", ")}. ` +
        (range.ttr >= 0.75
          ? "Auf B2 erwartet man noch mehr davon."
          : "Auf B2 erwartet man mehr davon — und dasselbe öfter einmal anders gesagt.")
      : "Kaum abstrakter Wortschatz — auf B2 wird mehr als Alltagssprache erwartet.",
    range.abstract.slice(0, 5),
    range.abstract.length >= 2 ? null : "range_lexis");

  add("repetition",
    repeat.count <= 3 ? "pass" : "warn",
    repeat.count <= 3
      ? "Keine auffällige Wortwiederholung."
      : `"${repeat.word}" kommt ${repeat.count}× vor — B2 erwartet Variation.`,
    repeat.count > 3 ? [repeat.word] : []);

  return {
    /* `connectorCats` and `repeat` are exposed because the rewrite loop needs to
       measure whether a targeted feature MOVED, not just whether it now passes:
       a learner who went from zero connector categories to two has improved
       even if two is still short of a pass, and telling them it did not count
       would be false. */
    metrics: { taskType: task.task_type || "forumsbeitrag", wordCount: wc, range,
      connectors: conn.found, connectorCats: conn.cats, hasKonzessiv,
      nvv: nvv.map(v => v.id), konj2, colloquial, genitiv, points,
      missing: missing.map(m => m.id),
      /* Named separately so the writing loop can refuse to act on a guess. */
      unsurePoints: unsure.map(u => u.id), repeat },
    findings,
  };
}

module.exports = { analyse, words, checkContentPoints, matchPoint };
