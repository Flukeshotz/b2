/**
 * WHICH CHECKS APPLY TO WHICH WRITING TASK.
 *
 * The analyser is one instrument; a writing task is a genre. Applying every
 * check to every genre produced this, measured against the teacher's own model
 * Aufnahmebericht — a text a qualified teacher wrote as exemplary B2:
 *
 *     connector_range      FAIL   only "jedoch, und" — a report does not argue
 *     konjunktiv2          FAIL   nothing in it is hypothetical
 *     sentence_complexity  FAIL   Ø 10.7 words, 0 subordinators — that is the genre
 *     nvv                  FAIL   argumentative collocations, wrong register entirely
 *     lexical_range        FAIL   clinical German is concrete, not abstract
 *
 * Five failures on a model answer. Not a broken analyser — the wrong instrument.
 *
 * THIS IS NOT LENIENCY. An Aufnahmebericht is still judged at B2: it simply is
 * judged on what telc actually scores it on — did the information get across,
 * is the register professional, is it correct, is the vocabulary precise —
 * rather than on features that belong to argumentative writing. Suppressing a
 * check requires a reason recorded here, and the reason has to be about the
 * GENRE, never about wanting a better score.
 */

const { analyse } = require("./analyse");
const pflege = require("./pflege");

/* Clinical and professional writing carries its complexity in passive and
   participial constructions and in nominal style, not in subordinate clauses.
   Measured here rather than in analyse.js so a calibrated check is not touched:
   this is a task criterion, not a new global check. */
/* German puts the participle at the END of the clause — "wurde heute um 14:30
   Uhr nach einem Sturz aufgenommen" — so a pattern requiring it adjacent to the
   auxiliary matches almost nothing. Supports regular/separable ge-participles,
   inseparable prefixes (be-, ent-, er-, ver-, zer-) and -iert participles. */
const PASSIVE = /\b(wird|wurde|werden|wurden)\b[^.;!?]{0,90}?\b(\w*ge\w{2,}(t|en)|\w{4,}iert|(be|ent|er|ver|zer)\w{2,}(t|en))\b/gi;
/* Sein-passive and predicative participles: "ist bettlägerig", "sind bekannt",
   "liegt vor", "war gehfähig" — the stative half of the register. */
const STATIVE = /\b(ist|sind|war|waren|bleibt|liegt|besteht|umfasst)\b[^.;!?]{0,70}?\b(\w{4,}(bar|fähig|lich|ig)|bekannt|dokumentiert|vor)\b/gi;
/* Nominal style: a preposition governing a nominalised noun rather than a
   clause — "bei Aufnahme", "an Vorerkrankungen", "hinsichtlich der Allergien",
   including sentence-initial prepositions and intervening adjective attributes. */
const NOMINAL = /\b([Bb]ei|[Aa]n|[Nn]ach|[Vv]or|[Zz]ur|[Zz]um|[Hh]insichtlich|[Bb]ezüglich|[Aa]ufgrund|[Tt]rotz|[Ww]egen|[Ii]m Rahmen|[Ii]n Kenntnis)\b\s+(der|dem|des|einer|einem|eines)?\s*([a-zäöüß]+\s+)*[A-ZÄÖÜ][a-zäöüßA-ZÄÖÜ]{2,}/g;

/* USE THE EXISTING PFLEGE SCORER, NOT A SECOND GUESS AT ITS JOB.
   `professional_register` still measures structural register itself (passive,
   stative, nominal style) — that is a task-profile CRITERION, not a genre
   detector, and belongs here. But it used to judge "does this sound clinical"
   from grammar alone, with zero vocabulary signal, so a passive-heavy report
   that never once said Sturz, Diabetes or Medikament could still pass. telc's
   own Wortschatz criterion (pflege.js) is exactly the calibrated answer to
   "is the vocabulary fachsprachlich", so it is reused here rather than a
   second, uncalibrated word list invented on top of it. */
function professionalRegister(text) {
  const FINITE_OR_PARTICIPLE_VERB = /\b(wird|wurde|werden|wurden|ist|sind|war|waren|hat|haben|hatte|hatten|liegt|liegen|besteht|bestehen|erfolgte|erfolgten|begann|entwickelte|klagt|entleert|verordnet|katheterisiert|eingeleitet|abgeleitet|verabreicht)\b/i;
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
  const sentencesWithVerbs = sentences.filter(s => FINITE_OR_PARTICIPLE_VERB.test(s));
  const isFragmentOnly = sentences.length > 0 && sentencesWithVerbs.length === 0;

  if (isFragmentOnly) {
    return {
      check_id: "professional_register",
      state: "fail",
      detail: "Der Text besteht nur aus isolierten Stichpunkten oder Nomen ohne vollständige Sätze. Ein Übergabebericht auf B2 verlangt ausformulierte Sätze.",
      evidence: [],
    };
  }

  const passive = (text.match(PASSIVE) || []).length;
  const stative = (text.match(STATIVE) || []).length;
  const nominal = (text.match(NOMINAL) || []).length;
  const clinical = [...new Set((text.match(pflege.CLINICAL_LEXIS) || []).map(w => w.toLowerCase()))];
  const marks = passive + stative + nominal + (clinical.length >= 2 ? 1 : 0);
  const found = [];
  if (passive) found.push(`${passive}× Passiv`);
  if (stative) found.push(`${stative}× Zustandsform`);
  if (nominal) found.push(`${nominal}× nominale Fügung`);
  if (clinical.length) found.push(`${clinical.length}× Fachvokabular`);

  let state = marks >= 5 ? "pass" : marks >= 3 ? "warn" : "fail";
  if (state === "fail" && clinical.length >= 2 && (passive || nominal || stative)) {
    state = "warn";
  }

  let detail = marks
    ? `${found.join(", ")} — das ist der Berichtsstil, den die Prüfung erwartet.`
    : (clinical.length
        ? "Zwar Fachbegriffe genannt, aber keine fachsprachlichen Strukturen (Passiv, nominale Fügungen) gebildet."
        : "Durchgehend einfache Aktivsätze ohne Fachvokabular. Ein Bericht auf B2 arbeitet mit Passiv, nominalen Fügungen und fachsprachlichen Begriffen.");

  if (state === "warn" && marks < 3) {
    detail = `${found.join(", ")} — erste fachsprachliche Ansätze erkennbar. Für B2 fehlen noch weitere Passiv- oder nominale Strukturen.`;
  }

  return {
    check_id: "professional_register",
    state,
    detail,
    evidence: [],
  };
}

/**
 * PATIENT REGISTER (lexical / pattern-based detector)
 *
 * What it measures:
 *   1. Direct patient address (Frau Sommer, Herr..., Sie, Ihnen, Ihr, Ihre, Guten Morgen/Tag).
 *   2. Understandable explanation of clinical situation (Blase, Urin, Wasserlassen, Schlauch, Druck, Narkose, OP, etc.).
 *   3. Clear explanation of next steps / care (Infusion, Tropf, Kalium, Salze/Werte, Flüssigkeit, helfen, ausgleichen).
 *   4. Empathetic reassurance and patient guidance (keine Sorge, normal/häufig, in guten Händen, schonen, melden Sie sich).
 *   5. Jargon trap detection: flags unadapted raw clinical abbreviations/strings (Z. n., 650 ml Restharn, sterile Einmalkatheterisierung).
 *
 * What it can and cannot infer:
 *   CAN: verify whether the explanation addresses the patient directly, translates clinical facts into accessible language, and includes reassuring framing.
 *   CANNOT: semantically measure bedside empathy or human tone.
 */
function patientRegister(text) {
  const ADDRESS = /\b(frau\s+[a-zäöüß]+|herr\s+[a-zäöüß]+|guten\s+(morgen|tag)|hallo|sie\b|ihnen\b|ihr\b|ihre\b|ihrem\b|ihren\b)\b/i;
  const SITUATION_PLAIN = /\b(blase|wasserlassen|urin|katheter|schlauch|druck|narkose|eingriff|operation|op|nicht klappen|angestaut|entleert|voll)\b/i;
  const NEXT_STEPS = /\b(infusion|tropf|fl(ü|ue)ssigkeit|kalium|salze|werte|blut|helfen|ausgleichen|bekommen|geben|l(ä|ae)uft|erholen|ausruhen)\b/i;
  const REASSURANCE = /\b(keine sorge|keine angst|in guten h(ä|ae)nden|normal|h(ä|ae)ufig|bessert sich|schonen|melden sie sich|fragen|f(ü|ue)r sie da|geduld|wieder gut|alles in ordnung|keine gedanken)\b/i;

  const PLAIN_EXPLANATION = /\b(blase|wasserlassen|schlauch|druck|narkose|nicht klappen|angestaut|voll|urin abgelassen|urin entleert)\b/i;
  const RAW_JARGON = /\b(z\.?\s*n\.?|650\s*ml\s*restharn|sterile einmalkatheterisierung|hypokali(ä|ae)mie von 3,1|laborchemisch)\b/i;

  const hasAddress = ADDRESS.test(text);
  const hasSituation = SITUATION_PLAIN.test(text);
  const hasNextSteps = NEXT_STEPS.test(text);
  const hasReassurance = REASSURANCE.test(text);
  const hasRawJargon = RAW_JARGON.test(text);
  const hasPlainWords = PLAIN_EXPLANATION.test(text);

  const FINITE_VERB = /\b(ist|sind|war|waren|hat|haben|hatte|hatten|geht|wird|bleibt|m(ü|ue)ssen|k(ö|oe)nnen|sollten|bekommen|geben|geholfen|passiert)\b/i;
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
  const sentencesWithVerbs = sentences.filter(s => FINITE_VERB.test(s));
  const isKeywordSoup = sentences.length === 0 || sentencesWithVerbs.length === 0 || text.split(/\s+/).length < 20;

  if (isKeywordSoup) {
    return {
      check_id: "patient_register",
      state: "fail",
      detail: "Der Text enthält keine ausformulierten Sätze für ein Gespräch. Erklären Sie der Patientin die Situation in vollständigen, ruhigen Sätzen.",
      evidence: [],
    };
  }

  if (hasRawJargon && !hasPlainWords) {
    return {
      check_id: "patient_register",
      state: "fail",
      detail: "Fachbegriffe wurden unkommentiert übernommen ('Z. n.', '650 ml Restharn', 'Hypokaliämie'). Erklären Sie der Patientin die Vorgänge in verständlicher Alltagssprache ohne Fachchinesisch.",
      evidence: ["Fachjargon unübersetzt übernommen"],
    };
  }

  const passedCount = (hasAddress ? 1 : 0) + (hasSituation ? 1 : 0) + (hasNextSteps ? 1 : 0) + (hasReassurance ? 1 : 0);
  const missing = [];
  if (!hasAddress) missing.push("die Patientin direkt ansprechen (Frau Sommer, Sie, Ihnen)");
  if (!hasSituation) missing.push("die Situation verständlich erklären (Blase, Wasserlassen, Druck)");
  if (!hasNextSteps) missing.push("die nächsten Schritte erläutern (Infusion, Kalium, Erholung)");
  if (!hasReassurance) missing.push("beruhigende Worte finden (z. B. 'keine Sorge', 'das kommt nach Narkosen vor')");

  if (passedCount >= 3 && hasAddress && (hasSituation || hasNextSteps)) {
    return {
      check_id: "patient_register",
      state: "pass",
      detail: "Adressatengerechte, verständliche Aufklärung am Krankenbett: Patientin direkt angesprochen, Vorgänge ohne Fachjargon erklärt und beruhigt.",
      evidence: [],
    };
  }

  if (passedCount >= 2) {
    return {
      check_id: "patient_register",
      state: "warn",
      detail: `Ansatz zur Patientenaufklärung erkennbar. Für ein gelingendes Gespräch fehlt noch: ${missing.join("; ")}.`,
      evidence: missing,
    };
  }

  return {
    check_id: "patient_register",
    state: "fail",
    detail: "Keine gelungene Patientenansprache. Sprechen Sie die Patientin direkt an, erklären Sie Blase und Infusion in einfacher Sprache und nehmen Sie ihr die Sorgen.",
    evidence: missing,
  };
}

/* Did the facts actually get across? telc Pflege scores Aufgabenbewältigung by
   counting conveyed information items, which is a different question from
   whether the German is good. */
function informationCoverage(text, task) {
  const points = task.information_points || task.content_points || [];
  if (!points.length) return null;
  const { missing } = pflege.countInformationPoints(text, points);
  const covered = points.length - missing.length;
  return {
    check_id: "information_coverage",
    state: covered === points.length ? "pass" : covered >= points.length - 1 ? "warn" : "fail",
    detail: missing.length
      ? `${covered}/${points.length} Angaben übermittelt. Fehlt: ${missing.map(m => m.label).join(", ")}.`
      : `Alle ${points.length} Angaben übermittelt.`,
    evidence: missing.map(m => m.label),
  };
}

/**
 * COMPARATIVE STRUCTURE (lexical / pattern-based detector)
 *
 * What it measures:
 *   1. Both models explicitly addressed (Modell A / 12-Stunden-Schicht vs. Modell B / 3-Schicht-System).
 *   2. Contrast markers or comparative grammar (einerseits/andererseits, im Gegensatz zu, flexibler als, anstrengender als).
 *   3. Balanced pro and con evaluations (advantages AND disadvantages/burdens).
 *   4. Explicit preference or compromise marker (bevorzuge, halte für sinnvoller, Kompromiss, Mittelweg).
 *   5. Sentence and clausal substance (rejects keyword soup).
 *
 * What it can and cannot infer:
 *   CAN: verify whether the learner formulated an articulated two-sided comparison with evaluative balance and a preference/compromise rather than a flat unstructured list.
 *   CANNOT: semantically verify whether the arguments make clinical sense or which model is genuinely better.
 */
function comparativeStructure(text) {
  const MODEL_A = /\b(modell\s*a|12[- ]stunden|zw(ö|oe)lf[- ]stunden|erst(es|en|e)\s+modell|erste\s+variante|erst(es|en|e)\s+system)\b/i;
  const MODEL_B = /\b(modell\s*b|3[- ]schicht|drei[- ]schicht|traditionell\w*|zweit(es|en|e)\s+modell|zweite\s+variante|zweit(es|en|e)\s+system|acht[- ]stunden|8[- ]stunden)\b/i;
  const BOTH_MODELS = /\b(beid(e|en)\s+(modelle|systeme|varianten|ans(ä|ae)tze)|vergleich beider)\b/i;

  const hasModels = (MODEL_A.test(text) && MODEL_B.test(text)) || BOTH_MODELS.test(text);

  const CONTRAST = /\b(einerseits|andererseits|auf der einen seite|auf der anderen seite|im vergleich|verglichen mit|im gegensatz|demgegenüber|hingegen|dagegen|während|w(ä|ae)hrenddessen|dahingegen|allerdings|jedoch|wohingegen)\b/i;
  const COMPARATIVE_SYNTAX = /\b(flexibler als|besser als|anstrengender als|belastender als|h(ö|oe)her(e|en)? als|niedriger(e|en)? als|mehr als|weniger als|h(ö|oe)here belaste?|geringere belaste?|l(ä|ae)ngere freizeit|k(ü|ue)rzere schichten)\b/i;
  const hasContrast = CONTRAST.test(text) || COMPARATIVE_SYNTAX.test(text);

  const HAS_PRO = /\b(vorteil\w*|vorteilhaft\w*|vorz(ü|ue)g\w*|positiv\w*|gewinn|erleichterung|attraktiv\w*|begr(ü|ue)(ß|ss)enswert)\b/i.test(text);
  const HAS_CON = /\b(nachteil\w*|nachteilig\w*|kehrseite\w*|negativ\w*|belastung\w*|herausforderung\w*|problem\w*|schwierig\w*|risiko|risiken|ersch(ö|oe)pfung)\b/i.test(text);
  const hasProCon = HAS_PRO && HAS_CON;

  const PREF = /\b(bevorzug\w*|vorzuziehen|ziehe\b[^.;!?]+vor|halte\b[^.;!?]+f(ü|ue)r\s+(sinnvoller|besser|geeigneter|attraktiver)|pl(ä|ae)diere f(ü|ue)r|bef(ü|ue)rwort\w*|f(ü|ue)r mich(\s+pers(ö|oe)nlich)?\s+(ist|w(ä|ae)re)|meines erachtens (ist|w(ä|ae)re)|meiner meinung nach (ist|w(ä|ae)re)|meiner ansicht nach (ist|w(ä|ae)re)|kompromiss\w*|kombination|mittelweg|verbindung beider|ausgleich)\b/i;
  const hasPref = PREF.test(text);

  const FINITE_VERB = /\b(ist|sind|bietet|bieten|f(ü|ue)hrt|f(ü|ue)hren|eignet|erm(ö|oe)glicht|bedeutet|w(ä|ae)re|w(ü|ue)rde|haben|hat)\b/i;
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
  const sentencesWithVerbs = sentences.filter(s => FINITE_VERB.test(s));
  const isKeywordSoup = sentences.length === 0 || sentencesWithVerbs.length === 0 || text.split(/\s+/).length < 25;

  if (isKeywordSoup) {
    return {
      check_id: "comparative_structure",
      state: "fail",
      detail: "Der Text enthält keine ausformulierten Sätze. Ein B2-Vergleich verlangt grammatisch vollständige Aussagen, die beide Modelle gegenüberstellen.",
      evidence: [],
    };
  }

  const passedCount = (hasModels ? 1 : 0) + (hasContrast ? 1 : 0) + (hasProCon ? 1 : 0) + (hasPref ? 1 : 0);
  const missing = [];
  if (!hasModels) missing.push("beide Modelle explizit nennen und gegenüberstellen");
  if (!hasContrast) missing.push("Gegensätze markieren (z. B. einerseits/andererseits, im Vergleich zu, flexibler als)");
  if (!hasProCon) missing.push("Vor- und Nachteile/Belastungen benennen");
  if (!hasPref) missing.push("eine persönliche Präferenz oder einen Kompromiss begründen");

  if (passedCount === 4) {
    return {
      check_id: "comparative_structure",
      state: "pass",
      detail: "Beide Modelle einbezogen, Vor- und Nachteile abgewogen und eine eigene Positionierung bezogen — das ist ein strukturierter B2-Vergleich.",
      evidence: [],
    };
  }
  if (passedCount >= 2) {
    return {
      check_id: "comparative_structure",
      state: "warn",
      detail: `Vergleichsansatz vorhanden. Für einen vollständigen B2-Vergleich fehlt noch: ${missing.join("; ")}.`,
      evidence: missing,
    };
  }
  return {
    check_id: "comparative_structure",
    state: "fail",
    detail: "Reine Aufzählung ohne abwägende Struktur. Beziehen Sie beide Modelle ein, wägen Sie Vor- und Nachteile ab und beziehen Sie Stellung.",
    evidence: missing,
  };
}

/**
 * SPECULATIVE LANGUAGE (lexical / pattern-based detector)
 *
 * What it measures:
 *   1. Fact vs. assumption separation markers (fest steht, dokumentiert ist, Tatsache ist, unklar ist, offen ist, etc.).
 *   2. Epistemic probability markers (möglicherweise, vermutlich, wahrscheinlich, unter Umständen, etc.).
 *   3. At least two distinct hypothesis clauses (verifying separate clausal predicates rather than keyword soup).
 *
 * What it can and cannot infer:
 *   CAN: verify whether the learner uses the structural discourse markers of hypothesis formulation and graded uncertainty across multiple distinct scenarios.
 *   CANNOT: semantically verify whether clinical/medical deductions are factually plausible or correct.
 */
function speculativeLanguage(text) {
  const FACTS_UNKNOWN = /\b(fest steht|feststeht|sicher ist|tatsache ist|tats(ä|ae)chlich|bekannt ist|gesichert ist|dokumentiert ist|nachweislich|wir wissen, dass|festzuhalten ist|unklar ist|offen ist|noch nicht gekl(ä|ae)rt|ob.+ist (noch )?unklar|klar ist)\b/i;
  const PROBABILITY = /\b(m(ö|oe)glicherweise|vermutlich|wahrscheinlich|eventuell|wom(ö|oe)glich|denkbar|anzunehmen|scheint|l(ä|ae)sst (darauf )?schlie(ß|ss)en|l(ä|ae)sst vermuten|plausibel|nachvollziehbar|unter umst(ä|ae)nden|gegebenenfalls|ich nehme an|wir nehmen an|es ist anzunehmen|nicht auszuschlie(ß|ss)en|w(ä|ae)re denkbar)\b/i;

  const hasFacts = FACTS_UNKNOWN.test(text);
  const hasProbability = PROBABILITY.test(text);

  const sentences = text.split(/[.;!?]+/).map(s => s.trim()).filter(s => s.length > 5);
  const HYP_MARKER = /\b(eine (erste|weitere|zweite|andere)?\s*([a-zäöüß]+\s+)*(m(ö|oe)glichkeit|hypothese|erkl(ä|ae)rung|ursache|annahme)|k(ö|oe)nnte|d(ü|ue)rfte|w(ä|ae)re denkbar|nicht auszuschlie(ß|ss)en|nehm\w*\s+an|vermut\w*|m(ö|oe)glicherweise|unter umst(ä|ae)nden|vielleicht)\b/i;
  const FINITE_VERB = /\b(ist|sind|war|waren|hat|haben|hatte|hatten|liegt|liegen|bleibt|wurde|wurden|verlegt|mitgenommen|stecken|steckt|fehlt|abhanden|d(ü|ue)rfte|k(ö|oe)nnte|m(ü|ue)sste|sein|befindet|auftaucht)\b/i;

  const hypSentences = sentences.filter(s => HYP_MARKER.test(s) && FINITE_VERB.test(s));
  const coordinatedHyp = /\b(zum einen\b.+\bzum anderen\b|einerseits\b.+\bandererseits\b|entweder\b.+\boder\b)/i.test(text) && (text.match(/k(ö|oe)nnte|d(ü|ue)rfte|m(ö|oe)glich/gi) || []).length >= 2;
  const hasMultipleHypotheses = hypSentences.length >= 2 || coordinatedHyp;

  const sentencesWithVerbs = sentences.filter(s => FINITE_VERB.test(s));
  const isKeywordSoup = sentences.length === 0 || sentencesWithVerbs.length === 0 || text.split(/\s+/).length < 15;
  if (isKeywordSoup) {
    return {
      check_id: "speculative_language",
      state: "fail",
      detail: "Der Text enthält keine vollständigen Sätze zur Hypothesenbildung. Formulieren Sie mindestens zwei konkrete Erklärungen in vollständigen Sätzen.",
      evidence: [],
    };
  }

  const passedCount = (hasFacts ? 1 : 0) + (hasProbability ? 1 : 0) + (hasMultipleHypotheses ? 1 : 0);
  const missing = [];
  if (!hasFacts) missing.push("Gesicherte Fakten von offenen Fragen abgrenzen (z. B. 'Fest steht…', 'Dokumentiert ist…', 'Unklar ist…')");
  if (!hasProbability) missing.push("Wahrscheinlichkeitsausdrücke verwenden (z. B. vermutlich, möglicherweise, unter Umständen)");
  if (!hasMultipleHypotheses) missing.push("mindestens zwei verschiedene denkbare Hypothesen in vollständigen Sätzen formulieren");

  if (passedCount === 3) {
    return {
      check_id: "speculative_language",
      state: "pass",
      detail: "Fakten von Annahmen sauber getrennt, plausible Hypothesen aufgestellt und Unsicherheit differenziert abgestuft — gelungene B2-Spekulation.",
      evidence: [],
    };
  }
  if (passedCount >= 1) {
    return {
      check_id: "speculative_language",
      state: "warn",
      detail: `Ansatz zur Hypothesenbildung vorhanden. Für eine vollständige Fallanalyse fehlt noch: ${missing.join("; ")}.`,
      evidence: missing,
    };
  }
  return {
    check_id: "speculative_language",
    state: "fail",
    detail: "Keine Hypothesenbildung erkennbar. Trennen Sie bekannte Fakten von Vermutungen, nutzen Sie Wahrscheinlichkeitsausdrücke und formulieren Sie mindestens zwei denkbare Erklärungen.",
    evidence: missing,
  };
}

/**
 * CONCRETE EXAMPLE (lexical / pattern-based detector)
 *
 * What it measures:
 *   1. Example markers and narrative openings (beispielsweise, zum Beispiel, aus eigener Erfahrung, ich erinnere mich an, ein typischer Fall).
 *   2. Narrative situational grounding (letzte Woche, im Nachtdienst, bei einer Patientin, während der Übergabe).
 *   3. Specific consequential outcome or procedural resolution (konnte verhindert werden, fiel auf, führte dazu, Schaden abgewendet).
 *   4. Rejection of vacuous claims ("Zum Beispiel ist Kommunikation auf Station wichtig").
 *
 * What it can and cannot infer:
 *   CAN: verify whether the learner grounds a general assertion in a specific, narrative episode with context and outcome rather than an empty slogan.
 *   CANNOT: verify whether the anecdote is autobiographically true.
 */
function concreteExample(text) {
  const EXAMPLE_MARKER = /\b(beispielsweise|zum beispiel|als (konkretes|anschauliches|gutes|passendes)?\s*beispiel|ein (konkretes|anschauliches|gutes|typisches)?\s*beispiel|wie etwa|das zeigt sich (am|an)|l(ä|ae)sst sich (an|anhand)|illustriert|aus eigener erfahrung|aus meiner erfahrung|ich erinnere mich an|erinnern wir uns an|ein typischer fall|in einem konkreten fall|ein konkreter vorfall|ein ereignis|letzte[nr]?\s+woche\s+ereignete\s+sich)\b/i;
  const NARRATIVE_GROUNDING = /\b(letzte[nr]?\s+woche|im\s+letzten\s+(nacht|fr(ü|ue)h|sp(ä|ae)t)dienst|gestern|neulich|vor\s+kurzem|bei\s+ein(er|em)?\s+([a-zäöüß]+\s+)*(patient(in)?|dame|herrn|fall|kolleg(in|en)?)|w(ä|ae)hrend\s+(der|einer)?\s+([a-zäöüß]+\s+)*(ü|ue)bergabe|bei\s+(der|einer)\s+([a-zäöüß]+\s+)*(visite|medikamentengabe|aufnahme|kontrolle)|in\s+der\s+praxis|erlebte\s+(ich|man)|auf\s+([a-zäöüß]+\s+)*station)\b/i;
  const OUTCOME_DETAIL = /\b(fiel auf|fiel.+auf|stellte sich heraus|stellten sich heraus|konnte.+verhindert (werden|worden|wurde|wurden)|konnte.+abgewendet werden|konnte.+korrigiert werden|konnte.+gel(ö|oe)st werden|schaden.+vermieden|bemerkte|bemerkten|f(ü|ue)hrte dazu|entdeckt(e)?|zeigte sich|zur folge hatte|hatte zur folge|rechtzeitig bemerkt|so dass nichts passierte|sodass kein schaden|infolgedessen|verhindert wurde|abgewendet wurde)\b/i;

  const hasMarker = EXAMPLE_MARKER.test(text);
  const hasGrounding = NARRATIVE_GROUNDING.test(text);
  const hasOutcome = OUTCOME_DETAIL.test(text);

  const isVacuousClaim = /\b(ist|sind)\b[^.;!?]{0,30}\b(wichtig|bedeutend|unerl(ä|ae)sslich|notwendig|essentiell|hilfreich|zentral)\b/i.test(text) && !hasOutcome && !hasGrounding;

  const FINITE_VERB = /\b(war|waren|hatte|hatten|hat|haben|fiel|fielen|konnte|konnten|bemerkte|bemerkten|zeigte|zeigten|f(ü|ue)hrte|f(ü|ue)hrten|ist|sind|wurde|wurden|passierte|korrigierte|korrigierten|sprach|sprachen|gab|gaben|sah|sahen|stellte|stellten|kontrollierte|kontrollierten|erlebte|erlebten|kam|kamen|l(ä|ae)sst)\b/i;
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
  const sentencesWithVerbs = sentences.filter(s => FINITE_VERB.test(s));
  const isKeywordSoup = sentences.length === 0 || sentencesWithVerbs.length === 0 || text.split(/\s+/).length < 15;

  if (isKeywordSoup) {
    return {
      check_id: "concrete_example",
      state: "fail",
      detail: "Der Text enthält keine ausformulierten Sätze für ein Fallbeispiel. Schildern Sie eine konkrete Situation in vollständigen Sätzen.",
      evidence: [],
    };
  }

  if (isVacuousClaim) {
    return {
      check_id: "concrete_example",
      state: "fail",
      detail: "Das Beispiel bleibt rein abstrakt ('...ist wichtig'). Ein B2-Beispiel verlangt ein konkretes Geschehen (Vorfall, Beobachtung) und dessen Ausgang oder Konsequenz.",
      evidence: ["Abstrakte Behauptung ohne geschildertes Ereignis und Konsequenz"],
    };
  }

  const passedCount = (hasMarker ? 1 : 0) + (hasGrounding ? 1 : 0) + (hasOutcome ? 1 : 0);
  const missing = [];
  if (!hasMarker) missing.push("Beispielsignal verwenden (z. B. 'Als konkretes Beispiel…', 'Aus eigener Erfahrung…')");
  if (!hasGrounding) missing.push("situative Verankerung herstellen (z. B. 'bei einer Patientin', 'im letzten Nachtdienst')");
  if (!hasOutcome) missing.push("den konkreten Ausgang oder Verlauf schildern (z. B. was auffiel oder verhindert werden konnte)");

  if (passedCount === 3) {
    return {
      check_id: "concrete_example",
      state: "pass",
      detail: "These durch ein situativ verankertes, konkretes Fallbeispiel mit erkennbarem Hergang belegt — gelungene Exemplifizierung auf B2.",
      evidence: [],
    };
  }
  if (passedCount >= 1) {
    return {
      check_id: "concrete_example",
      state: "warn",
      detail: `Ansatz zur Exemplifizierung vorhanden. Für einen vollwertigen Beleg fehlt noch: ${missing.join("; ")}.`,
      evidence: missing,
    };
  }
  return {
    check_id: "concrete_example",
    state: "fail",
    detail: "Kein konkretes Beispiel angeführt. Belegen Sie Ihr Argument mit einem situativ verankerten Fall (z. B. 'Aus eigener Erfahrung lässt sich ein Fall anführen…').",
    evidence: missing,
  };
}

const PROFILES = {
  /* ── Goethe: an open argument. The connector and range checks were built for
     exactly this genre, and here they are the right instrument. */
  forumsbeitrag: {
    label: "Forumsbeitrag", board: "goethe", bandAffecting: true, evidenceWeight: 1.0,
    applies: ["word_count", "connector_range", "sentence_complexity", "lexical_range",
              "konjunktiv2", "repetition", "register", "nvv"],
    suppresses: [
      { check: "email_form", why: "A forum post sets no Anrede or Grußformel. telc requires them; Goethe does not." },
      { check: "content_points", why: "The topic is open — there are no Leitpunkte to cover." },
      { check: "genitiv_praep", why: "Applies, but folded into Korrektheit rather than shown as a headline in an argumentative task." },
    ],
    extra: [],
    /* WHAT THE RUBRIC ACTUALLY TURNS ON, most first. This is the "capability
       importance" half of choosing one weakness: severity alone would let a
       narrow range marker outrank a missing Inhaltspunkt, and Goethe penalises
       a missing content point far more heavily than an absent Konjunktiv II.
       Ordered by the board's own weighting, not by what is easy to detect. */
    impact: ["content_points", "connector_range", "sentence_complexity", "lexical_range",
             "word_count", "register", "repetition", "konjunktiv2", "nvv"],
    framing: "Ein Forumsbeitrag lebt vom Argument. Prüfer achten auf Konnektoren, Satzbau und Wortschatzbreite.",
  },

  /* ── telc B2: a semi-formal email answering an advert. Fixed conventions and
     Leitpunkte carry the marks; open-ended argumentation does not. */
  halbformelle_email: {
    label: "Halbformelle E-Mail", board: "telc", bandAffecting: true, evidenceWeight: 1.0,
    applies: ["word_count", "content_points", "email_form", "register",
              "genitiv_praep", "connector_range", "repetition", "sentence_complexity"],
    suppresses: [
      { check: "konjunktiv2", why: "A request may use it, but nothing in the task requires hypothetical language. Penalising its absence marks the wrong thing." },
      { check: "nvv", why: "Argumentative noun-verb collocations are not what a semi-formal email is scored on." },
      { check: "lexical_range", why: "Abstract-noun density is an essay measure. telc scores this email on conventions and coverage." },
    ],
    extra: [],
    impact: ["content_points", "email_form", "register", "connector_range",
             "sentence_complexity", "word_count", "repetition", "genitiv_praep"],
    framing: "telc bewertet hier Inhalt, kommunikative Gestaltung und Sprache — Anrede, Gruß und die Leitpunkte zählen.",
  },

  /* ── telc B1·B2 Pflege: information transfer, not argument. The genre is
     concise, declarative, passive-heavy and concrete. Every suppression below
     is because the FEATURE BELONGS TO A DIFFERENT GENRE, not because we want a
     kinder score — the bar stays B2. */
  aufnahmebericht: {
    label: "Aufnahmebericht", board: "telc_pflege", bandAffecting: true, evidenceWeight: 1.0,
    applies: ["word_count", "genitiv_praep", "register", "repetition"],
    suppresses: [
      { check: "connector_range", why: "A report states facts in sequence; it does not argue. The teacher's model B2 answer uses two connectors and is correct German." },
      { check: "konjunktiv2", why: "Nothing in an admission report is hypothetical. Its absence is the genre, not a gap." },
      { check: "sentence_complexity", why: "Concise declarative sentences ARE the register. Complexity is carried by passive and nominal style instead — measured by professional_register below." },
      { check: "nvv", why: "Argumentative collocations belong to essays. Clinical fixed phrases are a different set entirely." },
      { check: "lexical_range", why: "Measures abstract-noun density. Clinical German is precise and concrete — Sturz, Rollator, Penicillin — so this measures the wrong vocabulary." },
      { check: "email_form", why: "A report has no Anrede or Grußformel — it is documentation, not correspondence, so the convention does not exist in this genre." },
    ],
    // What REPLACES the suppressed checks. The bar is not lowered; it moves.
    extra: ["professional_register", "information_coverage"],
    impact: ["information_coverage", "professional_register", "word_count",
             "register", "genitiv_praep", "repetition"],
    framing: "telc Pflege bewertet: Aufgabenbewältigung, kommunikative Gestaltung, Korrektheit und Wortschatz. Ein Bericht wird nicht danach beurteilt, ob er argumentiert.",
  },

  /* ── General professional/workplace writing: a note, a handover message, a
     request to a manager. Register and correctness carry it. */
  workplace: {
    label: "Berufliche Mitteilung", board: null, bandAffecting: true, evidenceWeight: 0.9,
    applies: ["word_count", "register", "genitiv_praep", "connector_range", "repetition", "content_points"],
    suppresses: [
      { check: "konjunktiv2", why: "Only relevant when the task asks for a proposal. Most workplace notes state or request rather than hypothesise, so penalising its absence marks the wrong thing." },
      { check: "lexical_range", why: "Measures abstract-noun density. Workplace writing is concrete by design — dates, names, actions — so this measures the wrong vocabulary for the genre." },
      { check: "nvv", why: "The noun-verb pairs we detect are argumentative — in Betracht ziehen, einen Standpunkt vertreten. A workplace note asks for something or reports something; it does not argue, so their absence says nothing about it." },
      { check: "email_form", why: "Only applies when the task actually sets an email. A handover note or a shift message has no Anrede, and requiring one would invent a convention the task never asked for." },
    ],
    extra: ["professional_register"],
    framing: "Im Beruf zählt: verständlich, korrekt und im richtigen Ton.",
  },

  /* ── Short free production inside a training session. Not an exam task, so it
     informs the profile at lower weight — a 70-word answer is evidence, but it
     is not a marked submission. */
  free_response: {
    label: "Kurze freie Produktion", board: null, bandAffecting: true, evidenceWeight: 0.6,
    applies: ["word_count", "connector_range", "sentence_complexity", "lexical_range",
              "konjunktiv2", "register", "repetition", "genitiv_praep"],
    suppresses: [
      { check: "content_points", why: "A training prompt sets no Leitpunkte, so there is nothing to score coverage against. Running it would silently pass or silently fail on an empty list." },
      { check: "email_form", why: "A short free response is not correspondence — there is no addressee to open or close to." },
      { check: "nvv", why: "Reports 'obwohl sie im Lesetext vorkamen' — there is no Lesetext in a training prompt." },
    ],
    extra: [],
    framing: "Kurz und frei geschrieben — wir schauen auf Argument, Satzbau und Wortwahl.",
  },

  /* ── Structured comparison: weighing two options, contrasting pros and cons,
     and concluding with a justified preference or compromise. */
  vergleich: {
    label: "Abwägender Vergleich", board: null, bandAffecting: true, evidenceWeight: 1.0,
    applies: ["word_count", "connector_range", "sentence_complexity", "register", "repetition", "genitiv_praep"],
    suppresses: [
      { check: "email_form", why: "A comparative statement is an internal workplace or forum proposal, not correspondence." },
      { check: "nvv", why: "Argumentative collocations are welcome, but absence does not fail a comparison." },
      { check: "konjunktiv2", why: "A comparison evaluates factual models; subjunctive is optional for compromises but not required." },
    ],
    extra: ["comparative_structure"],
    impact: ["comparative_structure", "connector_range", "word_count", "sentence_complexity", "register"],
    framing: "Prüfer achten auf systematischen Vergleich: Vor- und Nachteile abwägen, eigene Präferenz begründen.",
  },

  /* ── Formulating hypotheses: separating observed facts from assumptions,
     expressing uncertainty with modal forms and probability adverbs. */
  spekulation: {
    label: "Hypothesen und Vermutungen", board: null, bandAffecting: true, evidenceWeight: 1.0,
    applies: ["word_count", "konjunktiv2", "connector_range", "sentence_complexity", "register", "repetition"],
    suppresses: [
      { check: "email_form", why: "Case analysis is an internal incident report or team briefing, not correspondence." },
      { check: "nvv", why: "Fixed collocations are optional in hypothesis formulation." },
    ],
    extra: ["speculative_language"],
    impact: ["speculative_language", "konjunktiv2", "word_count", "connector_range", "register"],
    framing: "Prüfer achten auf differenzierte Vermutungen: Fakten von Annahmen trennen, Wahrscheinlichkeiten sprachlich abstufen.",
  },

  /* ── Grounding an argument with a concrete example: thesis or rebuttal
     backed by a specific contextual case and observable outcome. */
  beispiel: {
    label: "Argument mit Beispiel", board: null, bandAffecting: true, evidenceWeight: 1.0,
    applies: ["word_count", "connector_range", "sentence_complexity", "register", "repetition"],
    suppresses: [
      { check: "email_form", why: "Argumentative statement is a team contribution or forum debate, not correspondence." },
      { check: "nvv", why: "Collocations are optional; the primary criterion is narrative exemplification." },
    ],
    extra: ["concrete_example"],
    impact: ["concrete_example", "connector_range", "word_count", "sentence_complexity", "register"],
    framing: "Prüfer achten auf konkrete Belege: Thesen durch greifbare Fälle und situative Details abstützen, nicht durch bloße Floskeln.",
  },

  /* ── Patient-facing explanation / bedside communication: accessible,
     reassuring explanation of situation and care. Suppresses abstract essay
     metrics (lexical_range, nvv, konjunktiv2) and evaluates patient-directed
     clarity, appropriate lay vocabulary, and empathetic framing. */
  patientenkommunikation: {
    label: "Patientengespräch / -aufklärung", board: null, bandAffecting: true, evidenceWeight: 0.6,
    applies: ["word_count", "register", "repetition"],
    suppresses: [
      { check: "konjunktiv2", why: "Patient communication explains real clinical facts and provides reassurance; it is not a hypothetical proposal." },
      { check: "lexical_range", why: "Abstract academic nouns belong in essays. Patient communication deliberately prioritises clear, empathetic plain language." },
      { check: "nvv", why: "Argumentative noun-verb collocations create bureaucratic distance; patient explanations use approachable verbs." },
      { check: "email_form", why: "Bedside spoken communication or patient note, not formal correspondence." },
      { check: "sentence_complexity", why: "Overly nested subordinate clauses obscure clarity for patients; clear parataxis and simple hypotaxis are good clinical German." },
      { check: "connector_range", why: "Argumentative connectors (obwohl, dennoch) are not required when explaining bedside care." },
    ],
    extra: ["patient_register"],
    impact: ["patient_register", "word_count", "register", "repetition"],
    framing: "Prüfer achten auf adressatengerechte Sprache: verständlich erklären, Fachjargon vermeiden und die Patientin beruhigen.",
  },
};

/* Every real, chosen profile says so explicitly. `free_response` above is a
   deliberate genre — a short in-lesson prompt, authored as such — and it must
   never be confused with "we were not told what this is". That confusion was
   the actual regression: an unrecognised or missing task type silently aliased
   to `free_response`, so its check set (argumentative: connectors, Konjunktiv
   II, sentence complexity, lexical range) got applied to whatever the text
   really was — and a clinical Aufnahmebericht run through a path that forgot
   to say what it was got a Forumsbeitrag-shaped verdict with no record that
   anything had been assumed. */
for (const p of Object.values(PROFILES)) p.fallback = false;

/* THE EXPLICIT UNKNOWN STATE. Same check set as `free_response` — a broad,
   argumentative default is the least-wrong guess available with no other
   information — but `fallback: true` marks it as exactly that: a guess, not a
   genre. Every caller that reaches this must be able to see it happened
   (assessForTask's returned `profile.fallback`, surfaced by /produce as
   `taskTypeFallback` in the response, and logged server-side) rather than
   reading a task type that looks chosen. */
const UNSPECIFIED = "__unspecified__";
PROFILES[UNSPECIFIED] = {
  ...PROFILES.free_response,
  label: "Nicht angegeben",
  fallback: true,
  framing: "Für diesen Text wurde keine Aufgabenart übermittelt — bewertet mit einem allgemeinen, vorsichtigen Maßstab.",
};

const DEFAULT = "free_response";

function profileFor(taskType) {
  if (taskType && PROFILES[taskType]) return PROFILES[taskType];
  return PROFILES[UNSPECIFIED];
}

/**
 * Run the analyser and return ONLY what this genre is scored on, plus the
 * task-specific criteria that replace what was suppressed.
 *
 * @returns {{profile, findings, suppressed, all}}
 */
function assessForTask(text, task = {}) {
  const profile = profileFor(task.task_type);
  if (profile.fallback) {
    /* VISIBLE, not silent — this is the fix. A caller that forgot to say what
       genre it was assessing gets a working answer (the broadest reasonable
       check set) and a server-side trace of exactly when and why, rather than
       a check set that reads as a deliberate choice. See the comment on
       UNSPECIFIED above for what actually broke because this used to be
       silent. */
    console.warn(
      `[task_profiles] no recognised task_type ("${task.task_type ?? "none"}") — ` +
      `assessing with the UNSPECIFIED fallback profile. Every writing entry point ` +
      `should pass a real task_type or taskId; this is a caller bug, not a content one.`);
  }
  const { findings: all, metrics } = analyse(text, task);

  const applies = new Set(profile.applies);

  /* SUPPRESS BECAUSE OF THE GENRE, NEVER BECAUSE OF AN ASSUMPTION ABOUT IT.
     `forumsbeitrag` suppressed content_points on the grounds that "the topic is
     open — there are no Leitpunkte to cover". That is true of some forum posts
     and false of Goethe's Schreiben Aufgabe 1, which prints four of them under
     "Gehen Sie dabei auf folgende Punkte ein". Both Homeoffice tasks in the
     database carry four. So the check now follows the TASK: if it lists content
     points, covering them is scored, whatever the genre's default is.
     Suppression stays a statement about the material, which is the whole
     argument for task-aware assessment.

     Not for telc Pflege: that profile already measures coverage with
     `information_coverage`, which counts conveyed facts rather than argument
     moves. Adding content_points there would report the same gap twice under
     two names. */
  const coversPointsAlready = (profile.extra || []).includes("information_coverage");
  if ((task.content_points || []).length && !coversPointsAlready) applies.add("content_points");

  const findings = all.filter(f => applies.has(f.check_id));

  for (const id of profile.extra) {
    const extra = id === "professional_register" ? professionalRegister(text)
                : id === "patient_register" ? patientRegister(text)
                : id === "information_coverage" ? informationCoverage(text, task)
                : id === "comparative_structure" ? comparativeStructure(text)
                : id === "speculative_language" ? speculativeLanguage(text)
                : id === "concrete_example" ? concreteExample(text)
                : null;
    if (extra) findings.push(extra);
  }

  const suppressed = all
    .filter(f => !applies.has(f.check_id))
    .map(f => ({
      /* `check` as well as `check_id`: the review surface and the tests both
         read this list, and half of them were looking for `check`, which was
         never there — printing an empty name for every suppression. */
      check: f.check_id,
      check_id: f.check_id,
      state: f.state,
      why: profile.suppresses.find(s => s.check === f.check_id)?.why
        || "Not scored for this task type.",
    }));

  return { taskType: task.task_type || null, profile, findings, suppressed, all, metrics };
}

/** The one weakness to show, from the checks this genre is actually scored on. */
function topFinding(findings, trainedCapabilities = []) {
  const rank = { fail: 0, warn: 1, pass: 2 };
  const caps = require("./capabilities");
  const trained = new Set(trainedCapabilities);
  return findings
    .filter(f => f.state !== "pass")
    .sort((a, b) => (rank[a.state] - rank[b.state]) ||
      ((trained.has(caps.capabilityForCheck(b.check_id)) ? 1 : 0) -
       (trained.has(caps.capabilityForCheck(a.check_id)) ? 1 : 0)))[0] || null;
}

module.exports = { PROFILES, DEFAULT, UNSPECIFIED, profileFor, assessForTask, topFinding, professionalRegister, patientRegister, comparativeStructure, speculativeLanguage, concreteExample };
