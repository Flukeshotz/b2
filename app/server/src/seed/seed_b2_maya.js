// Seeds Maya speaking scenarios into the runtime `topics` table at level='b2'.
//
// Preserves the existing curriculum structure and ordering:
//   order_index 8:  b2_maya_schichttausch (Scenario 1)
//   order_index 9:  b2_maya_homeoffice    (Scenario 2)
//   order_index 10: b2_maya_vorschlag     (Scenario 3)
//   order_index 11: b2_maya_unerwartet    (Scenario 4)
//   order_index 12-37: the Speaking Practice depth pass — 26 further
//     scenarios, each backed by its own file in src/seed/b2/maya/ and
//     auto-registered in routes/b2.js's SCENARIOS (directory scan, not a
//     hand-edited map). `track: "speaking"` is derived automatically by
//     b2_curriculum.js's trackOf() for any topic id containing "maya", so
//     PracticeHome's "Speaking passages" row picks these up with zero
//     client-side change — same mechanism the original 4 already used.
//
// Idempotent upsert — touches nothing else in `topics`.

const pool = require("../db/pool");

const MAYA_TOPICS = [
  {
    id: "b2_maya_schichttausch",
    order_index: 8,
    icon: "💬",
    title: "Sie brauchen den Samstag frei",
    capability: "staying in the conversation when someone pushes back",
    proof: "Sie brauchen den Samstag frei",
    subs: [
      {
        key: "main",
        label: "Gespräch",
        steps: [{ t: "converse", scenarioId: "maya_schichttausch" }],
        teaches: [],
      },
    ],
  },
  {
    id: "b2_maya_homeoffice",
    order_index: 9,
    icon: "💬",
    title: "Homeoffice auf der Station?",
    capability: "arguing a position and acknowledging counterarguments under pressure",
    proof: "Homeoffice auf der Station?",
    subs: [
      {
        key: "main",
        label: "Diskussion",
        steps: [{ t: "converse", scenarioId: "maya_homeoffice" }],
        teaches: [],
      },
    ],
  },
  {
    id: "b2_maya_vorschlag",
    order_index: 10,
    icon: "💬",
    title: "Mein Vorschlag wird geändert",
    capability: "defending a professional proposal under pushback and adapting to constraints",
    proof: "Mein Vorschlag wird geändert",
    subs: [
      {
        key: "main",
        label: "Diskussion",
        steps: [{ t: "converse", scenarioId: "maya_vorschlag" }],
        teaches: [],
      },
    ],
  },
  {
    id: "b2_maya_unerwartet",
    order_index: 11,
    icon: "💬",
    title: "Moment, da ist noch etwas …",
    capability: "handling an unexpected turn in a clinical conversation",
    proof: "Moment, da ist noch etwas …",
    subs: [
      {
        key: "main",
        label: "Aufnahmegespräch",
        steps: [{ t: "converse", scenarioId: "maya_unerwartet" }],
        teaches: [],
      },
    ],
  },

  /* ── SPEAKING PRACTICE DEPTH PASS — 26 further scenarios ──────────────
     Same shape as the four above; each just points at its own scenario
     file. order_index 12-37, continuing straight on from 11. */
  { id: "b2_maya_meeting_verschieben", order_index: 12, icon: "💬",
    title: "Das Meeting verschieben",
    capability: "negotiating a new time with a colleague who has her own constraint",
    proof: "Das Meeting verschieben",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_meeting_verschieben" }], teaches: [] }] },

  { id: "b2_maya_ueberstunden", order_index: 13, icon: "💬",
    title: "Zu viele Überstunden",
    capability: "arguing for a fair overtime system under budget pushback",
    proof: "Zu viele Überstunden",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_ueberstunden" }], teaches: [] }] },

  { id: "b2_maya_kollege_fehler", order_index: 14, icon: "💬",
    title: "Ein Fehler in der gemeinsamen Tabelle",
    capability: "de-escalating a workplace mistake while still fixing it",
    proof: "Ein Fehler in der gemeinsamen Tabelle",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_kollege_fehler" }], teaches: [] }] },

  { id: "b2_maya_dienstplan_tausch2", order_index: 15, icon: "💬",
    title: "Eine Kollegin um einen Schichttausch bitten",
    capability: "asking a colleague, not a manager, for a genuine favour",
    proof: "Eine Kollegin um einen Schichttausch bitten",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_dienstplan_tausch2" }], teaches: [] }] },

  { id: "b2_maya_patientenwunsch", order_index: 16, icon: "💬",
    title: "Eine Angehörige bittet um eine Ausnahme",
    capability: "explaining a rule kindly and finding a fair, realistic solution",
    proof: "Eine Angehörige bittet um eine Ausnahme",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_patientenwunsch" }], teaches: [] }] },

  { id: "b2_maya_projektidee", order_index: 17, icon: "💬",
    title: "Eine neue Projektidee vorschlagen",
    capability: "defending a proposal against skepticism with a realistic scope",
    proof: "Eine neue Projektidee vorschlagen",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_projektidee" }], teaches: [] }] },

  { id: "b2_maya_umzug_freunde", order_index: 18, icon: "💬",
    title: "Den Umzugstag planen",
    capability: "proposing and comparing options tentatively to reach a plan",
    proof: "Den Umzugstag planen",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_umzug_freunde" }], teaches: [] }] },

  { id: "b2_maya_nachbarschaftsstreit", order_index: 19, icon: "💬",
    title: "Fahrräder im Treppenhaus",
    capability: "de-escalating a neighbour dispute while still fixing the problem",
    proof: "Fahrräder im Treppenhaus",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_nachbarschaftsstreit" }], teaches: [] }] },

  { id: "b2_maya_rueckgabe_geschaeft", order_index: 20, icon: "💬",
    title: "Eine Rückgabe ohne Kassenbon",
    capability: "asking for clarification when store policy is vague",
    proof: "Eine Rückgabe ohne Kassenbon",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_rueckgabe_geschaeft" }], teaches: [] }] },

  { id: "b2_maya_ausbildungsplatz", order_index: 21, icon: "💬",
    title: "Ausbildung statt Studium?",
    capability: "defending an opinion against a family generalisation with concrete examples",
    proof: "Ausbildung statt Studium?",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_ausbildungsplatz" }], teaches: [] }] },

  { id: "b2_maya_teamleitung_kritik", order_index: 22, icon: "💬",
    title: "Kritik an der letzten Abgabe",
    capability: "accepting valid criticism while correcting one inaccurate point",
    proof: "Kritik an der letzten Abgabe",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_teamleitung_kritik" }], teaches: [] }] },

  { id: "b2_maya_kollegin_ueberlastet", order_index: 23, icon: "💬",
    title: "Eine überlastete Kollegin ansprechen",
    capability: "offering concrete help a colleague can actually accept",
    proof: "Eine überlastete Kollegin ansprechen",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_kollegin_ueberlastet" }], teaches: [] }] },

  { id: "b2_maya_kunde_reklamation", order_index: 24, icon: "💬",
    title: "Eine unklare Reklamation",
    capability: "getting the real problem out of a vague complaint",
    proof: "Eine unklare Reklamation",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_kunde_reklamation" }], teaches: [] }] },

  { id: "b2_maya_wg_regeln", order_index: 25, icon: "💬",
    title: "Klare Regeln für die Küche",
    capability: "comparing approaches and proposing a workable compromise",
    proof: "Klare Regeln für die Küche",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_wg_regeln" }], teaches: [] }] },

  { id: "b2_maya_elternabend", order_index: 26, icon: "💬",
    title: "Zu viele Hausaufgaben ansprechen",
    capability: "raising a concern with a teacher in appropriately adapted register",
    proof: "Zu viele Hausaufgaben ansprechen",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_elternabend" }], teaches: [] }] },

  { id: "b2_maya_lieferverzug", order_index: 27, icon: "💬",
    title: "Die Lieferung verzögert sich weiter",
    capability: "noticing a vague replacement offer and insisting on a firm commitment",
    proof: "Die Lieferung verzögert sich weiter",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_lieferverzug" }], teaches: [] }] },

  { id: "b2_maya_praktikumsplatz_aendert", order_index: 28, icon: "💬",
    title: "Der Praktikumsplatz wurde geändert",
    capability: "recognising a 'small change' is actually significant, and reacting",
    proof: "Der Praktikumsplatz wurde geändert",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_praktikumsplatz_aendert" }], teaches: [] }] },

  { id: "b2_maya_krankmeldung_kollege", order_index: 29, icon: "💬",
    title: "Eine kurzfristige Krankmeldung",
    capability: "reacting to a sudden staffing change instead of just agreeing",
    proof: "Eine kurzfristige Krankmeldung",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_krankmeldung_kollege" }], teaches: [] }] },

  { id: "b2_maya_gehaltsverhandlung", order_index: 30, icon: "💬",
    title: "Um eine Gehaltserhöhung bitten",
    capability: "backing a raise request with facts and pressing past the first no",
    proof: "Um eine Gehaltserhöhung bitten",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_gehaltsverhandlung" }], teaches: [] }] },

  { id: "b2_maya_vereinsversammlung", order_index: 31, icon: "💬",
    title: "Neue Trainingszeiten vorschlagen",
    capability: "arguing for change while respecting an established tradition",
    proof: "Neue Trainingszeiten vorschlagen",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_vereinsversammlung" }], teaches: [] }] },

  { id: "b2_maya_stationswechsel", order_index: 32, icon: "💬",
    title: "Um einen Wechsel auf die Kinderstation bitten",
    capability: "defending a career request while solving the team's staffing concern",
    proof: "Um einen Wechsel auf die Kinderstation bitten",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_stationswechsel" }], teaches: [] }] },

  { id: "b2_maya_uebergabe_unklar", order_index: 33, icon: "💬",
    title: "Eine unklare Angabe bei der Übergabe",
    capability: "asking a precise clarifying question instead of guessing",
    proof: "Eine unklare Angabe bei der Übergabe",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_uebergabe_unklar" }], teaches: [] }] },

  { id: "b2_maya_kollege_spaet", order_index: 34, icon: "💬",
    title: "Ein Kollege kommt wiederholt zu spät",
    capability: "naming a repeated pattern factually and reaching a fix",
    proof: "Ein Kollege kommt wiederholt zu spät",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_kollege_spaet" }], teaches: [] }] },

  { id: "b2_maya_ferienplanung", order_index: 35, icon: "💬",
    title: "Den Kurzurlaub planen",
    capability: "planning together and summarising the agreement accurately",
    proof: "Den Kurzurlaub planen",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_ferienplanung" }], teaches: [] }] },

  { id: "b2_maya_reklamation_hotel", order_index: 36, icon: "💬",
    title: "Das gebuchte Zimmer ist nicht verfügbar",
    capability: "explaining why a booking detail matters and negotiating a fair fix",
    proof: "Das gebuchte Zimmer ist nicht verfügbar",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_reklamation_hotel" }], teaches: [] }] },

  { id: "b2_maya_fortbildung_antrag", order_index: 37, icon: "💬",
    title: "Eine Fortbildung beantragen",
    capability: "connecting a request to concrete needs and accepting a staged yes",
    proof: "Eine Fortbildung beantragen",
    subs: [{ key: "main", label: "Gespräch", steps: [{ t: "converse", scenarioId: "maya_fortbildung_antrag" }], teaches: [] }] },
];

async function seedMayaCurriculum() {
  for (const t of MAYA_TOPICS) {
    await pool.query(
      `INSERT INTO topics (id, order_index, icon, title, capability, proof, subs, level, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'b2', 'live')
       ON CONFLICT (id) DO UPDATE SET
         order_index = EXCLUDED.order_index,
         icon = EXCLUDED.icon,
         title = EXCLUDED.title,
         capability = EXCLUDED.capability,
         proof = EXCLUDED.proof,
         subs = EXCLUDED.subs,
         level = 'b2',
         status = 'live'`,
      [t.id, t.order_index, t.icon, t.title, t.capability, t.proof, JSON.stringify(t.subs)]
    );
  }
  console.log(`Seeded ${MAYA_TOPICS.length} Maya speaking topics into curriculum.`);
}

if (require.main === module) {
  seedMayaCurriculum()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      pool.end();
      process.exit(1);
    });
}

module.exports = { MAYA_TOPICS, seedMayaCurriculum };
