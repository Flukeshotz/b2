/**
 * B2 curriculum — Phase 1.
 *
 * FOUR topics, not eight, and chosen on one criterion: the writing assessment
 * already detects them. `analyse.js` emits a `check_id` and a `weakness` for
 * each of these and for nothing else we could teach yet, so these are the only
 * topics where the loop actually closes —
 *
 *     learner writes  ->  check fails  ->  weakness  ->  THIS topic  ->  practice
 *
 * A topic the engine cannot detect is a lesson with no way to know the learner
 * needed it and no way to know it helped. Those come after the checks exist,
 * not before.
 *
 * Content shape is the A1 shape exactly — id/order_index/icon/title/capability/
 * proof/subs — because it runs through the same lesson engine and the same 19
 * step components. `checks` and `weaknesses` are metadata: stripped before the
 * row is inserted, and read by b2/curriculum.js to build the finding->topic map.
 *
 * Two subs per topic, roughly five minutes each. That is the design constraint,
 * not an accident: the learner is a nurse at the end of a shift.
 */

/* RETIRED — do not re-publish.
   These four were authored with A1 exercise mechanics: teach-card, flip,
   unlock, match, tile-assembly. Across all B2 content that is 79 A1 mechanic
   steps against 32 B2-native ones, `teach` alone appearing 30 times. That is
   recognition pedagogy in harder vocabulary.

   The GERMAN is kept deliberately — concessive connectors, Konjunktiv II,
   genitive prepositions and noun-verb pairs all belong in B2, and this file is
   where the research for them lives. What is retired is the experience design.
   Rebuilding any of them means:
       language need → notice → contrast → understand → contextual use → produce
   NOT wrapping the same teach-card in a new component. */
const RETIRED = true;
const RETIRED_REASON = "a1_methodology_conflict";

const TOPICS = [
  /* ────────────────────────────────────────────────────────────────────────
     1. CONCESSION — the single highest-value B2 move.
     `connector_range` fails a text with no concessive connector, and it is the
     most common fail across the MERLIN texts: learners who can already argue
     still assert instead of conceding, which reads as B1.
     ──────────────────────────────────────────────────────────────────────── */
  {
    id: "b2g_konzessiv",
    icon: "🔀",
    title: "Concede, then disagree",
    capability: "You can agree with part of what someone says, then make your own point.",
    proof: "Obwohl es spät ist, bleibe ich.",
    checks: ["connector_range"],
    weaknesses: ["konnektoren_range"],
    subs: [
      {
        key: "learn",
        label: "Learn",
        teaches: [
          ["obwohl", "although", "🔀"],
          ["trotzdem", "all the same", "🔀"],
          ["dennoch", "even so", "🔀"],
          ["zwar", "admittedly", "🔀"],
        ],
        steps: [
          { t: "story", lines: [
            "At B2 you are rarely asked to just agree or just disagree.",
            "You are asked to do both: give the other side something, then make your point.",
            "That move runs on four words.",
          ] },
          { t: "teach", w: 0 },
          { t: "pick", q: "Which one is <b>obwohl</b>?", from: [0, 1] },
          { t: "teach", w: 1 },
          { t: "pick", q: "Which one is <b>trotzdem</b>?", from: [1, 0] },
          { t: "hack", title: "obwohl throws the verb to the end.",
            body: "Obwohl es spät <b>ist</b>, bleibe ich. — But trotzdem does not: Es ist spät. Trotzdem bleibe ich." },
          { t: "teach", w: 2 },
          { t: "teach", w: 3 },
          { t: "match", ws: [0, 1, 2, 3] },
          { t: "build", de: ["Obwohl", "es", "spät", "ist", "bleibe", "ich"],
            en: "Although it is late, I am staying.", hard: true, extra: ["trotzdem"] },
          /* SpotMistake's first use anywhere in the product. obwohl-for-trotzdem
             is a single-token error, which is the only kind this component can
             ask about — and it is the mistake B1 writers actually make. */
          { t: "spotmistake",
            context: "A colleague writes in the handover:",
            tokens: ["Ich", "bin", "müde,", "obwohl", "arbeite", "ich", "weiter"],
            wrongIdx: 3, shouldBe: "trotzdem" },
          { t: "speak", de: "Obwohl es spät ist, bleibe ich.", en: "Although it is late, I am staying." },
        ],
      },
      {
        key: "use",
        label: "Use it",
        teaches: [
          ["allerdings", "however", "🔀"],
          ["der Dienstplan", "the shift schedule", "🗓️"],
          ["die Ausnahme", "the exception", "🔓"],
          ["zwar … aber", "admittedly … but", "🔀"],
        ],
        steps: [
          { t: "story", lines: ["Now the version you will actually write at work."] },
          { t: "teach", w: 0 },
          { t: "teach", w: 1 },
          { t: "teach", w: 2 },
          { t: "hack", title: "zwar … aber is one move, not two words.",
            body: "Say the concession with <b>zwar</b>, then turn it with <b>aber</b>: Der Plan steht <b>zwar</b> fest, <b>aber</b> wir brauchen eine Ausnahme." },
          { t: "teach", w: 3 },
          { t: "translate", de: "Der Dienstplan steht fest. Trotzdem brauchen wir eine Ausnahme.",
            en: ["The", "shift", "schedule", "is", "fixed", "All", "the", "same", "we", "need", "an", "exception"],
            extra: ["although"] },
          { t: "build", de: ["Der", "Plan", "steht", "zwar", "fest", "aber", "wir", "brauchen", "eine", "Ausnahme"],
            en: "Admittedly the plan is fixed, but we need an exception.", hard: true },
          { t: "chat", who: "Stationsleitung", avatar: "🗓️",
            goal: "Concede that the schedule is fixed — then ask for the exception anyway.",
            turns: [
              { them: "{name}, der Dienstplan steht seit Montag fest.",
                en: "{name}, the shift schedule has been fixed since Monday.",
                opts: [
                  { de: "Der Plan steht zwar fest, aber ich brauche eine Ausnahme.",
                    en: "Admittedly the plan is fixed, but I need an exception.", ok: true },
                  { de: "Ja, der Plan steht fest.", en: "Yes, the plan is fixed." },
                ] },
              { them: "Und warum sollte ich das machen?", en: "And why should I do that?",
                opts: [
                  { de: "Obwohl es kurzfristig ist, finde ich einen Tausch.",
                    en: "Although it is short notice, I will find a swap.", ok: true },
                  { de: "Trotzdem ich einen Tausch finde.", en: "(not German)" },
                ] },
            ] },
          { t: "speakcards", cards: [
            { de: "Obwohl es spät ist, bleibe ich.", en: "Although it is late, I am staying." },
            { de: "Der Plan steht zwar fest, aber wir brauchen eine Ausnahme.",
              en: "Admittedly the plan is fixed, but we need an exception." },
            { de: "Es ist kurzfristig. Trotzdem finde ich einen Tausch.",
              en: "It is short notice. All the same, I will find a swap." },
          ] },
        ],
      },
    ],
  },

  /* ────────────────────────────────────────────────────────────────────────
     2. KONJUNKTIV II. `konjunktiv2` warns on one form and fails on none. The
     finding's own wording is the lesson: "Ein Vorschlag im Indikativ wirkt als
     Behauptung, nicht als Vorschlag."
     ──────────────────────────────────────────────────────────────────────── */
  {
    id: "b2g_konjunktiv2",
    icon: "🎚️",
    title: "Suggest without demanding",
    capability: "You can propose something so it lands as a suggestion, not an order.",
    proof: "Man könnte die Übergabe früher machen.",
    checks: ["konjunktiv2"],
    weaknesses: ["konjunktiv2_argument"],
    subs: [
      {
        key: "learn",
        label: "Learn",
        teaches: [
          ["könnte", "could", "🎚️"],
          ["müsste", "would have to", "🎚️"],
          ["wäre", "would be", "🎚️"],
          ["hätte", "would have", "🎚️"],
        ],
        steps: [
          { t: "story", lines: [
            "„Wir machen die Übergabe früher.“ — that is a decision you just announced.",
            "One vowel turns it into a suggestion someone can say yes to.",
          ] },
          { t: "teach", w: 0 },
          { t: "pick", q: "Which one is <b>könnte</b>?", from: [0, 1] },
          { t: "teach", w: 2 },
          { t: "pick", q: "Which one is <b>wäre</b>?", from: [2, 3] },
          { t: "hack", title: "The umlaut is the whole trick.",
            body: "kann → <b>könnte</b>, muss → <b>müsste</b>, war → <b>wäre</b>, hatte → <b>hätte</b>. Same verb, softer claim." },
          { t: "teach", w: 1 },
          { t: "teach", w: 3 },
          { t: "match", ws: [0, 1, 2, 3] },
          { t: "build", de: ["Das", "wäre", "eine", "gute", "Lösung"],
            en: "That would be a good solution.", hard: true, extra: ["ist"] },
          { t: "spotmistake",
            context: "In a written proposal to the ward manager:",
            tokens: ["Wir", "machen", "die", "Übergabe", "früher"],
            wrongIdx: 1, shouldBe: "könnten" },
          { t: "speak", de: "Das wäre eine gute Lösung.", en: "That would be a good solution." },
        ],
      },
      {
        key: "use",
        label: "Use it",
        teaches: [
          ["die Übergabe", "the handover", "🔁"],
          ["der Vorschlag", "the proposal", "💡"],
          ["vorschlagen", "to propose", "💡"],
          ["sinnvoll", "sensible", "✅"],
        ],
        steps: [
          { t: "story", lines: ["Now put it where it earns its keep: a proposal someone can accept."] },
          { t: "teach", w: 0 },
          { t: "teach", w: 1 },
          { t: "teach", w: 2 },
          { t: "teach", w: 3 },
          { t: "hack", title: "Two openers that carry a whole proposal.",
            body: "<b>Man könnte …</b> (one could) and <b>Es wäre sinnvoll, wenn …</b> (it would make sense if). Both leave the other person room to agree." },
          { t: "build", de: ["Man", "könnte", "die", "Übergabe", "früher", "machen"],
            en: "One could do the handover earlier.", hard: true, extra: ["muss"] },
          { t: "translate", de: "Es wäre sinnvoll, wenn wir früher anfangen.",
            en: ["It", "would", "be", "sensible", "if", "we", "start", "earlier"], extra: ["is"] },
          { t: "chat", who: "Stationsleitung", avatar: "💡",
            goal: "Make the proposal — as a proposal, not an announcement.",
            turns: [
              { them: "Sie wollten etwas vorschlagen, {name}?", en: "You wanted to propose something, {name}?",
                opts: [
                  { de: "Man könnte die Übergabe früher machen.", en: "One could do the handover earlier.", ok: true },
                  { de: "Wir machen die Übergabe früher.", en: "We are doing the handover earlier." },
                ] },
              { them: "Hm. Und was bringt das?", en: "Hm. And what does that achieve?",
                opts: [
                  { de: "Es wäre sinnvoll, wenn wir mehr Zeit hätten.",
                    en: "It would be sensible if we had more time.", ok: true },
                  { de: "Es ist sinnvoll, weil wir mehr Zeit haben.",
                    en: "It is sensible because we have more time." },
                ] },
            ] },
          { t: "speakcards", cards: [
            { de: "Man könnte die Übergabe früher machen.", en: "One could do the handover earlier." },
            { de: "Das wäre eine gute Lösung.", en: "That would be a good solution." },
            { de: "Es wäre sinnvoll, wenn wir mehr Zeit hätten.", en: "It would be sensible if we had more time." },
          ] },
        ],
      },
    ],
  },

  /* ────────────────────────────────────────────────────────────────────────
     3. GENITIVE PREPOSITIONS. The only check here that fires on an outright
     ERROR rather than an absence — „wegen dem Notfall" is unambiguously wrong
     and unambiguously detectable, which makes it the cleanest routing signal
     the engine has.
     ──────────────────────────────────────────────────────────────────────── */
  {
    id: "b2g_genitiv",
    icon: "📐",
    title: "wegen, trotz + Genitiv",
    capability: "You can give a reason in writing without the mistake examiners mark every time.",
    proof: "wegen des Notfalls — not wegen dem Notfall.",
    checks: ["genitiv_praep"],
    weaknesses: ["genitiv_praep"],
    subs: [
      {
        key: "learn",
        label: "Learn",
        teaches: [
          ["wegen", "because of", "📐"],
          ["trotz", "despite", "📐"],
          ["des", "of the (m/n)", "📐"],
          ["der", "of the (f)", "📐"],
        ],
        steps: [
          { t: "story", lines: [
            "Spoken German lets „wegen dem“ slide. Written German does not.",
            "It is one of the few errors an examiner can circle without thinking.",
          ] },
          { t: "teach", w: 0 },
          { t: "teach", w: 1 },
          { t: "hack", title: "wegen and trotz both take the Genitiv.",
            body: "Masculine and neuter take <b>des</b> …<b>s</b>: wegen <b>des</b> Notfall<b>s</b>. Feminine takes <b>der</b>, with no ending: wegen <b>der</b> Verspätung." },
          { t: "teach", w: 2 },
          { t: "teach", w: 3 },
          { t: "pick", q: "Which one goes with a feminine noun — <b>der</b> or <b>des</b>?", from: [3, 2] },
          { t: "build", de: ["wegen", "des", "Notfalls"],
            en: "because of the emergency", hard: true, extra: ["dem"] },
          { t: "spotmistake",
            context: "In a written sick note:",
            tokens: ["Wegen", "dem", "Notfall", "komme", "ich", "später"],
            wrongIdx: 1, shouldBe: "des" },
          { t: "spotmistake",
            context: "In the same note, one line down:",
            tokens: ["Trotz", "der", "Verspätung", "schaffe", "ich", "die", "Übergabe"],
            wrongIdx: 1, shouldBe: "der" },
          { t: "speak", de: "Wegen des Notfalls komme ich später.", en: "Because of the emergency I will be later." },
        ],
      },
      {
        key: "use",
        label: "Use it",
        teaches: [
          ["der Notfall", "the emergency", "🚨"],
          ["die Verspätung", "the delay", "⏰"],
          ["aufgrund", "on account of", "📐"],
          ["innerhalb", "within", "📐"],
        ],
        steps: [
          { t: "story", lines: ["Same rule, three more prepositions that follow it."] },
          { t: "teach", w: 0 },
          { t: "teach", w: 1 },
          { t: "teach", w: 2 },
          { t: "teach", w: 3 },
          { t: "hack", title: "The same list, every time.",
            body: "<b>wegen · trotz · aufgrund · innerhalb · außerhalb · angesichts</b> — all Genitiv. Learn them as one group and you never have to decide again." },
          { t: "match", ws: [0, 1, 2, 3] },
          { t: "build", de: ["Trotz", "der", "Verspätung", "schaffe", "ich", "die", "Übergabe"],
            en: "Despite the delay I will make the handover.", hard: true, extra: ["dem"] },
          { t: "translate", de: "Aufgrund des Notfalls war ich später.",
            en: ["On", "account", "of", "the", "emergency", "I", "was", "later"], extra: ["despite"] },
          { t: "spotmistake",
            context: "In an email to the ward:",
            tokens: ["Innerhalb", "einem", "Monat", "bin", "ich", "wieder", "da"],
            wrongIdx: 1, shouldBe: "eines" },
          { t: "speakcards", cards: [
            { de: "Wegen des Notfalls komme ich später.", en: "Because of the emergency I will be later." },
            { de: "Trotz der Verspätung schaffe ich die Übergabe.", en: "Despite the delay I will make the handover." },
            { de: "Aufgrund des Notfalls war ich später.", en: "On account of the emergency I was later." },
          ] },
        ],
      },
    ],
  },

  /* ────────────────────────────────────────────────────────────────────────
     4. NOMEN-VERB-VERBINDUNGEN — the vocabulary track. `nvv` checks for six
     specific collocations by noun + verb stem, so these are the six taught,
     verbatim. Teaching a seventh would produce a lesson the check cannot see.

     Also the proof that review_queue holds PHRASES: "in Betracht ziehen" is a
     three-word key in a table whose `de` column is TEXT and whose PK is
     (user_id, de). No migration, and the regression suite tests exactly this.
     ──────────────────────────────────────────────────────────────────────── */
  {
    id: "b2v_nvv",
    icon: "🔗",
    title: "Noun-verb pairs that read as B2",
    capability: "You can use the fixed phrases examiners look for instead of the simple verb.",
    proof: "Wir müssen das in Betracht ziehen.",
    checks: ["nvv"],
    weaknesses: ["nvv_absent"],
    subs: [
      {
        key: "learn",
        label: "Learn",
        teaches: [
          ["in Betracht ziehen", "to take into consideration", "🔗"],
          ["zur Verfügung stehen", "to be available", "🔗"],
          ["unter Druck stehen", "to be under pressure", "🔗"],
        ],
        steps: [
          { t: "story", lines: [
            "German has a fixed pair for things you would say with one plain verb.",
            "„Wir denken darüber nach“ is fine. „Wir ziehen es in Betracht“ is B2.",
            "The verb is the part that is fixed — get that wrong and the phrase is gone.",
          ] },
          { t: "teach", w: 0 },
          { t: "teach", w: 1 },
          { t: "teach", w: 2 },
          { t: "hack", title: "The verb is not negotiable.",
            body: "<b>unter Druck stehen</b> — never „unter Druck haben“. The noun is the easy half; examiners mark the verb." },
          { t: "match", ws: [0, 1, 2] },
          { t: "build", de: ["Wir", "müssen", "das", "in", "Betracht", "ziehen"],
            en: "We have to take that into consideration.", hard: true, extra: ["nehmen"] },
          { t: "spotmistake",
            context: "In a written report:",
            tokens: ["Das", "Team", "hat", "seit", "Wochen", "unter", "Druck"],
            wrongIdx: 2, shouldBe: "steht" },
          { t: "speak", de: "Wir müssen das in Betracht ziehen.", en: "We have to take that into consideration." },
        ],
      },
      {
        key: "use",
        label: "Use it",
        teaches: [
          ["an seine Grenzen stoßen", "to reach one's limits", "🔗"],
          ["unter die Lupe nehmen", "to examine closely", "🔍"],
          ["einen Standpunkt vertreten", "to hold a position", "🔗"],
        ],
        steps: [
          { t: "story", lines: ["Three more. These three are what turn a description into an argument."] },
          { t: "teach", w: 0 },
          { t: "teach", w: 1 },
          { t: "teach", w: 2 },
          { t: "hack", title: "Where each one belongs.",
            body: "<b>an seine Grenzen stoßen</b> names the problem. <b>unter die Lupe nehmen</b> asks for scrutiny. <b>einen Standpunkt vertreten</b> is you, taking a side." },
          { t: "match", ws: [0, 1, 2] },
          { t: "build", de: ["Das", "System", "stößt", "an", "seine", "Grenzen"],
            en: "The system is reaching its limits.", hard: true, extra: ["kommt"] },
          { t: "translate", de: "Wir sollten den Dienstplan unter die Lupe nehmen.",
            en: ["We", "should", "examine", "the", "shift", "schedule", "closely"], extra: ["ignore"] },
          { t: "chat", who: "Kollegin", avatar: "🔗",
            goal: "Make the case using the pairs, not the plain verbs.",
            turns: [
              { them: "Die Station ist seit Wochen unterbesetzt.",
                en: "The ward has been understaffed for weeks.",
                opts: [
                  { de: "Das Team stößt an seine Grenzen.", en: "The team is reaching its limits.", ok: true },
                  { de: "Das Team ist müde.", en: "The team is tired." },
                ] },
              { them: "Und was schlägst du vor?", en: "And what do you suggest?",
                opts: [
                  { de: "Wir sollten den Dienstplan unter die Lupe nehmen.",
                    en: "We should examine the shift schedule closely.", ok: true },
                  { de: "Wir sollten den Dienstplan ansehen.", en: "We should look at the shift schedule." },
                ] },
            ] },
          { t: "speakcards", cards: [
            { de: "Das Team stößt an seine Grenzen.", en: "The team is reaching its limits." },
            { de: "Wir sollten den Dienstplan unter die Lupe nehmen.", en: "We should examine the shift schedule closely." },
            { de: "Ich vertrete einen klaren Standpunkt.", en: "I hold a clear position." },
          ] },
        ],
      },
    ],
  },
];

/* The track a topic appears under on the B2 surface.
   Source-derived content is published as `b2_<source>_<kind>`, so the tail
   carries the kind; the hand-authored topics that predate the content model
   carry it in the `b2g`/`b2v` prefix. The prefix-only version filed every
   source-derived experience under Grammar — including the listening. */
const TRACK_BY_TAIL = {
  listen: "listening", listening: "listening",
  chunks: "vocabulary", vocab: "vocabulary", vocabulary: "vocabulary",
  grammar: "grammar", produce: "writing", write: "writing", writing: "writing",
  vergleich: "writing", spekulation: "writing", beispiel: "writing", geben: "writing",
  read: "reading", reading: "reading", speak: "speaking", speaking: "speaking",
  /* Maya scenarios are published as b2_maya_<name>, so the tail is the scenario
     name rather than a kind. Match on the maya_ segment instead. */
  exam: "exam",
};
const TRACK_BY_PREFIX = { b2g: "grammar", b2v: "vocabulary" };

function trackOf(id, kind) {
  if (kind && Object.values(TRACK_BY_TAIL).includes(kind)) return kind;
  if (/(^|_)maya(_|$)/.test(String(id))) return "speaking";
  const tail = String(id).split("_").pop();
  return TRACK_BY_TAIL[tail] || TRACK_BY_PREFIX[String(id).slice(0, 3)] || "grammar";
}

module.exports = { TOPICS, trackOf, RETIRED, RETIRED_REASON };
