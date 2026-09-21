// Official free B2 resources — DEEP LINKED, NEVER MIRRORED.
//
// Every item here is hosted by whoever owns it and opened at their URL. We do
// not copy, re-host, or "lightly edit" exam board materials: an edited past
// paper is a derivative work and infringes exactly as the original would.
//
// This is also a commercial position, not only a legal one. telc licenses
// examination centres and vets applicants; becoming one scores 66/100 in
// /Users/harsh/B2/docs (Business D) and is the only route that manufactures
// first-party outcome data at volume. Redistributing telc's papers is the
// fastest way to make that permanently impossible.
//
// Routing to free material by name is a FEATURE -- docs/00-index.md constraint 7.
// We charge for the judgement, not for content that is already free and better
// than ours would be.

const RESOURCES = [
  // ---- telc, official ----
  {
    id: "telc_b2_mock",
    board: "telc",
    kind: "mock_exam",
    label_de: "telc Deutsch B2 — Übungstest (komplett, mit Audio)",
    label_en: "telc Deutsch B2 mock exam, complete with audio",
    url: "https://www.telc.net/fileadmin/user_upload/mock_exams/Deutsch/telc_deutsch_b2.zip",
    owner: "telc gGmbH",
    note: "Full mock with audio and marked writing samples. The single best free preparation artefact in the market.",
    weakness_ids: [],
  },
  {
    id: "telc_b2_handbook",
    board: "telc",
    kind: "handbook",
    label_de: "telc Deutsch B2 — Handbuch (Testformat & Bewertung)",
    label_en: "telc Deutsch B2 handbook — test format and assessment",
    url: "https://www.telc.net/fileadmin/user_upload/pdfs/Handbuch_und_Tipps_fuer_Pruefungsvorbereitung/Deutsch_B2_Handbuch.pdf",
    owner: "telc gGmbH",
    note: "Source of the telc rubric represented in b2_rubrics. Criteria names taken from here, not from secondary sites.",
    weakness_ids: [],
  },
  {
    id: "telc_b2_tips",
    board: "telc",
    kind: "exam_tips",
    label_de: "telc Deutsch B2 — Tipps zur Prüfungsvorbereitung",
    label_en: "telc Deutsch B2 exam preparation tips",
    url: "https://www.telc.net/fileadmin/user_upload/pdfs/Handbuch_und_Tipps_fuer_Pruefungsvorbereitung/Deutsch_B2_tipps_zur_Pruefungsvorbereitung.pdf",
    owner: "telc gGmbH",
    weakness_ids: [],
  },

  // ---- Goethe, official ----
  {
    id: "goethe_b2_modellsatz",
    board: "goethe",
    kind: "mock_exam",
    label_de: "Goethe-Zertifikat B2 — Modellsatz Erwachsene",
    label_en: "Goethe-Zertifikat B2 model set, adults",
    url: "https://www.goethe.de/pro/relaunch/prf/materialien/B2/b2_modellsatz_erwachsene.pdf",
    owner: "Goethe-Institut",
    weakness_ids: [],
  },
  {
    id: "goethe_b2_durchfuehrung",
    board: "goethe",
    kind: "exam_rules",
    label_de: "Goethe-Zertifikat B2 — Durchführungsbestimmungen",
    label_en: "Goethe-Zertifikat B2 examination regulations",
    url: "https://www.goethe.de/pro/relaunch/prf/en/Durchfuehrungsbestimmungen_B2.pdf",
    owner: "Goethe-Institut",
    note: "Modularity, the 60-point pass line, and double marking with a third rater at the border.",
    weakness_ids: [],
  },

  // ---- Free input, routed per weakness ----
  {
    id: "dw_nachrichten",
    board: null,
    kind: "input",
    label_de: "DW — Langsam gesprochene Nachrichten",
    label_en: "Deutsche Welle slowly spoken news",
    url: "https://learngerman.dw.com/de/nachrichten/l-37344565",
    owner: "Deutsche Welle",
    weakness_ids: ["hoeren_detail"],
  },
  {
    id: "dw_video_thema",
    board: null,
    kind: "input",
    label_de: "DW — Video-Thema (B2/C1)",
    label_en: "Deutsche Welle Video-Thema",
    url: "https://learngerman.dw.com/de/video-thema/s-12165",
    owner: "Deutsche Welle",
    weakness_ids: ["hoeren_detail", "wortschatz_abstrakt"],
  },
  {
    id: "easy_german",
    board: null,
    kind: "input",
    label_de: "Easy German — Straßeninterviews",
    label_en: "Easy German street interviews",
    url: "https://www.easygerman.org/",
    owner: "Easy German",
    note: "Named by an interviewed learner as the single most useful resource they use.",
    weakness_ids: ["hoeren_detail", "register_break"],
  },
];

const byId = Object.fromEntries(RESOURCES.map(r => [r.id, r]));

function forWeakness(weaknessId, board = null) {
  return RESOURCES.filter(r =>
    r.weakness_ids.includes(weaknessId) && (!r.board || !board || r.board === board)
  );
}

function forBoard(board) {
  return RESOURCES.filter(r => r.board === board || r.board === null);
}

module.exports = { RESOURCES, byId, forWeakness, forBoard };
