/**
 * Skillcase practice section in the format of Goethe-Zertifikat B2, Hören Teil 1.
 *
 * FORMAT ONLY. The five conversations are ours; the shape is Goethe's, read out
 * of the Modellsatz (Vs1.5_160426) and the Durchführungsbestimmungen (Stand
 * 1.9.2025). Nothing here is taken from an official paper, and the product must
 * never present it as a Modellsatz.
 *
 * WHAT THE TASK ACTUALLY TESTS, and what each conversation is built around:
 * five unrelated everyday exchanges heard ONCE. The difficulty is not
 * vocabulary — it is that the decisive information passes in a second and is
 * usually a correction, a hesitation or a change of plan. So each text turns on
 * something a keyword search gets wrong:
 *
 *   1  the time changes twice          (the first two are offered and lost)
 *   2  a plan is proposed and dropped  (the agreed plan is the second one)
 *   3  the caller asks for LESS haste  (opposite of the expected request)
 *   4  a refusal that sounds like yes  (register, not content)
 *   5  who decides is reversed         (the assumption in the question is wrong)
 *
 * NO ANSWER LEAKAGE: the key must not echo the text's wording more closely than
 * the distractors do. exam_section.js enforces that, because it is the
 * commonest way a listening item silently becomes a reading item.
 */

const SECTION = {
  id: "gx_hoeren_t1_alltag",
  paperId: "gx_hoeren_t1",
  board: "goethe",
  module: "hoeren",
  teil: 1,
  title: "Fünf kurze Gespräche",
  theme: 3,
  capability: "understand_speech",
};

const V = {
  f1: { speaker: "Frau am Schalter", voice: "katja" },
  m1: { speaker: "Mann",             voice: "conrad" },
  f2: { speaker: "Kollegin",         voice: "mia" },
  m2: { speaker: "Kollege",          voice: "klaus" },
};

const TEXTS = [
  {
    no: 1,
    situation: "Im Bürgeramt. Ein Mann fragt nach einem Termin.",
    turns: [
      { ...V.m1, de: "Guten Tag, ich bräuchte einen Termin für die Ummeldung. Geht das noch diese Woche?" },
      { ...V.f1, de: "Diese Woche sieht es schlecht aus. Ich hätte Donnerstag um Viertel nach elf – nein, Moment, der ist gerade weg. Freitag um zehn wäre frei." },
      { ...V.m1, de: "Freitag um zehn ist schwierig, da bin ich noch im Büro. Ginge auch etwas am Nachmittag?" },
      { ...V.f1, de: "Am Freitag leider nicht, wir schließen um halb eins. Aber nächsten Montag hätte ich um vierzehn Uhr etwas." },
      { ...V.m1, de: "Montag um zwei, das passt. Dann nehme ich den." },
    ],
    items: [
      { type: "rf", stem: "Der Mann bekommt noch in dieser Woche einen Termin.", answer: false,
        because: "Der Donnerstagstermin ist schon weg, und Freitag um zehn passt ihm nicht. Er nimmt am Ende Montag." },
      { type: "mc3", stem: "Wann hat der Mann seinen Termin?",
        options: ["Am Donnerstag um Viertel nach elf.", "Am Freitag um zehn Uhr.", "Am Montag um vierzehn Uhr."],
        answer: 2,
        because: "Beide früheren Zeiten fallen im Gespräch — die eine ist vergeben, die andere passt ihm nicht." },
    ],
  },
  {
    no: 2,
    situation: "Zwei Kolleginnen planen eine Verabschiedung.",
    turns: [
      { ...V.f2, de: "Sag mal, wegen Frau Brandts Abschied – wir hatten doch überlegt, mit allen essen zu gehen." },
      { ...V.m2, de: "Ja, aber am Donnerstag arbeitet die halbe Abteilung im Homeoffice. Da kommen vielleicht sechs Leute." },
      { ...V.f2, de: "Stimmt. Dann lieber etwas im Haus? Wir könnten in der Mittagspause zusammenkommen, Kuchen mitbringen, das schaffen alle." },
      { ...V.m2, de: "Das finde ich besser. Ich kümmere mich um die Getränke, du sagst den anderen Bescheid." },
      { ...V.f2, de: "Mach ich. Und die Karte lege ich morgen früh aus, damit alle unterschreiben können." },
    ],
    items: [
      { type: "rf", stem: "Die Kolleginnen entscheiden sich gegen ein gemeinsames Essen.", answer: true,
        because: "Das Essen war der ursprüngliche Plan; er wird verworfen, weil am Donnerstag zu wenige da wären. Stattdessen: Mittagspause im Haus." },
      { type: "mc3", stem: "Was übernimmt der Kollege?",
        options: ["Er besorgt die Getränke.", "Er informiert die Abteilung.", "Er legt die Karte aus."],
        answer: 0,
        because: "Bescheid sagen und die Karte auslegen übernimmt die Kollegin — beides wird im selben Atemzug verteilt." },
    ],
  },
  {
    no: 3,
    situation: "Eine Nachricht auf dem Anrufbeantworter einer Werkstatt.",
    turns: [
      { ...V.f1, de: "Guten Morgen, hier ist Ostermann. Es geht um meinen Wagen, den ich gestern gebracht habe." },
      { ...V.f1, de: "Sie hatten gesagt, er wäre heute Nachmittag fertig. Ich schaffe es aber erst am Samstag, ihn zu holen – vorher komme ich einfach nicht weg." },
      { ...V.f1, de: "Also, es eilt nicht. Wenn noch etwas dazwischenkommt, ist das kein Problem. Rufen Sie mich bitte nur an, falls es teurer wird als besprochen." },
      { ...V.f1, de: "Meine Nummer haben Sie ja. Vielen Dank und schönen Tag." },
    ],
    items: [
      { type: "rf", stem: "Frau Ostermann bittet darum, die Reparatur zu beschleunigen.", answer: false,
        because: "Umgekehrt: sie sagt ausdrücklich, es eile nicht, weil sie den Wagen ohnehin erst am Samstag abholen kann." },
      { type: "mc3", stem: "In welchem Fall soll die Werkstatt zurückrufen?",
        options: ["Wenn der Wagen früher fertig ist.", "Wenn die Reparatur mehr kostet als vereinbart.", "Wenn sie den Wagen am Samstag nicht abholen kann."],
        answer: 1,
        because: "Sie nennt genau eine Bedingung für einen Anruf, und die betrifft den Preis." },
    ],
  },
  {
    no: 4,
    situation: "Ein Kollege wird um Hilfe gebeten.",
    turns: [
      { ...V.f2, de: "Du, hättest du am Wochenende Zeit, beim Umzug ins neue Büro mitzuhelfen? Wir sind zu wenige." },
      { ...V.m2, de: "Puh. Ich würde ja gern, ehrlich. Ich habe nur am Samstag meine Eltern hier und am Sonntag komme ich erst spät zurück." },
      { ...V.f2, de: "Auch nicht kurz am Sonntagabend?" },
      { ...V.m2, de: "Da wird es wirklich knapp. Ich sage es mal so: Fest zusagen kann ich nicht. Wenn ihr am Montag noch Hände braucht, bin ich früh da." },
      { ...V.f2, de: "Gut, dann rechne ich für Montag mit dir." },
    ],
    items: [
      { type: "rf", stem: "Der Kollege sagt für das Wochenende zu.", answer: false,
        because: "Er klingt entgegenkommend, sagt aber deutlich: fest zusagen kann er nicht. Zugesagt hat er nur für Montag." },
      { type: "mc3", stem: "Warum kann er am Wochenende nicht helfen?",
        options: ["Er hält den Umzug für schlecht organisiert.", "Er ist am Wochenende nicht in der Stadt.", "Er hat private Verpflichtungen."],
        answer: 2,
        because: "Besuch von den Eltern und eine späte Rückkehr sind private Gründe. Weg ist er nicht das ganze Wochenende — am Samstag ist er zu Hause." },
    ],
  },
  {
    no: 5,
    situation: "Ein Anruf bei einer Sprachschule.",
    turns: [
      { ...V.m1, de: "Guten Tag, ich wollte fragen, ob ich mich für den Abendkurs noch anmelden kann. Ich habe gehört, Sie machen dafür einen Einstufungstest." },
      { ...V.f1, de: "Anmelden können Sie sich, ja. Den Test machen wir allerdings nicht mehr selbst – den schreiben Sie online, bevor Sie zu uns kommen." },
      { ...V.m1, de: "Ach so. Und den Termin bekomme ich dann von Ihnen?" },
      { ...V.f1, de: "Den Zugang schicken wir Ihnen per Mail, sobald die Anmeldung da ist. Wann Sie den Test machen, entscheiden Sie selbst – nur eben vor Kursbeginn." },
      { ...V.m1, de: "Verstehe. Dann melde ich mich heute noch an." },
    ],
    items: [
      { type: "rf", stem: "Der Mann muss den Test vor Kursbeginn machen.", answer: true,
        because: "„Wann Sie den Test machen, entscheiden Sie selbst – nur eben vor Kursbeginn.“ Die Freiheit gilt für den Zeitpunkt, nicht für die Frist." },
      { type: "mc3", stem: "Wer legt fest, wann der Mann den Test macht?",
        options: ["Die Sprachschule bei der Anmeldung.", "Der Mann selbst, vor Kursbeginn.", "Es gibt einen festen Termin für alle."],
        answer: 1,
        because: "Die Mitarbeiterin sagt: „Wann Sie den Test machen, entscheiden Sie selbst.“ Von der Schule kommt nur der Zugang." },
    ],
  },
];

module.exports = { SECTION, TEXTS, V };
