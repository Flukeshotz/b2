/**
 * Content gates for a B2 source and its experiences.
 *
 * Runs before anything reaches a human reviewer, and nothing reaches a learner
 * without both. These check the things a person is bad at checking — index
 * arithmetic, duplicate options, a phrase taught that was never said — so the
 * teacher's attention is spent on the German.
 *
 *   node tools/gate_b2_source.js src_muede
 */

const path = require("path");
const caps = require("../src/b2/capabilities");
const { analyse } = require("../src/b2/analyse");
const taskProfiles = require("../src/b2/task_profiles");

/* Language a prompt must not contain, per check: handing the learner the exact
   forms the assessment looks for turns writing into transcription. */
const PROMPT_GIVEAWAYS = {
  connector_range: /\b(obwohl|trotzdem|dennoch|allerdings|einerseits|andererseits)\b/i,
  konjunktiv2: /\b(hätte|wäre|könnte|würde)\b[^.!?]{0,40}\b(ge\w{2,}(t|en)|\w{4,}iert)\b/i,
};

/* Tasks the gate can inspect. Populated by the caller when a database is
   available; empty means the task-level rules are skipped rather than guessed. */
let KNOWN_TASKS = {};
function setKnownTasks(map) { KNOWN_TASKS = map || {}; }

const READQ_MODES = ["attribute", "stance", "relation", "implication", "intention", "meaning"];

/* Mechanics that manipulate a sentence somebody else wrote. Every one of them
   is an A1 step type, and every one can be completed without understanding what
   the sentence is FOR — which is the whole objection. A B2 grammar experience
   that reaches for these has become a grammar worksheet with harder words. */
const A1_MECHANICS = ["build", "spotmistake", "pick", "translate", "keypad", "race",
                      "oddoneout", "soundmatch", "match", "scenetap"];

/* Terminology the learner must never NEED. It may appear as a label once the
   meaning is established; it may not appear in the questions that establish it. */
const GRAMMAR_TERMS = /\b(konjunktiv|indikativ|partizip|infinitiv|nebensatz|hauptsatz|akkusativ|dativ|genitiv|präteritum|plusquamperfekt|passiv|modalverb|konjugation)\w*/i;

/* KEIN FACHWISSEN — clinical vocabulary an item may not REQUIRE.
   `sonde` is split out because it was matching the conjunction "sondern": the
   trailing \w* let a stem swallow an ordinary German word and blocked a source
   whose only offence was writing "nicht X, sondern Y". Sonde is matched as a
   whole word or as the tail of a compound (Magensonde, Ernährungssonde)
   instead. */
const CLINICAL = new RegExp(
  "\\b(dekubitus|katheter|intraven|infusion|vitalparameter|anamnese|dosierung|" +
  "diagnose|therapieplan|beatmung|reanimation)\\w*" +
  "|\\b\\w*sonden?\\b", "i");

function gateSource(src, exps) {
  const fails = [], warns = [];
  const F = (m) => fails.push(m), W = (m) => warns.push(m);
  const G0 = F;   // step-level grammar failures read better with their own name

  /* 1 — DECLARATION. Content that maps to no capability cannot be
     recommended, explained or measured, so it does not ship. */
  for (const e of caps.validateDeclaration(src.DECLARATION)) F(`declaration: ${e}`);

  /* Text sources (a forum thread, an article) and audio sources share this
     gate on purpose: both are authored turns with a named speaker, and every
     check below — taught-before-tested, answer keys, level, the complexity rule
     — is about the content, not about how it reaches the ear. What differs is
     named explicitly rather than guessed at. */
  const isAudio = (src.KIND || "audio") === "audio";
  const script = src.SCRIPT.map(t => t.de).join(" ").toLowerCase();
  const markers = src.MARKERS || [];

  if (!isAudio) {
    for (const f of ["TRANSCRIPT", "SCRIPT"]) if (!src[f]) F(`text source is missing ${f}`);
    /* A text has no delivery. Declaring difficulty it cannot have would let a
       source claim complexity credit for nothing. */
    if ((src.DECLARATION.difficulty?.delivery || []).length)
      F("a text source cannot declare delivery difficulty — there is no delivery");
    /* Attribution items answer with a handle, and a handle that is not in the
       thread is an answer key pointing at nobody. */
    const handles = new Set((src.VOICES || []).map(v => v.handle));
    if (!handles.size) F("text source declares no VOICES — attribution items have nothing to answer with");
    for (const e of exps) for (const [i, st] of e.steps.entries()) {
      if (st.t === "readq" && st.mode === "attribute")
        for (const o of st.options || [])
          if (!handles.has(o)) F(`${e.id}[${i}]: attribute option "${o}" is not a poster in this thread`);
    }
  }

  /* 2 — TAUGHT BEFORE TESTED. Every marker and every taught chunk must occur in
     the script the learner has already heard. This is the standing content rule,
     and here it is checkable rather than aspirational. */
  for (const m of markers) {
    if (!script.includes(m.match.toLowerCase())) F(`marker "${m.phrase}" never occurs in the script`);
    if (!m.why) W(`marker "${m.phrase}" has no explanation of why it is useful`);
  }
  for (const e of exps) {
    for (const step of e.steps) {
      if (step.t !== "chunk") continue;
      const [de] = e.teaches[step.w] || [];
      if (!de) { F(`${e.id}: chunk step points at teaches[${step.w}], which does not exist`); continue; }
      /* The quote is an EXCERPT of a turn, not the whole turn — quoting a
         forty-word turn back at the learner is worse teaching than lifting the
         clause the expression lives in. So: substring, not equality. */
      if (!step.quote) { F(`${e.id}: chunk "${de}" has no quote from the script`); continue; }
      if (!src.SCRIPT.some(t => t.de.includes(step.quote)))
        F(`${e.id}: chunk quote does not occur in the script — "${step.quote.slice(0, 50)}…"`);
      /* And the taught expression must actually be in the line it is quoted
         from. Citation forms are inflected in real speech ("etwas in Kauf
         nehmen" → "nimmt das ja in Kauf"), so match on the longest content
         word rather than the whole citation form. */
      const head = de.toLowerCase().split(/[\s,]+/).sort((a, b) => b.length - a.length)[0];
      if (head && !step.quote.toLowerCase().includes(head.slice(0, Math.max(5, head.length - 2))))
        W(`${e.id}: taught chunk "${de}" is hard to find in its own quote`);
    }
  }

  /* 2b — EXPRESSIONS. An expression is the thing this product asks a learner to
     carry into next month, so the bar is higher than "it is B2 vocabulary".
     Every rule below is a way a word list sneaks back in. */
  const exprMod = src.CHUNKS || null;
  if (exprMod) {
    const seenId = new Set(), seenCite = new Set();
    for (const x of exprMod.EXPRESSIONS) {
      const at = (m) => `expression "${x.id}": ${m}`;
      if (seenId.has(x.id)) F(at("duplicate id"));
      seenId.add(x.id);
      const cite = x.citation.toLowerCase().replace(/[…\s]+/g, " ").trim();
      if (seenCite.has(cite)) F(at("duplicate expression — already taught under another id"));
      seenCite.add(cite);

      /* Present in the source, verbatim. Not "close to"; the learner is told
         somebody wrote this. */
      if (!src.SCRIPT.some(t => t.de.includes(x.occurrence)))
        F(at(`its occurrence is not in the source — "${x.occurrence.slice(0, 45)}…"`));
      /* And the taught form has to be recognisable in that occurrence, or the
         source reference is decoration.
         THE PATTERN IS THE PRECISE VERSION OF THIS CHECK. Matching the citation
         word by word cannot cope with German: „in Kauf nehmen“ appears as
         „nimmt das ja in Kauf“, and a stem comparison rejects it. So when the
         expression's own pattern matches its occurrence, the source reference
         is already proven and any stray citation word is a warning at most.
         Without a pattern there is nothing else holding the two together, and
         the word check has to fail. */
      const patternProves = x.pattern && x.pattern.test(x.occurrence);
      for (const w of x.citation.toLowerCase().match(/[a-zäöüß]{4,}/g) || []) {
        if (/^(nicht|auch|weniger|etwas)$/.test(w)) continue;
        if (x.occurrence.toLowerCase().includes(w.slice(0, Math.max(4, w.length - 2)))) continue;
        (patternProves ? W : F)(at(`"${w}" is in the citation but not in the source line it claims to come from`));
      }

      /* AN ISOLATED WORD IS NOT A CHUNK. A single word is a dictionary entry;
         what this experience teaches is a move somebody can make. */
      const cw = x.citation.replace(/…/g, " ").trim().split(/\s+/).filter(Boolean);
      if (cw.length < 3) F(at("a single word or two is not a chunk — teach the move, not the vocabulary"));

      /* Function, not gloss. `does` is what the learner reads; a translation in
         that field is exactly the dictionary entry we refused above. */
      if (!x.does || x.does.length < 40) F(at("no `does` — say what the expression DOES, not what it means"));
      if (!x.notThis) W(at("no plausible misreading given — that is where learners actually go wrong"));
      if (!x.capability) F(at("no capability"));
      else if (!caps.BY_ID.has(x.capability)) F(at(`unknown capability "${x.capability}"`));

      /* PRODUCTION MUST NOT BE MECHANICAL. The pattern says the string is
         there; the frame says the expression was actually used. An expression
         with no frame can be satisfied by pasting it in front of anything. */
      if (!x.pattern) F(at("no pattern"));
      if (!x.frame) F(at("no frame — without one, production is satisfied by pasting the string"));
      if (x.pattern && !x.pattern.test(x.occurrence))
        F(at("its own pattern does not match the line it came from"));
      if (x.frame && !x.frame.test(x.occurrence))
        F(at("its own frame does not match the line it came from — the source does not demonstrate the move"));
      if (x.frame && x.pattern && String(x.frame) === String(x.pattern))
        F(at("frame is identical to pattern, so it checks nothing"));
      for (const k of ["absent", "frame", "good"])
        if (!x.help?.[k]) F(at(`help.${k} is missing`));
    }

    /* Steps may only point at expressions that exist. */
    for (const e of exps) for (const [i, st] of e.steps.entries()) {
      if (!["notice", "chunk_produce"].includes(st.t)) continue;
      if (!st.ex) F(`${e.id}[${i}]: ${st.t} names no expression`);
      else if (!exprMod.BY_ID.has(st.ex)) F(`${e.id}[${i}]: unknown expression "${st.ex}"`);
      if (st.t === "chunk_produce" && !st.context)
        F(`${e.id}[${i}]: production step has no situation to write about`);
    }

    /* NOTICED BEFORE CHOSEN, CHOSEN BEFORE PRODUCED — taught before tested, at
       expression level. An expression the learner is asked to produce without
       ever having been shown it is the standing rule broken. */
    for (const e of exps) {
      const noticed = new Set();
      for (const [i, st] of e.steps.entries()) {
        if (st.t === "notice") noticed.add(st.ex);
        if (st.t === "chunk_produce" && st.ex && !noticed.has(st.ex))
          F(`${e.id}[${i}]: asks the learner to produce "${st.ex}" before showing it to them`);
      }
    }
  }

  /* 2c — GRAMMAR EXPERIENCES. Grammar exists to serve meaning, so the rules
     here are all about whether the meaning came first and whether the learner
     ends up able to DO anything. */
  for (const e of exps.filter(x => x.kind === "grammar")) {
    const G = (m) => F(`${e.id}: ${m}`);
    const order = e.steps.map(st => st.t);

    /* A construction with no communicative function is a rule, and rules are
       what this product refuses to teach. */
    if (!e.function_de || e.function_de.length < 30)
      G("no `function_de` — say what a learner can DO with this, in their language");
    if (e.function_de && GRAMMAR_TERMS.test(e.function_de))
      G("the communicative function is stated in grammar terminology");

    /* NOTICE → CONTRAST → UNDERSTAND → USE, and in that order. A form explained
       before it has been noticed is rule-first teaching however it is worded. */
    const firstNotice = order.findIndex(t => t === "readq");
    const firstContrast = order.findIndex(t => t === "gcontrast");
    const firstForm = order.findIndex(t => t === "gform");
    const firstUse = order.findIndex(t => t === "guse");
    if (firstNotice < 0) G("nothing is NOTICED — the learner never meets the construction as meaning");
    if (firstContrast < 0) G("no CONTRAST — without a minimal pair there is nothing to work out");
    if (firstForm < 0) G("no UNDERSTAND step — the form is never actually stated");
    if (firstUse < 0) G("stops at recognition — the learner never uses the construction");
    if (firstNotice >= 0 && firstContrast >= 0 && firstNotice > firstContrast)
      G("CONTRAST comes before NOTICE");
    if (firstContrast >= 0 && firstForm >= 0 && firstContrast > firstForm)
      G("the form is explained before the learner has contrasted anything — that is rule-first teaching");
    if (firstForm >= 0 && firstUse >= 0 && firstForm > firstUse)
      G("the learner is asked to USE the construction before it has been explained");

    /* MEANING BEFORE TERMINOLOGY. The noticing questions have to be answerable
       by somebody who has never heard the word "Konjunktiv". */
    for (const [i, st] of e.steps.entries()) {
      if (st.t !== "readq" || (firstForm >= 0 && i > firstForm)) continue;
      const text = [st.q, ...(st.options || [])].join(" ");
      if (GRAMMAR_TERMS.test(text))
        G(`step ${i} asks about meaning using grammar terminology ("${text.match(GRAMMAR_TERMS)[0]}")`);
    }

    /* SOURCE GROUNDING. The learner is told somebody wrote this. */
    for (const [i, st] of e.steps.entries()) {
      if (!["readq", "guse", "gcontrast"].includes(st.t)) continue;
      if (st.quote && !src.SCRIPT.some(x => x.de.includes(st.quote)))
        G(`step ${i} quotes German that is not in the source`);
    }
    if (!e.steps.some(st => st.quote))
      G("nothing in the experience is grounded in the source");

    if (e.primary_capability && !caps.BY_ID.has(e.primary_capability))
      G(`unknown primary_capability "${e.primary_capability}"`);
  }

  /* 2d — WRITING EXPERIENCES. The loop is the experience: assessment that ends
     at a verdict is a score screen, and a score screen is the thing this
     product exists not to be. */
  for (const e of exps.filter(x => x.kind === "writing")) {
    const W2 = (m) => F(`${e.id}: ${m}`);
    const writeSteps = e.steps.filter(st => st.t === "write");
    const produceSteps = e.steps.filter(st => st.t === "produce");

    if (!writeSteps.length && !produceSteps.length)
      W2("a writing experience with no writing step");

    for (const [i, st] of e.steps.entries()) {
      if (st.t !== "write") continue;
      /* A stored task is what carries the board, the rubric, the target length
         and the content points. Without one the loop cannot assess against the
         right board, cannot link a rewrite to its original, and cannot say what
         was missed. An inline prompt is not a task. */
      if (!st.taskId) W2(`step ${i}: no taskId — the loop needs a stored task, not an inline prompt`);
      if (!st.experienceId) W2(`step ${i}: no experienceId, so evidence cannot be attributed`);
      /* THE PROMPT MUST NOT GIVE AWAY THE TARGET. A prompt that supplies the
         language the assessment is looking for turns writing into copying. */
      const t = KNOWN_TASKS[st.taskId];
      if (t) {
        for (const [check, giveaway] of Object.entries(PROMPT_GIVEAWAYS)) {
          if (giveaway.test(t.prompt_de || ""))
            W2(`step ${i}: the prompt hands the learner language the ${check} check looks for`);
        }
        if (!(t.content_points || []).length && t.task_type !== "free_response")
          W2(`step ${i}: task "${st.taskId}" lists no content points, so coverage cannot be assessed`);
        if (!t.target_words) W2(`step ${i}: task "${st.taskId}" has no target length`);
        if (!t.board) W2(`step ${i}: task "${st.taskId}" has no board`);
        if (!caps.CAPABILITIES.some(c => c.id === e.primary_capability))
          W2(`unknown primary_capability "${e.primary_capability}"`);
      }
    }

    /* CLAIMING language_awareness REQUIRES THE REWRITE LOOP. The capability is
       earned by noticing and correcting your own weakness; an experience that
       assesses and stops cannot demonstrate it, and listing it there would be
       a capability claimed without evidence. */
    if ((e.secondary_capabilities || []).includes("language_awareness") && !writeSteps.length)
      W2("claims language_awareness without a rewrite loop — that capability is earned by " +
         "correcting your own text, not by being assessed");
  }

  /* NO A1 MECHANICS IN B2 GRAMMAR OR VOCABULARY. Reuse the engine, not the
     methodology — this is the rule stated as a check rather than a hope. */
  for (const e of exps.filter(x => ["grammar", "vocabulary"].includes(x.kind))) {
    const found = [...new Set(e.steps.map(st => st.t).filter(t => A1_MECHANICS.includes(t)))];
    if (found.length)
      F(`${e.id}: uses A1 mechanics (${found.join(", ")}). These can be completed without ` +
        `understanding what the sentence is for. Reuse the engine, not the methodology.`);
  }

  /* 3 — ANSWER KEYS. The failure class no reviewer reliably catches. */
  const seen = new Set();
  for (const e of exps) {
    for (const [i, step] of e.steps.entries()) {
      if (step.t === "sourceq") {
        if (!Array.isArray(step.options) || step.options.length < 3) F(`${e.id}[${i}]: needs at least 3 options`);
        if (!Number.isInteger(step.answer) || step.answer < 0 || step.answer >= (step.options || []).length)
          F(`${e.id}[${i}]: answer index ${step.answer} is out of range`);
        if (new Set(step.options).size !== (step.options || []).length) F(`${e.id}[${i}]: duplicate options`);
        if (!step.explain) F(`${e.id}[${i}]: no explanation — a key without a reason teaches nothing`);
        if (!step.q) F(`${e.id}[${i}]: no question`);
        else {
          const k = step.q.replace(/\s+/g, " ").trim().toLowerCase();
          if (seen.has(k)) F(`${e.id}[${i}]: duplicate question`);
          seen.add(k);
        }
        // KEIN FACHWISSEN. Clinical language may appear in the audio; it may not
        // be required to answer. Goethe: no specialist knowledge presupposed.
        const item = [step.q || "", ...(step.options || [])].join(" ");
        if (CLINICAL.test(item)) F(`${e.id}[${i}]: item text requires clinical knowledge — "${item.match(CLINICAL)[0]}"`);
      }
      /* readq carries the same answer-key discipline as sourceq. What it adds:
         a quoted sentence must actually be IN the text. An item that asks about
         a sentence the learner cannot find is unanswerable, and this is the
         failure no reviewer catches by eye. */
      if (step.t === "readq") {
        if (!READQ_MODES.includes(step.mode)) F(`${e.id}[${i}]: unknown readq mode "${step.mode}"`);
        if (!Array.isArray(step.options) || step.options.length < 3) F(`${e.id}[${i}]: needs at least 3 options`);
        if (!Number.isInteger(step.answer) || step.answer < 0 || step.answer >= (step.options || []).length)
          F(`${e.id}[${i}]: answer index ${step.answer} is out of range`);
        if (new Set(step.options).size !== (step.options || []).length) F(`${e.id}[${i}]: duplicate options`);
        if (!step.explain) F(`${e.id}[${i}]: no explanation — a key without a reason teaches nothing`);
        if (!step.capability) F(`${e.id}[${i}]: no capability — an item that measures nothing cannot be recommended against`);
        else if (!caps.BY_ID.has(step.capability)) F(`${e.id}[${i}]: unknown capability "${step.capability}"`);
        if (step.quote && !src.SCRIPT.some(t => t.de.includes(step.quote)))
          F(`${e.id}[${i}]: quoted sentence does not occur in the text — "${step.quote.slice(0, 50)}…"`);
        if ((step.mode === "stance" || step.mode === "relation") && !step.quote)
          F(`${e.id}[${i}]: ${step.mode} items must quote the sentence they are about`);
        if (!step.q) F(`${e.id}[${i}]: no question`);
        else {
          const k = step.q.replace(/\s+/g, " ").trim().toLowerCase();
          if (seen.has(k)) F(`${e.id}[${i}]: duplicate question`);
          seen.add(k);
        }
        if (CLINICAL.test([step.q || "", ...(step.options || [])].join(" ")))
          F(`${e.id}[${i}]: item text requires clinical knowledge`);
      }
      /* chunk_choose is a SITUATION, not a gap. The rules that keep it one:
         it must describe a situation, and at least two options must be German
         somebody could actually say — an item where two options are nonsense is
         answerable by elimination and measures nothing. */
      if (step.t === "chunk_choose") {
        if (!step.q) F(`${e.id}[${i}]: no question`);
        if (!step.situation) F(`${e.id}[${i}]: no situation — a gap-fill is not a judgement item`);
        if (!Array.isArray(step.options) || step.options.length < 3) F(`${e.id}[${i}]: needs at least 3 options`);
        if (!Number.isInteger(step.answer) || step.answer < 0 || step.answer >= (step.options || []).length)
          F(`${e.id}[${i}]: answer index ${step.answer} is out of range`);
        if (new Set(step.options).size !== (step.options || []).length) F(`${e.id}[${i}]: duplicate options`);
        if (!step.explain) F(`${e.id}[${i}]: no explanation`);
        else if (!/\b(A|B|C|D)\b/.test(step.explain))
          W(`${e.id}[${i}]: the explanation does not say why the other options are wrong`);
        /* Guarded: a gate that throws on malformed content reports ONE
           failure and hides the rest, which is the opposite of what a reviewer
           needs. Every field read below has already been checked above. */
        /* `exercises` decides which expression this item's evidence is filed
           under and which ladder rung it moves. An id that is not registered
           files evidence against nothing; an id whose expression appears in
           none of the options files it against German the learner never saw. */
        for (const id of step.exercises || []) {
          const x = exprMod?.BY_ID?.get(id);
          if (!x) { F(`${e.id}[${i}]: exercises unknown expression "${id}"`); continue; }
          if (!(step.options || []).some(o => x.pattern.test(o)))
            F(`${e.id}[${i}]: claims to exercise "${id}", but no option actually uses it`);
        }
        if (step.situation) {
          const k = step.situation.replace(/\s+/g, " ").trim().toLowerCase();
          if (seen.has(k)) F(`${e.id}[${i}]: duplicate situation`);
          seen.add(k);
        }
      }
      /* A contrast is only a contrast if the variants actually differ, and only
         teaches if the explanation says what the difference MEANS. */
      if (step.t === "gcontrast") {
        const v = step.variants || [];
        if (v.length < 2) G0(`${e.id}[${i}]: a contrast needs at least two variants`);
        else {
          if (new Set(v.map(x => (x.de || "").trim())).size !== v.length)
            G0(`${e.id}[${i}]: two variants are identical — that is not a contrast`);
          for (const x of v) if (!x.de) G0(`${e.id}[${i}]: a variant has no German`);
        }
        if (!step.q) G0(`${e.id}[${i}]: no question`);
        if (!Array.isArray(step.options) || step.options.length < 2) G0(`${e.id}[${i}]: needs at least 2 options`);
        if (!Number.isInteger(step.answer) || step.answer < 0 || step.answer >= (step.options || []).length)
          G0(`${e.id}[${i}]: answer index ${step.answer} is out of range`);
        if (!step.explain) G0(`${e.id}[${i}]: no explanation`);
        else if (step.explain.length < 60)
          W(`${e.id}[${i}]: the explanation is too short to say what the difference means`);
      }
      if (step.t === "gform") {
        if (!Array.isArray(step.parts) || step.parts.length < 2)
          G0(`${e.id}[${i}]: the form must be shown as its parts, not as a rule`);
        else for (const p of step.parts) {
          if (!p.role || !p.de) G0(`${e.id}[${i}]: a part is missing its role or its German`);
        }
        if (!step.rule) G0(`${e.id}[${i}]: no rule line`);
        /* Length is the check that keeps this a card and not a chapter. */
        const total = [step.lead, step.rule, ...(step.extras || [])].join(" ").replace(/<[^>]+>/g, "");
        if (total.split(/\s+/).length > 90)
          G0(`${e.id}[${i}]: the explanation runs to ${total.split(/\s+/).length} words — keep it under 90`);
      }
      if (step.t === "guse") {
        if (!step.context) G0(`${e.id}[${i}]: no situation to write about`);
        else if (step.context.length < 40)
          G0(`${e.id}[${i}]: the situation is too thin to require the function`);
        /* A prompt that hands the learner a LIFTABLE clause is a gap-fill: they
           can copy "…, wenn man Sie gefragt hätte" straight out of the task and
           have satisfied it. Describing the situation is the prompt's job;
           reaching for the form is the learner's. A bare auxiliary in the
           framing is fine — an auxiliary with its participle is a clause. */
        const liftable = /\b(hätte|hätten|wäre|wären)\b[^.!?]{0,40}?\b(ge\w{2,}(t|en)|\w{4,}iert|worden|gewesen)\b|\b(ge\w{2,}(t|en)|\w{4,}iert|worden|gewesen)\b\s+\b(hätte|hätten|wäre|wären)\b/i;
        if (step.context && liftable.test(step.context))
          G0(`${e.id}[${i}]: the prompt hands the learner a ready-made clause ("${step.context.match(liftable)[0]}") — describe the situation, let them reach for the form`);
      }
      if (step.t === "spotmistake") {
        if (!Array.isArray(step.tokens) || !step.tokens.length) F(`${e.id}[${i}]: spotmistake has no tokens`);
        else if (step.wrongIdx < 0 || step.wrongIdx >= step.tokens.length) F(`${e.id}[${i}]: wrongIdx out of range`);
        else if (!step.shouldBe) F(`${e.id}[${i}]: no shouldBe`);
        else if (step.shouldBe === step.tokens[step.wrongIdx]) F(`${e.id}[${i}]: shouldBe is identical to the wrong token`);
      }
      if (step.t === "pick") {
        if (!Array.isArray(step.from) || step.from.length < 2) F(`${e.id}[${i}]: pick needs at least 2 options`);
        else for (const w of step.from) if (!e.teaches[w]) F(`${e.id}[${i}]: pick references teaches[${w}], which does not exist`);
        if (new Set(step.from).size !== step.from.length) F(`${e.id}[${i}]: duplicate pick options`);
      }
      if (step.t === "produce") {
        if (!step.prompt) F(`${e.id}[${i}]: produce step has no prompt`);
        if (!step.minWords) W(`${e.id}[${i}]: no minWords — the learner cannot tell what is enough`);
        /* THE REGRESSION THIS CATCHES: a `produce` step with neither a
           `taskId` nor a `taskType` is silently assessed against an
           unspecified-genre fallback at runtime — the exact path that flagged
           a teacher's exemplary Aufnahmebericht for missing Konjunktiv II
           because nothing told the server it was a clinical report and not an
           argumentative one. Caught here, at publish time, rather than
           discovered live against a learner's real writing. `taskId` is
           exempted from the type check — a stored task carries its own
           task_type from the database and is trusted. */
        if (!step.taskId) {
          if (!step.taskType) F(`${e.id}[${i}]: produce step has no taskId and no taskType — ` +
            `it would be assessed against an unspecified-genre fallback at runtime`);
          else if (!(step.taskType in taskProfiles.PROFILES) || taskProfiles.PROFILES[step.taskType].fallback)
            F(`${e.id}[${i}]: taskType "${step.taskType}" is not a real task profile`);
        }
      }
    }
  }

  /* 4 — LEVEL. We refuse to publish German our own engine would mark below B2.
     The transcript is speech, so the letter-shaped checks are skipped. */
  const { findings } = analyse(src.TRANSCRIPT, { target_words: 400, task_type: "forumsbeitrag" });
  /* sentence_complexity is excluded for AUDIO sources on purpose. It is
     calibrated on written exam texts, where long subordinated sentences are the
     B2 signal. Real spoken German runs shorter — a discussion is full of
     "Sondern?" and "Sehen Sie." — so applying it to a transcript measures the
     wrong thing and would push us toward writing dialogue nobody speaks. The
     other two checks stay: connector range and lexical range are level signals
     in speech as much as in writing. */
  const relevant = isAudio && src.DECLARATION.primary_capability === "understand_speech"
    ? ["connector_range", "lexical_range"]
    : ["connector_range", "sentence_complexity", "lexical_range"];
  for (const f of findings.filter(x => relevant.includes(x.check_id))) {
    if (f.state === "fail") F(`level: the script itself fails ${f.check_id} — ${f.detail}`);
    else if (f.state === "warn") W(`level: script only warns on ${f.check_id} — ${f.detail}`);
  }

  /* 5 — COMPLEXITY RULE, again at source level (the validator covers the
     declaration; this catches a script that drifted abstract after the fact). */
  const d = src.DECLARATION.difficulty || {};
  if ((d.content || []).includes("abstract_topic") &&
      (d.delivery || []).filter(x => x !== "authentic_speed").length)
    F("complexity rule: abstract content combined with difficult delivery");

  /* 6 — SHAPE.
     NOT "every source must yield a production task". A source that naturally
     supports listening and vocabulary and nothing more should stop there —
     manufacturing a writing task to hit a count produces the padding this
     product is supposed to avoid. What IS required: the source must declare
     what it can carry, and a source that carries only recognition must say so
     rather than pretending otherwise. */
  const kinds = new Set(exps.map(e => e.kind));
  const produces = kinds.has("writing") || kinds.has("speaking");
  if (!produces && !src.DECLARATION.recognition_only)
    F("this source generates no production experience. If that is correct for the material, " +
      "set `recognition_only: true` in its declaration with a reason. If it is not correct, " +
      "the source is being under-used.");
  if (produces && src.DECLARATION.recognition_only)
    W("declared recognition_only but yields a production experience — remove the flag.");
  /* RETRIEVAL IS NOT B2. A comprehension experience of either kind has to ask
     for at least one thing the text does not say. For listening that is an
     `inference` sourceq; for reading it is an implication or intention item. */
  const allSteps = exps.flatMap(e => e.steps);
  if (exps.some(e => e.kind === "listening") && !allSteps.some(s => s.kind === "inference"))
    F("no inference item — B2 listening requires more than retrieval");
  /* A vocabulary experience that stops at recognition is a word list with
     better manners. */
  if (exps.some(e => e.kind === "vocabulary") && !allSteps.some(s => s.t === "chunk_produce"))
    F("the vocabulary experience never asks the learner to produce anything");
  if (exps.some(e => e.kind === "reading") &&
      !allSteps.some(s => s.t === "readq" && ["implication", "intention"].includes(s.mode)))
    F("no implication or intention item — B2 reading requires more than retrieval");

  return { fails, warns, ok: fails.length === 0 };
}

if (require.main === module) {
  const id = process.argv[2] || "src_muede";
  /* Load the stored tasks so the writing rules can actually run. Without a
     database the gate still works — it simply reports fewer things, which is
     better than inventing a verdict about a task it cannot see. */
  try {
    require("../src/env")();
    const { Pool } = require("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://localhost/learn_german" });
    pool.query(`SELECT t.id, t.prompt_de, t.content_points, t.target_words, r.board, r.task_type
                  FROM b2_tasks t JOIN b2_rubrics r ON r.id=t.rubric_id`)
      .then(({ rows }) => {
        setKnownTasks(Object.fromEntries(rows.map(r => [r.id, r])));
        return pool.end();
      })
      .then(run)
      .catch(() => run());
  } catch { run(); }
  function run() {
  const src = require(path.join(__dirname, `../src/seed/b2/${id}.js`));
  const { EXPERIENCES } = require(path.join(__dirname, `../src/seed/b2/exp_${id.replace(/^src_/, "")}.js`));
  const r = gateSource(src, EXPERIENCES);
  console.log(`\nGATES — ${id}\n`);
  for (const w of r.warns) console.log(`  WARN  ${w}`);
  for (const f of r.fails) console.log(`  FAIL  ${f}`);
  console.log(`\n  ${r.fails.length} failure(s), ${r.warns.length} warning(s)`);
  console.log(r.ok ? "  PASSED — may go to teacher review\n" : "  BLOCKED — cannot go to review\n");
  process.exit(r.ok ? 0 : 1);
  }
}

module.exports = { gateSource, setKnownTasks };
