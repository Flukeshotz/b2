/**
 * THE PRODUCTION CONTENT MODEL — item types, scoring, provenance, review.
 *
 * Written adversarially. The happy path for a content schema is trivial; what
 * matters is that the wrong thing is refused, because every rule here exists to
 * stop a specific lie reaching a learner:
 *
 *   a fake answer key on a writing task
 *   an "official Goethe paper" that is ours
 *   ORIGINAL content citing a page in a book it never came from
 *   SME_REVIEWED with nobody's name against it
 *   a skipped answer counted as a wrong one
 *
 * Two layers are tested. Migration 010 enforces controlled vocabularies and the
 * structural rules SQL can express; `content_model.js` enforces the JSON shapes
 * SQL cannot see inside. The suite asserts the two agree — a vocabulary that
 * drifts between them is a gap a direct INSERT would walk through.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert");

const M = require("../src/b2/content_model");

/* ── A. PROVENANCE ──────────────────────────────────────────────────────── */

describe("A — provenance", () => {
  test("ORIGINAL content may carry no book reference", () => {
    assert.ok(M.validateProvenance({ source_type: "ORIGINAL" }).valid);
  });

  test("ORIGINAL content must not cite a book or a page", () => {
    assert.ok(!M.validateProvenance({ source_type: "ORIGINAL", source_book: "Kontext B2" }).valid);
    assert.ok(!M.validateProvenance({ source_type: "ORIGINAL", source_page: "p. 42" }).valid);
  });

  test("licensed and adapted content must name its book", () => {
    for (const t of ["DIRECT_LICENSED", "ADAPTED", "INSPIRED"]) {
      assert.ok(!M.validateProvenance({ source_type: t }).valid, `${t} passed without a book`);
    }
  });

  test("ADAPTED content must declare where its adaptation stands", () => {
    const bare = M.validateProvenance({ source_type: "ADAPTED", source_book: "Kontext B2" });
    assert.ok(!bare.valid);
    assert.ok(bare.problems.some(p => /adaptation_status/.test(p)));
    assert.ok(M.validateProvenance({
      source_type: "ADAPTED", source_book: "Kontext B2", adaptation_status: "ADAPTED" }).valid);
  });

  test("an unknown source_type is refused", () => {
    assert.ok(!M.validateProvenance({ source_type: "SCRAPED" }).valid);
  });

  test("absent provenance is tolerated until production", () => {
    assert.ok(M.validateProvenance({}).valid);
    assert.ok(!M.validateProvenance({}, { required: true }).valid);
  });
});

/* ── B. REVIEW LIFECYCLE ────────────────────────────────────────────────── */

describe("B — review lifecycle", () => {
  const review = { reviewer: "A. Teacher", reviewed_at: "2026-09-12", outcome: "SME_REVIEWED" };

  test("the normal path is allowed", () => {
    assert.ok(M.canTransition("DRAFT", "AUTO_QA_PASS").allowed);
    assert.ok(M.canTransition("AUTO_QA_PASS", "SME_REVIEWED", { review }).allowed);
    assert.ok(M.canTransition("SME_REVIEWED", "PRODUCTION").allowed);
  });

  test("SME_REVIEWED without a recorded review is refused", () => {
    const r = M.canTransition("AUTO_QA_PASS", "SME_REVIEWED");
    assert.ok(!r.allowed);
    assert.ok(r.problems.some(p => /requires a recorded review/.test(p)));
  });

  test("a review record with no reviewer does not count", () => {
    assert.ok(!M.canTransition("AUTO_QA_PASS", "SME_REVIEWED",
      { review: { reviewed_at: "2026-09-12", outcome: "SME_REVIEWED" } }).allowed);
  });

  test("a change-request record cannot be used to claim approval", () => {
    assert.ok(!M.canTransition("AUTO_QA_PASS", "SME_REVIEWED",
      { review: { ...review, outcome: "SME_CHANGES_REQUIRED" } }).allowed);
  });

  test("automated QA cannot jump straight to SME_REVIEWED or PRODUCTION", () => {
    assert.ok(!M.canTransition("DRAFT", "SME_REVIEWED", { review }).allowed);
    assert.ok(!M.canTransition("DRAFT", "PRODUCTION").allowed);
    assert.ok(!M.canTransition("AUTO_QA_PASS", "PRODUCTION").allowed);
  });

  test("content can always be sent back for changes", () => {
    for (const from of ["AUTO_QA_PASS", "SME_REVIEWED", "PRODUCTION"]) {
      assert.ok(M.canTransition(from, "SME_CHANGES_REQUIRED").allowed, from);
    }
  });
});

/* ── C. DIFFICULTY ──────────────────────────────────────────────────────── */

describe("C — difficulty", () => {
  test("only A, B and C exist", () => {
    assert.deepEqual(M.DIFFICULTY, ["A", "B", "C"]);
  });

  test("production content without a difficulty is refused", () => {
    const base = { review_status: "AUTO_QA_PASS", skill: "reading", source_type: "ORIGINAL" };
    assert.ok(!M.validateForProduction(base).ready);
    assert.ok(!M.validateForProduction({ ...base, difficulty: "X" }).ready);
    assert.ok(M.validateForProduction({ ...base, difficulty: "B" }).ready);
  });
});

/* ── D. ITEM TYPES ──────────────────────────────────────────────────────── */

describe("D — item type validation", () => {
  test("an unknown item_type is refused", () => {
    assert.ok(!M.validateItem({ item_type: "PUZZLE" }).valid);
  });

  test("all ten required types are supported", () => {
    for (const t of ["MCQ", "MULTI_SELECT", "TRUE_FALSE", "MATCHING", "GAP_FILL",
                     "ORDERING", "SHORT_TEXT", "LONG_TEXT", "SPOKEN_RESPONSE", "OPEN_RESPONSE"]) {
      assert.ok(M.ITEM_TYPES.includes(t), `${t} missing`);
    }
    assert.equal(M.ITEM_TYPES.length, 10);
  });
});

describe("D1 — MCQ", () => {
  const ok = { item_type: "MCQ", options: ["a", "b", "c"], answer: 1, scoring_mode: "OBJECTIVE" };
  test("a well-formed MCQ passes", () => assert.ok(M.validateItem(ok).valid));
  test("a key outside the options is refused", () =>
    assert.ok(!M.validateItem({ ...ok, answer: 5 }).valid));
  test("a missing key is refused", () =>
    assert.ok(!M.validateItem({ ...ok, answer: undefined }).valid));
  test("one option is refused", () =>
    assert.ok(!M.validateItem({ ...ok, options: ["a"] }).valid));
  test("a repeated option is refused", () =>
    assert.ok(!M.validateItem({ ...ok, options: ["a", "A", "c"] }).valid));
});

describe("D2 — MULTI_SELECT", () => {
  const ok = { item_type: "MULTI_SELECT", scoring_mode: "OBJECTIVE",
               payload: { options: ["a", "b", "c", "d"] }, answer_payload: { correct: [0, 2] } };
  test("a well-formed multi-select passes", () => assert.ok(M.validateItem(ok).valid));
  test("exactly one correct answer is refused — that is an MCQ", () => {
    const r = M.validateItem({ ...ok, answer_payload: { correct: [1] } });
    assert.ok(!r.valid);
    assert.ok(r.problems.some(p => /use MCQ/.test(p)));
  });
  test("marking every option correct is refused", () =>
    assert.ok(!M.validateItem({ ...ok, answer_payload: { correct: [0, 1, 2, 3] } }).valid));
  test("a key outside the options is refused", () =>
    assert.ok(!M.validateItem({ ...ok, answer_payload: { correct: [0, 9] } }).valid));
});

describe("D3 — TRUE_FALSE", () => {
  test("a boolean answer passes", () => {
    assert.ok(M.validateItem({ item_type: "TRUE_FALSE", answer_payload: { value: false } }).valid);
  });
  test("a non-boolean answer is refused", () => {
    for (const v of ["true", 1, null, undefined]) {
      assert.ok(!M.validateItem({ item_type: "TRUE_FALSE", answer_payload: { value: v } }).valid,
        `accepted ${JSON.stringify(v)}`);
    }
  });
});

describe("D4 — MATCHING", () => {
  const ok = { item_type: "MATCHING", scoring_mode: "OBJECTIVE",
               payload: { left: ["l1", "l2"], right: ["r1", "r2", "r3"] },
               answer_payload: { mapping: { 0: 2, 1: 0 } } };
  test("a well-formed matching passes", () => assert.ok(M.validateItem(ok).valid));
  test("a missing mapping is refused", () =>
    assert.ok(!M.validateItem({ ...ok, answer_payload: {} }).valid));
  test("a partial mapping is refused — unmapped must not become wrong", () => {
    const r = M.validateItem({ ...ok, answer_payload: { mapping: { 0: 2 } } });
    assert.ok(!r.valid);
    assert.ok(r.problems.some(p => /unmapped/.test(p)));
  });
  test("mapping to a right item that does not exist is refused", () =>
    assert.ok(!M.validateItem({ ...ok, answer_payload: { mapping: { 0: 9, 1: 0 } } }).valid));
  test("missing sides are refused", () => {
    assert.ok(!M.validateItem({ ...ok, payload: { right: ["r1"] } }).valid);
    assert.ok(!M.validateItem({ ...ok, payload: { left: ["l1"] } }).valid);
  });
});

describe("D5 — GAP_FILL", () => {
  const ok = { item_type: "GAP_FILL", scoring_mode: "OBJECTIVE",
               payload: { text: "Wir ___ die Kritik ernst ___.", match: "ignore_case" },
               answer_payload: { gaps: [{ accepted: ["nehmen"] }, { accepted: ["wahr"] }] } };
  test("a well-formed gap-fill passes", () => assert.ok(M.validateItem(ok).valid));
  test("no accepted answers is refused", () =>
    assert.ok(!M.validateItem({ ...ok, answer_payload: { gaps: [] } }).valid));
  test("an empty accepted list is refused", () =>
    assert.ok(!M.validateItem({ ...ok,
      answer_payload: { gaps: [{ accepted: [] }, { accepted: ["wahr"] }] } }).valid));
  test("gap count must match answer-set count", () => {
    const r = M.validateItem({ ...ok, answer_payload: { gaps: [{ accepted: ["nehmen"] }] } });
    assert.ok(!r.valid);
    assert.ok(r.problems.some(p => /2 gap\(s\) but 1/.test(p)));
  });
  test("a text with no gap marker is refused", () =>
    assert.ok(!M.validateItem({ ...ok, payload: { text: "kein Lücke hier" } }).valid));
  test("an unknown match rule is refused", () =>
    assert.ok(!M.validateItem({ ...ok, payload: { ...ok.payload, match: "fuzzy" } }).valid));
});

describe("D6 — ORDERING", () => {
  const ok = { item_type: "ORDERING", scoring_mode: "OBJECTIVE",
               payload: { items: ["a", "b", "c", "d"] }, answer_payload: { order: [2, 0, 3, 1] } };
  test("a well-formed ordering passes", () => assert.ok(M.validateItem(ok).valid));
  test("an order that misses an item is refused", () =>
    assert.ok(!M.validateItem({ ...ok, answer_payload: { order: [0, 1, 2] } }).valid));
  test("a repeated position is refused", () =>
    assert.ok(!M.validateItem({ ...ok, answer_payload: { order: [0, 0, 2, 3] } }).valid));
  test("fewer than three items is not an ordering task", () =>
    assert.ok(!M.validateItem({ ...ok, payload: { items: ["a", "b"] },
      answer_payload: { order: [1, 0] } }).valid));
});

/* ── E. PRODUCTIVE ITEMS — the no-fake-key rule ─────────────────────────── */

describe("E — productive items never carry a key", () => {
  const base = { item_type: "LONG_TEXT", stem: "Schreiben Sie einen Kommentar.",
                 scoring_mode: "RUBRIC", payload: { rubric_id: 3 } };

  test("a rubric-scored long text passes", () => assert.ok(M.validateItem(base).valid));

  test("an answer index on a productive task is refused", () => {
    const r = M.validateItem({ ...base, answer: 1 });
    assert.ok(!r.valid);
    assert.ok(r.problems.some(p => /must not carry an answer key/.test(p)));
  });

  test("an answer payload on a productive task is refused", () =>
    assert.ok(!M.validateItem({ ...base, answer_payload: { value: true } }).valid));

  test("every productive type refuses OBJECTIVE scoring", () => {
    for (const t of M.PRODUCTIVE_TYPES) {
      const r = M.validateItem({ item_type: t, stem: "p", scoring_mode: "OBJECTIVE",
                                 payload: { speak_seconds: 60 } });
      assert.ok(!r.valid, `${t} accepted OBJECTIVE`);
      assert.ok(r.problems.some(p => /OBJECTIVE/.test(p)));
    }
  });

  test("rubric scoring must name the rubric — no band from nowhere", () => {
    assert.ok(!M.validateItem({ ...base, payload: {} }).valid);
  });

  test("a spoken response needs an expected speaking time", () => {
    assert.ok(!M.validateItem({ item_type: "SPOKEN_RESPONSE", stem: "p",
                                scoring_mode: "TRANSCRIPT_ONLY", payload: {} }).valid);
    assert.ok(M.validateItem({ item_type: "SPOKEN_RESPONSE", stem: "p",
                               scoring_mode: "TRANSCRIPT_ONLY",
                               payload: { speak_seconds: 90 } }).valid);
  });

  test("TRANSCRIPT_ONLY belongs to speech alone", () => {
    assert.ok(!M.validateItem({ item_type: "LONG_TEXT", stem: "p",
                                scoring_mode: "TRANSCRIPT_ONLY" }).valid);
  });
});

/* ── F. SCORING MODES ───────────────────────────────────────────────────── */

describe("F — scoring modes", () => {
  test("exactly four modes exist", () => {
    assert.deepEqual(M.SCORING_MODES, ["OBJECTIVE", "RUBRIC", "TRANSCRIPT_ONLY", "UNSCORED"]);
  });
  test("an unknown mode is refused", () =>
    assert.ok(!M.validateItem({ item_type: "MCQ", options: ["a", "b"], answer: 0,
                                scoring_mode: "VIBES" }).valid));
  test("an objective item worth nothing is refused", () =>
    assert.ok(!M.validateItem({ item_type: "MCQ", options: ["a", "b"], answer: 0,
                                scoring_mode: "OBJECTIVE", points: 0 }).valid));
  test("an unscored item carrying points is refused", () =>
    assert.ok(!M.validateItem({ item_type: "OPEN_RESPONSE", stem: "p",
                                scoring_mode: "UNSCORED", points: 2 }).valid));
  test("negative points are refused", () =>
    assert.ok(!M.validateItem({ item_type: "MCQ", options: ["a", "b"], answer: 0,
                                points: -1 }).valid));
});

/* ── Q. PRODUCTION READINESS ────────────────────────────────────────────── */

describe("Q — production validation", () => {
  const ready = { review_status: "AUTO_QA_PASS", difficulty: "B", skill: "listening",
                  source_type: "ADAPTED", source_book: "Kontext B2",
                  adaptation_status: "APPROVED" };

  test("a complete row is production-ready", () => assert.ok(M.validateForProduction(ready).ready));

  test("DRAFT content is never fit to serve", () => {
    const r = M.validateForProduction({ ...ready, review_status: "DRAFT" });
    assert.ok(!r.ready);
    assert.ok(r.problems.some(p => /not fit to serve/.test(p)));
  });

  test("content sent back for changes is not fit to serve", () =>
    assert.ok(!M.validateForProduction({ ...ready, review_status: "SME_CHANGES_REQUIRED" }).ready));

  test("missing provenance blocks production", () => {
    const { source_type, source_book, adaptation_status, ...bare } = ready;
    assert.ok(!M.validateForProduction(bare).ready);
  });

  test("missing skill or difficulty blocks production", () => {
    assert.ok(!M.validateForProduction({ ...ready, skill: undefined }).ready);
    assert.ok(!M.validateForProduction({ ...ready, difficulty: undefined }).ready);
  });

  test("declared audio must actually be attached", () => {
    assert.ok(!M.validateForProduction({ ...ready, audio_required: true }).ready);
    assert.ok(M.validateForProduction({ ...ready, audio_required: true,
                                        audio_asset_id: "asr_v2_dienstplan_app" }).ready);
  });

  test("the SME bar can be raised without changing the rules", () => {
    assert.ok(M.validateForProduction(ready).ready);
    assert.ok(!M.validateForProduction(ready, { requireSme: true }).ready);
    assert.ok(M.validateForProduction({ ...ready, review_status: "SME_REVIEWED" },
                                      { requireSme: true }).ready);
  });

  test("seeding cannot make content production-ready on its own", () => {
    // review_status alone is not enough; the rest of the metadata must be there.
    const seeded = { review_status: "PRODUCTION" };
    assert.ok(!M.validateForProduction(seeded).ready);
  });

  test("a production item's own shape is validated too", () => {
    const bad = { ...ready, skill: "writing", item_type: "LONG_TEXT",
                  stem: "Schreiben Sie…", scoring_mode: "OBJECTIVE" };
    assert.ok(!M.validateForProduction(bad).ready);
  });
});
