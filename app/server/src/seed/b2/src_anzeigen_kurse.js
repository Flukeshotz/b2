/**
 * SOURCE 17 — „Vier Anzeigen: welche passt?"
 *
 * ORIGINAL SKILLCASE CONTENT. Goethe Lesen Teil 3's actual skill — matching a
 * described situation to the right one of several short texts — built on
 * read_source + readq rather than the A1 `match` mechanic, which is a
 * vocab-pair widget (max 3 pairs, icon + translation) and genuinely cannot
 * hold four paragraph-length classified ads without breaking its own layout.
 * Same comprehension task as the real exam item, different UI shape.
 *
 * Four short, independent texts as one "source" — no narrative thread
 * connects them, on purpose: Teil 3 is about scanning several short texts
 * for the one that fits a stated need, not following one continuous story.
 */

const KIND = "text";

const DECLARATION = {
  primary_capability: "structure",
  secondary_capabilities: [],
  theme: 3,
  cefr_tier: "developing",
  difficulty: {
    content: ["inference_required"],
    delivery: [],
  },
  language_resources: [
    "Anzeigensprache: Zielgruppe, Voraussetzung, Teilnahmegebühr, Anmeldeschluss",
    "eine Situation gegen mehrere Angebote prüfen, statt nur das erste passende zu nehmen",
  ],
  checks: [],
  experience_types: ["reading"],
  exam: "Goethe Lesen Teil 3 — Anzeigen einer Situation zuordnen",
  recognition_only: true,
};

const TITLE = "Vier Anzeigen: welche passt?";
const HOOK = "Vier Kursangebote, vier ganz unterschiedliche Zielgruppen — und mehr als eine Anzeige, die auf den ersten Blick passen könnte.";

/* Four independent classified-ad texts. `handle` here labels the ad, not a
   speaker — read_source/readq don't care which, they just need a stable key
   per turn to attribute quotes and options against. */
const SCRIPT = [
  { handle: "a", speaker: "Anzeige A", when: "", de:
    "Deutsch im Beruf — Aufbaukurs B2/C1. Für Berufstätige, die ihr Deutsch auf ein höheres Niveau bringen wollen, mit Schwerpunkt auf schriftlicher Kommunikation im Büroalltag: E-Mails, Protokolle, Berichte. Obwohl der Kurs anspruchsvoll ist, richtet er sich bewusst nicht an Anfänger, sondern an alle, die bereits mindestens B2-Niveau mitbringen und gezielt an ihrem Schreiben arbeiten möchten. Der Kurs findet zweimal wöchentlich abends statt, 18 bis 20 Uhr. Teilnahmegebühr: 340 Euro pro Semester, Ermäßigung bei Nachweis einer Arbeitgeberbeteiligung. Anmeldeschluss: 15. des Vormonats." },

  { handle: "b", speaker: "Anzeige B", when: "", de:
    "Konversationskurs für Wiedereinsteiger. Sie haben früher Deutsch gelernt, trauen sich aber nicht mehr, frei zu sprechen? Dieser Kurs setzt auf lockeres Sprechen in kleinen Gruppen, und zwar ganz ohne Grammatikprüfung und ohne Test am Ende, weil es hier allein ums Reden geht, nicht ums Bewerten. Termine flexibel, je nach Gruppengröße, tagsüber unter der Woche. Kostenlos für Teilnehmende mit Wohnsitz im Stadtteil, sonst 15 Euro pro Termin. Keine Voraussetzung außer Grundkenntnissen." },

  { handle: "c", speaker: "Anzeige C", when: "", de:
    "Intensivkurs Deutsch für den Pflegeberuf. Speziell für Personen, die eine Anerkennung ihrer im Ausland erworbenen Qualifikation anstreben und dafür ein bestimmtes Sprachniveau nachweisen müssen. Der Kurs ist zwar zeitintensiv, weil er ganztägig von Montag bis Freitag über sechs Wochen läuft, dafür enthält er aber auch die vollständige Vorbereitung auf eine anerkannte Sprachprüfung. Teilnahmegebühr: 890 Euro, in Raten zahlbar. Bewerbung mit Nachweis der beruflichen Qualifikation erforderlich." },

  { handle: "d", speaker: "Anzeige D", when: "", de:
    "Deutsch am Wochenende — für Eltern mit Kindern. Kurs samstags, 10 bis 13 Uhr, mit kostenloser Kinderbetreuung im Nebenraum, damit auch diejenigen teilnehmen können, die unter der Woche schlicht keine Zeit finden. Geeignet für Teilnehmende auf A2- bis B1-Niveau. Schwerpunkt: Alltagsdeutsch, mündliche Kommunikation. Teilnahmegebühr: 120 Euro pro Semester. Anmeldung jederzeit möglich, solange Plätze frei sind." },
];

const VOICES = SCRIPT.map(p => ({ handle: p.handle, speaker: p.speaker }));

const TRANSCRIPT = SCRIPT.map(p => `${p.speaker}\n${p.de}`).join("\n\n");
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_anzeigen_kurse");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
