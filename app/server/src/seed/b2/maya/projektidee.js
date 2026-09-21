/**
 * MAYA SCENARIO — Eine Projektidee verteidigen.
 *
 * Proposal defense. The learner pitches a process improvement; Maya, a more
 * senior colleague, is skeptical about cost and disruption.
 *
 *   argue (primary) — defending a proposal with a clear line of reasoning.
 *   justify (secondary) — backing claims with concrete numbers/examples.
 *   concede (secondary) — acknowledging real cost concerns.
 *   maintain_discussion (secondary) — holding the proposal through skepticism.
 */

module.exports = {
  id: "maya_projektidee",
  version: 1,
  title: "Eine neue Projektidee vorschlagen",
  minutes: 7,

  roles: {
    learner: "Mitarbeiter/in",
    maya: "Herr Adeyemi, leitender Kollege",
  },

  context: "Sie möchten vorschlagen, wiederkehrende Kundenanfragen durch eine einfache FAQ-Seite zu reduzieren. Herr Adeyemi ist skeptisch, weil frühere Tools nie richtig genutzt wurden.",
  opening_position: "Solche Tools kosten Zeit in der Erstellung und werden am Ende doch nicht gepflegt.",
  objective: "Herrn Adeyemi mit einem realistischen, begrenzten Vorschlag überzeugen.",

  capability_targets: {
    primary: "argue",
    secondary: ["justify", "concede", "maintain_discussion"],
  },

  max_learner_turns: 7,

  declaration: {
    primary_capability: "argue",
    secondary_capabilities: ["justify", "concede", "maintain_discussion"],
    theme: 3,
    context: "professional",
    cefr_tier: "developing",
    language_resources: [
      "backing a claim with a concrete number: rund ein Drittel der Anfragen wiederholt sich",
      "conceding a past failure while distinguishing this proposal from it",
      "scoping a proposal to make it realistic: zunächst nur für die fünf häufigsten Fragen",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 · telc Sprechen Teil 2/3",
  },

  brief: {
    role: "Sie bearbeiten Kundenanfragen im Tagesgeschäft.",
    situation: "Viele Anfragen wiederholen sich; Sie schlagen eine FAQ-Seite vor.",
    partner: "Herr Adeyemi erinnert sich an ein gescheitertes früheres Tool.",
    goal: "Einen realistischen, begrenzten Testlauf vereinbaren.",
  },

  opening: "Herr Adeyemi lehnt sich zurück. „Du wolltest über eine neue Idee sprechen?“",
  first_say: "Wir hatten schon mal so ein Tool, das keiner gepflegt hat. Warum sollte das diesmal anders sein?",

  beats: [
    {
      id: "b1_distinguish",
      say: "Wir hatten schon mal so ein Tool, das keiner gepflegt hat. Warum sollte das diesmal anders sein?",
      wants: ["reason", "detail"],
      press: [
        "Das war damals auch die Idee. Was genau würde diesmal die Pflege sicherstellen?",
      ],
      transitions: { onSubstantive: "b2_scope_concern", onMaxPress: "b2_scope_concern", next: "b2_scope_concern" },
    },
    {
      id: "b2_scope_concern",
      say: "Selbst wenn — wer soll das jetzt zusätzlich erstellen? Wir haben schon genug zu tun.",
      wants: ["offer", "detail"],
      press: [
        "Ein 'das mache ich schon irgendwie' reicht mir nicht. Wie viel Zeit würde das konkret kosten?",
      ],
      transitions: { onSubstantive: "b3_trial_scope", onMaxPress: "b3_trial_scope", next: "b3_trial_scope" },
    },
    {
      id: "b3_trial_scope",
      say: "Gut, nur die fünf häufigsten Fragen als Test — wie würden wir danach beurteilen, ob es sich gelohnt hat?",
      wants: ["reason", "detail"],
      press: [
        "Ich brauche ein klares Kriterium, nicht nur ein Bauchgefühl.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„In Ordnung. Wir testen es vier Wochen mit den fünf häufigsten Fragen und schauen dann, ob sich die Anfragenzahl spürbar reduziert hat.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ohne ein klares Kriterium für Erfolg starte ich das nicht — zu hohes Risiko, dass es wie beim letzten Mal einschläft.“",
    },
  ],

  closing: "„In Ordnung. Wir testen es vier Wochen mit den fünf häufigsten Fragen.“",

  afterwards: {
    strong: [
      "Rund ein Drittel der Anfragen wiederholt sich fast wortgleich — das ist der konkrete Ausgangspunkt.",
      "Das letzte Tool ist eingeschlafen, weil niemand fest zuständig war — diesmal würde ich die Pflege übernehmen.",
      "Wenn wir es zunächst auf die fünf häufigsten Fragen begrenzen, hält sich der Aufwand in Grenzen.",
    ],
    watchFor: "Herr Adeyemi lehnt nicht die Idee an sich ab, sondern zweifelt an der praktischen Umsetzung — ein begrenzter, messbarer Testlauf überzeugt mehr als ein großes Versprechen.",
  },
};
