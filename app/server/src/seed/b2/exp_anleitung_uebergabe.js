/**
 * Experience derived from src_anleitung_uebergabe. Original Skillcase
 * content, Goethe Lesen Teil 5's shape: can the reader actually follow a
 * procedure, including its exceptions — not agree or disagree with it.
 */

const SOURCE_ID = "src_anleitung_uebergabe";

const reading = {
  id: "exp_anleitung_uebergabe_read",
  kind: "reading",
  ord: 0,
  title: "Anleitung: Neue Übergabe-Checkliste",
  minutes: 10,
  primary_capability: "structure",
  secondary_capabilities: [],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Eine Anleitung, keine Meinung. Vier Schritte für die Schichtübergabe — mit drei Ausnahmen, die leicht zu übersehen sind.",
      "Lesen Sie die Anleitung genau. Danach prüfen wir, ob Sie sie wirklich richtig anwenden könnten.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Wann genügt laut Anleitung ein mündlicher Hinweis ohne Eintrag ins Protokoll?",
      options: [
        "Nie — jede Übergabe braucht einen Eintrag.",
        "Nur bei einer reinen Kurzübergabe von weniger als fünf Minuten.",
        "Immer, wenn die Schicht ruhig war.",
      ],
      answer: 1,
      explain: "Die Anleitung nennt ausdrücklich nur eine Ausnahme: „nur falls es sich um eine reine Kurzübergabe von weniger als fünf Minuten handelt“. „Ruhige Schicht“ wird ausdrücklich AUSGESCHLOSSEN als Grund für eine Ausnahme." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Was passiert, wenn das digitale System bei der Übergabe ausnahmsweise nicht erreichbar ist?",
      options: [
        "Die Übergabe muss verschoben werden, bis das System wieder funktioniert.",
        "Die Übergabe findet mündlich statt, und der Eintrag erfolgt nachträglich, sobald das System wieder funktioniert.",
        "In diesem Fall entfällt der Eintrag komplett.",
      ],
      answer: 1,
      explain: "Die Anleitung beschreibt genau dieses Vorgehen: mündliche Übergabe „wie bisher“, und der Eintrag erfolgt „nachträglich durch die abgebende Person“ — nicht verschoben, nicht ausgelassen." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Welche Punkte werden im eigentlichen Übergabegespräch standardmäßig besprochen?",
      options: [
        "Alle Punkte aus dem Protokoll, ohne Ausnahme.",
        "Nur die als „dringend“ markierten Punkte, es sei denn, die übernehmende Person hat weitere Fragen.",
        "Nur Punkte, die die abgebende Person für wichtig hält.",
      ],
      answer: 1,
      explain: "Die Anleitung beschränkt das Gespräch „ausschließlich“ auf dringende Punkte — mit einer klaren Ausnahme: wenn die übernehmende Person „von sich aus weitere Fragen hat“." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Eine Übergabe verlief ruhig, es gab keine dringenden Punkte, und das Gespräch fand vollständig statt. Die übernehmende Person vergisst aber, im Protokoll zu unterschreiben. Wie gilt diese Übergabe laut Anleitung?",
      options: [
        "Als abgeschlossen, weil das Gespräch stattgefunden hat.",
        "Als nicht abgeschlossen, weil die Unterschrift unabhängig vom Gesprächsverlauf verlangt wird.",
        "Als abgeschlossen, weil keine dringenden Punkte vorlagen.",
      ],
      answer: 1,
      explain: "Die Anleitung ist hier eindeutig: „Eine Übergabe ohne diese Unterschrift gilt als nicht abgeschlossen, selbst wenn das Gespräch vollständig stattgefunden hat.“ Weder ein ruhiger Verlauf noch fehlende dringende Punkte ändern daran etwas." },

    { t: "readq", mode: "relation", sourceId: SOURCE_ID,
      capability: "structure",
      quote: "Es sei denn, das System ist ausnahmsweise nicht erreichbar",
      q: "Wie steht dieser Satzteil zur Regel davor, dass die übernehmende Person das Protokoll vor dem Gespräch liest?",
      options: [
        "Er hebt die Regel für alle Fälle auf.",
        "Er beschreibt eine eng begrenzte Ausnahme von der sonst geltenden Regel.",
        "Er wiederholt die Regel nur mit anderen Worten.",
      ],
      answer: 1,
      explain: "„Es sei denn“ markiert genau einen Ausnahmefall (Systemausfall) — die allgemeine Regel (Protokoll vor dem Gespräch lesen) bleibt für alle anderen Fälle unverändert bestehen." },

    { t: "readq", mode: "intention", sourceId: SOURCE_ID,
      capability: "structure",
      quote: "auch dann, wenn keine dringenden Punkte vorlagen",
      q: "Warum verlangt die Anleitung eine Unterschrift, selbst wenn es nichts Dringendes zu besprechen gab?",
      options: [
        "Weil die Unterschrift eine reine Formsache ohne eigentlichen Zweck ist.",
        "Weil die Unterschrift dokumentieren soll, dass die Übergabe stattgefunden hat, unabhängig davon, was inhaltlich besprochen wurde.",
        "Weil die übernehmende Person sonst für alle vorherigen Fehler haftbar gemacht wird.",
      ],
      answer: 1,
      explain: "Die Formulierung trennt bewusst zwei Dinge: OB die Übergabe stattgefunden hat (das bestätigt die Unterschrift) und WAS inhaltlich besprochen wurde (das kann auch „nichts Dringendes“ sein). Die Anleitung sagt nichts über Haftung, nur über den formalen Abschluss." },
  ],
};

const EXPERIENCES = [reading];

module.exports = { EXPERIENCES, SOURCE_ID };
