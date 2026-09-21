/**
 * B2 Content Closure — Wave 1 Seeder
 *
 * Seeds authentic B2 experiences to close capability gaps:
 *   1. b2_register_aufklaerung (adapt_register)
 *   (additional Wave 1 experiences seeded sequentially)
 */

const pool = require("../db/pool");

const REGISTER_TOPIC = {
  id: "b2_register_aufklaerung",
  order_index: 12,
  icon: "📐",
  title: "Für den Arzt oder für den Patienten?",
  capability: "pitching information appropriately for colleagues versus patients",
  proof: "Register anpassen im Stationsalltag",
  subs: [
    {
      key: "main",
      label: "Register anpassen",
      teaches: [],
      steps: [
        {
          t: "story",
          lines: [
            "Frau Sommer (68 Jahre) hatte gestern eine Knie-OP. In der Nacht entwickelte sie einen akuten Harnverhalt — 650 ml Restharn im Ultraschall. Nach steriler Einmalkatheterisierung flossen 600 ml ab.",
            "Das Labor meldet außerdem: Kalium bei 3,1 mmol/l (leicht erniedrigt). Sie hat eine Kalium-Infusion angehängt bekommen.",
            "Dieselbe klinische Situation — zwei völlig verschiedene Adressaten. Sie schreiben jetzt beide Texte.",
          ],
        },
        {
          t: "notice",
          title: "Register macht den Unterschied",
          body: "An den Arzt: kurz, dicht, Passiv, Fachwörter (Harnverhalt, Restharn, Hypokaliämie, Einmalkatheterisierung). An die Patientin: zugewandt, verständlich, Ursache und Beruhigung ohne Fachchinesisch.",
        },
        {
          t: "produce",
          mode: "write",
          minWords: 35,
          taskType: "workplace",
          experienceId: "exp_register_arzt",
          prompt: "Schreiben Sie eine kurze, präzise Übergabenotiz für die ärztliche Visite (mind. 35 Wörter). Nutzen Sie den fachsprachlichen Berichtsstil (Passiv, nominale Fügungen, Fachterminologie).",
          guidance: [
            "Wesentliche Fakten: Harnverhalt, Restharnmenge, Katheterisierung, Kaliumwert, Infusion.",
            "Sachlicher, verdichteter Berichtsstil (z. B. ‚Bei Z. n. … wurde … durchgeführt‘).",
            "Keine Umgangssprache, keine weitschweifigen Schilderungen.",
          ],
          afterHints: [
            "Postoperativ entwickelte die Patientin einen akuten Harnverhalt.",
            "Nach steriler Einmalkatheterisierung wurden 600 ml Urin entleert.",
            "Aufgrund einer leichten Hypokaliämie wurde eine Kaliumsubstitution veranlasst.",
          ],
          capabilities: ["adapt_register", "structure"],
        },
        {
          t: "produce",
          mode: "write",
          minWords: 40,
          taskType: "patientenkommunikation",
          experienceId: "exp_register_patient",
          prompt: "Erklären Sie Frau Sommer die Situation verständlich und einfühlsam am Krankenbett (mind. 40 Wörter). Erklären Sie, warum der Katheter nötig war und was die Infusion bewirkt — ohne Fachjargon.",
          guidance: [
            "Erklären Sie die Narkose-Nachwirkung in einfachen Worten.",
            "Vermeiden Sie Fachbegriffe wie ‚Hypokaliämie‘ oder ‚Harnverhalt‘.",
            "Beruhigen Sie die Patientin und sagen Sie, wie es weitergeht.",
          ],
          afterHints: [
            "Nach der Narkose braucht die Blase manchmal etwas Zeit, um wieder richtig zu arbeiten.",
            "Wir haben mit einem kleinen Schlauch nachgeholfen, damit der Druck nachlässt.",
            "Über die Infusion bekommen Sie einen wichtigen Mineralstoff, der im Blut etwas zu niedrig war.",
          ],
          capabilities: ["adapt_register", "justify"],
        },
      ],
    },
  ],
};

const COMPARE_TOPIC = {
  id: "b2_dienstplan_vergleich",
  order_index: 13,
  icon: "⚖️",
  title: "Zwei Modelle für die Dienstplanung",
  capability: "setting advantages against disadvantages and arguing for a solution",
  proof: "Systematisch abwägen und Stellung beziehen",
  subs: [
    {
      key: "main",
      label: "Dienstplan-Modelle vergleichen",
      teaches: [],
      steps: [
        {
          t: "story",
          lines: [
            "Die Pflegedienstleitung prüft eine Neuordnung der Dienstzeiten auf Station 4. Zur Debatte stehen zwei gegensätzliche Konzepte:",
            "Modell A (Klassischer 3-Schicht-Rhythmus): Feste Früh-, Spät- und Nachtschichten im verlässlichen 5-Tage-Turnus. Jedes zweite Wochenende ist fest frei. Hohe Planungssicherheit und klare Teamstrukturen, aber starre Vorgaben und kaum Spielraum für spontane Freiwünsche.",
            "Modell B (Wunschdienst- und Springer-Modell): Mitarbeitende tragen ihre Wunschzeiten digital ein. Eine Kernbesetzung wird durch einen internen Springerpool abgesichert. Hohe individuelle Autonomie und bessere Vereinbarkeit von Familie und Beruf, jedoch höherer Abstimmungsaufwand im Team und unruhigere Patientenübergaben.",
          ],
        },
        {
          t: "notice",
          title: "Auf B2 zählt die Struktur des Vergleichs",
          body: "Ein überzeugender Vergleich listet nicht bloß Fakten auf. Er stellt die Aspekte gegenüber (einerseits… andererseits, im Vergleich zu, während), benennt Vor- und Nachteile beider Seiten und mündet in eine begründete Präferenz oder einen gangbaren Kompromiss.",
        },
        {
          t: "produce",
          mode: "write",
          minWords: 60,
          taskType: "vergleich",
          experienceId: "exp_dienstplan_vergleich",
          prompt: "Verfassen Sie eine vergleichende Stellungnahme für die Stationsbesprechung (mind. 60 Wörter). Stellen Sie beide Modelle gegenüber, wägen Sie Vor- und Nachteile ab und begründen Sie Ihre persönliche Empfehlung oder einen sinnvollen Kompromiss.",
          guidance: [
            "Gegenüberstellung: Nutzen Sie Vergleichsstrukturen (einerseits/andererseits, im Vergleich zu, demgegenüber).",
            "Abwägung: Benennen Sie explizit Vor- und Nachteile beider Ansätze.",
            "Positionierung: Formulieren Sie eine begründete Präferenz oder einen Kompromiss (z. B. Kernteam mit Wunschkontingent).",
          ],
          afterHints: [
            "Einerseits garantiert Modell A verlässliche Ruhezeiten, andererseits bietet Modell B dem Team mehr Flexibilität.",
            "Im Vergleich zum starren Schichtsystem hat das Wunschmodell den klaren Vorteil höherer Mitarbeiterzufriedenheit.",
            "Ich halte daher eine Kombination für am sinnvollsten: feste Kernschichten, ergänzt durch ein faires Wunschdienst-Kontingent.",
          ],
          capabilities: ["compare", "justify", "argue"],
        },
      ],
    },
  ],
};

const SPECULATE_TOPIC = {
  id: "b2_fall_spekulation",
  order_index: 14,
  icon: "🔍",
  title: "Was könnte passiert sein?",
  capability: "formulating hypotheses and expressing uncertainty under incomplete information",
  proof: "Fakten und Vermutungen differenziert trennen",
  subs: [
    {
      key: "main",
      label: "Hypothesen im Zwischenfall formulieren",
      teaches: [],
      steps: [
        {
          t: "story",
          lines: [
            "Zwischenfall im Spätdienst: Herr Berg (74 Jahre, gestern von der Intensivstation auf Normalstation verlegt) wird um 19:15 Uhr desorientiert und unruhig im Stationsflur angetroffen. Seine Infusionsnadel am linken Unterarm ist herausgerissen, auf seinem Schlafanzugärmel sind frische Blutflecken.",
            "Auf Ansprache reagiert er fahrig und wiederholt: ‚Ich muss sofort nach Hause, der Herd in der Küche ist noch eingeschaltet!‘",
            "Was sicher bekannt ist: Er war um 19:15 Uhr allein im Flur, die Nadel ist disloziert, er äußert eine fixe Sorge um seine Wohnung. Was unklar ist: Wann er das Bett verlassen hat, ob er gestürzt ist oder ob ein akutes Delir durch den Stationswechsel vorliegt.",
          ],
        },
        {
          t: "notice",
          title: "Hypothesen auf B2 sprachlich abstufen",
          body: "Prüfer und Kollegium erwarten bei unvollständiger Information: Trennen Sie gesicherte Fakten von Vermutungen ('Fest steht…', 'Unklar bleibt…'). Nutzen Sie Konjunktiv II und Abstufungen der Wahrscheinlichkeit ('möglicherweise', 'dürfte', 'eine naheliegende Erklärung wäre').",
        },
        {
          t: "produce",
          mode: "write",
          minWords: 60,
          taskType: "spekulation",
          experienceId: "exp_fall_spekulation",
          prompt: "Analysieren Sie den Vorfall für die ärztliche Übergabe (mind. 60 Wörter). Benennen Sie kurz die gesicherten Fakten, grenzen Sie das Unbekannte ab und formulieren Sie mindestens zwei plausible Hypothesen mit passenden Wahrscheinlichkeitsausdrücken.",
          guidance: [
            "Fakten vs. Unbekanntes: Stellen Sie klar, was gesichert ist und was noch offen bleibt.",
            "Zwei Hypothesen: Formulieren Sie mindestens zwei denkbare Ursachen (z. B. Verwirrtheit durch Stationswechsel, Panikreaktion mit Selbstentfernung der Nadel oder versehentliches Abreißen beim Aufstehen).",
            "Wahrscheinlichkeit abstufen: Nutzen Sie Konjunktiv II (könnte, wäre) und Modalwörter (vermutlich, möglicherweise, wahrscheinlich).",
          ],
          afterHints: [
            "Fest steht, dass Herr Berg um 19:15 Uhr im Flur angetroffen wurde und die Nadel disloziert war.",
            "Eine erste plausible Hypothese ist, dass er infolge des gestrigen Stationswechsels ein Durchgangssyndrom entwickelt hat.",
            "Möglicherweise ist er in Panik aufgestanden und mit dem Schlauch hängengeblieben; denkbar wäre auch, dass er die Nadel selbst entfernt hat.",
          ],
          capabilities: ["speculate", "justify", "structure"],
        },
      ],
    },
  ],
};

const EXEMPLIFY_TOPIC = {
  id: "b2_beispiel_geben",
  order_index: 15,
  icon: "💡",
  title: "Ein Argument konkret belegen",
  capability: "grounding a claim or rebuttal with a concrete, contextually anchored example",
  proof: "Thesen durch greifbare Fälle belegen",
  subs: [
    {
      key: "main",
      label: "Argumente mit Beispielen stützen",
      teaches: [],
      steps: [
        {
          t: "story",
          lines: [
            "Teambesprechung auf Station 3: Die Einführung der gemeinsamen Übergabe am Krankenbett (Bedside Handover) steht zur Abstimmung.",
            "Kollege Frank äußert heftige Bedenken: ‚Das kostet uns am Schichtende nur unnötig Zeit! Die Patienten verstehen unsere Fachsprache sowieso nicht und werden nur verunsichert. Wir sollten bei der Übergabe im Stationszimmer bleiben.‘",
            "Ihre Aufgabe: Reagieren Sie auf Franks Einwand. Widersprechen Sie ihm sachlich und belegen Sie Ihre Position mit einem konkreten, greifbaren Fallbeispiel aus der Praxis.",
          ],
        },
        {
          t: "notice",
          title: "Ein echtes B2-Beispiel ist keine Floskel",
          body: "Sätze wie ‚Zum Beispiel ist Kommunikation wichtig‘ sind inhaltsleer und fallen in jeder Prüfung durch. Ein überzeugendes B2-Beispiel verankert die Situation (auf Station, bei einem Patienten, im Nachtdienst) und schildert einen konkreten Hergang mit nachvollziehbarem Ausgang.",
        },
        {
          t: "produce",
          mode: "write",
          minWords: 60,
          taskType: "beispiel",
          experienceId: "exp_beispiel_geben",
          prompt: "Widersprechen Sie Franks Einwand in der Teambesprechung (mind. 60 Wörter). Formulieren Sie ein klares Gegenargument und belegen Sie es mit einem konkreten Fallbeispiel aus der Stationspraxis.",
          guidance: [
            "Gegenargument: Zeigen Sie, warum die Übergabe am Bett Patienten einbindet und Fehler verhindert.",
            "Konkretes Beispiel: Leiten Sie das Beispiel ein ('Als konkretes Beispiel…', 'beispielsweise') und verankern Sie es zeitlich oder situativ (z. B. 'letzte Woche bei einer älteren Dame').",
            "Konkreter Ausgang: Schildern Sie, was genau auffiel oder welcher Fehler rechtzeitig vermieden wurde.",
          ],
          afterHints: [
            "Ich teile Franks Bedenken nicht, denn die Übergabe am Bett erhöht die Patientensicherheit nachweisbar.",
            "Als konkretes Beispiel lässt sich ein Vorfall aus der letzten Woche anführen: Bei einer Patientin fiel während der Übergabe sofort auf, dass die Dosis vertauscht worden war.",
            "Die Patientin konnte den Fehler selbst korrigieren, sodass eine falsche Medikation rechtzeitig abgewendet werden konnte.",
          ],
          capabilities: ["exemplify", "argue", "justify"],
        },
      ],
    },
  ],
};

async function seedWave1() {
  const topics = [REGISTER_TOPIC, COMPARE_TOPIC, SPECULATE_TOPIC, EXEMPLIFY_TOPIC];
  for (const t of topics) {
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
      [
        t.id,
        t.order_index,
        t.icon,
        t.title,
        t.capability,
        t.proof,
        JSON.stringify(t.subs),
      ]
    );
  }
  console.log(`Seeded ${topics.length} Wave 1 topics into curriculum.`);
}

if (require.main === module) {
  seedWave1()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { REGISTER_TOPIC, COMPARE_TOPIC, SPECULATE_TOPIC, EXEMPLIFY_TOPIC, seedWave1 };
