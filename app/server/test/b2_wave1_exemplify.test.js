const { test, describe, beforeEach, after } = require("node:test");
const assert = require("node:assert");
const pool = require("../src/db/pool");
const tasks = require("../src/b2/task_profiles");
const caps = require("../src/b2/capabilities");
const { listTopics } = require("../src/b2/curriculum");
const profile_ = require("../src/b2/profile");
const { EXEMPLIFY_TOPIC } = require("../src/seed/seed_b2_wave1");

describe("Wave 1 Step 5: exemplify (b2_beispiel_geben)", () => {
  const TEST_USER = 9105;

  beforeEach(async () => {
    await pool.query("INSERT INTO users (id, name, plan) VALUES ($1, 'Test User 9105', 'trial') ON CONFLICT (id) DO NOTHING", [TEST_USER]);
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [TEST_USER]);
  });

  after(async () => {
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [TEST_USER]);
    await pool.query("DELETE FROM users WHERE id=$1", [TEST_USER]);
  });

  test("topic structure and pedagogy contract", () => {
    assert.strictEqual(EXEMPLIFY_TOPIC.id, "b2_beispiel_geben");
    assert.strictEqual(EXEMPLIFY_TOPIC.title, "Ein Argument konkret belegen");
    assert.strictEqual(EXEMPLIFY_TOPIC.order_index, 15);

    const steps = EXEMPLIFY_TOPIC.subs[0].steps;
    assert.strictEqual(steps.length, 3);

    const produceStep = steps.find(s => s.experienceId === "exp_beispiel_geben");
    assert.ok(produceStep, "produce step must exist");
    assert.strictEqual(produceStep.taskType, "beispiel");
    assert.strictEqual(produceStep.minWords, 60);
    assert.ok(produceStep.capabilities.includes("exemplify"));
  });

  test("curriculum registers topic with Writing track and 10 min duration", async () => {
    const list = await listTopics(TEST_USER);
    const item = list.find(t => t.id === "b2_beispiel_geben");
    assert.ok(item, "b2_beispiel_geben must be in live curriculum");
    assert.strictEqual(item.track, "writing", "must map to writing track");
    assert.strictEqual(item.minutes, 10);
  });

  test("evaluator accepts grounded concrete example with situational context and outcome", () => {
    const goodText =
      "Ich teile Franks Bedenken nicht, denn die gemeinsame Übergabe am Krankenbett stärkt die Patientensicherheit erheblich. " +
      "Dieser Einwand greift zu kurz, da Patienten wichtige Beobachtungen beitragen können. " +
      "Als konkretes Beispiel lässt sich ein Vorfall aus der letzten Woche anführen: " +
      "Bei einer älteren Dame auf unserer Station fiel während der gemeinsamen Übergabe sofort auf, dass die verordnete Schmerzdosis vertauscht worden war. " +
      "Die Patientin konnte den Fehler direkt ansprechen, sodass eine Fehlmedikation rechtzeitig verhindert wurde.";

    const res = tasks.assessForTask(goodText, { task_type: "beispiel" });
    const exFinding = res.findings.find(f => f.check_id === "concrete_example");

    assert.ok(exFinding, "concrete_example check must run for beispiel profile");
    assert.strictEqual(exFinding.state, "pass");
    assert.strictEqual(caps.capabilityForCheck("concrete_example"), "exemplify");
  });

  test("evaluator explicitly rejects tautological slogan 'Zum Beispiel ist Kommunikation wichtig'", () => {
    const tautologyText =
      "Ich stimme Frank nicht zu, weil die Übergabe am Bett wichtig ist. " +
      "Zum Beispiel ist Kommunikation wichtig. Wir sollten immer gut kommunizieren.";

    const res = tasks.assessForTask(tautologyText, { task_type: "beispiel" });
    const exFinding = res.findings.find(f => f.check_id === "concrete_example");

    assert.ok(exFinding);
    assert.strictEqual(exFinding.state, "fail");
    assert.ok(exFinding.detail.includes("rein abstrakt"), "Must specifically reject empty/abstract examples");
  });

  test("evaluator warns on incomplete example missing narrative outcome detail", () => {
    const incompleteText =
      "Franks Einwand überzeugt mich nicht, denn die Visite am Bett hat klare Vorteile. " +
      "Beispielsweise erlebte ich das neulich bei einem Patienten auf unserer Station. " +
      "Deshalb sollten wir dieses Modell auf jeden Fall beibehalten.";

    const res = tasks.assessForTask(incompleteText, { task_type: "beispiel" });
    const exFinding = res.findings.find(f => f.check_id === "concrete_example");

    assert.ok(exFinding);
    assert.strictEqual(exFinding.state, "warn");
    assert.ok(exFinding.evidence.some(e => e.includes("Ausgang") || e.includes("Verlauf")));
  });

  test("evaluator flags pure assertion with zero examples as failed", () => {
    const assertionText =
      "Franks Argument ist falsch. Die Übergabe am Bett dauert gar nicht länger. " +
      "Die Patienten fühlen sich viel besser informiert und das Team arbeitet professioneller. " +
      "Wir sollten die Übergabe sofort so umsetzen.";

    const res = tasks.assessForTask(assertionText, { task_type: "beispiel" });
    const exFinding = res.findings.find(f => f.check_id === "concrete_example");

    assert.ok(exFinding);
    assert.strictEqual(exFinding.state, "fail");
    assert.ok(exFinding.detail.includes("Kein konkretes Beispiel"));
  });

  test("database evidence persistence records exemplify capability with weight 1.0", async () => {
    const text =
      "Ich widerspreche Frank: Die Übergabe am Bett schützt vor Missverständnissen. " +
      "Ein anschauliches Beispiel zeigte sich neulich bei einer Patientin auf Station: " +
      "Dabei fiel auf, dass eine Allergie im Plan fehlte, was rechtzeitig gelöst werden konnte.";

    const res = tasks.assessForTask(text, { task_type: "beispiel" });
    const findings = res.findings;

    await profile_.recordMany(TEST_USER, findings.map(f => ({
      dimension: "writing",
      checkId: f.check_id,
      capability: caps.capabilityForCheck(f.check_id),
      outcome: f.state === "pass" ? 1 : f.state === "warn" ? 0.5 : 0,
      weight: res.profile.evidenceWeight,
      sourceKind: "experience",
      sourceRef: "exp_beispiel_geben",
      detail: f.detail,
    })));

    const { rows } = await pool.query(
      `SELECT * FROM b2_evidence WHERE user_id=$1 AND capability='exemplify'`,
      [TEST_USER]
    );

    assert.ok(rows.length > 0, "b2_evidence must record exemplify evidence");
    assert.strictEqual(rows[0].dimension, "writing");
    assert.strictEqual(rows[0].weight, 1.0);
    assert.strictEqual(rows[0].source_ref, "exp_beispiel_geben");
  });
});
