/**
 * Experience derived from src_artikel_boreout. Original Skillcase content,
 * Goethe Lesen Teil 4's shape: sustained single-author argument, tested with
 * detail (meaning), cohesion (relation) and inference (implication/
 * intention) items — no attribution items, since there is only one voice.
 */

const SOURCE_ID = "src_artikel_boreout";

const reading = {
  id: "exp_artikel_boreout_read",
  kind: "reading",
  ord: 0,
  title: "Boreout: Wenn Unterforderung krank macht",
  minutes: 12,
  primary_capability: "structure",
  secondary_capabilities: ["argue"],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein längerer Sachtext, ein Autor, ein durchgehendes Argument.",
      "Lesen Sie ihn einmal ganz durch. Danach geht es nicht darum, wer was gesagt hat, sondern was der Text wirklich behauptet — und was nicht.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Laut Text, warum bleibt Boreout oft länger unerkannt als Überlastung?",
      options: [
        "Weil es medizinisch schwerer zu diagnostizieren ist.",
        "Weil Betroffene fürchten, als undankbar zu gelten, und ihre Situation deshalb aktiv verbergen.",
        "Weil es seltener vorkommt als Überlastung.",
      ],
      answer: 1,
      explain: "Der Text nennt ausdrücklich die soziale Erwartung — den „Vorwurf der Undankbarkeit“ — als Grund, warum Betroffene ihre Lage verbergen, durch demonstrative Betriebsamkeit und Vortäuschen von Beschäftigung." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Unter welcher Bedingung zählt eine ruhigere Phase im Beruf laut Text NICHT als Boreout?",
      options: [
        "Wenn sie bewusst gewählt und vorübergehend ist, etwa nach einer anstrengenden Projektphase.",
        "Wenn sie länger als sechs Monate dauert.",
        "Wenn der Betroffene finanziell abgesichert ist.",
      ],
      answer: 0,
      explain: "Der Text grenzt ausdrücklich ab: eine „bewusst gewählte, vorübergehende ruhigere Phase“ fällt „ausdrücklich nicht“ unter Boreout — entscheidend ist die fehlende Kontrolle über die eigene Situation, nicht die Dauer oder finanzielle Lage." },

    { t: "readq", mode: "relation", sourceId: SOURCE_ID,
      capability: "argue",
      quote: "Das greift jedoch zu kurz.",
      q: "Dieser Satz folgt direkt auf den Einwand „Unterforderung müsste doch eigentlich angenehm sein“. Wie steht er zu diesem Einwand?",
      options: [
        "Er bestätigt den Einwand vollständig.",
        "Er nimmt den Einwand ernst und widerlegt ihn dann mit einem konkreten Gegenargument.",
        "Er ignoriert den Einwand und wechselt das Thema.",
        "Er wiederholt den Einwand nur mit anderen Worten.",
      ],
      answer: 1,
      explain: "Der Text formuliert den Einwand fair aus, bevor er ihn zurückweist — und liefert direkt danach den Grund: arbeitspsychologische Untersuchungen zeigen, dass ein Mindestmaß an Herausforderung nötig ist." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "argue",
      q: "Der Text formuliert zweimal „das greift zu kurz“ — einmal zum Einwand „Unterforderung ist angenehm“, einmal zum Rat „einfach die Stelle wechseln“. Was zeigt diese Wiederholung über den Argumentationsstil des Textes?",
      options: [
        "Der Autor wiederholt sich aus Versehen, weil ihm keine anderen Formulierungen einfallen.",
        "Der Text prüft naheliegende, einfache Antworten bewusst und zeigt systematisch, warum sie das Problem nicht vollständig erfassen.",
        "Der Text widerspricht sich an diesen beiden Stellen selbst.",
      ],
      answer: 1,
      explain: "Beide Male nimmt der Text eine plausible, naheliegende Reaktion ernst, um dann zu zeigen, dass sie das Problem nur teilweise löst — ein wiederkehrendes Argumentationsmuster, kein Widerspruch und kein Zufall." },

    { t: "readq", mode: "intention", sourceId: SOURCE_ID,
      capability: "argue",
      quote: "auch wenn sich das Ausmaß des Problems mangels verlässlicher Zahlen nicht abschließend beweisen lässt",
      q: "Warum fügt der Autor diese Einschränkung direkt an seine Schlussfolgerung an?",
      options: [
        "Um zuzugeben, dass die gesamte Argumentation wertlos ist.",
        "Um die eigene These ehrlich zu begrenzen, ohne sie deshalb aufzugeben.",
        "Um vorzuschlagen, das Thema nicht weiter zu erforschen.",
      ],
      answer: 1,
      explain: "Die Einschränkung schwächt die Schlussfolgerung nicht ab, sondern macht sie glaubwürdiger: der Autor behauptet nicht mehr, als er belegen kann, hält aber an seiner grundsätzlichen These fest — dass Boreout eine strukturelle, keine individuelle Frage ist." },
  ],
};

const EXPERIENCES = [reading];

module.exports = { EXPERIENCES, SOURCE_ID };
