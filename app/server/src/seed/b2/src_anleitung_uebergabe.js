/**
 * SOURCE 20 — „Anleitung: Neue Übergabe-Checkliste"
 *
 * ORIGINAL SKILLCASE CONTENT. Goethe Lesen Teil 5's shape: a short written
 * instruction/procedure text, tested on whether the reader can actually
 * follow it correctly — sequence, conditions, exceptions — rather than on
 * opinion or argument. Different register from every prior source: no
 * hedging, no concession, just precise procedural steps with a few
 * deliberately easy-to-miss conditions.
 */

const KIND = "text";

const DECLARATION = {
  primary_capability: "structure",
  secondary_capabilities: [],
  theme: 3,
  cefr_tier: "developing",
  difficulty: {
    content: ["implicit_cohesion"],
    delivery: [],
  },
  language_resources: [
    "Bedingungssätze in Anleitungen: nur falls, es sei denn, sofern nicht",
    "Reihenfolge markieren: zunächst, anschließend, erst danach, zuletzt",
  ],
  checks: [],
  experience_types: ["reading"],
  exam: "Goethe Lesen Teil 5 — schriftliche Anweisung verstehen",
  recognition_only: true,
};

const TITLE = "Anleitung: Neue Übergabe-Checkliste";
const HOOK = "Eine neue Anleitung für die Schichtübergabe — mit drei Ausnahmen, die leicht zu übersehen sind.";

const SCRIPT = [
  { handle: "anleitung", speaker: "Anleitung", when: "", de:
    "Ab sofort gilt für die Schichtübergabe folgender Ablauf:\n\nZunächst trägt die abgebende Person alle offenen Punkte in das digitale Übergabeprotokoll ein. Das gilt für jede Übergabe, unabhängig davon, wie ruhig die Schicht war — nur falls es sich um eine reine Kurzübergabe von weniger als fünf Minuten handelt, genügt ein mündlicher Hinweis ohne Eintrag.\n\nAnschließend liest die übernehmende Person das Protokoll durch, bevor das Gespräch beginnt. Es sei denn, das System ist ausnahmsweise nicht erreichbar — in diesem Fall wird die mündliche Übergabe wie bisher durchgeführt, und der Eintrag erfolgt nachträglich durch die abgebende Person, sobald das System wieder funktioniert.\n\nErst danach findet das eigentliche Übergabegespräch statt. Dabei werden ausschließlich Punkte besprochen, die im Protokoll als „dringend“ markiert sind, sofern nicht die übernehmende Person von sich aus weitere Fragen hat.\n\nZuletzt bestätigt die übernehmende Person die Übergabe mit ihrer Unterschrift im Protokoll — auch dann, wenn keine dringenden Punkte vorlagen. Eine Übergabe ohne diese Unterschrift gilt als nicht abgeschlossen, selbst wenn das Gespräch vollständig stattgefunden hat." },
];

const VOICES = [{ handle: "anleitung", speaker: "Anleitung" }];
const TRANSCRIPT = SCRIPT[0].de;
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_anleitung_uebergabe");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
