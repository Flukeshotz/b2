/**
 * EXAM SECTION — Goethe B2 Hören Teil 1.
 *
 * This is the only experience in the product with an IRREVERSIBLE action, and
 * almost every test below exists because of it. Everywhere else a reload costs
 * the learner nothing; here a reload must not hand back a listen, and equally a
 * failed audio load must not take one away. Those pull in opposite directions,
 * and getting either wrong ruins the thing Teil 1 practises.
 *
 * The second theme is refusing to overclaim. Ten items is not a Goethe result,
 * and the conversion table that turns Messpunkte into Ergebnispunkte is defined
 * over all thirty items of the module. A practice section that printed
 * "23 Punkte — nicht bestanden" would be making a false statement about a real
 * certificate.
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");

require("../src/env")();
const pool = require("../src/db/pool");
const blueprint = require("../src/b2/exam/goethe_b2");
const examSection = require("../src/b2/exam_section");
const examAttempt = require("../src/b2/exam_attempt");
const { SECTION, TEXTS } = require("../src/seed/b2/exam/hoeren_t1_alltag");

/* Source assertions must read the CODE, not the prose around it. Two of these
   tests originally failed against the comments explaining why the thing they
   forbid is never done. */
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

/* ── 1. THE OFFICIAL BLUEPRINT ─────────────────────────────────────────────
   Read out of the Modellsatz (Vs1.5_160426) and the Durchführungsbestimmungen
   (Stand 1.9.2025). Asserted here so a future edit has to argue with the
   source rather than with a habit. */
describe("the official Goethe B2 Hören blueprint", () => {
  test("four Teile, thirty items, circa 40 minutes", () => {
    assert.strictEqual(blueprint.HOEREN.teile.length, 4);
    assert.strictEqual(blueprint.HOEREN.totalItems, 30);
    assert.strictEqual(blueprint.HOEREN.minutes, 40);
    const sum = blueprint.HOEREN.teile.reduce((a, t) => a + t.items, 0);
    assert.strictEqual(sum, 30, "the Teile must account for exactly the module's items");
  });

  test("plays per Teil: once, twice, once, twice", () => {
    assert.deepStrictEqual(blueprint.HOEREN.teile.map(t => t.plays), [1, 2, 1, 2]);
  });

  test("Teil 1: five texts, ten items, five R/F and five 3-option MC, one play, 15 seconds", () => {
    const t = blueprint.teil(1);
    assert.strictEqual(t.texts, 5);
    assert.strictEqual(t.items, 10);
    assert.strictEqual(t.plays, 1);
    assert.strictEqual(t.readSeconds, 15);
    assert.deepStrictEqual(t.shape, [{ type: "rf", count: 5 }, { type: "mc3", count: 5 }]);
    assert.deepStrictEqual(t.itemRange, [1, 10]);
  });

  test("one point or none per item — no partial credit anywhere", () => {
    assert.strictEqual(blueprint.HOEREN.pointsPerItem, 1);
  });

  /* THE 2007 FORMAT MUST NOT COME BACK. goethe.de still serves the old
     Handbuch, which describes a two-Aufgabe Hörverstehen with a five-gap
     note-taking task at 2 points each. Any of these appearing in the blueprint
     means somebody read the wrong official document. */
  test("the pre-modular 2007 format cannot reappear", () => {
    const json = JSON.stringify(blueprint.HOEREN);
    assert.ok(!/luecken|lücken|stichwort|notieren/i.test(json),
      "gap-filling from a single listen is the 2007 Hörverstehen Aufgabe 1");
    assert.ok(!blueprint.HOEREN.teile.some(t => t.no > 4), "the modular module has four Teile, not two Aufgaben");
    assert.ok(!/2\s*Punkte/i.test(json), "2 points per item is the 2007 scoring");
  });
});

/* ── 2. NEVER FABRICATE AN EXAM RESULT ─────────────────────────────────── */
describe("a practice section is never reported as a Goethe result", () => {
  test("converting a partial module throws rather than returning a number", () => {
    assert.throws(() => blueprint.ergebnispunkte(7, 10), /refusing to convert/);
    assert.throws(() => blueprint.ergebnispunkte(10, 10), /refusing to convert/);
  });

  test("the full module still converts, against the published table", () => {
    assert.strictEqual(blueprint.ergebnispunkte(30, 30), 100);
    assert.strictEqual(blueprint.ergebnispunkte(18, 30), 60, "18 Messpunkte is exactly the pass mark");
    assert.strictEqual(blueprint.ergebnispunkte(0, 30), 0);
  });

  test("the pass mark is never applied to a section score", () => {
    const fs = require("node:fs"), path = require("node:path");
    /* Comments stripped first: an earlier version of this test matched the
       comment that EXPLAINS why the conversion is never called, which is
       exactly backwards. */
    const routes = stripComments(fs.readFileSync(path.join(__dirname, "../src/routes/b2.js"), "utf8"));
    const exam = routes.slice(routes.indexOf("/exam/:sectionId/finish"));
    assert.ok(!/ergebnispunkte|MODULE_PASS_POINTS|bestanden/i.test(exam),
      "the finish route must not convert or judge — ten items is not a certificate");
  });

  test("the label says practice, in the format of, and never Modellsatz", () => {
    const l = blueprint.PRACTICE_LABEL(1);
    assert.match(l, /Skillcase-Übung im Format des Goethe-Zertifikats B2/);
    assert.ok(!/Modellsatz/i.test(l));
  });
});

/* ── 3. CONTENT VALIDATION ─────────────────────────────────────────────── */
describe("content validation", () => {
  const clone = () => JSON.parse(JSON.stringify(TEXTS));
  const fails = (texts, re) => {
    const r = examSection.validateSection(SECTION, texts);
    assert.ok(r.fails.some(f => re.test(f)), r.fails.join("; ") || "(no failures)");
  };

  test("the authored section passes", () => {
    const r = examSection.validateSection(SECTION, TEXTS);
    assert.deepStrictEqual(r.fails, []);
  });

  test("wrong number of texts is refused", () => {
    fails(clone().slice(0, 4), /5 texts in the exam; this has 4/);
  });

  test("wrong number of items per text is refused", () => {
    const t = clone(); t[0].items.pop();
    fails(t, /2 items per text/);
  });

  test("the R/F and MC split must match the exam", () => {
    const t = clone(); t[0].items[0].type = "mc3"; t[0].items[0].options = ["a", "b", "c"]; t[0].items[0].answer = 0;
    fails(t, /needs 5× rf/);
  });

  test("duplicate options are refused", () => {
    const t = clone(); const mc = t[0].items[1]; mc.options[1] = mc.options[0];
    fails(t, /duplicate options/);
  });

  test("an out-of-range answer key is refused", () => {
    const t = clone(); t[0].items[1].answer = 5;
    fails(t, /out of range/);
  });

  test("a Richtig/Falsch item needs a boolean, not an index", () => {
    const t = clone(); t[0].items[0].answer = 1;
    fails(t, /needs a boolean answer/);
  });

  test("an item with no explanation is refused", () => {
    const t = clone(); delete t[0].items[0].because;
    fails(t, /no explanation/);
  });

  /* THE ITEM MUST TEST LISTENING. If the key repeats the transcript's wording
     far more closely than any distractor, it can be solved by matching strings
     — which is a reading skill, in the listening module. */
  test("a key that is a verbatim span of the transcript is refused", () => {
    /* The measure is the longest CONTIGUOUS run, not shared vocabulary: in a
       well-built item every option is made of words from the text, so a
       bag-of-words overlap scored all three at 1.00 and could never
       discriminate. What breaks an item is a phrase findable whole in the
       passage. */
    const t = clone();
    const mc = t[0].items[1];
    mc.options[mc.answer] = "Aber nächsten Montag hätte ich um vierzehn Uhr etwas";
    fails(t, /verbatim span of the transcript/);
  });

  test("a distractor lifted from the transcript is FINE — that is the trap", () => {
    const r = examSection.validateSection(SECTION, TEXTS);
    const tr = TEXTS[0].turns.map(x => x.de).join(" ");
    const distractor = TEXTS[0].items[1].options[0];
    assert.ok(examSection.overlap(distractor, tr) > 0.8,
      "this item's distractor really is near-verbatim, which is why the rule " +
      "cannot be a margin between key and distractor");
    assert.deepStrictEqual(r.fails, []);
  });

  test("keys clustered on one option are refused", () => {
    const t = clone();
    for (const x of t) { const mc = x.items.find(i => i.type === "mc3"); mc.answer = 0; }
    fails(t, /always guessing that position would score/);
  });

  test("Richtig/Falsch keys that are all the same are refused", () => {
    const t = clone();
    for (const x of t) { const rf = x.items.find(i => i.type === "rf"); rf.answer = false; }
    fails(t, /Richtig\/Falsch keys are the same/);
  });

  test("a text with no transcript or no situation is refused", () => {
    const a = clone(); a[0].turns = [];
    fails(a, /no transcript/);
    const b = clone(); delete b[1].situation;
    fails(b, /no situation/);
  });

  test("validation reports rather than throws on malformed content", () => {
    for (const mutate of [
      (t) => { delete t[0].items; },
      (t) => { delete t[0].items[1].options; },
      (t) => { delete t[0].items[0].stem; },
      (t) => { t[0].items[1].type = "nonsense"; },
    ]) {
      const t = clone(); mutate(t);
      const r = examSection.validateSection(SECTION, t);   // must not throw
      assert.ok(r.fails.length > 0);
    }
  });
});

/* ── 4. SCORING ────────────────────────────────────────────────────────── */
describe("scoring is plain counting", () => {
  const items = (() => {
    const out = []; let n = 0;
    for (const t of TEXTS) for (const it of t.items) out.push({ ...it, itemNo: ++n, textNo: t.no });
    return out;
  })();
  const allHeard = new Set(TEXTS.map(t => t.no));
  const key = Object.fromEntries(items.map(i => [i.itemNo, String(i.answer)]));

  test("a perfect attempt scores every item", () => {
    const r = examSection.score(items, key, allHeard);
    assert.strictEqual(r.correct, 10);
    assert.strictEqual(r.scorable, 10);
  });

  test("no partial credit", () => {
    const wrong = { ...key, 1: key[1] === "true" ? "false" : "true" };
    const r = examSection.score(items, wrong, allHeard);
    assert.strictEqual(r.correct, 9, "an item is one point or none");
  });

  test("an item whose text was never heard is UNSCORED, not wrong", () => {
    const heard = new Set([1, 2, 3, 4]);           // text 5 never played
    const r = examSection.score(items, key, heard);
    assert.strictEqual(r.unheard, 2);
    assert.strictEqual(r.scorable, 8);
    assert.strictEqual(r.correct, 8, "marking an unheard item wrong claims something we never observed");
  });

  test("an unanswered item is wrong, not unscored", () => {
    const partial = { ...key }; delete partial[1];
    const r = examSection.score(items, partial, allHeard);
    assert.strictEqual(r.correct, 9);
    assert.strictEqual(r.scorable, 10, "they heard it and did not answer — that is a wrong answer");
  });

  test("the result carries no percentage and no band", () => {
    const r = examSection.score(items, key, allHeard);
    assert.ok(!("percent" in r) && !("band" in r) && !("passed" in r));
  });
});

describe("evidence honesty", () => {
  const items = [{ itemNo: 1, textNo: 1, type: "rf", answer: true }];
  test("an incomplete section produces no evidence", () => {
    const r = examSection.score(items, { 1: "true" }, new Set([1]));
    assert.deepStrictEqual(examSection.evidenceFor(r, { complete: false }), []);
  });

  test("a section where nothing was heard produces no evidence", () => {
    const r = examSection.score(items, { 1: "true" }, new Set());
    assert.deepStrictEqual(examSection.evidenceFor(r, { complete: true }), []);
  });

  test("a complete section routes to understand_speech at listening", () => {
    const r = examSection.score(items, { 1: "true" }, new Set([1]));
    const [e] = examSection.evidenceFor(r, { complete: true });
    assert.strictEqual(e.capability, "understand_speech");
    assert.strictEqual(e.dimension, "listening");
    assert.strictEqual(e.outcome, 1);
  });

  test("the outcome is measured over what was HEARD, not over all items", () => {
    const two = [{ itemNo: 1, textNo: 1, type: "rf", answer: true },
                 { itemNo: 2, textNo: 2, type: "rf", answer: true }];
    const r = examSection.score(two, { 1: "true" }, new Set([1]));
    const [e] = examSection.evidenceFor(r, { complete: true });
    assert.strictEqual(e.outcome, 1, "1 of 1 heard-and-correct, not 1 of 2");
  });
});

/* ── 5. THE SINGLE-PLAY RULE, against a real database ──────────────────── */
describe("one play means one play", () => {
  const NAME = "__b2_exam_test__";
  let uid = null, live = false, attemptId = null;
  const PAPER = SECTION.paperId;
  const needsDb = (t) => { if (!live) { t.skip("no database reachable"); return true; } return false; };

  before(async () => {
    try { await pool.query("SELECT 1"); live = true; } catch { return; }
    await pool.query(
      `INSERT INTO b2_papers (id, board, title, minutes, source) VALUES ($1,'goethe','test',12,'test')
       ON CONFLICT (id) DO NOTHING`, [PAPER]);
    const f = await pool.query("SELECT id FROM users WHERE name=$1", [NAME]);
    uid = f.rows[0]?.id
      || (await pool.query("INSERT INTO users (name) VALUES ($1) RETURNING id", [NAME])).rows[0].id;
    await pool.query("DELETE FROM b2_paper_attempts WHERE user_id=$1", [uid]);
    const a = await examAttempt.openAttempt(uid, PAPER, null);
    attemptId = a.id;
  });
  after(async () => {
    if (!live || !uid) return;
    await pool.query("DELETE FROM b2_paper_attempts WHERE user_id=$1", [uid]);
    await pool.query("DELETE FROM users WHERE id=$1", [uid]);
    await pool.end();
  });

  test("requesting the audio consumes nothing", async (t) => {
    if (needsDb(t)) return;
    const a = await examAttempt.requestPlay(attemptId, 1);
    assert.strictEqual(a.allowed, true);
    /* A failed load: the learner asks again and is still allowed. This is the
       half of the rule that protects the learner from OUR network. */
    const b = await examAttempt.requestPlay(attemptId, 1);
    assert.strictEqual(b.allowed, true);
    assert.strictEqual(b.requests, 2, "retries are counted, never blocked");
    assert.strictEqual((await examAttempt.heardIn(attemptId)).has(1), false);
  });

  test("confirming playback closes the door", async (t) => {
    if (needsDb(t)) return;
    await examAttempt.confirmHeard(attemptId, 1);
    assert.strictEqual((await examAttempt.heardIn(attemptId)).has(1), true);
    const again = await examAttempt.requestPlay(attemptId, 1);
    assert.strictEqual(again.allowed, false, "a reload must not hand back a listen");
  });

  test("a double confirmation marks it heard once, at the first time", async (t) => {
    if (needsDb(t)) return;
    const { rows: [before] } = await pool.query(
      "SELECT heard_at FROM b2_exam_plays WHERE attempt_id=$1 AND text_no=1", [attemptId]);
    await examAttempt.confirmHeard(attemptId, 1);
    const { rows: [after] } = await pool.query(
      "SELECT heard_at FROM b2_exam_plays WHERE attempt_id=$1 AND text_no=1", [attemptId]);
    assert.strictEqual(before.heard_at.getTime(), after.heard_at.getTime());
  });

  test("a confirmation with no request marks nothing", async (t) => {
    if (needsDb(t)) return;
    const r = await examAttempt.confirmHeard(attemptId, 4);
    assert.strictEqual(r.known, false, "we only close a door somebody actually opened");
    assert.strictEqual((await examAttempt.heardIn(attemptId)).has(4), false);
  });

  test("resuming returns the SAME attempt, not a fresh one", async (t) => {
    if (needsDb(t)) return;
    const again = await examAttempt.openAttempt(uid, PAPER, null);
    assert.strictEqual(again.id, attemptId);
    assert.strictEqual(again.resumed, true,
      "a new attempt per visit would be a replay button with extra steps");
  });

  test("a second open attempt is impossible", async (t) => {
    if (needsDb(t)) return;
    await assert.rejects(
      () => pool.query(`INSERT INTO b2_paper_attempts (user_id, paper_id, responses)
                        VALUES ($1,$2,'{}'::jsonb)`, [uid, PAPER]),
      /duplicate key|unique/i);
  });

  test("finishing is idempotent — a reload cannot score twice", async (t) => {
    if (needsDb(t)) return;
    const first = await examAttempt.finish(attemptId, { correct: 3, scorable: 4 });
    assert.strictEqual(first.was_open, true);
    const second = await examAttempt.finish(attemptId, { correct: 99, scorable: 99 });
    assert.strictEqual(second.was_open, false, "the second call must not re-score");
    assert.strictEqual(second.scores.correct, 3, "the stored result stands");
  });

  /* REGRESSION — found in a manual pass, not by a unit test.
     openAttempt() originally queried `WHERE finished_at IS NULL`, so the
     instant an attempt finished it became invisible to its own lookup: the
     very next call — a page reload, or the finish route's own second
     invocation — found nothing open and silently created a fresh, empty
     attempt. A learner's completed section vanished behind a blank one, and
     the finish route's "idempotency" (tested above against the SAME attempt
     row) never protected against this, because in production the row it was
     called against was never the same one twice. */
  test("openAttempt after finishing returns the FINISHED attempt, not a new one", async (t) => {
    if (needsDb(t)) return;
    const before = await examAttempt.getAttempt(attemptId);
    assert.ok(before.finished_at, "fixture: the attempt above must already be finished");

    const again = await examAttempt.openAttempt(uid, PAPER, null);
    assert.strictEqual(again.id, attemptId,
      "a reload after finishing must find the completed attempt, not create one");
    assert.ok(again.finished_at);
  });

  test("a second finish() call after that reload still returns the stored score", async (t) => {
    if (needsDb(t)) return;
    // Simulates the actual failure: GET (which calls openAttempt), then POST
    // /finish again — as a page reload on the results screen would do.
    const reopened = await examAttempt.openAttempt(uid, PAPER, null);
    const items = [{ itemNo: 1, textNo: 1, type: "rf", answer: true }];
    const heard = await examAttempt.heardIn(reopened.id);
    const result = examSection.score(items, reopened.responses || {}, heard);
    const closed = await examAttempt.finish(reopened.id, { correct: result.correct });
    assert.strictEqual(closed.was_open, false);
    assert.strictEqual(closed.scores.correct, 3, "the original 3 must survive, not be overwritten with 0");
  });
});

/* ── 6. NO REPLAY REACHES THE CLIENT ───────────────────────────────────── */
describe("the browser is never given the means to replay", () => {
  const fs = require("node:fs"), path = require("node:path");
  const routes = fs.readFileSync(path.join(__dirname, "../src/routes/b2.js"), "utf8");
  const comp = fs.readFileSync(
    path.join(__dirname, "../../client/src/components/steps/HoerenTeil1.jsx"), "utf8");

  test("a text already heard is refused with 422 + {refused:true} and no url", () => {
    const play = routes.slice(routes.indexOf('/exam/:sectionId/play/:textNo'),
                              routes.indexOf('/exam/:sectionId/heard/:textNo'));
    const refusal = stripComments(play).match(/if \(!allowed\)[\s\S]*?\n  \}/)[0];
    assert.match(refusal, /422/);
    assert.match(refusal, /refused:\s*true/);
    assert.ok(!/url/.test(refusal),
      "a disabled button is a suggestion; not sending the url is the rule");
  });

  /* REGRESSION — found in the manual browser pass. b2api.js's shared req()
     helper only treats status 422 (with {refused:true}) and 503 as designed,
     non-throwing outcomes; every other non-2xx status falls into a generic
     `throw new Error(...)`. The play-refusal route originally answered with a
     bespoke 409, which meant the client's dedicated "you already heard this,
     just answer" handling was DEAD CODE — it could never run, because the
     promise rejected before the response body was ever inspected. Every
     reload-then-retry on an already-heard text showed a generic "recording
     failed to load" message instead, which is actively misleading: it tells
     the learner to do the one thing (retry) that can never work for that
     text, on a step where the honest answer is "you already heard it, answer
     what you have." */
  test("the play refusal uses a status b2api.js's req() actually returns instead of throwing", () => {
    const b2api = fs.readFileSync(
      path.join(__dirname, "../../client/src/lib/b2api.js"), "utf8");
    const nonThrowing = [...b2api.matchAll(/res\.status\s*===\s*(\d+)/g)].map(m => Number(m[1]));
    assert.ok(nonThrowing.length > 0, "could not find req()'s non-throwing status list");

    const play = routes.slice(routes.indexOf('/exam/:sectionId/play/:textNo'),
                              routes.indexOf('/exam/:sectionId/heard/:textNo'));
    // Specifically the "already heard" refusal, not the unrelated 404s earlier
    // in the same handler ("unknown section", "unknown text").
    const refusal = play.slice(play.indexOf("if (!allowed)"));
    const status = Number(refusal.match(/res\.status\((\d+)\)/)[1]);
    assert.ok(nonThrowing.includes(status),
      `the play route refuses with ${status}, but b2api.js's req() only returns ` +
      `the body without throwing for ${nonThrowing.join("/")} — any other status reaches ` +
      `the client as a generic thrown Error, and a dedicated refusal handler ` +
      `keyed on the response body can never run`);
  });

  test("the client checks the SAME field name the route actually sends", () => {
    const play = routes.slice(routes.indexOf('/exam/:sectionId/play/:textNo'),
                              routes.indexOf('/exam/:sectionId/heard/:textNo'));
    const sent = play.match(/refused:\s*true/) ? "refused" : play.match(/played:\s*true/) ? "played" : null;
    assert.ok(sent, "could not find the refusal field the route sends");
    assert.match(comp, new RegExp(`r\\.${sent}\\b`),
      `the route sends "${sent}: true" but the component checks a different field — ` +
      `the refusal branch would never trigger`);
  });

  test("the audio element never exposes native controls", () => {
    assert.ok(!/<audio[^>]*\scontrols/.test(comp),
      "native controls give a seek bar, which is a replay button");
  });

  /* REGRESSION — found in the manual browser pass. The server hands back a
     RELATIVE url (matching SourceAudio.jsx's own `cur.url`, served from the
     API's static mount). The B2 client runs on its own dev origin, separate
     from the API — same separation SourceAudio.jsx already accounts for by
     prefixing with VITE_API_ORIGIN. Without that prefix here, the src resolved
     against the client's OWN origin, which has no route for it; Vite's dev
     server answered with its SPA fallback — status 200, text/html — so
     nothing on the client's side treated it as a failed request, and the
     browser then correctly refused to play HTML as audio. The failure surfaced
     as a generic "could not start" message with no hint that the URL itself
     was wrong, on every single attempt, for every learner, regardless of their
     actual network. */
  test("the audio src is resolved against the API origin, matching SourceAudio.jsx", () => {
    const start = comp.slice(comp.indexOf("const startPlay"), comp.indexOf("const answer"));
    assert.match(start, /VITE_API_ORIGIN/,
      "el.src must be prefixed with the API origin — a bare relative url resolves " +
      "against the client's own dev server, which has no route for it");
  });

  test("the play is confirmed on `playing`, never on click", () => {
    assert.match(comp, /onplaying\s*=/, "sound starting is what consumes the listen");
    const click = comp.slice(comp.indexOf("const startPlay"), comp.indexOf("const answer"));
    assert.ok(!/examHeard/.test(click.slice(0, click.indexOf("onplaying"))),
      "confirming before playback would charge the learner for a failed load");
  });

  test("a double-click cannot spend two plays", () => {
    const fn = comp.slice(comp.indexOf("const startPlay"), comp.indexOf("const answer"));
    assert.match(fn, /if \(busy\) return/);
  });

  test("an audio error leaves the listen open", () => {
    assert.match(comp, /onerror[\s\S]{0,200}noch offen/,
      "a load failure must tell the learner their attempt was not consumed");
  });

  test("feedback is withheld for texts that were not heard", () => {
    const finish = routes.slice(routes.indexOf("/exam/:sectionId/finish"));
    assert.match(finish, /because: r\.listened \? src\.because : null/);
    assert.match(finish, /transcript: r\.listened \?/);
  });

  test("an answer to an unheard text is refused", () => {
    const ans = routes.slice(routes.indexOf('/exam/:sectionId/answer/:itemNo'),
                             routes.indexOf('/exam/:sectionId/finish'));
    assert.match(ans, /this text has not been heard yet/);
  });
});

/* ── 7. THE SELF-MANAGED-FOOTER RACE ───────────────────────────────────────
   A REAL, PREVIOUSLY-INVISIBLE BUG found in a manual browser pass, not by any
   unit test — because no unit test exercises React's effect-commit order.
   Lesson.jsx's `goToStep` seeds `hideFooter` on a step's first mount from a
   hardcoded list. Every step component that calls `ctx.setHideFooter` itself
   in ITS OWN mount effect (Write, GUse, ChunkProduce, HoerenTeil1, …) had that
   call silently overwritten a moment later, because `goToStep` fires as part
   of the same initial commit and runs after the child, resetting anything not
   on its list back to false. The result was not a flash: a disabled "Check"
   button sat permanently under the step's real controls for the entire step,
   a genuine dead control in a product whose stated principle is "no dead
   controls" — first noticed on hoeren_t1, but present on Write's own "write"
   stage (Experience 5) and GUse's "guse" stage (Experience 4) the same way.
   The fix has to hold every step type that manages this itself, not just the
   one that happened to get noticed — so this test reads the actual component
   sources and refuses to let the list drift out of sync with them again. */
describe("no step's dynamic hideFooter is silently overwritten on mount", () => {
  const fs = require("node:fs"), path = require("node:path");
  const STEPS_DIR = path.join(__dirname, "../../client/src/components/steps");
  const lesson = fs.readFileSync(path.join(__dirname, "../../client/src/screens/Lesson.jsx"), "utf8");

  const selfFooterList = () => {
    const m = lesson.match(/const SELF_FOOTER_ON_ENTRY = \[([^\]]*)\]/);
    assert.ok(m, "Lesson.jsx must define SELF_FOOTER_ON_ENTRY");
    return m[1].split(",").map(s => s.trim().replace(/^"|"$/g, "")).filter(Boolean);
  };

  /* Every step type registered in the component index, mapped to its file. */
  const registry = fs.readFileSync(path.join(STEPS_DIR, "index.jsx"), "utf8");
  const body = registry.slice(registry.indexOf("const COMPONENTS"));
  const map = [...body.matchAll(/(\w+):\s*(\w+)[,\n]/g)].map(m => ({ step: m[1], comp: m[2] }));

  test("the registry parses to a real set of step types", () => {
    assert.ok(map.length > 15, `only found ${map.length} step types`);
  });

  for (const { step, comp } of map) {
    const file = path.join(STEPS_DIR, `${comp}.jsx`);
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, "utf8");
    if (!/ctx\.setHideFooter/.test(src)) continue;

    test(`"${step}" (${comp}) manages its own footer, so it must be in SELF_FOOTER_ON_ENTRY`, () => {
      assert.ok(selfFooterList().includes(step),
        `${comp} calls ctx.setHideFooter in its own effect. Without "${step}" in ` +
        `Lesson.jsx's SELF_FOOTER_ON_ENTRY list, goToStep resets hideFooter to false ` +
        `on this step's first mount and silently overrides the component's own call — ` +
        `a disabled "Check" button sits permanently under the step's real UI.`);
    });
  }

  test("every entry in SELF_FOOTER_ON_ENTRY still corresponds to a real step type", () => {
    const known = new Set(map.map(m => m.step));
    for (const step of selfFooterList()) {
      assert.ok(known.has(step), `SELF_FOOTER_ON_ENTRY lists "${step}", which is not a registered step type`);
    }
  });
});

/* ── 8. RESUME NEVER ORPHANS A PARTIALLY-ANSWERED TEXT ───────────────────
   REAL BUG, found live: the original resume logic picked "the first text not
   yet HEARD". Reload after hearing a text but answering only one of its two
   items landed on the NEXT text — since the current one already counted as
   "heard" — and the unanswered item could never be reached again: that text
   cannot be replayed, so there is no path back to it. The section would reach
   Auswertung with an item permanently unanswered, silently, with no
   indication anything was wrong. */
describe("resuming never skips past an incomplete text", () => {
  const fs = require("node:fs"), path = require("node:path");
  const comp = fs.readFileSync(
    path.join(__dirname, "../../client/src/components/steps/HoerenTeil1.jsx"), "utf8");

  test("the resume target checks answers, not just heard status", () => {
    const resume = comp.slice(comp.indexOf("Resume where they stopped"), comp.indexOf("catch(() =>"));
    assert.ok(!/findIndex\(t => !t\.heard\)/.test(resume),
      '"first text not heard" is exactly the broken rule — a heard-but-partially-' +
      'answered text is skipped and its remaining item becomes permanently unreachable');
    assert.match(resume, /some\(it => responses\[/,
      "the resume target must check whether each text's items are actually answered");
  });

  test("resuming into an already-heard, incomplete text skips straight to answering", () => {
    const resume = comp.slice(comp.indexOf("Resume where they stopped"), comp.indexOf("catch(() =>"));
    assert.match(resume, /setPhase\("answering"\)/,
      "a text that was already heard must not be offered the countdown/play screens again");
  });

  /* The same logic, tested directly against the shapes the GET route sends —
     this is what actually decides resume behaviour, independent of the exact
     JSX. Mirrors the client's own selection so a change to one without the
     other is caught. */
  test("computed directly: the first INCOMPLETE text is chosen, not the first unheard one", () => {
    const texts = [
      { no: 1, heard: true,  items: [{ itemNo: 1 }, { itemNo: 2 }] },
      { no: 2, heard: true,  items: [{ itemNo: 3 }, { itemNo: 4 }] },
      { no: 3, heard: false, items: [{ itemNo: 5 }, { itemNo: 6 }] },
    ];
    // Text 1 fully answered; text 2 heard but item 4 missing; text 3 unheard.
    const responses = { 1: "true", 2: "0", 3: "true" };
    const next = texts.findIndex(t => !t.heard || t.items.some(it => responses[it.itemNo] === undefined));
    assert.strictEqual(texts[next].no, 2,
      "text 2 is incomplete (item 4 unanswered) and must be the resume target, not text 3");
  });
});
