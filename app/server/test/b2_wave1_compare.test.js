const { test, describe, beforeEach, after } = require("node:test");
const assert = require("node:assert");
const pool = require("../src/db/pool");
const tasks = require("../src/b2/task_profiles");
const caps = require("../src/b2/capabilities");
const { listTopics } = require("../src/b2/curriculum");
const profile_ = require("../src/b2/profile");
const { COMPARE_TOPIC } = require("../src/seed/seed_b2_wave1");

describe("Wave 1 Step 3: compare (b2_dienstplan_vergleich)", () => {
  const TEST_USER = 9103;

  beforeEach(async () => {
    await pool.query("INSERT INTO users (id, name, plan) VALUES ($1, 'Test User 9103', 'trial') ON CONFLICT (id) DO NOTHING", [TEST_USER]);
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [TEST_USER]);
  });

  after(async () => {
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [TEST_USER]);
    await pool.query("DELETE FROM users WHERE id=$1", [TEST_USER]);
  });

  test("topic structure and pedagogy contract", () => {
    assert.strictEqual(COMPARE_TOPIC.id, "b2_dienstplan_vergleich");
    assert.strictEqual(COMPARE_TOPIC.title, "Zwei Modelle für die Dienstplanung");
    assert.strictEqual(COMPARE_TOPIC.order_index, 13);

    const steps = COMPARE_TOPIC.subs[0].steps;
    assert.strictEqual(steps.length, 3);

    const produceStep = steps.find(s => s.experienceId === "exp_dienstplan_vergleich");
    assert.ok(produceStep, "produce step must exist");
    assert.strictEqual(produceStep.taskType, "vergleich");
    assert.strictEqual(produceStep.minWords, 60);
    assert.ok(produceStep.capabilities.includes("compare"));
  });

  test("curriculum registers topic with Writing track and 10 min duration", async () => {
    const list = await listTopics(TEST_USER);
    const item = list.find(t => t.id === "b2_dienstplan_vergleich");
    assert.ok(item, "b2_dienstplan_vergleich must be in live curriculum");
    assert.strictEqual(item.track, "writing", "must map to writing track");
    assert.strictEqual(item.minutes, 10);
  });

  test("evaluator accepts structured two-sided comparison with pro/con and preference", () => {
    const goodText =
      "Einerseits bietet Modell A verlässliche Arbeitszeiten und feste Rhythmen für das gesamte Pflegeteam. " +
      "Andererseits hat Modell B den entscheidenden Vorteil einer deutlich höheren Flexibilität bei persönlichen Terminen. " +
      "Ein wesentlicher Nachteil von Modell B liegt jedoch im höheren Abstimmungsaufwand und unruhigeren Übergaben. " +
      "Im Vergleich beider Systeme bevorzuge ich eine sinnvolle Kombination: eine feste Kernbesetzung nach Modell A, " +
      "ergänzt durch flexible Wunschdienste für das Wochenende.";

    const res = tasks.assessForTask(goodText, { task_type: "vergleich" });
    const compFinding = res.findings.find(f => f.check_id === "comparative_structure");

    assert.ok(compFinding, "comparative_structure check must run for vergleich profile");
    assert.strictEqual(compFinding.state, "pass");
    assert.strictEqual(caps.capabilityForCheck("comparative_structure"), "compare");
  });

  test("evaluator warns on partial comparison missing explicit pro/con evaluation", () => {
    const partialText =
      "Im Vergleich zu Modell A hat Modell B ganz andere Dienstzeiten auf der Station. " +
      "Während Modell A fünf feste Arbeitstage vorsieht, arbeiten die Kollegen in Modell B nach einem flexiblen Springerplan. " +
      "Ich halte Modell A für die bessere Option für unsere Station.";

    const res = tasks.assessForTask(partialText, { task_type: "vergleich" });
    const compFinding = res.findings.find(f => f.check_id === "comparative_structure");

    assert.ok(compFinding);
    assert.strictEqual(compFinding.state, "warn");
    assert.ok(compFinding.evidence.some(e => e.includes("Vor- und Nachteile")));
  });

  test("evaluator flags unstructured list with neither contrast nor balancing", () => {
    const flatListText =
      "Modell A hat Frühdienst, Spätdienst und Nachtdienst. Die Kollegen arbeiten viel auf der Station. " +
      "Modell B hat auch Schichten und einen Computerplan. Alle müssen pünktlich zur Übergabe kommen. " +
      "Das Krankenhaus hat viele Patienten.";

    const res = tasks.assessForTask(flatListText, { task_type: "vergleich" });
    const compFinding = res.findings.find(f => f.check_id === "comparative_structure");

    assert.ok(compFinding);
    assert.strictEqual(compFinding.state, "fail");
    assert.ok(compFinding.detail.includes("Reine Aufzählung"));
  });

  test("database evidence persistence records compare capability with weight 1.0", async () => {
    const text =
      "Einerseits garantiert Modell A geregelte Erholungsphasen. Andererseits bietet Modell B den klaren Vorteil individueller Autonomie. " +
      "Nachteilig ist allerdings der erhöhte Koordinationsbedarf. Als Kompromiss schlage ich eine Kombination beider Ansätze vor.";

    const res = tasks.assessForTask(text, { task_type: "vergleich" });
    const findings = res.findings;

    await profile_.recordMany(TEST_USER, findings.map(f => ({
      dimension: "writing",
      checkId: f.check_id,
      capability: caps.capabilityForCheck(f.check_id),
      outcome: f.state === "pass" ? 1 : f.state === "warn" ? 0.5 : 0,
      weight: res.profile.evidenceWeight,
      sourceKind: "experience",
      sourceRef: "exp_dienstplan_vergleich",
      detail: f.detail,
    })));

    const { rows } = await pool.query(
      `SELECT * FROM b2_evidence WHERE user_id=$1 AND capability='compare'`,
      [TEST_USER]
    );

    assert.ok(rows.length > 0, "b2_evidence must record compare evidence");
    assert.strictEqual(rows[0].dimension, "writing");
    assert.strictEqual(rows[0].weight, 1.0);
    assert.strictEqual(rows[0].source_ref, "exp_dienstplan_vergleich");
  });
});
