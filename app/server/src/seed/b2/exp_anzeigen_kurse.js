/**
 * Experience derived from src_anzeigen_kurse. Original Skillcase content,
 * Goethe Lesen Teil 3's actual task: given a situation, pick the one ad
 * (of four) that genuinely fits — not the first one that mentions a matching
 * keyword. Built on `readq` mode "attribute" (same mechanism the forum
 * sources use to ask "who said this", repurposed here to ask "which ad
 * fits").
 */

const SOURCE_ID = "src_anzeigen_kurse";

const reading = {
  id: "exp_anzeigen_kurse_read",
  kind: "reading",
  ord: 0,
  title: "Vier Anzeigen: welche passt?",
  minutes: 10,
  primary_capability: "structure",
  secondary_capabilities: [],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Vier Kursanzeigen, vier Situationen. Lesen Sie zuerst alle vier Anzeigen — danach entscheiden Sie, welche zu welcher Person passt.",
      "Manchmal passt mehr als eine Anzeige auf den ersten Blick. Achten Sie auf die Details.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Frau Öztürk hat vor zehn Jahren in ihrem Heimatland eine Ausbildung zur Pflegefachkraft abgeschlossen und braucht jetzt einen Sprachnachweis für die Anerkennung. Welche Anzeige passt?",
      options: ["a", "b", "c", "d"],
      answer: 2,
      explain: "Anzeige C richtet sich ausdrücklich an Personen, die eine Anerkennung ihrer im Ausland erworbenen Qualifikation anstreben und einen Sprachnachweis brauchen — genau ihre Situation. Anzeige A ist zwar auch für Berufstätige, hat aber keinen Bezug zu einer Anerkennung." },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Herr Lindqvist hatte vor Jahren einen Deutschkurs, hat seither aber kaum gesprochen und möchte sich einfach wieder trauen. Eine Prüfung will er auf keinen Fall. Welche Anzeige passt?",
      options: ["a", "b", "c", "d"],
      answer: 1,
      explain: "Anzeige B nennt ausdrücklich „keine Grammatikprüfung, kein Test am Ende“ und richtet sich an „Wiedereinsteiger“, die sich nicht mehr trauen, frei zu sprechen — exakt seine Situation." },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Frau Bakó arbeitet Vollzeit unter der Woche und hat einen sechsjährigen Sohn, für den sie samstags keine Betreuung hat. Welche Anzeige passt?",
      options: ["a", "b", "c", "d"],
      answer: 3,
      explain: "Anzeige D findet samstags statt und bietet ausdrücklich kostenlose Kinderbetreuung im Nebenraum — die einzige Anzeige, die beide ihrer Bedingungen (Wochenende, Kinderbetreuung) gleichzeitig erfüllt." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Herr Weber ist Bürokaufmann, hat bereits B2-Niveau und möchte seine schriftliche Kommunikation im Büro verbessern. Sein Arbeitgeber zahlt einen Teil der Kursgebühr. Zwei Anzeigen erwähnen Berufstätige — warum passt trotzdem nur eine davon wirklich?",
      options: [
        "Weil Anzeige C billiger ist als Anzeige A.",
        "Weil nur Anzeige A auf schriftliche Kommunikation im Büroalltag zielt und eine Ermäßigung bei Arbeitgeberbeteiligung vorsieht — Anzeige C setzt eine Anerkennung voraus, um die es ihm nicht geht.",
        "Weil Anzeige C samstags stattfindet und er dafür keine Zeit hat.",
      ],
      answer: 1,
      explain: "Anzeige C erwähnt zwar auch Berufstätige, richtet sich aber an Personen mit einer ausländischen Qualifikation, die eine Anerkennung brauchen — nicht sein Fall. Anzeige A passt inhaltlich (schriftliche Kommunikation im Büro) UND organisatorisch (Ermäßigung bei Arbeitgeberbeteiligung). Der Zeitpunkt (Anzeige C ist ganztägig unter der Woche, nicht samstags) ist hier nicht der entscheidende Grund." },
  ],
};

const EXPERIENCES = [reading];

module.exports = { EXPERIENCES, SOURCE_ID };
