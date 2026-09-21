const { test, describe, beforeEach, after } = require("node:test");
const assert = require("node:assert");
const pool = require("../src/db/pool");
const tasks = require("../src/b2/task_profiles");
const caps = require("../src/b2/capabilities");
const { listTopics } = require("../src/b2/curriculum");
const profile_ = require("../src/b2/profile");
const { REGISTER_TOPIC } = require("../src/seed/seed_b2_wave1");

describe("Wave 1 Step 2: adapt_register (b2_register_aufklaerung)", () => {
  const TEST_USER = 9102;

  beforeEach(async () => {
    await pool.query("INSERT INTO users (id, name, plan) VALUES ($1, 'Test User 9102', 'trial') ON CONFLICT (id) DO NOTHING", [TEST_USER]);
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [TEST_USER]);
  });

  after(async () => {
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [TEST_USER]);
    await pool.query("DELETE FROM users WHERE id=$1", [TEST_USER]);
  });

  test("topic structure and pedagogy contract", () => {
    assert.strictEqual(REGISTER_TOPIC.id, "b2_register_aufklaerung");
    assert.strictEqual(REGISTER_TOPIC.title, "Für den Arzt oder für den Patienten?");
    assert.strictEqual(REGISTER_TOPIC.order_index, 12);

    const steps = REGISTER_TOPIC.subs[0].steps;
    assert.strictEqual(steps.length, 4);

    const part1 = steps.find(s => s.experienceId === "exp_register_arzt");
    const part2 = steps.find(s => s.experienceId === "exp_register_patient");

    assert.ok(part1, "Part 1 (Arzt Übergabe) must exist");
    assert.strictEqual(part1.taskType, "workplace");
    assert.strictEqual(part1.minWords, 35);
    assert.ok(part1.capabilities.includes("adapt_register"));

    assert.ok(part2, "Part 2 (Patientin Aufklärung) must exist");
    assert.strictEqual(part2.taskType, "patientenkommunikation");
    assert.strictEqual(part2.minWords, 40);
    assert.ok(part2.capabilities.includes("adapt_register"));
  });

  test("curriculum registers topic with Language track and 10 min duration", async () => {
    const list = await listTopics(TEST_USER);
    const item = list.find(t => t.id === "b2_register_aufklaerung");
    assert.ok(item, "b2_register_aufklaerung must be in live curriculum");
    assert.strictEqual(item.track, "grammar", "must map to grammar/language track");
    assert.strictEqual(item.minutes, 10);
  });

  test("Part 1 evaluator detects clinical reporting style (passive, nominal, lexis)", () => {
    const goodDoctorText =
      "Postoperativ entwickelte die Patientin einen akuten Harnverhalt mit 650 ml Restharn. " +
      "Nach steriler Katheterisierung wurden 600 ml Urin erfolgreich entleert. " +
      "Aufgrund einer laborchemisch festgestellten Hypokaliämie von 3,1 mmol/l wurde eine intravenöse Infusion verordnet. " +
      "Der Allgemeinzustand ist stabil.";

    const res = tasks.assessForTask(goodDoctorText, { task_type: "workplace" });
    const regFinding = res.findings.find(f => f.check_id === "professional_register");

    assert.ok(regFinding, "professional_register must be assessed for workplace");
    assert.strictEqual(regFinding.state, "pass");
    assert.ok(regFinding.detail.includes("Passiv"));
    assert.ok(regFinding.detail.includes("nominale Fügung"));

    assert.strictEqual(caps.capabilityForCheck("professional_register"), "adapt_register");
  });

  test("Part 1 evaluator flags lack of professional register on informal text", () => {
    const poorText =
      "Frau Sommer konnte in der Nacht gar nicht mehr pinkeln und hatte große Schmerzen im Bauch. " +
      "Ich habe dann schnell einen Katheter reingemacht und das Kalium war auch ziemlich niedrig. " +
      "Sie kriegt jetzt eine Infusion von uns.";

    const res = tasks.assessForTask(poorText, { task_type: "workplace" });
    const regFinding = res.findings.find(f => f.check_id === "professional_register");

    assert.ok(regFinding);
    assert.notStrictEqual(regFinding.state, "pass", "Informal text must not pass professional_register");
  });

  test("Part 2 evaluator scores patient communication and records adapt_register evidence", async () => {
    const patientText =
      "Guten Morgen Frau Sommer, ich möchte Ihnen kurz erklären, was heute Nacht passiert ist. " +
      "Nach der Operation und der Narkose braucht die Blase manchmal etwas Zeit, um wieder richtig zu arbeiten. " +
      "Deshalb hat sich der Urin gestaut und der Bauch hat gespannt. " +
      "Wir haben Ihnen mit einem kleinen Schlauch geholfen, damit der Druck sofort nachlässt. " +
      "Außerdem war ein wichtiger Mineralstoff im Blut ein bisschen zu niedrig, deshalb bekommen Sie jetzt diese Infusion zur Stärkung. " +
      "Sie brauchen sich keine Sorgen zu machen.";

    const res = tasks.assessForTask(patientText, { task_type: "patientenkommunikation", target_words: 40 });
    const patFinding = res.findings.find(f => f.check_id === "patient_register");
    assert.ok(patFinding, "patient_register check must run");
    assert.strictEqual(patFinding.state, "pass");

    const findings = res.findings;

    // Record findings into database
    await profile_.recordMany(TEST_USER, findings.map(f => ({
      dimension: "writing",
      checkId: f.check_id,
      capability: caps.capabilityForCheck(f.check_id),
      outcome: f.state === "pass" ? 1 : f.state === "warn" ? 0.5 : 0,
      weight: 0.6,
      sourceKind: "experience",
      sourceRef: "exp_register_patient",
      detail: f.detail,
    })));

    const { rows } = await pool.query(
      `SELECT * FROM b2_evidence WHERE user_id=$1 AND capability='adapt_register'`,
      [TEST_USER]
    );

    assert.ok(rows.length > 0, "Evidence for adapt_register must be recorded in b2_evidence");
    assert.strictEqual(rows[0].dimension, "writing");
    assert.strictEqual(rows[0].weight, 0.6);
  });
});
