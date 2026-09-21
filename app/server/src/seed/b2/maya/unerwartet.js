/**
 * MAYA SCENARIO 04 — Moment, da ist noch etwas …
 *
 * The learner is conducting a planned hospital admission interview with the son
 * of an elderly patient (Herr Weber sen., 78 J.). During the routine questions,
 * the son unexpectedly reports that his father has developed acute dyspnea and
 * chest tightness on the corridor.
 *
 * The learner must:
 *   1. recognise that the unexpected information changes what happens next;
 *   2. stop the routine paperwork / admission script;
 *   3. clarify key details (duration, severity) calmly;
 *   4. prioritise medical urgency without panic;
 *   5. communicate immediate next steps clearly to the relative.
 *
 * Primary capability trained:
 *   react_unexpected  — adapting immediately when a conversation takes an unexpected turn.
 *
 * Secondary capabilities trained:
 *   maintain_discussion — sustaining professional dialogue under pressure.
 *   adapt_register      — calm, formal B2 medical communication with a distressed relative.
 *   justify             — providing clear reasons for prioritising medical action over paperwork.
 *
 * Frozen Maya Engine Contract:
 *   - Uses existing declarative schema from maya.js.
 *   - Unexpected beat marked with `unexpected: true`.
 *   - Trap detector handles blind agreement to continue paperwork.
 */

module.exports = {
  id: "maya_unerwartet",
  version: 1,
  title: "Moment, da ist noch etwas …",
  minutes: 8,

  roles: {
    learner: "Pflegefachkraft auf Station 2",
    maya: "Herr Weber, Angehöriger",
  },

  context:
    "Sie führen das geplante Aufnahmegespräch mit Herrn Weber, dessen 78-jähriger Vater stationär aufgenommen werden soll. Während Sie die Routinefragen zu Vorerkrankungen und Dokumenten durchgehen, berichtet Herr Weber plötzlich von einer akuten Atemnot seines Vaters.",
  opening_position:
    "Guten Tag. Schön, dass Sie da sind. Ich habe die Unterlagen hier. Sollen wir direkt die Routinefragen zur Vorgeschichte durchgehen?",
  objective:
    "Die unerwartete Verschlechterung sofort erkennen, das Ausfüllen der Routineunterlagen stoppen, den Angehörigen beruhigen, klärende Fragen stellen und das weitere Vorgehen klar kommunizieren.",

  capability_targets: {
    primary: "react_unexpected",
    secondary: ["maintain_discussion", "adapt_register", "justify"],
  },

  max_learner_turns: 7,

  declaration: {
    primary_capability: "react_unexpected",
    secondary_capabilities: [
      "maintain_discussion",
      "adapt_register",
      "justify",
    ],
    theme: 7,
    context: "professional",
    cefr_tier: "developing",
    language_resources: [
      "prioritising urgency: das hat jetzt Vorrang / die Papiere warten",
      "clarifying symptoms: seit wann genau / wie äußert sich das",
      "reassuring relative: machen Sie sich keine Sorgen / wir kümmern uns sofort",
      "communicating next steps: ich verständige sofort den Arzt und messe die Vitalwerte",
      "giving professional instructions: bleiben Sie bitte bei ihm im Zimmer",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam:
      "Goethe Mündlich Aufgabe 2 · telc Deutsch B1·B2 Pflege (Sprechen)",
  },

  brief: {
    role: "Sie sind eine Pflegefachkraft auf Station 2 (Innere Medizin).",
    situation:
      "Sie führen das geplante Aufnahmegespräch für Herrn Weber sen. (78 Jahre). Geplant sind Routinefragen zu Medikamenten und Vorerkrankungen.",
    partner:
      "Herr Weber ist der Sohn des Patienten. Er ist besorgt und aufgeregt.",
    goal:
      "Reagieren Sie professionell auf unerwartete Symptome, stellen Sie das Aufnahmeritual zurück und leiten Sie sofort die richtigen Kommunikationsschritte ein.",
  },

  opening:
    "Herr Weber setzt sich zu Ihnen an den Schreibtisch im Stationszimmer. „Guten Tag. Ich begleite meinen Vater zur Aufnahme. Wir haben hier die Einweisung vom Hausarzt und die Versicherungskarte.“",
  first_say:
    "Guten Tag. Schön, dass Sie da sind. Ich habe die Unterlagen hier. Sollen wir direkt die Routinefragen zur Vorgeschichte durchgehen?",

  beats: [
    {
      id: "b1_admission_start",
      say: "Guten Tag. Schön, dass Sie da sind. Ich habe die Unterlagen hier. Sollen wir direkt die Routinefragen zur Vorgeschichte durchgehen?",
      wants: ["detail", "reason"],
      press: [
        "Können wir kurz anfangen? Mein Vater wartet draußen auf dem Flur.",
      ],
      transitions: {
        onSubstantive: "b2_unexpected_turn",
        onMaxPress: "b2_unexpected_turn",
        next: "b2_unexpected_turn",
      },
    },
    {
      id: "b2_unexpected_turn",
      unexpected: true,
      say: "Herr Weber schaut unruhig zur Tür und unterbricht: „Entschuldigung, aber mein Vater atmet seit einer halben Stunde so schwer und klagt über Druck auf der Brust. Können wir nicht trotzdem erst schnell die Papiere fertig ausfüllen, damit das erledigt ist?“",
      wants: ["reason", "concede"],
      press: [
        "Ist das jetzt ein Ja oder Nein? Können wir die Formulare nicht einfach kurz abhaken?",
      ],
      transitions: {
        onTrap: "b_trap_accepted",
        onRejectAndCounter: "b3_clarify_and_triage",
        onCounter: "b3_clarify_and_triage",
        onSubstantive: "b3_clarify_and_triage",
        onMaxPress: "b_unresolved",
        next: "b3_clarify_and_triage",
      },
    },
    {
      id: "b3_clarify_and_triage",
      say: "Herr Weber wirkt erleichtert, aber verunsichert: „Danke. Er schwitzt auch und wirkt blass. Ich wusste nicht, ob das nur die Aufregung von der Fahrt ist. Was bedeutet das denn jetzt?“",
      wants: ["reason", "concede", "detail"],
      press: [
        "Was genau machen Sie denn jetzt mit ihm? Ich mache mir wirklich Sorgen.",
      ],
      transitions: {
        onSubstantive: "b4_communicate_action",
        onMaxPress: "b_unresolved",
        next: "b4_communicate_action",
      },
    },
    {
      id: "b4_communicate_action",
      say: "„Verstanden. Soll ich bei ihm im Zimmer bleiben oder draußen warten, während Sie den Arzt informieren?“",
      wants: ["detail", "offer"],
      press: [
        "Sagen Sie mir bitte kurz, wie wir jetzt am besten vorgehen.",
      ],
      transitions: {
        onSubstantive: "b_resolved",
        onMaxPress: "b_unresolved",
        next: "b_resolved",
      },
    },
    // Terminal beats
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Vielen Dank. Es beruhigt mich sehr, dass Sie sofort reagiert und den Arzt gerufen haben. Ich begleite meinen Vater ins Zimmer und warte dort bei ihm.“ (Herr Weber atmet tief durch und geht zu seinem Vater.)",
    },
    {
      id: "b_trap_accepted",
      terminal: true,
      outcome: "trap_accepted",
      say: "„Gut, dann füllen wir erst die Einverständniserklärung aus.“ (Herr Weber füllt zögernd das Formular aus, während sich der Zustand seines Vaters auf dem Gang verschlechtert.)",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ich merke, wir kommen hier gerade nicht weiter. Ich gehe lieber direkt selbst zu einer Ärztin.“ (Herr Weber verlässt hastig das Zimmer.)",
    },
  ],
  afterwards: {
    strong: [
      "Herr Weber, die Papiere warten jetzt. Wenn Ihr Vater schwer atmet, hat das absolute Priorität. Ich komme sofort mit zu ihm.",
      "Atmet er schon länger so, oder trat das plötzlich auf? Klagt er über Schmerzen oder Engegefühl?",
      "Bleiben Sie bitte direkt bei ihm und lagern Sie seinen Oberkörper etwas hoch. Ich verständige sofort den Stationsarzt und bringe Sauerstoff mit.",
      "Machen Sie sich keine Sorgen, wir untersuchen ihn jetzt unverzüglich. Ich bin in zwei Minuten mit der Ärztin bei Ihnen.",
    ],
    watchFor:
      "Wenn Angehörige im Aufnahmegespräch von akuter Atemnot berichten, darf auf keinen Fall stur weiter das Formular abgefragt werden. Unterbrechen Sie die Routine sofort, fragen Sie nach den Symptomen und leiten Sie unverzüglich die nächsten Schritte ein.",
  },
};
