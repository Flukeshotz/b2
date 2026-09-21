/**
 * MAYA SCENARIO 03 — Mein Vorschlag wird geändert
 *
 * The learner submitted a proposal for a structured bedside handover
 * (Uebergabe am Patientenbett) combined with a written checklist. Frau Berger
 * has approved the checklist but has struck the bedside handover component,
 * citing time pressure and late-shift understaffing.
 *
 * The learner must defend the clinical necessity of bedside handover, concede
 * the operational constraint without full capitulation, and propose a workable
 * adaptation — restricting bedside handover to high-risk patients with a
 * strict time cap.
 *
 * Primary capabilities trained:
 *   justify         — providing evidence-based reasons for the proposal element.
 *   adapt_register  — sustained professional, formal B2 German with Frau Berger.
 *
 * Secondary capabilities trained:
 *   argue           — presenting and holding the proposal's core thesis.
 *   concede         — acknowledging valid operational constraints without total capitulation.
 *   maintain_discussion — sustaining a substantive multi-turn discussion under pushback.
 *
 * Evidence design:
 *   justify:          two or more distinct, relevant reasons => 1.0; one => 0.6; zero => 0.2
 *   adapt_register:   no informal slips, sustained Sie-form, diplomatic tone => 1.0; minor => 0.6
 *   concede:          at least one explicit acknowledgement of valid constraint => 1.0; none => 0.0
 *   argue:            core position reaffirmed after pushback => 1.0
 *   maintain_discussion: >= 3 substantive turns / >= 60% substantive ratio => 0.8+
 *
 * Scenario design principles:
 *   - Do NOT require specific keywords. Score communicative behavior.
 *   - Any concrete, clinically-grounded adaptation that preserves the core
 *     purpose and responds to the staffing constraint satisfies the beat.
 *   - Concession must not equal surrender.
 *   - Evidence comes from the learner's actual turns, not from the terminal outcome.
 */

module.exports = {
  id: "maya_vorschlag",
  version: 1,
  title: "Mein Vorschlag wird geändert",
  minutes: 8,

  roles: {
    learner: "Pflegefachkraft auf Station 3",
    maya: "Frau Berger, Stationsleitung",
  },

  context:
    "Sie haben einen Vorschlag für strukturierte Übergaben eingereicht: eine Checkliste und eine kurze Übergabe am Patientenbett für kritische Fälle. Frau Berger hat die Checkliste genehmigt — aber den Abschnitt zur Übergabe am Patientenbett gestrichen. Sie argumentiert mit Zeitmangel und Personalmangel im Spätdienst.",
  opening_position:
    "Die Checkliste ist genehmigt. Den Abschnitt mit der Übergabe am Patientenbett habe ich gestrichen — das kostet zu viel Zeit und im Spätdienst haben wir dafür keine Kapazitäten.",
  objective:
    "Frau Berger von der klinischen Notwendigkeit der Übergabe am Patientenbett überzeugen, ihre berechtigten Personalbedenken anerkennen und eine umsetzbare Anpassung vorschlagen, die den Kernzweck des Vorschlags erhält.",

  capability_targets: {
    primary: "justify",
    secondary: ["adapt_register", "argue", "concede", "maintain_discussion"],
  },

  max_learner_turns: 7,

  declaration: {
    primary_capability: "justify",
    secondary_capabilities: [
      "adapt_register",
      "argue",
      "concede",
      "maintain_discussion",
    ],
    theme: 3,
    context: "professional",
    cefr_tier: "developing",
    language_resources: [
      "stating a clinical reason: weil / da / das reduziert / das verhindert...",
      "conceding before countering: das ist ein berechtigter Einwand, aber... / da haben Sie recht, dennoch...",
      "proposing a scoped adaptation: ich würde vorschlagen, es auf ... zu beschränken",
      "committing concretely: ich könnte eine Checkliste erstellen / wir könnten das für vier Wochen erproben",
      "framing urgency diplomatically: gerade bei Hochrisikopatienten ist das besonders wichtig",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam:
      "Goethe Mündlich Aufgabe 2 (Meinung äußern, Argumente abwägen) · telc Sprechen Teil 2/3 (Diskussion und Problemlösung)",
  },

  brief: {
    role: "Sie sind eine erfahrene Pflegefachkraft auf Station 3.",
    situation:
      "Sie haben einen Vorschlag eingereicht: eine strukturierte Übergabe mit Checkliste und kurzer Übergabe am Patientenbett für kritische Fälle. Frau Berger hat die Checkliste genehmigt, die Übergabe am Patientenbett jedoch gestrichen.",
    partner:
      "Frau Berger ist Ihre Stationsleitung. Sie ist pragmatisch und hält Ihre Begründungen für aufwendig, ist aber offen für machbare Lösungen.",
    goal:
      "Begründen Sie den Wert der Übergabe am Patientenbett sachlich, räumen Sie die Personalbedenken von Frau Berger ein und einigen Sie sich auf eine umsetzbare Kompromisslösung.",
  },

  opening:
    "Frau Berger legt Ihren Vorschlag auf den Tisch. \u201eIch habe mir das angesehen. Die Checkliste — gut, die führen wir ein. Aber den Punkt mit der Übergabe am Patientenbett habe ich gestrichen.\u201c",
  first_say:
    "Warum beharren Sie auf dieser Übergabe am Bett? Wir haben das jahrelang anders gemacht, und es hat funktioniert.",

  beats: [
    {
      id: "b1_defend_core_proposal",
      say: "Warum beharren Sie auf dieser Übergabe am Bett? Wir haben das jahrelang anders gemacht, und es hat funktioniert.",
      wants: ["reason"],
      press: [
        "Das höre ich öfter: 'mehr Sicherheit'. Aber das ist keine Begründung, das ist eine Behauptung. Was genau soll am Bett besser sein als ein vollständiges schriftliches Protokoll?",
        "Ich habe zwanzig Jahre Erfahrung auf dieser Station. Geben Sie mir einen konkreten Grund, warum unser bisheriges System nicht ausreicht.",
      ],
      transitions: {
        onSubstantive: "b2_challenge_practicality",
        onMaxPress: "b2_challenge_practicality",
        next: "b2_challenge_practicality",
      },
    },
    {
      id: "b2_challenge_practicality",
      say: "Schön und gut. Aber wissen Sie, was am Bett passiert? Patienten stellen Fragen, Angehörige wollen Auskunft, und aus fünf Minuten werden zwanzig. Der Spätdienst läuft dann über — und das Pflegepersonal macht unbezahlte Überstunden.",
      wants: ["concede", "reason"],
      press: [
        "Sie sagen, Sie verstehen das. Dann sagen Sie mir: warum lohnt sich das trotzdem? Bisher klingt das nur nach mehr Aufwand für das Team.",
        "'Das stimmt zwar, aber' — das habe ich schon dreimal gehört. Wenn Sie die Unterbrechungen nicht lösen können, ist Ihre Idee in der Praxis nicht umsetzbar.",
      ],
      transitions: {
        onSubstantive: "b3_adapt_to_constraint",
        onMaxPress: "b3_adapt_to_constraint",
        next: "b3_adapt_to_constraint",
      },
    },
    {
      id: "b3_adapt_to_constraint",
      say: "Jetzt kommen wir zum eigentlichen Problem: Im Spätdienst haben wir drei Pflegekräfte auf der Station. Wenn zwei davon Zimmer für Zimmer gehen, ist der Flur unbesetzt. Bei einer Reanimation oder einem Sturz kommt die Reaktion zu spät.",
      wants: ["offer", "detail", "reason"],
      press: [
        "'Wir machen das kürzer' — das reicht mir nicht. Der Flur bleibt trotzdem unbesetzt. Was ist Ihr konkreter Lösungsvorschlag für die Unterbesetzung?",
        "Ich brauche eine Antwort, die zeigt, dass Sie das Personalproblem ernst nehmen — nicht nur eine Vereinfachung der Übergabe.",
      ],
      transitions: {
        onSubstantive: "b4_pilot_commitment",
        onMaxPress: "b4_pilot_commitment",
        next: "b4_pilot_commitment",
      },
    },
    {
      id: "b4_pilot_commitment",
      say: "Das klingt schon praktikabler. Aber wer schult das Team ein? Und wie stellen Sie sicher, dass die Zeitdisziplin eingehalten wird? Ich habe keine Kapazität, das täglich zu kontrollieren.",
      wants: ["detail", "offer"],
      press: [
        "'Das klären wir' ist keine Antwort. Wer macht das konkret, und bis wann?",
      ],
      transitions: {
        onSubstantive: "b_resolved",
        onMaxPress: "b_unresolved",
        next: "b_resolved",
      },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "\u201eGut. Wir machen einen Vier-Wochen-Test: Übergabe am Bett ausschließlich für Hochrisikopatienten, maximal drei Minuten pro Patient, eine Pflegekraft bleibt am Stationsflur. Sie erstellen bis Freitag eine kurze Einführung für das Team. Wenn das System funktioniert, sprechen wir nach vier Wochen wieder darüber.\u201c",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "\u201eUnsere Zeit ist um. Ohne klare Antworten auf die Personalfrage kann ich die Übergabe am Bett nicht genehmigen. Die Checkliste führen wir ein — beim Rest bleibt es vorerst beim Alten.\u201c",
    },
  ],

  closing:
    "\u201eGut. Wir machen einen Vier-Wochen-Test: Übergabe am Bett ausschließlich für Hochrisikopatienten, maximal drei Minuten, eine Pflegekraft bleibt am Flur. Erstellen Sie bis Freitag die Einführungsunterlage.\u201c",

  afterwards: {
    strong: [
      "Die direkte Sichtprüfung am Bett erkennt Dinge, die kein Schriftstück erfasst — verrutschte Drainagen, Hautzustand, ob der Patient ansprechbar ist.",
      "Das verstehe ich vollkommen. Deshalb würde ich vorschlagen, die Übergabe am Bett auf Hochrisikopatienten zu beschränken — das sind erfahrungsgemäß zwei bis drei pro Schicht.",
      "Ich könnte eine kurze Protokollvorlage mit maximal drei Minuten pro Patient erstellen, damit das Team die Zeitgrenze sauber einhalten kann.",
      "Für den unbesetzten Flur: Eine Pflegekraft bleibt an der Station — nur eine begleitet die Übergabe am Bett. So ist die Grundüberwachung gesichert.",
      "Ich würde vorschlagen, das vier Wochen lang zu testen und danach gemeinsam auszuwerten.",
    ],
    watchFor:
      "Frau Berger erkennt gute Argumente — aber nur, wenn Sie auch auf ihre Einwände eingehen. Wer sagt 'das machen wir trotzdem', verliert das Gespräch. Der entscheidende Schritt ist: Erst die Personalbedenken ernst nehmen, dann einen konkreten Lösungsrahmen nennen.",
  },
};
