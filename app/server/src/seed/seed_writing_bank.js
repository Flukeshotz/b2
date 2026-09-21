/**
 * SEED — Writing practice depth pass. board='custom', alignment='original'.
 *
 *   node src/seed/seed_writing_bank.js [--force]
 *
 * Adds 28 new standalone Writing experiences on top of the 2 already seeded
 * by seed_practice_bank.js (practice-writing-1/2), for 30 total — this file
 * owns practice-writing-3 through practice-writing-30.
 *
 * NO NEW SCORING ENGINE. Every task is a single LONG_TEXT item, scoring_mode
 * RUBRIC, reusing rubric_id=8 (board='custom', task_type='kurzantwort') —
 * the same board='custom' rubric practice-writing-1/2 already use, and
 * genuinely distinct from Goethe's Forumsbeitrag (rubric 1) and telc's
 * halbformelle E-Mail (rubric 2), which stay in seed_exam_papers.js under
 * their own board. content_model.js's productive() validator forbids an
 * answer key on LONG_TEXT and forbids OBJECTIVE scoring for it — this file
 * never tries to invent an automated score. What ExamPaper.jsx already shows
 * after finishing a practice paper with unscored items is unchanged and
 * stays honest: "Your response was recorded. This task isn't automatically
 * scored." No fake CEFR/Goethe/telc band, no percentage, no "Wortvielfalt".
 *
 * TASK-TYPE VARIETY (instruction §9): opinion/forum contribution,
 * semi-formal email, formal request, complaint, proposal, response to an
 * opinion, workplace message, workplace email, explaining a problem,
 * suggesting alternatives, agreeing/disagreeing, giving reasons, comparing
 * options, requesting action — each appears at least twice across the 28.
 * `task_type` and `register` are captured explicitly in payload (extended
 * on practice_seed_lib.js's longText()/buildItemRow(), not a new column) so
 * the metadata instruction §10 asks for is real, queryable data, not just
 * prose in the stem.
 *
 * CAPABILITY MAPPING: only capabilities whose `experiences` in
 * src/b2/capabilities.js include "writing" — argue, justify, concede,
 * compare, speculate, exemplify, structure, adapt_register, summarise. One
 * clear primary capability per task, never a multi-tag list, per §12.
 */
require("../env")();
const { longText, seedPaper } = require("./practice_seed_lib");

function writingPaper(id, title, stem, opts) {
  const {
    min_words, target_words, task_type, register, capability, difficulty = "B",
    guidance, minutes = 20,
  } = opts;
  return {
    paper: {
      id, board: "custom", title, minutes,
      source: "Skillcase, authored. General B2 writing practice — not tied to any specific exam board's format.",
      exam_version: "B2", alignment: "original",
    },
    section: {
      module: "schreiben", title: "Kurzantwort",
      instruction: "Schreiben Sie einen kurzen, zusammenhängenden Text.",
      minutes, skill: "writing", scoring_mode: "RUBRIC",
    },
    items: [
      longText({ stem, min_words, target_words, rubric_id: 8, rubric_key: "kurzantwort",
                 guidance, task_type, register, capability, difficulty }),
    ],
  };
}

const WRITING_3 = writingPaper("practice-writing-3", "Kurzantwort-Übung 3 — Forumsbeitrag: Vier-Tage-Woche",
  "In einem Online-Forum wird diskutiert, ob mehr Unternehmen eine Vier-Tage-Woche bei vollem Lohnausgleich einführen sollten. Schreiben Sie einen Forumsbeitrag: Nehmen Sie Stellung und nennen Sie mindestens zwei Argumente.",
  { min_words: 90, target_words: 110, task_type: "forum_contribution", register: "informell bis neutral", capability: "argue",
    guidance: ["Nennen Sie Ihre Position klar am Anfang.", "Bringen Sie mindestens zwei Argumente.", "Nutzen Sie Konnektoren wie außerdem, allerdings, deshalb."] });

const WRITING_4 = writingPaper("practice-writing-4", "Kurzantwort-Übung 4 — Halbformelle E-Mail: Flexible Arbeitszeiten",
  "Schreiben Sie eine halbformelle E-Mail an Ihre Führungskraft, in der Sie um flexiblere Arbeitszeiten bitten (z. B. späterer Arbeitsbeginn). Nennen Sie einen persönlichen Grund und schlagen Sie eine konkrete Regelung vor.",
  { min_words: 80, target_words: 100, task_type: "semi_formal_email", register: "halbformell", capability: "justify",
    guidance: ["Nennen Sie einen konkreten, nachvollziehbaren Grund.", "Machen Sie einen konkreten Vorschlag (z. B. Uhrzeit).", "Schließen Sie mit einer höflichen Bitte um Rückmeldung."] });

const WRITING_5 = writingPaper("practice-writing-5", "Kurzantwort-Übung 5 — Formeller Antrag: Fortbildungskostenübernahme",
  "Stellen Sie in einem formellen Schreiben an die Personalabteilung einen Antrag auf Übernahme der Kosten für eine berufliche Fortbildung. Begründen Sie, warum die Fortbildung für Ihre Tätigkeit relevant ist.",
  { min_words: 90, target_words: 110, task_type: "formal_request", register: "formell", capability: "justify", difficulty: "C",
    guidance: ["Nennen Sie die konkrete Fortbildung und die Kosten.", "Erklären Sie den Bezug zu Ihrer aktuellen Tätigkeit.", "Verwenden Sie eine formelle Anrede und einen formellen Schluss."] });

const WRITING_6 = writingPaper("practice-writing-6", "Kurzantwort-Übung 6 — Beschwerde: Wiederholt ausgefallene Pausen",
  "Schreiben Sie eine Beschwerde an Ihre Abteilungsleitung, weil Ihre Mittagspause in den letzten Wochen wiederholt ausgefallen ist. Schildern Sie das Problem sachlich und fordern Sie eine konkrete Lösung.",
  { min_words: 90, target_words: 110, task_type: "complaint", register: "formell", capability: "justify", difficulty: "C",
    guidance: ["Beschreiben Sie das Problem konkret (wie oft, seit wann).", "Bleiben Sie sachlich, auch wenn Sie unzufrieden sind.", "Fordern Sie am Ende eine konkrete Lösung, keine allgemeine Klage."] });

const WRITING_7 = writingPaper("practice-writing-7", "Kurzantwort-Übung 7 — Vorschlag: Bessere Teamkommunikation",
  "Ihr Team hat wiederholt Missverständnisse durch unklare Absprachen. Schreiben Sie einen kurzen Vorschlag an Ihr Team, wie die Kommunikation verbessert werden könnte.",
  { min_words: 80, target_words: 100, task_type: "proposal", register: "neutral", capability: "structure",
    guidance: ["Beschreiben Sie kurz das Problem.", "Machen Sie einen konkreten, umsetzbaren Vorschlag.", "Erklären Sie kurz, warum der Vorschlag helfen würde."] });

const WRITING_8 = writingPaper("practice-writing-8", "Kurzantwort-Übung 8 — Reaktion auf einen Forumsbeitrag: Vier-Tage-Woche",
  "Ein anderer Nutzer hat im Forum geschrieben: \"Die Vier-Tage-Woche funktioniert nur in Büros, nicht in der Pflege oder im Handwerk.\" Schreiben Sie eine Antwort, in der Sie zustimmen, widersprechen oder differenzieren.",
  { min_words: 90, target_words: 110, task_type: "response_to_opinion", register: "informell bis neutral", capability: "concede",
    guidance: ["Gehen Sie konkret auf die Aussage des anderen Nutzers ein.", "Räumen Sie ggf. einen berechtigten Punkt ein, bevor Sie widersprechen.", "Formulieren Sie Ihre eigene Position klar."] });

const WRITING_9 = writingPaper("practice-writing-9", "Kurzantwort-Übung 9 — Kurznachricht: Schichtübergabe",
  "Sie müssen Ihre Schicht kurzfristig einer Kollegin übergeben. Schreiben Sie ihr eine kurze Nachricht mit den wichtigsten Informationen, die sie für die Übernahme braucht.",
  { min_words: 60, target_words: 80, task_type: "workplace_message", register: "informell", capability: "structure",
    guidance: ["Nennen Sie den Grund der Übergabe kurz.", "Listen Sie die wichtigsten offenen Punkte auf.", "Bleiben Sie kurz und klar strukturiert."] });

const WRITING_10 = writingPaper("practice-writing-10", "Kurzantwort-Übung 10 — E-Mail an die Personalabteilung: Überstunden",
  "Schreiben Sie eine E-Mail an die Personalabteilung, in der Sie nachfragen, wie Ihre angesammelten Überstunden aus den letzten drei Monaten ausgeglichen werden können.",
  { min_words: 80, target_words: 100, task_type: "workplace_email", register: "halbformell", capability: "structure",
    guidance: ["Nennen Sie den ungefähren Umfang der Überstunden.", "Fragen Sie konkret nach den Ausgleichsmöglichkeiten.", "Bitten Sie um eine Rückmeldung bis zu einem bestimmten Zeitpunkt."] });

const WRITING_11 = writingPaper("practice-writing-11", "Kurzantwort-Übung 11 — Problem erklären: IT-Support",
  "Ihr Arbeitslaptop stürzt seit einigen Tagen mehrmals täglich ab. Schreiben Sie eine Nachricht an den IT-Support, in der Sie das Problem so beschreiben, dass es nachvollziehbar und bearbeitbar ist.",
  { min_words: 80, target_words: 100, task_type: "explain_problem", register: "neutral", capability: "structure",
    guidance: ["Beschreiben Sie, wann und wie oft das Problem auftritt.", "Nennen Sie, was Sie bereits versucht haben.", "Fragen Sie konkret nach dem weiteren Vorgehen."] });

const WRITING_12 = writingPaper("practice-writing-12", "Kurzantwort-Übung 12 — Alternativvorschlag: Dienstreise",
  "Ihre Führungskraft schlägt eine dreitägige Dienstreise vor. Sie halten eine eintägige Videokonferenz für sinnvoller. Schreiben Sie eine kurze Nachricht mit Ihrem Alternativvorschlag und Ihrer Begründung.",
  { min_words: 80, target_words: 100, task_type: "suggest_alternative", register: "halbformell", capability: "speculate",
    guidance: ["Erkennen Sie den ursprünglichen Vorschlag kurz an.", "Machen Sie Ihren Alternativvorschlag konkret.", "Begründen Sie, warum die Alternative sinnvoller wäre."] });

const WRITING_13 = writingPaper("practice-writing-13", "Kurzantwort-Übung 13 — Stellungnahme: Neue Kleiderordnung",
  "Ihr Unternehmen plant eine strengere Kleiderordnung im Kundenkontakt. Nehmen Sie dazu Stellung: Stimmen Sie zu oder lehnen Sie ab, und warum?",
  { min_words: 80, target_words: 100, task_type: "agree_disagree", register: "neutral", capability: "argue",
    guidance: ["Nennen Sie Ihre Position klar.", "Geben Sie mindestens einen Grund für Ihre Position.", "Gehen Sie kurz auf ein mögliches Gegenargument ein."] });

const WRITING_14 = writingPaper("practice-writing-14", "Kurzantwort-Übung 14 — Begründung: Urlaubsantrag außerhalb der Saison",
  "Sie möchten Ihren Jahresurlaub außerhalb der üblichen Ferienzeiten nehmen, was in Ihrer Abteilung unüblich ist. Schreiben Sie eine kurze Begründung an Ihre Führungskraft.",
  { min_words: 70, target_words: 90, task_type: "give_reasons", register: "halbformell", capability: "justify",
    guidance: ["Nennen Sie einen konkreten, nachvollziehbaren Grund.", "Zeigen Sie, dass Sie die Auswirkung auf das Team bedacht haben.", "Formulieren Sie höflich, aber direkt."] });

const WRITING_15 = writingPaper("practice-writing-15", "Kurzantwort-Übung 15 — Vergleich: Zwei Fortbildungsangebote",
  "Sie können zwischen zwei Fortbildungen wählen: einer praxisnahen zweitägigen Präsenzschulung und einem sechswöchigen Online-Kurs. Vergleichen Sie beide Optionen kurz und sagen Sie, wofür Sie sich entscheiden würden.",
  { min_words: 90, target_words: 110, task_type: "compare_options", register: "neutral", capability: "compare",
    guidance: ["Nennen Sie je einen Vorteil und einen Nachteil pro Option.", "Nutzen Sie Vergleichskonnektoren (einerseits … andererseits).", "Formulieren Sie am Ende Ihre eigene Entscheidung."] });

const WRITING_16 = writingPaper("practice-writing-16", "Kurzantwort-Übung 16 — Bitte um Handlung: Defektes Gerät",
  "Ein Gerät in Ihrem Arbeitsbereich ist seit Tagen defekt und behindert Ihre Arbeit. Schreiben Sie eine Nachricht an die zuständige Stelle mit der Bitte um zeitnahe Reparatur.",
  { min_words: 70, target_words: 90, task_type: "request_action", register: "neutral", capability: "structure",
    guidance: ["Beschreiben Sie den Defekt konkret.", "Erklären Sie kurz die Auswirkung auf Ihre Arbeit.", "Formulieren Sie eine klare Bitte mit Zeitrahmen."] });

const WRITING_17 = writingPaper("practice-writing-17", "Kurzantwort-Übung 17 — Forumsbeitrag: Homeoffice und Teamgeist",
  "In einem Forum wird gefragt: \"Schadet Homeoffice dem Teamgeist?\" Schreiben Sie einen Beitrag mit Ihrer eigenen Position und mindestens einem Beispiel aus der Praxis.",
  { min_words: 90, target_words: 110, task_type: "forum_contribution", register: "informell bis neutral", capability: "exemplify",
    guidance: ["Nennen Sie Ihre Position klar.", "Stützen Sie sie mit einem konkreten Beispiel.", "Nutzen Sie Beispielwörter wie zum Beispiel, etwa."] });

const WRITING_18 = writingPaper("practice-writing-18", "Kurzantwort-Übung 18 — Halbformelle E-Mail: Teamevent absagen",
  "Sie wurden zu einem Teamevent eingeladen, können aber aus persönlichen Gründen nicht teilnehmen. Schreiben Sie eine halbformelle Absage-E-Mail.",
  { min_words: 60, target_words: 80, task_type: "semi_formal_email", register: "halbformell", capability: "structure",
    guidance: ["Bedanken Sie sich für die Einladung.", "Sagen Sie höflich ab, ohne zu viele private Details preiszugeben.", "Bieten Sie ggf. eine Alternative an (z. B. beim nächsten Mal)."] });

const WRITING_19 = writingPaper("practice-writing-19", "Kurzantwort-Übung 19 — Formeller Antrag: Fester Parkplatz",
  "Schreiben Sie einen formellen Antrag an die Verwaltung Ihres Arbeitgebers auf Zuteilung eines festen Parkplatzes, mit Begründung.",
  { min_words: 80, target_words: 100, task_type: "formal_request", register: "formell", capability: "justify",
    guidance: ["Nennen Sie einen konkreten, sachlichen Grund.", "Verwenden Sie eine formelle Anrede und einen formellen Schluss.", "Formulieren Sie den Antrag klar und direkt."] });

const WRITING_20 = writingPaper("practice-writing-20", "Kurzantwort-Übung 20 — Beschwerde: Verspätete Gehaltsabrechnung",
  "Ihre Gehaltsabrechnung ist zum dritten Mal in Folge verspätet angekommen. Schreiben Sie eine sachliche Beschwerde an die Personalabteilung.",
  { min_words: 80, target_words: 100, task_type: "complaint", register: "formell", capability: "justify", difficulty: "C",
    guidance: ["Beschreiben Sie das wiederholte Muster (dreimal in Folge).", "Bleiben Sie sachlich und konkret.", "Fordern Sie eine Erklärung und eine Lösung für die Zukunft."] });

const WRITING_21 = writingPaper("practice-writing-21", "Kurzantwort-Übung 21 — Vorschlag: Mentoring-Programm",
  "Sie sind der Meinung, dass neue Mitarbeitende von einem Mentoring-Programm profitieren würden. Schreiben Sie einen kurzen Vorschlag an die Personalentwicklung.",
  { min_words: 90, target_words: 110, task_type: "proposal", register: "halbformell", capability: "structure",
    guidance: ["Erklären Sie kurz das Problem, das der Vorschlag löst.", "Skizzieren Sie den Ablauf des Programms.", "Nennen Sie einen erwarteten Nutzen."] });

const WRITING_22 = writingPaper("practice-writing-22", "Kurzantwort-Übung 22 — Widerspruch: Großraumbüros",
  "Ein Kommentar behauptet: \"Großraumbüros sind für die Produktivität grundsätzlich schädlich.\" Schreiben Sie eine Antwort, in der Sie widersprechen oder die Aussage differenzieren.",
  { min_words: 90, target_words: 110, task_type: "response_to_opinion", register: "neutral", capability: "concede", difficulty: "C",
    guidance: ["Räumen Sie ein, was an der Aussage teilweise stimmen könnte.", "Widersprechen Sie dann mit einem eigenen Argument.", "Nutzen Sie Konnektoren wie zwar … aber, allerdings."] });

const WRITING_23 = writingPaper("practice-writing-23", "Kurzantwort-Übung 23 — Kurznachricht: Krankmeldung an den Vorgesetzten",
  "Sie sind kurzfristig erkrankt und können heute nicht zur Arbeit kommen. Schreiben Sie eine kurze, angemessene Nachricht an Ihre Führungskraft.",
  { min_words: 50, target_words: 70, task_type: "workplace_message", register: "halbformell", capability: "adapt_register", difficulty: "A",
    guidance: ["Melden Sie sich möglichst früh am Tag.", "Nennen Sie kurz, dass Sie krank sind, ohne Details zur Diagnose.", "Erwähnen Sie, ob dringende Aufgaben offen sind."] });

const WRITING_24 = writingPaper("practice-writing-24", "Kurzantwort-Übung 24 — E-Mail: Terminabsprache mit einem Lieferanten",
  "Schreiben Sie eine E-Mail an einen Lieferanten, um einen Termin für eine Lieferung zu vereinbaren, die sich mit Ihrem aktuellen Zeitplan überschneidet.",
  { min_words: 80, target_words: 100, task_type: "workplace_email", register: "formell", capability: "structure",
    guidance: ["Erklären Sie kurz die Terminüberschneidung.", "Schlagen Sie konkret einen alternativen Termin vor.", "Bitten Sie um Bestätigung."] });

const WRITING_25 = writingPaper("practice-writing-25", "Kurzantwort-Übung 25 — Problem erklären: Projektverzögerung",
  "Ein Projekt, für das Sie verantwortlich sind, verzögert sich. Schreiben Sie eine E-Mail an Ihre Führungskraft, in der Sie den Grund erklären und einen neuen Zeitplan vorschlagen.",
  { min_words: 90, target_words: 110, task_type: "explain_problem", register: "formell", capability: "justify", difficulty: "C",
    guidance: ["Nennen Sie den konkreten Grund der Verzögerung.", "Vermeiden Sie es, die Schuld einseitig abzuwälzen.", "Schlagen Sie einen realistischen neuen Zeitplan vor."] });

const WRITING_26 = writingPaper("practice-writing-26", "Kurzantwort-Übung 26 — Alternativvorschlag: Kantinenverpflegung",
  "Viele Kolleginnen und Kollegen beschweren sich über das Kantinenangebot. Schreiben Sie einen kurzen Alternativvorschlag an die Kantinenleitung.",
  { min_words: 80, target_words: 100, task_type: "suggest_alternative", register: "neutral", capability: "speculate",
    guidance: ["Beschreiben Sie kurz das aktuelle Problem.", "Machen Sie einen konkreten Alternativvorschlag.", "Formulieren Sie ihn als Vorschlag, nicht als Forderung."] });

const WRITING_27 = writingPaper("practice-writing-27", "Kurzantwort-Übung 27 — Stellungnahme: Kernarbeitszeiten",
  "Ihr Unternehmen erwägt, feste Kernarbeitszeiten (10–15 Uhr) einzuführen. Nehmen Sie dazu Stellung.",
  { min_words: 80, target_words: 100, task_type: "agree_disagree", register: "neutral", capability: "argue",
    guidance: ["Nennen Sie Ihre Position klar am Anfang.", "Stützen Sie sie mit mindestens einem Argument.", "Gehen Sie kurz auf eine mögliche Gegenposition ein."] });

const WRITING_28 = writingPaper("practice-writing-28", "Kurzantwort-Übung 28 — Begründung: Abteilungswechsel",
  "Sie möchten intern die Abteilung wechseln. Schreiben Sie eine kurze, gut begründete Nachricht an Ihre aktuelle und Ihre zukünftige Führungskraft.",
  { min_words: 80, target_words: 100, task_type: "give_reasons", register: "halbformell", capability: "justify",
    guidance: ["Nennen Sie einen positiven, klaren Grund für den Wechsel.", "Vermeiden Sie negative Kommentare über die aktuelle Abteilung.", "Bedanken Sie sich für die bisherige Zeit."] });

const WRITING_29 = writingPaper("practice-writing-29", "Kurzantwort-Übung 29 — Vergleich: Präsenz-Meeting vs. Videokonferenz",
  "Vergleichen Sie kurz Präsenz-Meetings und Videokonferenzen für die wöchentliche Teambesprechung und sagen Sie, welches Format Sie bevorzugen würden.",
  { min_words: 90, target_words: 110, task_type: "compare_options", register: "neutral", capability: "compare",
    guidance: ["Nennen Sie je einen Vorteil und einen Nachteil pro Format.", "Nutzen Sie Vergleichskonnektoren.", "Formulieren Sie am Ende Ihre eigene Präferenz."] });

const WRITING_30 = writingPaper("practice-writing-30", "Kurzantwort-Übung 30 — Bitte um Handlung: Zusätzliche Softwareschulung",
  "Ihr Team arbeitet seit Kurzem mit einer neuen Software, aber die Einarbeitung war zu knapp. Schreiben Sie eine Nachricht an die zuständige Stelle mit der Bitte um eine zusätzliche Schulung.",
  { min_words: 80, target_words: 100, task_type: "request_action", register: "halbformell", capability: "structure",
    guidance: ["Beschreiben Sie kurz, welche Schwierigkeiten entstanden sind.", "Formulieren Sie eine konkrete Bitte um Schulung.", "Schlagen Sie ggf. einen Zeitrahmen vor."] });

module.exports = {
  WRITING_3, WRITING_4, WRITING_5, WRITING_6, WRITING_7, WRITING_8, WRITING_9, WRITING_10,
  WRITING_11, WRITING_12, WRITING_13, WRITING_14, WRITING_15, WRITING_16, WRITING_17, WRITING_18,
  WRITING_19, WRITING_20, WRITING_21, WRITING_22, WRITING_23, WRITING_24, WRITING_25, WRITING_26,
  WRITING_27, WRITING_28, WRITING_29, WRITING_30,
  writingPaper,
};

const ALL = [
  WRITING_3, WRITING_4, WRITING_5, WRITING_6, WRITING_7, WRITING_8, WRITING_9, WRITING_10,
  WRITING_11, WRITING_12, WRITING_13, WRITING_14, WRITING_15, WRITING_16, WRITING_17, WRITING_18,
  WRITING_19, WRITING_20, WRITING_21, WRITING_22, WRITING_23, WRITING_24, WRITING_25, WRITING_26,
  WRITING_27, WRITING_28, WRITING_29, WRITING_30,
];

async function main() {
  console.log(`Seeding ${ALL.length} new Writing practice papers (practice-writing-3..30)…`);
  const { pool } = require("./practice_seed_lib");
  for (const spec of ALL) await seedPaper(spec);
  await pool.end();
  console.log("Done.");
}

if (require.main === module) {
  main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
}
