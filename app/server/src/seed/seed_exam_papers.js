/**
 * SEED — first real Goethe B2 and telc B2 exam-practice content.
 *
 *   node src/seed/seed_exam_papers.js [--force]
 *
 * A vertical slice, not the corpus: one Goethe Lesen practice set and one
 * telc Sprachbausteine practice set — Sprachbausteine specifically because it
 * has no equivalent in Goethe's format, so it is the one component that
 * proves "telc is a genuinely different exam, not Goethe relabelled."
 *
 * Both use the SAME polymorphic paper model core-2026b already proved out
 * (b2_papers -> b2_paper_sections -> b2_paper_items), served through the same
 * assessment_content.js provider and the same 9-item-type client renderer —
 * see assessment_content.js's groupOf() for the one-line change that let
 * these papers in. `exam_paper.js` is the only new runtime code; everything
 * else is reuse.
 *
 * PROVENANCE: both are Skillcase-authored, exam-format practice —
 * alignment='exam_format_practice', source_type='ORIGINAL'. Neither claims to
 * be an official Goethe or telc question. review_status stops at
 * AUTO_QA_PASS: no SME has reviewed this content, and nothing here pretends
 * otherwise.
 */
require("../env")();
const pool = require("../db/pool");
const model = require("../b2/content_model");

const FORCE = process.argv.includes("--force");

/* ── GOETHE B2 — LESEN, PRACTICE SET 1 ─────────────────────────────────── */

const GOETHE_LESEN_1 = {
  paper: {
    id: "goethe-b2-lesen-1",
    board: "goethe",
    title: "Goethe-Zertifikat B2 — Lesen, Übungsset 1",
    minutes: 15,
    source: "Skillcase, authored. Exam-format practice for Goethe B2 Lesen — not an official Goethe question.",
    exam_version: "B2",
    alignment: "exam_format_practice",
  },
  section: {
    module: "lesen", title: "Forum: Vertrauensarbeitszeit — nur ein Vorteil?",
    instruction: "Lesen Sie den Forumsbeitrag und beantworten Sie die Aufgaben.",
    minutes: 15,
    passage: `Seit einem Jahr können wir bei uns im Betrieb unsere Arbeitszeit frei einteilen, solange die Aufgaben erledigt werden. Am Anfang war ich begeistert: keine Stechuhr mehr, keine Diskussion darüber, wer wann kommt. Inzwischen sehe ich das nüchterner.

Der Vorteil ist real: Wer abends produktiver ist, muss sich nicht mehr morgens zur Arbeit zwingen. Auch Arzttermine oder die Kinderbetreuung lassen sich leichter unterbringen.

Was mir dagegen zu schaffen macht, ist die stille Erwartung, immer erreichbar zu sein. Niemand sagt es offen, aber wer abends um acht keine E-Mail beantwortet, gilt schnell als wenig engagiert. Die Grenze zwischen Arbeit und Freizeit verschwimmt genau dort, wo sie eigentlich klarer werden sollte.

Ein Kollege hat kürzlich vorgeschlagen, feste "Nicht-erreichbar"-Zeiten im Kalender einzutragen. Das halte ich für einen guten Ansatz — nicht, weil die Freiheit falsch wäre, sondern weil sie ohne klare Regeln zulasten der eigenen Erholung geht.

Zurück zur Stechuhr möchte ich trotzdem nicht.`,
    skill: "reading", scoring_mode: "OBJECTIVE",
  },
  items: [
    { item_type: "MCQ", skill: "reading", capability: "structure", difficulty: "B",
      stem: "Wie hat sich die Einstellung des Autors zur Vertrauensarbeitszeit entwickelt?",
      options: ["Er lehnt sie inzwischen komplett ab.", "Er sieht sie inzwischen differenzierter als am Anfang.", "Er hat seine Meinung nicht geändert."],
      answer: 1,
      rationale: "Er war zunächst begeistert (\"Am Anfang war ich begeistert\"), sieht es jetzt aber \"nüchterner\" — eine differenziertere Sicht, keine Ablehnung." },
    { item_type: "TRUE_FALSE", skill: "reading", capability: "summarise", difficulty: "A",
      stem: "Der Autor sagt, dass niemand offen verlangt, ständig erreichbar zu sein.",
      answer_value: true,
      rationale: "\"Niemand sagt es offen\" — genau das beschreibt der Text." },
    { item_type: "MCQ", skill: "reading", capability: "exemplify", difficulty: "B",
      stem: "Was schlägt der Kollege des Autors konkret vor?",
      options: ["Wieder eine Stechuhr einzuführen.", "Feste Zeiten der Nicht-Erreichbarkeit im Kalender festzuhalten.", "Die Vertrauensarbeitszeit ganz abzuschaffen."],
      answer: 1,
      rationale: "\"…feste 'Nicht-erreichbar'-Zeiten im Kalender einzutragen.\"" },
    { item_type: "MCQ", skill: "reading", capability: "language_awareness", difficulty: "C",
      stem: "Was bedeutet im Text die Wendung \"zu schaffen machen\"?",
      options: ["etwas neu erschaffen", "jemandem Mühe oder Sorgen bereiten", "etwas reparieren"],
      answer: 1,
      rationale: "\"Zu schaffen machen\" ist eine feste Wendung für \"Sorgen/Mühe bereiten\" — nicht wörtlich zu verstehen." },
    { item_type: "MULTI_SELECT", skill: "reading", capability: "summarise", difficulty: "B",
      stem: "Welche zwei Aussagen zur Vertrauensarbeitszeit treffen laut Text zu?",
      options: ["Vertrauensarbeitszeit erleichtert private Termine.", "Der Autor arbeitet seit einem Jahr in Vertrauensarbeitszeit.", "Der Autor möchte zur Stechuhr zurückkehren.", "Die Firma hat feste Nicht-erreichbar-Zeiten eingeführt."],
      correct: [0, 1],
      rationale: "\"Seit einem Jahr…\" und \"Auch Arzttermine…lassen sich leichter unterbringen.\" Der Autor will ausdrücklich NICHT zur Stechuhr zurück, und feste Zeiten sind nur ein Vorschlag, keine eingeführte Regel." },
  ],
};

/* ── TELC B2 — SPRACHBAUSTEINE, PRACTICE SET 1 ─────────────────────────── */
/* The one component that has no Goethe equivalent at all — a running text
   with six numbered gaps, each its own 3-option item, same MCQ machinery. */

const TELC_SPRACHBAUSTEINE_1 = {
  paper: {
    id: "telc-b2-sprachbausteine-1",
    board: "telc",
    title: "telc Deutsch B2 — Sprachbausteine, Übungsset 1",
    minutes: 15,
    source: "Skillcase, authored. Exam-format practice for telc B2 Sprachbausteine — not an official telc question.",
    exam_version: "B2",
    alignment: "exam_format_practice",
  },
  section: {
    module: "sprachbausteine", title: "Weiterbildung im Berufsalltag",
    instruction: "Wählen Sie für jede Lücke die richtige Lösung (a, b oder c).",
    minutes: 15,
    passage: `Viele Beschäftigte wünschen sich mehr Weiterbildung, (1) ___ ihnen dafür oft die Zeit fehlt. Der Arbeitgeber müsste solche Angebote nicht nur ermöglichen, (2) ___ auch aktiv fördern. (3) ___ eines internen Seminars könnten die Kosten für externe Kurse teilweise übernommen werden. Wichtig ist, dass die Weiterbildung tatsächlich (4) ___ die Bedürfnisse der Mitarbeitenden abgestimmt ist. Nur so lässt sich verhindern, dass die (5) ___ Zeit ohne echten Nutzen bleibt. Am Ende profitieren (6) ___ das Unternehmen als auch die Beschäftigten selbst davon.`,
    skill: "grammar", scoring_mode: "OBJECTIVE",
  },
  items: [
    { item_type: "MCQ", skill: "grammar", capability: "structure", difficulty: "B",
      stem: "Lücke 1: \"…mehr Weiterbildung, ___ ihnen dafür oft die Zeit fehlt.\"",
      options: ["obwohl", "weil", "damit"], answer: 0,
      rationale: "Konzessiv: der Wunsch besteht TROTZ fehlender Zeit — \"obwohl\" leitet den Gegensatz ein." },
    { item_type: "MCQ", skill: "grammar", capability: "structure", difficulty: "B",
      stem: "Lücke 2: \"…nicht nur ermöglichen, ___ auch aktiv fördern.\"",
      options: ["sondern", "aber", "oder"], answer: 0,
      rationale: "Zweiteiliger Konnektor \"nicht nur…sondern auch\"." },
    { item_type: "MCQ", skill: "grammar", capability: "language_awareness", difficulty: "C",
      stem: "Lücke 3: \"___ eines internen Seminars könnten die Kosten für externe Kurse teilweise übernommen werden.\"",
      options: ["Anstelle", "Trotz", "Während"], answer: 0,
      rationale: "\"Anstelle\" (Genitivpräposition) passt inhaltlich: EIN Angebot ersetzt das andere. \"Trotz\"/\"Während\" sind ebenfalls Genitivpräpositionen, ergeben hier aber keinen Sinn." },
    { item_type: "MCQ", skill: "grammar", capability: "language_awareness", difficulty: "B",
      stem: "Lücke 4: \"…dass die Weiterbildung tatsächlich ___ die Bedürfnisse der Mitarbeitenden abgestimmt ist.\"",
      options: ["auf", "für", "mit"], answer: 0,
      rationale: "Feste Verb-Präposition-Verbindung: \"etwas auf etwas abstimmen\" (+Akkusativ)." },
    { item_type: "MCQ", skill: "grammar", capability: "language_awareness", difficulty: "C",
      stem: "Lücke 5: \"…dass die ___ Zeit ohne echten Nutzen bleibt.\"",
      options: ["investierte", "investierende", "investiert"], answer: 0,
      rationale: "Partizip-II-Adjektiv, korrekt endend: \"die investierte Zeit\" (die Zeit, die investiert WURDE)." },
    { item_type: "MCQ", skill: "grammar", capability: "structure", difficulty: "B",
      stem: "Lücke 6: \"Am Ende profitieren ___ das Unternehmen als auch die Beschäftigten selbst davon.\"",
      options: ["sowohl", "weder", "entweder"], answer: 0,
      rationale: "Zweiteiliger Konnektor \"sowohl…als auch\"." },
  ],
};

/* ── GOETHE B2 — LESEN, PRACTICE SET 2 ──────────────────────────────────── */

const GOETHE_LESEN_2 = {
  paper: {
    id: "goethe-b2-lesen-2",
    board: "goethe",
    title: "Goethe-Zertifikat B2 — Lesen, Übungsset 2",
    minutes: 15,
    source: "Skillcase, authored. Exam-format practice for Goethe B2 Lesen — not an official Goethe question.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  section: {
    module: "lesen", title: "Forum: Digitale Kompetenz — wer bildet sich wie weiter?",
    instruction: "Lesen Sie den Forumsbeitrag und beantworten Sie die Aufgaben.",
    minutes: 15,
    passage: `Als unsere Abteilung vor zwei Jahren auf eine neue Software umgestellt hat, gab es genau eine halbtägige Schulung. Wer danach noch Fragen hatte, war auf sich gestellt. Ich habe mir vieles über Videos im Internet beigebracht — nicht ideal, aber es hat funktioniert.

Inzwischen sehe ich das kritischer. Nicht jeder lernt gern allein vor dem Bildschirm, und "man findet ja alles online" ist eine bequeme Ausrede der Geschäftsführung, um in echte Weiterbildung nicht investieren zu müssen. Gerade Kolleginnen und Kollegen, die seit Jahrzehnten mit Papierakten gearbeitet haben, brauchen mehr als ein Erklärvideo.

Was mich optimistisch stimmt: Seit diesem Jahr gibt es intern ein Mentoring-Programm. Wer sich in einem Bereich auskennt, gibt sein Wissen an eine Kollegin oder einen Kollegen weiter, die oder der neu einsteigt. Das kostet Zeit, aber die Ergebnisse sind spürbar besser als jedes Video.

Ich wünsche mir, dass Digitalkompetenz genauso ernst genommen wird wie fachliche Weiterbildung — mit festen Terminen, nicht nebenbei.`,
    skill: "reading", scoring_mode: "OBJECTIVE",
  },
  items: [
    { item_type: "MCQ", skill: "reading", capability: "structure", difficulty: "B",
      stem: "Wie beurteilt die Autorin/der Autor die ursprüngliche Schulung zur neuen Software?",
      options: ["Als völlig ausreichend.", "Als zu kurz und ohne echte Unterstützung danach.", "Als überflüssig, weil alles online zu finden war."],
      answer: 1,
      rationale: "\"…eine halbtägige Schulung. Wer danach noch Fragen hatte, war auf sich gestellt.\"" },
    { item_type: "TRUE_FALSE", skill: "reading", capability: "concede", difficulty: "B",
      stem: "Die Autorin/der Autor hält \"man findet ja alles online\" für eine faire Position der Geschäftsführung.",
      answer_value: false,
      rationale: "\"…eine bequeme Ausrede der Geschäftsführung, um in echte Weiterbildung nicht investieren zu müssen.\"" },
    { item_type: "MCQ", skill: "reading", capability: "exemplify", difficulty: "A",
      stem: "Was ist seit diesem Jahr neu in der Abteilung?",
      options: ["Eine zweite Software-Schulung.", "Ein internes Mentoring-Programm.", "Feste wöchentliche Videositzungen."],
      answer: 1,
      rationale: "\"Seit diesem Jahr gibt es intern ein Mentoring-Programm.\"" },
    { item_type: "MCQ", skill: "reading", capability: "language_awareness", difficulty: "C",
      stem: "Was bedeutet im Text \"auf sich gestellt sein\"?",
      options: ["von anderen unterstützt werden", "allein zurechtkommen müssen", "eine feste Aufgabe bekommen"],
      answer: 1,
      rationale: "\"Auf sich gestellt sein\" heißt, ohne Hilfe zurechtkommen zu müssen — genau das beschreibt die Situation nach der Schulung." },
    { item_type: "MULTI_SELECT", skill: "reading", capability: "summarise", difficulty: "B",
      stem: "Welche zwei Aussagen treffen laut Text zu?",
      options: ["Nicht jeder lernt gern allein vor dem Bildschirm.", "Die Firma hat feste Weiterbildungstermine eingeführt.", "Das Mentoring-Programm bringt spürbar bessere Ergebnisse als Videos.", "Die Autorin/der Autor lehnt Videos zum Lernen grundsätzlich ab."],
      correct: [0, 2],
      rationale: "Beide Aussagen stehen wörtlich im Text; feste Termine sind ein WUNSCH am Ende, keine eingeführte Regel, und Videos werden nicht grundsätzlich abgelehnt, nur als unzureichend beschrieben." },
  ],
};

/* ── GOETHE B2 — SCHREIBEN, PRACTICE SET 1 ─────────────────────────────── */
/* Reuses the existing goethe/forumsbeitrag rubric (b2_rubrics id 1) rather
   than authoring a new one — same rubric the writing-practice pipeline
   elsewhere in this product already validates against. Captured, not
   auto-scored: the same honest choice core-2026b's own W1 item already
   makes for RUBRIC-scored writing (see assessment_content.js:grade — RUBRIC
   items always return null, on purpose). A richer auto-feedback pipeline
   exists elsewhere (gate.js/analyse.js, behind /produce) and routing exam
   Schreiben through it is real future work, not attempted here. */

const GOETHE_SCHREIBEN_1 = {
  paper: {
    id: "goethe-b2-schreiben-1",
    board: "goethe",
    title: "Goethe-Zertifikat B2 — Schreiben, Übungsset 1",
    minutes: 30,
    source: "Skillcase, authored. Exam-format practice for Goethe B2 Schreiben Teil 1 — not an official Goethe task.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  section: {
    module: "schreiben", title: "Forumsbeitrag: Großraumbüros",
    instruction: "Schreiben Sie einen Beitrag für das Forum. Gehen Sie auf alle Punkte ein.",
    minutes: 30, skill: "writing", scoring_mode: "RUBRIC",
  },
  items: [
    { item_type: "LONG_TEXT", skill: "writing", capability: "argue", difficulty: "B",
      rubric_id: 1, rubric_key: "forumsbeitrag", min_words: 180, target_words: 200,
      stem: "In einem Online-Forum wird diskutiert, ob Großraumbüros die Zusammenarbeit fördern oder eher stören. Schreiben Sie einen Beitrag für das Forum.",
      rationale: "Bewertungskriterien: Strukturieren Sie Ihren Beitrag klar (Einleitung, persönliche Ansicht, Vor- und Nachteile mit Begründung, persönliches Beispiel und ein konkreter Verbesserungsvorschlag). Achten Sie auf B2-Konnektoren und korrekte Satzstrukturen im Nebensatz.",
      guidance: ["Sagen Sie, was Sie von Großraumbüros halten.",
                  "Nennen Sie einen Vorteil und einen Nachteil.",
                  "Machen Sie einen konkreten Verbesserungsvorschlag."] },
  ],
};

/* ── GOETHE B2 — SPRECHEN, PRACTICE SET 1 ──────────────────────────────── */
/* TRANSCRIPT_ONLY, same policy as core-2026b's S1: captured, never banded,
   never invented as a CEFR/exam score. */

const GOETHE_SPRECHEN_1 = {
  paper: {
    id: "goethe-b2-sprechen-1",
    board: "goethe",
    title: "Goethe-Zertifikat B2 — Sprechen, Übungsset 1",
    minutes: 5,
    source: "Skillcase, authored. Exam-format practice for Goethe B2 Sprechen Teil 1 — not an official Goethe task.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  section: {
    module: "sprechen", title: "Kurzvortrag: Homeoffice-Vorgaben",
    instruction: "Sprechen Sie etwa 3 Minuten zu dem Thema.",
    minutes: 5, skill: "speaking", scoring_mode: "TRANSCRIPT_ONLY",
  },
  items: [
    { item_type: "SPOKEN_RESPONSE", skill: "speaking", capability: "argue", difficulty: "B",
      prep_seconds: 60, speak_seconds: 180,
      stem: "Sollten Unternehmen ihren Mitarbeitenden vorschreiben dürfen, wie oft sie im Homeoffice arbeiten? Nehmen Sie Stellung und begründen Sie Ihre Meinung. Sprechen Sie etwa 3 Minuten.",
      rationale: "Bewertungskriterien: Klar gegliederter Kurzvortrag mit Einleitung, Argumenten für und wider, eigener Positionierung und Schlussfolgerung. Nutzen Sie B2-Redemittel zur Meinungsäußerung und sprechen Sie frei und flüssig." },
  ],
};

/* ── GOETHE B2 — HÖREN, PRACTICE SET 1 ─────────────────────────────────── */
/* This is deliberately NOT the frozen `gx_hoeren_t1` row or its bespoke
   Hören-Teil-1 engine (exam_attempt.js/exam_section.js/HoerenTeil1.jsx —
   Experience 6, standing instruction: do not modify). This is new,
   original content served through the same generic polymorphic paper
   engine every other standalone set here already uses, exactly the way
   the Listening practice-bank pass added practice-listening-1..30 rather
   than touching the frozen engine. board='goethe', alignment=
   'exam_format_practice': original Skillcase exam-style practice, never
   claimed as an official Goethe recording. Audio is generated by
   tools/make_exam_audio.js after seeding — see that file. */

const GOETHE_HOEREN_1 = {
  paper: {
    id: "goethe-b2-hoeren-1",
    board: "goethe",
    title: "Goethe-Zertifikat B2 — Hören, Übungsset 1",
    minutes: 8,
    source: "Skillcase, original transcript and audio (Azure Neural TTS). Exam-format practice for Goethe B2 Hören — not an official Goethe recording.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  section: {
    module: "hoeren", title: "Kurzvortrag: Ergebnisse eines Mitarbeitergesprächs",
    instruction: "Hören Sie den Kurzvortrag einmal und beantworten Sie die Aufgaben.",
    minutes: 8, skill: "listening", scoring_mode: "OBJECTIVE",
    audio_required: true, audio_intended_id: "goethe_hoeren_1_mitarbeitergespraech",
    turns: [
      { voice: "conrad", speaker: "Personalleiter", text: "Ich fasse kurz die Ergebnisse unserer diesjährigen Mitarbeitergespräche zusammen. Insgesamt wurden 84 Gespräche geführt, das sind fast alle Beschäftigten. Der am häufigsten genannte Wunsch war mehr Klarheit über Aufstiegsmöglichkeiten — das nannten über die Hälfte der Befragten. An zweiter Stelle stand der Wunsch nach flexibleren Arbeitszeiten, allerdings mit deutlichem Abstand. Positiv überrascht hat uns, dass die Zufriedenheit mit der Zusammenarbeit im Team im Vergleich zum Vorjahr spürbar gestiegen ist. Als nächsten Schritt werden wir im Herbst ein klareres Modell für Karrierestufen vorstellen, das sich direkt aus diesen Rückmeldungen ergibt." },
    ],
  },
  items: [
    { item_type: "MCQ", skill: "listening", capability: "understand_speech", difficulty: "A",
      stem: "Wie viele Mitarbeitergespräche wurden insgesamt geführt?",
      options: ["84", "48", "8"], answer: 0,
      rationale: "\"Insgesamt wurden 84 Gespräche geführt.\"" },
    { item_type: "MCQ", skill: "listening", capability: "understand_speech", difficulty: "B",
      stem: "Was war der am häufigsten genannte Wunsch?",
      options: ["Mehr Klarheit über Aufstiegsmöglichkeiten.", "Flexiblere Arbeitszeiten.", "Ein höheres Gehalt."], answer: 0,
      rationale: "\"Der am häufigsten genannte Wunsch war mehr Klarheit über Aufstiegsmöglichkeiten.\"" },
    { item_type: "TRUE_FALSE", skill: "listening", capability: "understand_speech", difficulty: "B",
      stem: "Flexiblere Arbeitszeiten wurden genauso oft genannt wie Aufstiegsmöglichkeiten.",
      answer_value: false,
      rationale: "\"An zweiter Stelle … allerdings mit deutlichem Abstand\" — nicht gleich häufig." },
    { item_type: "MCQ", skill: "listening", capability: "justify", difficulty: "C",
      stem: "Was hat den Personalleiter positiv überrascht?",
      options: ["Die gestiegene Zufriedenheit mit der Teamzusammenarbeit.", "Die niedrige Teilnahmequote.", "Der Wunsch nach mehr Homeoffice."], answer: 0,
      rationale: "\"Positiv überrascht hat uns, dass die Zufriedenheit mit der Zusammenarbeit im Team … spürbar gestiegen ist.\"" },
  ],
};

/* ── GOETHE B2 — HÖREN, PRACTICE SET 2 ─────────────────────────────────── */

const GOETHE_HOEREN_2 = {
  paper: {
    id: "goethe-b2-hoeren-2",
    board: "goethe",
    title: "Goethe-Zertifikat B2 — Hören, Übungsset 2",
    minutes: 8,
    source: "Skillcase, original transcript and audio (Azure Neural TTS). Exam-format practice for Goethe B2 Hören — not an official Goethe recording.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  section: {
    module: "hoeren", title: "Interview: Wechsel in die Selbstständigkeit",
    instruction: "Hören Sie das Interview einmal und beantworten Sie die Aufgaben.",
    minutes: 8, skill: "listening", scoring_mode: "OBJECTIVE",
    audio_required: true, audio_intended_id: "goethe_hoeren_2_selbststaendigkeit",
    turns: [
      { voice: "mia", speaker: "Moderatorin", text: "Frau Albrecht, Sie haben vor zwei Jahren Ihre Festanstellung aufgegeben, um sich selbstständig zu machen. War das eine spontane Entscheidung?" },
      { voice: "ingrid", speaker: "Frau Albrecht", text: "Ganz im Gegenteil. Ich habe über ein Jahr lang nebenbei erste Kunden aufgebaut, bevor ich den Schritt gewagt habe. Ohne dieses finanzielle Polster hätte ich mich das nicht getraut." },
      { voice: "mia", speaker: "Moderatorin", text: "Was war die größte Herausforderung am Anfang?" },
      { voice: "ingrid", speaker: "Frau Albrecht", text: "Eindeutig die Buchhaltung. Ich hatte völlig unterschätzt, wie viel Zeit Rechnungen, Steuern und Verträge kosten — Zeit, die dann für die eigentliche Arbeit fehlte." },
      { voice: "mia", speaker: "Moderatorin", text: "Würden Sie es wieder so machen?" },
      { voice: "ingrid", speaker: "Frau Albrecht", text: "Auf jeden Fall, aber ich würde von Anfang an eine Steuerberaterin einbeziehen, statt das ein Jahr lang allein zu versuchen." },
    ],
  },
  items: [
    { item_type: "TRUE_FALSE", skill: "listening", capability: "understand_speech", difficulty: "A",
      stem: "Frau Albrecht hat sich spontan, ohne Vorbereitung, selbstständig gemacht.",
      answer_value: false,
      rationale: "\"Ganz im Gegenteil. Ich habe über ein Jahr lang nebenbei erste Kunden aufgebaut.\"" },
    { item_type: "MCQ", skill: "listening", capability: "justify", difficulty: "B",
      stem: "Warum konnte Frau Albrecht den Schritt in die Selbstständigkeit wagen?",
      options: ["Wegen eines finanziellen Polsters aus vorheriger Kundenarbeit.", "Wegen eines Kredits der Bank.", "Wegen eines Erbes."], answer: 0,
      rationale: "\"Ohne dieses finanzielle Polster hätte ich mich das nicht getraut.\"" },
    { item_type: "MCQ", skill: "listening", capability: "understand_speech", difficulty: "B",
      stem: "Was nennt Frau Albrecht als größte Herausforderung am Anfang?",
      options: ["Die Buchhaltung.", "Die Kundengewinnung.", "Die technische Ausstattung."], answer: 0,
      rationale: "\"Eindeutig die Buchhaltung.\"" },
    { item_type: "MCQ", skill: "listening", capability: "speculate", difficulty: "C",
      stem: "Was würde Frau Albrecht rückblickend anders machen?",
      options: ["Von Anfang an eine Steuerberaterin einbeziehen.", "Später selbstständig werden.", "Ganz auf die Selbstständigkeit verzichten."], answer: 0,
      rationale: "\"Ich würde von Anfang an eine Steuerberaterin einbeziehen, statt das ein Jahr lang allein zu versuchen.\"" },
  ],
};

/* ── TELC B2 — SPRACHBAUSTEINE, PRACTICE SET 2 ─────────────────────────── */
/* Different grammar points from set 1: relative clause, passive, comparison
   structure, TEKAMOLO word order, indefinite pronoun, causal connector —
   genuinely distinct coverage, not the same six points restated. */

const TELC_SPRACHBAUSTEINE_2 = {
  paper: {
    id: "telc-b2-sprachbausteine-2",
    board: "telc",
    title: "telc Deutsch B2 — Sprachbausteine, Übungsset 2",
    minutes: 15,
    source: "Skillcase, authored. Exam-format practice for telc B2 Sprachbausteine — not an official telc question.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  section: {
    module: "sprachbausteine", title: "Flexible Arbeitsmodelle",
    instruction: "Wählen Sie für jede Lücke die richtige Lösung (a, b oder c).",
    minutes: 15,
    passage: `Immer mehr Betriebe bieten Modelle an, (1) ___ Beschäftigte ihre Arbeitszeit selbst einteilen können. Diese Modelle werden von vielen (2) ___ akzeptiert als noch vor einigen Jahren. Ein Vorteil solcher Modelle ist, dass sie sich (3) ___ jeder Lebensphase bewähren — ob mit kleinen Kindern oder pflegebedürftigen Angehörigen. Kritiker weisen (4) ___ hin, dass ohne klare Absprachen Missverständnisse entstehen können. Manche Teams treffen sich deshalb einmal (5) ___ Woche persönlich, um Absprachen zu treffen. So bleibt der Kontakt bestehen, (6) ___ die Arbeitszeiten sich unterscheiden.`,
    skill: "grammar", scoring_mode: "OBJECTIVE",
  },
  items: [
    { item_type: "MCQ", skill: "grammar", capability: "structure", difficulty: "B",
      stem: "Lücke 1: \"…Modelle an, ___ Beschäftigte ihre Arbeitszeit selbst einteilen können.\"",
      options: ["bei denen", "die", "wobei"], answer: 0,
      rationale: "Relativsatz mit Präposition: \"Modelle, BEI DENEN man…\" — das Bezugswort verlangt die Präposition \"bei\" + Relativpronomen im Dativ." },
    { item_type: "MCQ", skill: "grammar", capability: "language_awareness", difficulty: "B",
      stem: "Lücke 2: \"Diese Modelle werden von vielen ___ akzeptiert als noch vor einigen Jahren.\"",
      options: ["breiter", "breit", "am breitesten"], answer: 0,
      rationale: "Vergleichsstruktur mit \"als\" verlangt den Komparativ (\"breiter… als\"), nicht den Positiv oder Superlativ." },
    { item_type: "MCQ", skill: "grammar", capability: "language_awareness", difficulty: "C",
      stem: "Lücke 3: \"…dass sie sich ___ jeder Lebensphase bewähren.\"",
      options: ["in", "an", "auf"], answer: 0,
      rationale: "Feste reflexive Verb-Präposition-Verbindung: \"sich in etwas (Dativ) bewähren\" — die Modelle bewähren sich IN jeder Lebensphase. \"An\"/\"auf\" bilden mit \"sich bewähren\" keine feste Verbindung." },
    { item_type: "MCQ", skill: "grammar", capability: "structure", difficulty: "B",
      stem: "Lücke 4: \"Kritiker weisen ___ hin, dass ohne klare Absprachen Missverständnisse entstehen können.\"",
      options: ["darauf", "davon", "dabei"], answer: 0,
      rationale: "Feste Verbindung \"auf etwas hinweisen\" — Pronominaladverb \"darauf\" leitet den folgenden dass-Satz ein." },
    { item_type: "MCQ", skill: "grammar", capability: "language_awareness", difficulty: "A",
      stem: "Lücke 5: \"…treffen sich deshalb einmal ___ Woche persönlich.\"",
      options: ["die", "der", "einer"], answer: 0,
      rationale: "Feste Zeitangabe \"einmal DIE Woche\" (= pro Woche) — Akkusativ in dieser festen Wendung." },
    { item_type: "MCQ", skill: "grammar", capability: "structure", difficulty: "B",
      stem: "Lücke 6: \"So bleibt der Kontakt bestehen, ___ die Arbeitszeiten sich unterscheiden.\"",
      options: ["auch wenn", "sodass", "weil"], answer: 0,
      rationale: "Konzessiv: der Kontakt bleibt TROTZ unterschiedlicher Arbeitszeiten bestehen — \"auch wenn\" leitet den Gegensatz ein." },
  ],
};

/* ── TELC B2 — SCHREIBEN, PRACTICE SET 1 ───────────────────────────────── */
/* Reuses the existing telc/halbformelle_email rubric (b2_rubrics id 2). */

const TELC_SCHREIBEN_1 = {
  paper: {
    id: "telc-b2-schreiben-1",
    board: "telc",
    title: "telc Deutsch B2 — Schreiben, Übungsset 1",
    minutes: 30,
    source: "Skillcase, authored. Exam-format practice for telc B2 Schreiben — not an official telc task.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  section: {
    module: "schreiben", title: "Halbformelle E-Mail: Vertretung bei einem Kundentermin",
    instruction: "Schreiben Sie eine E-Mail. Gehen Sie auf alle Punkte ein.",
    minutes: 30, skill: "writing", scoring_mode: "RUBRIC",
  },
  items: [
    { item_type: "LONG_TEXT", skill: "writing", capability: "structure", difficulty: "B",
      rubric_id: 2, rubric_key: "halbformelle_email", min_words: 120, target_words: 150,
      stem: "Ihre Kollegin kann kommende Woche krankheitsbedingt nicht an einem wichtigen Kundentermin teilnehmen und hat Sie gebeten, sie zu vertreten. Schreiben Sie eine E-Mail an Ihre Vorgesetzte.",
      rationale: "Bewertungskriterien: Angemessene halbformelle Anrede und Grußformel, klare Erklärung des Schreibanlasses, nachvollziehbarer Vertretungsvorschlag und präzise Bitte an die Vorgesetzte unter Verwendung des Höflichkeitskonjunktivs.",
      guidance: ["Erklären Sie kurz, warum Sie schreiben.",
                 "Schlagen Sie vor, wie der Termin trotzdem stattfinden kann.",
                 "Sagen Sie, was Sie von Ihrer Vorgesetzten dafür brauchen."] },
  ],
};

/* ── TELC B2 — SPRECHEN, PRACTICE SET 1 ────────────────────────────────── */

const TELC_SPRECHEN_1 = {
  paper: {
    id: "telc-b2-sprechen-1",
    board: "telc",
    title: "telc Deutsch B2 — Sprechen, Übungsset 1",
    minutes: 4,
    source: "Skillcase, authored. Exam-format practice for telc B2 Sprechen (Gemeinsam etwas planen) — not an official telc task.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  section: {
    module: "sprechen", title: "Gemeinsam planen: Betriebsausflug",
    instruction: "Sprechen Sie etwa 2 Minuten.",
    minutes: 4, skill: "speaking", scoring_mode: "TRANSCRIPT_ONLY",
  },
  items: [
    { item_type: "SPOKEN_RESPONSE", skill: "speaking", capability: "maintain_discussion", difficulty: "B",
      prep_seconds: 30, speak_seconds: 120,
      stem: "Sie planen mit einer Kollegin/einem Kollegen einen Betriebsausflug. Schlagen Sie vor, wohin die Gruppe fahren könnte, und begründen Sie Ihren Vorschlag. Sprechen Sie etwa 2 Minuten.",
      rationale: "Bewertungskriterien: Aktive Gesprächsführung und Interaktion. Machen Sie konkrete Vorschläge zum Ausflug, begründen Sie diese, gehen Sie auf Einwände des Partners ein und treffen Sie am Ende eine gemeinsame Vereinbarung." },
  ],
};

/* ── TELC B2 — HÖREN, PRACTICE SET 1 ───────────────────────────────────── */
/* Original Skillcase content, never claimed as official telc audio. telc's
   real Hörverstehen has three distinct Teile (short announcements,
   interview, discussion); each standalone set here models ONE of those
   registers at set-granularity, matching how every other standalone
   telc/Goethe set in this file is one thematic unit, not a full multi-part
   exam. Set 1 models Teil 1's register: a short workplace announcement. */

const TELC_HOEREN_1 = {
  paper: {
    id: "telc-b2-hoeren-1",
    board: "telc",
    title: "telc Deutsch B2 — Hören, Übungsset 1",
    minutes: 6,
    source: "Skillcase, original transcript and audio (Azure Neural TTS). Exam-format practice for telc B2 Hörverstehen — not an official telc recording.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  section: {
    module: "hoeren", title: "Durchsage: Änderung der Kantinenöffnungszeiten",
    instruction: "Hören Sie die Durchsage einmal und beantworten Sie die Aufgaben.",
    minutes: 6, skill: "listening", scoring_mode: "OBJECTIVE",
    audio_required: true, audio_intended_id: "telc_hoeren_1_kantine",
    turns: [
      { voice: "katja", speaker: "Durchsage", text: "Liebe Mitarbeiterinnen und Mitarbeiter, ab kommendem Montag ändern sich die Öffnungszeiten der Kantine. Statt bisher bis vierzehn Uhr ist die Kantine künftig bis fünfzehn Uhr dreißig geöffnet, das warme Mittagessen wird jedoch weiterhin nur bis dreizehn Uhr dreißig ausgegeben. Danach steht ein reduziertes Angebot mit Salaten und belegten Broten zur Verfügung. Grund für die Änderung sind die vielen Rückmeldungen von Kolleginnen und Kollegen aus dem Spätdienst, die die bisherige Schließzeit als zu früh empfunden hatten. Wir bitten um Verständnis, dass die Umstellung in der ersten Woche noch zu leichten Verzögerungen führen kann." },
    ],
  },
  items: [
    { item_type: "MCQ", skill: "listening", capability: "understand_speech", difficulty: "A",
      stem: "Bis wann ist die Kantine künftig geöffnet?",
      options: ["Bis 15:30 Uhr.", "Bis 14:00 Uhr.", "Bis 13:30 Uhr."], answer: 0,
      rationale: "\"künftig bis fünfzehn Uhr dreißig geöffnet.\"" },
    { item_type: "TRUE_FALSE", skill: "listening", capability: "understand_speech", difficulty: "B",
      stem: "Das warme Mittagessen wird auch nach 13:30 Uhr noch ausgegeben.",
      answer_value: false,
      rationale: "\"das warme Mittagessen wird … weiterhin nur bis dreizehn Uhr dreißig ausgegeben.\"" },
    { item_type: "MCQ", skill: "listening", capability: "justify", difficulty: "B",
      stem: "Warum wurden die Öffnungszeiten geändert?",
      options: ["Wegen Rückmeldungen von Kolleginnen und Kollegen aus dem Spätdienst.", "Wegen gestiegener Kosten.", "Wegen einer neuen gesetzlichen Vorschrift."], answer: 0,
      rationale: "\"Grund … sind die vielen Rückmeldungen von Kolleginnen und Kollegen aus dem Spätdienst.\"" },
  ],
};

/* ── TELC B2 — HÖREN, PRACTICE SET 2 ───────────────────────────────────── */
/* Models Teil 3's register: two speakers reaching a decision together. */

const TELC_HOEREN_2 = {
  paper: {
    id: "telc-b2-hoeren-2",
    board: "telc",
    title: "telc Deutsch B2 — Hören, Übungsset 2",
    minutes: 7,
    source: "Skillcase, original transcript and audio (Azure Neural TTS). Exam-format practice for telc B2 Hörverstehen — not an official telc recording.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  section: {
    module: "hoeren", title: "Gespräch: Ein neues Ablagesystem einführen",
    instruction: "Hören Sie das Gespräch einmal und beantworten Sie die Aufgaben.",
    minutes: 7, skill: "listening", scoring_mode: "OBJECTIVE",
    audio_required: true, audio_intended_id: "telc_hoeren_2_ablagesystem",
    turns: [
      { voice: "jan", speaker: "Kollege 1", text: "Wir müssten uns mal einigen, wie wir die Kundenunterlagen künftig ablegen — aktuell findet jeder seine eigenen Dateien kaum wieder." },
      { voice: "klaus", speaker: "Kollege 2", text: "Stimmt. Ich würde vorschlagen, dass wir alles nach Kundennamen sortieren, alphabetisch, in einem gemeinsamen Ordner." },
      { voice: "jan", speaker: "Kollege 1", text: "Das hilft uns aber nicht, wenn wir nach einem bestimmten Projekttyp suchen, unabhängig vom Kunden. Ich würde eher nach Projektart sortieren." },
      { voice: "klaus", speaker: "Kollege 2", text: "Guter Punkt. Wie wäre es, wenn wir beides kombinieren — Hauptordner nach Kundennamen, und innerhalb davon Unterordner nach Projektart?" },
      { voice: "jan", speaker: "Kollege 1", text: "Das klingt vernünftig. Dann sollten wir das auch schriftlich festhalten, damit es künftig alle gleich machen." },
    ],
  },
  items: [
    { item_type: "MCQ", skill: "listening", capability: "understand_speech", difficulty: "A",
      stem: "Worüber sprechen die beiden Kollegen?",
      options: ["Wie Kundenunterlagen künftig abgelegt werden sollen.", "Wie neue Kunden gewonnen werden können.", "Wie ein Kundentermin verschoben werden kann."], answer: 0,
      rationale: "\"Wir müssten uns mal einigen, wie wir die Kundenunterlagen künftig ablegen.\"" },
    { item_type: "MCQ", skill: "listening", capability: "compare", difficulty: "C",
      stem: "Worauf einigen sich die beiden Kollegen am Ende?",
      options: ["Hauptordner nach Kundennamen, Unterordner nach Projektart.", "Ausschließlich alphabetisch nach Kundennamen.", "Ausschließlich nach Projektart, ohne Kundenbezug."], answer: 0,
      rationale: "\"Hauptordner nach Kundennamen, und innerhalb davon Unterordner nach Projektart.\"" },
    { item_type: "TRUE_FALSE", skill: "listening", capability: "understand_speech", difficulty: "B",
      stem: "Kollege 1 ist mit dem ersten Vorschlag (nur nach Kundennamen sortieren) sofort einverstanden.",
      answer_value: false,
      rationale: "\"Das hilft uns aber nicht, wenn wir nach einem bestimmten Projekttyp suchen.\" — er widerspricht zunächst." },
    { item_type: "MCQ", skill: "listening", capability: "ask_followup", difficulty: "B",
      stem: "Was schlägt Kollege 1 am Ende zusätzlich vor?",
      options: ["Die Regelung schriftlich festzuhalten.", "Ein neues Computerprogramm anzuschaffen.", "Die Entscheidung noch einmal zu vertagen."], answer: 0,
      rationale: "\"Dann sollten wir das auch schriftlich festhalten, damit es künftig alle gleich machen.\"" },
  ],
};

/* ── TELC B2 — LESEN, PRACTICE SET 1 ───────────────────────────────────── */
/* The one component telc and Goethe genuinely share in name — but telc's
   real Leseverstehen Teil 1 format is richtig/falsch + "keine Angabe"-style
   comprehension on a single longer text, distinct enough from Goethe's
   MCQ-heavy Lesen that this is written to its own format, not copy-pasted
   from GOETHE_LESEN_1/2 with the board field changed. */

const TELC_LESEN_1 = {
  paper: {
    id: "telc-b2-lesen-1",
    board: "telc",
    title: "telc Deutsch B2 — Lesen, Übungsset 1",
    minutes: 15,
    source: "Skillcase, authored. Exam-format practice for telc B2 Leseverstehen — not an official telc question.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  section: {
    module: "lesen", title: "Anzeige: Sprachkurse für den Beruf",
    instruction: "Lesen Sie den Text und entscheiden Sie: Richtig oder falsch?",
    minutes: 15,
    passage: `Die Volkshochschule Nordstadt bietet ab September berufsbegleitende Deutschkurse auf B2-Niveau an. Die Kurse finden zweimal wöchentlich abends statt, sodass eine Teilnahme neben einer Vollzeitstelle möglich ist. Neu in diesem Semester: ein separater Kurs mit Schwerpunkt auf schriftlicher Kommunikation im Beruf, etwa E-Mails und Berichte.

Die Teilnahmegebühr beträgt 340 Euro pro Semester. Für Beschäftigte, deren Arbeitgeber eine Kostenbeteiligung schriftlich bestätigt, reduziert sich der Betrag um 50 Prozent. Eine Anmeldung ist bis zwei Wochen vor Kursbeginn online oder persönlich im Sekretariat möglich; danach werden freie Plätze nur noch nach Rücksprache vergeben.

Ein Einstufungstest ist vor der ersten Kursstunde verpflichtend, kann aber auch online von zu Hause aus absolviert werden. Wer bereits ein B2-Zertifikat besitzt, kann auf Antrag direkt in den Aufbaukurs für C1 wechseln, sofern das Zertifikat nicht älter als zwei Jahre ist.`,
    skill: "reading", scoring_mode: "OBJECTIVE",
  },
  items: [
    { item_type: "TRUE_FALSE", skill: "reading", capability: "summarise", difficulty: "A",
      stem: "Die Kurse finden nur tagsüber statt.",
      answer_value: false,
      rationale: "\"…zweimal wöchentlich abends…\" — die Kurse finden abends statt, nicht tagsüber." },
    { item_type: "MCQ", skill: "reading", capability: "exemplify", difficulty: "B",
      stem: "Was ist neu in diesem Semester?",
      options: ["Ein Kurs mit Schwerpunkt schriftliche Kommunikation im Beruf.", "Kostenlose Teilnahme für alle.", "Ein reiner Wochenendkurs."],
      answer: 0,
      rationale: "\"Neu in diesem Semester: ein separater Kurs mit Schwerpunkt auf schriftlicher Kommunikation im Beruf…\"" },
    { item_type: "TRUE_FALSE", skill: "reading", capability: "summarise", difficulty: "B",
      stem: "Wer eine schriftliche Bestätigung des Arbeitgebers vorlegt, zahlt den vollen Betrag.",
      answer_value: false,
      rationale: "\"…reduziert sich der Betrag um 50 Prozent\" — der Betrag wird also NICHT voll fällig." },
    { item_type: "MCQ", skill: "reading", capability: "structure", difficulty: "B",
      stem: "Was passiert, wenn man sich später als zwei Wochen vor Kursbeginn anmeldet?",
      options: ["Die Anmeldung wird automatisch abgelehnt.", "Freie Plätze werden nur noch nach Rücksprache vergeben.", "Man zahlt eine Strafgebühr."],
      answer: 1,
      rationale: "\"…danach werden freie Plätze nur noch nach Rücksprache vergeben.\"" },
    { item_type: "TRUE_FALSE", skill: "reading", capability: "language_awareness", difficulty: "C",
      stem: "Ein bereits vor drei Jahren erworbenes B2-Zertifikat berechtigt in jedem Fall zum direkten Wechsel in den C1-Aufbaukurs.",
      answer_value: false,
      rationale: "\"…sofern das Zertifikat nicht älter als zwei Jahre ist\" — nach drei Jahren gilt diese Bedingung nicht mehr." },
  ],
};

function buildItemRow(raw) {
  const row = {
    item_type: raw.item_type, stem: raw.stem,
    options: null, answer: null, answer_payload: null,
    payload: { }, scoring_mode: "OBJECTIVE", points: 1,
    skill: raw.skill, capability: raw.capability, difficulty: raw.difficulty,
    rationale: raw.rationale ?? null,
    source_type: "ORIGINAL", source_book: null, source_page: null,
  };
  if (raw.item_type === "MCQ") {
    row.options = raw.options; row.answer = raw.answer;
  } else if (raw.item_type === "TRUE_FALSE") {
    row.answer_payload = { value: raw.answer_value };
  } else if (raw.item_type === "MULTI_SELECT") {
    row.payload = { options: raw.options };
    row.answer_payload = { correct: raw.correct };
  } else if (raw.item_type === "LONG_TEXT") {
    // No key, ever — content_model refuses one on this type. Captured,
    // never auto-scored, same honest choice core-2026b's own W1 item makes.
    row.scoring_mode = "RUBRIC"; row.points = 4;
    row.payload = { rubric_id: raw.rubric_id, rubric_key: raw.rubric_key,
                    min_words: raw.min_words, target_words: raw.target_words,
                    guidance: raw.guidance ?? null };
  } else if (raw.item_type === "SPOKEN_RESPONSE") {
    // TRANSCRIPT_ONLY — captured, never banded, never a CEFR/exam score.
    row.scoring_mode = "TRANSCRIPT_ONLY"; row.points = 0;
    row.payload = { speak_seconds: raw.speak_seconds, prep_seconds: raw.prep_seconds };
  } else {
    throw new Error(`seed_exam_papers: unsupported item_type ${raw.item_type}`);
  }
  return row;
}

/** One paper, N sections. `spec.sections` is the general shape; a legacy
    `spec.section`+`spec.items` (single section) is wrapped into it so the
    8 standalone sets seeded earlier this program need no rewrite. */
async function seedPaper(spec) {
  const sections = spec.sections ?? [{ ...spec.section, items: spec.items }];
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(`SELECT 1 FROM b2_papers WHERE id=$1`, [spec.paper.id]);
    if (existing.rows.length && !FORCE) {
      console.log(`  ${spec.paper.id}: already seeded — run with --force to replace`);
      await client.query("ROLLBACK");
      return;
    }

    await client.query(
      `INSERT INTO b2_papers (id, board, title, minutes, source, provisional,
                               exam_version, alignment, source_type, review_status, difficulty)
       VALUES ($1,$2,$3,$4,$5,true,$6,$7,'ORIGINAL','AUTO_QA_PASS','B')
       ON CONFLICT (id) DO UPDATE SET
         title=EXCLUDED.title, minutes=EXCLUDED.minutes, source=EXCLUDED.source,
         exam_version=EXCLUDED.exam_version, alignment=EXCLUDED.alignment`,
      [spec.paper.id, spec.paper.board, spec.paper.title, spec.paper.minutes,
       spec.paper.source, spec.paper.exam_version, spec.paper.alignment]);

    await client.query(`DELETE FROM b2_paper_sections WHERE paper_id=$1`, [spec.paper.id]);

    let totalItems = 0, partNo = 0;
    for (const section of sections) {
      partNo += 1;
      let audioAssetId = section.audio_asset_id ?? null;
      if (!audioAssetId && section.audio_intended_id) {
        const assetCheck = await client.query(
          `SELECT id FROM b2_audio_assets WHERE id = $1`,
          [section.audio_intended_id]
        );
        if (assetCheck.rows.length) audioAssetId = section.audio_intended_id;
      }

      const { rows } = await client.query(
        `INSERT INTO b2_paper_sections
           (paper_id, module, part_no, title, instruction, minutes, time_limit_seconds,
            passage, skill, scoring_mode, item_count, audio_required, audio_intended_id, audio_asset_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
        [spec.paper.id, section.module, partNo, section.title, section.instruction,
         section.minutes, section.minutes * 60, section.passage ?? null,
         section.skill, section.scoring_mode, section.items.length,
         !!section.audio_required, section.audio_intended_id ?? null, audioAssetId]);
      const sectionId = rows[0].id;

      let itemNo = 0;
      for (const raw of section.items) {
        const row = buildItemRow(raw);
        const v = model.validateItem(row);
        if (!v.valid) throw new Error(`${spec.paper.id} part ${partNo} item ${itemNo + 1}: ${v.problems.join("; ")}`);
        const p = model.validateProvenance(row, { required: true });
        if (!p.valid) throw new Error(`${spec.paper.id} part ${partNo} item ${itemNo + 1} provenance: ${p.problems.join("; ")}`);

        await client.query(
          `INSERT INTO b2_paper_items
             (section_id, item_no, stem, options, answer, rationale,
              item_type, payload, answer_payload, scoring_mode, points,
              skill, capability, difficulty, source_type, review_status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'AUTO_QA_PASS')`,
          [sectionId, ++itemNo, row.stem, JSON.stringify(row.options ?? []), row.answer, row.rationale,
           row.item_type, JSON.stringify(row.payload ?? {}), row.answer_payload ? JSON.stringify(row.answer_payload) : null,
           row.scoring_mode, row.points, row.skill, row.capability, row.difficulty, row.source_type]);
        totalItems++;
      }
    }

    await client.query("COMMIT");
    console.log(`  ${spec.paper.id}: seeded ${sections.length} section(s), ${totalItems} item(s)`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/* ── COMPLETE PAPERS ────────────────────────────────────────────────────
   ONE COHERENT SITTING, not four unrelated routes stapled together — the
   underlying model already supports this without new runtime code: a paper
   is N sections in part_no order, and content.itemsOf()/safeVersion() were
   never section-count-limited (core-2026b's own papers are 5 sections).
   Composing Lesen+Schreiben+Sprechen (Goethe) and Lesen+Sprachbausteine+
   Schreiben+Sprechen (telc) under one new paper_id each reuses the exact
   content already authored and reviewed as standalone sets — this is
   deliberate composition of real material into a real paper, not the
   trivial-duplicate pattern warned against.

   HÖREN IS NOW INCLUDED IN BOTH. The claim this comment used to make —
   that Azure Speech is unreachable from this environment — was checked
   directly (a real synthesise() + speech-recognition round trip) and is
   false; see tools/make_exam_audio.js, which cuts the two new Hören
   sections' audio, and B2_EXAM_CONTENT_INVENTORY.md, which records the
   measured durations. Each complete paper's Hören section reuses set 1's
   exact transcript/items/audio (`audio_asset_id` pointed at the same
   already-registered asset) — the same intentional-reuse composition
   pattern every other section here already uses for Lesen/Schreiben/
   Sprechen (see the content audit's documented "complete-paper composition
   reusing a standalone section" NOTE category), not a second copy of the
   same clip. */

const GOETHE_COMPLETE_1 = {
  paper: {
    id: "goethe-b2-complete-1",
    board: "goethe",
    title: "Goethe-Zertifikat B2 — Komplettes Übungspaket",
    minutes: GOETHE_LESEN_1.section.minutes + GOETHE_HOEREN_1.section.minutes
      + GOETHE_SCHREIBEN_1.section.minutes + GOETHE_SPRECHEN_1.section.minutes,
    source: "Skillcase, authored. Composed exam-format practice paper for Goethe B2 (Lesen, Hören, Schreiben, Sprechen) — not an official Goethe paper. Hören reuses Übungsset 1's transcript and audio.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  sections: [
    { ...GOETHE_LESEN_1.section, items: GOETHE_LESEN_1.items },
    { ...GOETHE_HOEREN_1.section, items: GOETHE_HOEREN_1.items },
    { ...GOETHE_SCHREIBEN_1.section, items: GOETHE_SCHREIBEN_1.items },
    { ...GOETHE_SPRECHEN_1.section, items: GOETHE_SPRECHEN_1.items },
  ],
};

const TELC_COMPLETE_1 = {
  paper: {
    id: "telc-b2-complete-1",
    board: "telc",
    title: "telc Deutsch B2 — Komplettes Übungspaket",
    minutes: TELC_LESEN_1.section.minutes + TELC_SPRACHBAUSTEINE_1.section.minutes
      + TELC_HOEREN_1.section.minutes + TELC_SCHREIBEN_1.section.minutes + TELC_SPRECHEN_1.section.minutes,
    source: "Skillcase, authored. Composed exam-format practice paper for telc B2 (Lesen, Sprachbausteine, Hören, Schreiben, Sprechen) — not an official telc paper. Hören reuses Übungsset 1's transcript and audio.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  sections: [
    { ...TELC_LESEN_1.section, items: TELC_LESEN_1.items },
    { ...TELC_SPRACHBAUSTEINE_1.section, items: TELC_SPRACHBAUSTEINE_1.items },
    { ...TELC_HOEREN_1.section, items: TELC_HOEREN_1.items },
    { ...TELC_SCHREIBEN_1.section, items: TELC_SCHREIBEN_1.items },
    { ...TELC_SPRECHEN_1.section, items: TELC_SPRECHEN_1.items },
  ],
};

/* ── GOETHE B2 — SCHREIBEN, PRACTICE SET 2 ─────────────────────────────── */
/* Different topic from set 1: digitale Kommunikation rather than
   Großraumbüros. Same rubric (forumsbeitrag, rubric_id 1), same honest
   RUBRIC scoring — captured, not auto-scored. */

const GOETHE_SCHREIBEN_2 = {
  paper: {
    id: "goethe-b2-schreiben-2",
    board: "goethe",
    title: "Goethe-Zertifikat B2 — Schreiben, Übungsset 2",
    minutes: 30,
    source: "Skillcase, authored. Exam-format practice for Goethe B2 Schreiben Teil 1 — not an official Goethe task.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  section: {
    module: "schreiben", title: "Forumsbeitrag: Digitale Kommunikation im Alltag",
    instruction: "Schreiben Sie einen Beitrag für das Forum. Gehen Sie auf alle Punkte ein.",
    minutes: 30, skill: "writing", scoring_mode: "RUBRIC",
  },
  items: [
    { item_type: "LONG_TEXT", skill: "writing", capability: "argue", difficulty: "B",
      rubric_id: 1, rubric_key: "forumsbeitrag", min_words: 180, target_words: 200,
      stem: "In einem Online-Forum wird diskutiert, ob digitale Kommunikation (E-Mails, Messenger, Videokonferenzen) den persönlichen Kontakt im Berufsleben verdrängt. Schreiben Sie einen Beitrag für das Forum.",
      rationale: "Bewertungskriterien: Klar gegliederter Forumsbeitrag (Einleitung, Erläuterung der Vor- und Nachteile mit Begründung, eigenes Beispiel sowie konkrete Synthese für den Berufsalltag). Achten Sie auf B2-Konnektoren (z. B. einerseits/andererseits, zwar...aber) und treffende Fachbegriffe zur Arbeitswelt.",
      guidance: ["Sagen Sie, ob digitale Kommunikation den persönlichen Kontakt ersetzt oder ergänzt.",
                  "Nennen Sie je einen Vorteil und einen Nachteil digitaler Kommunikation.",
                  "Schlagen Sie vor, wie persönlicher und digitaler Austausch im Beruf zusammenpassen können."] },
  ],
};

/* ── GOETHE B2 — SPRECHEN, PRACTICE SET 2 ──────────────────────────────── */
/* Different topic from set 1: Weiterbildung rather than Homeoffice.
   TRANSCRIPT_ONLY — captured, never scored. */

const GOETHE_SPRECHEN_2 = {
  paper: {
    id: "goethe-b2-sprechen-2",
    board: "goethe",
    title: "Goethe-Zertifikat B2 — Sprechen, Übungsset 2",
    minutes: 5,
    source: "Skillcase, authored. Exam-format practice for Goethe B2 Sprechen Teil 1 — not an official Goethe task.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  section: {
    module: "sprechen", title: "Kurzvortrag: Lebenslanges Lernen im Beruf",
    instruction: "Sprechen Sie etwa 3 Minuten zu dem Thema.",
    minutes: 5, skill: "speaking", scoring_mode: "TRANSCRIPT_ONLY",
  },
  items: [
    { item_type: "SPOKEN_RESPONSE", skill: "speaking", capability: "argue", difficulty: "B",
      prep_seconds: 60, speak_seconds: 180,
      stem: "Viele Arbeitgeber erwarten, dass sich Beschäftigte regelmäßig weiterbilden — auch in der Freizeit. Ist das fair? Nehmen Sie Stellung und begründen Sie Ihre Meinung. Sprechen Sie etwa 3 Minuten.",
      rationale: "Bewertungskriterien: Flüssiger, kohärenter Kurzvortrag (ca. 3 Minuten) mit deutlicher Gliederung. Argumentieren Sie differenziert zur Verteilung von beruflicher Weiterbildung und Freizeit, formulieren Sie Ihre eigene Haltung klar und nutzen Sie Redemittel zur Argumentation und Nuancierung." },
  ],
};

/* ── TELC B2 — LESEN, PRACTICE SET 2 ───────────────────────────────────── */
/* Different topic and text type from set 1: an opinion article about
   Arbeitszeugnisse rather than the VHS course announcement. */

const TELC_LESEN_2 = {
  paper: {
    id: "telc-b2-lesen-2",
    board: "telc",
    title: "telc Deutsch B2 — Lesen, Übungsset 2",
    minutes: 15,
    source: "Skillcase, authored. Exam-format practice for telc B2 Leseverstehen — not an official telc question.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  section: {
    module: "lesen", title: "Meinungsartikel: Brauchen wir noch Arbeitszeugnisse?",
    instruction: "Lesen Sie den Text und entscheiden Sie: Richtig oder falsch?",
    minutes: 15,
    passage: `In kaum einem anderen Land wird dem Arbeitszeugnis so viel Bedeutung beigemessen wie in Deutschland. Jeder Arbeitnehmer hat nach Beendigung eines Beschäftigungsverhältnisses Anspruch auf ein qualifiziertes Zeugnis — und viele prüfen jedes Wort darin mit derselben Sorgfalt, mit der ein Jurist einen Vertrag liest.

Befürworter sagen, das Zeugnis schütze den Arbeitnehmer: Es dokumentiere, was jemand geleistet hat, und verhindere, dass eine Kündigung ohne nachvollziehbare Begründung die Karriere beschädige. Außerdem gebe es Bewerbern eine Möglichkeit, ihre Erfahrung gegenüber einem neuen Arbeitgeber zu belegen, ohne sich allein auf ein Vorstellungsgespräch verlassen zu müssen.

Kritiker halten dagegen, das System sei längst eine Formalität ohne echte Aussagekraft. Die Formulierungen seien so stark codiert, dass nur Eingeweihte sie richtig lesen könnten, und die Pflicht zur "wohlwollenden" Formulierung mache eine ehrliche Bewertung fast unmöglich. Einige große Technologieunternehmen sind deshalb dazu übergegangen, statt Zeugnissen nur noch Referenzkontakte anzubieten.

Eine endgültige Lösung zeichnet sich nicht ab. Solange das Arbeitsrecht den Anspruch auf ein Zeugnis garantiert, wird es weiterhin geschrieben — ob es gelesen wird, ist eine andere Frage.`,
    skill: "reading", scoring_mode: "OBJECTIVE",
  },
  items: [
    { item_type: "TRUE_FALSE", skill: "reading", capability: "summarise", difficulty: "A",
      stem: "In Deutschland hat jeder Arbeitnehmer nach dem Ausscheiden aus einem Unternehmen Anspruch auf ein qualifiziertes Arbeitszeugnis.",
      answer_value: true,
      rationale: "\"Jeder Arbeitnehmer hat nach Beendigung eines Beschäftigungsverhältnisses Anspruch auf ein qualifiziertes Zeugnis.\"" },
    { item_type: "MCQ", skill: "reading", capability: "compare", difficulty: "B",
      stem: "Was sagen Befürworter über den Nutzen des Arbeitszeugnisses?",
      options: ["Es dokumentiere Leistung und schütze den Arbeitnehmer.", "Es ersetze das Vorstellungsgespräch vollständig.", "Es sei wichtiger als ein Arbeitsvertrag."],
      answer: 0,
      rationale: "\"Es dokumentiere, was jemand geleistet hat, und verhindere, dass eine Kündigung ohne nachvollziehbare Begründung die Karriere beschädige.\"" },
    { item_type: "TRUE_FALSE", skill: "reading", capability: "concede", difficulty: "B",
      stem: "Kritiker meinen, die Formulierungen in Arbeitszeugnissen seien leicht verständlich.",
      answer_value: false,
      rationale: "\"Die Formulierungen seien so stark codiert, dass nur Eingeweihte sie richtig lesen könnten\" — das Gegenteil von leicht verständlich." },
    { item_type: "MCQ", skill: "reading", capability: "exemplify", difficulty: "B",
      stem: "Was haben einige große Technologieunternehmen verändert?",
      options: ["Sie bieten statt Zeugnissen nur Referenzkontakte an.", "Sie vergeben ausschließlich digitale Zeugnisse.", "Sie haben das Vorstellungsgespräch abgeschafft."],
      answer: 0,
      rationale: "\"…dazu übergegangen, statt Zeugnissen nur noch Referenzkontakte anzubieten.\"" },
    { item_type: "MCQ", skill: "reading", capability: "structure", difficulty: "C",
      stem: "Was sagt der Text über die Zukunft des Arbeitszeugnisses?",
      options: ["Es wird abgeschafft, sobald das Arbeitsrecht geändert wird.", "Solange der gesetzliche Anspruch besteht, wird es weiter geschrieben.", "Alle Unternehmen werden auf Referenzkontakte umstellen."],
      answer: 1,
      rationale: "\"Solange das Arbeitsrecht den Anspruch auf ein Zeugnis garantiert, wird es weiterhin geschrieben.\"" },
  ],
};

/* ── TELC B2 — SCHREIBEN, PRACTICE SET 2 ───────────────────────────────── */
/* Different topic from set 1: Fortbildungswunsch rather than
   Vertretung bei einem Kundentermin. Same rubric (halbformelle_email,
   rubric_id 2). */

const TELC_SCHREIBEN_2 = {
  paper: {
    id: "telc-b2-schreiben-2",
    board: "telc",
    title: "telc Deutsch B2 — Schreiben, Übungsset 2",
    minutes: 30,
    source: "Skillcase, authored. Exam-format practice for telc B2 Schreiben — not an official telc task.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  section: {
    module: "schreiben", title: "Halbformelle E-Mail: Fortbildungswunsch",
    instruction: "Schreiben Sie eine E-Mail. Gehen Sie auf alle Punkte ein.",
    minutes: 30, skill: "writing", scoring_mode: "RUBRIC",
  },
  items: [
    { item_type: "LONG_TEXT", skill: "writing", capability: "structure", difficulty: "B",
      rubric_id: 2, rubric_key: "halbformelle_email", min_words: 120, target_words: 150,
      stem: "Sie möchten an einer beruflichen Fortbildung zum Thema Projektmanagement teilnehmen, die während Ihrer Arbeitszeit stattfindet. Schreiben Sie eine E-Mail an Ihre Vorgesetzte.",
      rationale: "Bewertungskriterien: Höfliche halbformelle E-Mail mit passender Anrede und Schlussformel. Klare Darlegung von Zweck und Terminen der Weiterbildung, fundierte Nutzenargumentation für das Unternehmen und formvollendete Bitte um Freistellung und Kostenübernahme im Konjunktiv II.",
      guidance: ["Erklären Sie, um welche Fortbildung es geht und wann sie stattfindet.",
                 "Begründen Sie, warum die Fortbildung für Ihre Arbeit nützlich wäre.",
                 "Bitten Sie um Genehmigung und fragen Sie, ob die Kosten übernommen werden."] },
  ],
};

/* ── TELC B2 — SPRECHEN, PRACTICE SET 2 ────────────────────────────────── */
/* Different topic from set 1: Begrüßungsveranstaltung rather than
   Betriebsausflug. TRANSCRIPT_ONLY. */

const TELC_SPRECHEN_2 = {
  paper: {
    id: "telc-b2-sprechen-2",
    board: "telc",
    title: "telc Deutsch B2 — Sprechen, Übungsset 2",
    minutes: 4,
    source: "Skillcase, authored. Exam-format practice for telc B2 Sprechen (Gemeinsam etwas planen) — not an official telc task.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  section: {
    module: "sprechen", title: "Gemeinsam planen: Begrüßungsveranstaltung für neue Mitarbeitende",
    instruction: "Sprechen Sie etwa 2 Minuten.",
    minutes: 4, skill: "speaking", scoring_mode: "TRANSCRIPT_ONLY",
  },
  items: [
    { item_type: "SPOKEN_RESPONSE", skill: "speaking", capability: "maintain_discussion", difficulty: "B",
      prep_seconds: 30, speak_seconds: 120,
      stem: "Ihre Abteilung bekommt nächste Woche drei neue Kolleginnen und Kollegen. Sie planen zusammen mit einer Kollegin/einem Kollegen eine kurze Begrüßungsveranstaltung. Machen Sie Vorschläge zu Ort, Programm und Zeitpunkt, und begründen Sie Ihre Ideen. Sprechen Sie etwa 2 Minuten.",
      rationale: "Bewertungskriterien: Aktive partnerorientierte Planung (ca. 2 Minuten). Machen Sie strukturierte Vorschläge für Ablauf, Ort und Termin, reagieren Sie auf Vorschläge und Bedenken Ihres Gegenübers und einigen Sie sich auf konkrete Vereinbarungen." },
  ],
};

/* ── COMPLETE PAPERS — SET 2 ───────────────────────────────────────────────
   Same composition pattern as complete-1: each section reuses a standalone
   set's content. These compose from set-2 material where it exists. */

const GOETHE_COMPLETE_2 = {
  paper: {
    id: "goethe-b2-complete-2",
    board: "goethe",
    title: "Goethe-Zertifikat B2 — Komplettes Übungspaket 2",
    minutes: GOETHE_LESEN_2.section.minutes + GOETHE_HOEREN_2.section.minutes
      + GOETHE_SCHREIBEN_2.section.minutes + GOETHE_SPRECHEN_2.section.minutes,
    source: "Skillcase, authored. Composed exam-format practice paper for Goethe B2 (Lesen, Hören, Schreiben, Sprechen) — not an official Goethe paper. Uses set-2 content throughout; Hören reuses Übungsset 2's transcript and audio.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  sections: [
    { ...GOETHE_LESEN_2.section, items: GOETHE_LESEN_2.items },
    { ...GOETHE_HOEREN_2.section, items: GOETHE_HOEREN_2.items },
    { ...GOETHE_SCHREIBEN_2.section, items: GOETHE_SCHREIBEN_2.items },
    { ...GOETHE_SPRECHEN_2.section, items: GOETHE_SPRECHEN_2.items },
  ],
};

const TELC_COMPLETE_2 = {
  paper: {
    id: "telc-b2-complete-2",
    board: "telc",
    title: "telc Deutsch B2 — Komplettes Übungspaket 2",
    minutes: TELC_LESEN_2.section.minutes + TELC_SPRACHBAUSTEINE_2.section.minutes
      + TELC_HOEREN_2.section.minutes + TELC_SCHREIBEN_2.section.minutes + TELC_SPRECHEN_2.section.minutes,
    source: "Skillcase, authored. Composed exam-format practice paper for telc B2 (Lesen, Sprachbausteine, Hören, Schreiben, Sprechen) — not an official telc paper. Uses set-2 content throughout; Hören reuses Übungsset 2's transcript and audio.",
    exam_version: "B2", alignment: "exam_format_practice",
  },
  sections: [
    { ...TELC_LESEN_2.section, items: TELC_LESEN_2.items },
    { ...TELC_SPRACHBAUSTEINE_2.section, items: TELC_SPRACHBAUSTEINE_2.items },
    { ...TELC_HOEREN_2.section, items: TELC_HOEREN_2.items },
    { ...TELC_SCHREIBEN_2.section, items: TELC_SCHREIBEN_2.items },
    { ...TELC_SPRECHEN_2.section, items: TELC_SPRECHEN_2.items },
  ],
};

async function main() {
  console.log("Seeding exam-practice papers…");
  await seedPaper(GOETHE_LESEN_1);
  await seedPaper(GOETHE_LESEN_2);
  await seedPaper(GOETHE_HOEREN_1);
  await seedPaper(GOETHE_HOEREN_2);
  await seedPaper(GOETHE_SCHREIBEN_1);
  await seedPaper(GOETHE_SCHREIBEN_2);
  await seedPaper(GOETHE_SPRECHEN_1);
  await seedPaper(GOETHE_SPRECHEN_2);
  await seedPaper(TELC_LESEN_1);
  await seedPaper(TELC_LESEN_2);
  await seedPaper(TELC_SPRACHBAUSTEINE_1);
  await seedPaper(TELC_SPRACHBAUSTEINE_2);
  await seedPaper(TELC_HOEREN_1);
  await seedPaper(TELC_HOEREN_2);
  await seedPaper(TELC_SCHREIBEN_1);
  await seedPaper(TELC_SCHREIBEN_2);
  await seedPaper(TELC_SPRECHEN_1);
  await seedPaper(TELC_SPRECHEN_2);
  await seedPaper(GOETHE_COMPLETE_1);
  await seedPaper(GOETHE_COMPLETE_2);
  await seedPaper(TELC_COMPLETE_1);
  await seedPaper(TELC_COMPLETE_2);
  await pool.end();
  console.log("Done.");
}

module.exports = {
  GOETHE_LESEN_1, GOETHE_LESEN_2, GOETHE_HOEREN_1, GOETHE_HOEREN_2,
  GOETHE_SCHREIBEN_1, GOETHE_SCHREIBEN_2, GOETHE_SPRECHEN_1, GOETHE_SPRECHEN_2,
  GOETHE_COMPLETE_1, GOETHE_COMPLETE_2,
  TELC_LESEN_1, TELC_LESEN_2, TELC_SPRACHBAUSTEINE_1, TELC_SPRACHBAUSTEINE_2,
  TELC_HOEREN_1, TELC_HOEREN_2, TELC_SCHREIBEN_1, TELC_SCHREIBEN_2,
  TELC_SPRECHEN_1, TELC_SPRECHEN_2, TELC_COMPLETE_1, TELC_COMPLETE_2,
};

if (require.main === module) {
  main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
}
