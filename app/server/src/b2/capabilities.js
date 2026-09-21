/**
 * THE B2 CURRICULUM SPINE — canonical.
 *
 * Twelve things a B2 learner must be able to DO, each traced to what the Goethe
 * and telc handbooks actually say. This file is the authority: no content is
 * authored, published or recommended that cannot declare a capability from it.
 *
 * WHY THIS EXISTS RATHER THAN A GRAMMAR LIST
 * telc deliberately publishes no B2 grammar or vocabulary inventory — extending
 * the B1 lists would be "gleichermaßen beliebig wie unvollständig". Goethe
 * states that knowing the rules is not enough ("reicht es nicht aus, die Regeln
 * der deutschen Grammatik zu beherrschen") and names three defining features of
 * the level: effektive Argumentation, Durchhaltevermögen im Diskurs,
 * Sprachbewusstsein. So the unit of curriculum is a capability, and grammar is
 * a RESOURCE attached to the capability it serves.
 *
 * EVIDENCE GRADES ARE PART OF THE DATA, NOT A FOOTNOTE
 *   explicit  — named in a board handbook. The quotation is here.
 *   ours      — our pedagogical interpretation. Defensible, but not theirs.
 * Anything we cannot ground stayed out: `qualify` was dropped to a language
 * resource under `argue` for exactly this reason, and "explain consequences"
 * folded into `justify` rather than standing on a partial descriptor.
 *
 * Sources: Goethe-Zertifikat B2 · Prüfungsziele, Testbeschreibung (Goethe-Institut);
 * Handbuch telc Deutsch B2 (telc gGmbH). CEFR page refs as cited by telc.
 */

const CAPABILITIES = [
  {
    id: "argue",
    label: "Argue a position",
    de: "effektive Argumentation",
    // What the learner is told. Never a check_id, never a grammar term.
    learner: "building an argument someone could disagree with",
    evidence: "explicit",
    sources: [
      { board: "goethe", ref: "Prüfungsziele §4.5", quote: "Effektive Argumentation" },
      { board: "telc", ref: "Handbuch §3 / CEFR S. 79", quote: "überzeugend argumentieren und auf komplexe Argumentationen anderer reagieren" },
    ],
    resources: ["claim + support structures", "argument connectors", "evaluative lexis",
                "hedging: weitgehend, in der Regel, lässt sich nicht pauschal sagen",
                "abstract and formal lexis; noun-verb collocations"],
    /* Lexical-resource checks live here rather than floating unowned. CEFR's
       Wortschatzspektrum descriptor names both range and variation in one
       breath — "Kann Formulierungen variieren, um häufige Wiederholungen zu
       vermeiden" — and at B2 that range exists to serve argument. Every
       analyse.js check must belong to some capability, or a finding arrives
       that we cannot put into a sentence the learner understands. */
    checks: ["sentence_complexity", "lexical_range", "repetition", "nvv"],
    // "listening" added on the same basis "reading" already was: recognising
    // an argument's position in spoken input is receptive evidence for this
    // capability, exactly as recognising one in a text already counts —
    // never production evidence, and never enough alone to claim the
    // productive side is trained.
    experiences: ["maya", "writing", "reading", "listening", "vocabulary", "exam"],
    exam: { goethe: "Schriftlicher Ausdruck; Mündlich Aufgabe 1", telc: "Schriftlicher Ausdruck; Sprechen Teil 3" },
  },
  {
    id: "justify",
    label: "Give reasons and consequences",
    de: "begründen und verteidigen",
    learner: "backing up what you said, and saying what follows from it",
    evidence: "explicit",
    sources: [
      { board: "goethe", ref: "Prüfungsziele §4.2.2", quote: "Stellung nehmen" },
      { board: "telc", ref: "CEFR S. 74", quote: "Standpunkte durch relevante Erklärungen und Argumente klar begründen und verteidigen" },
    ],
    // Consequence lives here rather than as its own capability: Goethe names
    // "Ziele/Zwecke verbalisieren" (purpose), which is adjacent to but not the
    // same as consequence, and a capability should not rest on an adjacency.
    resources: ["kausal connectors", "weil / denn / da register distinction",
                "konsekutiv: folglich, somit, sodass — see NOTE_KONSEKUTIV"],
    checks: ["connector_range"],
    // Receptive listening evidence on the same basis as "reading" above.
    experiences: ["writing", "maya", "grammar", "reading", "listening"],
    exam: { goethe: "Schriftlicher Ausdruck", telc: "Schriftlicher Ausdruck" },
  },
  {
    id: "concede",
    label: "Concede, then disagree",
    de: "einräumen, dann widersprechen",
    learner: "giving the other side something before you make your point",
    // OURS. Neither board names concession. We keep it first-class because our
    // strongest detector requires it and it is the most common failure across
    // the 1,033 expert-rated MERLIN texts — but the label stays honest.
    evidence: "ours",
    sources: [
      { board: "goethe", ref: "Prüfungsziele §4.2.3", quote: "zustimmen und ablehnen", note: "nearest named function; not concession" },
      { board: "—", ref: "our interpretation", quote: "derived from reacting to others' arguments + connector_range" },
    ],
    resources: ["obwohl, trotzdem, dennoch, zwar…aber, allerdings, jedoch",
                "verb-final after obwohl; verb-second after trotzdem"],
    checks: ["connector_range"],
    experiences: ["grammar", "writing", "maya", "listening", "reading"],
    exam: { goethe: "Schriftlicher Ausdruck", telc: "Kommunikative Gestaltung" },
  },
  {
    id: "compare",
    label: "Weigh two sides",
    de: "vergleichen, abwägen",
    learner: "setting advantages against disadvantages, in order",
    evidence: "explicit",
    sources: [
      { board: "goethe", ref: "Prüfungsziele §4.2.2, §4.5", quote: "vergleichen … Vor- und Nachteile systematisch" },
      { board: "telc", ref: "CEFR S. 62", quote: "Sachverhalte klar und systematisch beschreiben" },
    ],
    resources: ["adversativ connectors", "einerseits…andererseits", "comparatives"],
    checks: ["comparative_structure", "connector_range"],
    // Receptive listening evidence on the same basis as "reading" above.
    experiences: ["writing", "maya", "grammar", "reading", "listening"],
    exam: { goethe: "Schriftlicher Ausdruck", telc: "Schriftlicher Ausdruck" },
  },
  {
    id: "speculate",
    label: "Suggest without demanding",
    de: "Möglichkeiten ausdrücken",
    learner: "proposing something so it lands as a suggestion, not an order",
    evidence: "explicit",
    sources: [
      { board: "goethe", ref: "Prüfungsziele §4.2.2 and §4.2.3", quote: "Möglichkeiten ausdrücken", note: "listed twice — production and interaction" },
      { board: "telc", ref: "Handbuch §3", quote: "auch Hypothesen werden formuliert" },
    ],
    resources: ["Konjunktiv II", "man könnte…", "es wäre sinnvoll, wenn…", "modal verbs of possibility"],
    checks: ["speculative_language", "konjunktiv2"],
    // Receptive listening evidence on the same basis as "reading" above.
    experiences: ["grammar", "maya", "writing", "reading", "listening"],
    exam: { goethe: "Mündlich Aufgabe 2", telc: "Sprechen Teil 3 — Problemlösung" },
  },
  {
    id: "exemplify",
    label: "Back it with an example",
    de: "mit Beispielen abstützen",
    learner: "making it concrete with something that actually happened",
    evidence: "explicit",
    sources: [
      { board: "goethe", ref: "Prüfungsziele §4.2.2", quote: "Beispiele geben" },
      { board: "telc", ref: "CEFR S. 125 Themenentwicklung", quote: "wichtige Aspekte ausführen und mit relevanten Beispielen abstützen" },
    ],
    resources: ["etwa, beispielsweise, so etwa", "narrative past for a concrete instance"],
    // Concrete example framing with narrative grounding and outcome
    checks: ["concrete_example"],
    experiences: ["writing", "maya", "interview", "reading"],
    exam: { goethe: "Mündlich Aufgabe 1", telc: "Sprechen Teil 1" },
  },
  {
    id: "structure",
    label: "Structure what you say",
    de: "Textaufbau, Planung",
    learner: "putting your points in an order a reader can follow",
    evidence: "explicit",
    sources: [
      { board: "goethe", ref: "Prüfungsziele §4.1", quote: "Textwissen … bewertet mit dem Kriterium Textaufbau", note: "a named marking criterion" },
      { board: "telc", ref: "CEFR S. 62", quote: "wichtige Punkte hervorheben" },
    ],
    resources: ["discourse framing", "topic sentences", "salience marking", "paragraphing",
                "covering the Leitpunkte the task actually set"],
    /* Task fulfilment sits here: both boards score whether the points were
       covered and the length met before they score how well. Goethe calls it
       Erfüllung, telc Inhalt — in each case a failure here outranks style. */
    checks: ["email_form", "word_count", "content_points"],
    experiences: ["writing", "reading", "exam"],
    exam: { goethe: "Textaufbau (criterion)", telc: "Kommunikative Gestaltung" },
  },
  {
    id: "maintain_discussion",
    label: "Hold your ground in a discussion",
    de: "Durchhaltevermögen im Diskurs",
    learner: "staying in the conversation when someone pushes back",
    evidence: "explicit",
    sources: [
      { board: "goethe", ref: "Prüfungsziele §4.5, §4.1", quote: "Durchhaltevermögen im Diskurs", note: "also the named speaking criterion Diskussionsfähigkeit" },
      { board: "telc", ref: "CEFR S. 78–80", quote: "bei einer lebhaften Diskussion unter Muttersprachlern mithalten" },
    ],
    resources: ["turn-taking", "holding the floor",
                "Versatzstücke to buy time — CEFR's own example: „Das ist eine schwierige Frage“"],
    checks: [],
    // Cannot be trained by anything but conversation. This is the curriculum's
    // strongest argument for building Maya properly.
    experiences: ["maya", "interview"],
    exam: { goethe: "Diskussionsfähigkeit (criterion)", telc: "Sprechen Teil 2/3" },
  },
  {
    id: "react_unexpected",
    label: "Handle an unexpected turn",
    de: "unerwartete Gesprächsverläufe",
    learner: "coping when the conversation goes somewhere you didn't plan",
    evidence: "explicit",
    sources: [
      { board: "telc", ref: "Handbuch §4", quote: "unerwartete Gesprächsverläufe … fehlende Kohärenz" },
      { board: "telc", ref: "CEFR S. 80", quote: "sich auf Aussagen und Folgerungen anderer Sprecher beziehen, daran anknüpfen" },
    ],
    resources: ["uptake markers", "reformulation", "checking questions"],
    checks: [],
    experiences: ["maya"],
    exam: { goethe: "Mündlich Aufgabe 2", telc: "Sprechen Teil 2" },
  },
  {
    id: "adapt_register",
    label: "Pitch it for the reader",
    de: "soziolinguistisches Wissen",
    learner: "sounding right for who you're writing to",
    evidence: "explicit",
    sources: [
      { board: "goethe", ref: "Prüfungsziele §4.1", quote: "ein Gespür … für Register und Natürlichkeit" },
      { board: "telc", ref: "CEFR S. 79", quote: "Formalität ist den Umständen angemessen" },
    ],
    resources: ["genitive prepositions", "nominalisation", "Anrede/Grußformel conventions",
                "avoiding colloquialism in writing"],
    checks: ["register", "genitiv_praep", "email_form", "professional_register", "patient_register"],
    experiences: ["grammar", "writing", "maya", "vocabulary", "reading"],
    exam: { goethe: "Ausdrucksfähigkeit", telc: "Kommunikative Gestaltung" },
  },
  {
    id: "understand_speech",
    label: "Follow real spoken German",
    de: "Hörverstehen unter erschwerten Bedingungen",
    learner: "following German spoken at real speed, by real people",
    evidence: "explicit",
    sources: [
      { board: "telc", ref: "Handbuch §4.1.2", quote: "unter erschwerten Bedingungen (Umgebungsgeräusche, Abweichungen von der Standardsprache)" },
      { board: "telc", ref: "Handbuch §4.1", quote: "Interviews, auch mit Dialektsprechern" },
    ],
    resources: ["regional variation", "false starts and self-interruption",
                "cohesion inferred from context rather than marked"],
    checks: [],
    experiences: ["listening", "exam"],
    exam: { goethe: "Hören Aufgabe 1 (once) und 2 (twice)", telc: "Hörverstehen Teil 1–3" },
  },
  {
    id: "language_awareness",
    label: "Notice and fix your own German",
    de: "Sprachbewusstsein",
    learner: "spotting the mistake you keep making, and fixing it next time",
    evidence: "explicit",
    sources: [
      { board: "goethe", ref: "Prüfungsziele §4.5", quote: "Sprachbewusstsein", note: "third defining feature of the level" },
      { board: "telc", ref: "CEFR S. 131", quote: "sich seine Hauptfehler merken", note: "self-monitoring — how the level operationalises it" },
    ],
    resources: ["self-correction", "recognising a known personal error", "rewriting to fix it"],
    // Measurable by diffing check_ids across a submission and its rewrite. Both
    // are already stored. This is why rewrite-and-compare is a capability and
    // not a motivational feature.
    checks: [],
    experiences: ["writing_rewrite", "grammar", "maya", "exam"],
    exam: { goethe: "Korrektheit", telc: "Korrektheit" },
  },

  /* ── ADDED FOR core-2026b ────────────────────────────────────────────────
     Both came out of the three-book audit as high-recurrence gaps, and both are
     added only now that core-2026b actually measures them. Declaring a
     capability with nothing behind it is how `exemplify`,
     `maintain_discussion` and `react_unexpected` ended up declared and
     unmeasured; that is not repeated here.

     core-2026a is untouched. Adding entries to this list cannot change it —
     its items name their own capabilities and none of them is one of these. */
  {
    id: "summarise",
    label: "Say the gist in your own words",
    de: "zusammenfassen",
    learner: "pulling the point out of something long, without retelling all of it",
    // The single highest-recurrence gap in the audit: trained across 6+ modules
    // in Kontext and Aspekte, with four dedicated strategies between them, and
    // tested in the written and oral parts of both boards.
    evidence: "explicit",
    sources: [
      { board: "goethe", ref: "Prüfungsziele §4.5",
        quote: "Informationen zusammenfassen und weitergeben" },
      { board: "telc", ref: "CEFR S. 96 (Verarbeitung von Texten)",
        quote: "Hauptpunkte zusammenfassen" },
      { book: "Kontext B2", ref: "K7 M4, K12 M4, S04",
        quote: "Informationen aus verschiedenen Quellen schriftlich zusammenfassen" },
      { book: "Aspekte neu B2", ref: "K8 M2, K10 M2",
        quote: "Strategie: Notizen für Zusammenfassungen nutzen" },
    ],
    resources: [
      "Die Texte behandeln das Thema …",
      "Die Hauptpunkte lassen sich folgendermaßen zusammenfassen: …",
      "Zusammenfassend kann man sagen, …",
      "nominalisation to compress a clause into a phrase",
    ],
    /* No detector yet. Summaries are judged by the rubric path, not by a
       check_id, and inventing one would route learners to practice that does
       not test this. Left empty deliberately. */
    checks: [],
    experiences: ["reading", "writing", "exam"],
    exam: { goethe: "Lesen/Hören → Schreiben; Sprechen Teil 1",
            telc: "Schriftlicher Ausdruck; Mündlich Teil 1" },
  },
  {
    id: "ask_followup",
    label: "Ask when you have not understood",
    de: "nachfragen",
    learner: "asking the question that stops a misunderstanding becoming a mistake",
    /* The highest-value function in the books for a nurse, and the one the
       product most conspicuously lacked. Kontext gives it its own Redemittel
       block AND a "Tipp in der Prüfung"; on a ward, not understanding and
       saying so is the difference between a safe handover and an unsafe one. */
    evidence: "explicit",
    sources: [
      { board: "goethe", ref: "Prüfungsziele §4.5",
        quote: "um Klärung bitten", note: "interaction strategies" },
      { board: "telc", ref: "CEFR S. 87 (Um Klärung bitten)",
        quote: "nachfragen, ob man das, was der Sprecher sagte, richtig verstanden hat" },
      { book: "Kontext B2", ref: "Redemittel im Überblick, K1 M4 / K3 M2 / K4 M2",
        quote: "Rückfragen stellen" },
      { book: "Kontext B2", ref: "K12 M2", quote: "Tipp in der Prüfung: Nachfragen stellen" },
    ],
    resources: [
      "Habe ich Sie richtig verstanden, dass …?",
      "Was verstehen Sie unter …?",
      "Könnten Sie das genauer erklären?",
      "Mir ist noch nicht ganz klar, was Sie mit … meinen.",
      "Können Sie dafür ein Beispiel nennen?",
    ],
    checks: [],
    experiences: ["maya", "speaking", "listening", "exam"],
    exam: { goethe: "Mündlich Teil 2 (Interaktion)", telc: "Mündlich Teil 2/3" },
  },
];

/* Dropped deliberately, recorded so nobody re-adds them without the argument:
   - `qualify`     : hedging is good teaching but neither board names it. It is
                     now a language resource under `argue`.
   - `explain_consequences` : rested on Goethe's "Ziele/Zwecke verbalisieren",
                     which is purpose, not consequence. Folded into `justify`.

   NOTE_KONSEKUTIV: analyse.js's CONNECTORS has no `konsekutiv` category, and
   `folglich`/`somit` currently sit inside `kausal`. Adding the missing words
   (sodass, infolgedessen, demzufolge) would enlarge conn.found, which feeds a
   CALIBRATED threshold. Do not touch it without a MERLIN re-run. */

const BY_ID = new Map(CAPABILITIES.map(c => [c.id, c]));

/** Goethe's published theme catalogue. Content declares one of these. */
const THEMES = {
  1: "Persönliche Daten und Verhältnisse", 2: "Wohnen, Umwelt",
  3: "Tägliches Leben, Arbeit", 4: "Freizeit, Unterhaltung", 5: "Reise",
  6: "Beziehungen zu anderen Menschen, Kultur, Tradition", 7: "Gesundheit und Hygiene",
  8: "Erziehung, Ausbildung, Lernen", 9: "Konsum, Handel", 10: "Ernährung",
  11: "Dienstleistungen", 12: "Orte", 13: "Sprache, Kommunikation", 14: "Klima",
};

/* Difficulty characteristics a piece of content may carry.
   THE COMPLEXITY RULE: raise CONTENT complexity or DELIVERY complexity, never
   both in the same item. telc specifies difficult listening conditions for
   everyday-domain material and standard speech for abstract topics; an abstract
   argument delivered in dialect at speed is above B2 and unfair. */
const DIFFICULTY = {
  content: ["abstract_topic", "outside_own_experience", "inference_required",
            "implicit_cohesion", "competing_viewpoints"],
  delivery: ["authentic_speed", "regional_variation", "self_interruption",
             "background_noise", "overlapping_speech", "single_play"],
};

const CEFR_TIERS = ["foundation", "developing", "strong", "exam"];

/**
 * Validates a content declaration against the spine. Returns [] when clean.
 * Called by the authoring gate — nothing reaches `status: gated` without it.
 */
function validateDeclaration(d = {}) {
  const errs = [];
  const cap = (id) => BY_ID.has(id);

  if (!d.primary_capability) errs.push("primary_capability is required — content that maps to no capability does not ship");
  else if (!cap(d.primary_capability)) errs.push(`unknown primary_capability "${d.primary_capability}"`);

  for (const c of d.secondary_capabilities || []) {
    if (!cap(c)) errs.push(`unknown secondary_capability "${c}"`);
    if (c === d.primary_capability) errs.push(`"${c}" listed as both primary and secondary`);
  }

  if (!THEMES[d.theme]) errs.push(`theme must be 1–14 from the Goethe catalogue (got ${JSON.stringify(d.theme)})`);
  if (d.cefr_tier && !CEFR_TIERS.includes(d.cefr_tier)) errs.push(`cefr_tier must be one of ${CEFR_TIERS.join(", ")}`);

  const dif = d.difficulty || {};
  const content = dif.content || [], delivery = dif.delivery || [];
  for (const f of content) if (!DIFFICULTY.content.includes(f)) errs.push(`unknown content difficulty "${f}"`);
  for (const f of delivery) if (!DIFFICULTY.delivery.includes(f)) errs.push(`unknown delivery difficulty "${f}"`);

  /* THE COMPLEXITY RULE, enforced rather than documented. `authentic_speed` is
     exempt: the boards treat real pace as the baseline for B2, not as an added
     difficulty, and requiring slow speech would fail the level outright. */
  const realDelivery = delivery.filter(f => f !== "authentic_speed");
  if (content.includes("abstract_topic") && realDelivery.length) {
    errs.push(`complexity rule: "abstract_topic" cannot be combined with delivery difficulty (${realDelivery.join(", ")}). ` +
              `telc specifies difficult conditions for everyday-domain material and standard speech for abstract topics.`);
  }

  // A check_id we cannot detect is a promise we cannot keep.
  for (const c of d.checks || []) {
    const known = CAPABILITIES.some(x => x.checks.includes(c));
    if (!known) errs.push(`check "${c}" is not declared by any capability`);
  }
  if (!d.language_resources?.length) errs.push("language_resources is required — name the forms this teaches");
  if (!d.experience_types?.length) errs.push("experience_types is required");

  return errs;
}

/** The learner-facing sentence for a capability. Never exposes a check_id. */
function phrase(id) { return BY_ID.get(id)?.learner || null; }

/** Which capability a finding belongs to — the layer above check_id → topic. */
function capabilityForCheck(checkId) {
  return CAPABILITIES.find(c => c.checks.includes(checkId))?.id || null;
}


/* WHAT THE LEARNER IS TOLD SHE IS WORKING ON.
   A capability phrase is right for a recommendation ("practise conceding before
   you disagree"), but too broad for a single finding: telling someone whose
   sentences are short that she is working on "building an argument" is true and
   unhelpful. These are per-check, and they say what to DO — never the check id,
   never a grammar term she would have to look up.

   Anything without an entry falls back to its capability's phrase. */
const CHECK_PHRASES = {
  connector_range:     "joining your points instead of listing them",
  konjunktiv2:         "making a suggestion sound like a suggestion",
  genitiv_praep:       "the wegen / trotz endings an examiner always marks",
  register:            "keeping it written rather than spoken",
  sentence_complexity: "writing sentences that hold two ideas together",
  lexical_range:       "reaching for a more precise word",
  repetition:          "varying how you say the same thing",
  word_count:          "writing enough for it to be marked",
  email_form:          "opening and closing the way the task expects",
  content_points:      "covering every point the task asked for",
  nvv:                 "using the fixed noun-verb pairs instead of a plain verb",
  professional_register: "writing in reporting style — passive and nominal forms",
  comparative_structure: "weighing two alternatives with advantages, disadvantages and a clear preference",
  speculative_language: "formulating hypotheses and expressing uncertainty with probability markers",
  concrete_example: "backing an argument with a concrete, contextually grounded example",
  patient_register: "speaking directly to the patient in clear, empathetic plain language",
};

/* The same phrases in German. The writing loop needs them: its prompt, the
   learner's text, the analyser's detail line and every eyebrow on that screen
   are German, and an English clause dropped into the middle of a German
   sentence — "Das trägt schon: writing enough for it to be marked" — reads as a
   bug rather than as a bilingual product. The English set stays for the home
   screen and the recommender, which are English surfaces. */
const CHECK_PHRASES_DE = {
  connector_range:     "Ihre Gedanken miteinander verbinden, statt sie aufzuzählen",
  konjunktiv2:         "einen Vorschlag auch wie einen Vorschlag klingen lassen",
  genitiv_praep:       "die Endungen nach wegen und trotz, die Prüfer immer anstreichen",
  register:            "schriftlich bleiben, nicht gesprochen",
  sentence_complexity: "Sätze schreiben, die zwei Gedanken zusammenhalten",
  lexical_range:       "zum genaueren Wort greifen",
  repetition:          "dasselbe auch einmal anders sagen",
  word_count:          "genug schreiben, damit es bewertet werden kann",
  email_form:          "so anfangen und aufhören, wie die Aufgabe es erwartet",
  content_points:      "jeden Punkt abdecken, nach dem die Aufgabe fragt",
  nvv:                 "die festen Nomen-Verb-Verbindungen statt eines einfachen Verbs",
  professional_register: "im Berichtsstil schreiben — Passiv und nominale Fügungen",
  patient_register:      "die Patientin direkt und in verständlicher, empathischer Sprache ansprechen",
  information_coverage:  "alle Angaben übermitteln, die der Bericht braucht",
  comparative_structure: "zwei Optionen mit Vor- und Nachteilen abwägen und begründet Stellung beziehen",
  speculative_language:  "Hypothesen formulieren und Unsicherheit mit Wahrscheinlichkeitsausdrücken belegen",
  concrete_example:      "ein Argument durch ein konkretes, situativ verankertes Beispiel belegen",
};

/** What to tell the learner a finding is about, in German. */
function findingPhraseDe(checkId) {
  return CHECK_PHRASES_DE[checkId] || CHECK_PHRASES[checkId] || phrase(capabilityForCheck(checkId));
}

/* WHAT THE REWRITE ACTUALLY MOVED, as a countable noun.
   writing_loop.js's `measure()` returns a bare number per check; this is the
   thing that number counts, so the compare screen can say "vorher 2, jetzt 5"
   instead of only "besser geworden" and leaving the learner to diff her own
   two texts. Lives here because this file already owns every check → German
   mapping, and a check id must not reach a component.

   Checks whose measure is a COMPOSITE are deliberately absent:
   sentence_complexity adds subordinator count to average length over ten, a
   figure that counts nothing a learner could recount. An invented unit is
   worse than no line at all. */
const CHANGE_UNITS_DE = {
  connector_range:  "Verbindende Wörter",
  lexical_range:    "Abstrakte Nomen",
  konjunktiv2:      "Konjunktiv-II-Formen",
  nvv:              "Feste Nomen-Verb-Verbindungen",
  word_count:       "Wörter",
  content_points:   "Abgedeckte Inhaltspunkte",
};

/* `measure()` NEGATES these, because fewer is better. The sign flips back
   before a count is shown to anybody. */
const CHANGE_UNITS_FEWER_DE = {
  repetition:    "Wortwiederholungen",
  register:      "Umgangssprachliche Stellen",
  genitiv_praep: "Fehler nach wegen / trotz",
};

/**
 * One German sentence naming the countable change, or null when the check has
 * no unit a learner could verify.
 * @param {string} checkId @param {number|null} before @param {number|null} after
 */
function changeLineDe(checkId, before, after) {
  if (typeof before !== "number" || typeof after !== "number") return null;
  const up = CHANGE_UNITS_DE[checkId];
  if (up) return `${up}: vorher ${before}, jetzt ${after}.`;
  const down = CHANGE_UNITS_FEWER_DE[checkId];
  if (down) return `${down}: vorher ${-before}, jetzt ${-after}.`;
  return null;
}

/** What to tell the learner a finding is about. Per-check, else the capability. */
function findingPhrase(checkId) {
  return CHECK_PHRASES[checkId] || phrase(capabilityForCheck(checkId));
}

module.exports = {
  CAPABILITIES, BY_ID, THEMES, DIFFICULTY, CEFR_TIERS,
  validateDeclaration, phrase, capabilityForCheck, findingPhrase, findingPhraseDe,
  CHECK_PHRASES, CHECK_PHRASES_DE,
  CHANGE_UNITS_DE, CHANGE_UNITS_FEWER_DE, changeLineDe,
};
