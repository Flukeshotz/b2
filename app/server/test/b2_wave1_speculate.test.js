const { test, describe, beforeEach, after } = require("node:test");
const assert = require("node:assert");
const pool = require("../src/db/pool");
const tasks = require("../src/b2/task_profiles");
const caps = require("../src/b2/capabilities");
const { listTopics } = require("../src/b2/curriculum");
const profile_ = require("../src/b2/profile");
const { SPECULATE_TOPIC } = require("../src/seed/seed_b2_wave1");

describe("Wave 1 Step 4: speculate (b2_fall_spekulation)", () => {
  const TEST_USER = 9104;

  beforeEach(async () => {
    await pool.query("INSERT INTO users (id, name, plan) VALUES ($1, 'Test User 9104', 'trial') ON CONFLICT (id) DO NOTHING", [TEST_USER]);
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [TEST_USER]);
  });

  after(async () => {
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [TEST_USER]);
    await pool.query("DELETE FROM users WHERE id=$1", [TEST_USER]);
  });

  test("topic structure and pedagogy contract", () => {
    assert.strictEqual(SPECULATE_TOPIC.id, "b2_fall_spekulation");
    assert.strictEqual(SPECULATE_TOPIC.title, "Was könnte passiert sein?");
    assert.strictEqual(SPECULATE_TOPIC.order_index, 14);

    const steps = SPECULATE_TOPIC.subs[0].steps;
    assert.strictEqual(steps.length, 3);

    const produceStep = steps.find(s => s.experienceId === "exp_fall_spekulation");
    assert.ok(produceStep, "produce step must exist");
    assert.strictEqual(produceStep.taskType, "spekulation");
    assert.strictEqual(produceStep.minWords, 60);
    assert.ok(produceStep.capabilities.includes("speculate"));
  });

  test("curriculum registers topic with Writing track and 10 min duration", async () => {
    const list = await listTopics(TEST_USER);
    const item = list.find(t => t.id === "b2_fall_spekulation");
    assert.ok(item, "b2_fall_spekulation must be in live curriculum");
    assert.strictEqual(item.track, "writing", "must map to writing track");
    assert.strictEqual(item.minutes, 10);
  });

  test("evaluator accepts hypothesis framing with fact separation and graded probability", () => {
    const goodText =
      "Fest steht, dass Herr Berg um 19:15 Uhr desorientiert im Flur angetroffen wurde und die Nadel disloziert war. " +
      "Unklar ist jedoch, wann er das Zimmer verlassen hat. " +
      "Eine erste plausible Hypothese ist, dass er infolge des gestrigen Stationswechsels ein akutes Durchgangssyndrom entwickelt hat. " +
      "Möglicherweise ist er in Panik aufgestanden und mit dem Infusionsschlauch hängengeblieben. " +
      "Eine zweite denkbare Erklärung wäre, dass er wegen der fixen Idee an den Herd die Nadel selbst entfernt hat. " +
      "Das könnte auch die Blutflecken am Ärmel erklären.";

    const res = tasks.assessForTask(goodText, { task_type: "spekulation" });
    const specFinding = res.findings.find(f => f.check_id === "speculative_language");

    assert.ok(specFinding, "speculative_language check must run for spekulation profile");
    assert.strictEqual(specFinding.state, "pass");
    assert.strictEqual(caps.capabilityForCheck("speculative_language"), "speculate");
  });

  test("evaluator warns on incomplete speculation missing fact/assumption separation", () => {
    const partialText =
      "Herr Berg könnte verwirrt gewesen sein und ist vielleicht deshalb aufgestanden. " +
      "Eine andere Erklärung wäre, dass er Angst um seine Wohnung hatte und nach Hause wollte. " +
      "Möglicherweise hat er die Nadel abgerissen.";

    const res = tasks.assessForTask(partialText, { task_type: "spekulation" });
    const specFinding = res.findings.find(f => f.check_id === "speculative_language");

    assert.ok(specFinding);
    assert.strictEqual(specFinding.state, "warn");
    assert.ok(specFinding.evidence.some(e => e.includes("Fakten")));
  });

  test("evaluator flags pure assertion with no uncertainty markers as failed speculation", () => {
    const flatText =
      "Herr Berg ist aus dem Bett aufgestanden. Er hat die Nadel herausgezogen. " +
      "Er wollte nach Hause fahren, weil der Herd noch an ist. " +
      "Er hat Blut am Ärmel und war um 19:15 Uhr im Flur.";

    const res = tasks.assessForTask(flatText, { task_type: "spekulation" });
    const specFinding = res.findings.find(f => f.check_id === "speculative_language");

    assert.ok(specFinding);
    assert.strictEqual(specFinding.state, "fail");
    assert.ok(specFinding.detail.includes("Keine Hypothesenbildung"));
  });

  test("database evidence persistence records speculate capability with weight 1.0", async () => {
    const text =
      "Sicher ist nur, dass die Nadel disloziert war. Unklar ist der Hergang. " +
      "Vermutlich ist Herr Berg verwirrt aufgestanden. Eine denkbare Ursache wäre ein Delir nach Verlegung.";

    const res = tasks.assessForTask(text, { task_type: "spekulation" });
    const findings = res.findings;

    await profile_.recordMany(TEST_USER, findings.map(f => ({
      dimension: "writing",
      checkId: f.check_id,
      capability: caps.capabilityForCheck(f.check_id),
      outcome: f.state === "pass" ? 1 : f.state === "warn" ? 0.5 : 0,
      weight: res.profile.evidenceWeight,
      sourceKind: "experience",
      sourceRef: "exp_fall_spekulation",
      detail: f.detail,
    })));

    const { rows } = await pool.query(
      `SELECT * FROM b2_evidence WHERE user_id=$1 AND capability='speculate'`,
      [TEST_USER]
    );

    assert.ok(rows.length > 0, "b2_evidence must record speculate evidence");
    assert.strictEqual(rows[0].dimension, "writing");
    assert.strictEqual(rows[0].weight, 1.0);
    assert.strictEqual(rows[0].source_ref, "exp_fall_spekulation");
  });
});
