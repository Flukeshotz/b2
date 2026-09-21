/**
 * core-2026b-v3 — SEED DATA.
 *
 * Seed convenience only. The database is authoritative at runtime.
 *
 * THEME: Teamtage und Zusammenarbeit — whether annual team events are worth the
 * time, and organising one with an external provider. Workplace, general B2,
 * and distinct from V1 (Besprechungen/Protokoll), V2 (Technik im Büro) and
 * every core-2026a theme.
 *
 * IDENTICAL STRUCTURE, DIFFERENT CONTENT — the same 23 comparable slots, skills,
 * capabilities, check_ids, item types and timing as V1 and V2.
 *
 * PROVENANCE: INSPIRED throughout. Kontext K8 "Einfach menschlich" (pp. 108–121),
 * in particular M4 "Ein starkes Team" (p. 116, ein Teamevent organisieren, mit
 * Dienstleistern kommunizieren), plus the Redemittel appendix. Every page cited
 * is one I read; the German is written for Skillcase.
 *
 * REVIEW: AUTO_QA_PASS at most. No teacher has read it.
 */

const KONTEXT = "Kontext B2 Kursbuch";
const ASPEKTE = "Aspekte neu B2 Lehrbuch";

const PROV = {
  source_type: "INSPIRED",
  source_book: KONTEXT,
  source_chapter: "8",
  source_module: "M4",
  source_page: "116",
  adaptation_status: "NOT_APPLICABLE",
};

/* ── READING · 176 words ─────────────────────────────────────────────────
   Same argumentative shape, third topic: the writer concedes an effect but
   relocates its cause, and the objection she keeps is about something the
   programme never claimed to address. */
const READING = {
  module: "lesen",
  title: "Forum: Teamtage — bringen die etwas?",
  instruction: "Lesen Sie den Forumsbeitrag und beantworten Sie die Fragen.",
  passage: `Unsere Abteilung fährt einmal im Jahr für zwei Tage weg. Klettern, gemeinsam kochen,
abends zusammensitzen.

Ich habe das lange für verlorene Arbeitszeit gehalten. Wer sich im Büro nicht versteht,
versteht sich auch am Kletterseil nicht, dachte ich, und hinterher sind alle wieder genau
so wie vorher.

Nach dem letzten Mal sehe ich das differenzierter. Es hat tatsächlich etwas verändert —
allerdings nicht das, was im Programm stand. Geholfen haben nicht die Übungen, sondern die
langen Fahrten im Bus, auf denen Leute miteinander geredet haben, die sonst nie ein Wort
wechseln. Das ließe sich vermutlich auch billiger haben.

Was mich weiterhin stört, ist die Freiwilligkeit. Offiziell muss niemand mitfahren. Wer
absagt, bekommt aber jedes Mal dieselbe Frage gestellt, warum er denn nicht dabei sei.
Freiwillig ist etwas anderes.

Angemeldet habe ich mich für dieses Jahr trotzdem wieder.`,
  items: [
    { slot: "R1", item_type: "MCQ",
      stem: "Wie beurteilt die Autorin die Teamtage heute?",
      options: ["Sie hält sie inzwischen für gut investierte Arbeitszeit.",
                "Sie sieht eine Wirkung, aber nicht durch das geplante Programm.",
                "Sie hält sie weiterhin für verlorene Arbeitszeit."],
      answer: 1,
      why: "„Es hat tatsächlich etwas verändert — allerdings nicht das, was im Programm stand.“ Beide Hälften des Satzes gehören zum Urteil." },

    { slot: "R2", item_type: "TRUE_FALSE",
      stem: "Nach Ansicht der Autorin haben vor allem die gemeinsamen Übungen gewirkt.",
      answer_value: false,
      why: "„Geholfen haben nicht die Übungen, sondern die langen Fahrten im Bus …“" },

    { slot: "R3", item_type: "MCQ",
      stem: "Was räumt die Autorin ein?",
      options: ["Dass die Teamtage doch eine Wirkung hatten.",
                "Dass die Freiwilligkeit inzwischen funktioniert.",
                "Dass die Übungen gut ausgewählt waren."],
      answer: 0,
      why: "„Nach dem letzten Mal sehe ich das differenzierter. Es hat tatsächlich etwas verändert.“ Die Freiwilligkeit kritisiert sie weiter, die Übungen stellt sie ausdrücklich zurück." },

    { slot: "R4", item_type: "MCQ",
      stem: "Womit begründet die Autorin die Wirkung?",
      options: ["Mit dem gemeinsamen Klettern.",
                "Mit den Gesprächen während der Fahrten.",
                "Mit der Länge der Veranstaltung."],
      answer: 1,
      why: "„… sondern die langen Fahrten im Bus, auf denen Leute miteinander geredet haben, die sonst nie ein Wort wechseln.“" },

    { slot: "R5", item_type: "MULTI_SELECT",
      stem: "Welche zwei Aussagen treffen auf den Text zu?",
      options: ["Die Autorin hält die Wirkung für billiger erreichbar.",
                "Wer nicht mitfährt, wird nach seinen Gründen gefragt.",
                "Die Teilnahme ist offiziell verpflichtend.",
                "Die Autorin wird dieses Jahr nicht mitfahren."],
      correct: [0, 1],
      why: "„Das ließe sich vermutlich auch billiger haben“ und „Wer absagt, bekommt aber jedes Mal dieselbe Frage gestellt“. Offiziell ist die Teilnahme freiwillig, und angemeldet hat sie sich." },

    { slot: "R6", item_type: "ORDERING",
      stem: "Bringen Sie die Gedankenschritte in die Reihenfolge des Textes.",
      ordering: ["Sie nennt, was sie weiterhin stört.",
                 "Sie erklärt, was tatsächlich gewirkt hat.",
                 "Sie beschreibt die Teamtage.",
                 "Sie begründet ihre frühere Ablehnung."],
      order: [2, 3, 1, 0],
      why: "Beschreibung → Begründung der Ablehnung → Erklärung der Wirkung → verbleibender Einwand." },
  ],
};

/* ── LISTENING · ~60 seconds, heard once ──────────────────────────────────
   Two things pass quickly: the booked activity is not the one the caller
   asked for, and the date that works is not the date she wanted. The caller
   also asks what a term actually means — the ask_followup item. */
const LISTENING = {
  module: "hoeren",
  audio_id: "core2026b_v3_teamtag",
  instruction: "Hören Sie das Gespräch einmal und beantworten Sie die Fragen.",
  situation: "Am Telefon. Eine Mitarbeiterin spricht mit einem Anbieter für Teamveranstaltungen.",
  plays: 1,
  turns: [
    { voice: "mia", speaker: "Mitarbeiterin",
      text: "Guten Tag, Kowalski von der Firma Terlinden. Wir hatten für den zwölften Juni angefragt, für achtzehn Personen." },
    { voice: "klaus", speaker: "Anbieter",
      text: "Kowalski, achtzehn Personen … ja, den zwölften habe ich hier. Allerdings steht bei mir der Kletterpark, und Sie hatten in der Mail nach der Kochwerkstatt gefragt." },
    { voice: "mia", speaker: "Mitarbeiterin",
      text: "Die Kochwerkstatt, genau. Geht das an dem Tag noch?" },
    { voice: "klaus", speaker: "Anbieter",
      text: "Am zwölften leider nicht mehr, da ist die Küche belegt. Ich könnte Ihnen den neunzehnten anbieten, gleiche Gruppengröße, gleicher Preis." },
    { voice: "mia", speaker: "Mitarbeiterin",
      text: "Und wenn wir beim zwölften bleiben — was verstehen Sie denn genau unter Kletterpark? Ist das auch etwas für Leute, die nicht schwindelfrei sind?" },
    { voice: "klaus", speaker: "Anbieter",
      text: "Gute Frage. Es gibt zwei Höhen, und die untere ist wirklich für alle machbar. Ganz ehrlich: Für eine gemischte Gruppe würde ich eher dazu raten als zur Küche." },
  ],
  items: [
    { slot: "L1", item_type: "MCQ",
      stem: "Was ist am zwölften Juni möglich?",
      options: ["Die Kochwerkstatt.", "Der Kletterpark.", "Beides."],
      answer: 1,
      why: "Gebucht steht der Kletterpark; die Kochwerkstatt geht „am zwölften leider nicht mehr, da ist die Küche belegt“." },

    { slot: "L2", item_type: "MCQ",
      stem: "Wozu rät der Anbieter der Anruferin?",
      options: ["Zur Kochwerkstatt am neunzehnten.",
                "Für eine gemischte Gruppe eher zum Kletterpark.",
                "Er hält beide Angebote für gleich geeignet."],
      answer: 1,
      why: "„Für eine gemischte Gruppe würde ich eher dazu raten als zur Küche.“ Die Empfehlung steht erst im letzten Satz." },

    { slot: "L3", item_type: "TRUE_FALSE",
      stem: "Für den neunzehnten verlangt der Anbieter einen höheren Preis.",
      answer_value: false,
      why: "„… gleiche Gruppengröße, gleicher Preis.“" },

    { slot: "L4", item_type: "MCQ",
      stem: "Warum ist die Kochwerkstatt am zwölften nicht möglich?",
      options: ["Weil die Gruppe zu groß ist.",
                "Weil die Küche an dem Tag belegt ist.",
                "Weil die Anfrage zu spät gekommen ist."],
      answer: 1,
      why: "„… da ist die Küche belegt.“" },

    { slot: "L5", item_type: "MATCHING",
      stem: "Welche Funktion hat welche Äußerung?",
      left: ["„Was verstehen Sie denn genau unter Kletterpark?“",
             "„Ich könnte Ihnen den neunzehnten anbieten.“",
             "„Für eine gemischte Gruppe würde ich eher dazu raten.“"],
      right: ["eine Empfehlung geben", "eine Alternative anbieten", "nach einer genaueren Erklärung fragen"],
      mapping: { 0: 2, 1: 1, 2: 0 },
      why: "„Was verstehen Sie unter …?“ fragt nach einer genaueren Erklärung — auf B2 eine eigene Funktion und der Unterschied zwischen Nachfragen und Nachhaken.",
      provenance: { source_chapter: "Redemittel im Überblick", source_module: "Rückfragen stellen",
                    source_page: "182" } },
  ],
};

/* ── LANGUAGE · same eight check_ids, third set of sentences ───────────── */
const LANGUAGE = {
  module: "sprachbausteine",
  instruction: "Welche Formulierung passt besser?",
  items: [
    { slot: "K1", item_type: "MCQ",
      context: "Sie sagen einen Termin ab, ohne das Angebot abzuwerten.",
      stem: "Welcher Satz passt besser?",
      options: ["Der Termin passt uns nicht. Das Angebot ist gut.",
                "Das Angebot ist zwar gut, der Termin passt uns aber nicht."],
      answer: 1,
      why: "„zwar … aber“ hält Anerkennung und Absage in einem Satz zusammen; nebeneinandergestellt wirken sie unverbunden.",
      provenance: { source_chapter: "9", source_module: "M3", source_page: "128" } },

    { slot: "K2", item_type: "MCQ",
      context: "Sie bringen einen anderen Ort ins Gespräch, ohne ihn durchzusetzen.",
      stem: "Welcher Satz passt besser?",
      options: ["Wir machen es dieses Jahr in der Nähe.",
                "Man könnte es dieses Jahr auch in der Nähe machen."],
      answer: 1,
      why: "Der Konjunktiv II öffnet eine Möglichkeit; der Indikativ verkündet eine Entscheidung.",
      provenance: { source_chapter: "4", source_module: "M1", source_page: "54" } },

    { slot: "K3", item_type: "MCQ",
      context: "Sie schreiben eine Absage an den Anbieter.",
      stem: "Welcher Satz passt besser?",
      options: ["Trotz des guten Angebots müssen wir leider absagen.",
                "Trotz dem guten Angebot müssen wir leider absagen."],
      answer: 0,
      why: "Gesprochen ist „trotz dem“ verbreitet. Geschrieben verlangt „trotz“ den Genitiv.",
      provenance: { source_book: ASPEKTE, source_chapter: "10", source_module: "M3", source_page: "158" } },

    { slot: "K4", item_type: "MCQ",
      context: "Sie halten im Protokoll fest, warum ein Angebot abgelehnt wurde.",
      stem: "Welcher Satz passt besser?",
      options: ["Das Angebot wurde abgelehnt, weil der Termin nicht passte und eine Verschiebung den Ablauf der Projektwoche gestört hätte.",
                "Das Angebot wurde abgelehnt. Der Termin passte nicht. Eine Verschiebung hätte gestört."],
      answer: 0,
      why: "Auf B2 werden Grund und Folge im Satzgefüge verbunden, nicht in drei Hauptsätzen aufgezählt." },

    { slot: "K5", item_type: "GAP_FILL",
      text: "Wir haben mit dem Anbieter Kontakt ___ und ihm unsere Wünsche zur Kenntnis ___.",
      match: "ignore_case",
      gaps: [{ accepted: ["aufgenommen"] }, { accepted: ["gebracht"] }],
      why: "„Kontakt aufnehmen“ und „etwas zur Kenntnis bringen“ — feste Nomen-Verb-Verbindungen.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K6", item_type: "GAP_FILL",
      text: "Die ___ der Veranstaltung übernimmt die Abteilung; über die ___ der Kosten entscheidet die Zentrale.",
      match: "ignore_case",
      gaps: [{ accepted: ["Organisation", "Planung"] }, { accepted: ["Verteilung", "Aufteilung"] }],
      why: "Nominalisierungen wie „Organisation“ und „Verteilung“ gehören zum B2-Wortschatz.",
      provenance: { source_book: ASPEKTE, source_chapter: "9", source_module: "M1", source_page: "138" } },

    { slot: "K7", item_type: "MATCHING",
      stem: "Welches Verb gehört zu welchem Nomen?",
      left: ["eine Rolle", "Interesse", "einen Kompromiss", "Rücksicht"],
      right: ["wecken", "spielen", "nehmen", "schließen"],
      mapping: { 0: 1, 1: 0, 2: 3, 3: 2 },
      why: "eine Rolle spielen · Interesse wecken · einen Kompromiss schließen · Rücksicht nehmen.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K8", item_type: "MCQ",
      context: "Eine erste E-Mail an einen Anbieter, mit dem Sie noch nie gesprochen haben.",
      stem: "Welcher Satz passt besser?",
      options: ["Hallo, können Sie uns mal sagen, was das ungefähr kostet?",
                "Sehr geehrte Damen und Herren, könnten Sie uns bitte ein Angebot zusenden?"],
      answer: 1,
      why: "Beim Erstkontakt mit einem Unternehmen ist die formelle Anrede erwartbar; „mal sagen“ gehört ins Gespräch.",
      provenance: { source_chapter: "8", source_module: "M4", source_page: "116" } },

    { slot: "C1", item_type: "MCQ",
      context: "In der Teamsitzung fällt Ihnen jemand ins Wort, während Sie einen Vorschlag begründen.",
      stem: "Welche Reaktion ist auf B2-Niveau angemessen?",
      options: ["Einen Moment noch, ich möchte den Gedanken kurz zu Ende führen.",
                "Sie kommen gleich dran, jetzt rede ich.",
                "Schon gut, sagen Sie ruhig."],
      answer: 0,
      why: "Man behält das Wort höflich und begrenzt den Anspruch zeitlich. Die zweite Option ist eine Zurechtweisung, die dritte gibt den Redebeitrag auf.",
      provenance: { source_chapter: "Redemittel im Überblick",
                    source_module: "sich nicht unterbrechen lassen", source_page: "183" } },
  ],
};

/* ── PRODUCTION ──────────────────────────────────────────────────────────── */
const PRODUCTION = {
  module: "schreiben",
  items: [
    { slot: "P1", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Fassen Sie in zwei bis drei Sätzen zusammen, wie die Autorin des Forumsbeitrags die Teamtage einschätzt und welchen Einwand sie behält.",
      min_words: 25, target_words: 40,
      expected: "Eine Zusammenfassung, die die revidierte Einschätzung UND den Einwand zur Freiwilligkeit nennt, ohne den Text nachzuerzählen.",
      provenance: { source_chapter: "7", source_module: "M4", source_page: "102" } },

    { slot: "P2", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Der Anbieter schreibt: „Der neunzehnte wäre bei uns frei, sonst alles wie besprochen.“ Sie wissen nicht, ob damit die Kochwerkstatt gemeint ist und ob der Preis unverändert gilt. Formulieren Sie zwei höfliche Rückfragen.",
      min_words: 15, target_words: 30,
      expected: "Zwei echte Klärungsfragen in angemessener Höflichkeitsform — nicht eine Wiederholung der Aussage und keine Zusage.",
      provenance: { source_chapter: "Redemittel im Überblick", source_module: "Rückfragen stellen",
                    source_page: "182" } },

    { slot: "W1", item_type: "LONG_TEXT", rubric_key: "forumsbeitrag",
      stem: "In Ihrem Betrieb wird diskutiert, ob die jährlichen Teamtage abgeschafft und das Geld stattdessen auf die Abteilungen verteilt werden soll. Schreiben Sie einen Beitrag für das Intranet-Forum.",
      guidance: ["Sagen Sie, was Sie davon halten.",
                 "Begründen Sie Ihre Position mit mindestens zwei Argumenten.",
                 "Gehen Sie auf einen Nachteil Ihrer eigenen Position ein.",
                 "Machen Sie einen konkreten Vorschlag."],
      min_words: 60, target_words: 90 },
  ],
};

/* ── SPEAKING · outside the comparable core, transcript-only ───────────── */
const SPEAKING = {
  module: "sprechen",
  slot: "S1", item_type: "SPOKEN_RESPONSE",
  instruction: "Sprechen Sie etwa 60 bis 90 Sekunden.",
  stem: "Manche Betriebe organisieren feste Teamveranstaltungen für alle, andere überlassen es den Abteilungen, ob und wie sie etwas gemeinsam machen. Was halten Sie für sinnvoller? Begründen Sie Ihre Meinung und gehen Sie kurz auf einen Nachteil der anderen Möglichkeit ein.",
  prep_seconds: 30, speak_seconds: 90,
  expected: "Eine klare Position, mindestens zwei Begründungen und ein eingeräumter Punkt der Gegenseite.",
  provenance: { source_chapter: "8", source_module: "M4", source_page: "116" },
};

const V3 = {
  id: "core-2026b-v3",
  group: "core-2026b",
  title: "Skillcase B2 — Einstufung V3",
  theme: "Teamtage und Zusammenarbeit",
  provenance: PROV,
  reading: READING, listening: LISTENING, language: LANGUAGE,
  production: PRODUCTION, speaking: SPEAKING,
};

module.exports = { V3 };
