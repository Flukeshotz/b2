const { test, describe, beforeEach, after } = require("node:test");
const assert = require("node:assert");
const tasks = require("../src/b2/task_profiles");
const maya = require("../src/b2/maya");
const unerwartet = require("../src/seed/b2/maya/unerwartet");
const pool = require("../src/db/pool");

describe("Wave 1 Adversarial & Boundary Test Suite", () => {
  const TEST_USER = 9106;

  beforeEach(async () => {
    await pool.query("INSERT INTO users (id, name, plan) VALUES ($1, 'Test User 9106', 'trial') ON CONFLICT (id) DO NOTHING", [TEST_USER]);
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [TEST_USER]);
  });

  after(async () => {
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [TEST_USER]);
    await pool.query("DELETE FROM users WHERE id=$1", [TEST_USER]);
  });

  /* ──────────────────────────────────────────────────────────────────────────
     1. react_unexpected (maya_unerwartet)
     ────────────────────────────────────────────────────────────────────────── */
  describe("1. react_unexpected (Maya Scenario 4)", () => {
    test("A. Strong valid response halts paperwork and prioritises medical triage", () => {
      const state = { current_beat: "b2_unexpected_turn", press_count: 0, learner_turns_count: 1 };
      const turn = maya.readTurn("Nein, Herr Weber, das geht auf keinen Fall. Die Papiere warten jetzt, akute Atemnot hat absolute Priorität. Ich begleite Sie sofort zu ihm, messe die Vitalwerte und verständige den Dienstarzt.");
      const res = maya.nextMove(unerwartet, state, turn);

      assert.strictEqual(res.state.memory.unexpected_handled, true);
      assert.strictEqual(res.state.current_beat, "b3_clarify_and_triage");
      assert.strictEqual(!!res.trapTriggered, false, "Must not trigger blind agreement trap");
    });

    test("B. Weak/vague response triggers pushback press turn", () => {
      const state = { current_beat: "b2_unexpected_turn", press_count: 0, learner_turns_count: 1 };
      const turn = maya.readTurn("Mal sehen.");
      const res = maya.nextMove(unerwartet, state, turn);

      assert.strictEqual(res.state.current_beat, "b2_unexpected_turn");
      assert.strictEqual(res.state.press_count, 1);
      assert.strictEqual(res.pressing, true);
      assert.strictEqual(!!res.trapTriggered, false);
    });

    test("C. Keyword-stuffed blind agreement triggers the trap and fails", () => {
      const state = { current_beat: "b2_unexpected_turn", press_count: 0, learner_turns_count: 1 };
      const turn = maya.readTurn("Ja gerne, das passt, füllen wir erst schnell die Papiere fertig aus.");
      const res = maya.nextMove(unerwartet, state, turn);

      assert.strictEqual(res.trapTriggered, true, "Must trigger trap");
      assert.strictEqual(res.outcome, "trap_accepted");

      const summary = maya.summarise(unerwartet, [
        { text: "Guten Tag. Wir gehen die Dokumente der Reihe nach durch, weil das wichtig ist.", beat: "b1_admission_start" },
        { text: turn.text, beat: "b2_unexpected_turn" },
      ], res.state);
      assert.strictEqual(summary.trapTriggered, true);
      const reactEv = summary.evidence.find(e => e.capability === "react_unexpected");
      assert.strictEqual(reactEv.outcome, 0.3, "Fell into trap must yield outcome 0.3");
    });

    test("D. Strong alternative phrasing safely navigates unexpected turn", () => {
      const state = { current_beat: "b2_unexpected_turn", press_count: 0, learner_turns_count: 1 };
      const altTurn = maya.readTurn("Nein, das geht nicht! Die Formulare füllen wir später aus, die Gesundheit Ihres Vaters geht jetzt vor. Kommen Sie, wir gehen direkt zu ihm.");
      const res = maya.nextMove(unerwartet, state, altTurn);

      assert.strictEqual(res.state.memory.unexpected_handled, true);
      assert.strictEqual(res.state.current_beat, "b3_clarify_and_triage");
      assert.strictEqual(!!res.trapTriggered, false);
    });

    test("E. Boundary case: hesitation with reservation avoids blind trap", () => {
      const state = { current_beat: "b2_unexpected_turn", press_count: 0, learner_turns_count: 1 };
      const turn = maya.readTurn("Das klingt nicht gut, aber vielleicht sollten wir kurz die Unterschrift machen?");
      const res = maya.nextMove(unerwartet, state, turn);

      assert.strictEqual(!!res.trapTriggered, false);
      assert.strictEqual(res.state.current_beat, "b2_unexpected_turn");
    });
  });

  /* ──────────────────────────────────────────────────────────────────────────
     2. adapt_register (b2_register_aufklaerung)
     ────────────────────────────────────────────────────────────────────────── */
  describe("2. adapt_register (Professional vs. Patient Register)", () => {
    test("A. Strong valid responses pass both registers", () => {
      const doctorText =
        "Postoperativ entwickelte die Patientin einen akuten Harnverhalt mit 650 ml Restharn. " +
        "Nach steriler Katheterisierung wurden 600 ml Urin erfolgreich entleert. " +
        "Aufgrund einer laborchemisch festgestellten Hypokaliämie von 3,1 mmol/l wurde eine intravenöse Infusion verordnet. " +
        "Der Allgemeinzustand ist stabil.";
      const resDoc = tasks.assessForTask(doctorText, { task_type: "workplace", target_words: 35 });
      const fDoc = resDoc.findings.find(f => f.check_id === "professional_register");
      assert.strictEqual(fDoc.state, "pass");

      const patientText =
        "Guten Morgen, Frau Sommer. Sie hatten heute Nacht Probleme beim Wasserlassen, weil sich nach der Operation die Blase nicht von selbst entleert hat. " +
        "Das kommt nach einer Narkose häufig vor. Wir haben Ihnen mit einem kleinen Schlauch geholfen und den Urin abgelassen, damit der Druck nachlässt. " +
        "Außerdem ist Ihr Kaliumwert ein wenig niedrig, weshalb Sie jetzt eine Infusion bekommen. Machen Sie sich keine Sorgen, Sie sind bei uns in guten Händen.";
      const resPat = tasks.assessForTask(patientText, { task_type: "patientenkommunikation", target_words: 40 });
      const fPat = resPat.findings.find(f => f.check_id === "patient_register");
      assert.strictEqual(fPat.state, "pass");
    });

    test("B. Weak/generic response fails or warns", () => {
      const poorDoc =
        "Frau Sommer konnte in der Nacht gar nicht mehr pinkeln und hatte Schmerzen. " +
        "Ich habe dann schnell einen Katheter reingemacht und das Kalium war auch niedrig.";
      const resDoc = tasks.assessForTask(poorDoc, { task_type: "workplace", target_words: 35 });
      const fDoc = resDoc.findings.find(f => f.check_id === "professional_register");
      assert.notStrictEqual(fDoc.state, "pass");

      const poorPat =
        "Guten Tag Frau Sommer. Die Nacht war lang und anstrengend. " +
        "Bitte bleiben Sie ruhig im Bett liegen und rufen Sie uns, wenn etwas ist.";
      const resPat = tasks.assessForTask(poorPat, { task_type: "patientenkommunikation", target_words: 40 });
      const fPat = resPat.findings.find(f => f.check_id === "patient_register");
      assert.notStrictEqual(fPat.state, "pass");
    });

    test("C. Keyword-stuffed nonsense and untranslated jargon fail", () => {
      // 1. Isolated noun fragments with no conjugated verbs
      const nounFragments = "Bei Aufnahme. Nach Katheterisierung. Zur Infusion. Hinsichtlich Restharn. Bezüglich Befund.";
      const resFrag = tasks.assessForTask(nounFragments, { task_type: "workplace", target_words: 35 });
      const fFrag = resFrag.findings.find(f => f.check_id === "professional_register");
      assert.strictEqual(fFrag.state, "fail", "Disembodied noun fragments must fail professional register");

      // 2. Patient jargon trap: untranslated raw chart abbreviations
      const rawJargon =
        "Frau Sommer, bei Ihnen lag postoperativ ein Z. n. Knie-OP und akuter Harnverhalt mit 650 ml Restharn vor. " +
        "Nach steriler Einmalkatheterisierung flossen 600 ml ab. Zudem besteht eine Hypokaliämie von 3,1 mmol/l, weshalb wir intervenieren müssen.";
      const resJargon = tasks.assessForTask(rawJargon, { task_type: "patientenkommunikation", target_words: 40 });
      const fJargon = resJargon.findings.find(f => f.check_id === "patient_register");
      assert.strictEqual(fJargon.state, "fail", "Untranslated chart jargon must fail patient register");

      // 3. Keyword soup
      const soup = "Frau Sommer Sie Blase Urin Katheter Infusion Kalium keine Sorge.";
      const resSoup = tasks.assessForTask(soup, { task_type: "patientenkommunikation", target_words: 40 });
      const fSoup = resSoup.findings.find(f => f.check_id === "patient_register");
      assert.strictEqual(fSoup.state, "fail", "Keyword soup must fail patient register");
    });

    test("D. Strong alternative phrasing passes patient register", () => {
      const altPatient =
        "Hallo Frau Sommer, ich möchte Ihnen kurz erklären, warum der Tropf hier angehängt wurde. " +
        "Ihr Körper braucht nach dem gestrigen Eingriff noch etwas Unterstützung, da die Blase den Urin zurückgehalten hat. " +
        "Wir konnten das Problem mit einem kleinen Schlauch schnell lösen. Die Infusion gleicht nun wichtige Salze in Ihrem Blut aus. " +
        "Machen Sie sich bitte keine Gedanken, das bessert sich rasch.";
      const res = tasks.assessForTask(altPatient, { task_type: "patientenkommunikation", target_words: 40 });
      const f = res.findings.find(x => x.check_id === "patient_register");
      assert.strictEqual(f.state, "pass");
    });

    test("E. Boundary case: missing direct patient address produces warning/failure", () => {
      const noAddress =
        "Nach der Operation hat sich der Urin in der Blase gestaut, sodass ein Schlauch zur Entleerung nötig war. " +
        "Jetzt läuft eine Infusion, um die Salze im Blut auszugleichen. Es besteht keine Sorge.";
      const res = tasks.assessForTask(noAddress, { task_type: "patientenkommunikation", target_words: 40 });
      const f = res.findings.find(x => x.check_id === "patient_register");
      assert.notStrictEqual(f.state, "pass", "Explanation without direct address must not pass");
    });
  });

  /* ──────────────────────────────────────────────────────────────────────────
     3. compare (b2_dienstplan_vergleich)
     ────────────────────────────────────────────────────────────────────────── */
  describe("3. compare (Two Shift Models)", () => {
    test("A. Strong valid response compares both models with pros, cons and preference", () => {
      const text =
        "In unserer Klinik werden derzeit zwei Modelle für die Dienstplanung diskutiert: Modell A mit 12-Stunden-Schichten und Modell B als klassisches 3-Schicht-System. " +
        "Modell A bietet den Vorteil von mehr zusammenhängenden freien Tagen, führt jedoch zu einer höheren Belastung am einzelnen Arbeitstag. " +
        "Modell B hingegen verteilt die Arbeitszeit gleichmäßiger, bedeutet aber häufigere Schichtwechsel. " +
        "Meiner Ansicht nach ist ein Kompromiss sinnvoll, bei dem 12-Stunden-Dienste nur an Wochenenden eingesetzt werden.";
      const res = tasks.assessForTask(text, { task_type: "vergleich", target_words: 60 });
      const f = res.findings.find(x => x.check_id === "comparative_structure");
      assert.strictEqual(f.state, "pass");
    });

    test("B. Weak response missing one model produces warning", () => {
      const text =
        "Ich finde das 12-Stunden-Modell sehr interessant. Es hat viele Vorteile für die Mitarbeiter, weil man längere Freizeitphasen genießen kann. " +
        "Allerdings ist der Nachteil, dass man nach zwölf Stunden sehr erschöpft ist. Deshalb befürworte ich diese Lösung für unser Team.";
      const res = tasks.assessForTask(text, { task_type: "vergleich", target_words: 60 });
      const f = res.findings.find(x => x.check_id === "comparative_structure");
      assert.strictEqual(f.state, "warn");
      assert.ok(f.detail.includes("beide Modelle"));
    });

    test("C. Keyword-stuffed nonsense fails", () => {
      const text = "Modell A Modell B Vorteil Nachteil einerseits andererseits bevorzuge Kompromiss.";
      const res = tasks.assessForTask(text, { task_type: "vergleich", target_words: 60 });
      const f = res.findings.find(x => x.check_id === "comparative_structure");
      assert.strictEqual(f.state, "fail", "Keyword soup must fail comparative structure");
    });

    test("D. Strong alternative phrasing with comparative grammar passes", () => {
      const text =
        "Das erste Modell mit Zwölf-Stunden-Diensten ist in der Freizeitgestaltung deutlich flexibler als das traditionelle Drei-Schicht-System. " +
        "Zwar ist die Belastung während der Arbeitszeit spürbar höher als im Normalbetrieb, doch überwiegen die Erholungsphasen. " +
        "Auf der Kehrseite steht die Ermüdung bei langen Einsätzen. " +
        "Für mich persönlich ist die erste Variante attraktiver, weil sie eine planbare Freizeitgestaltung ermöglicht.";
      const res = tasks.assessForTask(text, { task_type: "vergleich", target_words: 60 });
      const f = res.findings.find(x => x.check_id === "comparative_structure");
      assert.strictEqual(f.state, "pass");
    });

    test("E. Boundary case: both models and contrast present, but no preference stated", () => {
      const text =
        "Auf der einen Seite ermöglicht Modell A mit 12 Stunden längere Ruhephasen, hat aber den Nachteil hoher Erschöpfung. " +
        "Auf der anderen Seite sichert Modell B im 3-Schicht-System kürzere Einsätze, verlangt jedoch ständige Schichtwechsel und mehr Fahrtwege.";
      const res = tasks.assessForTask(text, { task_type: "vergleich", target_words: 60 });
      const f = res.findings.find(x => x.check_id === "comparative_structure");
      assert.strictEqual(f.state, "warn");
      assert.ok(f.detail.includes("Präferenz"));
    });
  });

  /* ──────────────────────────────────────────────────────────────────────────
     4. speculate (b2_fall_spekulation)
     ────────────────────────────────────────────────────────────────────────── */
  describe("4. speculate (Incident Hypothesizing)", () => {
    test("A. Strong valid response separates facts and formulates two distinct hypotheses", () => {
      const text =
        "Fest steht, dass der Schlüssel zur Stationsapotheke bei der Übergabe um 14:00 Uhr noch im Schlüsselfach lag, aber um 16:30 Uhr fehlte. " +
        "Vermutlich könnte eine Kollegin den Schlüssel während der Notfallaufnahme eilig mitgenommen und versehentlich eingesteckt haben. " +
        "Eine andere denkbare Erklärung wäre, dass der Schlüssel bei der Medikamentenausgabe auf einem Pflegewagen abgelegt wurde.";
      const res = tasks.assessForTask(text, { task_type: "spekulation", target_words: 60 });
      const f = res.findings.find(x => x.check_id === "speculative_language");
      assert.strictEqual(f.state, "pass");
    });

    test("B. Weak response without uncertainty fails", () => {
      const text =
        "Der Schlüssel ist weg und das ist ein großes Problem für die Station. " +
        "Jemand hat ihn einfach mitgenommen und nicht zurückgebracht. Wir müssen die Apotheke sofort absuchen.";
      const res = tasks.assessForTask(text, { task_type: "spekulation", target_words: 60 });
      const f = res.findings.find(x => x.check_id === "speculative_language");
      assert.strictEqual(f.state, "fail");
    });

    test("C. Keyword-stuffed nonsense fails", () => {
      const text = "Fest steht möglicherweise vermutlich Hypothese könnte dürfte Erklärung Ursache.";
      const res = tasks.assessForTask(text, { task_type: "spekulation", target_words: 60 });
      const f = res.findings.find(x => x.check_id === "speculative_language");
      assert.strictEqual(f.state, "fail", "Keyword soup must fail speculative language");
    });

    test("D. Strong alternative phrasing using epistemic modals passes", () => {
      const text =
        "Dokumentiert ist, dass das Schlüsselfach um 14 Uhr ordnungsgemäß verschlossen war. " +
        "Unter Umständen dürfte der Schlüssel beim Notfalleinsatz verlegt worden sein. " +
        "Wir nehmen an, dass er sich versehentlich noch in einer Kitteltasche befindet und zum Schichtende wieder auftaucht.";
      const res = tasks.assessForTask(text, { task_type: "spekulation", target_words: 60 });
      const f = res.findings.find(x => x.check_id === "speculative_language");
      assert.strictEqual(f.state, "pass");
    });

    test("E. Boundary case: single hypothesis produces warning", () => {
      const text =
        "Tatsache ist, dass der Schlüssel unauffindbar ist. " +
        "Möglicherweise hat ihn eine Kollegin versehentlich eingesteckt und mit nach Hause genommen.";
      const res = tasks.assessForTask(text, { task_type: "spekulation", target_words: 60 });
      const f = res.findings.find(x => x.check_id === "speculative_language");
      assert.strictEqual(f.state, "warn");
      assert.ok(f.detail.includes("zwei"));
    });
  });

  /* ──────────────────────────────────────────────────────────────────────────
     5. exemplify (b2_beispiel_geben)
     ────────────────────────────────────────────────────────────────────────── */
  describe("5. exemplify (Concrete Example Grounding)", () => {
    test("A. Strong valid response grounds argument with context and outcome", () => {
      const text =
        "Ich teile Franks Bedenken nicht, denn die Übergabe am Bett erhöht die Patientensicherheit nachweisbar. " +
        "Aus eigener Erfahrung kann ich von einem Vorfall aus der letzten Woche berichten: Bei einer Patientin fiel während der Übergabe sofort auf, dass die Dosis vertauscht worden war. " +
        "Die Patientin sprach uns direkt darauf an, sodass eine falsche Medikation rechtzeitig verhindert werden konnte.";
      const res = tasks.assessForTask(text, { task_type: "beispiel", target_words: 60 });
      const f = res.findings.find(x => x.check_id === "concrete_example");
      assert.strictEqual(f.state, "pass");
    });

    test("B. Weak response with empty slogan fails", () => {
      const text = "Zum Beispiel ist Kommunikation auf Station sehr wichtig und unverzichtbar für alle Mitarbeiter.";
      const res = tasks.assessForTask(text, { task_type: "beispiel", target_words: 60 });
      const f = res.findings.find(x => x.check_id === "concrete_example");
      assert.strictEqual(f.state, "fail", "Vacuous slogan must fail");
    });

    test("C. Keyword-stuffed nonsense fails", () => {
      const text = "Zum Beispiel letzte Woche Patientin fiel auf konnte verhindert werden führte dazu.";
      const res = tasks.assessForTask(text, { task_type: "beispiel", target_words: 60 });
      const f = res.findings.find(x => x.check_id === "concrete_example");
      assert.strictEqual(f.state, "fail", "Keyword soup must fail concrete example");
    });

    test("D. Strong alternative phrasing with narrative opening passes", () => {
      const text =
        "Ein typischer Fall ereignete sich neulich im Nachtdienst: Während der Kontrolle am Krankenbett stellten wir fest, dass die Infusion falsch eingestellt war. " +
        "Weil die Patientin wach war und nachfragte, bemerkten wir den Irrtum sofort, wodurch ein schwerer Schaden abgewendet werden konnte.";
      const res = tasks.assessForTask(text, { task_type: "beispiel", target_words: 60 });
      const f = res.findings.find(x => x.check_id === "concrete_example");
      assert.strictEqual(f.state, "pass");
    });

    test("E. Boundary case: situation described without outcome produces warning", () => {
      const text =
        "Als konkretes Beispiel lässt sich ein Fall aus dem Frühdienst anführen: Bei einem älteren Patienten sprachen wir über die Tabletten und kontrollierten den Medikamentenplan am Bett.";
      const res = tasks.assessForTask(text, { task_type: "beispiel", target_words: 60 });
      const f = res.findings.find(x => x.check_id === "concrete_example");
      assert.strictEqual(f.state, "warn");
      assert.ok(f.detail.includes("Ausgang"));
    });
  });
});
