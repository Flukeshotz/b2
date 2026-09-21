/**
 * RELIABILITY PASS over the writing loop: the selector's ordering under
 * conflict, the evidence invariant, and draft recovery.
 *
 * These are not happy-path tests. Each one is a case where two plausible
 * behaviours diverge and the product philosophy has to pick, so the assertion
 * is really a statement of which behaviour we chose and why.
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");

require("../src/env")();
const pool = require("../src/db/pool");
const loop = require("../src/b2/writing_loop");
const tasksMod = require("../src/b2/task_profiles");

const impact = tasksMod.profileFor("forumsbeitrag").impact;
const F = (check_id, state, evidence = []) => ({ check_id, state, detail: "", evidence });
const TEXT = "Ich finde Homeoffice gut. Das Büro ist laut. Ich spare Zeit. Die Fahrt ist lang.";
const R = (...ids) => new Map(ids.map(id => [id, { kind: "experience", topicId: "t_" + id, title: id }]));

describe("selector ordering under conflict", () => {
  test("a severe issue with NO route loses to a milder one that has a route", () => {
    /* The product rule outranks severity: never tell somebody to improve
       something we cannot teach them. */
    const pick = loop.selectWeakness(
      [F("nvv", "fail"), F("connector_range", "warn")],
      { routes: R("connector_range"), impact, text: TEXT });
    assert.strictEqual(pick.finding.check_id, "connector_range");
    assert.deepStrictEqual(pick.unroutable, ["nvv"]);
  });

  test("a high-rubric issue loses to a lower one when it is a recent slip", () => {
    /* Rubric weight says what costs marks. "Passed it recently" says they can
       already do this and today was a slip, and slips do not need a lesson. */
    const findings = [F("content_points", "fail"), F("lexical_range", "fail")];
    const routes = new Map([["content_points", loop.COVERAGE_CHECKS.content_points],
                            ...R("lexical_range")]);
    assert.strictEqual(
      loop.selectWeakness(findings, { routes, impact, text: TEXT }).finding.check_id,
      "content_points", "with nothing else known, rubric weight decides");
    assert.strictEqual(
      loop.selectWeakness(findings, { routes, impact, text: TEXT,
        recentlyPassed: new Set(["content_points"]) }).finding.check_id,
      "lexical_range");
  });

  test("a persistent problem comes back once it is the only thing left", () => {
    /* Deprioritised is not excluded. A learner who keeps failing the same check
       must eventually be taught it, or "recently passed" becomes a way to never
       hear about your real weakness. */
    const pick = loop.selectWeakness([F("content_points", "fail")], {
      routes: new Map([["content_points", loop.COVERAGE_CHECKS.content_points]]),
      impact, text: TEXT, recentlyPassed: new Set(["content_points"]) });
    assert.strictEqual(pick.finding.check_id, "content_points");
  });

  test("identical severity, weight and staleness is broken by locatability", () => {
    /* Being shown your own sentence is most of what makes writing feedback
       land, so a showable weakness wins a genuine tie. */
    const findings = [F("connector_range", "fail"), F("repetition", "fail")];
    const pick = loop.selectWeakness(findings, {
      routes: R("connector_range", "repetition"), impact: [], text: TEXT });
    assert.strictEqual(pick.finding.check_id, "connector_range");
    assert.ok(loop.locate(TEXT, findings[0]));
    assert.strictEqual(loop.locate(TEXT, findings[1]), null);
  });

  test("a total tie is broken deterministically, never randomly", () => {
    const findings = [F("aaa_check", "fail"), F("bbb_check", "fail")];
    const routes = R("aaa_check", "bbb_check");
    const picks = new Set();
    for (let i = 0; i < 20; i++) {
      picks.add(loop.selectWeakness(findings, { routes, impact: [], text: "" }).finding.check_id);
    }
    assert.deepStrictEqual([...picks], ["aaa_check"]);
  });

  test("content_points is not eligible on unsure evidence alone", () => {
    /* The detector misreads about a quarter of unseen German. Telling somebody
       to cover a Leitpunkt they already covered is the worst failure this loop
       has, and it would land on the highest-weight check. */
    const finding = { check_id: "content_points", state: "warn", detail: "", evidence: [] };
    const routes = new Map([["content_points", loop.COVERAGE_CHECKS.content_points],
                            ...R("connector_range")]);
    const pick = loop.selectWeakness([finding, F("connector_range", "warn")],
      { routes, impact, text: TEXT, unsurePoints: ["begruendung"] });
    assert.strictEqual(pick.finding.check_id, "connector_range");
  });

  test("but a point we are CONFIDENT is missing is still surfaced", () => {
    const finding = { check_id: "content_points", state: "fail", detail: "",
                      evidence: ["Ein Beispiel aus Ihrem Alltag"] };
    const routes = new Map([["content_points", loop.COVERAGE_CHECKS.content_points]]);
    const pick = loop.selectWeakness([finding], { routes, impact, text: TEXT,
      unsurePoints: ["begruendung"] });
    assert.strictEqual(pick.finding.check_id, "content_points");
  });
});

describe("evidence integrity — one writing occasion is one demonstration", () => {
  let uid = null, live = false;
  const NAME = "__b2_writing_reliability__";
  before(async () => {
    try { await pool.query("SELECT 1"); live = true; } catch { return; }
    const f = await pool.query("SELECT id FROM users WHERE name=$1", [NAME]);
    uid = f.rows[0]?.id
      || (await pool.query("INSERT INTO users (name) VALUES ($1) RETURNING id", [NAME])).rows[0].id;
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [uid]);
  });
  after(async () => {
    if (!live || !uid) return;
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [uid]);
    await pool.query("DELETE FROM users WHERE id=$1", [uid]);
    await pool.end();
  });
  const needsDb = (t) => { if (!live) { t.skip("no database reachable"); return true; } return false; };

  const occasionOf = (ref) => String(ref).split(":")[0];

  test("a rewrite shares its original's occasion", () => {
    assert.strictEqual(occasionOf("write18:19"), occasionOf("write18:18"),
      "a first draft and its rewrite are one text — counting them as two " +
      "occasions would let a single evening look like sustained evidence");
  });

  test("two separate texts are two occasions", () => {
    assert.notStrictEqual(occasionOf("write18:18"), occasionOf("write22:22"));
  });

  test("the profile counts occasions, not rows", async (t) => {
    if (needsDb(t)) return;
    const profile = require("../src/b2/profile");
    /* Ten findings from one text plus ten from its rewrite: twenty rows, one
       occasion. That must not reach `reliable`, which needs two. */
    for (let i = 0; i < 10; i++) {
      await profile.record(uid, { dimension: "writing", checkId: `c${i}`, outcome: 1,
        weight: 1, sourceKind: "submission", sourceRef: "write90:90" });
      await profile.record(uid, { dimension: "writing", checkId: `c${i}`, outcome: 1,
        weight: 1, sourceKind: "submission", sourceRef: "write90:91" });
    }
    await profile.recomputeDimension(uid, "writing");
    const w = (await profile.getProfile(uid)).find(x => x.dimension === "writing");
    assert.strictEqual(w.evidence_n, 20);
    assert.notStrictEqual(w.evidence_state, "reliable",
      "twenty rows from one evening is not sustained evidence");
  });
});

describe("nothing incomplete can become a demonstration", () => {
  test("a refused submission produces no findings to record", () => {
    const { gate } = require("../src/b2/gate");
    const g = gate("Ich finde das.", { target_words: 180, task_type: "forumsbeitrag" });
    assert.strictEqual(g.ok, false,
      "a three-word answer must be refused before assessment, not scored");
  });

  test("a draft is not a submission", async () => {
    /* Structural: drafts live in their own table with no evidence path out of
       it. If this ever changes, an abandoned paragraph could be assessed. */
    const fs = require("node:fs"), path = require("node:path");
    const routes = fs.readFileSync(path.join(__dirname, "../src/routes/b2.js"), "utf8");
    const draftRoute = routes.slice(routes.indexOf("/write/:taskId/draft"),
                                   routes.indexOf("router.post(\"/write/:taskId/submit\""));
    assert.ok(!/recordMany|b2_evidence|assessForTask/.test(draftRoute),
      "the draft endpoint must never assess or record — it only stores text");
  });

  test("the draft is cleared only after a successful submission", () => {
    const fs = require("node:fs"), path = require("node:path");
    const routes = fs.readFileSync(path.join(__dirname, "../src/routes/b2.js"), "utf8");
    const submit = routes.slice(routes.indexOf("router.post(\"/write/:taskId/submit\""));
    const refusal = submit.indexOf("refused: true");
    const clear = submit.indexOf("DELETE FROM b2_drafts");
    assert.ok(clear > refusal && refusal > 0,
      "the draft must survive a refused submission — losing somebody's writing " +
      "because it was too short is the one failure this cannot come back from");
  });

  test("a rewrite of an unknown original is refused, not silently promoted", () => {
    const fs = require("node:fs"), path = require("node:path");
    const routes = fs.readFileSync(path.join(__dirname, "../src/routes/b2.js"), "utf8");
    assert.match(routes, /no such original attempt for this task/,
      "without this, a bad parentId would be assessed as a fresh first attempt " +
      "and could never earn language_awareness honestly");
  });
});

/**
 * LANGUAGE CONSISTENCY on the learner-facing writing screens.
 *
 * The learner reads a German prompt, writes German and gets a German verdict.
 * One English sentence in the middle of that reads as a bug rather than as a
 * bilingual product — and the refusal message for a too-short text was exactly
 * that, in the one place a learner is already frustrated.
 *
 * Internal names are a separate failure: a check id or a capability id on
 * screen tells the learner nothing and tells them we are showing them our
 * database.
 */
describe("learner-facing German in the writing loop", () => {
  const fs = require("node:fs"), path = require("node:path");
  const read = (f) => fs.readFileSync(path.join(__dirname, f), "utf8");

  /* Strings that reach a learner, taken from where they are authored. */
  const learnerStrings = () => {
    const out = [];
    const gate = read("../src/b2/gate.js");
    for (const m of gate.matchAll(/message:\s*[`"']([^`"']{10,})[`"']/g)) out.push(["gate", m[1]]);
    const loopSrc = read("../src/b2/writing_loop.js");
    for (const m of loopSrc.matchAll(/(?:why|improve|praise):\s*"([^"]{10,})"/g)) out.push(["loop", m[1]]);
    const caps = require("../src/b2/capabilities");
    for (const [k, v] of Object.entries(caps.CHECK_PHRASES_DE)) out.push([`phrase:${k}`, v]);
    return out;
  };

  /* Interpolations are code, not copy: `${task.target_words}` is not English
     on the learner's screen, it is a number. Stripped before checking. */
  const copyOnly = (s) => s.replace(/\$\{[^}]*\}/g, "…");

  test("no English sentence reaches the learner", () => {
    const ENGLISH = /\b(the|your|you|and|with|about|there|under|words|task|point|sentence|writing)\b/i;
    for (const [where, s] of learnerStrings()) {
      assert.ok(!ENGLISH.test(copyOnly(s)),
        `${where}: English on a German screen — "${copyOnly(s).slice(0, 70)}"`);
    }
  });

  test("no check id or capability id is ever shown", () => {
    const INTERNAL = /\b(connector_range|lexical_range|sentence_complexity|content_points|konjunktiv2|word_count|genitiv_praep|nvv|language_awareness|adapt_register|maintain_discussion|react_unexpected|understand_speech|evidence_weight|screening_signal)\b/;
    for (const [where, s] of learnerStrings()) {
      assert.ok(!INTERNAL.test(copyOnly(s)), `${where}: internal name on screen — "${s.slice(0, 70)}"`);
    }
    /* And the component never renders one either. */
    const write = read("../../client/src/components/steps/Write.jsx");
    const rendered = [...write.matchAll(/\{([^}]*checkId[^}]*)\}/g)].map(m => m[1]);
    assert.deepStrictEqual(rendered, [],
      "Write.jsx renders a checkId — that is our database, not the learner's language");
  });

  test("every German check phrase exists for every check the analyser emits", () => {
    const caps = require("../src/b2/capabilities");
    const EMITTED = ["word_count", "content_points", "connector_range", "nvv", "konjunktiv2",
      "genitiv_praep", "register", "sentence_complexity", "lexical_range", "repetition",
      "email_form", "professional_register", "information_coverage"];
    for (const id of EMITTED) {
      assert.ok(caps.CHECK_PHRASES_DE[id],
        `no German phrase for "${id}" — it would fall back to English mid-sentence`);
    }
  });

  test("the too-short refusal tells the learner their text is safe", () => {
    const { gate } = require("../src/b2/gate");
    const g = gate("Viel zu kurz.", { target_words: 180, task_type: "forumsbeitrag" });
    assert.strictEqual(g.ok, false);
    assert.match(g.message, /gespeichert/,
      "a learner who is refused must be told their writing was kept");
  });
});
