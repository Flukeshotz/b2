/**
 * telc Deutsch B1·B2 Pflege — Schreiben.
 *
 * A different exam from telc Deutsch B2, not a variant of it, and the one
 * internationally trained nurses actually sit. Three things differ in ways
 * that break the general engine outright:
 *
 *   1. FOUR criteria (Aufgabenbewältigung, Kommunikative Gestaltung,
 *      Korrektheit, Wortschatz), each scored 0-5.
 *   2. The scale is banded to CEFR LEVELS, not to a pass mark: 5 = B2 gut
 *      erfüllt, 4 = B2 erfüllt, 3 = B1 gut erfüllt, 2 = B1 erfüllt, 1 = A2,
 *      0 = below A2. The exam awards a level. There is no "60% to pass".
 *   3. The task is an Aufnahmebericht or Biographiebericht written FROM
 *      tabular patient data, so content is scored by counting which required
 *      pieces of information actually arrived — not by matching opinions.
 *
 * Source: telc Deutsch B1·B2 Pflege, Übungstest 1, Bewertungskriterien
 * „Schreiben" (pp. 35-36).
 */

const { words } = require("./analyse");

/* The published band table for Criterion I is a count of missing information,
   which is unusually concrete for a rubric — so we implement it literally
   rather than approximating it with a percentage. */
function contentBand(missing) {
  if (missing === 0) return 5;
  if (missing === 1) return 4;
  if (missing <= 3) return 3;
  if (missing <= 5) return 2;
  return 1;                    // six or more incomplete
  // 0 is not reachable here — it is the "more than half wrong" case, applied
  // by the caller, because it depends on the total as well as the count.
}

const FORMAL_OPENERS = /(sehr geehrte|hiermit|im folgenden|die patientin|der patient|frau |herr )/i;
/* A clinical report is not an essay. It links with temporal and evidential
   markers — „bei Aufnahme", „vor dem Sturz", „aktuell", „laut Angaben" — far
   more than with argumentative connectors, so an essay-shaped list scored a
   competent Aufnahmebericht as disjointed. */
const CONNECTIVES = /\b(außerdem|zudem|ferner|des weiteren|darüber hinaus|daraufhin|anschließend|danach|zunächst|schließlich|derzeit|aktuell|bislang|weiterhin|zusätzlich|da|weil|obwohl|jedoch|allerdings|sowie|sodass|damit|während|nachdem|seit|laut|gemäß|zufolge|bei aufnahme|vor dem|nach dem|zum zeitpunkt|es besteht|es liegt|liegt vor|ist zu beachten|als \\w+ sind|hinsichtlich|bezüglich|in bezug auf)\b/gi;
const COLLOQUIAL = /\b(echt|voll|krass|halt|irgendwie|kriegen|okay|ok|mega|bisschen)\b/gi;

/* Fachsprachlicher Wortschatz. Criterion IV explicitly rewards accuracy across
   general, occupational AND specialist vocabulary, so a report written in
   correct but wholly everyday German cannot reach the top band. */
const CLINICAL_LEXIS = /\b(aufnahme\w*|anamnese|diagnose\w*|befund\w*|verdacht|symptom\w*|beschwerden|schmerz\w*|medikament\w*|dosierung|verordnet\w*|einnahme|blutdruck|puls|temperatur|sauerstoffs(ä|ae)ttigung|atemfrequenz|vitalzeichen|vitalparameter|fraktur|sturz\w*|gest(ü|ue)rzt|mobilit(ä|ae)t|mobilisation|gehf(ä|ae)hig|dekubitus|sturzgefahr|allergi\w*|unvertr(ä|ae)glich\w*|vorerkrankung\w*|operation\w*|katheter|infusion|zugang|wunde|verband|pflegebed(ü|ue)rftig\w*|pflegegrad|orientiert|desorientiert|ansprechbar|bettl(ä|ae)gerig|inkontinen\w*|ern(ä|ae)hrung|kostform|hilfsmittel|rollator|gehstock|angeh(ö|oe)rige\w*|betreuung|visite|(ü|ue)bergabe|dokumentation|dokumentiert|kontrolliert|patientin|patient|station|diabetes|hypertonie|bluthochdruck)\b/gi;

/* Everyday words standing in for the clinical term — „Zucker" for Diabetes,
   „eine Tablette" for a named medication, „das Bein tut weh" for Schmerzen.
   telc's A2 band for Wortschatz is "ein begrenzter Wortschatz in Zusammenhang
   mit konkreten Alltagsbedürfnissen", which is precisely this: the writer knows
   the facts but has only lay language to report them in. Counting clinical
   terms alone missed it, because these texts contain a few real terms too. */
const LAY_SUBSTITUTES = /\b(zucker|(eine|die) tablette|tabletten|tut weh|weh tun|gefallen|hingefallen|kann nicht (gehen|laufen|aufstehen)|ein bisschen verwirrt|alt|die familie|krank)\b/gi;

const uniq = (m) => [...new Set((m || []).map(x => x.toLowerCase()))];

function safeTest(pattern, text) {
  if (typeof pattern !== "string" || !pattern.trim()) return false;
  try { return new RegExp(pattern, "i").test(text); } catch { return false; }
}

/**
 * Which required information points a text actually conveys — the ONE piece
 * of this scorer that a second, cruder implementation duplicated elsewhere.
 * task_profiles.js's `informationCoverage()` used to run its own copy of
 * exactly this loop against a differently-named field (`content_points`
 * instead of `information_points`, the field every real telc-Pflege task row
 * actually carries), which meant it silently found nothing to check on a real
 * Aufnahmebericht: not the wrong answer, no answer at all. Exported so both
 * callers share one counting rule instead of two that can drift apart.
 *
 * @param {string} text
 * @param {Array<{id, label_de, detector}>} points
 */
function countInformationPoints(text, points) {
  const found = (points || []).map(p => ({
    id: p.id,
    label: p.label_de || p.id,
    ok: safeTest(p.detector, text),
  }));
  return { found, missing: found.filter(p => !p.ok) };
}

/**
 * @param {string} text  the learner's Aufnahmebericht
 * @param {object} task  { information_points: [{id, label_de, detector}], target_words }
 */
function score(text, task = {}) {
  const t = (text || "").trim();
  const wc = words(t).length;
  const points = task.information_points || [];

  const { found, missing: missingList } = countInformationPoints(t, points);
  const missing = missingList.length;

  /* "Hat der Text keine Verbindung mit dem Schreibanlass, so müssen die
     Kriterien II, III und IV ebenfalls mit 0 bewertet werden."

     We first read that as "more than half the information missing", and an
     examiner's marking proved it wrong: two thin reports that were plainly
     ABOUT the right patient and the right admission were voided outright and
     reported as below A2, where she marked them A2. Poor coverage is not the
     same as no connection — telc voids a text on the wrong subject, not a weak
     one on the right subject. Only a text that reaches NONE of the required
     information is disconnected; thin coverage is scored by Criterion I, which
     is exactly what that criterion is for. */
  const disconnected = points.length > 0 && missing === points.length;

  const conn = uniq(t.match(CONNECTIVES));
  const colloquial = uniq(t.match(COLLOQUIAL));
  const lexis = uniq(t.match(CLINICAL_LEXIS));
  const lay = uniq(t.match(LAY_SUBSTITUTES));
  const formal = FORMAL_OPENERS.test(t);

  // II — Kommunikative Gestaltung: formal register for a clinical context,
  //      plus connectives binding it into a coherent whole.
  let gestaltung;
  if (colloquial.length >= 2) gestaltung = 1;
  else if (!formal && conn.length < 2) gestaltung = 1;
  else if (conn.length >= 5 && formal && !colloquial.length) gestaltung = 5;
  else if (conn.length >= 3 && formal) gestaltung = 4;
  else if (conn.length >= 2 && formal) gestaltung = 3;
  else gestaltung = 2;

  // IV — Wortschatz: differentiated, and specifically fachsprachlich.
  const ttr = wc ? new Set(words(t.toLowerCase())).size / wc : 0;
  let wortschatz;
  if (lexis.length >= 10 && ttr >= 0.55) wortschatz = 5;
  else if (lexis.length >= 7) wortschatz = 4;
  else if (lexis.length >= 4) wortschatz = 3;
  else if (lexis.length >= 2) wortschatz = 2;
  else wortschatz = 1;
  // Lay language carrying the clinical load caps this at the A2 band, however
  // many specialist words happen to appear elsewhere in the text.
  if (lay.length >= 3 && lay.length >= lexis.length) wortschatz = 1;

  /* III — Korrektheit is error density: grammar, spelling, punctuation. Regexes
     cannot see that, and guessing it from the one or two error patterns we can
     match would be inventing a band. Left null for the model to fill. */
  const korrektheit = null;

  const criteria = {
    aufgabenbewaeltigung: {
      band: disconnected ? 0 : (points.length ? contentBand(missing) : null),
      basis: "deterministic",
      detail: points.length
        ? `${points.length - missing} von ${points.length} Informationen wiedergegeben.`
        : "Keine Informationspunkte definiert.",
      missing: found.filter(p => !p.ok).map(p => p.label),
    },
    gestaltung:   { band: disconnected ? 0 : gestaltung, basis: "deterministic",
                    detail: `${conn.length} Verknüpfungsmittel${formal ? ", formeller Einstieg" : ", kein formeller Einstieg"}${colloquial.length ? `, umgangssprachlich: ${colloquial.join(", ")}` : ""}.` },
    korrektheit:  { band: disconnected ? 0 : korrektheit, basis: korrektheit === null ? "unscored" : "deterministic",
                    /* "wird vom Modell bewertet" told the learner about our
                       architecture, not about her German. `basis` already
                       carries that fact for the review surface, which is where
                       it belongs. The meaning is unchanged: this criterion is
                       not scored by the deterministic pass. */
                    detail: "Grammatik und Rechtschreibung werden gesondert bewertet." },
    wortschatz:   { band: disconnected ? 0 : wortschatz, basis: "deterministic",
                    detail: `${lexis.length} fachsprachliche Begriffe erkannt${lay.length ? `; umgangssprachlich statt fachsprachlich: ${lay.slice(0, 3).join(", ")}` : ""}.` },
  };

  return finalise(criteria, { wc, missing, total: points.length, disconnected, lexis, lay, conn });
}

/* 5,4 → B2 · 3,2 → B1 · 1 → A2 · 0 → below. The exam reports a LEVEL, so a
   percentage would be the wrong shape of answer entirely. */
function levelFor(band) {
  if (band >= 4) return "B2";
  if (band >= 2) return "B1";
  if (band >= 1) return "A2";
  return "unter A2";
}

function finalise(criteria, metrics) {
  const bands = Object.values(criteria).map(c => c.band);
  const scored = bands.filter(b => b !== null);
  const incomplete = bands.some(b => b === null);

  // Content at 0 voids the whole writing performance.
  const voided = criteria.aufgabenbewaeltigung.band === 0;

  const points = voided ? 0 : (incomplete ? null : scored.reduce((a, b) => a + b, 0));

  /* The published table bands each criterion to a level but does not state how
     the four combine into the reported one. We take the WEAKEST scored
     criterion, because a level claims the candidate can do all of it — and
     because averaging would let a rich vocabulary paper over missing content.
     Flagged as our reading, not telc's rule. */
  const limiting = scored.length ? Math.min(...scored) : null;

  return {
    board: "telc_pflege",
    criteria,
    points, max: 20,
    voided,
    incomplete,
    level: voided ? "unter A2" : (limiting === null ? null : levelFor(limiting)),
    level_basis: "weakest criterion — our reading; telc does not publish the aggregation rule",
    metrics,
  };
}

module.exports = { score, contentBand, levelFor, CLINICAL_LEXIS, countInformationPoints };
