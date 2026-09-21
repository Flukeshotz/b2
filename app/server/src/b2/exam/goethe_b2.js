/**
 * THE GOETHE-ZERTIFIKAT B2 BLUEPRINT, as constants.
 *
 * Every number here was read out of an official document, and the document is
 * named beside it. Nothing in this file is remembered, inferred, or taken from
 * a third-party summary — those are how a product ends up faithfully
 * implementing an exam that no longer exists.
 *
 * WHICH IT ALMOST DID. `Pruefungsziele_Testbeschreibung_B2.pdf`, still served
 * from goethe.de, is the 2007 Handbuch (footer: "B2_Handbuch_14 05.07.2007").
 * It describes a two-Aufgabe Hörverstehen whose first task is five gaps filled
 * from a single listen at 2 points each, and whose second is a ten-minute
 * broadcast heard whole and then in sections. That format was replaced by the
 * modular exam. An official URL is not the same thing as a current document.
 *
 * SOURCES
 *   A  Modellsatz Erwachsene, version marker "Vs1.5_160426"
 *      https://www.goethe.de/pro/relaunch/prf/materialien/B2/b2_modellsatz_erwachsene.pdf
 *   B  Barrier-free online Modellsatz (same sample set, independently read)
 *      https://bfu.goethe.de/b2_mod_2MX6/hoeren.php
 *   C  Durchführungsbestimmungen, "Stand: 1. September 2025"
 *      https://www.goethe.de/pro/relaunch/prf/es/Durchfuehrungsbestimmungen_B2.pdf
 */

/** A: "In der Prüfung lassen sich maximal 100 Punkte pro Modul erreichen.
 *      Die Bestehensgrenze liegt bei 60 Punkten, also 60 Prozent." */
const MODULE_MAX_POINTS = 100;
const MODULE_PASS_POINTS = 60;

/**
 * The Hören module. A's overview table and B agree item-for-item.
 * A: "Das Modul Hören hat vier Teile." / "circa 40 Minuten"
 */
const HOEREN = {
  minutes: 40,
  totalItems: 30,
  /** C §4.2: "Im Modul HÖREN gibt es 30 Items. Jedes Item ist ein Messpunkt.
   *  Pro Messpunkt und Lösung werden entweder 1 Punkt oder 0 Punkte vergeben." */
  pointsPerItem: 1,
  /** C §4.2: raw Messpunkte × 3,33, rounded, against a published table. */
  messpunktFactor: 3.33,
  /** C: "Für das Übertragen ihrer Lösungen stehen den Teilnehmenden circa
   *  5 Minuten innerhalb der Prüfungszeit zur Verfügung." */
  transferMinutes: 5,

  teile: [
    {
      no: 1,
      ziel: "Alltagsgespräche verstehen",
      /** A: five short texts, two items each — one R/F and one 3-way MC. */
      texts: 5,
      items: 10,
      itemRange: [1, 10],
      shape: [{ type: "rf", count: 5 }, { type: "mc3", count: 5 }],
      plays: 1,
      readSeconds: 15,
      instruction:
        "Sie hören fünf Gespräche und Äußerungen. Sie hören jeden Text einmal. " +
        "Zu jedem Text lösen Sie zwei Aufgaben. Wählen Sie bei jeder Aufgabe die richtige Lösung.",
    },
    { no: 2, ziel: "Informationen verstehen", texts: 1, items: 6, itemRange: [11, 16],
      shape: [{ type: "mc3", count: 6 }], plays: 2, readSeconds: 90,
      instruction: "Sie hören im Radio ein Interview mit einer Persönlichkeit aus der Wissenschaft. Sie hören den Text zweimal." },
    { no: 3, ziel: "Aussagen verstehen", texts: 1, items: 6, itemRange: [17, 22],
      shape: [{ type: "match", count: 6 }], plays: 1, readSeconds: 60,
      instruction: "Sie hören im Radio ein Gespräch mit mehreren Personen. Sie hören den Text einmal. Wählen Sie bei jeder Aufgabe: Wer sagt das?" },
    { no: 4, ziel: "Vorträge verstehen", texts: 1, items: 8, itemRange: [23, 30],
      shape: [{ type: "mc3", count: 8 }], plays: 2, readSeconds: 90,
      instruction: "Sie hören einen kurzen Vortrag. Sie hören den Text zweimal." },
  ],
};

/** C §4.2's conversion table, copied digit for digit. Present so that the ONE
 *  thing this file is used for is refusing to apply it: see convertible(). */
const HOEREN_ERGEBNISPUNKTE = {
  30: 100, 29: 97, 28: 93, 27: 90, 26: 87, 25: 83, 24: 80, 23: 77, 22: 73, 21: 70,
  20: 67, 19: 63, 18: 60, 17: 57, 16: 53, 15: 50, 14: 47, 13: 43, 12: 40, 11: 37,
  10: 33, 9: 30, 8: 27, 7: 23, 6: 20, 5: 17, 4: 13, 3: 10, 2: 7, 1: 3, 0: 0,
};

/**
 * May a raw score be reported as a Goethe Ergebnispunktzahl?
 *
 * ONLY for a complete 30-item module. The conversion table is defined over the
 * whole module, so applying it to ten items would invent an exam result: a
 * learner who got 7 of 10 in a practice section is not "23 Punkte", and telling
 * them so — or worse, "nicht bestanden" — is a false claim about a real
 * certificate. This is the guard, and it is deliberately the only way to reach
 * the table.
 */
function convertible(itemsAnswered) {
  return itemsAnswered === HOEREN.totalItems;
}

function ergebnispunkte(messpunkte, itemsInModule) {
  /* THROWS rather than returning null. A caller that converts a partial module
     has made a mistake about what it is allowed to claim, and a quiet null
     would be rendered as an empty score box instead of stopping the mistake. */
  if (!convertible(itemsInModule)) {
    throw new Error(
      `refusing to convert ${messpunkte} Messpunkte from ${itemsInModule} items: ` +
      `the Goethe table is defined over all ${HOEREN.totalItems} items of the module, ` +
      `and applying it to a practice section would invent an exam result`);
  }
  return HOEREN_ERGEBNISPUNKTE[messpunkte] ?? null;
}

/** The teil blueprint, by number. Content is validated against this. */
const teil = (no) => HOEREN.teile.find(t => t.no === no) || null;

/** What a practice section may call itself. Never "Modellsatz", never a claim
 *  to be the exam — the format is Goethe's, the material is ours. */
const PRACTICE_LABEL = (teilNo) =>
  `Skillcase-Übung im Format des Goethe-Zertifikats B2, Hören Teil ${teilNo}`;

module.exports = {
  MODULE_MAX_POINTS, MODULE_PASS_POINTS, HOEREN, HOEREN_ERGEBNISPUNKTE,
  convertible, ergebnispunkte, teil, PRACTICE_LABEL,
};
