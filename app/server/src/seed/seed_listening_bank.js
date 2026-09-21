/**
 * SEED — Listening practice depth pass. board='custom', alignment='original'.
 *
 *   node src/seed/seed_listening_bank.js [--force]
 *
 * Adds new standalone Listening experiences on top of the 1 already seeded
 * by seed_practice_bank.js (practice-listening-1) — this file owns
 * practice-listening-2 onward. Same b2_papers/b2_paper_sections/
 * b2_paper_items model, same content_model.js validators, same
 * seedPaper()/buildItemRow() plumbing via practice_seed_lib.js.
 *
 * AUDIO: each spec's `section.turns` is the authoritative script — the exact
 * shape tools/make_listening_audio.js hands to tts.js's synthesise(). Seeding
 * a paper sets `audio_required=true` + `audio_intended_id` on its section
 * (mirroring core-2026b's and practice-listening-1's pattern); the paper
 * stays inert in Practice Mode discovery only in the sense that
 * ExamPaper.jsx's `ctx.available` check (audio_asset_id actually attached)
 * decides whether a learner sees a Play button or an honest "not recorded
 * yet" message — never a player that plays nothing. Run
 * tools/make_listening_audio.js after seeding (or re-seeding with --force)
 * to actually cut and attach the clips.
 *
 * TRANSCRIPT VISIBILITY: `section.passage` is intentionally left null for
 * every listening paper here — ExamPaper.jsx only renders `ctx.text` when
 * `item.skill !== "listening"`, so the transcript is never shown to the
 * learner as primary content. The `turns` array (with full script text) is
 * the authoritative internal transcript for audio generation/QA/SME
 * review/debugging, kept in this source file and in the section row's
 * association to the audio asset — never surfaced as `passage`.
 *
 * CAPABILITY MAPPING: understand_speech (comprehension, the majority),
 * concede/ask_followup (already listening-eligible in capabilities.js), and
 * argue/justify/compare/speculate — added to those capabilities'
 * `experiences` arrays in this pass on the same basis "reading" was already
 * there: RECEPTIVE evidence (recognising an argument/reason/comparison/
 * suggestion in spoken input) for a capability whose full form is
 * productive, exactly as reading evidence already worked for the same four.
 * maintain_discussion and react_unexpected are deliberately NEVER used here
 * — capabilities.js documents both as trainable only through live
 * conversation (Maya), and an MCQ cannot exercise either.
 */
require("../env")();
const { mcq, trueFalse, multiSelect, matching, ordering, seedPaper } = require("./practice_seed_lib");

function listeningPaper(id, title, sectionTitle, turns, items, { minutes = 10, audioId } = {}) {
  return {
    paper: {
      id, board: "custom", title, minutes,
      source: "Skillcase, original transcript. Audio: Azure Neural TTS — see tools/make_listening_audio.js.",
      exam_version: "B2", alignment: "original",
    },
    section: {
      module: "hoeren", title: sectionTitle,
      instruction: "Hören Sie und beantworten Sie die Aufgaben.",
      minutes, skill: "listening", scoring_mode: "OBJECTIVE",
      audio_required: true, audio_intended_id: audioId,
      turns,
    },
    items,
  };
}

/* ══════════════════════════════════════════════════════════════════════
   PROOF-OF-PIPELINE EXPERIENCE — authored, seeded, synthesised and
   browser-verified FIRST, before the rest of the corpus, per the brief's
   explicit "prove the pipeline before scaling" requirement.

   FORMAT: voicemail (single speaker, monologue) — a format not yet used by
   practice-listening-1 (which is a multi-speaker team conversation).
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_2 = listeningPaper("practice-listening-2",
  "Hörverstehen — Anrufbeantworter: Terminabsage",
  "Anrufbeantworter: Terminabsage",
  [
    { voice: "conrad", speaker: "Handwerker",
      text: "Guten Tag, hier ist Herr Brandt von der Elektrofirma Brandt. Ich rufe wegen unseres Termins morgen früh um acht Uhr an — leider muss ich den Termin verschieben, weil bei einer vorherigen Baustelle ein größerer Wasserschaden aufgetreten ist, den ich zuerst beheben muss. Wäre es möglich, stattdessen übermorgen am Nachmittag, so gegen vierzehn Uhr, vorbeizukommen? Falls das nicht passt, rufen Sie mich gerne zurück, meine Nummer haben Sie ja. Ich melde mich in jedem Fall noch einmal, wenn ich von der anderen Baustelle wegkomme. Vielen Dank und einen schönen Tag noch." },
  ],
  [
    mcq({ stem: "Warum ruft Herr Brandt an?", options: ["Er muss den vereinbarten Termin verschieben.", "Er bestätigt den Termin wie geplant.", "Er storniert den Auftrag komplett."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"leider muss ich den Termin verschieben\"." }),
    mcq({ stem: "Warum kann Herr Brandt den ursprünglichen Termin nicht einhalten?", options: ["Wegen eines Wasserschadens auf einer anderen Baustelle.", "Wegen eines eigenen Krankheitsfalls.", "Weil er das Material nicht rechtzeitig bekommen hat."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"weil bei einer vorherigen Baustelle ein größerer Wasserschaden aufgetreten ist\"." }),
    trueFalse({ stem: "Herr Brandt schlägt vor, stattdessen übermorgen um 14 Uhr vorbeizukommen.", answer: true, capability: "understand_speech", difficulty: "A", rationale: "\"stattdessen übermorgen am Nachmittag, so gegen vierzehn Uhr\"." }),
    mcq({ stem: "Was soll die angerufene Person tun, falls der neue Termin nicht passt?", options: ["Herrn Brandt zurückrufen.", "Eine E-Mail an die Firma schreiben.", "Einfach nichts unternehmen."], answer: 0, capability: "ask_followup", difficulty: "B", rationale: "\"Falls das nicht passt, rufen Sie mich gerne zurück.\"" }),
  ], { minutes: 8, audioId: "practice_listening_2_terminabsage" });

/* ══════════════════════════════════════════════════════════════════════
   3 — SERVICE INTERACTION (phone) — Restaurantreservierung ändern
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_3 = listeningPaper("practice-listening-3",
  "Hörverstehen — Telefonat: Reservierung ändern", "Telefonat: Reservierung ändern",
  [
    { voice: "katja", speaker: "Restaurant", text: "Restaurant Lindenhof, guten Tag." },
    { voice: "mia", speaker: "Anruferin", text: "Guten Tag, ich habe für heute Abend um neunzehn Uhr einen Tisch für vier Personen reserviert, unter dem Namen Keller. Könnte ich die Reservierung auf sechs Personen erweitern?" },
    { voice: "katja", speaker: "Restaurant", text: "Einen Moment, ich schaue nach … Für sechs Personen um neunzehn Uhr wird es eng, aber ich könnte Ihnen einen Tisch um neunzehn Uhr dreißig anbieten, dann passt es sicher." },
    { voice: "mia", speaker: "Anruferin", text: "Neunzehn Uhr dreißig ist völlig in Ordnung, das nehmen wir gerne." },
    { voice: "katja", speaker: "Restaurant", text: "Perfekt, ich habe es auf sechs Personen und neunzehn Uhr dreißig geändert. Wir freuen uns auf Sie." },
  ],
  [
    mcq({ stem: "Worum bittet die Anruferin?", options: ["Die Reservierung um zwei Personen zu erweitern.", "Die Reservierung komplett zu stornieren.", "Einen neuen Tisch für morgen zu buchen."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"Könnte ich die Reservierung auf sechs Personen erweitern?\"" }),
    mcq({ stem: "Was schlägt das Restaurant als Lösung vor?", options: ["Einen Tisch um 19:30 statt 19:00 Uhr.", "Einen Tisch für nur vier Personen.", "Eine Reservierung für einen anderen Tag."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"ich könnte Ihnen einen Tisch um neunzehn Uhr dreißig anbieten\"." }),
    trueFalse({ stem: "Die Anruferin lehnt den neuen Vorschlag ab.", answer: false, capability: "understand_speech", difficulty: "A", rationale: "\"Neunzehn Uhr dreißig ist völlig in Ordnung, das nehmen wir gerne.\"" }),
  ], { minutes: 6, audioId: "practice_listening_3_reservierung" });

/* ══════════════════════════════════════════════════════════════════════
   4 — SHORT INTERVIEW — Physiotherapeutin über ihren Beruf
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_4 = listeningPaper("practice-listening-4",
  "Hörverstehen — Interview: Alltag einer Physiotherapeutin", "Interview: Alltag einer Physiotherapeutin",
  [
    { voice: "klaus", speaker: "Moderator", text: "Frau Adler, was überrascht Menschen am meisten an Ihrem Beruf?" },
    { voice: "ingrid", speaker: "Physiotherapeutin", text: "Die meisten denken, wir massieren nur ein bisschen und das war's. Tatsächlich planen wir für jeden Patienten ein individuelles Übungsprogramm, das sich über Wochen verändert, je nachdem, wie der Heilungsprozess verläuft." },
    { voice: "klaus", speaker: "Moderator", text: "Was ist die größte Herausforderung im Alltag?" },
    { voice: "ingrid", speaker: "Physiotherapeutin", text: "Ehrlich gesagt die Zeit. Für eine wirklich gute Behandlung bräuchte ich oft dreißig Minuten pro Patient, aber der Terminkalender lässt meistens nur zwanzig zu. Das ist ein ständiger Kompromiss." },
    { voice: "klaus", speaker: "Moderator", text: "Trotzdem klingen Sie zufrieden mit Ihrer Berufswahl." },
    { voice: "ingrid", speaker: "Physiotherapeutin", text: "Absolut. Wenn ein Patient nach Wochen wieder schmerzfrei die Treppe hochgehen kann, ist das ein Erfolg, den man direkt sieht — das gibt es in wenigen Berufen." },
  ],
  [
    mcq({ stem: "Was, laut Frau Adler, denken viele Menschen fälschlicherweise über ihren Beruf?", options: ["Dass es nur um ein bisschen Massage geht.", "Dass Physiotherapie sehr gut bezahlt wird.", "Dass der Beruf keine Ausbildung erfordert."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"Die meisten denken, wir massieren nur ein bisschen und das war's.\"" }),
    mcq({ stem: "Was nennt Frau Adler als größte Herausforderung?", options: ["Die knappe Zeit pro Patient.", "Die körperliche Anstrengung.", "Zu wenige Patienten."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"Ehrlich gesagt die Zeit … der Terminkalender lässt meistens nur zwanzig zu.\"" }),
    trueFalse({ stem: "Frau Adler bräuchte pro Patient eigentlich mehr Zeit, als der Terminkalender zulässt.", answer: true, capability: "understand_speech", difficulty: "A", rationale: "\"bräuchte ich oft dreißig Minuten … aber der Terminkalender lässt meistens nur zwanzig zu.\"" }),
    mcq({ stem: "Woran macht Frau Adler ihre Zufriedenheit mit dem Beruf fest?", options: ["Am sichtbaren Erfolg, wenn ein Patient wieder schmerzfrei ist.", "An den guten Arbeitszeiten.", "An der Zusammenarbeit mit Ärzten."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"Wenn ein Patient … wieder schmerzfrei die Treppe hochgehen kann, ist das ein Erfolg, den man direkt sieht.\"" }),
  ], { minutes: 10, audioId: "practice_listening_4_physiotherapeutin" });

/* ══════════════════════════════════════════════════════════════════════
   5 — RADIO/PODCAST EXCERPT — Stadtradio über Fahrradverleih
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_5 = listeningPaper("practice-listening-5",
  "Hörverstehen — Radiobeitrag: Neues Fahrradverleihsystem", "Radiobeitrag: Neues Fahrradverleihsystem",
  [
    { voice: "mia", speaker: "Moderatorin", text: "Seit letzter Woche gibt es in der Innenstadt ein neues Fahrradverleihsystem, über das wir jetzt kurz berichten. Über eine App können Nutzer an mehr als vierzig Stationen ein Fahrrad ausleihen und an einer beliebigen anderen Station wieder zurückgeben. In den ersten sieben Tagen wurden bereits über dreitausend Fahrten gezählt — deutlich mehr, als die Stadtverwaltung erwartet hatte. Kritik gibt es allerdings von Anwohnern in der Altstadt: Dort stehen die Stationen teilweise so dicht an schmalen Gehwegen, dass Rollstuhlfahrer und Kinderwagen kaum vorbeikommen. Die Stadt hat bereits reagiert und angekündigt, drei besonders problematische Stationen innerhalb der nächsten zwei Wochen zu verlegen." },
  ],
  [
    mcq({ stem: "Was ist das zentrale Thema des Radiobeitrags?", options: ["Ein neues Fahrradverleihsystem in der Innenstadt.", "Ein Verbot von Fahrrädern in der Altstadt.", "Eine Preiserhöhung für den öffentlichen Nahverkehr."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"Seit letzter Woche gibt es in der Innenstadt ein neues Fahrradverleihsystem.\"" }),
    trueFalse({ stem: "In der ersten Woche wurden weniger Fahrten gezählt, als die Stadtverwaltung erwartet hatte.", answer: false, capability: "understand_speech", difficulty: "B", rationale: "\"deutlich mehr, als die Stadtverwaltung erwartet hatte\"." }),
    mcq({ stem: "Was kritisieren Anwohner der Altstadt?", options: ["Dass Stationen den Gehweg für Rollstühle und Kinderwagen blockieren.", "Dass die App zu kompliziert ist.", "Dass es zu wenige Fahrräder gibt."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"stehen die Stationen teilweise so dicht … dass Rollstuhlfahrer und Kinderwagen kaum vorbeikommen\"." }),
    mcq({ stem: "Wie reagiert die Stadt auf die Kritik?", options: ["Sie kündigt an, drei Stationen zu verlegen.", "Sie ignoriert die Kritik vollständig.", "Sie schafft das ganze System wieder ab."], answer: 0, capability: "understand_speech", difficulty: "C", rationale: "\"angekündigt, drei besonders problematische Stationen … zu verlegen\"." }),
  ], { minutes: 8, audioId: "practice_listening_5_fahrradverleih" });

/* ══════════════════════════════════════════════════════════════════════
   6 — ANNOUNCEMENT — Bahnhofsdurchsage: Verspätung
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_6 = listeningPaper("practice-listening-6",
  "Hörverstehen — Bahnhofsdurchsage: Verspätung", "Bahnhofsdurchsage: Verspätung",
  [
    { voice: "conrad", speaker: "Durchsage", text: "Ihre Aufmerksamkeit bitte. Der Intercity 2047 nach Hamburg, planmäßige Abfahrt neun Uhr zwölf auf Gleis vier, verspätet sich voraussichtlich um fünfundzwanzig Minuten. Grund ist eine technische Störung an einem vorausfahrenden Zug. Reisende mit Anschluss in Hannover werden gebeten, sich am Servicepunkt über alternative Verbindungen zu informieren. Wir bitten, die Verspätung zu entschuldigen." },
  ],
  [
    mcq({ stem: "Um wie viele Minuten verspätet sich der Zug?", options: ["Fünfundzwanzig Minuten.", "Fünfzehn Minuten.", "Zwölf Minuten."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"verspätet sich voraussichtlich um fünfundzwanzig Minuten\"." }),
    mcq({ stem: "Was ist der Grund für die Verspätung?", options: ["Eine technische Störung an einem vorausfahrenden Zug.", "Ein Streik des Personals.", "Schlechtes Wetter."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"Grund ist eine technische Störung an einem vorausfahrenden Zug.\"" }),
    trueFalse({ stem: "Reisende mit Anschluss in Hannover sollen sich am Servicepunkt informieren.", answer: true, capability: "understand_speech", difficulty: "A", rationale: "\"werden gebeten, sich am Servicepunkt über alternative Verbindungen zu informieren\"." }),
  ], { minutes: 5, audioId: "practice_listening_6_bahnhofsdurchsage" });

/* ══════════════════════════════════════════════════════════════════════
   7 — PLANNING DISCUSSION — Umzug planen
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_7 = listeningPaper("practice-listening-7",
  "Hörverstehen — Zwei Freunde planen einen Umzug", "Zwei Freunde planen einen Umzug",
  [
    { voice: "jan", speaker: "Freund 1", text: "Also, der Umzugstermin ist der fünfzehnte. Sollen wir einen Umzugswagen mieten oder lieber eine Umzugsfirma beauftragen?" },
    { voice: "klaus", speaker: "Freund 2", text: "Ich hätte gedacht, ein Wagen reicht, aber du hast ja auch das schwere Klavier. Eine Firma wäre bei dem Gewicht wahrscheinlich sicherer." },
    { voice: "jan", speaker: "Freund 1", text: "Stimmt, an das Klavier hatte ich gar nicht gedacht. Okay, dann hole ich morgen drei Angebote ein. Können wir uns Samstag treffen, um die Kartons zu packen?" },
    { voice: "klaus", speaker: "Freund 2", text: "Samstag geht bei mir leider nicht, da habe ich schon etwas vor. Aber Sonntagvormittag hätte ich Zeit." },
    { voice: "jan", speaker: "Freund 1", text: "Gut, dann machen wir Sonntag ab zehn Uhr, das passt mir auch besser." },
  ],
  [
    mcq({ stem: "Was war der ursprüngliche Plan von Freund 1 für den Transport?", options: ["Einen Umzugswagen mieten.", "Eine Umzugsfirma beauftragen.", "Alles mit dem eigenen Auto transportieren."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"Sollen wir einen Umzugswagen mieten …\" ist der erste Vorschlag." }),
    mcq({ stem: "Warum empfiehlt Freund 2 eine Umzugsfirma?", options: ["Wegen des schweren Klaviers.", "Weil ein Wagen zu teuer wäre.", "Weil er selbst nicht mithelfen kann."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"du hast ja auch das schwere Klavier. Eine Firma wäre bei dem Gewicht wahrscheinlich sicherer.\"" }),
    trueFalse({ stem: "Die beiden treffen sich am Samstag, um die Kartons zu packen.", answer: false, capability: "understand_speech", difficulty: "B", rationale: "Samstag geht bei Freund 2 nicht — sie einigen sich stattdessen auf Sonntag." }),
    mcq({ stem: "Auf welchen Termin einigen sich die beiden am Ende für das Packen?", options: ["Sonntag ab zehn Uhr.", "Samstagnachmittag.", "Freitagabend."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"dann machen wir Sonntag ab zehn Uhr\"." }),
  ], { minutes: 9, audioId: "practice_listening_7_umzugsplanung" });

/* ══════════════════════════════════════════════════════════════════════
   8 — DISAGREEMENT (informal) — Geschwister über ein geerbtes Haus
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_8 = listeningPaper("practice-listening-8",
  "Hörverstehen — Geschwister uneinig über das geerbte Haus", "Geschwister uneinig über das geerbte Haus",
  [
    { voice: "katja", speaker: "Schwester", text: "Ich finde wirklich, wir sollten das Haus verkaufen. Keiner von uns beiden wohnt in der Nähe, und die Instandhaltung kostet jedes Jahr mehr." },
    { voice: "conrad", speaker: "Bruder", text: "Das verstehe ich, aber es ist das Elternhaus. Ich könnte mir vorstellen, es zu vermieten, statt es komplett zu verkaufen." },
    { voice: "katja", speaker: "Schwester", text: "Vermieten heißt aber auch: ständig Ansprechpartner sein, Reparaturen organisieren, Mieter finden. Wer soll das machen, wenn wir beide zwei Stunden entfernt wohnen?" },
    { voice: "conrad", speaker: "Bruder", text: "Zugegeben, das ist ein berechtigter Punkt. Vielleicht könnten wir eine Hausverwaltung beauftragen — das kostet zwar etwas, aber dann müssten wir uns nicht selbst kümmern." },
    { voice: "katja", speaker: "Schwester", text: "Das wäre für mich ein Kompromiss, über den ich nachdenken könnte. Lass uns beide mal Angebote von Hausverwaltungen einholen, bevor wir entscheiden." },
  ],
  [
    mcq({ stem: "Was schlägt die Schwester zu Beginn vor?", options: ["Das Haus verkaufen.", "Das Haus selbst bewohnen.", "Das Haus sofort renovieren."], answer: 0, capability: "argue", difficulty: "B", rationale: "\"Ich finde wirklich, wir sollten das Haus verkaufen.\"" }),
    mcq({ stem: "Welchen Gegenvorschlag macht der Bruder zuerst?", options: ["Das Haus vermieten statt verkaufen.", "Das Haus sofort abreißen lassen.", "Das Haus an einen Nachbarn verschenken."], answer: 0, capability: "speculate", difficulty: "B", rationale: "\"Ich könnte mir vorstellen, es zu vermieten, statt es komplett zu verkaufen.\"" }),
    trueFalse({ stem: "Der Bruder räumt ein, dass das Argument der Schwester zum Verwaltungsaufwand berechtigt ist.", answer: true, capability: "concede", difficulty: "B", rationale: "\"Zugegeben, das ist ein berechtigter Punkt.\"" }),
    mcq({ stem: "Worauf einigen sich die Geschwister am Ende des Gesprächs?", options: ["Angebote von Hausverwaltungen einzuholen, bevor sie entscheiden.", "Das Haus sofort zu verkaufen.", "Das Thema komplett zu vertagen."], answer: 0, capability: "understand_speech", difficulty: "C", rationale: "\"Lass uns beide mal Angebote von Hausverwaltungen einholen, bevor wir entscheiden.\"" }),
  ], { minutes: 9, audioId: "practice_listening_8_erbschaft" });

/* ══════════════════════════════════════════════════════════════════════
   9 — ADVICE CONVERSATION — Rat zur Wohnungskündigung
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_9 = listeningPaper("practice-listening-9",
  "Hörverstehen — Rat: Wohnung kündigen wegen Schimmel", "Rat: Wohnung kündigen wegen Schimmel",
  [
    { voice: "mia", speaker: "Anruferin", text: "In meiner Wohnung ist seit zwei Monaten Schimmel im Badezimmer, und der Vermieter reagiert nicht auf meine E-Mails. Kann ich einfach fristlos kündigen?" },
    { voice: "ingrid", speaker: "Beraterin", text: "Fristlos wäre riskant, ohne vorher klare Schritte gegangen zu sein. Haben Sie dem Vermieter schriftlich eine Frist gesetzt, den Schimmel zu beseitigen?" },
    { voice: "mia", speaker: "Anruferin", text: "Nein, ich habe nur zweimal informell per E-Mail geschrieben." },
    { voice: "ingrid", speaker: "Beraterin", text: "Dann würde ich Ihnen raten, zuerst ein eingeschriebenes Schreiben mit einer klaren Frist von zwei Wochen zu senden. Erst wenn diese Frist verstreicht, haben Sie eine deutlich stärkere rechtliche Position — auch für eine mögliche Mietminderung." },
    { voice: "mia", speaker: "Anruferin", text: "Verstehe. Und wenn er auch dann nicht reagiert?" },
    { voice: "ingrid", speaker: "Beraterin", text: "Dann kann eine fristlose Kündigung tatsächlich infrage kommen — aber erst dann, und idealerweise nach Rücksprache mit einem Mieterverein." },
  ],
  [
    mcq({ stem: "Was ist das Problem der Anruferin?", options: ["Schimmel im Badezimmer, auf den der Vermieter nicht reagiert.", "Zu hohe Miete.", "Ein Nachbarschaftsstreit wegen Lärm."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"In meiner Wohnung ist seit zwei Monaten Schimmel im Badezimmer, und der Vermieter reagiert nicht.\"" }),
    mcq({ stem: "Was rät die Beraterin als ersten konkreten Schritt?", options: ["Ein eingeschriebenes Schreiben mit einer Frist von zwei Wochen senden.", "Sofort fristlos kündigen.", "Die Miete komplett einstellen."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"zuerst ein eingeschriebenes Schreiben mit einer klaren Frist von zwei Wochen zu senden\"." }),
    trueFalse({ stem: "Die Beraterin hält eine sofortige fristlose Kündigung für die beste erste Option.", answer: false, capability: "understand_speech", difficulty: "B", rationale: "\"Fristlos wäre riskant, ohne vorher klare Schritte gegangen zu sein.\"" }),
    mcq({ stem: "Unter welcher Bedingung hält die Beraterin eine fristlose Kündigung für möglich?", options: ["Wenn der Vermieter auch nach Ablauf der gesetzten Frist nicht reagiert.", "Sofort, ohne weitere Schritte.", "Nur nach einem Gerichtsurteil."], answer: 0, capability: "understand_speech", difficulty: "C", rationale: "\"Dann kann eine fristlose Kündigung tatsächlich infrage kommen — aber erst dann.\"" }),
  ], { minutes: 10, audioId: "practice_listening_9_wohnungskuendigung" });

/* ══════════════════════════════════════════════════════════════════════
   10 — SERVICE INTERACTION — Beim Friseur: Terminänderung
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_10 = listeningPaper("practice-listening-10",
  "Hörverstehen — Beim Friseur: Terminänderung", "Beim Friseur: Terminänderung",
  [
    { voice: "katja", speaker: "Kundin", text: "Hallo, ich habe für Donnerstag um sechzehn Uhr einen Termin für Schneiden und Färben. Ist es möglich, nur das Schneiden zu machen und das Färben auf einen anderen Termin zu verschieben? Mir ist die Zeit heute zu knapp geworden." },
    { voice: "mia", speaker: "Friseurin", text: "Kein Problem. Dann reduzieren wir den heutigen Termin auf etwa vierzig Minuten. Für das Färben würde ich Ihnen den kommenden Dienstag um vierzehn Uhr vorschlagen." },
    { voice: "katja", speaker: "Kundin", text: "Dienstag um vierzehn Uhr passt mir leider nicht, ich arbeite da bis siebzehn Uhr. Geht es auch später am Nachmittag?" },
    { voice: "mia", speaker: "Friseurin", text: "Dienstag um siebzehn Uhr dreißig hätte ich noch frei." },
    { voice: "katja", speaker: "Kundin", text: "Das passt perfekt, vielen Dank." },
  ],
  [
    mcq({ stem: "Was möchte die Kundin heute ändern?", options: ["Nur schneiden lassen, das Färben verschieben.", "Den ganzen Termin absagen.", "Statt Färben nur eine Dauerwelle machen lassen."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"Ist es möglich, nur das Schneiden zu machen und das Färben auf einen anderen Termin zu verschieben?\"" }),
    mcq({ stem: "Warum lehnt die Kundin den ersten Terminvorschlag für das Färben ab?", options: ["Sie arbeitet bis 17 Uhr an diesem Tag.", "Sie hat an dem Tag keine Zeit für einen Friseurbesuch.", "Der Preis ist ihr zu hoch."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"Dienstag um vierzehn Uhr passt mir leider nicht, ich arbeite da bis siebzehn Uhr.\"" }),
    trueFalse({ stem: "Der finale Termin für das Färben ist Dienstag um 17:30 Uhr.", answer: true, capability: "understand_speech", difficulty: "A", rationale: "\"Dienstag um siebzehn Uhr dreißig hätte ich noch frei.\" — die Kundin nimmt diesen Termin an." }),
  ], { minutes: 6, audioId: "practice_listening_10_friseurtermin" });

/* ══════════════════════════════════════════════════════════════════════
   11 — PROFESSIONAL CONVERSATION — Kollegen besprechen ein Kundenproblem
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_11 = listeningPaper("practice-listening-11",
  "Hörverstehen — Kollegen besprechen ein Kundenproblem", "Kollegen besprechen ein Kundenproblem",
  [
    { voice: "jan", speaker: "Kollege 1", text: "Der Kunde Meierhoff hat sich heute Morgen beschwert — seine Bestellung ist zum dritten Mal falsch geliefert worden." },
    { voice: "klaus", speaker: "Kollege 2", text: "Zum dritten Mal? Das ist wirklich ärgerlich. Liegt das an einem Systemfehler oder eher an der Kommunikation mit dem Lager?" },
    { voice: "jan", speaker: "Kollege 1", text: "Ich habe es geprüft — es liegt tatsächlich an einer falschen Artikelnummer in unserem System, die nicht mit der des Lagers übereinstimmt." },
    { voice: "klaus", speaker: "Kollege 2", text: "Dann sollten wir das nicht nur für diesen einen Kunden korrigieren, sondern prüfen, ob dieselbe Artikelnummer auch bei anderen Bestellungen zu Problemen führt." },
    { voice: "jan", speaker: "Kollege 1", text: "Guter Punkt, das hatte ich noch nicht bedacht. Ich ziehe eine Liste aller betroffenen Bestellungen der letzten vier Wochen." },
  ],
  [
    mcq({ stem: "Was ist das konkrete Problem des Kunden Meierhoff?", options: ["Seine Bestellung wurde zum dritten Mal falsch geliefert.", "Er hat zu viel bezahlt.", "Seine Bestellung ist komplett verschwunden."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"seine Bestellung ist zum dritten Mal falsch geliefert worden\"." }),
    mcq({ stem: "Was ist laut Kollege 1 die tatsächliche Ursache?", options: ["Eine falsche Artikelnummer im System.", "Ein Fehler des Kunden bei der Bestellung.", "Ein Streik im Lager."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"es liegt tatsächlich an einer falschen Artikelnummer in unserem System.\"" }),
    mcq({ stem: "Was schlägt Kollege 2 zusätzlich vor?", options: ["Zu prüfen, ob dieselbe Artikelnummer auch andere Bestellungen betrifft.", "Den Kunden Meierhoff sofort zu entschädigen.", "Das System komplett neu aufzusetzen."], answer: 0, capability: "speculate", difficulty: "C", rationale: "\"sollten wir das nicht nur für diesen einen Kunden korrigieren, sondern prüfen, ob dieselbe Artikelnummer auch bei anderen Bestellungen zu Problemen führt.\"" }),
  ], { minutes: 7, audioId: "practice_listening_11_kundenproblem" });

/* ══════════════════════════════════════════════════════════════════════
   12 — OPINION EXCHANGE — Remote-Arbeit
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_12 = listeningPaper("practice-listening-12",
  "Hörverstehen — Meinungsaustausch: Remote-Arbeit", "Meinungsaustausch: Remote-Arbeit",
  [
    { voice: "mia", speaker: "Kollegin 1", text: "Ich könnte mir nicht mehr vorstellen, jeden Tag ins Büro zu fahren. Zwei Stunden Pendelzeit spare ich mir jetzt komplett." },
    { voice: "katja", speaker: "Kollegin 2", text: "Verstehe ich total, aber mir fehlt der spontane Austausch mit dem Team. Am Bildschirm frage ich seltener kurz zwischendurch nach, weil es sich formeller anfühlt." },
    { voice: "mia", speaker: "Kollegin 1", text: "Das stimmt, kurze spontane Fragen gehen im Homeoffice leichter unter. Trotzdem würde ich die Zeitersparnis nicht mehr eintauschen wollen." },
    { voice: "katja", speaker: "Kollegin 2", text: "Für mich wäre ein Mittelweg ideal: zwei Tage im Büro für den Austausch, drei Tage zu Hause für konzentriertes Arbeiten." },
  ],
  [
    mcq({ stem: "Was schätzt Kollegin 1 am meisten am Homeoffice?", options: ["Die eingesparte Pendelzeit.", "Die bessere technische Ausstattung.", "Mehr Kontakt zu Kunden."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"Zwei Stunden Pendelzeit spare ich mir jetzt komplett.\"" }),
    mcq({ stem: "Was vermisst Kollegin 2 im Homeoffice?", options: ["Den spontanen Austausch mit dem Team.", "Einen eigenen Schreibtisch.", "Die Kantine."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"mir fehlt der spontane Austausch mit dem Team.\"" }),
    mcq({ stem: "Welchen Kompromiss schlägt Kollegin 2 am Ende vor?", options: ["Zwei Tage im Büro, drei Tage zu Hause.", "Komplett ins Büro zurückkehren.", "Nur noch im Homeoffice arbeiten."], answer: 0, capability: "compare", difficulty: "C", rationale: "\"zwei Tage im Büro für den Austausch, drei Tage zu Hause für konzentriertes Arbeiten.\"" }),
  ], { minutes: 7, audioId: "practice_listening_12_remotearbeit" });

/* ══════════════════════════════════════════════════════════════════════
   13 — INFORMAL DISCUSSION — Urlaubspläne
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_13 = listeningPaper("practice-listening-13",
  "Hörverstehen — Freunde reden über Urlaubspläne", "Freunde reden über Urlaubspläne",
  [
    { voice: "jan", speaker: "Freund 1", text: "Wir wollten doch eigentlich nach Portugal fliegen, aber die Flugpreise sind gerade wahnsinnig hoch." },
    { voice: "mia", speaker: "Freundin", text: "Stimmt, ich habe letzte Woche geschaut, über sechshundert Euro pro Person. Was hältst du davon, stattdessen mit dem Zug nach Südfrankreich zu fahren?" },
    { voice: "jan", speaker: "Freund 1", text: "Klingt interessant, aber wie lange dauert das mit dem Zug?" },
    { voice: "mia", speaker: "Freundin", text: "Mit einer Übernachtung unterwegs etwa anderthalb Tage — anstrengender, aber deutlich günstiger, und wir sehen unterwegs noch etwas von der Landschaft." },
    { voice: "jan", speaker: "Freund 1", text: "Gut, lass uns das machen. Dann buche ich diese Woche noch die Zugtickets." },
  ],
  [
    mcq({ stem: "Was war der ursprüngliche Reiseplan der beiden?", options: ["Ein Flug nach Portugal.", "Eine Zugreise nach Südfrankreich.", "Ein Urlaub zu Hause."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"Wir wollten doch eigentlich nach Portugal fliegen.\"" }),
    mcq({ stem: "Warum wird der ursprüngliche Plan infrage gestellt?", options: ["Weil die Flugpreise sehr hoch sind.", "Weil es keine Flüge mehr gibt.", "Weil einer der beiden Flugangst hat."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"die Flugpreise sind gerade wahnsinnig hoch.\"" }),
    trueFalse({ stem: "Die Zugreise nach Südfrankreich dauert laut Freundin nur wenige Stunden.", answer: false, capability: "understand_speech", difficulty: "B", rationale: "\"Mit einer Übernachtung unterwegs etwa anderthalb Tage.\"" }),
    mcq({ stem: "Wie entscheiden sich die beiden am Ende?", options: ["Für die Zugreise nach Südfrankreich.", "Für den ursprünglichen Flug nach Portugal.", "Für einen Urlaub ganz ohne Reise."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"Gut, lass uns das machen. Dann buche ich diese Woche noch die Zugtickets.\"" }),
  ], { minutes: 8, audioId: "practice_listening_13_urlaubsplanung" });

/* ══════════════════════════════════════════════════════════════════════
   14 — SHORT PRESENTATION — Neues Tool im Team
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_14 = listeningPaper("practice-listening-14",
  "Hörverstehen — Kurzvortrag: Einführung eines neuen Projekttools", "Kurzvortrag: Einführung eines neuen Projekttools",
  [
    { voice: "klaus", speaker: "Teamleiter", text: "Ich möchte euch kurz das neue Projekttool vorstellen, das wir ab nächstem Monat nutzen werden. Der Hauptgrund für den Wechsel: Unser bisheriges Tool erlaubte keine automatische Erinnerung bei überfälligen Aufgaben, was in den letzten Monaten mehrfach zu verpassten Deadlines geführt hat. Das neue Tool schickt automatisch eine Benachrichtigung, sobald eine Aufgabe zwei Tage vor Fälligkeit noch nicht bearbeitet wurde. Die Einführung erfolgt schrittweise: In der ersten Woche testen nur die Teamleitungen das System, danach folgt eine Schulung für alle, und erst in der dritten Woche arbeiten wir vollständig im neuen Tool. Fragen dazu könnt ihr gerne direkt an mich richten." },
  ],
  [
    mcq({ stem: "Was ist der Hauptgrund für den Wechsel zum neuen Tool?", options: ["Das alte Tool erlaubte keine automatischen Erinnerungen bei überfälligen Aufgaben.", "Das alte Tool war zu teuer.", "Das alte Tool wird nicht mehr unterstützt."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"Unser bisheriges Tool erlaubte keine automatische Erinnerung … was … zu verpassten Deadlines geführt hat.\"" }),
    mcq({ stem: "Wann schickt das neue Tool eine Benachrichtigung?", options: ["Zwei Tage vor Fälligkeit, wenn die Aufgabe noch offen ist.", "Erst nach Ablauf der Frist.", "Jeden Morgen automatisch für alle Aufgaben."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"sobald eine Aufgabe zwei Tage vor Fälligkeit noch nicht bearbeitet wurde.\"" }),
    ordering({
      stem: "Bringen Sie die Schritte der Einführung in die richtige Reihenfolge.",
      items: ["Nur die Teamleitungen testen das System.", "Schulung für das gesamte Team.", "Vollständige Arbeit im neuen Tool."],
      order: [0, 1, 2], capability: "understand_speech", difficulty: "C",
      rationale: "\"In der ersten Woche testen nur die Teamleitungen … danach folgt eine Schulung für alle, und erst in der dritten Woche arbeiten wir vollständig im neuen Tool.\"" }),
  ], { minutes: 8, audioId: "practice_listening_14_neues_tool" });

/* ══════════════════════════════════════════════════════════════════════
   15 — CONVERSATION BETWEEN COLLEAGUES (nursing) — Übergabegespräch
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_15 = listeningPaper("practice-listening-15",
  "Hörverstehen — Übergabegespräch auf der Station", "Übergabegespräch auf der Station",
  [
    { voice: "katja", speaker: "Frühschicht", text: "Bei Herrn Wagner in Zimmer zwölf hat sich der Blutdruck heute Vormittag stabilisiert, das war gestern noch anders. Er braucht aber weiterhin engmaschige Kontrolle alle zwei Stunden." },
    { voice: "conrad", speaker: "Spätschicht", text: "Verstanden. Gab es sonst noch etwas Auffälliges heute?" },
    { voice: "katja", speaker: "Frühschicht", text: "Ja, Frau Öztürk in Zimmer vierzehn hat gegen Mittag über Übelkeit geklagt, das war neu. Der Arzt wurde informiert und hat ein Medikament angeordnet, das ab sechzehn Uhr gegeben werden soll." },
    { voice: "conrad", speaker: "Spätschicht", text: "Also erst ab sechzehn Uhr, nicht schon jetzt?" },
    { voice: "katja", speaker: "Frühschicht", text: "Genau, erst ab sechzehn Uhr, vorher ist es laut Anordnung nicht vorgesehen." },
  ],
  [
    mcq({ stem: "Was hat sich bei Herrn Wagner seit gestern verändert?", options: ["Sein Blutdruck hat sich stabilisiert.", "Sein Zustand hat sich verschlechtert.", "Er wurde in ein anderes Zimmer verlegt."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"hat sich der Blutdruck heute Vormittag stabilisiert, das war gestern noch anders.\"" }),
    mcq({ stem: "Was ist bei Frau Öztürk neu aufgetreten?", options: ["Übelkeit gegen Mittag.", "Fieber am Morgen.", "Schmerzen im Rücken."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"hat gegen Mittag über Übelkeit geklagt, das war neu.\"" }),
    trueFalse({ stem: "Das angeordnete Medikament für Frau Öztürk soll sofort gegeben werden.", answer: false, capability: "understand_speech", difficulty: "B", rationale: "\"erst ab sechzehn Uhr, vorher ist es laut Anordnung nicht vorgesehen.\"" }),
    mcq({ stem: "Was fragt die Spätschicht zur Klärung nach?", options: ["Ob das Medikament wirklich erst ab 16 Uhr gegeben werden soll.", "Ob Herr Wagner entlassen werden kann.", "Ob Frau Öztürk Besuch bekommen darf."], answer: 0, capability: "ask_followup", difficulty: "B", rationale: "\"Also erst ab sechzehn Uhr, nicht schon jetzt?\" — eine gezielte Rückfrage zur Bestätigung." }),
  ], { minutes: 9, audioId: "practice_listening_15_uebergabe" });

/* ══════════════════════════════════════════════════════════════════════
   16 — WORKPLACE DISCUSSION — Neue Software einführen
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_16 = listeningPaper("practice-listening-16",
  "Hörverstehen — Teambesprechung: Neue Software", "Teambesprechung: Neue Software",
  [
    { voice: "klaus", speaker: "Teamleiter", text: "Wir müssen entscheiden, ob wir die neue Buchhaltungssoftware schon nächsten Monat einführen oder erst im neuen Jahr." },
    { voice: "mia", speaker: "Mitarbeiterin 1", text: "Ich wäre für nächsten Monat, dann ist die Umstellung vor dem Jahresabschluss erledigt und wir starten sauber ins neue Jahr." },
    { voice: "jan", speaker: "Mitarbeiter 2", text: "Das sehe ich anders — mitten im laufenden Quartal umzustellen halte ich für riskant. Wenn etwas schiefgeht, haben wir mitten in der Abrechnung ein Problem." },
    { voice: "mia", speaker: "Mitarbeiterin 1", text: "Ein berechtigtes Risiko, das gebe ich zu. Aber der Anbieter hat uns eine Testphase parallel zum alten System angeboten, das würde das Risiko deutlich senken." },
    { voice: "jan", speaker: "Mitarbeiter 2", text: "Wenn die Testphase wirklich parallel läuft, ändert das meine Einschätzung. Dann könnte ich mir nächsten Monat auch vorstellen." },
  ],
  [
    mcq({ stem: "Worüber muss das Team entscheiden?", options: ["Ob die neue Software nächsten Monat oder im neuen Jahr eingeführt wird.", "Ob die alte Software komplett abgeschafft wird.", "Ob ein neuer Anbieter gesucht wird."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"Wir müssen entscheiden, ob wir die neue Buchhaltungssoftware schon nächsten Monat einführen oder erst im neuen Jahr.\"" }),
    mcq({ stem: "Warum ist Mitarbeiter 2 zunächst gegen eine Einführung im nächsten Monat?", options: ["Er hält eine Umstellung mitten im Quartal für riskant.", "Er findet die Software insgesamt überflüssig.", "Er hat noch keine Schulung erhalten."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"mitten im laufenden Quartal umzustellen halte ich für riskant.\"" }),
    trueFalse({ stem: "Mitarbeiterin 1 räumt ein, dass das Risiko-Argument von Mitarbeiter 2 berechtigt ist.", answer: true, capability: "concede", difficulty: "B", rationale: "\"Ein berechtigtes Risiko, das gebe ich zu.\"" }),
    mcq({ stem: "Was ändert am Ende Mitarbeiter 2s Meinung?", options: ["Die Aussicht auf eine parallele Testphase mit dem alten System.", "Ein direkter Befehl des Teamleiters.", "Ein günstigerer Preis des Anbieters."], answer: 0, capability: "understand_speech", difficulty: "C", rationale: "\"Wenn die Testphase wirklich parallel läuft, ändert das meine Einschätzung.\"" }),
  ], { minutes: 9, audioId: "practice_listening_16_neue_software" });

/* ══════════════════════════════════════════════════════════════════════
   17 — SHORT INTERVIEW — Quereinsteiger im Handwerk
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_17 = listeningPaper("practice-listening-17",
  "Hörverstehen — Interview: Vom Büro auf die Baustelle", "Interview: Vom Büro auf die Baustelle",
  [
    { voice: "mia", speaker: "Moderatorin", text: "Herr Kowalski, Sie haben mit fünfunddreißig Ihren Bürojob aufgegeben und eine Ausbildung zum Tischler begonnen. Warum?" },
    { voice: "jan", speaker: "Herr Kowalski", text: "Ich saß acht Stunden am Tag vor dem Bildschirm und hatte am Ende des Tages nie das Gefühl, etwas wirklich Sichtbares geschaffen zu haben. Das wollte ich ändern." },
    { voice: "mia", speaker: "Moderatorin", text: "War der finanzielle Rückschritt während der Ausbildung schwierig?" },
    { voice: "jan", speaker: "Herr Kowalski", text: "Ehrlich gesagt schon, ich habe während der Ausbildung deutlich weniger verdient als vorher. Aber ich hatte vorher genug gespart, um diese Phase zu überbrücken." },
    { voice: "mia", speaker: "Moderatorin", text: "Würden Sie es wieder so machen?" },
    { voice: "jan", speaker: "Herr Kowalski", text: "Auf jeden Fall, auch wenn ich jüngeren Kollegen raten würde, sich vorher genau auszurechnen, ob die Ersparnisse für die Ausbildungszeit wirklich reichen." },
  ],
  [
    mcq({ stem: "Warum hat Herr Kowalski seinen Bürojob aufgegeben?", options: ["Er wollte etwas sichtbar Geschaffenes hinterlassen.", "Er wurde entlassen.", "Der Lohn im Büro war zu niedrig."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"hatte am Ende des Tages nie das Gefühl, etwas wirklich Sichtbares geschaffen zu haben. Das wollte ich ändern.\"" }),
    trueFalse({ stem: "Herr Kowalski verdiente während der Ausbildung mehr als vorher im Büro.", answer: false, capability: "understand_speech", difficulty: "A", rationale: "\"ich habe während der Ausbildung deutlich weniger verdient als vorher.\"" }),
    mcq({ stem: "Wie konnte Herr Kowalski die finanziell schwierigere Zeit überbrücken?", options: ["Mit zuvor angesparten Rücklagen.", "Mit einem zusätzlichen Nebenjob.", "Mit einem Kredit der Bank."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"ich hatte vorher genug gespart, um diese Phase zu überbrücken.\"" }),
    mcq({ stem: "Welchen Rat gibt Herr Kowalski jüngeren Kollegen?", options: ["Vorher genau prüfen, ob die Ersparnisse für die Ausbildungszeit reichen.", "Auf keinen Fall den Beruf zu wechseln.", "Immer ohne finanzielle Planung zu starten."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"sich vorher genau auszurechnen, ob die Ersparnisse für die Ausbildungszeit wirklich reichen.\"" }),
  ], { minutes: 10, audioId: "practice_listening_17_quereinstieg" });

/* ══════════════════════════════════════════════════════════════════════
   18 — RADIO/PODCAST EXCERPT — Nachhaltigkeit im Büro
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_18 = listeningPaper("practice-listening-18",
  "Hörverstehen — Podcast: Nachhaltigkeit im Büroalltag", "Podcast: Nachhaltigkeit im Büroalltag",
  [
    { voice: "ingrid", speaker: "Podcasterin", text: "Viele Unternehmen setzen inzwischen auf Mülltrennung und weniger Papierverbrauch, um nachhaltiger zu werden. Eine aktuelle Studie zeigt allerdings, dass der größte Hebel woanders liegt: bei der Energie fürs Heizen und Kühlen von Büroflächen, die für rund sechzig Prozent des gesamten Energieverbrauchs eines typischen Bürogebäudes verantwortlich ist. Papier und Müll machen dagegen zusammen nur etwa fünf Prozent aus. Das heißt nicht, dass Mülltrennung sinnlos ist — aber Unternehmen, die wirklich etwas bewirken wollen, sollten zuerst in bessere Isolierung und effizientere Heizsysteme investieren, bevor sie sich auf kleinere, sichtbarere Maßnahmen konzentrieren." },
  ],
  [
    mcq({ stem: "Was ist laut der Studie der größte Faktor beim Energieverbrauch eines Bürogebäudes?", options: ["Heizen und Kühlen der Büroflächen.", "Papierverbrauch.", "Mülltrennung."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"bei der Energie fürs Heizen und Kühlen … die für rund sechzig Prozent des gesamten Energieverbrauchs … verantwortlich ist.\"" }),
    trueFalse({ stem: "Papier und Müll machen laut Studie den größten Anteil am Energieverbrauch aus.", answer: false, capability: "understand_speech", difficulty: "A", rationale: "\"Papier und Müll machen dagegen zusammen nur etwa fünf Prozent aus.\"" }),
    mcq({ stem: "Was empfiehlt die Podcasterin Unternehmen, die wirklich etwas bewirken wollen?", options: ["Zuerst in bessere Isolierung und Heizsysteme investieren.", "Nur noch auf Mülltrennung setzen.", "Komplett auf Heizung verzichten."], answer: 0, capability: "understand_speech", difficulty: "C", rationale: "\"sollten zuerst in bessere Isolierung und effizientere Heizsysteme investieren, bevor sie sich auf kleinere … Maßnahmen konzentrieren.\"" }),
  ], { minutes: 7, audioId: "practice_listening_18_nachhaltigkeit" });

/* ══════════════════════════════════════════════════════════════════════
   19 — VOICEMAIL — Absage einer Wohnungsbesichtigung
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_19 = listeningPaper("practice-listening-19",
  "Hörverstehen — Anrufbeantworter: Wohnungsbesichtigung absagen", "Anrufbeantworter: Wohnungsbesichtigung absagen",
  [
    { voice: "mia", speaker: "Anruferin", text: "Guten Tag, hier ist Frau Sailer. Ich rufe wegen des Besichtigungstermins für die Wohnung in der Gartenstraße an, der für morgen um siebzehn Uhr geplant war. Leider muss ich kurzfristig absagen, weil bei mir auf der Arbeit ein dringender Termin dazwischengekommen ist. Wäre es möglich, stattdessen am Freitag zu einem beliebigen Zeitpunkt am Vormittag vorbeizukommen? Ich bin sehr an der Wohnung interessiert und wollte den Termin deshalb nicht einfach verfallen lassen. Bitte rufen Sie mich zurück, um einen neuen Termin zu vereinbaren. Vielen Dank." },
  ],
  [
    mcq({ stem: "Warum ruft Frau Sailer an?", options: ["Um den Besichtigungstermin für morgen abzusagen.", "Um die Wohnung sofort zu mieten.", "Um sich über die Wohnung zu beschweren."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"der für morgen um siebzehn Uhr geplant war. Leider muss ich kurzfristig absagen.\"" }),
    mcq({ stem: "Warum kann Frau Sailer den Termin nicht wahrnehmen?", options: ["Wegen eines dringenden Termins auf der Arbeit.", "Weil sie krank ist.", "Weil sie kein Interesse mehr an der Wohnung hat."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"weil bei mir auf der Arbeit ein dringender Termin dazwischengekommen ist.\"" }),
    mcq({ stem: "Was schlägt Frau Sailer als Alternative vor?", options: ["Freitagvormittag, zu einem beliebigen Zeitpunkt.", "Denselben Tag, nur später am Abend.", "Erst in zwei Wochen."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"stattdessen am Freitag zu einem beliebigen Zeitpunkt am Vormittag vorbeizukommen.\"" }),
  ], { minutes: 6, audioId: "practice_listening_19_besichtigung_absage" });

/* ══════════════════════════════════════════════════════════════════════
   20 — ANNOUNCEMENT — Supermarkt: Rückruf eines Produkts
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_20 = listeningPaper("practice-listening-20",
  "Hörverstehen — Durchsage im Supermarkt: Produktrückruf", "Durchsage im Supermarkt: Produktrückruf",
  [
    { voice: "katja", speaker: "Durchsage", text: "Liebe Kundinnen und Kunden, wir informieren Sie über einen Rückruf: Die Hackfleischpackungen der Marke Frischland mit dem Mindesthaltbarkeitsdatum bis zum zwölften dieses Monats können in Einzelfällen Metallsplitter enthalten. Falls Sie ein betroffenes Produkt gekauft haben, bringen Sie es bitte nicht zum Verzehr, sondern zur Kundeninformation zurück. Sie erhalten dort den vollen Kaufpreis erstattet, auch ohne Kassenbon. Wir bitten, diesen Hinweis ernst zu nehmen und entschuldigen uns für die Unannehmlichkeiten." },
  ],
  [
    mcq({ stem: "Welches Produkt ist von dem Rückruf betroffen?", options: ["Hackfleischpackungen der Marke Frischland.", "Alle Fleischprodukte des Marktes.", "Tiefkühlgemüse."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"Die Hackfleischpackungen der Marke Frischland … können … Metallsplitter enthalten.\"" }),
    trueFalse({ stem: "Kunden benötigen den Kassenbon, um das Geld zurückzuerhalten.", answer: false, capability: "understand_speech", difficulty: "B", rationale: "\"Sie erhalten dort den vollen Kaufpreis erstattet, auch ohne Kassenbon.\"" }),
    mcq({ stem: "Was sollen Kunden mit dem betroffenen Produkt tun?", options: ["Es zur Kundeninformation zurückbringen, nicht essen.", "Es einfach zu Hause entsorgen.", "Es umtauschen gegen ein anderes Produkt derselben Marke."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"bringen Sie es bitte nicht zum Verzehr, sondern zur Kundeninformation zurück.\"" }),
  ], { minutes: 5, audioId: "practice_listening_20_produktrueckruf" });

/* ══════════════════════════════════════════════════════════════════════
   21 — PHONE CONVERSATION — Kundenservice wegen einer Rechnung
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_21 = listeningPaper("practice-listening-21",
  "Hörverstehen — Anruf beim Kundenservice wegen einer Rechnung", "Anruf beim Kundenservice wegen einer Rechnung",
  [
    { voice: "jan", speaker: "Kunde", text: "Guten Tag, ich habe eine Rechnung über achtzig Euro erhalten, aber laut meinem Vertrag sollte der monatliche Betrag nur fünfundvierzig Euro sein." },
    { voice: "katja", speaker: "Kundenservice", text: "Lassen Sie mich kurz nachsehen … Ich sehe hier, dass zusätzlich eine einmalige Gebühr für ein Zusatzpaket berechnet wurde, das vor drei Wochen aktiviert wurde." },
    { voice: "jan", speaker: "Kunde", text: "Das habe ich nie bestellt." },
    { voice: "katja", speaker: "Kundenservice", text: "Ich verstehe Ihre Verwunderung. Ich kann das Paket rückwirkend deaktivieren und die zusätzliche Gebühr von fünfunddreißig Euro stornieren. Die korrigierte Rechnung würde dann bei den vertraglich vereinbarten fünfundvierzig Euro liegen." },
    { voice: "jan", speaker: "Kunde", text: "Das wäre sehr freundlich, vielen Dank." },
  ],
  [
    mcq({ stem: "Worüber beschwert sich der Kunde?", options: ["Eine Rechnung, die höher ist als vertraglich vereinbart.", "Eine fehlende Rechnung.", "Eine doppelte Zahlung."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"ich habe eine Rechnung über achtzig Euro erhalten, aber laut meinem Vertrag sollte der monatliche Betrag nur fünfundvierzig Euro sein.\"" }),
    mcq({ stem: "Was ist laut Kundenservice der Grund für die höhere Rechnung?", options: ["Eine Gebühr für ein zusätzlich aktiviertes Paket.", "Ein Rechenfehler des Systems.", "Eine allgemeine Preiserhöhung."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"eine einmalige Gebühr für ein Zusatzpaket berechnet wurde, das vor drei Wochen aktiviert wurde.\"" }),
    mcq({ stem: "Wie löst der Kundenservice das Problem?", options: ["Das Paket wird deaktiviert und die Gebühr storniert.", "Der Kunde muss die volle Summe trotzdem zahlen.", "Der Vertrag wird komplett gekündigt."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"Ich kann das Paket rückwirkend deaktivieren und die zusätzliche Gebühr … stornieren.\"" }),
  ], { minutes: 7, audioId: "practice_listening_21_kundenservice" });

/* ══════════════════════════════════════════════════════════════════════
   22 — PLANNING DISCUSSION — Teamfeier planen
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_22 = listeningPaper("practice-listening-22",
  "Hörverstehen — Planung einer Teamfeier", "Planung einer Teamfeier",
  [
    { voice: "mia", speaker: "Kollegin 1", text: "Sollen wir die Teamfeier draußen im Park machen oder doch lieber in einem Restaurant?" },
    { voice: "conrad", speaker: "Kollege 2", text: "Draußen hat den Charme, aber wenn es regnet, haben wir ein Problem. Ein Restaurant wäre sicherer." },
    { voice: "mia", speaker: "Kollegin 1", text: "Stimmt, das Wetterrisiko hatte ich nicht bedacht. Lass uns ein Restaurant mit einem großen, ruhigen Raum suchen." },
    { voice: "conrad", speaker: "Kollege 2", text: "Ich kenne eines, das italienische Küche anbietet und einen separaten Raum für Gruppen hat. Ich frage dort nach Verfügbarkeit für den zwanzigsten." },
    { voice: "mia", speaker: "Kollegin 1", text: "Perfekt, dann kümmere ich mich parallel um die Einladungen an das Team." },
  ],
  [
    mcq({ stem: "Was war der erste Vorschlag von Kollegin 1?", options: ["Die Feier draußen im Park.", "Die Feier in einem Restaurant.", "Die Feier im Büro selbst."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"Sollen wir die Teamfeier draußen im Park machen …\"" }),
    mcq({ stem: "Warum spricht Kollege 2 gegen die Feier im Park?", options: ["Wegen des Risikos schlechten Wetters.", "Weil der Park zu weit entfernt ist.", "Weil er lieber italienisch essen möchte."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"wenn es regnet, haben wir ein Problem. Ein Restaurant wäre sicherer.\"" }),
    trueFalse({ stem: "Kollegin 1 lehnt das Argument von Kollege 2 zum Wetterrisiko ab.", answer: false, capability: "concede", difficulty: "B", rationale: "\"Stimmt, das Wetterrisiko hatte ich nicht bedacht.\" — sie stimmt zu, nicht ab." }),
    mcq({ stem: "Wer übernimmt am Ende welche Aufgabe?", options: ["Kollege 2 fragt beim Restaurant an, Kollegin 1 kümmert sich um Einladungen.", "Beide kümmern sich gemeinsam nur um die Einladungen.", "Kollegin 1 bucht das Restaurant allein."], answer: 0, capability: "understand_speech", difficulty: "C", rationale: "\"Ich frage dort nach Verfügbarkeit … dann kümmere ich mich parallel um die Einladungen.\"" }),
  ], { minutes: 8, audioId: "practice_listening_22_teamfeier" });

/* ══════════════════════════════════════════════════════════════════════
   23 — DISAGREEMENT (workplace) — Vorgehen bei einem Projekt
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_23 = listeningPaper("practice-listening-23",
  "Hörverstehen — Kollegen uneinig über das Vorgehen bei einem Projekt", "Kollegen uneinig über das Vorgehen bei einem Projekt",
  [
    { voice: "klaus", speaker: "Kollege 1", text: "Ich würde vorschlagen, dass wir das Projekt in kleinen wöchentlichen Etappen abarbeiten, damit wir früh Feedback vom Kunden bekommen." },
    { voice: "jan", speaker: "Kollege 2", text: "Das klingt zwar gut in der Theorie, aber bei diesem Kunden dauert jede Rückmeldung erfahrungsgemäß über eine Woche. Dann warten wir ständig." },
    { voice: "klaus", speaker: "Kollege 1", text: "Ein fairer Einwand. Vielleicht könnten wir trotzdem in Etappen arbeiten, aber nicht auf jede Rückmeldung warten, sondern parallel weiterarbeiten und später anpassen." },
    { voice: "jan", speaker: "Kollege 2", text: "Das wäre ein Kompromiss, mit dem ich leben könnte — solange wir am Ende noch genug Zeit für Anpassungen einplanen." },
  ],
  [
    mcq({ stem: "Was schlägt Kollege 1 zuerst vor?", options: ["Das Projekt in kleinen wöchentlichen Etappen mit frühem Kundenfeedback abarbeiten.", "Das ganze Projekt auf einmal abzuschließen.", "Das Projekt an eine andere Firma abzugeben."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"dass wir das Projekt in kleinen wöchentlichen Etappen abarbeiten, damit wir früh Feedback vom Kunden bekommen.\"" }),
    mcq({ stem: "Warum ist Kollege 2 zunächst skeptisch?", options: ["Weil Rückmeldungen dieses Kunden erfahrungsgemäß lange dauern.", "Weil er das Projekt für unnötig hält.", "Weil ihm die Etappen zu klein sind."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"bei diesem Kunden dauert jede Rückmeldung erfahrungsgemäß über eine Woche. Dann warten wir ständig.\"" }),
    mcq({ stem: "Auf welchen Kompromiss einigen sich die beiden?", options: ["In Etappen arbeiten, aber parallel weiterarbeiten statt auf jede Rückmeldung zu warten.", "Komplett auf das Kundenfeedback zu verzichten.", "Das Projekt zu verschieben, bis der Kunde schneller antwortet."], answer: 0, capability: "compare", difficulty: "C", rationale: "\"in Etappen arbeiten, aber nicht auf jede Rückmeldung warten, sondern parallel weiterarbeiten und später anpassen.\"" }),
  ], { minutes: 8, audioId: "practice_listening_23_projektvorgehen" });

/* ══════════════════════════════════════════════════════════════════════
   24 — ADVICE CONVERSATION — Rat zur Berufswahl
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_24 = listeningPaper("practice-listening-24",
  "Hörverstehen — Rat zur Berufswahl unter Freunden", "Rat zur Berufswahl unter Freunden",
  [
    { voice: "mia", speaker: "Freundin", text: "Ich weiß einfach nicht, ob ich das Angebot der großen Firma annehmen soll oder bei dem kleinen Start-up bleiben soll, wo ich jetzt arbeite." },
    { voice: "ingrid", speaker: "Freundin (Rat)", text: "Was reizt dich denn an der großen Firma am meisten?" },
    { voice: "mia", speaker: "Freundin", text: "Vor allem die Sicherheit und das deutlich höhere Gehalt." },
    { voice: "ingrid", speaker: "Freundin (Rat)", text: "Verständlich. Aber du hast mir letzten Monat noch erzählt, wie sehr du die Eigenverantwortung im Start-up schätzt. Würdest du die beim Wechsel vermissen?" },
    { voice: "mia", speaker: "Freundin", text: "Wahrscheinlich schon, ja. Das hatte ich beim Nachdenken über das Gehalt fast vergessen." },
    { voice: "ingrid", speaker: "Freundin (Rat)", text: "Vielleicht wäre es hilfreich, für beide Optionen aufzuschreiben, was du in einem Jahr rückblickend am meisten bereuen würdest — das zeigt oft mehr als eine reine Pro-Contra-Liste." },
  ],
  [
    mcq({ stem: "Worüber ist die Freundin unsicher?", options: ["Ob sie zu einer großen Firma wechseln oder im Start-up bleiben soll.", "Ob sie überhaupt arbeiten möchte.", "Ob sie umziehen soll."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"ob ich das Angebot der großen Firma annehmen soll oder bei dem kleinen Start-up bleiben soll.\"" }),
    mcq({ stem: "Was reizt sie am meisten am Angebot der großen Firma?", options: ["Sicherheit und ein höheres Gehalt.", "Flexiblere Arbeitszeiten.", "Ein internationales Team."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"Vor allem die Sicherheit und das deutlich höhere Gehalt.\"" }),
    mcq({ stem: "Woran erinnert die Ratgeberin sie?", options: ["An die Eigenverantwortung, die sie im Start-up schätzt.", "An die schlechte Bezahlung im Start-up.", "An einen früheren Streit mit dem Chef."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"du hast mir letzten Monat noch erzählt, wie sehr du die Eigenverantwortung im Start-up schätzt.\"" }),
    mcq({ stem: "Welche konkrete Methode schlägt die Ratgeberin am Ende vor?", options: ["Aufschreiben, was man in einem Jahr am meisten bereuen würde.", "Eine Münze werfen.", "Beide Angebote gleichzeitig annehmen."], answer: 0, capability: "speculate", difficulty: "C", rationale: "\"für beide Optionen aufzuschreiben, was du in einem Jahr rückblickend am meisten bereuen würdest.\"" }),
  ], { minutes: 9, audioId: "practice_listening_24_berufswahl" });

/* ══════════════════════════════════════════════════════════════════════
   25 — SERVICE INTERACTION — Beim Arzt: Terminvereinbarung
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_25 = listeningPaper("practice-listening-25",
  "Hörverstehen — Beim Arzt: Terminvereinbarung", "Beim Arzt: Terminvereinbarung",
  [
    { voice: "katja", speaker: "Praxis", text: "Praxis Dr. Hollmann, guten Tag." },
    { voice: "jan", speaker: "Patient", text: "Guten Tag, ich bräuchte einen Termin zur Nachkontrolle nach meiner Operation vor drei Wochen. Ich habe leicht anhaltende Schmerzen, die ich abklären lassen möchte." },
    { voice: "katja", speaker: "Praxis", text: "Das klingt, als sollten wir Sie zeitnah sehen. Ich hätte übermorgen um neun Uhr dreißig einen Termin frei, oder falls das zu spät ist, könnte ich versuchen, Sie heute noch als Notfall dazwischenzuschieben." },
    { voice: "jan", speaker: "Patient", text: "Die Schmerzen sind nicht akut, übermorgen reicht mir völlig." },
    { voice: "katja", speaker: "Praxis", text: "Gut, dann trage ich Sie für übermorgen, neun Uhr dreißig, ein. Bitte bringen Sie Ihre Entlassungsunterlagen aus dem Krankenhaus mit." },
  ],
  [
    mcq({ stem: "Warum ruft der Patient in der Praxis an?", options: ["Er braucht eine Nachkontrolle wegen anhaltender Schmerzen nach einer Operation.", "Er möchte einen Termin absagen.", "Er benötigt ein Attest für die Arbeit."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"ich bräuchte einen Termin zur Nachkontrolle nach meiner Operation … Ich habe leicht anhaltende Schmerzen.\"" }),
    mcq({ stem: "Welche zwei Optionen bietet die Praxis an?", options: ["Übermorgen um 9:30 Uhr oder noch heute als Notfall.", "Nur einen Termin in zwei Wochen.", "Nur eine telefonische Beratung."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"Ich hätte übermorgen um neun Uhr dreißig … oder … heute noch als Notfall.\"" }),
    trueFalse({ stem: "Der Patient entscheidet sich für den Notfalltermin noch heute.", answer: false, capability: "understand_speech", difficulty: "B", rationale: "\"Die Schmerzen sind nicht akut, übermorgen reicht mir völlig.\"" }),
    mcq({ stem: "Was soll der Patient zum Termin mitbringen?", options: ["Seine Entlassungsunterlagen aus dem Krankenhaus.", "Eine Überweisung vom Hausarzt.", "Ein aktuelles Blutbild."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"Bitte bringen Sie Ihre Entlassungsunterlagen aus dem Krankenhaus mit.\"" }),
  ], { minutes: 7, audioId: "practice_listening_25_arzttermin" });

/* ══════════════════════════════════════════════════════════════════════
   26 — PROFESSIONAL CONVERSATION (nursing) — Medikamentenplan besprechen
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_26 = listeningPaper("practice-listening-26",
  "Hörverstehen — Pflegekräfte besprechen einen Medikamentenplan", "Pflegekräfte besprechen einen Medikamentenplan",
  [
    { voice: "ingrid", speaker: "Pflegekraft 1", text: "Bei Herrn Fischer wurde die Dosis des Blutdruckmedikaments heute vom Arzt angepasst — statt zehn Milligramm morgens sind es jetzt fünf Milligramm morgens und fünf Milligramm abends." },
    { voice: "conrad", speaker: "Pflegekraft 2", text: "Aufgeteilt auf zwei Gaben also, nicht mehr eine große Morgendosis?" },
    { voice: "ingrid", speaker: "Pflegekraft 1", text: "Genau, der Arzt wollte damit die Blutdruckschwankungen über den Tag reduzieren, die zuletzt aufgefallen waren." },
    { voice: "conrad", speaker: "Pflegekraft 2", text: "Verstanden, ich trage die Änderung sofort in die Dokumentation ein, damit die Nachtschicht nicht versehentlich noch die alte Dosis gibt." },
  ],
  [
    mcq({ stem: "Was wurde bei Herrn Fischer geändert?", options: ["Die Dosis wurde auf zwei kleinere Gaben pro Tag aufgeteilt.", "Das Medikament wurde komplett abgesetzt.", "Die Dosis wurde verdoppelt."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"statt zehn Milligramm morgens sind es jetzt fünf Milligramm morgens und fünf Milligramm abends.\"" }),
    mcq({ stem: "Warum wurde die Änderung vorgenommen?", options: ["Um Blutdruckschwankungen über den Tag zu reduzieren.", "Weil das alte Medikament nicht mehr verfügbar war.", "Auf Wunsch des Patienten."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"wollte damit die Blutdruckschwankungen über den Tag reduzieren.\"" }),
    mcq({ stem: "Was macht Pflegekraft 2 im Anschluss an das Gespräch?", options: ["Die Änderung sofort dokumentieren, damit die Nachtschicht informiert ist.", "Den Arzt noch einmal anrufen.", "Nichts, da die Änderung erst morgen gilt."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"ich trage die Änderung sofort in die Dokumentation ein, damit die Nachtschicht nicht versehentlich noch die alte Dosis gibt.\"" }),
    mcq({ stem: "Wie fragt Pflegekraft 2 zur Bestätigung nach?", options: ["Ob die Dosis jetzt auf zwei Gaben aufgeteilt ist.", "Ob das Medikament überhaupt notwendig ist.", "Ob der Patient das Medikament verweigert hat."], answer: 0, capability: "ask_followup", difficulty: "B", rationale: "\"Aufgeteilt auf zwei Gaben also, nicht mehr eine große Morgendosis?\"" }),
  ], { minutes: 8, audioId: "practice_listening_26_medikamentenplan" });

/* ══════════════════════════════════════════════════════════════════════
   27 — OPINION EXCHANGE — Neue Kantine
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_27 = listeningPaper("practice-listening-27",
  "Hörverstehen — Meinungsaustausch: Die neue Kantine", "Meinungsaustausch: Die neue Kantine",
  [
    { voice: "katja", speaker: "Kollegin 1", text: "Findest du die neue Kantine auch so viel besser als die alte?" },
    { voice: "mia", speaker: "Kollegin 2", text: "Das Essen ist auf jeden Fall vielfältiger, das stimmt. Aber die Preise sind auch spürbar gestiegen, findest du nicht?" },
    { voice: "katja", speaker: "Kollegin 1", text: "Stimmt, das ist mir auch aufgefallen. Trotzdem, für die bessere Qualität bin ich bereit, etwas mehr zu zahlen." },
    { voice: "mia", speaker: "Kollegin 2", text: "Das kann ich nachvollziehen. Mich stört eigentlich mehr, dass es jetzt so lange Warteschlangen gibt, seit alle wegen des besseren Essens dort essen wollen." },
  ],
  [
    mcq({ stem: "Worin sind sich die beiden Kolleginnen zu Beginn einig?", options: ["Dass das Essen in der neuen Kantine vielfältiger ist.", "Dass die neue Kantine schlechter ist als die alte.", "Dass die Preise gesunken sind."], answer: 0, capability: "concede", difficulty: "B", rationale: "\"Das Essen ist auf jeden Fall vielfältiger, das stimmt.\"" }),
    mcq({ stem: "Was kritisiert Kollegin 2 zusätzlich?", options: ["Gestiegene Preise.", "Zu wenig Auswahl.", "Schlechte Hygiene."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"die Preise sind auch spürbar gestiegen, findest du nicht?\"" }),
    mcq({ stem: "Was stört Kollegin 2 am Ende mehr als die Preise?", options: ["Die langen Warteschlangen.", "Die Lautstärke in der Kantine.", "Die Öffnungszeiten."], answer: 0, capability: "understand_speech", difficulty: "C", rationale: "\"Mich stört eigentlich mehr, dass es jetzt so lange Warteschlangen gibt.\"" }),
  ], { minutes: 6, audioId: "practice_listening_27_kantine" });

/* ══════════════════════════════════════════════════════════════════════
   28 — INFORMAL DISCUSSION — Nachbarn über Lärmbelästigung
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_28 = listeningPaper("practice-listening-28",
  "Hörverstehen — Nachbarn reden über Lärmbelästigung", "Nachbarn reden über Lärmbelästigung",
  [
    { voice: "jan", speaker: "Nachbar 1", rate: "-12%", text: "Ich wollte kurz mit dir reden — die Musik aus deiner Wohnung war die letzten Abende ziemlich laut, auch noch nach zweiundzwanzig Uhr." },
    { voice: "klaus", speaker: "Nachbar 2", rate: "-12%", text: "Oh, das tut mir leid, das war mir gar nicht so bewusst. Ich hatte Besuch und wir haben die Zeit wohl unterschätzt." },
    { voice: "jan", speaker: "Nachbar 1", rate: "-12%", text: "Kein Problem, so etwas passiert. Wäre es okay, wenn du einfach kurz Bescheid gibst, wenn mal wieder länger Besuch da ist? Dann kann ich mich darauf einstellen." },
    { voice: "klaus", speaker: "Nachbar 2", rate: "-12%", text: "Klar, mache ich gerne. Und für heute Abend drehe ich auf jeden Fall früher runter." },
  ],
  [
    mcq({ stem: "Worüber beschwert sich Nachbar 1?", options: ["Laute Musik nach 22 Uhr an mehreren Abenden.", "Zigarettenrauch im Treppenhaus.", "Ein falsch geparktes Auto."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"die Musik aus deiner Wohnung war die letzten Abende ziemlich laut, auch noch nach zweiundzwanzig Uhr.\"" }),
    mcq({ stem: "Wie erklärt Nachbar 2 die Situation?", options: ["Er hatte Besuch und die Zeit unterschätzt.", "Er wusste nichts von der Lärmbeschwerde.", "Er hat absichtlich laut Musik gehört."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"Ich hatte Besuch und wir haben die Zeit wohl unterschätzt.\"" }),
    mcq({ stem: "Worauf einigen sich die beiden Nachbarn?", options: ["Nachbar 2 gibt künftig Bescheid, wenn länger Besuch da ist.", "Nachbar 2 zieht aus.", "Sie schalten die Hausverwaltung ein."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"Wäre es okay, wenn du einfach kurz Bescheid gibst … Klar, mache ich gerne.\"" }),
  ], { minutes: 6, audioId: "practice_listening_28_laermbelaestigung" });

/* ══════════════════════════════════════════════════════════════════════
   29 — SHORT PRESENTATION — Ergebnisse eines Pilotprojekts
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_29 = listeningPaper("practice-listening-29",
  "Hörverstehen — Kurzvortrag: Ergebnisse eines Pilotprojekts", "Kurzvortrag: Ergebnisse eines Pilotprojekts",
  [
    { voice: "ingrid", speaker: "Projektleiterin", text: "Ich fasse kurz die Ergebnisse unseres dreimonatigen Pilotprojekts zusammen. Ziel war es, durch eine vereinfachte Freigabe-App die Bearbeitungszeit von Anträgen zu verkürzen. Das Ergebnis: Die durchschnittliche Bearbeitungszeit sank von neun auf vier Tage, also um mehr als die Hälfte. Gleichzeitig stieg allerdings die Zahl der Rückfragen leicht an, weil die App weniger Kontextinformationen anzeigt als das alte System. Unser Vorschlag ist daher, die App unternehmensweit einzuführen, aber gleichzeitig ein zusätzliches Informationsfeld zu ergänzen, um die Rückfragen wieder zu senken." },
  ],
  [
    mcq({ stem: "Was war das Ziel des Pilotprojekts?", options: ["Die Bearbeitungszeit von Anträgen durch eine neue App zu verkürzen.", "Die Anzahl der Mitarbeitenden zu reduzieren.", "Ein neues Bürogebäude zu planen."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"Ziel war es, durch eine vereinfachte Freigabe-App die Bearbeitungszeit von Anträgen zu verkürzen.\"" }),
    mcq({ stem: "Wie veränderte sich die durchschnittliche Bearbeitungszeit?", options: ["Sie sank von neun auf vier Tage.", "Sie stieg von vier auf neun Tage.", "Sie blieb unverändert bei neun Tagen."], answer: 0, capability: "understand_speech", difficulty: "B", rationale: "\"Die durchschnittliche Bearbeitungszeit sank von neun auf vier Tage.\"" }),
    mcq({ stem: "Welcher negative Nebeneffekt trat auf?", options: ["Mehr Rückfragen, weil die App weniger Kontextinformationen zeigt.", "Die App stürzte häufig ab.", "Die Kosten stiegen stark an."], answer: 0, capability: "understand_speech", difficulty: "C", rationale: "\"stieg allerdings die Zahl der Rückfragen leicht an, weil die App weniger Kontextinformationen anzeigt.\"" }),
    mcq({ stem: "Was schlägt die Projektleiterin als nächsten Schritt vor?", options: ["Die App einführen und ein zusätzliches Informationsfeld ergänzen.", "Das Projekt komplett stoppen.", "Zur alten Methode zurückkehren."], answer: 0, capability: "speculate", difficulty: "C", rationale: "\"die App unternehmensweit einzuführen, aber gleichzeitig ein zusätzliches Informationsfeld zu ergänzen.\"" }),
  ], { minutes: 8, audioId: "practice_listening_29_pilotprojekt" });

/* ══════════════════════════════════════════════════════════════════════
   30 — WORKPLACE DISCUSSION (nursing) — Schichtwechsel: unerwartete Info
   ══════════════════════════════════════════════════════════════════════ */
const LISTENING_30 = listeningPaper("practice-listening-30",
  "Hörverstehen — Schichtwechsel: eine unerwartete Information", "Schichtwechsel: eine unerwartete Information",
  [
    { voice: "conrad", speaker: "Spätschicht", text: "Bevor du gehst — kurz noch: Frau Neumann aus Zimmer sieben wird heute Abend doch nicht entlassen, wie ursprünglich geplant." },
    { voice: "katja", speaker: "Frühschicht", text: "Wirklich? Heute Morgen hieß es noch, alles sei für die Entlassung um sechzehn Uhr vorbereitet." },
    { voice: "conrad", speaker: "Spätschicht", text: "Das stimmt, aber die Laborwerte vom Nachmittag zeigten einen auffälligen Wert, den der Arzt erst abklären möchte. Die Entlassung ist jetzt frühestens für morgen früh vorgesehen." },
    { voice: "katja", speaker: "Frühschicht", text: "Gut, dass du das sagst, sonst hätte ich das Zimmer schon für den neuen Patienten vorbereitet. Ich sage das gleich an der Aufnahme Bescheid." },
  ],
  [
    mcq({ stem: "Was war ursprünglich für Frau Neumann geplant?", options: ["Eine Entlassung um 16 Uhr am selben Tag.", "Eine Verlegung auf eine andere Station.", "Eine Operation am nächsten Tag."], answer: 0, capability: "understand_speech", difficulty: "A", rationale: "\"alles sei für die Entlassung um sechzehn Uhr vorbereitet.\"" }),
    mcq({ stem: "Warum wurde der Plan geändert?", options: ["Ein auffälliger Laborwert muss zuerst abgeklärt werden.", "Die Patientin hat selbst um längeren Aufenthalt gebeten.", "Es gab einen Fehler in der Terminplanung."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"die Laborwerte vom Nachmittag zeigten einen auffälligen Wert, den der Arzt erst abklären möchte.\"" }),
    trueFalse({ stem: "Die Entlassung ist jetzt für noch später am selben Abend vorgesehen.", answer: false, capability: "understand_speech", difficulty: "B", rationale: "\"Die Entlassung ist jetzt frühestens für morgen früh vorgesehen\" — nicht mehr am selben Abend." }),
    mcq({ stem: "Was hätte die Frühschicht ohne diese Information möglicherweise falsch gemacht?", options: ["Das Zimmer schon für einen neuen Patienten vorbereitet.", "Der Patientin das falsche Medikament gegeben.", "Die Aufnahme gar nicht informiert."], answer: 0, capability: "understand_speech", difficulty: "C", rationale: "\"sonst hätte ich das Zimmer schon für den neuen Patienten vorbereitet.\"" }),
  ], { minutes: 8, audioId: "practice_listening_30_schichtwechsel" });

const ALL = [
  LISTENING_2, LISTENING_3, LISTENING_4, LISTENING_5, LISTENING_6, LISTENING_7, LISTENING_8,
  LISTENING_9, LISTENING_10, LISTENING_11, LISTENING_12, LISTENING_13, LISTENING_14, LISTENING_15,
  LISTENING_16, LISTENING_17, LISTENING_18, LISTENING_19, LISTENING_20, LISTENING_21, LISTENING_22,
  LISTENING_23, LISTENING_24, LISTENING_25, LISTENING_26, LISTENING_27, LISTENING_28, LISTENING_29,
  LISTENING_30,
];

module.exports = {
  listeningPaper, ALL,
  LISTENING_2, LISTENING_3, LISTENING_4, LISTENING_5, LISTENING_6, LISTENING_7, LISTENING_8,
  LISTENING_9, LISTENING_10, LISTENING_11, LISTENING_12, LISTENING_13, LISTENING_14, LISTENING_15,
  LISTENING_16, LISTENING_17, LISTENING_18, LISTENING_19, LISTENING_20, LISTENING_21, LISTENING_22,
  LISTENING_23, LISTENING_24, LISTENING_25, LISTENING_26, LISTENING_27, LISTENING_28, LISTENING_29,
  LISTENING_30,
};

async function main() {
  console.log(`Seeding ${ALL.length} Listening practice paper(s)…`);
  const { pool } = require("./practice_seed_lib");
  for (const spec of ALL) await seedPaper(spec);
  await pool.end();
  console.log("Done.");
}

if (require.main === module) {
  main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
}
