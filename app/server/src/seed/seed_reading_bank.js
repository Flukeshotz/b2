/**
 * SEED — Reading practice depth pass. board='custom', alignment='original'.
 *
 *   node src/seed/seed_reading_bank.js [--force]
 *
 * Adds 28 new standalone Reading experiences on top of the 2 already seeded
 * by seed_practice_bank.js (practice-reading-1/2), for 30 total — this file
 * owns practice-reading-3 through practice-reading-30 so the two seeders
 * never fight over an id. Same b2_papers/b2_paper_sections/b2_paper_items
 * model, same content_model.js validators, same seedPaper()/buildItemRow()
 * plumbing (now shared via practice_seed_lib.js so this file and
 * seed_writing_bank.js don't fork a second copy of it).
 *
 * FORMAT VARIETY: opinion article, forum discussion, workplace memo,
 * email/thread, informational article, interview, announcement, advice
 * column, short report, multiple-viewpoints, public notice, professional
 * communication — each appears at least twice. Every passage and topic here
 * is new; none reuses a title or situation already seeded by
 * seed_exam_papers.js (Goethe/telc board), src/seed/b2/core2026b/*.js (the
 * diagnostic), or practice-reading-1/2.
 *
 * CAPABILITY MAPPING: only capabilities whose `experiences` array in
 * src/b2/capabilities.js actually includes "reading" are used here — argue,
 * justify, concede, compare, speculate, exemplify, structure, adapt_register,
 * summarise. `understand_speech` (listening-only) and `ask_followup`
 * (spoken-interaction-only) are deliberately never used for a reading item,
 * per capabilities.js's own experiences declarations.
 *
 * QUESTION VARIETY: MCQ and TRUE_FALSE throughout, plus MATCHING (matching a
 * statement to its author/paragraph) and ORDERING (reconstructing an
 * argument's sequence) on a subset of papers, exercising the item types
 * content_model.js and assessment_content.js's grade() already support but
 * seed_practice_bank.js had never used.
 *
 * DIFFICULTY: A/B/C genuinely reflect lexical density, inference demand and
 * distractor subtlety — not a round-robin label. Straightforward stated-fact
 * lookups are A; paraphrase/inference is B; subtle distractors, dense
 * argument structure or Konjunktiv-laden hedging are C.
 */
require("../env")();
const { mcq, trueFalse, multiSelect, matching, ordering, seedPaper } = require("./practice_seed_lib");

function readingPaper(id, title, sectionTitle, passage, items, { minutes = 15 } = {}) {
  return {
    paper: {
      id, board: "custom", title, minutes,
      source: "Skillcase, authored. General B2 reading practice — not tied to any specific exam board's format.",
      exam_version: "B2", alignment: "original",
    },
    section: {
      module: "lesen", title: sectionTitle,
      instruction: "Lesen Sie den Text und beantworten Sie die Aufgaben.",
      minutes, skill: "reading", scoring_mode: "OBJECTIVE", passage,
    },
    items,
  };
}

/* ══════════════════════════════════════════════════════════════════════
   1 — OPINION ARTICLE — Vier-Tage-Woche
   ══════════════════════════════════════════════════════════════════════ */
const READING_3 = readingPaper("practice-reading-3", "Leseverstehen — Die Vier-Tage-Woche: mutig oder naiv?",
  "Die Vier-Tage-Woche: mutig oder naiv?",
  `Seit ein mittelständisches Softwareunternehmen aus Leipzig letztes Jahr auf eine Vier-Tage-Woche bei vollem Lohnausgleich umgestellt hat, wird in den Medien wieder heftig diskutiert, ob dieses Modell tatsächlich zukunftsfähig ist oder ob es sich nur ein paar Branchen leisten können.

Befürworter verweisen auf die Zahlen des Leipziger Unternehmens: Die Fehlzeiten sanken um ein Drittel, die Fluktuation nahm spürbar ab, und überraschenderweise blieb die Produktivität nahezu unverändert — die Mitarbeitenden arbeiteten an vier Tagen konzentrierter, statt an fünf Tagen mit Leerlauf. Für Befürworter ist das der Beweis, dass Arbeitszeit und Ergebnis längst nicht mehr proportional zusammenhängen.

Kritiker halten dagegen, dass sich dieses Ergebnis kaum auf andere Branchen übertragen lässt. In der Pflege, im Einzelhandel oder in der Produktion, wo physische Anwesenheit zu bestimmten Zeiten zwingend nötig ist, lässt sich verlorene Zeit nicht einfach durch höhere Konzentration wettmachen. Ein Krankenhaus kann nicht vier Tage lang doppelt so schnell pflegen, um am fünften Tag zu schließen.

Am Ende, so resümiert eine Wirtschaftsforscherin, werde die Vier-Tage-Woche wohl kein Modell für alle, sondern ein Werkzeug für Branchen, in denen Ergebnis und Anwesenheit tatsächlich entkoppelt werden können.`,
  [
    mcq({ stem: "Was war laut Text das überraschende Ergebnis beim Leipziger Unternehmen?", options: ["Die Produktivität blieb trotz weniger Arbeitstage fast gleich.", "Die Löhne mussten gesenkt werden.", "Die Fluktuation stieg stark an."], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"überraschenderweise blieb die Produktivität nahezu unverändert\"." }),
    trueFalse({ stem: "Laut Text lässt sich das Leipziger Ergebnis problemlos auf die Pflege übertragen.", answer: false, capability: "summarise", difficulty: "A", rationale: "Kritiker: \"kaum auf andere Branchen übertragen\", explizit am Beispiel Pflege." }),
    mcq({ stem: "Welches Argument nutzen die Kritiker konkret gegen die Übertragbarkeit?", options: ["Physische Anwesenheit ist in manchen Berufen zeitlich zwingend.", "Die Mitarbeitenden wollen keine kürzere Woche.", "Die Löhne sind in anderen Branchen zu niedrig."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"wo physische Anwesenheit zu bestimmten Zeiten zwingend nötig ist\"." }),
    mcq({ stem: "Wie fasst die Wirtschaftsforscherin die Debatte am Ende zusammen?", options: ["Es wird kein Modell für alle, sondern für Branchen mit entkoppeltem Ergebnis und Anwesenheit.", "Die Vier-Tage-Woche wird sich überall durchsetzen.", "Das Modell wird komplett scheitern."], answer: 0, capability: "summarise", difficulty: "B", rationale: "Der letzte Satz formuliert genau diese differenzierte Schlussfolgerung." }),
    mcq({ stem: "Was bedeutet im Text die Formulierung \"Ergebnis und Anwesenheit entkoppeln\"?", options: ["Das Ergebnis hängt nicht mehr direkt von der Anwesenheitszeit ab.", "Mitarbeitende müssen öfter anwesend sein.", "Das Ergebnis wird nicht mehr gemessen."], answer: 0, capability: "language_awareness", difficulty: "C", rationale: "Der Begriff fasst zusammen, dass in manchen Branchen weniger Zeit dasselbe Ergebnis liefern kann — anders als etwa in der Pflege." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   2 — FORUM DISCUSSION — Praktika: sinnvoll oder ausgenutzt?
   ══════════════════════════════════════════════════════════════════════ */
const READING_4 = readingPaper("practice-reading-4", "Leseverstehen — Forum: Praktika — Erfahrung oder Ausnutzung?",
  "Forum: Praktika — Erfahrung oder Ausnutzung?",
  `TAMARA_K: Ich habe letztes Jahr ein sechsmonatiges Praktikum gemacht und ehrlich gesagt mehr gelernt als in zwei Semestern Studium. Klar, bezahlt war es kaum, aber ich habe echte Aufgaben bekommen, nicht nur Kaffee gekocht.

FELIX88: Das klingt nach Glück, Tamara. Bei mir war es das Gegenteil: sechs Monate Praktikum, am Ende hat die Firma jemand anderen mit fertigem Abschluss eingestellt, und ich stand wieder bei null. Für die Firma war ich einfach billige Arbeitskraft auf Zeit.

TAMARA_K: Das tut mir leid zu hören. Ich glaube, es hängt wirklich stark davon ab, ob die Firma das Praktikum als Investition in eine mögliche Einstellung sieht oder nur als Lückenfüller.

MOD_SUSANNE: Interessanter Punkt. Eine Studie der Handelskammer von letztem Jahr zeigt genau das: Firmen, die Praktikanten von Anfang an in echte Projekte einbinden, übernehmen sie später doppelt so häufig fest wie Firmen, die sie nur für Zuarbeit nutzen.

FELIX88: Dann sollte man sich als Bewerber wohl genauer erkundigen, WAS man im Praktikum eigentlich machen wird, bevor man zusagt — nicht nur, ob es überhaupt eines gibt.`,
  [
    mcq({ stem: "Wie beschreibt Tamara ihre eigene Praktikumserfahrung?", options: ["Sie hat echte Aufgaben übernommen und viel gelernt.", "Sie musste nur Kaffee kochen.", "Sie wurde danach sofort fest angestellt."], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"ich habe echte Aufgaben bekommen, nicht nur Kaffee gekocht\"." }),
    trueFalse({ stem: "Felix wurde nach seinem Praktikum von der Firma fest eingestellt.", answer: false, capability: "summarise", difficulty: "A", rationale: "\"die Firma [hat] jemand anderen mit fertigem Abschluss eingestellt\"." }),
    mcq({ stem: "Was zeigt die von MOD_SUSANNE zitierte Studie?", options: ["Firmen mit echter Projekteinbindung übernehmen Praktikanten häufiger fest.", "Praktika werden generell schlechter bezahlt als früher.", "Die meisten Praktikanten kündigen selbst."], answer: 0, capability: "exemplify", difficulty: "B", rationale: "\"übernehmen sie später doppelt so häufig fest\"." }),
    mcq({ stem: "Worin sind sich Tamara und Felix am Ende einig?", options: ["Es kommt darauf an, wie die Firma das Praktikum konkret gestaltet.", "Praktika sind grundsätzlich nutzlos.", "Man sollte nie ein unbezahltes Praktikum machen."], answer: 0, capability: "concede", difficulty: "B", rationale: "Tamara benennt die Abhängigkeit von der Firmenhaltung, Felix zieht daraus die praktische Konsequenz — beide nähern sich an." }),
    mcq({ stem: "Welchen praktischen Rat leitet Felix am Ende aus der Diskussion ab?", options: ["Vor der Zusage genau erfragen, welche Aufgaben man bekommt.", "Nur Praktika bei großen Firmen machen.", "Praktika grundsätzlich ablehnen."], answer: 0, capability: "structure", difficulty: "B", rationale: "\"sollte man sich … genauer erkundigen, WAS man im Praktikum eigentlich machen wird\"." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   3 — WORKPLACE MEMO — Neue Kantinenregelung
   ══════════════════════════════════════════════════════════════════════ */
const READING_5 = readingPaper("practice-reading-5", "Leseverstehen — Hausmitteilung: Neue Kantinenregelung",
  "Hausmitteilung: Neue Kantinenregelung",
  `An alle Mitarbeiterinnen und Mitarbeiter

Ab dem 1. des kommenden Monats gilt in der Kantine eine neue Zeitregelung. Grund dafür ist die wiederkehrende Überlastung zur Hauptessenszeit zwischen 12:15 und 12:45 Uhr, die in den letzten Monaten zu Wartezeiten von bis zu 25 Minuten geführt hat.

Künftig sind die Mittagspausen nach Abteilungen gestaffelt: Verwaltung und IT nehmen ihre Pause zwischen 11:45 und 12:30 Uhr, Produktion und Logistik zwischen 12:30 und 13:15 Uhr. Wer aus dienstlichen Gründen von dieser Regelung abweichen muss, meldet sich bitte vorab bei der jeweiligen Abteilungsleitung.

Die Kantine selbst bleibt weiterhin von 11:30 bis 14:00 Uhr geöffnet. Das Angebot an vegetarischen und veganen Gerichten wird ab sofort täglich um mindestens eine Option erweitert, nachdem die interne Umfrage vom Frühjahr einen entsprechenden Wunsch von über 40 Prozent der Belegschaft ergeben hatte.

Wir bitten um Verständnis für die Umstellung und freuen uns über Rückmeldungen an die Personalabteilung.`,
  [
    mcq({ stem: "Warum wird die neue Zeitregelung eingeführt?", options: ["Wegen zu langer Wartezeiten zur Hauptessenszeit.", "Weil die Kantine geschlossen werden soll.", "Weil zu wenig Personal in der Kantine arbeitet."], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"wiederkehrende Überlastung … die … zu Wartezeiten von bis zu 25 Minuten geführt hat\"." }),
    trueFalse({ stem: "Verwaltung und IT haben laut Mitteilung dieselbe Pausenzeit wie Produktion und Logistik.", answer: false, capability: "summarise", difficulty: "A", rationale: "Die Zeiten sind gestaffelt: 11:45–12:30 vs. 12:30–13:15." }),
    mcq({ stem: "Was muss jemand tun, der aus dienstlichen Gründen von der Regelung abweichen muss?", options: ["Sich vorab bei der Abteilungsleitung melden.", "Einfach zur gewünschten Zeit essen gehen.", "Einen Antrag bei der Kantine stellen."], answer: 0, capability: "structure", difficulty: "B", rationale: "\"meldet sich bitte vorab bei der jeweiligen Abteilungsleitung\"." }),
    mcq({ stem: "Woher kommt die Entscheidung, das vegetarische/vegane Angebot zu erweitern?", options: ["Aus einer internen Umfrage vom Frühjahr.", "Aus einer gesetzlichen Vorschrift.", "Aus einem Vorschlag der Kantinenleitung."], answer: 0, capability: "exemplify", difficulty: "B", rationale: "\"nachdem die interne Umfrage vom Frühjahr einen entsprechenden Wunsch … ergeben hatte\"." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   4 — EMAIL/THREAD — Rückfrage zur Gehaltsabrechnung
   ══════════════════════════════════════════════════════════════════════ */
const READING_6 = readingPaper("practice-reading-6", "Leseverstehen — E-Mail-Wechsel: Rückfrage zur Gehaltsabrechnung",
  "E-Mail-Wechsel: Rückfrage zur Gehaltsabrechnung",
  `Von: b.ahrens@firma-extern.de
An: personal@klinikverbund.de
Betreff: Rückfrage zur Abrechnung März

Guten Tag,

bei der Durchsicht meiner Märzabrechnung ist mir aufgefallen, dass die Zuschläge für die drei Nachtschichten in der letzten Woche nicht ausgewiesen sind. Laut meinem Dienstplan habe ich am 24., 25. und 28. März Nachtdienst gehabt. Können Sie das bitte prüfen und mir mitteilen, ob es sich um einen Erfassungsfehler handelt oder ob die Zuschläge erst mit der Aprilabrechnung nachgezahlt werden?

Mit freundlichen Grüßen
B. Ahrens

---

Von: personal@klinikverbund.de
An: b.ahrens@firma-extern.de
Betreff: AW: Rückfrage zur Abrechnung März

Guten Tag Frau Ahrens,

vielen Dank für den Hinweis. Wir haben den Fall geprüft: Es handelt sich tatsächlich um einen Erfassungsfehler in unserem System — die Schichten vom 24. und 25. wurden korrekt als Nachtdienst verbucht, die vom 28. jedoch versehentlich als regulärer Spätdienst. Die Korrektur ist bereits veranlasst und wird mit der Aprilabrechnung nachgeholt, zusammen mit einer kurzfristigen Ausgleichszahlung für die verzögerte Auszahlung.

Bei weiteren Fragen stehen wir gerne zur Verfügung.

Freundliche Grüße
Personalabteilung`,
  [
    mcq({ stem: "Worum bittet Frau Ahrens in ihrer E-Mail?", options: ["Um Prüfung fehlender Nachtschicht-Zuschläge.", "Um eine Gehaltserhöhung.", "Um Änderung ihres Dienstplans."], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"die Zuschläge … sind nicht ausgewiesen … Können Sie das bitte prüfen\"." }),
    trueFalse({ stem: "Laut Antwort war die Schicht vom 24. März korrekt verbucht.", answer: true, capability: "summarise", difficulty: "A", rationale: "\"die Schichten vom 24. und 25. wurden korrekt als Nachtdienst verbucht\"." }),
    mcq({ stem: "Was war laut Personalabteilung bei der Schicht vom 28. März falsch?", options: ["Sie wurde versehentlich als regulärer Spätdienst verbucht.", "Sie wurde gar nicht erfasst.", "Sie wurde doppelt bezahlt."], answer: 0, capability: "exemplify", difficulty: "B", rationale: "\"die vom 28. jedoch versehentlich als regulärer Spätdienst\"." }),
    mcq({ stem: "Was bietet die Personalabteilung zusätzlich zur Korrektur an?", options: ["Eine kurzfristige Ausgleichszahlung für die Verzögerung.", "Einen zusätzlichen freien Tag.", "Eine schriftliche Entschuldigung per Post."], answer: 0, capability: "exemplify", difficulty: "B", rationale: "\"zusammen mit einer kurzfristigen Ausgleichszahlung für die verzögerte Auszahlung\"." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   5 — INFORMATIONAL ARTICLE — Fachkräftemangel in der Pflege
   ══════════════════════════════════════════════════════════════════════ */
const READING_7 = readingPaper("practice-reading-7", "Leseverstehen — Fachkräftemangel: Zahlen hinter der Debatte",
  "Fachkräftemangel: Zahlen hinter der Debatte",
  `Der Begriff "Fachkräftemangel in der Pflege" ist in den letzten Jahren so oft benutzt worden, dass er fast wie eine feststehende Redewendung klingt. Doch was steckt tatsächlich dahinter, wenn man die Zahlen genauer betrachtet?

Laut aktuellen Erhebungen fehlen bundesweit rund 35.000 Vollzeitstellen in der Alten- und Krankenpflege. Interessant ist dabei, dass die Zahl der ausgebildeten Pflegekräfte insgesamt nicht sinkt — im Gegenteil, sie steigt sogar leicht. Das eigentliche Problem liegt woanders: Immer mehr ausgebildete Pflegekräfte arbeiten in Teilzeit oder verlassen den Beruf nach wenigen Jahren wieder, weil die Arbeitsbedingungen als belastend empfunden werden.

Eine Befragung unter Berufsaussteigerinnen und -aussteigern nennt drei Hauptgründe: chronische Unterbesetzung im Schichtdienst, fehlende Aufstiegsmöglichkeiten und mangelnde Wertschätzung im Vergleich zur Verantwortung, die der Beruf mit sich bringt. Bemerkenswert ist, dass der Verdienst in dieser Befragung nicht an erster Stelle genannt wird — was viele Debattenbeiträge in den Medien anders darstellen.

Das legt nahe, dass Maßnahmen, die sich allein auf höhere Löhne konzentrieren, das eigentliche Problem nur teilweise lösen würden.`,
  [
    mcq({ stem: "Was zeigen die Zahlen laut Text bezüglich der Anzahl ausgebildeter Pflegekräfte?", options: ["Sie sinkt nicht, sondern steigt leicht.", "Sie ist stark gesunken.", "Sie ist seit Jahren unverändert."], answer: 0, capability: "summarise", difficulty: "B", rationale: "\"die Zahl der ausgebildeten Pflegekräfte insgesamt nicht sinkt — im Gegenteil, sie steigt sogar leicht\"." }),
    trueFalse({ stem: "Laut der zitierten Befragung ist der Verdienst der wichtigste Grund für den Berufsausstieg.", answer: false, capability: "summarise", difficulty: "B", rationale: "\"der Verdienst … wird nicht an erster Stelle genannt\"." }),
    multiSelect({ stem: "Welche zwei Gründe nennt die Befragung unter den drei Hauptgründen für den Berufsausstieg?", options: ["chronische Unterbesetzung im Schichtdienst", "zu hohe Studiengebühren", "fehlende Aufstiegsmöglichkeiten", "zu lange Anfahrtswege"], correct: [0, 2], capability: "exemplify", difficulty: "B", rationale: "Der Text nennt explizit Unterbesetzung, fehlende Aufstiegsmöglichkeiten und mangelnde Wertschätzung." }),
    mcq({ stem: "Welche Schlussfolgerung zieht der Text aus diesen Ergebnissen?", options: ["Höhere Löhne allein würden das Problem nur teilweise lösen.", "Höhere Löhne würden das Problem vollständig lösen.", "Löhne spielen für das Problem keine Rolle."], answer: 0, capability: "argue", difficulty: "C", rationale: "\"Maßnahmen, die sich allein auf höhere Löhne konzentrieren, [würden] das eigentliche Problem nur teilweise lösen\"." }),
    mcq({ stem: "Wie positioniert sich der Text zur öffentlichen Mediendarstellung des Themas?", options: ["Er stellt sie implizit infrage, indem er andere Ursachen in den Vordergrund rückt.", "Er bestätigt sie vollständig.", "Er erwähnt sie gar nicht."], answer: 0, capability: "language_awareness", difficulty: "C", rationale: "\"was viele Debattenbeiträge in den Medien anders darstellen\" — eine deutliche, aber implizite Distanzierung." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   6 — INTERVIEW — Quereinstieg in die IT
   ══════════════════════════════════════════════════════════════════════ */
const READING_8 = readingPaper("practice-reading-8", "Leseverstehen — Interview: Quereinstieg in die IT mit 42",
  "Interview: Quereinstieg in die IT mit 42",
  `REDAKTION: Sie haben mit 42 Jahren Ihre Ausbildung als Bankkauffrau aufgegeben und sind in die IT-Branche gewechselt. Was hat den Ausschlag gegeben?

FRAU MORAWEK: Ehrlich gesagt war es keine spontane Entscheidung, sondern ein schleichender Prozess. Ich habe in der Bank zunehmend gemerkt, dass mich genau die Prozesse interessierten, die im Hintergrund liefen — also die Software, nicht das Kundengespräch. Irgendwann habe ich abends angefangen, online Programmierkurse zu machen, erst aus Neugier, dann immer ernsthafter.

REDAKTION: War der Umstieg schwierig?

FRAU MORAWEK: Fachlich ja, menschlich noch mehr. Ich saß plötzlich in Kursen mit 22-Jährigen, die drei Jahre Informatikstudium hinter sich hatten, und ich mit meinen Excel-Kenntnissen. Am Anfang habe ich mich oft gefragt, ob ich zu alt für den Neuanfang bin.

REDAKTION: Und heute?

FRAU MORAWEK: Heute sehe ich es umgekehrt: Meine zwanzig Berufsjahre waren kein Nachteil, sondern ein Vorteil. Ich verstehe, wie ein Unternehmen tickt, wie man mit Kunden kommuniziert, wie man unter Druck ruhig bleibt. Das bringt kein Bootcamp bei. Jüngeren würde ich sagen: Unterschätzt nicht, was ihr aus einem ganz anderen Berufsleben mitbringt.`,
  [
    mcq({ stem: "Wie beschreibt Frau Morawek ihre Entscheidung zum Berufswechsel?", options: ["Als schleichenden Prozess, nicht als spontane Entscheidung.", "Als spontanen, plötzlichen Entschluss.", "Als Entscheidung, die ihr aufgezwungen wurde."], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"keine spontane Entscheidung, sondern ein schleichender Prozess\"." }),
    trueFalse({ stem: "Frau Morawek fand den Umstieg nur fachlich, nicht aber menschlich schwierig.", answer: false, capability: "summarise", difficulty: "A", rationale: "\"Fachlich ja, menschlich noch mehr.\"" }),
    mcq({ stem: "Was sieht Frau Morawek heute als Vorteil ihres Quereinstiegs?", options: ["Ihre bisherige Berufserfahrung mit Kunden und Druck.", "Ihre technischen Programmierkenntnisse von Anfang an.", "Ihr jüngeres Alter im Vergleich zu Kollegen."], answer: 0, capability: "argue", difficulty: "B", rationale: "\"Meine zwanzig Berufsjahre waren kein Nachteil, sondern ein Vorteil.\"" }),
    mcq({ stem: "Welchen Rat gibt Frau Morawek jüngeren Quereinsteigern?", options: ["Nicht unterschätzen, was man aus einem anderen Berufsleben mitbringt.", "Erst ein vollständiges Studium abschließen.", "Sich nicht mit jüngeren Kollegen vergleichen."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"Unterschätzt nicht, was ihr aus einem ganz anderen Berufsleben mitbringt.\"" }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   7 — ANNOUNCEMENT — Betriebsversammlung
   ══════════════════════════════════════════════════════════════════════ */
const READING_9 = readingPaper("practice-reading-9", "Leseverstehen — Ankündigung: Außerordentliche Betriebsversammlung",
  "Ankündigung: Außerordentliche Betriebsversammlung",
  `Ankündigung

Aufgrund der anstehenden Umstrukturierung der Logistikabteilung lädt die Geschäftsführung gemeinsam mit dem Betriebsrat zu einer außerordentlichen Betriebsversammlung ein.

Termin: Donnerstag, 14 Uhr, Kantine (Haupthaus)
Dauer: voraussichtlich 90 Minuten

Auf der Tagesordnung stehen:
1. Information über die geplante Zusammenlegung der Standorte Nord und Ost
2. Zeitplan der Umstrukturierung
3. Fragen und Antworten mit der Geschäftsführung

Alle Mitarbeitenden der Logistikabteilung sind zur Teilnahme eingeladen; die Anwesenheit ist freigestellt, wird aber ausdrücklich empfohlen, da keine gesonderte Information im Nachgang erfolgen wird. Für Mitarbeitende im Schichtdienst, die zum Termin nicht abkömmlich sind, wird im Anschluss ein schriftliches Protokoll im Intranet veröffentlicht.

Der Betriebsrat weist darauf hin, dass Fragen auch vorab schriftlich eingereicht werden können, um in der Versammlung sicher berücksichtigt zu werden.`,
  [
    mcq({ stem: "Warum wird die außerordentliche Betriebsversammlung einberufen?", options: ["Wegen der geplanten Umstrukturierung der Logistikabteilung.", "Wegen einer Gehaltserhöhung.", "Wegen des Umzugs des Haupthauses."], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"Aufgrund der anstehenden Umstrukturierung der Logistikabteilung\"." }),
    trueFalse({ stem: "Die Teilnahme an der Versammlung ist für alle Mitarbeitenden der Logistikabteilung verpflichtend.", answer: false, capability: "summarise", difficulty: "A", rationale: "\"die Anwesenheit ist freigestellt, wird aber ausdrücklich empfohlen\"." }),
    mcq({ stem: "Was passiert für Mitarbeitende im Schichtdienst, die nicht teilnehmen können?", options: ["Ein schriftliches Protokoll wird im Intranet veröffentlicht.", "Sie erhalten eine persönliche Nachbesprechung.", "Die Versammlung wird für sie wiederholt."], answer: 0, capability: "structure", difficulty: "B", rationale: "\"wird im Anschluss ein schriftliches Protokoll im Intranet veröffentlicht\"." }),
    mcq({ stem: "Wie können Mitarbeitende sicherstellen, dass ihre Frage in der Versammlung behandelt wird?", options: ["Sie vorab schriftlich einreichen.", "Sie erst während der Versammlung laut stellen.", "Sie per Telefon an den Betriebsrat richten."], answer: 0, capability: "structure", difficulty: "B", rationale: "\"Fragen auch vorab schriftlich eingereicht werden können, um … sicher berücksichtigt zu werden\"." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   8 — ADVICE COLUMN — Umgang mit schwierigen Kollegen
   ══════════════════════════════════════════════════════════════════════ */
const READING_10 = readingPaper("practice-reading-10", "Leseverstehen — Ratgeber: Wenn ein Kollege ständig widerspricht",
  "Ratgeber: Wenn ein Kollege ständig widerspricht",
  `LESERFRAGE: Ich arbeite seit einem Jahr mit einem Kollegen zusammen, der in Besprechungen fast jeden meiner Vorschläge kritisiert — meistens, ohne selbst eine Alternative zu nennen. Ich bin es leid, mich ständig rechtfertigen zu müssen. Was kann ich tun?

ANTWORT DER RATGEBERIN: Zunächst: Sie sind mit diesem Muster nicht allein, und es lohnt sich, zwischen zwei möglichen Ursachen zu unterscheiden. Manche Menschen widersprechen aus echter fachlicher Sorge — dann hilft es, gezielt nachzufragen, WAS genau sie stört, statt sich zu verteidigen. Andere widersprechen aus Gewohnheit oder um sich zu positionieren, unabhängig vom Inhalt. Das erkennen Sie oft daran, dass die Kritik unspezifisch bleibt, selbst wenn Sie nachhaken.

Für den zweiten Fall empfehle ich eine einfache Technik: Bitten Sie den Kollegen aktiv um einen konkreten Gegenvorschlag, bevor die Besprechung weitergeht — zum Beispiel mit "Was würdest du stattdessen vorschlagen?" Das verschiebt die Verantwortung vom reinen Kritisieren zum konstruktiven Beitrag, und in vielen Fällen wird der Widerspruch dadurch deutlich seltener, weil er plötzlich Substanz liefern muss.

Wichtig ist dabei: Bleiben Sie sachlich und vermeiden Sie es, das Verhalten öffentlich vor dem Team zu kommentieren — das verhärtet die Fronten meist nur weiter.`,
  [
    mcq({ stem: "Was ist laut Ratgeberin der erste Schritt, um die zwei möglichen Ursachen zu unterscheiden?", options: ["Gezielt nachfragen, was genau den Kollegen stört.", "Den Kollegen ignorieren.", "Sich sofort beim Vorgesetzten beschweren."], answer: 0, capability: "structure", difficulty: "B", rationale: "\"dann hilft es, gezielt nachzufragen, WAS genau sie stört\"." }),
    trueFalse({ stem: "Laut Ratgeberin bleibt die Kritik bei Widerspruch aus Gewohnheit meist unspezifisch, auch wenn man nachfragt.", answer: true, capability: "summarise", difficulty: "B", rationale: "\"Das erkennen Sie oft daran, dass die Kritik unspezifisch bleibt, selbst wenn Sie nachhaken.\"" }),
    mcq({ stem: "Welche konkrete Technik empfiehlt die Ratgeberin?", options: ["Aktiv um einen konkreten Gegenvorschlag bitten.", "Den Kollegen vor dem Team kritisieren.", "Alle Vorschläge des Kollegen automatisch ablehnen."], answer: 0, capability: "speculate", difficulty: "B", rationale: "\"Bitten Sie den Kollegen aktiv um einen konkreten Gegenvorschlag\"." }),
    mcq({ stem: "Warum rät die Ratgeberin davon ab, das Verhalten öffentlich vor dem Team zu kommentieren?", options: ["Weil das die Situation meist nur verhärtet.", "Weil das gegen die Firmenregeln verstößt.", "Weil der Kollege das nicht bemerken würde."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"das verhärtet die Fronten meist nur weiter\"." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   9 — SHORT REPORT — Mitarbeiterbefragung zu Fortbildungen
   ══════════════════════════════════════════════════════════════════════ */
const READING_11 = readingPaper("practice-reading-11", "Leseverstehen — Kurzbericht: Auswertung der Fortbildungsumfrage",
  "Kurzbericht: Auswertung der Fortbildungsumfrage",
  `Im März wurde unter allen Mitarbeitenden eine anonyme Umfrage zum internen Fortbildungsangebot durchgeführt. Die Rücklaufquote lag bei 68 Prozent, was als aussagekräftig gilt.

Zentrale Ergebnisse: 72 Prozent der Befragten gaben an, dass sie sich mehr fachspezifische Fortbildungen wünschen, insbesondere im Bereich digitaler Werkzeuge. Nur 31 Prozent nutzten im vergangenen Jahr tatsächlich ein Fortbildungsangebot — als Hauptgrund für die Nichtteilnahme wurde mit 54 Prozent "zeitliche Überlastung im Arbeitsalltag" genannt, deutlich vor "fehlendem Interesse" mit 9 Prozent.

Bemerkenswert ist der Unterschied zwischen Abteilungen: In der Verwaltung nahmen 46 Prozent der Mitarbeitenden mindestens eine Fortbildung wahr, in der Produktion waren es nur 18 Prozent. Ein möglicher Grund liegt in der Schichtplanung, die in der Produktion kaum Spielraum für Fortbildungstage lässt.

Die Personalabteilung empfiehlt auf Basis dieser Ergebnisse, Fortbildungen künftig stärker in die reguläre Arbeitszeit zu integrieren, statt sie als zusätzliches, freiwilliges Angebot außerhalb der Schicht zu behandeln.`,
  [
    mcq({ stem: "Wie hoch war die Rücklaufquote der Umfrage?", options: ["68 Prozent", "72 Prozent", "31 Prozent"], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"Die Rücklaufquote lag bei 68 Prozent\"." }),
    trueFalse({ stem: "Der häufigste genannte Grund für Nichtteilnahme an Fortbildungen war fehlendes Interesse.", answer: false, capability: "summarise", difficulty: "A", rationale: "Hauptgrund war \"zeitliche Überlastung\" (54%), nicht \"fehlendes Interesse\" (9%)." }),
    mcq({ stem: "Welchen Unterschied zeigt der Bericht zwischen Verwaltung und Produktion?", options: ["In der Verwaltung nahmen deutlich mehr Mitarbeitende Fortbildungen wahr.", "In der Produktion gab es mehr Fortbildungsangebote.", "Es gab keinen nennenswerten Unterschied."], answer: 0, capability: "compare", difficulty: "B", rationale: "46% (Verwaltung) gegenüber 18% (Produktion)." }),
    mcq({ stem: "Welche Erklärung nennt der Bericht für diesen Abteilungsunterschied?", options: ["Die Schichtplanung lässt in der Produktion kaum Spielraum für Fortbildungstage.", "Die Produktion hat generell weniger Interesse an Weiterbildung.", "Es gibt in der Produktion keine passenden Angebote."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"Ein möglicher Grund liegt in der Schichtplanung, die … kaum Spielraum … lässt.\"" }),
    mcq({ stem: "Was empfiehlt die Personalabteilung als Konsequenz?", options: ["Fortbildungen stärker in die reguläre Arbeitszeit integrieren.", "Das Fortbildungsangebot komplett streichen.", "Nur noch freiwillige Fortbildungen außerhalb der Schicht anbieten."], answer: 0, capability: "structure", difficulty: "C", rationale: "\"empfiehlt … Fortbildungen künftig stärker in die reguläre Arbeitszeit zu integrieren\"." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   10 — MULTIPLE VIEWPOINTS — Handys im Meeting
   ══════════════════════════════════════════════════════════════════════ */
const READING_12 = readingPaper("practice-reading-12", "Leseverstehen — Zwei Stimmen: Sollten Handys in Meetings verboten werden?",
  "Zwei Stimmen: Sollten Handys in Meetings verboten werden?",
  `STIMME 1 — TEAMLEITERIN: Ich habe vor drei Monaten ein Handyverbot für unsere wöchentlichen Meetings eingeführt, und der Unterschied ist deutlich spürbar. Vorher haben ständig Leute nebenbei E-Mails gecheckt, Diskussionen mussten wiederholt werden, weil jemand nicht zugehört hatte. Jetzt dauern unsere Meetings zwar im Schnitt zehn Minuten länger, aber wir müssen fast nichts mehr wiederholen — unterm Strich sparen wir Zeit.

STIMME 2 — TEAMMITGLIED: Ich verstehe das Anliegen, aber ich finde das Verbot zu pauschal. Manchmal muss ich während eines Meetings kurz auf eine dringende Nachricht eines Kunden reagieren — das kostet mich fünf Sekunden, kein Verbot ändert daran etwas, außer dass ich mich jetzt schlecht fühle, wenn ich draufschaue. Ein sinnvollerer Weg wäre, klare Ausnahmen zu definieren, statt ein absolutes Verbot durchzusetzen.

STIMME 1: Das Argument mit dringenden Kundennachrichten verstehe ich, aber genau solche "Ausnahmen" waren vorher das Problem — jeder hielt seine eigene Nachricht für dringend genug. Ich bin offen für eine klar definierte Ausnahme, etwa für die Rufbereitschaft, aber nicht für ein System, das auf Selbsteinschätzung beruht.`,
  [
    mcq({ stem: "Welche Erfahrung berichtet die Teamleiterin seit dem Handyverbot?", options: ["Die Meetings dauern zwar länger, aber es muss weniger wiederholt werden.", "Die Meetings sind viel kürzer geworden.", "Die Mitarbeitenden sind seither unzufriedener."], answer: 0, capability: "summarise", difficulty: "B", rationale: "\"dauern … zehn Minuten länger, aber wir müssen fast nichts mehr wiederholen\"." }),
    trueFalse({ stem: "Das Teammitglied lehnt das Handyverbot vollständig ab und möchte es abschaffen.", answer: false, capability: "concede", difficulty: "B", rationale: "Es versteht das Anliegen, kritisiert nur die Pauschalität und schlägt Ausnahmen vor — keine vollständige Ablehnung." }),
    mcq({ stem: "Was schlägt das Teammitglied als Alternative zum absoluten Verbot vor?", options: ["Klare, definierte Ausnahmen statt eines pauschalen Verbots.", "Ein noch strengeres Verbot mit Strafen.", "Die komplette Abschaffung von Meetings."], answer: 0, capability: "speculate", difficulty: "B", rationale: "\"Ein sinnvollerer Weg wäre, klare Ausnahmen zu definieren\"." }),
    mcq({ stem: "Wie reagiert die Teamleiterin auf den Vorschlag des Teammitglieds?", options: ["Sie räumt das Argument teilweise ein, bleibt aber bei einer klar begrenzten statt einer selbst eingeschätzten Ausnahme.", "Sie lehnt jede Ausnahme kategorisch ab.", "Sie stimmt dem Vorschlag vollständig ohne Einschränkung zu."], answer: 0, capability: "concede", difficulty: "C", rationale: "\"Ich bin offen für eine klar definierte Ausnahme … aber nicht für ein System, das auf Selbsteinschätzung beruht.\"" }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   11 — PUBLIC NOTICE — Baustelle und Zufahrtsänderung
   ══════════════════════════════════════════════════════════════════════ */
const READING_13 = readingPaper("practice-reading-13", "Leseverstehen — Aushang: Zufahrtsänderung wegen Bauarbeiten",
  "Aushang: Zufahrtsänderung wegen Bauarbeiten",
  `WICHTIGER HINWEIS FÜR ALLE BESCHÄFTIGTEN UND BESUCHER

Ab kommendem Montag beginnen die angekündigten Bauarbeiten am Haupteingang. Für die Dauer der Baumaßnahme (voraussichtlich sechs Wochen) gilt Folgendes:

• Die Hauptzufahrt über die Bahnhofstraße ist gesperrt.
• Die Einfahrt erfolgt ausschließlich über den Seiteneingang an der Werkstraße.
• Der bisherige Besucherparkplatz entfällt vorübergehend; Ausweichparkplätze stehen auf dem Gelände der benachbarten Spedition zur Verfügung (Zufahrt über Werkstraße 12).
• Mitarbeitende mit Fahrrad nutzen weiterhin den gewohnten Zugang über den Hinterhof.

Wir bitten alle Beschäftigten, mit zusätzlichen 10 bis 15 Minuten Fahrzeit einzuplanen, insbesondere in den ersten Tagen der Umstellung. Lieferungen für die Warenannahme sind ab Montag ausschließlich zwischen 7 und 9 Uhr über die Werkstraße möglich; abweichende Lieferzeiten sind vorab mit dem Facility Management abzustimmen.

Bei Fragen wenden Sie sich an das Facility Management, Durchwahl -420.`,
  [
    mcq({ stem: "Wie lange sollen die Bauarbeiten voraussichtlich dauern?", options: ["Sechs Wochen", "Sechs Monate", "Sechs Tage"], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"voraussichtlich sechs Wochen\"." }),
    trueFalse({ stem: "Der bisherige Besucherparkplatz bleibt während der Bauarbeiten normal nutzbar.", answer: false, capability: "summarise", difficulty: "A", rationale: "\"Der bisherige Besucherparkplatz entfällt vorübergehend\"." }),
    mcq({ stem: "Über welchen Zugang gelangen Mitarbeitende mit dem Fahrrad weiterhin zum Gelände?", options: ["Über den gewohnten Zugang am Hinterhof.", "Über die Werkstraße wie Lieferfahrzeuge.", "Über den Parkplatz der Spedition."], answer: 0, capability: "structure", difficulty: "B", rationale: "\"Mitarbeitende mit Fahrrad nutzen weiterhin den gewohnten Zugang über den Hinterhof.\"" }),
    mcq({ stem: "Was muss bei Lieferungen außerhalb der Zeiten 7–9 Uhr beachtet werden?", options: ["Sie müssen vorab mit dem Facility Management abgestimmt werden.", "Sie sind grundsätzlich nicht mehr möglich.", "Sie erfolgen automatisch über den Seiteneingang."], answer: 0, capability: "structure", difficulty: "B", rationale: "\"abweichende Lieferzeiten sind vorab mit dem Facility Management abzustimmen\"." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   12 — PROFESSIONAL COMMUNICATION — Projektstatus-Update
   ══════════════════════════════════════════════════════════════════════ */
const READING_14 = readingPaper("practice-reading-14", "Leseverstehen — Projektstatus-Update per E-Mail",
  "Projektstatus-Update per E-Mail",
  `Betreff: Statusupdate Projekt "Digitale Patientenakte" — KW 14

Liebes Projektteam,

kurzer Zwischenstand vor unserem Termin am Freitag: Die Migration der Bestandsdaten aus dem alten System ist zu 85 Prozent abgeschlossen und liegt damit leicht vor Plan. Die verbleibenden 15 Prozent betreffen vor allem Altdaten aus den Jahren vor 2015, deren Formatierung manuell nachbearbeitet werden muss.

Ein Problem hat sich beim Datenabgleich mit der Abrechnungssoftware gezeigt: Etwa 200 Patientendatensätze weisen widersprüchliche Versicherungsnummern auf. Bevor wir hier automatisch bereinigen, möchten wir das gemeinsam mit dem Abrechnungsteam klären, da eine falsche automatische Korrektur später zu Abrechnungsfehlern führen könnte.

Der ursprüngliche Zeitplan für den Go-Live bleibt aus heutiger Sicht realistisch, sofern die Klärung mit dem Abrechnungsteam bis Ende nächster Woche erfolgt. Sollte sich das verzögern, müssten wir den Go-Live um zwei bis drei Wochen verschieben.

Bitte bringt am Freitag eure aktuellen Testergebnisse aus der zweiten Testphase mit — das erleichtert die Priorisierung der letzten offenen Punkte erheblich.

Viele Grüße
Projektleitung`,
  [
    mcq({ stem: "Wie weit ist die Migration der Bestandsdaten laut Update fortgeschritten?", options: ["85 Prozent, leicht vor Plan.", "50 Prozent, im Plan.", "100 Prozent, abgeschlossen."], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"zu 85 Prozent abgeschlossen und liegt damit leicht vor Plan\"." }),
    trueFalse({ stem: "Die widersprüchlichen Versicherungsnummern sollen automatisch bereinigt werden, ohne Rücksprache mit dem Abrechnungsteam.", answer: false, capability: "summarise", difficulty: "B", rationale: "\"Bevor wir hier automatisch bereinigen, möchten wir das gemeinsam mit dem Abrechnungsteam klären.\"" }),
    mcq({ stem: "Warum wird bei den widersprüchlichen Versicherungsnummern nicht sofort automatisch korrigiert?", options: ["Weil eine falsche Korrektur später zu Abrechnungsfehlern führen könnte.", "Weil das technisch nicht möglich ist.", "Weil das Abrechnungsteam das Projekt ablehnt."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"da eine falsche automatische Korrektur später zu Abrechnungsfehlern führen könnte\"." }),
    mcq({ stem: "Unter welcher Bedingung bleibt der ursprüngliche Go-Live-Zeitplan realistisch?", options: ["Wenn die Klärung mit dem Abrechnungsteam bis Ende nächster Woche erfolgt.", "Wenn die Migration zu 100 Prozent sofort abgeschlossen wird.", "Wenn das Projektteam am Freitag nicht zusammenkommt."], answer: 0, capability: "structure", difficulty: "C", rationale: "\"sofern die Klärung mit dem Abrechnungsteam bis Ende nächster Woche erfolgt\"." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   13 — OPINION ARTICLE (2nd) — Duzen im Büro
   ══════════════════════════════════════════════════════════════════════ */
const READING_15 = readingPaper("practice-reading-15", "Leseverstehen — Sollte das Duzen im Büro zur Pflicht werden?",
  "Sollte das Duzen im Büro zur Pflicht werden?",
  `Immer mehr Unternehmen führen eine unternehmensweite Duz-Kultur ein — nicht als Angebot, sondern als verbindliche Regel für alle, vom Praktikanten bis zur Geschäftsführung. Befürworter sehen darin ein Signal für flache Hierarchien und offene Kommunikation. Kritiker warnen, dass eine erzwungene Nähe genau das Gegenteil bewirken kann.

Ein Argument der Befürworter lautet: Das Sie schafft künstliche Distanz, die in modernen, projektbasierten Teams eher hinderlich als hilfreich ist. Wer seinen Vorgesetzten duzt, so die Annahme, traut sich eher, Kritik zu äußern oder eigene Ideen einzubringen.

Diese Annahme ist allerdings nicht unumstritten. Eine Befragung unter Angestellten mehrerer Branchen ergab, dass sich fast ein Drittel der Befragten mit einer erzwungenen Duz-Regel unwohl fühlte — insbesondere ältere Mitarbeitende und solche aus Kulturkreisen, in denen die Anrede stärker mit Respekt verknüpft ist. Für sie fühlte sich das verordnete Duzen nicht wie Nähe an, sondern wie ein Verlust an professioneller Distanz, die sie bewusst schätzten.

Am Ende bleibt die Frage, ob eine Unternehmenskultur überhaupt per Anrede verordnet werden kann — oder ob echte Offenheit sich eher an dem zeigt, WIE miteinander gesprochen wird, nicht WOMIT man sich anspricht.`,
  [
    mcq({ stem: "Was ist laut Text das Hauptargument der Befürworter einer verbindlichen Duz-Kultur?", options: ["Das Sie schafft künstliche Distanz, die die Kommunikation erschwert.", "Das Duzen ist gesetzlich vorgeschrieben.", "Das Duzen spart Zeit in E-Mails."], answer: 0, capability: "argue", difficulty: "B", rationale: "\"Das Sie schafft künstliche Distanz, die … eher hinderlich als hilfreich ist.\"" }),
    trueFalse({ stem: "Laut der zitierten Befragung fühlten sich alle Befragten mit einer erzwungenen Duz-Regel wohl.", answer: false, capability: "summarise", difficulty: "A", rationale: "\"fast ein Drittel der Befragten [fühlte] sich … unwohl\"." }),
    mcq({ stem: "Wer fühlte sich laut Befragung besonders unwohl mit der verordneten Duz-Regel?", options: ["Insbesondere ältere Mitarbeitende und Personen aus bestimmten Kulturkreisen.", "Ausschließlich jüngere Mitarbeitende.", "Nur Mitarbeitende in Führungspositionen."], answer: 0, capability: "exemplify", difficulty: "B", rationale: "\"insbesondere ältere Mitarbeitende und solche aus Kulturkreisen, in denen die Anrede stärker mit Respekt verknüpft ist\"." }),
    mcq({ stem: "Welche abschließende Frage wirft der Text auf?", options: ["Ob eine Unternehmenskultur überhaupt per Anrede verordnet werden kann.", "Ob das Duzen gesetzlich verboten werden sollte.", "Ob ältere Mitarbeitende generell gekündigt werden sollten."], answer: 0, capability: "speculate", difficulty: "C", rationale: "Der Schlusssatz stellt genau diese offene Frage, ohne sie zu beantworten." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   14 — FORUM DISCUSSION (2nd) — Diensthandy
   ══════════════════════════════════════════════════════════════════════ */
const READING_16 = readingPaper("practice-reading-16", "Leseverstehen — Forum: Lohnt sich ein Diensthandy wirklich?",
  "Forum: Lohnt sich ein Diensthandy wirklich?",
  `JONAS_R: Meine Firma bietet jetzt ein Diensthandy an, aber ich zögere. Bedeutet das nicht, dass ich auch abends und am Wochenende erreichbar sein muss?

NADINE_W: Kommt total auf die Firmenkultur an. Bei uns gibt es ein Diensthandy, aber eine klare Regel: nach 18 Uhr wird nicht erwartet, dass man antwortet. Für mich ist es super praktisch — ich muss mein privates Handy nicht für berufliche Apps nutzen.

JONAS_R: Klingt gut, aber gilt diese Regel bei euch auch wirklich in der Praxis, oder nur auf dem Papier?

NADINE_W: Ehrlich gesagt: größtenteils schon. Es gab am Anfang zwei, drei Fälle, wo ein Teamleiter trotzdem spätabends geschrieben hat, aber das wurde intern angesprochen und hat sich seitdem erledigt.

TOM_B: Bei uns ist es leider anders — offiziell heißt es auch "keine Erwartung nach Feierabend", aber wer nicht innerhalb von einer Stunde antwortet, bekommt am nächsten Tag komische Blicke. Das Diensthandy ist bei uns eher ein Fluch als ein Segen.

NADINE_W: Das zeigt wohl: Die Technik selbst ist neutral. Entscheidend ist, ob die Firma die eigene Regel auch tatsächlich lebt.`,
  [
    mcq({ stem: "Welche Sorge äußert Jonas zu Beginn?", options: ["Dass ein Diensthandy ständige Erreichbarkeit bedeuten könnte.", "Dass ein Diensthandy zu teuer ist.", "Dass er kein Diensthandy bekommt."], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"Bedeutet das nicht, dass ich auch abends und am Wochenende erreichbar sein muss?\"" }),
    trueFalse({ stem: "Bei Toms Firma wird informell erwartet, dass man auch nach Feierabend schnell reagiert.", answer: true, capability: "summarise", difficulty: "B", rationale: "\"wer nicht innerhalb von einer Stunde antwortet, bekommt am nächsten Tag komische Blicke\"." }),
    mcq({ stem: "Wie unterscheiden sich Nadines und Toms Erfahrungen trotz ähnlicher offizieller Regeln?", options: ["Bei Nadine wird die Regel weitgehend eingehalten, bei Tom nur auf dem Papier.", "Nadine hat gar keine Regel, Tom schon.", "Beide haben identische Erfahrungen gemacht."], answer: 0, capability: "compare", difficulty: "B", rationale: "Nadine: \"größtenteils schon\" eingehalten; Tom: \"eher ein Fluch als ein Segen\" trotz gleicher offizieller Regel." }),
    mcq({ stem: "Welche Schlussfolgerung zieht Nadine am Ende der Diskussion?", options: ["Entscheidend ist, ob die Firma ihre eigene Regel tatsächlich lebt.", "Diensthandys sollten grundsätzlich abgeschafft werden.", "Nur junge Mitarbeitende sollten ein Diensthandy bekommen."], answer: 0, capability: "argue", difficulty: "C", rationale: "\"Entscheidend ist, ob die Firma die eigene Regel auch tatsächlich lebt.\"" }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   15 — WORKPLACE MEMO (2nd) — Neue Hygienevorschriften
   ══════════════════════════════════════════════════════════════════════ */
const READING_17 = readingPaper("practice-reading-17", "Leseverstehen — Dienstanweisung: Aktualisierte Hygienevorschriften",
  "Dienstanweisung: Aktualisierte Hygienevorschriften",
  `An alle Mitarbeitenden der Stationen 2 und 3

Im Rahmen der jährlichen Überprüfung wurden die Hygienevorschriften an zwei Punkten angepasst. Die Änderungen treten ab sofort in Kraft.

Erstens: Die Händedesinfektion vor UND nach jedem Patientenkontakt bleibt unverändert Pflicht, wird künftig aber zusätzlich vor dem Betreten des Medikamentenraums verlangt, auch wenn dort kein direkter Patientenkontakt stattfindet. Grund ist ein interner Vorfall, bei dem eine Kontamination auf diesem Weg nicht ausgeschlossen werden konnte.

Zweitens: Einweghandschuhe dürfen künftig nicht mehr für mehrere aufeinanderfolgende Tätigkeiten am selben Patienten verwendet werden, selbst wenn keine sichtbare Verschmutzung vorliegt. Zwischen unterschiedlichen Tätigkeiten — etwa Wundversorgung und anschließender Medikamentengabe — ist grundsätzlich ein Handschuhwechsel mit vorheriger Händedesinfektion vorzunehmen.

Diese Anpassungen wurden mit der Hygienebeauftragten abgestimmt und sind ab dem heutigen Datum verbindlich. Schulungen zur praktischen Umsetzung finden in den kommenden zwei Wochen stationsintern statt; Termine werden über die Stationsleitung bekanntgegeben.`,
  [
    mcq({ stem: "Was ist der Grund für die neue Regel zur Händedesinfektion vor dem Medikamentenraum?", options: ["Ein interner Vorfall, bei dem eine Kontamination nicht ausgeschlossen werden konnte.", "Eine neue gesetzliche Vorschrift von außen.", "Eine allgemeine Erhöhung der Patientenzahlen."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"Grund ist ein interner Vorfall, bei dem eine Kontamination auf diesem Weg nicht ausgeschlossen werden konnte.\"" }),
    trueFalse({ stem: "Einweghandschuhe dürfen laut neuer Regel für mehrere Tätigkeiten am selben Patienten weiterverwendet werden, solange keine Verschmutzung sichtbar ist.", answer: false, capability: "summarise", difficulty: "A", rationale: "\"dürfen künftig nicht mehr … verwendet werden, selbst wenn keine sichtbare Verschmutzung vorliegt\"." }),
    mcq({ stem: "Was muss laut Text zwischen Wundversorgung und Medikamentengabe geschehen?", options: ["Ein Handschuhwechsel mit vorheriger Händedesinfektion.", "Eine schriftliche Dokumentation beider Tätigkeiten.", "Eine Rücksprache mit der Stationsleitung."], answer: 0, capability: "structure", difficulty: "B", rationale: "\"ist grundsätzlich ein Handschuhwechsel mit vorheriger Händedesinfektion vorzunehmen\"." }),
    mcq({ stem: "Wie werden die Mitarbeitenden über die praktische Umsetzung informiert?", options: ["Über Schulungen, deren Termine die Stationsleitung bekanntgibt.", "Über eine verpflichtende Online-Prüfung.", "Gar nicht, die Regel gilt ohne weitere Erklärung."], answer: 0, capability: "structure", difficulty: "B", rationale: "\"Schulungen … finden … statt; Termine werden über die Stationsleitung bekanntgegeben.\"" }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   16 — EMAIL/THREAD (2nd) — Terminverschiebung mit Kunde
   ══════════════════════════════════════════════════════════════════════ */
const READING_18 = readingPaper("practice-reading-18", "Leseverstehen — E-Mail-Wechsel: Terminverschiebung mit einem Kunden",
  "E-Mail-Wechsel: Terminverschiebung mit einem Kunden",
  `Von: r.demirci@baupartner-nord.de
An: projekte@handwerk-alsen.de
Betreff: Bitte um Terminverschiebung — Bauabnahme

Sehr geehrte Damen und Herren,

der für kommenden Mittwoch vereinbarte Termin zur Bauabnahme muss leider von unserer Seite verschoben werden, da der zuständige Statiker kurzfristig erkrankt ist und wir die Abnahme nicht ohne ihn durchführen möchten. Könnten wir stattdessen auf Freitag derselben Woche ausweichen, idealerweise zur gleichen Uhrzeit?

Für die entstandenen Umstände möchten wir uns bereits jetzt entschuldigen.

Mit freundlichen Grüßen
R. Demirci

---

Von: projekte@handwerk-alsen.de
An: r.demirci@baupartner-nord.de
Betreff: AW: Bitte um Terminverschiebung — Bauabnahme

Sehr geehrter Herr Demirci,

vielen Dank für die frühzeitige Information. Freitag zur gleichen Uhrzeit ist bei uns grundsätzlich möglich, allerdings ist unser Projektleiter an diesem Tag bereits ab 15 Uhr bei einem anderen Termin gebunden. Wir schlagen daher 9 Uhr statt der ursprünglichen 14 Uhr vor.

Bitte bestätigen Sie uns kurz, ob dieser neue Zeitpunkt für Sie und den Statiker machbar ist, damit wir den Termin verbindlich eintragen können.

Mit freundlichen Grüßen
Handwerk Alsen GmbH`,
  [
    mcq({ stem: "Warum bittet Herr Demirci um eine Terminverschiebung?", options: ["Weil der zuständige Statiker kurzfristig erkrankt ist.", "Weil die Baustelle noch nicht fertig ist.", "Weil er selbst im Urlaub ist."], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"da der zuständige Statiker kurzfristig erkrankt ist\"." }),
    trueFalse({ stem: "Die Firma Handwerk Alsen lehnt den vorgeschlagenen Freitagstermin komplett ab.", answer: false, capability: "summarise", difficulty: "A", rationale: "\"Freitag zur gleichen Uhrzeit ist bei uns grundsätzlich möglich\" — nur die Uhrzeit wird geändert." }),
    mcq({ stem: "Warum schlägt Handwerk Alsen eine andere Uhrzeit als ursprünglich vor?", options: ["Der Projektleiter ist ab 15 Uhr bei einem anderen Termin gebunden.", "Das Büro ist am Freitagnachmittag geschlossen.", "Der Statiker kann erst am Nachmittag."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"ist unser Projektleiter an diesem Tag bereits ab 15 Uhr bei einem anderen Termin gebunden\"." }),
    mcq({ stem: "Was wird von Herrn Demirci am Ende der zweiten E-Mail erwartet?", options: ["Eine Bestätigung, ob 9 Uhr für ihn und den Statiker machbar ist.", "Eine schriftliche Entschuldigung für die Verschiebung.", "Eine neue vollständige Terminanfrage."], answer: 0, capability: "structure", difficulty: "B", rationale: "\"Bitte bestätigen Sie uns kurz, ob dieser neue Zeitpunkt … machbar ist.\"" }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   17 — INFORMATIONAL ARTICLE (2nd) — Elektromobilität im Fuhrpark
   ══════════════════════════════════════════════════════════════════════ */
const READING_19 = readingPaper("practice-reading-19", "Leseverstehen — Elektromobilität im Firmenfuhrpark: eine nüchterne Bilanz",
  "Elektromobilität im Firmenfuhrpark: eine nüchterne Bilanz",
  `Vor zwei Jahren stellte ein mittelständischer Logistikdienstleister die Hälfte seines Fuhrparks auf Elektrofahrzeuge um. Die erste Zwischenbilanz fällt gemischt aus.

Positiv: Die Wartungskosten sanken um etwa 30 Prozent, da Elektromotoren deutlich weniger verschleißanfällige Bauteile besitzen als Verbrennungsmotoren. Auch die Fahrer äußerten sich überwiegend positiv über den ruhigeren, vibrationsärmeren Fahrbetrieb.

Negativ schlägt vor allem die Reichweite zu Buche: Auf längeren Routen, insbesondere im ländlichen Raum mit dünnem Ladenetz, mussten Fahrer wiederholt ungeplante Ladepausen einlegen, die den Zeitplan durcheinanderbrachten. In drei dokumentierten Fällen führte dies zu verspäteten Lieferungen, was in der Kundenzufriedenheit messbar spürbar war.

Das Unternehmen zieht daraus keinen grundsätzlichen Schluss gegen Elektromobilität, sondern eine differenzierte Konsequenz: Elektrofahrzeuge werden künftig gezielt für Kurzstrecken im städtischen Raum eingesetzt, während Langstrecken vorerst weiterhin mit Verbrennungsfahrzeugen bedient werden. Eine vollständige Umstellung, so die Geschäftsführung, sei erst sinnvoll, wenn sich die Ladeinfrastruktur auf dem Land deutlich verbessert habe.`,
  [
    mcq({ stem: "Was war laut Text ein positiver Effekt der Umstellung auf Elektrofahrzeuge?", options: ["Die Wartungskosten sanken um etwa 30 Prozent.", "Die Lieferzeiten verkürzten sich generell.", "Die Anschaffungskosten sanken deutlich."], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"Die Wartungskosten sanken um etwa 30 Prozent\"." }),
    trueFalse({ stem: "Laut Text traten die Reichweitenprobleme vor allem auf kurzen Strecken in der Stadt auf.", answer: false, capability: "summarise", difficulty: "B", rationale: "Die Probleme traten \"auf längeren Routen, insbesondere im ländlichen Raum\" auf." }),
    mcq({ stem: "Welche Konsequenz zieht das Unternehmen aus den gemischten Erfahrungen?", options: ["Elektrofahrzeuge gezielt für Kurzstrecken einsetzen, Langstrecken weiter mit Verbrennern bedienen.", "Vollständige Rückkehr zu Verbrennungsfahrzeugen.", "Sofortige vollständige Umstellung auf Elektrofahrzeuge."], answer: 0, capability: "compare", difficulty: "C", rationale: "\"eine differenzierte Konsequenz: … künftig gezielt für Kurzstrecken … während Langstrecken vorerst weiterhin mit Verbrennungsfahrzeugen bedient werden\"." }),
    mcq({ stem: "Unter welcher Bedingung hält die Geschäftsführung eine vollständige Umstellung für sinnvoll?", options: ["Wenn sich die Ladeinfrastruktur auf dem Land deutlich verbessert.", "Wenn die Anschaffungspreise weiter sinken.", "Wenn alle Fahrer damit einverstanden sind."], answer: 0, capability: "speculate", difficulty: "C", rationale: "\"sei erst sinnvoll, wenn sich die Ladeinfrastruktur auf dem Land deutlich verbessert habe\"." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   18 — INTERVIEW (2nd, with ORDERING item) — Mentoring-Programm
   ══════════════════════════════════════════════════════════════════════ */
const READING_20 = readingPaper("practice-reading-20", "Leseverstehen — Interview: Ein Jahr im betrieblichen Mentoring-Programm",
  "Interview: Ein Jahr im betrieblichen Mentoring-Programm",
  `REDAKTION: Sie nehmen seit einem Jahr am Mentoring-Programm teil, zunächst als Mentee. Wie kam der Kontakt zustande?

HERR OKONKWO: Zunächst musste ich mich für das Programm bewerben und ein kurzes Gespräch mit der Personalentwicklung führen, in dem meine Ziele besprochen wurden. Danach hat man mich mit einer Mentorin aus einer anderen Abteilung zusammengebracht — das war mir wichtig, weil ich einen Blick von außen auf mein Team wollte. Anschließend trafen wir uns die ersten Monate wöchentlich, dann alle zwei Wochen, sobald sich eine gewisse Routine eingespielt hatte.

REDAKTION: Was hat Ihnen das Programm konkret gebracht?

HERR OKONKWO: Vor allem eine ehrliche, aber wohlwollende Außenperspektive. Meine Mentorin hat mir zum Beispiel gezeigt, dass ich in Besprechungen oft zu schnell nachgab, wenn jemand widersprach — ein blinder Fleck, den mir sonst niemand so direkt gesagt hätte.

REDAKTION: Würden Sie das Programm weiterempfehlen?

HERR OKONKWO: Auf jeden Fall, allerdings nur, wenn man bereit ist, auch unbequemes Feedback anzunehmen. Wer nur Bestätigung sucht, ist beim Mentoring an der falschen Adresse.`,
  [
    mcq({ stem: "Warum war es Herrn Okonkwo wichtig, eine Mentorin aus einer anderen Abteilung zu bekommen?", options: ["Weil er einen Blick von außen auf sein Team wollte.", "Weil es in seiner eigenen Abteilung keine Mentorin gab.", "Weil das Programm das so vorschreibt."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"das war mir wichtig, weil ich einen Blick von außen auf mein Team wollte\"." }),
    trueFalse({ stem: "Die Treffen fanden das ganze Jahr über wöchentlich statt.", answer: false, capability: "summarise", difficulty: "A", rationale: "\"die ersten Monate wöchentlich, dann alle zwei Wochen\" — die Frequenz änderte sich." }),
    ordering({
      stem: "Bringen Sie die Schritte, wie der Mentoring-Kontakt laut Herrn Okonkwo zustande kam, in die richtige Reihenfolge.",
      items: ["Gespräch mit der Personalentwicklung über die eigenen Ziele", "Zusammenbringen mit einer Mentorin aus einer anderen Abteilung", "Wöchentliche Treffen in den ersten Monaten", "Übergang zu Treffen alle zwei Wochen"],
      order: [0, 1, 2, 3], capability: "structure", difficulty: "B",
      rationale: "Der Text nennt die Schritte in genau dieser Reihenfolge: Bewerbung/Gespräch → Zuordnung → wöchentliche Treffen → zweiwöchige Treffen." }),
    mcq({ stem: "Unter welcher Bedingung empfiehlt Herr Okonkwo das Programm weiter?", options: ["Nur, wenn man bereit ist, auch unbequemes Feedback anzunehmen.", "Nur für Mitarbeitende in Führungspositionen.", "Nur, wenn man bereits Erfahrung mit Mentoring hat."], answer: 0, capability: "concede", difficulty: "B", rationale: "\"allerdings nur, wenn man bereit ist, auch unbequemes Feedback anzunehmen\"." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   19 — ANNOUNCEMENT (2nd) — Internes Weiterbildungsangebot
   ══════════════════════════════════════════════════════════════════════ */
const READING_21 = readingPaper("practice-reading-21", "Leseverstehen — Ankündigung: Neues internes Weiterbildungsangebot",
  "Ankündigung: Neues internes Weiterbildungsangebot",
  `Liebe Kolleginnen und Kollegen,

ab dem kommenden Quartal starten wir ein neues internes Weiterbildungsprogramm mit dem Titel "Skills für morgen". Anlass ist die interne Umfrage vom Frühjahr, in der sich eine deutliche Mehrheit mehr fachspezifische Angebote gewünscht hatte.

Das Programm umfasst zunächst drei Module: digitale Grundkompetenzen, Projektmanagement und interkulturelle Kommunikation. Jedes Modul besteht aus zwei ganztägigen Präsenzterminen sowie begleitenden Online-Einheiten, die flexibel bearbeitet werden können.

Die Teilnahme erfolgt auf freiwilliger Basis, wird jedoch als reguläre Arbeitszeit angerechnet — es entsteht also kein Nachteil durch die Teilnahme. Die Plätze sind pro Modul auf 15 Personen begrenzt; bei Überbuchung entscheidet die Reihenfolge der Anmeldung.

Anmeldungen sind ab sofort über das interne Fortbildungsportal möglich. Rückfragen richten Sie bitte an die Personalentwicklung.`,
  [
    mcq({ stem: "Was war der Auslöser für das neue Weiterbildungsprogramm?", options: ["Die interne Umfrage vom Frühjahr.", "Eine neue gesetzliche Vorschrift.", "Der Wunsch der Geschäftsführung nach Kostensenkung."], answer: 0, capability: "justify", difficulty: "A", rationale: "\"Anlass ist die interne Umfrage vom Frühjahr\"." }),
    trueFalse({ stem: "Die Teilnahme am Programm erfolgt außerhalb der regulären Arbeitszeit.", answer: false, capability: "summarise", difficulty: "A", rationale: "\"wird jedoch als reguläre Arbeitszeit angerechnet\"." }),
    mcq({ stem: "Wie wird bei Überbuchung eines Moduls entschieden, wer teilnehmen darf?", options: ["Nach der Reihenfolge der Anmeldung.", "Per Losverfahren.", "Nach Entscheidung der jeweiligen Abteilungsleitung."], answer: 0, capability: "structure", difficulty: "B", rationale: "\"bei Überbuchung entscheidet die Reihenfolge der Anmeldung\"." }),
    mcq({ stem: "Wie ist jedes der drei Module aufgebaut?", options: ["Zwei Präsenztermine plus begleitende Online-Einheiten.", "Ausschließlich Online-Einheiten ohne Präsenztermine.", "Ein einzelner ganztägiger Termin."], answer: 0, capability: "structure", difficulty: "B", rationale: "\"besteht aus zwei ganztägigen Präsenzterminen sowie begleitenden Online-Einheiten\"." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   20 — ADVICE COLUMN (2nd) — Nein sagen zu Überstunden
   ══════════════════════════════════════════════════════════════════════ */
const READING_22 = readingPaper("practice-reading-22", "Leseverstehen — Ratgeber: Wie sage ich Nein zu ständigen Überstunden?",
  "Ratgeber: Wie sage ich Nein zu ständigen Überstunden?",
  `LESERFRAGE: Ich werde fast jede Woche gebeten, länger zu bleiben, weil "gerade so viel los ist". Ich möchte nicht als unkollegial gelten, aber ich bin erschöpft. Wie kann ich das ansprechen, ohne dass es wie eine Verweigerung klingt?

ANTWORT DES RATGEBERS: Ein häufiger Fehler ist, die eigene Grenze erst dann zu benennen, wenn man schon erschöpft ist — dann klingt sie fast automatisch wie ein Vorwurf. Besser ist es, das Gespräch proaktiv zu suchen, bevor die nächste Belastungsspitze kommt, und konkrete Zahlen statt Gefühle zu nennen: "Ich habe in den letzten sechs Wochen an vier Wochen Überstunden gemacht" wirkt sachlicher als "Ich bin immer erschöpft."

Zweitens hilft es, das Problem nicht als persönliche Grenze, sondern als strukturelle Frage zu formulieren: Ist die Arbeitslast dauerhaft zu hoch, oder handelt es sich wirklich um Ausnahmesituationen? Diese Unterscheidung öffnet das Gespräch für gemeinsame Lösungen — etwa eine zusätzliche Aushilfe in Spitzenzeiten — statt es auf die Frage "Bist du bereit oder nicht?" zu verengen.

Und schließlich: Ein einzelnes klärendes Gespräch reicht selten. Planen Sie ein, das Thema nach einigen Wochen erneut anzusprechen, falls sich strukturell nichts geändert hat.`,
  [
    mcq({ stem: "Was empfiehlt der Ratgeber bezüglich des Zeitpunkts für das Gespräch?", options: ["Das Gespräch proaktiv suchen, bevor die nächste Belastungsspitze kommt.", "Das Gespräch erst führen, wenn man völlig erschöpft ist.", "Das Thema am besten schriftlich per E-Mail ansprechen."], answer: 0, capability: "structure", difficulty: "B", rationale: "\"Besser ist es, das Gespräch proaktiv zu suchen, bevor die nächste Belastungsspitze kommt.\"" }),
    trueFalse({ stem: "Der Ratgeber empfiehlt, im Gespräch eher mit konkreten Zahlen als mit allgemeinen Gefühlsaussagen zu argumentieren.", answer: true, capability: "summarise", difficulty: "A", rationale: "\"konkrete Zahlen statt Gefühle zu nennen … wirkt sachlicher\"." }),
    mcq({ stem: "Welchen Vorteil hat es laut Ratgeber, das Problem als strukturelle Frage statt als persönliche Grenze zu formulieren?", options: ["Es öffnet das Gespräch für gemeinsame Lösungen.", "Es macht die eigene Position schwächer.", "Es verhindert jedes weitere Gespräch zum Thema."], answer: 0, capability: "justify", difficulty: "C", rationale: "\"Diese Unterscheidung öffnet das Gespräch für gemeinsame Lösungen … statt es … zu verengen.\"" }),
    mcq({ stem: "Was rät der Ratgeber für den Fall, dass ein einzelnes Gespräch nichts ändert?", options: ["Das Thema nach einigen Wochen erneut ansprechen.", "Das Thema danach nicht mehr erwähnen.", "Sofort kündigen."], answer: 0, capability: "speculate", difficulty: "B", rationale: "\"Planen Sie ein, das Thema nach einigen Wochen erneut anzusprechen.\"" }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   21 — SHORT REPORT (2nd) — Kundenzufriedenheitsauswertung
   ══════════════════════════════════════════════════════════════════════ */
const READING_23 = readingPaper("practice-reading-23", "Leseverstehen — Kurzbericht: Kundenzufriedenheit im Vergleich",
  "Kurzbericht: Kundenzufriedenheit im Vergleich",
  `Die jährliche Kundenzufriedenheitsbefragung liegt in ausgewerteter Form vor. Die durchschnittliche Bewertung stieg von 3,9 auf 4,2 von 5 möglichen Punkten — der höchste Wert seit Beginn der Erhebung vor sechs Jahren.

Am stärksten verbesserte sich die Bewertung der telefonischen Erreichbarkeit, die seit der Einführung eines Rückrufsystems im letzten Jahr von 3,4 auf 4,3 Punkte kletterte. Kundinnen und Kunden bewerteten insbesondere positiv, dass Rückrufe nun verlässlich innerhalb von zwei Stunden erfolgen, statt wie früher teilweise erst am nächsten Tag.

Ein Bereich bleibt jedoch zurück: Die Verständlichkeit schriftlicher Mitteilungen, etwa bei Vertragsänderungen, wurde nur mit 3,1 Punkten bewertet — nahezu unverändert gegenüber dem Vorjahr. In den offenen Kommentaren beklagten mehrere Befragte, dass wichtige Informationen "in zu viel Fachsprache versteckt" seien.

Die Geschäftsführung hat daraufhin angekündigt, die Vorlagen für Kundenschreiben im kommenden Quartal gemeinsam mit einer externen Kommunikationsberaterin zu überarbeiten.`,
  [
    mcq({ stem: "Wie hat sich die durchschnittliche Kundenzufriedenheit entwickelt?", options: ["Sie stieg von 3,9 auf 4,2 Punkte — der höchste Wert seit sechs Jahren.", "Sie sank leicht im Vergleich zum Vorjahr.", "Sie blieb exakt unverändert."], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"stieg von 3,9 auf 4,2 … der höchste Wert seit Beginn der Erhebung vor sechs Jahren\"." }),
    trueFalse({ stem: "Die Verständlichkeit schriftlicher Mitteilungen verbesserte sich im Vergleich zum Vorjahr deutlich.", answer: false, capability: "summarise", difficulty: "A", rationale: "\"nahezu unverändert gegenüber dem Vorjahr\"." }),
    mcq({ stem: "Was führte laut Bericht zur verbesserten Bewertung der telefonischen Erreichbarkeit?", options: ["Die Einführung eines Rückrufsystems mit verlässlichen Rückrufzeiten.", "Eine längere Erreichbarkeit der Hotline am Wochenende.", "Eine neue Telefonanlage mit kürzeren Wartemusiken."], answer: 0, capability: "exemplify", difficulty: "B", rationale: "\"seit der Einführung eines Rückrufsystems … Rückrufe nun verlässlich innerhalb von zwei Stunden erfolgen\"." }),
    mcq({ stem: "Was kritisierten Befragte konkret an den schriftlichen Mitteilungen?", options: ["Dass wichtige Informationen in zu viel Fachsprache versteckt seien.", "Dass die Mitteilungen zu selten verschickt werden.", "Dass sie nur per Post und nicht per E-Mail ankommen."], answer: 0, capability: "exemplify", difficulty: "B", rationale: "\"dass wichtige Informationen 'in zu viel Fachsprache versteckt' seien\"." }),
    mcq({ stem: "Wie reagiert die Geschäftsführung auf dieses Ergebnis?", options: ["Sie kündigt eine Überarbeitung der Vorlagen mit externer Unterstützung an.", "Sie ignoriert das Ergebnis, da der Gesamtwert gestiegen ist.", "Sie streicht die schriftliche Kommunikation komplett."], answer: 0, capability: "structure", difficulty: "C", rationale: "\"hat … angekündigt, die Vorlagen … gemeinsam mit einer externen Kommunikationsberaterin zu überarbeiten\"." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   22 — MULTIPLE VIEWPOINTS (2nd) — Trinkgeld abschaffen?
   ══════════════════════════════════════════════════════════════════════ */
const READING_24 = readingPaper("practice-reading-24", "Leseverstehen — Zwei Stimmen: Sollte Trinkgeld abgeschafft werden?",
  "Zwei Stimmen: Sollte Trinkgeld abgeschafft werden?",
  `STIMME 1 — RESTAURANTBESITZERIN: Ich habe in meinem Restaurant das Trinkgeld offiziell abgeschafft und stattdessen die Preise um 10 Prozent erhöht, wovon das gesamte Servicepersonal einen festen Anteil bekommt. Der Vorteil: Das Einkommen meiner Angestellten ist jetzt planbar und hängt nicht mehr von Zufall, Tagesform der Gäste oder unbewusster Bevorzugung bestimmter Tische ab.

STIMME 2 — KELLNER AUS EINEM ANDEREN BETRIEB: Ich verstehe das Motiv, aber für mich persönlich wäre das ein Nachteil. An guten Abenden verdiene ich durch Trinkgeld deutlich mehr als jeden Festbetrag, den ein Arbeitgeber realistisch anbieten würde. Außerdem motiviert mich das Trinkgeld, wirklich guten Service zu bieten — bei einem Festgehalt würde dieser Anreiz teilweise wegfallen.

STIMME 1: Das ist ein faires Argument, das ich nicht wegwischen will. Bei uns hat sich aber gezeigt, dass die Serviceleistung nicht gesunken ist, seit das Trinkgeld weg ist — vermutlich, weil die meisten Mitarbeitenden ohnehin aus Berufsstolz guten Service bieten wollen, nicht nur wegen des Geldes.`,
  [
    mcq({ stem: "Was hat die Restaurantbesitzerin konkret geändert?", options: ["Trinkgeld abgeschafft und stattdessen die Preise erhöht, mit festem Anteil fürs Personal.", "Nur die Preise erhöht, das Trinkgeld blieb bestehen.", "Trinkgeld abgeschafft, ohne Ausgleich für das Personal."], answer: 0, capability: "summarise", difficulty: "B", rationale: "\"das Trinkgeld offiziell abgeschafft und stattdessen die Preise um 10 Prozent erhöht, wovon das gesamte Servicepersonal einen festen Anteil bekommt\"." }),
    trueFalse({ stem: "Der Kellner aus dem anderen Betrieb befürwortet die Abschaffung des Trinkgelds vorbehaltlos.", answer: false, capability: "concede", difficulty: "B", rationale: "Er versteht das Motiv, sieht für sich persönlich aber einen finanziellen Nachteil — keine vorbehaltlose Zustimmung." }),
    mcq({ stem: "Welches Argument bringt der Kellner gegen ein Festgehalt vor?", options: ["Trinkgeld motiviert ihn zu besonders gutem Service.", "Ein Festgehalt wäre steuerlich nachteilig.", "Trinkgeld ist gesetzlich vorgeschrieben."], answer: 0, capability: "justify", difficulty: "B", rationale: "\"motiviert mich das Trinkgeld, wirklich guten Service zu bieten — bei einem Festgehalt würde dieser Anreiz teilweise wegfallen\"." }),
    mcq({ stem: "Wie reagiert die Restaurantbesitzerin auf das Argument des Kellners?", options: ["Sie erkennt es als fair an, weist aber auf ihre eigene, andere Erfahrung hin.", "Sie weist es vollständig zurück.", "Sie stimmt ihm zu und will das Trinkgeld wieder einführen."], answer: 0, capability: "concede", difficulty: "C", rationale: "\"Das ist ein faires Argument, das ich nicht wegwischen will. Bei uns hat sich aber gezeigt, dass …\"" }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   23 — PUBLIC NOTICE (2nd) — Hausordnung Aktualisierung
   ══════════════════════════════════════════════════════════════════════ */
const READING_25 = readingPaper("practice-reading-25", "Leseverstehen — Aushang: Aktualisierte Hausordnung",
  "Aushang: Aktualisierte Hausordnung",
  `Aktualisierte Hausordnung — gültig ab dem 1. des Folgemonats

Nach Rückmeldungen mehrerer Mieterinnen und Mieter wurden folgende Punkte der Hausordnung angepasst:

1. Ruhezeiten: Die bisherige Mittagsruhe (13–15 Uhr) entfällt ersatzlos. Es gelten weiterhin die Nachtruhe (22–6 Uhr) sowie die Sonntagsruhe ganztägig.

2. Fahrräder: Das Abstellen von Fahrrädern im Hausflur ist ab sofort nicht mehr gestattet. Im Hinterhof steht ein neu errichteter, abschließbarer Fahrradunterstand zur Verfügung; einen Schlüssel erhalten Sie bei der Hausverwaltung.

3. Mülltrennung: Die Biotonne wird künftig wöchentlich statt zweiwöchentlich geleert. Die zusätzlichen Kosten werden anteilig über die Nebenkostenabrechnung umgelegt.

Diese Änderungen wurden in der letzten Eigentümerversammlung mehrheitlich beschlossen und sind für alle Mieterinnen und Mieter verbindlich. Bei Fragen wenden Sie sich an die Hausverwaltung.`,
  [
    mcq({ stem: "Was ändert sich bezüglich der Mittagsruhe?", options: ["Sie entfällt vollständig.", "Sie wird auf 12–16 Uhr ausgeweitet.", "Sie bleibt unverändert bestehen."], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"Die bisherige Mittagsruhe … entfällt ersatzlos.\"" }),
    trueFalse({ stem: "Fahrräder dürfen laut neuer Hausordnung weiterhin im Hausflur abgestellt werden.", answer: false, capability: "summarise", difficulty: "A", rationale: "\"ist ab sofort nicht mehr gestattet\"." }),
    mcq({ stem: "Wo erhält man den Schlüssel für den neuen Fahrradunterstand?", options: ["Bei der Hausverwaltung.", "Beim Nachbarn.", "Im Hausflur an einem Schlüsselbrett."], answer: 0, capability: "structure", difficulty: "B", rationale: "\"einen Schlüssel erhalten Sie bei der Hausverwaltung\"." }),
    mcq({ stem: "Was bedeutet die Änderung bei der Biotonne finanziell für die Mieter?", options: ["Die zusätzlichen Kosten werden über die Nebenkosten umgelegt.", "Die Kosten trägt allein die Hausverwaltung.", "Es entstehen keinerlei zusätzliche Kosten."], answer: 0, capability: "exemplify", difficulty: "B", rationale: "\"Die zusätzlichen Kosten werden anteilig über die Nebenkostenabrechnung umgelegt.\"" }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   24 — PROFESSIONAL COMMUNICATION (2nd, with MATCHING) — Onboarding-Leitfaden
   ══════════════════════════════════════════════════════════════════════ */
const READING_26 = readingPaper("practice-reading-26", "Leseverstehen — Auszug aus dem Onboarding-Leitfaden für neue Mitarbeitende",
  "Auszug aus dem Onboarding-Leitfaden für neue Mitarbeitende",
  `Willkommen im Unternehmen! Damit Ihr Einstieg reibungslos verläuft, orientieren sich die ersten vier Wochen an folgendem Ablauf.

In der ersten Woche stehen vor allem organisatorische Themen im Vordergrund: IT-Zugänge, Sicherheitsunterweisung und ein Rundgang durch alle relevanten Abteilungen, begleitet von Ihrer Patin oder Ihrem Paten — einer erfahrenen Kollegin oder einem erfahrenen Kollegen, die oder der Ihnen als erste Ansprechperson für alle Fragen zur Verfügung steht.

Ab der zweiten Woche übernehmen Sie erste eigenständige, aber überschaubare Aufgaben, während Ihre Führungskraft in wöchentlichen Kurzgesprächen prüft, ob Unterstützung nötig ist. In der dritten Woche folgt ein Zwischenfeedback-Gespräch, in dem beide Seiten offen ansprechen können, was gut läuft und wo es noch hakt.

Nach vier Wochen findet das eigentliche Onboarding-Abschlussgespräch statt, in dem gemeinsam die Ziele für die kommenden Monate festgelegt werden. Die Patenschaft endet formal mit diesem Gespräch, steht aber informell auch danach weiterhin zur Verfügung.`,
  [
    mcq({ stem: "Welche Rolle hat die Patin oder der Pate in der ersten Woche?", options: ["Erste Ansprechperson für alle Fragen.", "Verantwortlich für die Gehaltsabrechnung.", "Vertretung der Führungskraft bei Abwesenheit."], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"die … Ihnen als erste Ansprechperson für alle Fragen zur Verfügung steht\"." }),
    trueFalse({ stem: "Neue Mitarbeitende übernehmen bereits in der ersten Woche eigenständige Aufgaben.", answer: false, capability: "summarise", difficulty: "A", rationale: "Eigenständige Aufgaben beginnen \"ab der zweiten Woche\"." }),
    matching({
      stem: "Ordnen Sie jeden Zeitpunkt dem passenden Ereignis aus dem Onboarding-Ablauf zu.",
      left: ["Erste Woche", "Zweite Woche", "Dritte Woche", "Nach vier Wochen"],
      right: ["Erste eigenständige, überschaubare Aufgaben", "Zwischenfeedback-Gespräch", "IT-Zugänge, Sicherheitsunterweisung, Rundgang", "Onboarding-Abschlussgespräch mit Zielfestlegung"],
      mapping: { "0": 2, "1": 0, "2": 1, "3": 3 },
      capability: "structure", difficulty: "B",
      rationale: "Der Text nennt die vier Phasen in genau dieser zeitlichen Abfolge." }),
    mcq({ stem: "Was passiert formal mit der Patenschaft nach dem Abschlussgespräch?", options: ["Sie endet formal, bleibt aber informell verfügbar.", "Sie wird automatisch um vier weitere Wochen verlängert.", "Sie endet vollständig und ohne weiteren Kontakt."], answer: 0, capability: "structure", difficulty: "C", rationale: "\"Die Patenschaft endet formal mit diesem Gespräch, steht aber informell auch danach weiterhin zur Verfügung.\"" }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   25 — OPINION ARTICLE (3rd) — Künstliche Intelligenz am Arbeitsplatz
   ══════════════════════════════════════════════════════════════════════ */
const READING_27 = readingPaper("practice-reading-27", "Leseverstehen — Künstliche Intelligenz am Arbeitsplatz: Werkzeug oder Bedrohung?",
  "Künstliche Intelligenz am Arbeitsplatz: Werkzeug oder Bedrohung?",
  `Kaum ein Thema wird in Belegschaften derzeit so kontrovers diskutiert wie der Einsatz von KI-gestützten Werkzeugen im Arbeitsalltag. Die einen sehen darin eine Entlastung von Routineaufgaben, die anderen fürchten um ihre Stellen.

Eine Befragung aus dem letzten Jahr liefert ein differenziertes Bild: 58 Prozent der befragten Angestellten gaben an, KI-Werkzeuge würden ihnen bei repetitiven Aufgaben wie Terminplanung oder Standardkorrespondenz spürbar Zeit sparen. Gleichzeitig äußerten 41 Prozent Sorge, dass genau diese eingesparte Zeit langfristig zu Stellenabbau führen könnte, statt den Mitarbeitenden zugutezukommen.

Bemerkenswert ist, dass beide Sorgen nicht zwangsläufig im Widerspruch stehen — es handelt sich weniger um eine Frage von "richtig" oder "falsch", sondern darum, WIE ein Unternehmen die freiwerdende Zeit tatsächlich nutzt. In Unternehmen, die die Zeitersparnis nachweislich in neue, anspruchsvollere Aufgabenfelder investierten, war die Zustimmung zu KI-Werkzeugen signifikant höher als in Unternehmen, die parallel Stellen abbauten.

Die Schlussfolgerung liegt nahe: Nicht die Technologie selbst entscheidet über Akzeptanz, sondern die Art, wie ein Unternehmen mit den dadurch entstehenden Freiräumen umgeht.`,
  [
    mcq({ stem: "Was gaben 58 Prozent der Befragten laut Text an?", options: ["Dass KI-Werkzeuge ihnen bei repetitiven Aufgaben Zeit sparen.", "Dass sie KI-Werkzeuge grundsätzlich ablehnen.", "Dass ihr Gehalt durch KI gesunken ist."], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"58 Prozent … gaben an, KI-Werkzeuge würden ihnen … spürbar Zeit sparen\"." }),
    trueFalse({ stem: "Laut Text stehen die beiden genannten Haltungen (Zeitersparnis und Sorge um Stellenabbau) zwangsläufig im Widerspruch zueinander.", answer: false, capability: "concede", difficulty: "C", rationale: "\"beide Sorgen nicht zwangsläufig im Widerspruch stehen\"." }),
    mcq({ stem: "In welchen Unternehmen war laut Text die Zustimmung zu KI-Werkzeugen höher?", options: ["In Unternehmen, die die Zeitersparnis in neue Aufgabenfelder investierten.", "In Unternehmen, die gleichzeitig Stellen abbauten.", "In Unternehmen ohne jede KI-Nutzung."], answer: 0, capability: "compare", difficulty: "C", rationale: "\"In Unternehmen, die die Zeitersparnis nachweislich in neue, anspruchsvollere Aufgabenfelder investierten, war die Zustimmung … signifikant höher.\"" }),
    mcq({ stem: "Welche zentrale Schlussfolgerung zieht der Text?", options: ["Nicht die Technologie selbst, sondern der Umgang mit den entstehenden Freiräumen entscheidet über Akzeptanz.", "KI-Werkzeuge sollten in allen Unternehmen sofort verboten werden.", "Nur die Menge der eingesetzten KI-Werkzeuge ist entscheidend."], answer: 0, capability: "argue", difficulty: "C", rationale: "\"Nicht die Technologie selbst entscheidet über Akzeptanz, sondern die Art, wie ein Unternehmen mit den … Freiräumen umgeht.\"" }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   26 — FORUM DISCUSSION (3rd) — Berufsbegleitender Master
   ══════════════════════════════════════════════════════════════════════ */
const READING_28 = readingPaper("practice-reading-28", "Leseverstehen — Forum: Lohnt sich ein berufsbegleitender Master?",
  "Forum: Lohnt sich ein berufsbegleitender Master?",
  `PRIYA_L: Ich überlege seit Monaten, neben meiner Vollzeitstelle einen berufsbegleitenden Master zu machen. Hat das schon jemand von euch durchgezogen?

MARCUS_T: Ich habe es gemacht — zweieinhalb Jahre, Wochenendseminare plus Abendvorlesungen online. Ehrlich gesagt war es die anstrengendste Zeit meines Lebens, aber beruflich hat es sich gelohnt: Ich bin ein Jahr nach Abschluss in eine Position aufgestiegen, für die vorher der Mastertitel Voraussetzung war.

PRIYA_L: Und wie war es privat? Ich habe Angst, dass meine Beziehung darunter leidet.

MARCUS_T: Ganz ehrlich, das ist nicht zu unterschätzen. Meine Partnerin hat mich sehr unterstützt, aber es gab Monate, in denen wir uns kaum gesehen haben. Ich würde jedem raten, das VORHER offen zu besprechen, nicht erst, wenn man schon mittendrin steckt.

LENA_F: Bei mir war der entscheidende Punkt ein anderer: Mein Arbeitgeber hat einen Teil der Studiengebühren übernommen, im Gegenzug musste ich mich verpflichten, danach noch zwei Jahre im Unternehmen zu bleiben. Das hat die Entscheidung finanziell deutlich leichter gemacht.

PRIYA_L: Das ist ein guter Hinweis — ich werde auf jeden Fall vorher fragen, ob mein Arbeitgeber sich beteiligen würde.`,
  [
    mcq({ stem: "Was war laut Marcus das berufliche Ergebnis seines Masterabschlusses?", options: ["Ein Jahr später der Aufstieg in eine Position, die den Mastertitel voraussetzte.", "Er wurde trotz Abschluss nicht befördert.", "Er hat die Firma sofort nach dem Abschluss gewechselt."], answer: 0, capability: "summarise", difficulty: "B", rationale: "\"bin ein Jahr nach Abschluss in eine Position aufgestiegen, für die vorher der Mastertitel Voraussetzung war\"." }),
    trueFalse({ stem: "Marcus rät, das Thema mit dem Partner erst anzusprechen, wenn man bereits mit dem Studium begonnen hat.", answer: false, capability: "justify", difficulty: "B", rationale: "\"Ich würde jedem raten, das VORHER offen zu besprechen, nicht erst, wenn man schon mittendrin steckt.\"" }),
    mcq({ stem: "Was war für Lena der entscheidende Punkt bei ihrer Entscheidung?", options: ["Die finanzielle Beteiligung des Arbeitgebers an den Studiengebühren.", "Die Möglichkeit, komplett remote zu studieren.", "Die kurze Studiendauer von nur einem Jahr."], answer: 0, capability: "exemplify", difficulty: "B", rationale: "\"Mein Arbeitgeber hat einen Teil der Studiengebühren übernommen … Das hat die Entscheidung finanziell deutlich leichter gemacht.\"" }),
    mcq({ stem: "Welche Gegenleistung musste Lena für die Kostenbeteiligung erbringen?", options: ["Sich verpflichten, danach noch zwei Jahre im Unternehmen zu bleiben.", "Auf ihr Gehalt während des Studiums verzichten.", "Zusätzliche unbezahlte Überstunden leisten."], answer: 0, capability: "exemplify", difficulty: "B", rationale: "\"im Gegenzug musste ich mich verpflichten, danach noch zwei Jahre im Unternehmen zu bleiben\"." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   27 — SHORT REPORT (3rd) — Ideenmanagement
   ══════════════════════════════════════════════════════════════════════ */
const READING_29 = readingPaper("practice-reading-29", "Leseverstehen — Kurzbericht: Ein Jahr betriebliches Ideenmanagement",
  "Kurzbericht: Ein Jahr betriebliches Ideenmanagement",
  `Vor einem Jahr wurde das betriebliche Ideenmanagement überarbeitet: Statt Vorschläge auf Papier einzureichen, können Mitarbeitende sie seither über eine App einreichen, kommentieren und mit anderen Vorschlägen vergleichen. Der vorliegende Jahresbericht zieht eine erste Bilanz.

Die Zahl der eingereichten Vorschläge stieg von 64 im letzten Jahr des Papierverfahrens auf 211 im ersten App-Jahr — mehr als eine Verdreifachung. Die Umsetzungsquote blieb dabei nahezu konstant bei etwa 18 Prozent, was darauf hindeutet, dass die höhere Zahl nicht auf Kosten der Qualität ging.

Ein unerwarteter Nebeneffekt: Durch die Kommentarfunktion entstanden mehrfach Vorschläge, die von mehreren Mitarbeitenden gemeinsam weiterentwickelt wurden, statt wie früher isoliert von Einzelpersonen eingereicht zu werden. Das Ideenmanagement-Team wertet dies als wichtigsten qualitativen Fortschritt, wichtiger sogar als die reine Steigerung der Zahlen.

Ein Kritikpunkt aus den Nutzerrückmeldungen betrifft die Rückmeldezeit: Bei abgelehnten Vorschlägen dauerte es im Schnitt sechs Wochen, bis eine Begründung mitgeteilt wurde — deutlich länger, als sich viele Mitarbeitende gewünscht hätten.`,
  [
    mcq({ stem: "Wie veränderte sich die Zahl der eingereichten Vorschläge nach der Umstellung auf die App?", options: ["Sie stieg von 64 auf 211 — mehr als eine Verdreifachung.", "Sie blieb konstant bei etwa 64.", "Sie sank leicht auf 48."], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"stieg von 64 … auf 211 … mehr als eine Verdreifachung\"." }),
    trueFalse({ stem: "Die Umsetzungsquote der Vorschläge sank deutlich, seit mehr Vorschläge eingereicht werden.", answer: false, capability: "summarise", difficulty: "B", rationale: "\"Die Umsetzungsquote blieb dabei nahezu konstant bei etwa 18 Prozent.\"" }),
    mcq({ stem: "Was bewertet das Ideenmanagement-Team als wichtigsten qualitativen Fortschritt?", options: ["Dass Vorschläge nun oft gemeinsam von mehreren Mitarbeitenden weiterentwickelt werden.", "Dass die reine Anzahl der Vorschläge gestiegen ist.", "Dass die App weniger Kosten verursacht als das Papierverfahren."], answer: 0, capability: "argue", difficulty: "C", rationale: "\"wertet dies als wichtigsten qualitativen Fortschritt, wichtiger sogar als die reine Steigerung der Zahlen\"." }),
    mcq({ stem: "Welchen Kritikpunkt nennen die Nutzerrückmeldungen?", options: ["Die lange Rückmeldezeit von durchschnittlich sechs Wochen bei Ablehnung.", "Die App ist technisch zu kompliziert.", "Es gibt zu wenige Kategorien für Vorschläge."], answer: 0, capability: "exemplify", difficulty: "B", rationale: "\"dauerte es im Schnitt sechs Wochen, bis eine Begründung mitgeteilt wurde\"." }),
  ]);

/* ══════════════════════════════════════════════════════════════════════
   28 — WORKPLACE MEMO (3rd) — Vertretungsregelung im Urlaub
   ══════════════════════════════════════════════════════════════════════ */
const READING_30 = readingPaper("practice-reading-30", "Leseverstehen — Hausmitteilung: Vertretungsregelung während der Urlaubszeit",
  "Hausmitteilung: Vertretungsregelung während der Urlaubszeit",
  `An alle Abteilungsleitungen

Mit Blick auf die bevorstehende Hauptreisezeit bitten wir, die Vertretungsregelungen bis spätestens zwei Wochen vor Urlaubsbeginn der jeweiligen Person schriftlich im Vertretungsplan zu hinterlegen.

Wichtig: Eine Vertretung darf nur benannt werden, wenn die vertretende Person die dafür nötigen Systemzugänge und Kenntnisse tatsächlich besitzt — eine rein formale Benennung ohne echte Handlungsfähigkeit hat sich in der Vergangenheit mehrfach als Problem erwiesen, etwa wenn dringende Freigaben tagelang liegen blieben.

Sollte in einer Abteilung keine geeignete interne Vertretung verfügbar sein, ist dies der Geschäftsleitung rechtzeitig zu melden, damit gegebenenfalls eine abteilungsübergreifende Lösung organisiert werden kann. "Rechtzeitig" bedeutet in diesem Zusammenhang mindestens vier Wochen vor dem betreffenden Urlaubszeitraum.

Für Rückfragen zur Vertretungsplanung steht die Personalabteilung zur Verfügung.`,
  [
    mcq({ stem: "Bis wann muss die Vertretungsregelung im Vertretungsplan hinterlegt werden?", options: ["Spätestens zwei Wochen vor Urlaubsbeginn.", "Erst am ersten Urlaubstag.", "Spätestens vier Wochen nach Urlaubsende."], answer: 0, capability: "summarise", difficulty: "A", rationale: "\"bis spätestens zwei Wochen vor Urlaubsbeginn … schriftlich … hinterlegen\"." }),
    trueFalse({ stem: "Laut Text reicht eine rein formale Benennung einer Vertretung aus, auch ohne passende Systemzugänge.", answer: false, capability: "summarise", difficulty: "B", rationale: "\"eine rein formale Benennung ohne echte Handlungsfähigkeit hat sich … mehrfach als Problem erwiesen\"." }),
    mcq({ stem: "Was muss eine Abteilung tun, wenn keine geeignete interne Vertretung verfügbar ist?", options: ["Dies der Geschäftsleitung mindestens vier Wochen vorher melden.", "Den Urlaub der betroffenen Person automatisch streichen.", "Nichts unternehmen, das Problem löst sich meist von selbst."], answer: 0, capability: "structure", difficulty: "C", rationale: "\"ist dies der Geschäftsleitung rechtzeitig zu melden … 'Rechtzeitig' bedeutet … mindestens vier Wochen vor dem … Urlaubszeitraum.\"" }),
  ]);

module.exports = {
  READING_3, READING_4, READING_5, READING_6, READING_7, READING_8,
  READING_9, READING_10, READING_11, READING_12, READING_13, READING_14,
  READING_15, READING_16, READING_17, READING_18, READING_19, READING_20,
  READING_21, READING_22, READING_23, READING_24, READING_25, READING_26,
  READING_27, READING_28, READING_29, READING_30,
  readingPaper,
};

const ALL = [
  READING_3, READING_4, READING_5, READING_6, READING_7, READING_8,
  READING_9, READING_10, READING_11, READING_12, READING_13, READING_14,
  READING_15, READING_16, READING_17, READING_18, READING_19, READING_20,
  READING_21, READING_22, READING_23, READING_24, READING_25, READING_26,
  READING_27, READING_28, READING_29, READING_30,
];

async function main() {
  console.log(`Seeding ${ALL.length} new Reading practice papers (practice-reading-3..30)…`);
  const { pool } = require("./practice_seed_lib");
  for (const spec of ALL) await seedPaper(spec);
  await pool.end();
  console.log("Done.");
}

if (require.main === module) {
  main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
}
