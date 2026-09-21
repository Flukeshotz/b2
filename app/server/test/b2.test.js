/**
 * Regression tests for the B2 scoring engine.
 *
 * Every threshold in this engine was moved at least once during development,
 * and each move was verified with a throwaway script that was then deleted —
 * so nothing stopped the next change from silently undoing the last one. These
 * are those scripts, kept.
 *
 * DETERMINISTIC ONLY. No model calls, no network, no database: the suite has to
 * be cheap enough to run on every change, and a test that costs money or needs
 * a key is a test nobody runs. The model-backed numbers are measured separately
 * by the calibration harnesses.
 *
 * Run: npm test
 */

const test = require("node:test");
const assert = require("node:assert");

const { analyse } = require("../src/b2/analyse");
const { compose, telcBands } = require("../src/b2/verdict");
const { gate } = require("../src/b2/gate");
const pflege = require("../src/b2/pflege");
const interview = require("../src/b2/interview");

const GOETHE = { board: "goethe", module: "schreiben", task_type: "forumsbeitrag",
                 target_words: 180, content_points: [], pass_mark: 60, scale_max: 100 };
const TELC = { ...GOETHE, board: "telc", task_type: "halbformelle_email", target_words: 150, scale_max: 45 };

const A2 = `Ich heiße Anu. Ich komme aus Indien. Ich bin Krankenschwester. Ich arbeite im Krankenhaus. Die Arbeit ist gut. Ich mag meine Arbeit. Ich lerne Deutsch. Deutsch ist schwer. Ich möchte in Deutschland arbeiten. Deutschland ist schön. Ich habe eine Familie. Meine Familie ist in Indien. Ich vermisse meine Familie. Aber ich will arbeiten. Das ist wichtig für mich.`;
const B2 = `Die Einführung der Vier-Tage-Woche wird derzeit kontrovers diskutiert, wobei die Argumente je nach Branche sehr unterschiedlich ausfallen. Befürworter verweisen darauf, dass eine kürzere Arbeitszeit nachweislich zu höherer Produktivität und geringeren krankheitsbedingten Ausfällen führt. Gerade im Pflegebereich, der ohnehin unter erheblichem Personalmangel leidet, könnte eine solche Regelung die Attraktivität des Berufs deutlich steigern. Kritiker wenden allerdings ein, dass sich die Versorgung rund um die Uhr nicht ohne zusätzliche Stellen aufrechterhalten lässt. Meines Erachtens wäre es sinnvoll, zunächst Modellversuche durchzuführen, bevor man eine flächendeckende Einführung beschließt.`;

const score = (text, task) => compose(analyse(text, task), task, null).predicted_score;

/* ── the scale ──────────────────────────────────────────────────────────── */

test("A2 writing scores below B2 writing", () => {
  assert.ok(score(A2, GOETHE) < score(B2, GOETHE),
    `A2 (${score(A2, GOETHE)}) should score below B2 (${score(B2, GOETHE)})`);
});

test("the deterministic path is calibrated, not raw", () => {
  /* Measured on MERLIN: without the -11 shift the average B1 text cleared the
     pass mark, producing 183 false-optimistic verdicts against 10 the other
     way. If someone removes the calibration, an A2 text starts passing. */
  assert.ok(score(A2, GOETHE) < 60, `A2 must not pass (scored ${score(A2, GOETHE)})`);
});

test("a verdict always says which engine produced it", () => {
  const v = compose(analyse(B2, GOETHE), GOETHE, null);
  assert.strictEqual(v.basis, "deterministic_only");
  assert.strictEqual(v.model_available, false);
  // The interval must be wider without the model — that is the honesty dial.
  assert.ok(v.ci_high - v.ci_low >= 30, "deterministic interval should stay wide");
});

/* ── the gate ───────────────────────────────────────────────────────────── */

test("gate refuses an empty submission", () => {
  assert.strictEqual(gate("", GOETHE).ok, false);
});

test("gate refuses English written to a German task", () => {
  const english = "I think the four day week is a good idea for most people because they get more time with family and are less stressed at work. ".repeat(4);
  assert.strictEqual(gate(english, GOETHE).reason, "wrong_language");
});

test("gate marks a short Pflege report instead of refusing it", () => {
  /* An examiner graded two ~30-word Aufnahmeberichte A2. The general floor
     (55% of target) turned them away with no feedback at all; Pflege scores
     brevity through Criterion I, so the floor there only catches a non-attempt. */
  const short = "Frau Kremer ist 78 Jahre alt. Sie ist gestürzt und wurde aufgenommen. Sie hat Diabetes und Bluthochdruck. Sie nimmt Metformin. Sie kann nicht gut laufen. Ihre Tochter wurde angerufen.";
  assert.strictEqual(gate(short, { board: "telc_pflege", target_words: 120 }).ok, true);
  assert.strictEqual(gate(short, { board: "goethe", target_words: 150 }).ok, false);
});

/* ── telc bands ─────────────────────────────────────────────────────────── */

test("telc bands are proportional, not raw fail counts", () => {
  /* Kommunikative Gestaltung carries eight checks and Sprache one. Counting
     failures absolutely made the broad criterion near-impossible to pass. */
  const det = analyse(B2, TELC);
  const t = telcBands(det.findings, null);
  assert.ok(t, "telc bands should be produced for a telc task");
  assert.ok(["A", "B", "C"].includes(t.criteria.gestaltung.band),
    `a competent B2 text should not band D (got ${t.criteria.gestaltung.band})`);
});

test("telc bands are absent for a Goethe task", () => {
  assert.strictEqual(compose(analyse(B2, GOETHE), GOETHE, null).telc, null);
});

/* ── telc Pflege ────────────────────────────────────────────────────────── */

const KREMER = { board: "telc_pflege", target_words: 120, information_points: [
  { id: "name_alter", label_de: "Name und Alter", detector: "(frau|herr)\\s+\\w+.{0,60}(jahre|geboren)" },
  { id: "aufnahmegrund", label_de: "Aufnahmegrund", detector: "(aufgenommen|aufnahme).{0,80}(sturz|gest(ü|ue)rzt|fraktur)" },
  { id: "vorerkrankungen", label_de: "Vorerkrankungen", detector: "(vorerkrankung|leidet an|diabetes|bluthochdruck)" },
  { id: "medikamente", label_de: "Medikamente", detector: "(medikament|metformin|nimmt .{0,30}ein)" },
  { id: "allergie", label_de: "Allergien", detector: "(allergi|unvertr(ä|ae)glich|penicillin)" },
  { id: "mobilitaet", label_de: "Mobilität", detector: "(mobilit(ä|ae)t|rollator|bettl(ä|ae)gerig|gehf(ä|ae)hig)" },
] };

test("Pflege reports a CEFR level, never a percentage", () => {
  const strong = `Aufnahmebericht. Frau Elisabeth Kremer, 78 Jahre, wurde heute nach einem Sturz aufgenommen. Es besteht der Verdacht auf eine Oberschenkelhalsfraktur. Als Vorerkrankungen sind ein Diabetes mellitus Typ 2 sowie ein Bluthochdruck bekannt. Die Patientin nimmt Metformin 850 mg ein. Eine Allergie gegen Penicillin liegt vor und ist zu beachten. Vor dem Sturz war sie mit dem Rollator gehfähig, aktuell ist sie bettlägerig.`;
  const r = pflege.score(strong, KREMER);
  assert.ok(["B2", "B1", "A2", "unter A2"].includes(r.level));
  assert.strictEqual(r.max, 20, "four criteria of five points");
});

test("Pflege voids only a text on the wrong subject, not a thin one", () => {
  /* Our first reading voided any text missing over half its information, and an
     examiner's marking proved it wrong: thin-but-on-topic reports are A2, not
     below A2. Only a text reaching NONE of the information is disconnected. */
  const thin = "Die Patientin Frau Kremer ist heute gekommen. Sie ist alt und sie ist gefallen. Das Bein tut weh. Sie hat Medikamente.";
  const offTopic = "Sehr geehrte Damen und Herren, ich möchte mich für die Stelle bewerben. Ich habe drei Jahre Erfahrung und arbeite gerne im Team.";
  assert.strictEqual(pflege.score(thin, KREMER).voided, false, "a thin on-topic report must still be marked");
  assert.strictEqual(pflege.score(offTopic, KREMER).voided, true, "an off-topic text is voided");
});

test("Pflege caps vocabulary at A2 when lay words carry the clinical load", () => {
  const lay = "Frau Kremer ist 78 Jahre alt. Sie ist gefallen. Sie hat Zucker und hoher Blutdruck. Sie nimmt eine Tablette. Das Bein tut weh. Sie kann nicht gehen.";
  assert.strictEqual(pflege.score(lay, KREMER).criteria.wortschatz.band, 1,
    "„Zucker\" for Diabetes and „eine Tablette\" for Metformin is the A2 band");
});

test("Pflege content bands follow the published missing-information counts", () => {
  assert.strictEqual(pflege.contentBand(0), 5);
  assert.strictEqual(pflege.contentBand(1), 4);
  assert.strictEqual(pflege.contentBand(3), 3);
  assert.strictEqual(pflege.contentBand(5), 2);
  assert.strictEqual(pflege.contentBand(6), 1);
});

/* ── interview ──────────────────────────────────────────────────────────── */

const Q = (id) => (interview.QUESTIONS || []).find((q) => q.id === id);
const grade = (text, seconds = 40) =>
  interview.gradeAnswer(Q("staerken_schwaechen"), { text, durationSec: seconds, scores: { fluency: 75 } }, 0);
const noteOf = (g, id) => (g.notes || []).find((n) => n.id === id);

test("depth is scored as the four moves an examiner named", () => {
  /* "explain the answer with a reason, give a relevant example from their
     professional life and add a little more detail" — her words, and the point
     is naming WHICH move is missing, not just that the answer was thin. */
  const bare = grade("Teamarbeit ist meine Stärke. Ich arbeite gerne im Team.");
  assert.strictEqual(noteOf(bare, "depth").state, "fail");

  const full = grade("Teamarbeit ist meine Stärke, weil man in der Pflege nichts allein schafft. Das bedeutet konkret, dass ich bei der Übergabe immer nachfrage. Zum Beispiel hatte ich einmal im Nachtdienst eine Patientin mit starken Schmerzen und habe sofort den Arzt informiert. Wir haben die Vitalzeichen alle 30 Minuten kontrolliert.");
  assert.strictEqual(noteOf(full, "depth").state, "pass");
});

test("falling back into English is caught, German loanwords are not", () => {
  const eng = grade("Temperature, then I I I the station then this monitor and the patient.");
  assert.ok(noteOf(eng, "english"), "English code-switching should be flagged");

  const de = grade("Ich überwache den Monitor, messe Blutdruck und Puls beim Patienten und informiere sofort das Team und den Arzt auf der Station.");
  assert.strictEqual(noteOf(de, "english"), undefined,
    "Monitor, Patient, Team and Station are German words");
});

test("a session summary always says what to improve", () => {
  /* A one-question session tripped no pattern threshold and returned a verdict
     with no reason — the complaint that started this. */
  const s = interview.sessionSummary([{ reads: "one thing to fix", weakWords: [], notes: [
    { id: "sustained", state: "fail", detail: "You stopped at 11 seconds." },
  ] }]);
  assert.ok(s.findings.length > 0, "one answer must still yield a finding");
  assert.ok(s.findings.length <= 3, "never more than three, or it is a wall");
});

test("ward placement separates content from precision", () => {
  /* Calibrated on a recorded screening call: the candidate code-switched and
     hunted for words yet was advanced for Notaufnahme and refused for ICU.
     Collapsing both axes into one score reported them as not ready at all. */
  const heavyAccentGoodContent = [{ reads: "x", weakWords: [], notes: [
    { id: "english", state: "fail", detail: "" }, { id: "fluency", state: "fail", detail: "" },
    { id: "sustained", state: "pass", detail: "" }, { id: "substantiated", state: "pass", detail: "" },
  ] }];
  assert.strictEqual(interview.sessionSummary(heavyAccentGoodContent).placement.id, "acute");

  const nothing = [{ reads: "x", weakWords: [], notes: [
    { id: "english", state: "fail", detail: "" }, { id: "fluency", state: "fail", detail: "" },
    { id: "sustained", state: "fail", detail: "" }, { id: "substantiated", state: "fail", detail: "" },
  ] }];
  assert.strictEqual(interview.sessionSummary(nothing).placement.id, "not_yet");
});

test("every interview question carries the trap it is testing for", () => {
  for (const q of interview.QUESTIONS || []) {
    assert.ok(q.de && q.assesses && q.trap && q.strong,
      `${q.id} is missing the fields the grader and the feedback both need`);
  }
});

/* ── board neutrality ───────────────────────────────────────────────────── */

test("the model prompt never names the board", () => {
  /* Naming it cost telc eleven points against Goethe on the same held-out
     texts — the model compressed its range when told it was marking telc. The
     board's criteria belong downstream in verdict.js, not in the language
     judgement. */
  const model = require("fs").readFileSync(require("path").join(__dirname, "../src/b2/model.js"), "utf8");
  const prompt = model.slice(model.indexOf("function buildPrompt"));
  const body = prompt.slice(0, prompt.indexOf("\nasync function"));
  for (const name of ["telc Deutsch B2", "Goethe-Zertifikat", "telc Deutsch B1"]) {
    assert.ok(!body.includes(`\`${name}`) && !body.includes(`"${name}`),
      `buildPrompt must not name ${name} — a CEFR judgement is board-independent`);
  }
});

test("the same text scores the same whichever board asks", () => {
  /* Deterministic half only, but it is the half we control: the analysis and
     the calibrated score must not drift between boards for identical input. */
  const a = compose(analyse(B2, GOETHE), GOETHE, null).predicted_score;
  const b = compose(analyse(B2, { ...GOETHE, board: "telc" }), { ...GOETHE, board: "telc" }, null).predicted_score;
  assert.strictEqual(a, b, "the deterministic score must be board-independent");
});

/* ── word count ─────────────────────────────────────────────────────────── */

test("length is a minimum, never a range", () => {
  /* Both boards say "mindestens" / "wenigstens" and neither sets an upper
     bound. Capping at 127% of target pushed telc's C1 mean BELOW its B2 mean
     on 1,033 rated texts, because a strong 200-word answer is 133% of telc's
     150 and only 111% of Goethe's 180 — the same text, punished for one board
     and not the other, purely for being good. */
  const long = (B2 + " ").repeat(3);
  const stateOf = (task) =>
    analyse(long, task).findings.find((f) => f.check_id === "word_count").state;
  assert.strictEqual(stateOf(GOETHE), "pass", "over-length must not be penalised");
  assert.strictEqual(stateOf(TELC), "pass", "and not on the shorter telc target either");
});

test("a text far under the minimum still fails", () => {
  const stub = "Ich finde das gut. Es ist wichtig.";
  assert.strictEqual(
    analyse(stub, GOETHE).findings.find((f) => f.check_id === "word_count").state, "fail");
});

test("a strong long text is not scored lower than a strong short one", () => {
  /* The regression the cap caused, stated as the property that matters. */
  assert.ok(score(B2 + " " + B2, GOETHE) >= score(B2, GOETHE) - 2,
    "doubling a good text must not collapse its score");
});
