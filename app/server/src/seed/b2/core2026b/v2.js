/**
 * core-2026b-v2 — SEED DATA.
 *
 * Seed convenience only. The database is authoritative at runtime.
 *
 * THEME: Technik im Büro — a system that sorts incoming invoices. Workplace,
 * general B2, and deliberately distant from V1's Besprechungen/Protokoll and
 * from every core-2026a theme (Vier-Tage-Woche, Fortbildung, Online-Bewertungen).
 *
 * IDENTICAL STRUCTURE TO V1, DIFFERENT CONTENT. Same 23 comparable slots, same
 * skill split, same capability split, same check_id split, same item types,
 * same timing. That is what makes it a retest rather than a different test —
 * and it is why the grammar POINTS repeat while not a single sentence does.
 *
 * PROVENANCE: INSPIRED throughout. Topic, task pattern and grammar point come
 * from the books; every word of German is written for Skillcase. Page
 * references are ones I read — Kontext K5 (Technik gut, alles gut?, pp. 66–79)
 * and the Redemittel/Grammatik appendices. No page is cited that was not seen.
 *
 * REVIEW: AUTO_QA_PASS at most. No teacher has read it.
 */

const KONTEXT = "Kontext B2 Kursbuch";
const ASPEKTE = "Aspekte neu B2 Lehrbuch";

const PROV = {
  source_type: "INSPIRED",
  source_book: KONTEXT,
  source_chapter: "5",
  source_module: "M1",
  source_page: "68",
  adaptation_status: "NOT_APPLICABLE",
};

/* ── READING · 180 words ──────────────────────────────────────────────────
   Same shape as V1's passage and a different argument: the author revises his
   rejection, and the cause of the success is explicitly NOT the obvious one.
   R1 and R6 need the whole text; R4 turns on a sentence that names the
   plausible cause and rejects it. */
const READING = {
  module: "lesen",
  title: "Forum: Wenn die Technik mitdenkt",
  instruction: "Lesen Sie den Forumsbeitrag und beantworten Sie die Fragen.",
  passage: `Seit dem Frühjahr läuft bei uns ein System, das eingehende Rechnungen automatisch
vorsortiert und den richtigen Abteilungen zuordnet.

Ich habe das anfangs offen abgelehnt. Nicht, weil ich etwas gegen Technik hätte, sondern
weil ich schon zweimal erlebt habe, wie solche Programme eingeführt und nach einem Jahr
wieder abgeschafft wurden. Die Arbeit blieb dann an denselben Leuten hängen wie vorher.

Diesmal ist es anders gelaufen, und das hat mich ehrlich überrascht. Das System nimmt uns
die stumpfeste Arbeit tatsächlich ab. Entscheidend war allerdings nicht die Software,
sondern dass wir vorher zwei Wochen lang aufgeschrieben haben, welche Fälle überhaupt
vorkommen. Ohne diese Vorarbeit hätte das Programm dieselben Fehler gemacht wie wir, nur
schneller.

Was ich nach wie vor kritisch sehe, ist der Umgang mit Ausnahmen. Alles, was nicht ins
Raster passt, landet in einem Sammelordner, den sich am Ende doch wieder jemand von Hand
ansieht. Offiziell gibt es diesen Ordner gar nicht.

Zurück zum alten Verfahren möchte ich trotzdem nicht.`,
  items: [
    { slot: "R1", item_type: "MCQ",
      stem: "Wie bewertet der Autor das neue System insgesamt?",
      options: ["Er hält es für gescheitert, wie die früheren Programme.",
                "Er hält es für nützlich, sieht aber einen ungelösten Punkt.",
                "Er findet, es habe die Arbeit nur auf andere verlagert."],
      answer: 1,
      why: "Er möchte „nicht zurück zum alten Verfahren“, kritisiert aber weiterhin den Umgang mit Ausnahmen. Der Schlusssatz allein genügt für das Urteil nicht." },

    { slot: "R2", item_type: "TRUE_FALSE",
      stem: "Der Autor lehnte das System zunächst ab, weil er Technik grundsätzlich ablehnt.",
      answer_value: false,
      why: "„Nicht, weil ich etwas gegen Technik hätte, sondern weil ich schon zweimal erlebt habe, wie solche Programme … wieder abgeschafft wurden.“" },

    { slot: "R3", item_type: "MCQ",
      stem: "Was räumt der Autor ein?",
      options: ["Dass seine anfängliche Ablehnung sich diesmal nicht bestätigt hat.",
                "Dass der Sammelordner inzwischen überflüssig geworden ist.",
                "Dass die Software mehr geleistet hat als die Vorarbeit."],
      answer: 0,
      why: "„Diesmal ist es anders gelaufen, und das hat mich ehrlich überrascht.“ Das Eingeständnis betrifft seine Ablehnung — den Sammelordner kritisiert er weiter, und die Vorarbeit stellt er ausdrücklich über die Software." },

    { slot: "R4", item_type: "MCQ",
      stem: "Worauf führt der Autor den Erfolg zurück?",
      options: ["Auf die Qualität der eingesetzten Software.",
                "Auf die zwei Wochen Vorarbeit im Team.",
                "Auf die Erfahrung aus den früheren Projekten."],
      answer: 1,
      why: "„Entscheidend war allerdings nicht die Software, sondern dass wir vorher zwei Wochen lang aufgeschrieben haben, welche Fälle überhaupt vorkommen.“ Der Text nennt die naheliegende Ursache und verwirft sie." },

    { slot: "R5", item_type: "MULTI_SELECT",
      stem: "Welche zwei Aussagen treffen auf den Text zu?",
      options: ["Der Autor hat frühere Projekte dieser Art scheitern sehen.",
                "Ausnahmefälle werden weiterhin von Hand bearbeitet.",
                "Das jetzige System wurde nach einem Jahr wieder abgeschafft.",
                "Der Autor war von Anfang an für die Einführung."],
      correct: [0, 1],
      why: "„… wie solche Programme eingeführt und nach einem Jahr wieder abgeschafft wurden“ bezieht sich auf FRÜHERE Projekte, nicht auf dieses; und der Sammelordner wird „von Hand“ angesehen." },

    { slot: "R6", item_type: "ORDERING",
      stem: "Bringen Sie die Gedankenschritte in die Reihenfolge des Textes.",
      ordering: ["Er beschreibt das neue System.",
                 "Er nennt den Punkt, der ihn weiterhin stört.",
                 "Er begründet seine anfängliche Ablehnung.",
                 "Er erklärt, warum es diesmal funktioniert hat."],
      order: [0, 2, 3, 1],
      why: "System → Begründung der Ablehnung → Erklärung des Erfolgs → verbleibende Kritik. Der Text kippt in der Mitte von Ablehnung zu Zustimmung." },
  ],
};

/* ── LISTENING · ~60 seconds, heard once ──────────────────────────────────
   The decisive information is a correction of the caller's own assumption
   ("Also muss ich nichts machen?" → "Doch, eine Sache"), plus a time
   constraint that arrives after the instruction. Keyword-matching "abmelden"
   gets it wrong. */
const LISTENING = {
  module: "hoeren",
  audio_id: "core2026b_v2_itstoerung",
  instruction: "Hören Sie das Gespräch einmal und beantworten Sie die Fragen.",
  situation: "Am Telefon. Ein Mitarbeiter der Buchhaltung ruft die IT-Abteilung an.",
  plays: 1,
  turns: [
    { voice: "conrad", speaker: "Mitarbeiter",
      text: "Guten Tag, hier Bauer aus der Buchhaltung. Bei mir lässt sich das Rechnungssystem seit heute Morgen nicht mehr öffnen." },
    { voice: "katja", speaker: "IT-Abteilung",
      text: "Bauer, Buchhaltung … einen Moment. Ja, das Problem hatten wir heute schon dreimal. Es liegt nicht an Ihrem Rechner, sondern am Server." },
    { voice: "conrad", speaker: "Mitarbeiter",
      text: "Also muss ich nichts weiter machen?" },
    { voice: "katja", speaker: "IT-Abteilung",
      text: "Doch, eine Sache: Melden Sie sich einmal ab und wieder an. Aber bitte erst nach zwölf Uhr. Vorher bringt es nichts, wir spielen bis dahin noch ein Update auf." },
    { voice: "conrad", speaker: "Mitarbeiter",
      text: "Habe ich Sie richtig verstanden — vor zwölf soll ich es gar nicht erst versuchen?" },
    { voice: "katja", speaker: "IT-Abteilung",
      text: "Genau. Ich weiß, das ist ärgerlich, wenn Termine anstehen. Aber ein Neustart vor dem Update würde die Sache eher verschlimmern." },
  ],
  items: [
    { slot: "L1", item_type: "MCQ",
      stem: "Was soll der Mitarbeiter tun?",
      options: ["Nichts — das Problem löst sich von selbst.",
                "Sich sofort abmelden und wieder anmelden.",
                "Sich erst nach zwölf Uhr abmelden und wieder anmelden."],
      answer: 2,
      why: "Auf „Also muss ich nichts weiter machen?“ folgt „Doch, eine Sache“ — und die Uhrzeit ist die entscheidende Einschränkung, die erst danach kommt." },

    { slot: "L2", item_type: "MCQ",
      stem: "Wie reagiert die IT-Mitarbeiterin auf die Lage des Anrufers?",
      options: ["Sie zeigt Verständnis, bleibt aber bei ihrer Anweisung.",
                "Sie hält das Problem für unwichtig.",
                "Sie macht dem Anrufer einen Vorwurf."],
      answer: 0,
      why: "„Ich weiß, das ist ärgerlich, wenn Termine anstehen. Aber ein Neustart vor dem Update würde die Sache eher verschlimmern.“" },

    { slot: "L3", item_type: "TRUE_FALSE",
      stem: "Das Problem liegt am Rechner des Anrufers.",
      answer_value: false,
      why: "„Es liegt nicht an Ihrem Rechner, sondern am Server.“" },

    { slot: "L4", item_type: "MCQ",
      stem: "Warum soll der Mitarbeiter mit dem Neustart warten?",
      options: ["Weil bis dahin ein Update aufgespielt wird.",
                "Weil die IT-Abteilung erst mittags erreichbar ist.",
                "Weil das System vor zwölf Uhr gesperrt ist."],
      answer: 0,
      why: "„Vorher bringt es nichts, wir spielen bis dahin noch ein Update auf.“" },

    { slot: "L5", item_type: "MATCHING",
      stem: "Welche Funktion hat welche Äußerung?",
      left: ["„Habe ich Sie richtig verstanden — vor zwölf gar nicht erst versuchen?“",
             "„Ich weiß, das ist ärgerlich, wenn Termine anstehen.“",
             "„Es liegt nicht an Ihrem Rechner, sondern am Server.“"],
      right: ["Verständnis zeigen", "sich vergewissern", "eine Ursache nennen"],
      mapping: { 0: 1, 1: 0, 2: 2 },
      why: "Die Rückfrage sichert das eigene Verständnis ab — auf B2 eine eigene Funktion und nicht bloß eine Frage.",
      provenance: { source_chapter: "Redemittel im Überblick", source_module: "Rückfragen stellen",
                    source_page: "182" } },
  ],
};

/* ── LANGUAGE · eight knowledge items + one interaction item ──────────────
   Same eight check_ids as V1, in the same order, with entirely different
   sentences. Both options in every MCQ are grammatical German; the weaker one
   is weaker for the situation. */
const LANGUAGE = {
  module: "sprachbausteine",
  instruction: "Welche Formulierung passt besser?",
  items: [
    { slot: "K1", item_type: "MCQ",
      context: "Sie widersprechen einem Vorschlag, ohne ihn ganz abzuwerten.",
      stem: "Welcher Satz passt besser?",
      options: ["Die Lösung ist schnell. Sie passt nicht zu unseren Fällen.",
                "Die Lösung ist zwar schnell, sie passt aber nicht zu unseren Fällen."],
      answer: 1,
      why: "„zwar … aber“ räumt den Vorteil ein und setzt den Einwand dagegen. Zwei Sätze nebeneinander lassen offen, wie sie zusammenhängen.",
      provenance: { source_chapter: "9", source_module: "M3", source_page: "128" } },

    { slot: "K2", item_type: "MCQ",
      context: "Sie bringen gegenüber der IT eine Änderung ins Gespräch, ohne sie zu fordern.",
      stem: "Welcher Satz passt besser?",
      options: ["Wir brauchen eine zweite Prüfstufe im System.",
                "Eine zweite Prüfstufe im System wäre vielleicht sinnvoll."],
      answer: 1,
      why: "Der Konjunktiv II macht aus einer Forderung einen Vorschlag, über den noch gesprochen werden kann.",
      provenance: { source_chapter: "4", source_module: "M1", source_page: "54" } },

    { slot: "K3", item_type: "MCQ",
      context: "Sie schreiben eine kurze Störungsmeldung an alle Abteilungen.",
      stem: "Welcher Satz passt besser?",
      options: ["Während dem Update ist das System nicht erreichbar.",
                "Während des Updates ist das System nicht erreichbar."],
      answer: 1,
      why: "Gesprochen hört man „während dem“ häufig. Geschrieben verlangt „während“ den Genitiv.",
      provenance: { source_book: ASPEKTE, source_chapter: "10", source_module: "M3", source_page: "158" } },

    { slot: "K4", item_type: "MCQ",
      context: "Sie begründen in einer E-Mail, warum die Einführung verschoben wird.",
      stem: "Welcher Satz passt besser?",
      options: ["Die Einführung wird verschoben, weil die Fallliste noch unvollständig ist und das System sonst dieselben Fehler übernehmen würde.",
                "Die Einführung wird verschoben. Die Fallliste ist unvollständig. Das System würde Fehler übernehmen."],
      answer: 0,
      why: "Auf B2 wird die Folge im Satzgefüge mitgedacht statt in drei nebeneinandergestellten Hauptsätzen." },

    { slot: "K5", item_type: "GAP_FILL",
      text: "Die Abteilung hat den Vorschlag zunächst in Frage ___, inzwischen aber Vertrauen zu dem System ___.",
      match: "ignore_case",
      gaps: [{ accepted: ["gestellt"] }, { accepted: ["gefasst"] }],
      why: "„etwas in Frage stellen“ und „Vertrauen fassen“ — feste Nomen-Verb-Verbindungen, die auf B2 erwartet werden.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K6", item_type: "GAP_FILL",
      text: "Die ___ der Rechnungen erfolgt jetzt automatisch; nur die ___ der Ausnahmen dauert noch.",
      match: "ignore_case",
      gaps: [{ accepted: ["Sortierung", "Zuordnung"] }, { accepted: ["Bearbeitung"] }],
      why: "Nominalisierungen wie „Sortierung“ und „Bearbeitung“ gehören zum B2-Wortschatz; „das Sortieren“ und „das Machen“ wären die A2-Ersatzformen.",
      provenance: { source_book: ASPEKTE, source_chapter: "9", source_module: "M1", source_page: "138" } },

    { slot: "K7", item_type: "MATCHING",
      stem: "Welches Verb gehört zu welchem Nomen?",
      left: ["Kritik", "einen Vorschlag", "zur Sprache", "unter Druck"],
      right: ["machen", "üben", "stehen", "bringen"],
      mapping: { 0: 1, 1: 0, 2: 3, 3: 2 },
      why: "Kritik üben · einen Vorschlag machen · zur Sprache bringen · unter Druck stehen.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K8", item_type: "MCQ",
      context: "Eine E-Mail an die IT-Leitung.",
      stem: "Welcher Satz passt besser?",
      options: ["Können Sie da mal draufgucken? Bei uns geht gerade nichts.",
                "Ich bitte Sie, die Störung zu prüfen; bei uns ist das System derzeit nicht erreichbar."],
      answer: 1,
      why: "„draufgucken“ und „geht nichts“ gehören ins Gespräch. In einer E-Mail an die Leitung kostet das auf B2 Punkte.",
      provenance: { source_chapter: "7", source_module: "M2", source_page: "98" } },

    { slot: "C1", item_type: "MCQ",
      context: "In einer Besprechung stellt jemand Ihre Zahlen in Frage, bevor Sie sie erklärt haben.",
      stem: "Welche Reaktion ist auf B2-Niveau angemessen?",
      options: ["Darf ich die Zahlen kurz zu Ende erklären? Danach wird der Punkt klarer.",
                "Die Zahlen stimmen. Punkt.",
                "Wenn Sie mir nicht glauben, lassen wir es."],
      answer: 0,
      why: "Man behält den eigenen Redebeitrag und bietet zugleich die Klärung an — ohne Rückzug und ohne Konfrontation. Die zweite Option blockt ab, die dritte gibt das Wort auf.",
      provenance: { source_chapter: "Redemittel im Überblick",
                    source_module: "sich nicht unterbrechen lassen", source_page: "183" } },
  ],
};

/* ── PRODUCTION · rubric-scored, no answer keys ───────────────────────── */
const PRODUCTION = {
  module: "schreiben",
  items: [
    { slot: "P1", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Fassen Sie in zwei bis drei Sätzen zusammen, zu welchem Urteil der Autor des Forumsbeitrags über das neue System kommt und welcher Punkt für ihn offen bleibt.",
      min_words: 25, target_words: 40,
      expected: "Eine Zusammenfassung, die das revidierte Urteil UND den offenen Punkt (Umgang mit Ausnahmen) nennt, ohne den Text nachzuerzählen.",
      provenance: { source_chapter: "7", source_module: "M4", source_page: "102" } },

    { slot: "P2", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Die IT schreibt Ihnen: „Das Update läuft heute, danach bitte einmal neu anmelden.“ Sie wissen nicht, ab wann genau das gilt und ob Sie bis dahin weiterarbeiten können. Formulieren Sie zwei höfliche Rückfragen.",
      min_words: 15, target_words: 30,
      expected: "Zwei echte Klärungsfragen in angemessener Höflichkeitsform — nicht eine Wiederholung der Aussage und keine Meinung.",
      provenance: { source_chapter: "Redemittel im Überblick", source_module: "Rückfragen stellen",
                    source_page: "182" } },

    { slot: "W1", item_type: "LONG_TEXT", rubric_key: "forumsbeitrag",
      stem: "In Ihrem Betrieb wird diskutiert, ob Routineaufgaben künftig von Software übernommen werden sollen. Schreiben Sie einen Beitrag für das Intranet-Forum.",
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
  stem: "In manchen Betrieben entscheidet die IT-Abteilung allein, welche Programme eingeführt werden; in anderen entscheiden die Fachabteilungen mit. Was halten Sie für sinnvoller? Begründen Sie Ihre Meinung und gehen Sie kurz auf einen Nachteil der anderen Möglichkeit ein.",
  prep_seconds: 30, speak_seconds: 90,
  expected: "Eine klare Position, mindestens zwei Begründungen und ein eingeräumter Punkt der Gegenseite.",
  provenance: { source_chapter: "5", source_module: "M2", source_page: "70" },
};

const V2 = {
  id: "core-2026b-v2",
  group: "core-2026b",
  title: "Skillcase B2 — Einstufung V2",
  theme: "Technik im Büro",
  provenance: PROV,
  reading: READING, listening: LISTENING, language: LANGUAGE,
  production: PRODUCTION, speaking: SPEAKING,
};

module.exports = { V2 };
