/**
 * SEED — standalone practice bank: Grammar, Vocabulary, Reading, Writing,
 * Speaking. board='custom', alignment='original' throughout — this is
 * Skillcase's own targeted practice, never framed as Goethe/telc exam
 * simulation (that content lives in seed_exam_papers.js).
 *
 *   node src/seed/seed_practice_bank.js [--force]
 *
 * Reuses the exact same b2_papers/b2_paper_sections/b2_paper_items model and
 * content_model.js validators seed_exam_papers.js already proved out. No new
 * runtime code. review_status stops at AUTO_QA_PASS — no SME has reviewed
 * this content.
 *
 * LISTENING (practice-listening-1) reuses the same Azure Neural TTS pipeline
 * make_core2026b_audio.js already proved out for the diagnostic's Hören
 * section: `audio_required`/`audio_intended_id` are set on the section here,
 * exactly like core-2026b's, and tools/make_practice_audio.js cuts the clip,
 * registers it in b2_audio_assets and attaches it — see that file for the
 * one-command generation step. Until that has actually been run, the row
 * carries `audio_required=true` with no `audio_asset_id`, which is the same
 * honest "not ready yet" state core-2026b's own sections can be in — the
 * paper is still seeded at AUTO_QA_PASS because ExamPaper.jsx's listening
 * context check (`ctx.available`) is what decides whether a learner sees a
 * player or an honest "not recorded yet, skip it" message, the same way
 * Assessment.jsx already does for the diagnostic.
 */
require("../env")();
const { pool, mcq, trueFalse, longText, spokenResponse, seedPaper } = require("./practice_seed_lib");

const FORCE = process.argv.includes("--force");

/* ══════════════════════════════════════════════════════════════════════
   GRAMMAR — 9 sets, 11 items each = 99 + the 1 already at practice-grammar-1
   makes 100+ once summed. Each set names a distinct cluster of B2 points so
   no two items drill the same structure with only nouns swapped.
   ══════════════════════════════════════════════════════════════════════ */

const GRAMMAR_1_ITEMS = [
  mcq({ stem: "Wenn ich mehr Zeit ___, würde ich einen Deutschkurs am Abend machen.",
    options: ["hätte", "habe", "haben würde"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "Konjunktiv II der Bedingung: \"hätte\", nicht der Indikativ \"habe\" oder die doppelte würde-Form." }),
  mcq({ stem: "Die Verordnung ___ gestern von der Ärztin unterschrieben.",
    options: ["wurde", "hat", "ist"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "Vorgangspassiv Präteritum: \"wurde unterschrieben\"." }),
  mcq({ stem: "Das ist die Kollegin, ___ Schicht heute um sechs beginnt.",
    options: ["deren", "die", "der"], answer: 0, capability: "structure", difficulty: "C",
    rationale: "Genitiv-Relativpronomen für Possessiv-Bezug: \"deren Schicht\" = \"ihre Schicht\"." }),
  mcq({ stem: "___ der langen Wartezeit hat sich der Patient nicht beschwert.",
    options: ["Trotz", "Obwohl", "Wegen"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "Präposition + Nomen verlangt \"trotz\"; \"obwohl\" leitet einen Nebensatz ein, kein Nomen." }),
  mcq({ stem: "Sie arbeitet seit drei Jahren als Pflegefachkraft, ___ sie ihre Ausbildung abgeschlossen hat.",
    options: ["nachdem", "bevor", "während"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Nachdem\" markiert die Vorzeitigkeit: erst Ausbildung, danach die Arbeit." }),
  mcq({ stem: "Der Bericht muss ___ werden, bevor die Schicht endet.",
    options: ["fertiggeschrieben", "fertigschreiben", "fertig schreibt"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "Modalverb-Ersatzkonstruktion mit \"muss ... werden\" verlangt das Partizip II: \"fertiggeschrieben\"." }),
  mcq({ stem: "Er hat sich um die Stelle beworben, ___ mehr Verantwortung zu übernehmen.",
    options: ["um", "damit", "für"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "Gleiches Subjekt in Haupt- und Nebensatz → Finalsatz mit \"um…zu\"; \"damit\" braucht ein eigenes, anderes Subjekt." }),
  mcq({ stem: "Die neu ___ Leitlinie gilt ab sofort auf allen Stationen.",
    options: ["eingeführte", "einführende", "eingeführt"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "Partizip II als attributives Adjektiv mit Endung: \"die eingeführte Leitlinie\" (passivisch: die Leitlinie, die eingeführt wurde)." }),
  mcq({ stem: "Die Anzahl der Überstunden hängt stark ___ der Personalsituation ab.",
    options: ["von", "mit", "an"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "Feste Verbindung: \"abhängen von\"." }),
  mcq({ stem: "Die Pflegedienstleitung sagte, sie ___ den Dienstplan bis Freitag fertig.",
    options: ["habe", "hat", "hätte gehabt"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "Indirekte Rede im Konjunktiv I: \"sie habe\"." }),
  mcq({ stem: "___ man die Medikamentenliste prüft, sollte man die Allergien des Patienten kennen.",
    options: ["Bevor", "Nachdem", "Seitdem"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "Reihenfolge: Allergien kennen kommt vor dem Prüfen → \"bevor\"." }),
  mcq({ stem: "Trotz ___ Personalmangels konnte die Station den Dienstplan einhalten.",
    options: ["des", "der", "dem"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Trotz\" + Genitiv, maskulines Nomen \"Personalmangel\" → \"des Personalmangels\"." }),
];

const GRAMMAR_2_ITEMS = [ // Passiv, Zustandspassiv, Futur, Modalverben Vergangenheit
  mcq({ stem: "Die Tür ___ schon geschlossen, als ich ankam.",
    options: ["war", "wurde", "ist"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "Zustandspassiv (Ergebnis, kein Vorgang): \"war geschlossen\", nicht das Vorgangspassiv \"wurde geschlossen\"." }),
  mcq({ stem: "Die neuen Vorschriften ___ ab nächstem Monat angewendet.",
    options: ["werden", "sind", "haben"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "Vorgangspassiv Futur I: \"werden angewendet\" beschreibt einen zukünftigen Vorgang." }),
  mcq({ stem: "Er ___ gestern zum Dienst kommen, hat aber verschlafen.",
    options: ["sollte", "soll", "hat gesollt"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "Modalverb im Präteritum für die Vergangenheit: \"sollte\"." }),
  mcq({ stem: "Bis zum Abend ___ der Bericht fertig geschrieben sein.",
    options: ["wird", "hat", "war"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "Futur I mit Passiv-Infinitiv: \"wird … fertig geschrieben sein\" — die Zukunftsform von \"sein\" mit Partizip." }),
  mcq({ stem: "Die Akte ___ bereits archiviert, als die Anfrage kam.",
    options: ["war", "wurde", "sei"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "Zustandspassiv im Präteritum: der Zustand (schon archiviert) galt bereits vor der Anfrage." }),
  mcq({ stem: "Früher ___ Patientenakten noch handschriftlich geführt.",
    options: ["wurden", "waren", "sind"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "Vorgangspassiv Präteritum: \"wurden geführt\" beschreibt eine wiederholte vergangene Praxis." }),
  mcq({ stem: "Ich ___ die Fortbildung besuchen können, aber der Termin kollidierte mit meiner Schicht.",
    options: ["hätte", "habe", "würde"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "Konjunktiv II der Vergangenheit mit Modalverb: \"hätte … besuchen können\"." }),
  mcq({ stem: "Der Verband ___ täglich gewechselt, solange die Wunde nicht verheilt ist.",
    options: ["muss", "soll haben", "hat gemusst"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "Modalverb im Präsens für eine geltende Regel: \"muss gewechselt werden\" — hier verkürzt auf \"muss … gewechselt\"." }),
  mcq({ stem: "Als ich ankam, ___ das Zimmer schon aufgeräumt.",
    options: ["war", "wurde", "hatte"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "Zustandspassiv: der aufgeräumte Zustand bestand bereits, kein laufender Vorgang mehr." }),
  mcq({ stem: "In Zukunft ___ die Übergabe digital dokumentiert.",
    options: ["wird", "hat", "war"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "Futur I Passiv: \"wird dokumentiert\" + Zeitangabe \"in Zukunft\"." }),
  mcq({ stem: "Er ___ pünktlich kommen wollen, wurde aber im Stau aufgehalten.",
    options: ["hätte", "hat", "würde"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "Konjunktiv II Vergangenheit mit zwei Modalverben (\"kommen wollen\") verlangt \"hätte … wollen\"." }),
];

const GRAMMAR_3_ITEMS = [ // Relativsätze mit Präposition, Pronominaladverbien
  mcq({ stem: "Das ist das Formular, ___ ich mich seit Tagen ärgere.",
    options: ["über das", "das", "worüber"], answer: 0, capability: "structure", difficulty: "C",
    rationale: "Relativsatz mit Präposition + Relativpronomen: \"sich ärgern über\" → \"über das ich mich ärgere\"." }),
  mcq({ stem: "Sie sprach mit dem Arzt, ___ Rat sie vertraute.",
    options: ["dessen", "den", "der"], answer: 0, capability: "structure", difficulty: "C",
    rationale: "Genitiv-Relativpronomen: \"dessen Rat\" = \"seinem Rat\" (der Rat des Arztes)." }),
  mcq({ stem: "Ich weiß nicht, ___ sie sich beschwert hat.",
    options: ["worüber", "über das", "wodrüber"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "Nach Indefinit-/Fragewort steht das Pronominaladverb \"worüber\", nicht \"über das\"." }),
  mcq({ stem: "Das ist der Grund, ___ ich die Schicht tauschen musste.",
    options: ["weshalb", "wovon", "wobei"], answer: 0, capability: "structure", difficulty: "C",
    rationale: "\"Weshalb\" leitet einen Relativsatz ein, der einen Grund näher bestimmt." }),
  mcq({ stem: "Er hat mir alles erklärt, ___ ich mich vorher gefürchtet hatte.",
    options: ["wovor", "vor dem", "wofür"], answer: 0, capability: "structure", difficulty: "C",
    rationale: "\"Sich fürchten vor\" + verallgemeinerndes Bezugswort \"alles\" → Pronominaladverb \"wovor\"." }),
  mcq({ stem: "Das Team, ___ Mitglieder aus fünf Ländern kommen, arbeitet sehr harmonisch.",
    options: ["dessen", "deren", "das"], answer: 0, capability: "structure", difficulty: "C",
    rationale: "Genitiv-Relativpronomen bei neutralem Bezugswort \"das Team\": \"dessen Mitglieder\"." }),
  mcq({ stem: "Die Kollegin, ___ ich am meisten schätze, hat gekündigt.",
    options: ["die", "der", "deren"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Schätzen\" ist ein Akkusativverb: \"die ich schätze\", Relativpronomen im Akkusativ." }),
  mcq({ stem: "Können Sie mir sagen, ___ die Verzögerung liegt?",
    options: ["woran", "an dem", "worauf"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Liegen an\" + Frage nach unbestimmtem Grund → \"woran\"." }),
  mcq({ stem: "Das sind die Patientinnen, ___ Werte wir morgen kontrollieren müssen.",
    options: ["deren", "die", "denen"], answer: 0, capability: "structure", difficulty: "C",
    rationale: "Genitiv-Relativpronomen im Plural: \"deren Werte\" = \"ihre Werte\"." }),
  mcq({ stem: "Ich habe endlich verstanden, ___ das Problem eigentlich beruht.",
    options: ["worauf", "auf das", "wodurch"], answer: 0, capability: "structure", difficulty: "C",
    rationale: "\"Beruhen auf\" + Frage nach Unbestimmtem → Pronominaladverb \"worauf\"." }),
  mcq({ stem: "Das ist die Regel, ___ sich alle im Team halten müssen.",
    options: ["an die", "die", "woran"], answer: 0, capability: "structure", difficulty: "C",
    rationale: "\"Sich halten an\" + konkretes Bezugswort \"die Regel\" → Präposition + Relativpronomen \"an die\", kein Pronominaladverb nötig." }),
];

const GRAMMAR_4_ITEMS = [ // Doppelkonnektoren, je...desto, Konzessiv/Kausal/Konsekutiv
  mcq({ stem: "___ sie mehr Erfahrung sammelt, ___ sicherer wird sie im Umgang mit Notfällen.",
    options: ["Je … desto", "Umso … je", "Desto … je"], answer: 0, capability: "compare", difficulty: "B",
    rationale: "Feste Korrelation \"je + Komparativ … desto + Komparativ\"." }),
  mcq({ stem: "___ er sich gut vorbereitet hatte, ___ war er bei der Prüfung nervös.",
    options: ["Obwohl … dennoch", "Zwar … aber", "Sowohl … als auch"], answer: 1, capability: "concede", difficulty: "B",
    rationale: "\"Zwar … aber\" ist das übliche Konzessiv-Paar; \"obwohl … dennoch\" wiederholt die Konzession doppelt und ist stilistisch falsch." }),
  mcq({ stem: "Sie spricht ___ Deutsch ___ auch fließend Englisch.",
    options: ["sowohl … als auch", "weder … noch", "entweder … oder"], answer: 0, capability: "compare", difficulty: "B",
    rationale: "\"Sowohl … als auch\" verbindet zwei zutreffende Dinge." }),
  mcq({ stem: "Er hat ___ die Fortbildung ___ das Zertifikat beantragt — nur eins von beiden.",
    options: ["entweder … oder", "sowohl … als auch", "weder … noch"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Entweder … oder\" markiert eine Alternative, von der nur eine zutrifft." }),
  mcq({ stem: "Die Station hat ___ genug Personal ___ ausreichend Material für die Nachtschicht.",
    options: ["weder … noch", "sowohl … als auch", "je … desto"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Weder … noch\" verneint beide genannten Dinge gleichzeitig." }),
  mcq({ stem: "Weil die Unterlagen fehlten, ___ konnte die Anmeldung nicht bearbeitet werden.",
    options: ["deshalb", "obwohl", "damit"], answer: 0, capability: "justify", difficulty: "B",
    rationale: "Konsekutiv-Konnektor \"deshalb\" leitet die Folge einer bereits genannten Ursache ein." }),
  mcq({ stem: "___ der Regen goss, fand die Schulung im Freien statt.",
    options: ["Obwohl", "Weil", "Sodass"], answer: 0, capability: "concede", difficulty: "B",
    rationale: "\"Obwohl\" markiert den unerwarteten Gegensatz: Regen, aber trotzdem draußen." }),
  mcq({ stem: "Sie hat so lange erklärt, ___ auch der letzte Zweifel verschwunden war.",
    options: ["bis", "sodass", "damit"], answer: 1, capability: "justify", difficulty: "C",
    rationale: "\"Sodass\" leitet die Folge (Konsequenz) einer Handlung ein: erklären → Zweifel verschwinden." }),
  mcq({ stem: "___ das Wetter schlecht ist, ___ wollen wir die Exkursion nicht verschieben.",
    options: ["Auch wenn … so", "Je … desto", "Sowohl … als auch"], answer: 0, capability: "concede", difficulty: "C",
    rationale: "\"Auch wenn … so\" ist eine konzessive Konstruktion: trotz eines Umstands bleibt die Entscheidung bestehen." }),
  mcq({ stem: "Die Maßnahme wurde eingeführt, ___ die Fehlerquote zu senken.",
    options: ["um", "damit", "sodass"], answer: 0, capability: "justify", difficulty: "B",
    rationale: "Gleiches Subjekt (die Maßnahme selbst „senkt” nichts, aber der Zweck bezieht sich auf denselben Träger) → Infinitivkonstruktion \"um … zu\" ist hier idiomatisch für einen Zweck." }),
  mcq({ stem: "___ mehr Kolleginnen krank werden, ___ enger wird der Dienstplan.",
    options: ["Je … desto", "Zwar … aber", "Entweder … oder"], answer: 0, capability: "compare", difficulty: "B",
    rationale: "\"Je + Komparativ … desto + Komparativ\" für proportionale Zusammenhänge." }),
];

const GRAMMAR_5_ITEMS = [ // Konjunktiv II erweitert: Wunsch, höfliche Bitte, hypothetische Vergangenheit, als ob
  mcq({ stem: "___ ich doch nur früher davon gewusst!",
    options: ["Hätte", "Habe", "Werde"], answer: 0, capability: "speculate", difficulty: "B",
    rationale: "Wunschsatz in der Vergangenheit mit Konjunktiv II: \"Hätte ich doch nur …\"." }),
  mcq({ stem: "___ Sie so freundlich, mir kurz zu helfen?",
    options: ["Wären", "Sind", "Werden"], answer: 0, capability: "adapt_register", difficulty: "B",
    rationale: "Höfliche Frage im Konjunktiv II: \"Wären Sie so freundlich …\"." }),
  mcq({ stem: "Er tut so, ___ er die ganze Sache nicht kennen würde.",
    options: ["als ob", "obwohl", "während"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Als ob\" leitet einen irrealen Vergleich ein und verlangt Konjunktiv II." }),
  mcq({ stem: "Wenn sie das gewusst ___, hätte sie anders reagiert.",
    options: ["hätte", "hat", "habe"], answer: 0, capability: "speculate", difficulty: "B",
    rationale: "Konjunktiv II Vergangenheit im wenn-Satz: \"hätte gewusst\"." }),
  mcq({ stem: "An deiner Stelle ___ ich mit der Stationsleitung sprechen.",
    options: ["würde", "werde", "habe"], answer: 0, capability: "speculate", difficulty: "B",
    rationale: "Ratschlag im Konjunktiv II: \"An deiner Stelle würde ich …\"." }),
  mcq({ stem: "___ ich das gewusst hätte, hätte ich anders geplant.",
    options: ["Wenn", "Als", "Ob"], answer: 0, capability: "speculate", difficulty: "B",
    rationale: "Konditionalsatz der Vergangenheit: \"Wenn ich das gewusst hätte, …\"." }),
  mcq({ stem: "Es sieht so aus, ___ das Material bereits bestellt worden wäre.",
    options: ["als ob", "obwohl", "sodass"], answer: 0, capability: "speculate", difficulty: "C",
    rationale: "Irrealer Vergleich mit Konjunktiv II der Vergangenheit: \"als ob … bestellt worden wäre\"." }),
  mcq({ stem: "Könnten Sie mir bitte kurz ___, wo das Formular liegt?",
    options: ["sagen", "sagt", "gesagt"], answer: 0, capability: "adapt_register", difficulty: "A",
    rationale: "Höfliche Bitte mit Konjunktiv II + Infinitiv: \"könnten Sie … sagen\"." }),
  mcq({ stem: "Wäre ich damals informiert ___, hätte ich sofort reagiert.",
    options: ["gewesen", "worden", "geworden"], answer: 1, capability: "speculate", difficulty: "C",
    rationale: "Konjunktiv II Vergangenheit im Passiv: \"wäre … informiert worden\" (Passiv-Perfekt im Konjunktiv II)." }),
  mcq({ stem: "___ ich das nicht selbst gesehen hätte, würde ich es nicht glauben.",
    options: ["Wenn", "Ob", "Als"], answer: 0, capability: "speculate", difficulty: "B",
    rationale: "\"Wenn\" leitet den irrealen Konditionalsatz ein; \"ob\" wäre eine indirekte Frage, kein Konditionalsatz." }),
  mcq({ stem: "Sie benimmt sich, ___ nichts passiert wäre.",
    options: ["als ob", "sodass", "weil"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Als ob\" für den irrealen Vergleich mit Konjunktiv II." }),
];

const GRAMMAR_6_ITEMS = [ // Nominalisierung, Wortbildung, Adjektivdeklination
  mcq({ stem: "\"Die Situation zu verbessern\" lässt sich nominalisieren als:",
    options: ["die Verbesserung der Situation", "das Verbessern die Situation", "die Situation-Verbesserung"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "Nominalisierung mit Genitiv-Anschluss: \"die Verbesserung der Situation\"." }),
  mcq({ stem: "Nominalisierung von \"entscheiden\":",
    options: ["die Entscheidung", "das Entscheiden", "beide sind möglich, je nach Kontext"], answer: 2, capability: "structure", difficulty: "C",
    rationale: "\"Die Entscheidung\" (das Ergebnis) und \"das Entscheiden\" (der Vorgang) sind beide korrekte, aber unterschiedlich nuancierte Nominalisierungen." }),
  mcq({ stem: "Nach einem unbestimmten Artikel: \"ein ___ Patient\"",
    options: ["kritischer", "kritische", "kritisches"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "Maskulin, Nominativ, nach unbestimmtem Artikel: starke Endung \"-er\"." }),
  mcq({ stem: "Ohne Artikel: \"___ Patienten benötigen intensive Betreuung.\"",
    options: ["Kritische", "Kritischer", "Kritischen"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "Plural, Nominativ, ohne Artikel: starke Endung \"-e\"." }),
  mcq({ stem: "\"Man kann das Dokument nicht mehr ändern.\" — Nominalisiert:",
    options: ["die Unveränderbarkeit des Dokuments", "die Änderung des Dokuments", "das Ändern-Können"], answer: 0, capability: "structure", difficulty: "C",
    rationale: "\"Nicht mehr ändern können\" wird zu \"die Unveränderbarkeit\" — Wortbildung mit \"-barkeit\" für eine Eigenschaft." }),
  mcq({ stem: "Der Genitiv nach einem stark deklinierten Adjektiv ohne Artikel: \"trotz ___ Wetters\"",
    options: ["schlechten", "schlechtes", "schlechtem"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "Genitiv Singular Neutrum ohne Artikel nimmt die Endung \"-en\": \"schlechten Wetters\"." }),
  mcq({ stem: "Nominalisierung von \"zuverlässig sein\":",
    options: ["die Zuverlässigkeit", "die Verlässlichkeit ohne Bezug", "das Zuverlässige"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "Adjektiv + \"-keit\" bildet das Abstraktum \"die Zuverlässigkeit\"." }),
  mcq({ stem: "Mit bestimmtem Artikel Dativ Plural: \"mit den ___ Kolleginnen\"",
    options: ["neuen", "neue", "neuen Kolleginen"], answer: 0, capability: "language_awareness", difficulty: "A",
    rationale: "Nach bestimmtem Artikel im Dativ Plural: schwache Endung \"-en\" für alle Adjektive." }),
  mcq({ stem: "\"Es ist wichtig, dass man pünktlich ist.\" — Nominalisiert:",
    options: ["die Wichtigkeit der Pünktlichkeit", "die Pünktlichkeit ist wichtig genannt", "das Wichtige am Pünktlichsein"], answer: 0, capability: "structure", difficulty: "C",
    rationale: "Doppelte Nominalisierung: \"wichtig\" → \"die Wichtigkeit\", \"pünktlich sein\" → \"die Pünktlichkeit\"." }),
  mcq({ stem: "Gemischte Deklination nach \"kein\": \"kein ___ Grund\"",
    options: ["triftiger", "triftige", "triftigen"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "Nach \"kein\" (wie nach unbestimmtem Artikel) im Nominativ Maskulin: starke Endung \"-er\"." }),
  mcq({ stem: "Wortbildung: aus \"das Personal\" + \"der Mangel\" wird:",
    options: ["der Personalmangel", "die Personalmangelung", "das Mangelpersonal"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "Determinativkompositum: Bestimmungswort + Grundwort, das Genus richtet sich nach dem Grundwort \"der Mangel\"." }),
];

const GRAMMAR_7_ITEMS = [ // Verben mit Präp/Dativ, Reflexivverben mit Präp
  mcq({ stem: "Ich ___ meiner Kollegin sehr für die Unterstützung.",
    options: ["danke", "bedanke mich bei", "bin dankbar"], answer: 0, capability: "adapt_register", difficulty: "A",
    rationale: "\"Danken\" ist ein Dativverb: \"ich danke jemandem\", ohne Präposition." }),
  mcq({ stem: "Sie ___ sich sehr ___ die neue Regelung.",
    options: ["freut … über", "freut … auf", "interessiert … für"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Sich freuen über etwas\" (Gegenwart/Vergangenheit) im Unterschied zu \"sich freuen auf\" (Zukünftiges)." }),
  mcq({ stem: "Wir müssen uns dringend ___ das Problem ___.",
    options: ["kümmern … um", "sorgen … für", "achten … auf"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "Feste Verbindung: \"sich kümmern um etwas\"." }),
  mcq({ stem: "Er hat ___ dem Fortbildungskurs ___.",
    options: ["an … teilgenommen", "bei … mitgemacht", "in … eingenommen"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Teilnehmen an etwas (Dativ)\" ist die feste Verbindung." }),
  mcq({ stem: "Das Ergebnis ___ vor allem ___ die gute Vorbereitung ___.",
    options: ["ist … auf … zurückzuführen", "hängt … an … ab", "beruht … in …"], answer: 0, capability: "justify", difficulty: "C",
    rationale: "\"Etwas ist auf etwas zurückzuführen\" = die Ursache benennen." }),
  mcq({ stem: "Ich kann mich nicht mehr ___ das Gespräch ___.",
    options: ["erinnern … an", "denken … über", "wissen … von"], answer: 0, capability: "language_awareness", difficulty: "A",
    rationale: "\"Sich erinnern an etwas (Akkusativ)\" ist die Standardverbindung." }),
  mcq({ stem: "Die Pflegekraft hat sich ___ die Entscheidung des Arztes ___.",
    options: ["über … beschwert", "auf … geärgert", "an … gewöhnt"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Sich beschweren über etwas\" ist die feste Verbindung; \"sich ärgern über\" bräuchte \"über\", nicht \"auf\"." }),
  mcq({ stem: "Wir sollten ___ realistische Ziele ___ und nicht zu viel versprechen.",
    options: ["uns … konzentrieren auf", "uns … verlassen auf", "uns … beziehen auf"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Sich konzentrieren auf etwas\" passt inhaltlich zu \"realistische Ziele setzen und verfolgen\"." }),
  mcq({ stem: "Das neue System ist ___ mehreren Modulen ___.",
    options: ["aus … zusammengesetzt", "mit … verbunden", "an … angepasst"], answer: 0, capability: "structure", difficulty: "C",
    rationale: "\"Aus etwas zusammengesetzt/bestehen\" beschreibt, woraus etwas gebaut ist." }),
  mcq({ stem: "Ich habe mich ___ die Fortbildung ___, weil sie mir wichtig erschien.",
    options: ["für … entschieden", "an … erinnert", "auf … gefreut"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Sich entscheiden für etwas\" ist die feste Verbindung für eine getroffene Wahl." }),
  mcq({ stem: "Der Erfolg der Maßnahme ___ sehr ___ einer guten Kommunikation ___.",
    options: ["hängt … von … ab", "beruht … auf …", "besteht … aus …"], answer: 0, capability: "justify", difficulty: "C",
    rationale: "\"Abhängen von etwas\" ist hier die passende, im Alltag gebräuchlichste feste Verbindung." }),
];

const GRAMMAR_8_ITEMS = [ // Temporalsätze erweitert, Plusquamperfekt
  mcq({ stem: "___ sie die Ausbildung abgeschlossen hatte, bewarb sie sich sofort.",
    options: ["Nachdem", "Bevor", "Bis"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "Plusquamperfekt im Nebensatz + \"nachdem\" markiert Vorzeitigkeit zum Hauptsatz." }),
  mcq({ stem: "Sie arbeitet dort, ___ sie umgezogen ist.",
    options: ["seit", "bis", "sobald"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Seit\" beschreibt einen andauernden Zustand ab einem Zeitpunkt in der Vergangenheit." }),
  mcq({ stem: "___ der Arzt kommt, bleibt die Patientin im Bett.",
    options: ["Bis", "Seit", "Während"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Bis\" markiert den Endpunkt eines Zustands: bleiben, bis etwas eintritt." }),
  mcq({ stem: "___ ich das Formular ausgefüllt hatte, merkte ich den Fehler.",
    options: ["Kaum dass", "Bevor", "Solange"], answer: 0, capability: "structure", difficulty: "C",
    rationale: "\"Kaum dass\" + Plusquamperfekt markiert eine sehr knapp aufeinanderfolgende Abfolge." }),
  mcq({ stem: "___ die Schicht beginnt, wird die Übergabe gemacht.",
    options: ["Sobald", "Seit", "Bis"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Sobald\" markiert die unmittelbare zeitliche Abfolge: sofort danach." }),
  mcq({ stem: "Nachdem das Gespräch ___ war, fühlte sie sich erleichtert.",
    options: ["beendet gewesen", "beendet", "beenden"], answer: 1, capability: "language_awareness", difficulty: "C",
    rationale: "Zustandspassiv im Präteritum als Nebensatz: \"nachdem das Gespräch beendet war\"." }),
  mcq({ stem: "___ er die Ausbildung gemacht hatte, wechselte er die Station.",
    options: ["Nachdem", "Solange", "Während"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "Erneut: Plusquamperfekt + \"nachdem\" für eine bereits abgeschlossene Handlung vor der nächsten." }),
  mcq({ stem: "___ die Besprechung dauert, kann niemand gestört werden.",
    options: ["Solange", "Bis", "Seitdem"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Solange\" beschreibt die Gleichzeitigkeit über die ganze Dauer einer Handlung." }),
  mcq({ stem: "Erst ___ alle Fragen geklärt waren, unterschrieb sie das Formular.",
    options: ["als", "wenn", "während"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Als\" für einen einmaligen Zeitpunkt in der Vergangenheit." }),
  mcq({ stem: "___ die Kollegin zurückkommt, übernimmt sie wieder ihre Aufgaben.",
    options: ["Wenn", "Als", "Nachdem"], answer: 0, capability: "structure", difficulty: "A",
    rationale: "\"Wenn\" für einen wiederholbaren oder zukünftigen Zeitpunkt." }),
  mcq({ stem: "Sie hatte das Zertifikat schon erworben, ___ sie sich beworben hat.",
    options: ["bevor", "nachdem", "seitdem"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "Plusquamperfekt im Hauptsatz + \"bevor\" markiert: Zertifikat zuerst, Bewerbung danach." }),
];

const GRAMMAR_9_ITEMS = [ // Partizipialkonstruktionen, Infinitiv mit zu, N-Deklination
  mcq({ stem: "___ die Lage kennend, entschied sie sich für die vorsichtigere Option.",
    options: ["Die Lage kennend", "Kennend die Lage", "Die Lage gekannt"], answer: 0, capability: "structure", difficulty: "C",
    rationale: "Partizip-I-Konstruktion am Satzanfang: \"Die Lage kennend, …\" ersetzt einen Nebensatz (\"Weil sie die Lage kannte\")." }),
  mcq({ stem: "Sie hat vergessen, ___ Bescheid zu sagen.",
    options: ["mir", "mich", "mit mir"], answer: 0, capability: "language_awareness", difficulty: "A",
    rationale: "\"Jemandem Bescheid sagen\" ist ein Dativverb." }),
  mcq({ stem: "Der Kollege, ___ genannt, war eigentlich abwesend.",
    options: ["als Verantwortlicher", "als Verantwortliche", "als Verantwortlich"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "Substantiviertes Adjektiv nach \"als\" bei maskulinem Bezug: \"als Verantwortlicher\"." }),
  mcq({ stem: "Ich habe keine Zeit, das Protokoll ___.",
    options: ["zu lesen", "lesen", "gelesen"], answer: 0, capability: "language_awareness", difficulty: "A",
    rationale: "\"Zeit haben, etwas zu tun\" verlangt den Infinitiv mit \"zu\"." }),
  mcq({ stem: "Der Experte, den wir konsultiert haben, ist ein ___.",
    options: ["Kollege", "Kollegen", "Kollegin"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Der Kollege\" ist Nominativ; die N-Deklination betrifft nur die anderen Fälle (den/dem/des Kollegen)." }),
  mcq({ stem: "Ich habe mit dem ___ über den Fall gesprochen.",
    options: ["Kollegen", "Kollege", "Kolleg"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "N-Deklination: \"der Kollege\" bekommt im Dativ die Endung \"-n\": \"dem Kollegen\"." }),
  mcq({ stem: "Man bat den ___, seine Einschätzung zu wiederholen.",
    options: ["Experten", "Experte", "Expert"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "N-Deklination im Akkusativ: \"den Experten\"." }),
  mcq({ stem: "Statt lange zu diskutieren, ___ sie sofort zu handeln.",
    options: ["begann", "beginnt zu", "anfangen"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Statt … zu\" + Hauptsatz im Präteritum: \"statt zu diskutieren, begann sie …\"." }),
  mcq({ stem: "___ genügend Informationen zu haben, traf er die Entscheidung allein.",
    options: ["Ohne", "Statt", "Anstatt dass"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Ohne … zu\" beschreibt das Fehlen einer erwarteten Handlung/Bedingung." }),
  mcq({ stem: "Sie bat den ___, ihr das Vorgehen zu erklären.",
    options: ["Kunden", "Kunde", "Kund"], answer: 0, capability: "language_awareness", difficulty: "A",
    rationale: "N-Deklination im Akkusativ: \"der Kunde\" → \"den Kunden\"." }),
  mcq({ stem: "Er vermied es, ___ auf die Frage zu antworten.",
    options: ["direkt", "direkte", "direkten"], answer: 0, capability: "adapt_register", difficulty: "A",
    rationale: "\"Direkt\" ist hier ein Adverb (unveränderlich), kein deklinierbares Adjektiv." }),
];

const GRAMMAR_SETS = [
  ["practice-grammar-1", "Gezielte Grammatikübung 1 — gemischte B2-Strukturen", GRAMMAR_1_ITEMS],
  ["practice-grammar-2", "Gezielte Grammatikübung 2 — Passiv, Zustandspassiv, Futur", GRAMMAR_2_ITEMS],
  ["practice-grammar-3", "Gezielte Grammatikübung 3 — Relativsätze mit Präposition", GRAMMAR_3_ITEMS],
  ["practice-grammar-4", "Gezielte Grammatikübung 4 — Doppelkonnektoren & je…desto", GRAMMAR_4_ITEMS],
  ["practice-grammar-5", "Gezielte Grammatikübung 5 — Konjunktiv II erweitert", GRAMMAR_5_ITEMS],
  ["practice-grammar-6", "Gezielte Grammatikübung 6 — Nominalisierung & Adjektivdeklination", GRAMMAR_6_ITEMS],
  ["practice-grammar-7", "Gezielte Grammatikübung 7 — Verben mit fester Präposition", GRAMMAR_7_ITEMS],
  ["practice-grammar-8", "Gezielte Grammatikübung 8 — Temporalsätze & Plusquamperfekt", GRAMMAR_8_ITEMS],
  ["practice-grammar-9", "Gezielte Grammatikübung 9 — Partizipialkonstruktionen & N-Deklination", GRAMMAR_9_ITEMS],
];

/* ══════════════════════════════════════════════════════════════════════
   VOCABULARY — 9 sets, matching the grammar corpus in size.
   ══════════════════════════════════════════════════════════════════════ */

const VOCAB_1_ITEMS = [
  mcq({ stem: "\"Er hat die Aufgabe termingerecht erledigt.\" — \"termingerecht\" bedeutet:",
    options: ["pünktlich, innerhalb der Frist", "sehr sorgfältig", "ohne Hilfe"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Termingerecht\" = fristgemäß, pünktlich zum vereinbarten Zeitpunkt." }),
  mcq({ stem: "Welches Wort passt am besten: \"Für diese Aufgabe bin ich nicht ___.\"",
    options: ["zuständig", "verantwortlich für", "beschäftigt"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Zuständig sein für etwas\" ist die feste, im Berufsalltag gebräuchliche Wendung; \"verantwortlich für\" bräuchte hier \"für\" nach dem Adjektiv." }),
  mcq({ stem: "\"Die Beschwerde wurde umgehend bearbeitet.\" — \"umgehend\" heißt:",
    options: ["sofort", "eventuell", "teilweise"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Umgehend\" ist ein Synonym für \"sofort/unverzüglich\"." }),
  mcq({ stem: "Formeller Ausdruck für \"Ich brauche mehr Infos\":",
    options: ["Ich benötige weitere Informationen.", "Gib mir mal mehr Infos.", "Ich will das genauer wissen."], answer: 0, capability: "adapt_register", difficulty: "B",
    rationale: "\"Benötigen\" + \"weitere Informationen\" ist die formelle Registerwahl, passend für E-Mails an Vorgesetzte." }),
  mcq({ stem: "\"Die Kollegin hat mich vertreten, während ich im Urlaub war.\" — \"vertreten\" bedeutet hier:",
    options: ["meine Aufgaben übernehmen", "mir widersprechen", "mich begleiten"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Jemanden vertreten\" = seine Aufgaben/Rolle übernehmen, nicht \"begleiten\" oder \"widersprechen\"." }),
  mcq({ stem: "Welches Wort ist hier ein falscher Freund für englische Muttersprachler? \"Ich bekomme ein Formular.\"",
    options: ["bekommen (≠ to become)", "Formular (≠ formula)", "beide"], answer: 2, capability: "language_awareness", difficulty: "C",
    rationale: "\"Bekommen\" heißt \"erhalten\", nicht \"werden\"; \"Formular\" heißt \"Dokument zum Ausfüllen\", nicht \"Formel\" — beides klassische falsche Freunde." }),
  mcq({ stem: "\"Der Dienstplan wurde kurzfristig geändert.\" — \"kurzfristig\" heißt:",
    options: ["mit wenig Vorlauf", "für kurze Zeit", "sehr oft"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Kurzfristig\" bezieht sich auf die Vorlaufzeit einer Ankündigung, nicht auf die Dauer." }),
  mcq({ stem: "Passendes Verb: \"Wir müssen die neuen Vorschriften ___.\"",
    options: ["einhalten", "einholen", "einsehen"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Vorschriften einhalten\" ist die feste Kollokation; \"einholen\" passt zu Erlaubnis/Rat, \"einsehen\" zu Akten/Dokumenten." }),
  mcq({ stem: "\"Sie hat sich schnell in das neue Team eingelebt.\" — \"sich einleben\" bedeutet:",
    options: ["sich an eine neue Umgebung gewöhnen", "einen neuen Wohnort finden", "ein neues Leben beginnen"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Sich einleben\" = sich an eine neue Umgebung/Situation gewöhnen." }),
  mcq({ stem: "Höflich-formelle Bitte am Telefon:",
    options: ["Könnten Sie mir bitte kurz weiterhelfen?", "Hilf mir mal.", "Ich brauch Hilfe, jetzt gleich."], answer: 0, capability: "adapt_register", difficulty: "B",
    rationale: "Konjunktiv II + \"bitte\" ist der Standard für höfliche formelle Bitten." }),
  mcq({ stem: "\"Der Arzt hat die Diagnose bestätigt.\" — Gegenteil von \"bestätigen\":",
    options: ["widerlegen", "wiederholen", "erklären"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Bestätigen\" (etwas als richtig anerkennen) ↔ \"widerlegen\" (als falsch nachweisen)." }),
  mcq({ stem: "\"Wir sind auf Ihre Rückmeldung angewiesen.\" — \"angewiesen sein auf\" bedeutet:",
    options: ["etwas dringend brauchen", "etwas ablehnen", "etwas anordnen"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Auf etwas angewiesen sein\" = davon abhängig sein, es dringend benötigen." }),
];

const VOCAB_2_ITEMS = [ // Kollokationen Verb+Nomen
  mcq({ stem: "Passendes Verb: \"Wir müssen dringend eine Entscheidung ___.\"",
    options: ["treffen", "machen", "nehmen"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "Feste Kollokation: \"eine Entscheidung treffen\"." }),
  mcq({ stem: "\"Auf etwas ___ legen\" — welches Wort fehlt für \"Wert\"?",
    options: ["Wert", "Preis", "Bedeutung"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Wert auf etwas legen\" ist die feste Wendung für \"etwas wichtig nehmen\"." }),
  mcq({ stem: "Passendes Verb: \"Die Klinik hat strenge Maßnahmen ___.\"",
    options: ["ergriffen", "gemacht", "genommen"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Maßnahmen ergreifen\" ist die feste Kollokation, nicht \"machen\" oder \"nehmen\"." }),
  mcq({ stem: "\"Verantwortung ___\" — welches Verb passt?",
    options: ["übernehmen", "machen", "haben nur"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Verantwortung übernehmen\" ist die übliche Kollokation für eine aktiv getroffene Zusage." }),
  mcq({ stem: "\"Ein Risiko ___\" — welches Verb fehlt?",
    options: ["eingehen", "nehmen", "machen"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Ein Risiko eingehen\" ist die feste Verbindung." }),
  mcq({ stem: "\"Rücksicht ___ nehmen\" — worauf bezieht sich das meistens?",
    options: ["auf jemanden/etwas", "von jemandem", "mit jemandem"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Rücksicht nehmen auf jemanden/etwas\" ist die feste Präposition." }),
  mcq({ stem: "Passendes Verb: \"Der Bericht ___ alle wichtigen Punkte.\"",
    options: ["enthält", "besteht", "beinhaltet auch beide"], answer: 2, capability: "language_awareness", difficulty: "C",
    rationale: "Sowohl \"enthält\" als auch \"beinhaltet\" sind hier korrekt und bedeutungsgleich; \"besteht\" bräuchte \"aus\"." }),
  mcq({ stem: "\"Eine Rolle ___\" — welches Verb fehlt?",
    options: ["spielen", "machen", "haben"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Eine Rolle spielen\" ist die feste Kollokation für \"von Bedeutung sein\"." }),
  mcq({ stem: "\"Zur Verfügung ___\" — welches Verb passt?",
    options: ["stehen", "sein", "haben"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Zur Verfügung stehen\" ist die feste Wendung; \"stellen\" wäre die transitive Variante (\"etwas zur Verfügung stellen\")." }),
  mcq({ stem: "\"Einen Antrag ___\" — welches Verb fehlt?",
    options: ["stellen", "machen", "geben"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Einen Antrag stellen\" ist die feste bürokratische Kollokation." }),
  mcq({ stem: "\"Im Vordergrund ___\" — welches Verb passt?",
    options: ["stehen", "sein nur", "liegen"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Im Vordergrund stehen\" ist die feste Wendung für \"besonders wichtig sein\"." }),
];

const VOCAB_3_ITEMS = [ // Synonyme / Register formal-informal
  mcq({ stem: "Formelles Synonym für \"anfangen\":",
    options: ["beginnen", "los machen", "starten (umgangssprachlich)"], answer: 0, capability: "adapt_register", difficulty: "A",
    rationale: "\"Beginnen\" ist das neutral-formelle Synonym zu \"anfangen\"." }),
  mcq({ stem: "Formelles Synonym für \"kriegen\":",
    options: ["erhalten", "packen", "schnappen"], answer: 0, capability: "adapt_register", difficulty: "B",
    rationale: "\"Erhalten\" ist die schriftsprachliche, formelle Variante von \"kriegen\"." }),
  mcq({ stem: "Formelles Synonym für \"kaputt\" (bei einem Gerät):",
    options: ["defekt", "hin", "im Eimer"], answer: 0, capability: "adapt_register", difficulty: "B",
    rationale: "\"Defekt\" ist die neutrale, für offizielle Berichte geeignete Bezeichnung." }),
  mcq({ stem: "Umgangssprachlich \"checken\" heißt formell:",
    options: ["überprüfen", "gucken", "kontrollieren, aber informell"], answer: 0, capability: "adapt_register", difficulty: "B",
    rationale: "\"Überprüfen\" ist das formelle Äquivalent zu umgangssprachlichem \"checken\"." }),
  mcq({ stem: "Formelles Synonym für \"viele\" in einem Bericht:",
    options: ["zahlreiche", "'ne Menge", "haufenweise"], answer: 0, capability: "adapt_register", difficulty: "B",
    rationale: "\"Zahlreiche\" ist die schriftsprachlich-formelle Variante." }),
  mcq({ stem: "\"Das Problem lösen\" formell umschrieben:",
    options: ["eine Lösung für das Problem finden/erarbeiten", "das Problem knacken", "das Problem fixen"], answer: 0, capability: "adapt_register", difficulty: "B",
    rationale: "\"Eine Lösung erarbeiten\" ist die formelle, in Berichten übliche Umschreibung." }),
  mcq({ stem: "Formelles Synonym für \"sagen, dass etwas nicht stimmt\":",
    options: ["widersprechen / darauf hinweisen, dass …", "quatschen", "meckern"], answer: 0, capability: "adapt_register", difficulty: "B",
    rationale: "\"Widersprechen\" bzw. \"darauf hinweisen\" ist die sachliche, formelle Formulierung." }),
  mcq({ stem: "\"Ich hab keine Ahnung\" formell:",
    options: ["Das ist mir nicht bekannt.", "Keine Idee.", "Weiß nicht."], answer: 0, capability: "adapt_register", difficulty: "B",
    rationale: "\"Das ist mir nicht bekannt\" ist die formelle, unpersönliche Formulierung." }),
  mcq({ stem: "\"Wir müssen das nochmal genauer angucken\" formell:",
    options: ["Wir müssen das genauer prüfen.", "Wir müssen mal reinschauen.", "Wir gucken da noch mal rein."], answer: 0, capability: "adapt_register", difficulty: "B",
    rationale: "\"Prüfen\" ersetzt umgangssprachliches \"angucken\" in einem formellen Kontext." }),
  mcq({ stem: "\"Das nervt mich total\" formell umschrieben:",
    options: ["Das empfinde ich als sehr belastend.", "Das kotzt mich an.", "Das geht mir auf die Nerven."], answer: 0, capability: "adapt_register", difficulty: "C",
    rationale: "\"Als belastend empfinden\" ist die sachlich-distanzierte, formelle Umschreibung eines Ärgers." }),
  mcq({ stem: "\"Kannste mal kurz vorbeikommen?\" formell:",
    options: ["Könnten Sie kurz vorbeikommen?", "Kommste kurz mal?", "Häng dich mal kurz rein."], answer: 0, capability: "adapt_register", difficulty: "A",
    rationale: "Konjunktiv II + \"Sie\"-Form ist die formelle Entsprechung." }),
];

const VOCAB_4_ITEMS = [ // Nominalisierte Abstrakta häufig in B2-Texten
  mcq({ stem: "\"Es ist ___, dass alle Unterlagen vollständig sind.\" — passendes Nomen:",
    options: ["die Voraussetzung", "die Auswirkung", "der Umstand"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Voraussetzung\" = das, was erfüllt sein muss, bevor etwas möglich ist." }),
  mcq({ stem: "\"Die ___ des neuen Gesetzes zeigten sich erst nach Monaten.\" — passendes Nomen:",
    options: ["Auswirkungen", "Voraussetzungen", "Zuständigkeiten"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Auswirkung\" = die Folge/der Effekt einer Maßnahme." }),
  mcq({ stem: "\"Es besteht ein klarer ___ zwischen Stress und Fehlerquote.\" — passendes Nomen:",
    options: ["Zusammenhang", "Anlass", "Eindruck"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Zusammenhang\" beschreibt eine Beziehung zwischen zwei Faktoren." }),
  mcq({ stem: "\"Der ___ für die Beschwerde war ein Missverständnis.\" — passendes Nomen:",
    options: ["Anlass", "Zusammenhang", "Eindruck"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Anlass\" = der konkrete Auslöser für etwas." }),
  mcq({ stem: "\"Ich hatte den ___, dass die Erklärung nicht ausreichte.\" — passendes Nomen:",
    options: ["Eindruck", "Umstand", "Anlass"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Der Eindruck\" beschreibt eine subjektive Wahrnehmung." }),
  mcq({ stem: "\"Unter diesem ___ war die Verzögerung nicht zu vermeiden.\" — passendes Nomen:",
    options: ["Umstand", "Anlass", "Zusammenhang"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Umstand\" bezeichnet eine bestimmte Bedingung/Situation, die etwas erklärt." }),
  mcq({ stem: "\"Die ___ für den Fehler lag beim Team, nicht bei Einzelnen.\" — passendes Nomen:",
    options: ["Verantwortung", "Bereitschaft", "Maßnahme"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Verantwortung\" beschreibt, wer für etwas geradestehen muss." }),
  mcq({ stem: "\"Ihre ___, zusätzliche Schichten zu übernehmen, wurde sehr geschätzt.\" — passendes Nomen:",
    options: ["Bereitschaft", "Maßnahme", "Voraussetzung"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Bereitschaft\" = die Haltung, etwas zu tun, wenn es nötig ist." }),
  mcq({ stem: "\"Die eingeleiteten ___ zeigten schnell Wirkung.\" — passendes Nomen:",
    options: ["Maßnahmen", "Eindrücke", "Umstände"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Maßnahme\" = eine konkret ergriffene Handlung zur Lösung eines Problems." }),
  mcq({ stem: "\"Es gibt keinen Grund zur ___ — die Werte sind stabil.\" — passendes Nomen:",
    options: ["Besorgnis", "Bereitschaft", "Zuständigkeit"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Besorgnis\" = die Sorge/Unruhe über etwas." }),
  mcq({ stem: "\"Die genaue ___ für diese Aufgabe war unklar.\" — passendes Nomen:",
    options: ["Zuständigkeit", "Besorgnis", "Auswirkung"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Zuständigkeit\" = wer für etwas verantwortlich/befugt ist." }),
];

const VOCAB_5_ITEMS = [ // Workplace/nursing Redewendungen
  mcq({ stem: "Bei der Übergabe sagt man üblicherweise zuerst:",
    options: ["\"Ich übergebe Ihnen Zimmer 12 bis 18.\"", "\"Hier ist alles wie immer.\"", "\"Ich hab nicht viel zu sagen.\""], answer: 0, capability: "structure", difficulty: "B",
    rationale: "Eine strukturierte Übergabe beginnt mit einer klaren Zuordnung, nicht mit einer vagen Floskel." }),
  mcq({ stem: "Höfliche Rückfrage bei einer unklaren Anweisung:",
    options: ["Habe ich richtig verstanden, dass …?", "Was meinen Sie jetzt genau?", "Wie bitte?"], answer: 0, capability: "ask_followup", difficulty: "B",
    rationale: "\"Habe ich richtig verstanden, dass …?\" ist die höflichste und präziseste Rückfrageform." }),
  mcq({ stem: "Bei einem Missverständnis sagt man am besten:",
    options: ["Ich glaube, da ist etwas missverstanden worden — können wir das klären?", "Das haben Sie falsch gemacht.", "Das war doch klar so gemeint."], answer: 0, capability: "react_unexpected", difficulty: "B",
    rationale: "Die neutrale, deeskalierende Formulierung benennt das Missverständnis ohne Schuldzuweisung." }),
  mcq({ stem: "Um eine Terminverschiebung höflich anzukündigen:",
    options: ["Ich muss den Termin leider verschieben — wäre nächste Woche möglich?", "Der Termin fällt aus, Punkt.", "Ich kann nicht, wie immer."], answer: 0, capability: "adapt_register", difficulty: "B",
    rationale: "Höflich + Begründung + Alternative ist der professionelle Standard." }),
  mcq({ stem: "Um einem Patienten eine Prozedur zu erklären, beginnt man am besten mit:",
    options: ["Ich erkläre Ihnen jetzt kurz, was wir gleich machen.", "Das tut gleich nicht weh, versprochen.", "Machen Sie sich keine Gedanken."], answer: 0, capability: "structure", difficulty: "B",
    rationale: "Eine klare Ankündigung, was passiert, schafft Transparenz — leere Beruhigungsformeln tun das nicht." }),
  mcq({ stem: "Bei einer Meinungsverschiedenheit im Team sagt man sachlich:",
    options: ["Ich sehe das anders — können wir die Gründe vergleichen?", "Das ist doch Unsinn.", "Machen Sie, was Sie wollen."], answer: 0, capability: "maintain_discussion", difficulty: "B",
    rationale: "Die sachliche Formulierung eröffnet ein Gespräch, statt es zu beenden." }),
  mcq({ stem: "Um eine unerwartete Information ruhig aufzunehmen:",
    options: ["Das habe ich nicht erwartet — lassen Sie uns das genauer besprechen.", "Was?! Das kann nicht sein.", "Das interessiert mich jetzt nicht."], answer: 0, capability: "react_unexpected", difficulty: "B",
    rationale: "Ruhige Anerkennung + Vorschlag zur Klärung ist die professionelle Reaktion." }),
  mcq({ stem: "Um eine Aufgabe zusammenzufassen, bevor man sie weitergibt:",
    options: ["Kurz zusammengefasst: die Werte sind stabil, Medikation bleibt gleich.", "Naja, ist eigentlich alles wie immer.", "Ich erzähl mal alles von Anfang an."], answer: 0, capability: "summarise", difficulty: "B",
    rationale: "Eine gute Zusammenfassung nennt die Kernpunkte knapp, statt alles chronologisch nachzuerzählen." }),
  mcq({ stem: "Um unter Zeitdruck eine klare Anweisung zu geben:",
    options: ["Bitte jetzt sofort das Zimmer 4 kontrollieren, es ist dringend.", "Könnte irgendwer mal schauen, wenn Zeit ist?", "Vielleicht sollte jemand nachsehen."], answer: 0, capability: "structure", difficulty: "B",
    rationale: "Unter Zeitdruck braucht es eine direkte, unmissverständliche Anweisung mit Priorität." }),
  mcq({ stem: "Um Unsicherheit ehrlich zu kommunizieren, ohne unprofessionell zu wirken:",
    options: ["Ich bin mir nicht ganz sicher — ich frage lieber noch einmal nach.", "Ich hab keine Ahnung, keine Ahnung.", "Ist doch egal, machen wir halt irgendwas."], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "Unsicherheit benennen + aktiv nachfragen ist professioneller als raten oder resignieren." }),
  mcq({ stem: "Um höflich um Geduld zu bitten:",
    options: ["Einen Moment bitte, ich kümmere mich gleich darum.", "Warten Sie halt.", "Ich hab jetzt keine Zeit dafür."], answer: 0, capability: "adapt_register", difficulty: "A",
    rationale: "\"Einen Moment bitte\" + eine konkrete Zusage ist die höfliche Standardformel." }),
];

const VOCAB_6_ITEMS = [ // Falsche Freunde & leicht verwechselbare Wortpaare
  mcq({ stem: "\"Ich habe das Rezept bekommen.\" — \"das Rezept\" bedeutet hier:",
    options: ["die ärztliche Verordnung für ein Medikament", "eine Kochanleitung", "beides ist im Deutschen dasselbe Wort"], answer: 2, capability: "language_awareness", difficulty: "B",
    rationale: "\"Rezept\" ist im Deutschen tatsächlich ein Wort für beides — Kontext entscheidet, welche Bedeutung gemeint ist." }),
  mcq({ stem: "\"sensibel\" vs. \"sensitiv\" — im Alltag beschreibt man einen einfühlsamen Menschen meist als:",
    options: ["sensibel", "sensitiv", "beide sind hier gleich ungebräuchlich"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Sensibel\" ist das Alltagswort für einfühlsam/empfindsam; \"sensitiv\" wird eher in Fachkontexten (z.B. Messgeräte) verwendet." }),
  mcq({ stem: "\"Ich bin positiv überrascht.\" vs. \"Der Test ist positiv.\" — im medizinischen Kontext bedeutet \"positiv\":",
    options: ["ein Nachweis wurde gefunden (kann eine schlechte Nachricht sein)", "immer etwas Gutes", "das Gegenteil von negativ im Sinne von schlecht"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "Im medizinischen Kontext heißt \"positiv\" oft \"nachgewiesen\", was klinisch schlecht sein kann — anders als die Alltagsbedeutung." }),
  mcq({ stem: "\"aktuell\" bedeutet im Deutschen:",
    options: ["zurzeit, momentan", "tatsächlich (wie engl. \"actually\")", "wichtig"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Aktuell\" heißt \"zurzeit gültig/gegenwärtig\", nicht \"tatsächlich\" (falscher Freund zu engl. \"actually\")." }),
  mcq({ stem: "\"eventuell\" bedeutet im Deutschen:",
    options: ["möglicherweise", "am Ende, letztendlich (wie engl. \"eventually\")", "sicher"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Eventuell\" heißt \"vielleicht\", nicht \"letztendlich\" — klassischer falscher Freund zu engl. \"eventually\"." }),
  mcq({ stem: "\"Ich kontrolliere den Blutdruck.\" — \"kontrollieren\" bedeutet hier:",
    options: ["messen/überprüfen", "beherrschen/steuern", "verbieten"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Kontrollieren\" heißt im Deutschen meist \"überprüfen\", nicht \"beherrschen\" wie im Englischen \"to control\"." }),
  mcq({ stem: "\"das Gymnasium\" bezeichnet im Deutschen:",
    options: ["eine weiterführende Schule", "einen Sportraum", "eine Sporthalle"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Gymnasium\" ist ein Schultyp, nicht ein Sportraum wie engl. \"gymnasium\" — falscher Freund." }),
  mcq({ stem: "\"die Konsequenz\" bedeutet im Deutschen meist:",
    options: ["die Folge einer Handlung", "die Beharrlichkeit (wie engl. \"consequence\" ≠ \"consistency\")", "der Beweis"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Konsequenz\" heißt \"Folge\"; wer \"konsequent\" ist, ist beharrlich — zwei verschiedene Wörter, die man nicht verwechseln sollte." }),
  mcq({ stem: "\"das Formular ausfüllen\" — \"ausfüllen\" bedeutet hier:",
    options: ["die geforderten Angaben eintragen", "das Formular vernichten", "das Formular unterschreiben"], answer: 0, capability: "language_awareness", difficulty: "A",
    rationale: "\"Ausfüllen\" heißt, die Felder eines Dokuments mit Angaben zu versehen." }),
  mcq({ stem: "\"Das ist mir sympathisch.\" — \"sympathisch\" bedeutet:",
    options: ["ich finde die Person/Sache angenehm", "ich habe Mitleid (wie engl. \"sympathetic\")", "ich stimme zu"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Sympathisch\" heißt \"angenehm/liebenswürdig\", nicht \"mitfühlend\" wie engl. \"sympathetic\" — falscher Freund." }),
  mcq({ stem: "\"Ich bin irritiert.\" bedeutet im Deutschen meist:",
    options: ["ich bin verwirrt/leicht gestört", "ich bin wütend (wie engl. \"irritated\")", "ich bin krank"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Irritiert\" heißt im Deutschen eher \"verwirrt/befremdet\", während engl. \"irritated\" stärker \"verärgert\" bedeutet." }),
];

const VOCAB_7_ITEMS = [ // Antonyme & Präzisierung
  mcq({ stem: "Gegenteil von \"zuverlässig\":",
    options: ["unzuverlässig", "unsicher", "ungenau"], answer: 0, capability: "language_awareness", difficulty: "A",
    rationale: "Direktes Antonym mit Negationspräfix \"un-\": \"unzuverlässig\"." }),
  mcq({ stem: "Gegenteil von \"ausführlich\" (bei einer Erklärung):",
    options: ["knapp", "unklar", "falsch"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Knapp\" beschreibt das Gegenteil von \"ausführlich\" in Bezug auf Länge/Detailgrad." }),
  mcq({ stem: "Präziser als \"gut\": \"Die Behandlung verlief ___.\"",
    options: ["reibungslos", "gut", "okay"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Reibungslos\" ist präziser und formeller als das vage \"gut\"." }),
  mcq({ stem: "Gegenteil von \"vertraulich\" (bei Informationen):",
    options: ["öffentlich", "geheim", "wichtig"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Öffentlich\" ist das direkte Gegenteil von \"vertraulich\" (nicht für alle bestimmt)." }),
  mcq({ stem: "Präziser als \"schlecht\": \"Die Kommunikation im Team war ___.\"",
    options: ["mangelhaft", "schlecht", "nicht so gut"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Mangelhaft\" ist eine präzisere, formellere Bewertung als das allgemeine \"schlecht\"." }),
  mcq({ stem: "Gegenteil von \"eindeutig\" (bei einer Anweisung):",
    options: ["missverständlich", "kurz", "höflich"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Missverständlich\" beschreibt genau das Gegenteil von \"eindeutig/klar\"." }),
  mcq({ stem: "Präziser als \"viel Arbeit\": \"Die Station hatte ___ zu bewältigen.\"",
    options: ["ein hohes Arbeitsaufkommen", "viel Arbeit", "'ne Menge Kram"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Ein hohes Arbeitsaufkommen\" ist die präzise, formelle Formulierung für \"viel Arbeit\"." }),
  mcq({ stem: "Gegenteil von \"nachvollziehbar\" (bei einer Entscheidung):",
    options: ["unverständlich", "unwichtig", "unhöflich"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Unverständlich\" ist das direkte Gegenteil von \"nachvollziehbar\"." }),
  mcq({ stem: "Präziser als \"schnell\": \"Die Reaktion des Teams war ___.\"",
    options: ["prompt", "schnell", "ziemlich fix"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Prompt\" ist eine formellere, präzisere Alternative zu \"schnell\" in einem Bericht." }),
  mcq({ stem: "Gegenteil von \"freiwillig\":",
    options: ["verpflichtend", "unfreiwillig gemeint als selten genutzt", "spontan"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Verpflichtend\" ist das gebräuchliche Gegenteil von \"freiwillig\" im institutionellen Kontext." }),
  mcq({ stem: "Präziser als \"viele Leute\": \"An der Schulung nahmen ___ teil.\"",
    options: ["zahlreiche Mitarbeitende", "viele Leute", "'ne ganze Menge Leute"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Zahlreiche Mitarbeitende\" ist präziser und im Berufskontext angemessener als \"viele Leute\"." }),
];

const VOCAB_8_ITEMS = [ // Verb+Präposition als Wortschatz (Wiederholung mit anderen Beispielen als Grammatik 7)
  mcq({ stem: "\"Der Lärm wirkt sich negativ ___ die Konzentration aus.\"",
    options: ["auf", "über", "für"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Sich auswirken auf etwas\" ist die feste Präposition." }),
  mcq({ stem: "\"Wir nehmen Rücksicht ___ die Bedürfnisse der Patientinnen.\"",
    options: ["auf", "für", "von"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Rücksicht nehmen auf etwas/jemanden\" ist die feste Verbindung." }),
  mcq({ stem: "\"Wir legen großen Wert ___ eine offene Kommunikation.\"",
    options: ["auf", "für", "in"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Wert legen auf etwas\" ist die feste Verbindung." }),
  mcq({ stem: "\"Diese Unannehmlichkeit müssen wir leider ___ Kauf nehmen.\"",
    options: ["in", "auf", "zu"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Etwas in Kauf nehmen\" = eine negative Begleiterscheinung akzeptieren." }),
  mcq({ stem: "\"Für Rückfragen stehen wir jederzeit ___ Verfügung.\"",
    options: ["zur", "in der", "auf"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Zur Verfügung stehen\" ist die feste Wendung." }),
  mcq({ stem: "\"Ihre Erfahrung bringt einen echten Mehrwert ___ Ausdruck.\"",
    options: ["zum", "auf den", "in den"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"Zum Ausdruck bringen\" = etwas sichtbar/deutlich machen." }),
  mcq({ stem: "\"Die neue Regelung tritt ___ Kraft, sobald sie unterschrieben ist.\"",
    options: ["in", "auf", "zu"], answer: 0, capability: "language_awareness", difficulty: "C",
    rationale: "\"In Kraft treten\" = ab jetzt gültig werden." }),
  mcq({ stem: "\"Wir sollten die Situation ___ Auge behalten.\"",
    options: ["im", "am", "unter"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Etwas im Auge behalten\" = weiterhin beobachten." }),
  mcq({ stem: "\"Der Vorschlag steht noch ___ Diskussion.\"",
    options: ["zur", "in der", "auf"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Zur Diskussion stehen\" = noch nicht endgültig entschieden sein." }),
  mcq({ stem: "\"Ihre Anmerkung trifft ___ den Punkt.\"",
    options: ["genau", "voll auf", "direkt in"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Genau den Punkt treffen\" ist die idiomatische Wendung für \"exakt richtig liegen\"." }),
  mcq({ stem: "\"Diese Entwicklung gibt ___ Anlass zur Sorge.\"",
    options: ["keinen", "keine", "kein"], answer: 0, capability: "language_awareness", difficulty: "B",
    rationale: "\"Der Anlass\" ist maskulin, Akkusativ Singular: \"keinen Anlass\"." }),
];

const VOCAB_9_ITEMS = [ // Wortbildung Verb→Nomen, Adjektiv→Nomen
  mcq({ stem: "Nomen zu \"prüfen\":",
    options: ["die Prüfung", "das Prüfen ist seltener", "der Prüf"], answer: 0, capability: "structure", difficulty: "A",
    rationale: "Verb + \"-ung\" ist das häufigste Muster für Vorgangsnomen: \"die Prüfung\"." }),
  mcq({ stem: "Nomen zu \"möglich\":",
    options: ["die Möglichkeit", "die Möglichung", "das Mögliche nur"], answer: 0, capability: "structure", difficulty: "A",
    rationale: "Adjektiv + \"-keit\" bildet das Abstraktum: \"die Möglichkeit\"." }),
  mcq({ stem: "Nomen zu \"sich beschweren\":",
    options: ["die Beschwerde", "die Beschwerung", "das Beschwert"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "Unregelmäßige, aber sehr gebräuchliche Nominalisierung: \"die Beschwerde\"." }),
  mcq({ stem: "Nomen zu \"verantwortlich\":",
    options: ["die Verantwortung", "die Verantwortlichkeit ist seltener", "der Verantwortliche bezeichnet die Person"], answer: 2, capability: "structure", difficulty: "C",
    rationale: "\"Die Verantwortung\" ist die Eigenschaft/Aufgabe, \"der/die Verantwortliche\" die Person, die sie trägt — beide Nominalisierungen existieren, mit unterschiedlicher Bedeutung." }),
  mcq({ stem: "Nomen zu \"sich entscheiden\":",
    options: ["die Entscheidung", "die Entscheidheit", "das Entschiedene"], answer: 0, capability: "structure", difficulty: "A",
    rationale: "\"Die Entscheidung\" ist die reguläre Nominalisierung mit \"-ung\"." }),
  mcq({ stem: "Nomen zu \"häufig\":",
    options: ["die Häufigkeit", "die Häufung meint etwas anderes", "das Häufige"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Häufigkeit\" beschreibt, wie oft etwas vorkommt; \"Häufung\" beschreibt eine Ansammlung — unterschiedliche Bedeutungen." }),
  mcq({ stem: "Nomen zu \"sich verändern\":",
    options: ["die Veränderung", "die Verändertheit", "das Verändern nur"], answer: 0, capability: "structure", difficulty: "A",
    rationale: "\"Die Veränderung\" ist die Standardnominalisierung." }),
  mcq({ stem: "Nomen zu \"genau\":",
    options: ["die Genauigkeit", "die Genauheit", "das Genaue nur"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Genauigkeit\" ist die korrekte Bildung mit \"-igkeit\" nach Adjektiven auf \"-au\"." }),
  mcq({ stem: "Nomen zu \"anwenden\":",
    options: ["die Anwendung", "die Anwendbarkeit beschreibt etwas anderes", "das Angewendete"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "\"Die Anwendung\" ist der Vorgang; \"Anwendbarkeit\" beschreibt, OB etwas anwendbar ist — feine, aber wichtige Unterscheidung." }),
  mcq({ stem: "Nomen zu \"sich verbessern\":",
    options: ["die Verbesserung", "die Besserheit", "das Verbesserte"], answer: 0, capability: "structure", difficulty: "A",
    rationale: "\"Die Verbesserung\" ist die reguläre Nominalisierung." }),
  mcq({ stem: "Nomen zu \"flexibel\":",
    options: ["die Flexibilität", "die Flexibelheit", "das Flexible nur"], answer: 0, capability: "structure", difficulty: "B",
    rationale: "Fremdwörter auf \"-bel\" bilden das Abstraktum meist mit \"-ilität\": \"die Flexibilität\"." }),
];

const VOCAB_SETS = [
  ["practice-vocabulary-1", "Gezielte Wortschatzübung 1 — Beruf & Register", VOCAB_1_ITEMS],
  ["practice-vocabulary-2", "Gezielte Wortschatzübung 2 — Kollokationen Verb+Nomen", VOCAB_2_ITEMS],
  ["practice-vocabulary-3", "Gezielte Wortschatzübung 3 — formell vs. umgangssprachlich", VOCAB_3_ITEMS],
  ["practice-vocabulary-4", "Gezielte Wortschatzübung 4 — abstrakte Nomen in Berichten", VOCAB_4_ITEMS],
  ["practice-vocabulary-5", "Gezielte Wortschatzübung 5 — Redewendungen im Berufsalltag", VOCAB_5_ITEMS],
  ["practice-vocabulary-6", "Gezielte Wortschatzübung 6 — falsche Freunde", VOCAB_6_ITEMS],
  ["practice-vocabulary-7", "Gezielte Wortschatzübung 7 — Antonyme & Präzisierung", VOCAB_7_ITEMS],
  ["practice-vocabulary-8", "Gezielte Wortschatzübung 8 — feste Verbindungen mit Präposition", VOCAB_8_ITEMS],
  ["practice-vocabulary-9", "Gezielte Wortschatzübung 9 — Wortbildung", VOCAB_9_ITEMS],
];

/* ══════════════════════════════════════════════════════════════════════
   READING — original passages, board='custom', never framed as exam
   simulation. Distinct topics/registers from the Goethe/telc Lesen sets in
   seed_exam_papers.js (no shared passage text).
   ══════════════════════════════════════════════════════════════════════ */

const READING_1 = {
  paper: {
    id: "practice-reading-1", board: "custom",
    title: "Leseverstehen — Zwischen zwei Kulturen",
    minutes: 15,
    source: "Skillcase, authored. General B2 reading practice — not tied to any specific exam board's format.",
    exam_version: "B2", alignment: "original",
  },
  section: {
    module: "lesen", title: "Zwischen zwei Kulturen",
    instruction: "Lesen Sie den Text und beantworten Sie die Aufgaben.",
    minutes: 15, skill: "reading", scoring_mode: "OBJECTIVE",
    passage: `Als ich vor vier Jahren aus Manila nach Deutschland kam, dachte ich, die größte Herausforderung würde die Sprache sein. Ich hatte recht — aber nicht so, wie ich es erwartet hatte. Die Grammatik konnte ich lernen, die Vokabeln büffeln. Was mir wirklich zu schaffen machte, war etwas, wofür es in keinem Lehrbuch eine Lektion gab: der Ton.

In den Philippinen sagt man selten direkt "Nein". Man sagt "Vielleicht", "Wir schauen mal" oder "Das könnte schwierig werden" — und jeder versteht, dass die Antwort eigentlich Nein bedeutet. Hier auf der Station lernte ich schnell, dass diese Höflichkeit oft als Unklarheit missverstanden wurde. Eine Kollegin fragte mich einmal frustriert: "Kannst du das jetzt machen oder nicht?" Ich hatte "Ich versuche es" gesagt und dabei eigentlich gemeint, dass es eng werden würde.

Inzwischen sage ich direkter, was ich meine. Nicht, weil ich meine Höflichkeit aufgegeben hätte, sondern weil ich verstanden habe, dass Direktheit hier nicht als unfreundlich gilt, sondern als Klarheit, die dem Team hilft. Umgekehrt musste sich auch mein Team daran gewöhnen, dass eine zurückhaltende Antwort von mir nicht automatisch Zustimmung bedeutet.

Was mir am meisten geholfen hat, war eine einzige Frage, die eine erfahrene Kollegin mir stellte, nachdem sie das Missverständnis bemerkt hatte: "Was genau meinst du, wenn du 'vielleicht' sagst?" Diese Frage — ohne Vorwurf, mit echtem Interesse — hat mehr für die Zusammenarbeit getan als jeder Sprachkurs.`,
    },
  items: [
    mcq({ stem: "Was war für die Autorin die größere Herausforderung als die deutsche Grammatik?",
      options: ["Vokabeln lernen", "den richtigen Ton/die richtige Direktheit zu treffen", "die Aussprache"],
      answer: 1, capability: "summarise", difficulty: "B",
      rationale: "\"Was mir wirklich zu schaffen machte, war … der Ton\" — nicht Grammatik oder Vokabeln." }),
    trueFalse({ stem: "In den Philippinen sagt man laut Text häufig direkt \"Nein\".",
      answer: false, capability: "summarise", difficulty: "A",
      rationale: "Der Text sagt das Gegenteil: \"man sagt selten direkt 'Nein'\"." }),
    mcq({ stem: "Wie reagierte die Kollegin auf die Aussage \"Ich versuche es\"?",
      options: ["Sie war frustriert und fragte direkt nach.", "Sie verstand die Höflichkeit sofort.", "Sie ignorierte die Aussage."],
      answer: 0, capability: "understand_speech", difficulty: "B",
      rationale: "\"Eine Kollegin fragte mich einmal frustriert: 'Kannst du das jetzt machen oder nicht?'\"" }),
    mcq({ stem: "Was hat die Autorin nach eigener Aussage NICHT aufgegeben, obwohl sie direkter geworden ist?",
      options: ["ihre Höflichkeit", "ihre Sprache", "ihre Zurückhaltung im Team"],
      answer: 0, capability: "language_awareness", difficulty: "B",
      rationale: "\"Nicht, weil ich meine Höflichkeit aufgegeben hätte …\"" }),
    mcq({ stem: "Welche Frage der Kollegin half der Autorin am meisten?",
      options: ["\"Was genau meinst du, wenn du 'vielleicht' sagst?\"", "\"Warum bist du so unklar?\"", "\"Kannst du das machen oder nicht?\""],
      answer: 0, capability: "ask_followup", difficulty: "B",
      rationale: "Die letzte, ohne Vorwurf gestellte Frage wird im Text explizit als die hilfreichste genannt." }),
  ],
};

const READING_2 = {
  paper: {
    id: "practice-reading-2", board: "custom",
    title: "Leseverstehen — Die vergessene Mittagspause",
    minutes: 15,
    source: "Skillcase, authored. General B2 reading practice — not tied to any specific exam board's format.",
    exam_version: "B2", alignment: "original",
  },
  section: {
    module: "lesen", title: "Die vergessene Mittagspause",
    instruction: "Lesen Sie den Text und beantworten Sie die Aufgaben.",
    minutes: 15, skill: "reading", scoring_mode: "OBJECTIVE",
    passage: `Eine interne Umfrage in drei Kliniken hat ein Ergebnis geliefert, das viele Führungskräfte überrascht hat: Über sechzig Prozent des Pflegepersonals gaben an, in den letzten vier Wochen mindestens einmal pro Woche keine reguläre Mittagspause gemacht zu haben. Als Gründe wurden vor allem Personalmangel und unvorhersehbare Notfälle genannt.

Auf den ersten Blick scheint das ein reines Personalproblem zu sein — mehr Personal würde mehr Pausen ermöglichen. Bei genauerem Hinsehen zeigt sich jedoch, dass es auch eine Frage der Organisation ist. In zwei der drei befragten Kliniken gab es keine feste Regelung, wer während einer Pause die Vertretung übernimmt. Die Verantwortung, sich selbst eine Vertretung zu organisieren, lag bei jeder einzelnen Pflegekraft — was in der Praxis oft dazu führte, dass die Pause einfach ausfiel, weil niemand fragen wollte.

Eine der Kliniken hatte hingegen ein einfaches System eingeführt: feste Pausenzeiten mit einer rotierenden Vertretungsliste, sichtbar für alle am Stationsplan. Der Krankenstand in dieser Klinik lag im Beobachtungszeitraum spürbar niedriger als in den anderen beiden. Ein kausaler Zusammenhang lässt sich aus einer einzelnen Umfrage nicht beweisen — aber die Fachleute, die die Studie begleitet haben, halten ihn für plausibel.

Die Autoren der Studie ziehen daraus einen vorsichtigen Schluss: Nicht jede Verbesserung der Arbeitsbedingungen kostet zusätzliches Personal. Manche kostet nur eine klare Regelung.`,
    },
  items: [
    mcq({ stem: "Was ergab die Umfrage laut Text?",
      options: ["Über 60% ließen mindestens einmal wöchentlich die Mittagspause aus.", "Alle Kliniken hatten genug Personal.", "Die Pausenregelung war überall gleich gut."],
      answer: 0, capability: "summarise", difficulty: "B",
      rationale: "\"Über sechzig Prozent … gaben an, … keine reguläre Mittagspause gemacht zu haben.\"" }),
    trueFalse({ stem: "In allen drei Kliniken gab es eine feste Regelung für die Vertretung während der Pause.",
      answer: false, capability: "summarise", difficulty: "A",
      rationale: "\"In zwei der drei befragten Kliniken gab es keine feste Regelung\" — also nicht in allen drei." }),
    mcq({ stem: "Was war in der Klinik mit dem niedrigeren Krankenstand anders organisiert?",
      options: ["feste Pausenzeiten mit rotierender Vertretungsliste", "mehr Personal als in den anderen Kliniken", "kürzere Schichten"],
      answer: 0, capability: "exemplify", difficulty: "B",
      rationale: "\"Eine der Kliniken hatte … ein einfaches System eingeführt: feste Pausenzeiten mit einer rotierenden Vertretungsliste.\"" }),
    mcq({ stem: "Wie vorsichtig formuliert der Text den Zusammenhang zwischen Pausenregelung und Krankenstand?",
      options: ["als plausibel, aber nicht bewiesen", "als eindeutig bewiesen", "als reinen Zufall"],
      answer: 0, capability: "language_awareness", difficulty: "C",
      rationale: "\"Ein kausaler Zusammenhang lässt sich … nicht beweisen — aber … halten ihn für plausibel.\"" }),
    mcq({ stem: "Welchen Schluss ziehen die Autoren der Studie am Ende?",
      options: ["Manche Verbesserungen kosten nur eine klare Regelung, kein zusätzliches Personal.", "Jede Verbesserung braucht mehr Personal.", "Pausenregelungen sind grundsätzlich unwichtig."],
      answer: 0, capability: "summarise", difficulty: "B",
      rationale: "\"Nicht jede Verbesserung … kostet zusätzliches Personal. Manche kostet nur eine klare Regelung.\"" }),
  ],
};

/* ══════════════════════════════════════════════════════════════════════
   WRITING — LONG_TEXT, rubric_id=8 (board='custom', module='schreiben',
   task_type='kurzantwort') — a shorter, non-exam-format writing task,
   genuinely distinct from Goethe's Forumsbeitrag / telc's halbformelle
   E-Mail (both of which stay in seed_exam_papers.js under their own board).
   ══════════════════════════════════════════════════════════════════════ */

const WRITING_1 = {
  paper: {
    id: "practice-writing-1", board: "custom",
    title: "Kurzantwort-Übung 1 — Stellung nehmen",
    minutes: 20,
    source: "Skillcase, authored. General B2 writing practice — not tied to any specific exam board's format.",
    exam_version: "B2", alignment: "original",
  },
  section: {
    module: "schreiben", title: "Kurzantwort",
    instruction: "Schreiben Sie einen kurzen, zusammenhängenden Text.",
    minutes: 20, skill: "writing", scoring_mode: "RUBRIC",
  },
  items: [
    longText({
      stem: "In Ihrem Team wird diskutiert, ob feste Pausenzeiten mit einer Vertretungsliste eingeführt werden sollen (siehe die Diskussion um Personalmangel und Pausenausfall). Nehmen Sie dazu kurz Stellung: Sind Sie dafür oder dagegen, und warum? Nennen Sie mindestens zwei Gründe.",
      min_words: 80, target_words: 100, rubric_id: 8, rubric_key: "kurzantwort", capability: "justify", difficulty: "B",
      guidance: ["Nennen Sie Ihre Position klar am Anfang.", "Geben Sie mindestens zwei Gründe.", "Nutzen Sie kausale Konnektoren (weil, da, deshalb)."],
    }),
  ],
};

const WRITING_2 = {
  paper: {
    id: "practice-writing-2", board: "custom",
    title: "Kurzantwort-Übung 2 — Vergleichen und abwägen",
    minutes: 20,
    source: "Skillcase, authored. General B2 writing practice — not tied to any specific exam board's format.",
    exam_version: "B2", alignment: "original",
  },
  section: {
    module: "schreiben", title: "Kurzantwort",
    instruction: "Schreiben Sie einen kurzen, zusammenhängenden Text.",
    minutes: 20, skill: "writing", scoring_mode: "RUBRIC",
  },
  items: [
    longText({
      stem: "Manche Kliniken bieten flexible Arbeitszeiten an, andere feste Schichtpläne. Vergleichen Sie kurz die Vor- und Nachteile beider Modelle und sagen Sie, welches Sie persönlich bevorzugen würden.",
      min_words: 90, target_words: 110, rubric_id: 8, rubric_key: "kurzantwort", capability: "compare", difficulty: "B",
      guidance: ["Nennen Sie je einen Vorteil und einen Nachteil pro Modell.", "Nutzen Sie Vergleichskonnektoren (einerseits … andererseits, im Gegensatz dazu).", "Formulieren Sie am Ende Ihre eigene Präferenz."],
    }),
  ],
};

/* ══════════════════════════════════════════════════════════════════════
   SPEAKING — SPOKEN_RESPONSE, TRANSCRIPT_ONLY. Captured, never scored, same
   honest framing as the Goethe/telc Sprechen practice — but these are
   Skillcase's own prompts, not modelled on a specific exam task format.
   ══════════════════════════════════════════════════════════════════════ */

const SPEAKING_1 = {
  paper: {
    id: "practice-speaking-1", board: "custom",
    title: "Sprechübung 1 — kurze Stellungnahmen",
    minutes: 12,
    source: "Skillcase, authored. General B2 speaking practice — not tied to any specific exam board's format. Not recorded, not scored.",
    exam_version: "B2", alignment: "original",
  },
  section: {
    module: "sprechen", title: "Kurze Stellungnahmen",
    instruction: "Bereiten Sie sich kurz vor und sprechen Sie frei.",
    minutes: 12, skill: "speaking", scoring_mode: "TRANSCRIPT_ONLY",
  },
  items: [
    spokenResponse({ stem: "Beschreiben Sie eine Situation aus Ihrem Berufsalltag, in der eine gute Kommunikation im Team einen Unterschied gemacht hat.",
      prep_seconds: 30, speak_seconds: 90, capability: "exemplify", difficulty: "B" }),
    spokenResponse({ stem: "Ein Kollege bittet Sie kurzfristig, eine zusätzliche Schicht zu übernehmen. Sagen Sie höflich, ob Sie zustimmen oder ablehnen, und begründen Sie Ihre Antwort.",
      prep_seconds: 30, speak_seconds: 90, capability: "justify", difficulty: "B" }),
    spokenResponse({ stem: "Erklären Sie in eigenen Worten, warum klare Rückfragen bei unklaren Anweisungen wichtig sind.",
      prep_seconds: 20, speak_seconds: 75, capability: "ask_followup", difficulty: "B" }),
  ],
};

/* ══════════════════════════════════════════════════════════════════════
   LISTENING — same transcript/items as before, now wired to a real audio
   clip. `audio_required`/`audio_intended_id` mirror core-2026b's own
   sections; tools/make_practice_audio.js cuts the file via Azure Neural TTS,
   registers it in b2_audio_assets, and sets `audio_asset_id`. Run it after
   seeding (or re-run --force after re-seeding, since the section row is
   replaced each time).
   ══════════════════════════════════════════════════════════════════════ */

const LISTENING_1 = {
  paper: {
    id: "practice-listening-1", board: "custom",
    title: "Hörverstehen — Team-Besprechung: Dienstplanänderung",
    minutes: 12,
    source: "Skillcase, original transcript. Audio: Azure Neural TTS (de-DE, 3 voices) — see tools/make_practice_audio.js.",
    exam_version: "B2", alignment: "original",
  },
  section: {
    module: "hoeren", title: "Team-Besprechung — Dienstplanänderung",
    instruction: "Hören Sie das Gespräch und beantworten Sie die Aufgaben.",
    minutes: 12, skill: "listening", scoring_mode: "OBJECTIVE",
    audio_required: true, audio_intended_id: "practice_listening_1_dienstplan",
    passage: `TRANSKRIPT:
STATIONSLEITUNG: Ich wollte kurz mit euch besprechen, dass wir ab nächster Woche den Dienstplan anpassen müssen. Zwei Kolleginnen sind länger krankgeschrieben.
PFLEGEKRAFT A: Heißt das, wir müssen mehr Nachtschichten übernehmen?
STATIONSLEITUNG: Nicht unbedingt mehr, aber wir verteilen sie anders. Ich schlage vor, dass wir eine rotierende Liste einführen, damit es nicht immer dieselben trifft.
PFLEGEKRAFT B: Das finde ich gut, aber können wir das schriftlich festhalten? Sonst wird am Ende doch wieder improvisiert.
STATIONSLEITUNG: Ja, gute Idee. Ich hänge die Liste ab Montag im Dienstzimmer aus.
PFLEGEKRAFT A: Und wenn jemand kurzfristig tauschen muss?
STATIONSLEITUNG: Dann bitte direkt mit mir absprechen, nicht nur untereinander — sonst habe ich keinen Überblick.`,
    turns: [
      { voice: "conrad", speaker: "Stationsleitung",
        text: "Ich wollte kurz mit euch besprechen, dass wir ab nächster Woche den Dienstplan anpassen müssen. Zwei Kolleginnen sind länger krankgeschrieben." },
      { voice: "mia", speaker: "Pflegekraft A",
        text: "Heißt das, wir müssen mehr Nachtschichten übernehmen?" },
      { voice: "conrad", speaker: "Stationsleitung",
        text: "Nicht unbedingt mehr, aber wir verteilen sie anders. Ich schlage vor, dass wir eine rotierende Liste einführen, damit es nicht immer dieselben trifft." },
      { voice: "katja", speaker: "Pflegekraft B",
        text: "Das finde ich gut, aber können wir das schriftlich festhalten? Sonst wird am Ende doch wieder improvisiert." },
      { voice: "conrad", speaker: "Stationsleitung",
        text: "Ja, gute Idee. Ich hänge die Liste ab Montag im Dienstzimmer aus." },
      { voice: "mia", speaker: "Pflegekraft A",
        text: "Und wenn jemand kurzfristig tauschen muss?" },
      { voice: "conrad", speaker: "Stationsleitung",
        text: "Dann bitte direkt mit mir absprechen, nicht nur untereinander — sonst habe ich keinen Überblick." },
    ],
  },
  items: [
    mcq({ stem: "Warum muss der Dienstplan angepasst werden?",
      options: ["Zwei Kolleginnen sind länger krankgeschrieben.", "Es gibt zu viele Bewerbungen.", "Die Station wird geschlossen."],
      answer: 0, capability: "understand_speech", difficulty: "B",
      rationale: "\"Zwei Kolleginnen sind länger krankgeschrieben.\"" }),
    trueFalse({ stem: "Die Stationsleitung schlägt vor, dass es ab jetzt deutlich mehr Nachtschichten für alle gibt.",
      answer: false, capability: "understand_speech", difficulty: "B",
      rationale: "\"Nicht unbedingt mehr, aber wir verteilen sie anders.\"" }),
    mcq({ stem: "Was fordert Pflegekraft B zusätzlich zur rotierenden Liste?",
      options: ["dass die Regelung schriftlich festgehalten wird", "dass es mehr Personal gibt", "dass die Nachtschichten abgeschafft werden"],
      answer: 0, capability: "ask_followup", difficulty: "B",
      rationale: "\"Können wir das schriftlich festhalten?\"" }),
    mcq({ stem: "Was soll passieren, wenn jemand kurzfristig tauschen muss?",
      options: ["direkt mit der Stationsleitung absprechen", "einfach untereinander regeln", "gar nicht mehr tauschen"],
      answer: 0, capability: "understand_speech", difficulty: "B",
      rationale: "\"Dann bitte direkt mit mir absprechen, nicht nur untereinander.\"" }),
  ],
};

async function main() {
  console.log("Seeding practice bank (Grammar/Vocabulary/Reading/Writing/Speaking — not exam-board content)…");

  for (const [id, title, items] of GRAMMAR_SETS) {
    await seedPaper({
      paper: { id, board: "custom", title, minutes: Math.max(10, Math.round(items.length)),
        source: "Skillcase, authored. General B2 grammar practice — not tied to any specific exam board's format.",
        exam_version: "B2", alignment: "original" },
      section: { module: "sprachbausteine", title: "Grammatik — gemischte Strukturen",
        instruction: "Wählen Sie die richtige Form.", minutes: Math.max(10, Math.round(items.length)),
        passage: null, skill: "grammar", scoring_mode: "OBJECTIVE" },
      items,
    });
  }
  for (const [id, title, items] of VOCAB_SETS) {
    await seedPaper({
      paper: { id, board: "custom", title, minutes: Math.max(10, Math.round(items.length)),
        source: "Skillcase, authored. General B2 vocabulary/register practice — not tied to any specific exam board's format.",
        exam_version: "B2", alignment: "original" },
      section: { module: "sprachbausteine", title: "Wortschatz",
        instruction: "Wählen Sie die richtige Bedeutung oder die passende Formulierung.", minutes: Math.max(10, Math.round(items.length)),
        passage: null, skill: "vocabulary", scoring_mode: "OBJECTIVE" },
      items,
    });
  }

  await seedPaper(READING_1);
  await seedPaper(READING_2);
  await seedPaper(WRITING_1);
  await seedPaper(WRITING_2);
  await seedPaper(SPEAKING_1);
  await seedPaper(LISTENING_1);

  await pool.end();
  console.log("Done.");
}

module.exports = { LISTENING_1 };

if (require.main === module) {
  main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
}
