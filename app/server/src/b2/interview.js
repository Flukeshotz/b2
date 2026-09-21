// Interview question bank — the employer interview, not the exam.
//
// WHY THIS EXISTS. Four independent sources now say the same thing: the sales
// team's client conversations ("clients want to see practice and preparation,
// not just certification"), the second sales interview ("interview prep flagged
// as the most important differentiator"), the learner interviews (one candidate's
// stated goal is the employer interview rather than the certificate), and the
// call engine ("most candidates are seeking interview preparation... they already
// have or are close to having B2"). The certificate is not the bottleneck for
// these people. The interview is.
//
// FORMAT, from published recruitment guidance: a 30-60 minute VIDEO call, and it
// checks LANGUAGE rather than practical nursing skill. Some agencies run a video
// pre-screen first, then employer HR. That is why practice here is spoken and
// timed rather than written.
//
// `sourced: true` means the question appears in published German nursing
// interview guidance. `sourced: false` is extrapolated from the same material and
// should be checked with someone who has sat on the hiring side before it ships.

/* ── The substantiation rule ────────────────────────────────────────────────
   From a recorded coaching session with a German interview trainer, 04 Sep 2026.
   Her correction to a candidate who ended with "Ich bin eine verantwortungs-
   bewusste, lernbereite und einfühlsame Person":

     "Everybody can say this — it's all ChatGPT generated, I hear it twenty-five
      times a day. If you have to show you are different, substantiate with
      examples. B2 means going one level deeper."

   Her model answer was not a better adjective, it was a procedure: "wenn ich die
   Vitalzeichen messe, desinfiziere ich meine Hände, kontrolliere ich, dass die
   Geräte kalibriert sind; bei Medikamenten prüfe ich die fünf R."

   No generic AI interviewer flags this — an LLM reads a fluent list of adjectives
   as a good answer, which is precisely why every candidate sounds identical. */

/* What each claim actually MEANS, so the learner is told how to show it rather
   than only that they failed to. Straight from the trainer, who did not just
   reject the adjective — she unpacked it:

     "What does Verantwortungsbewusstsein mean? I am diligent. How do I show my
      diligence? By doing all my procedures and activities in the correct way,
      without any shortcuts. That is when you show you take ownership."

   Assessment without this is a scold. This is the difference between a grader
   and a coach. */
const CLAIM_MEANING = {
  verantwortungsbewusst: "doing every procedure the correct way, with no shortcuts — hand disinfection, calibrated equipment, the 5 R, documenting immediately",
  zuverlässig: "the shift after you never has to redo or chase your work",
  sorgfältig: "checking twice where a mistake would reach the patient",
  lernbereit: "something specific you did not know, and what you did about it",
  teamfähig: "a moment you covered for someone, or asked for cover, and how you said it",
  belastbar: "a shift that went badly and what you actually did during it",
  einfühlsam: "one patient, one thing you noticed that nobody asked you to notice",
  geduldig: "a patient who took a long time, and how you handled the queue behind them",
};

/* She asked for the introduction "professionell". The candidate answered with
   "in meiner Freizeit gehe ich gerne spazieren und höre Musik" — a rehearsed
   A2/B1 closing line that belongs in a school exam, not an employer interview.
   The trainer set the register in the question; nothing checked whether the
   answer honoured it.

   This is not about hobbies being wrong. It is that seconds spent on Musik are
   seconds not spent on the ward, the shifts and the duties she never reached. */
const OFF_REGISTER = /(freizeit|hobby|hobbys|gerne spazieren|h(ö|oe)re (gerne )?musik|lese gerne|meine familie ist|ich mag)/i;

const CLAIM_WORDS = /\b(verantwortungs?bewusst|lernbereit|einf(ü|ue)hlsam|teamf(ä|ae)hig|belastbar|zuverl(ä|ae)ssig|flexibel|motiviert|geduldig|sorgf(ä|ae)ltig|p(ü|ue)nktlich|freundlich|hilfsbereit|engagiert|kommunikativ|organisiert|stressresistent|gewissenhaft|selbstst(ä|ae)ndig)\w*/gi;

// Evidence must be a concrete ACTION or INSTANCE. The first version accepted any
// of "in meiner", "bei uns" and a bare number — so "in meiner Freizeit gehe ich
// gerne spazieren" counted as proof of professional responsibility, and a year
// ("2026") counted as a fact. Both passed the exact answer the trainer had just
// corrected. A loose evidence test is worse than none: it certifies the failure.
const EVIDENCE_MARKERS = new RegExp([
  "zum beispiel", "beispielsweise", "konkret",
  "einmal als", "als ich .{0,40}(hatte|war|musste|habe)", "damals",
  // a procedure described — which is what the trainer actually asked for
  "wenn ich .{0,60}(desinfizier|kontrollier|pr(\u00fc|ue)f|messe|dokumentier|gebe)",
  "ich (habe|hatte) .{0,40}(kontrolliert|gepr(\u00fc|ue)ft|dokumentiert|gegeben|gemessen|desinfiziert)",
  "f(\u00fc|ue)nf r", "sechs r",
  // a clinical quantity, not a calendar year
  "\\b\\d+ ?(mg|ml|patient|betten|stunden|minuten)",
].join("|"), "i");

function substantiation(text) {
  const claims = [...new Set((text.match(CLAIM_WORDS) || []).map(w => w.toLowerCase()))];
  const hasEvidence = EVIDENCE_MARKERS.test(text);
  return { claims, hasEvidence, unsupported: claims.length > 0 && !hasEvidence };
}

/* ── Clinical frameworks ────────────────────────────────────────────────────
   The trainer did something a generic interviewer never does: she checked a
   known list for COMPLETENESS. The candidate offered "richtiger Patient" and she
   said "that is the last one — there are many coming before that."

   That is checkable, it is real clinical German, and it is exactly the depth she
   means by "B2 is one level deeper". Knowing the framework exists is B1; being
   able to name its parts under pressure, in German, is the job. */

const FRAMEWORKS = {
  fuenf_r: {
    label: "die 5 R der Medikamentengabe",
    cue: /(f(ü|ue)nf r|5 r|sechs r|medikamentengabe|medikamente gebe)/i,
    parts: [
      { id: "medikament", label: "richtiges Medikament", re: /richtige[sn]? medikament/i },
      { id: "dosis",      label: "richtige Dosis",       re: /richtige dos/i },
      { id: "patient",    label: "richtiger Patient",    re: /richtige[rn]? patient/i },
      { id: "zeit",       label: "richtige Zeit",        re: /richtige[rn]? (zeit|zeitpunkt)/i },
      { id: "form",       label: "richtige Applikationsform", re: /richtige (applikation|anwendung|form|art)/i },
    ],
  },
  vitalzeichen: {
    label: "die Vitalzeichen",
    cue: /vitalzeichen|vitalwerte/i,
    parts: [
      { id: "rr",     label: "Blutdruck",   re: /blutdruck|rr/i },
      { id: "puls",   label: "Puls",        re: /puls|herzfrequenz/i },
      { id: "temp",   label: "Temperatur",  re: /temperatur|fieber/i },
      { id: "atmung", label: "Atmung",      re: /atmung|atemfrequenz/i },
      { id: "spo2",   label: "Sauerstoffsättigung", re: /sauerstoff|spo2|s(ä|ae)ttigung/i },
    ],
  },
};

/**
 * Only checks a framework the candidate BROUGHT UP themselves. Volunteering "die
 * fünf R" and then naming one of them is the gap the trainer caught; never
 * mentioning it at all is a different answer, not a wrong one, and penalising
 * that would be inventing a requirement she did not set.
 */
function frameworkCheck(text) {
  const out = [];
  for (const [id, f] of Object.entries(FRAMEWORKS)) {
    if (!f.cue.test(text)) continue;
    const got = f.parts.filter(p => p.re.test(text));
    const missing = f.parts.filter(p => !p.re.test(text));
    if (got.length && missing.length) out.push({ id, label: f.label, got: got.length, total: f.parts.length, missing: missing.map(m => m.label) });
  }
  return out;
}

/* ── Self-introduction structure ────────────────────────────────────────────
   The shape the trainer expects, in her order. Missing a block is not an error
   in German — it is an interview that wanders, which is what makes everything
   after it harder. */
const INTRO_BLOCKS = [
  { id: "beruf",    label: "your profession",        re: /(ich bin|von beruf|arbeite als).{0,40}(pflege|krankenschwester|krankenpfleger|nurse)/i },
  { id: "ausbild",  label: "training or practicum",  re: /(ausbildung|studium|praktikum|abgeschlossen|bachelor)/i },
  { id: "wo",       label: "where you worked",       re: /(krankenhaus|klinik|station|hospital|abteilung)/i },
  { id: "schicht",  label: "your shift pattern",     re: /(schicht|dienstplan|fr(ü|ue)hdienst|sp(ä|ae)tdienst|nachtdienst)/i },
  { id: "aufgaben", label: "your duties",            re: /(aufgaben|vitalzeichen|medikament|dokumentation|betreu)/i },
  { id: "sprachen", label: "your languages",         re: /(sprache|spreche|muttersprache|englisch|deutsch)/i },
];

function introStructure(text) {
  const present = INTRO_BLOCKS.filter(b => b.re.test(text));
  const missing = INTRO_BLOCKS.filter(b => !b.re.test(text));
  return { present: present.map(b => b.id), missing: missing.map(b => b.label), score: present.length / INTRO_BLOCKS.length };
}

/* Model answers, spoken. The trainer did not describe a good answer, she SAID
   one — at B2 pace, with the procedure in it. A learner who has only read
   "substantiate with examples" still does not know what that sounds like in
   German at speed. These are hers where the transcript gives them, and written
   in her shape where it does not. */
const MODEL_ANSWERS = {
  vorstellen: "Ich bin Krankenpflegerin von Beruf. Meine Ausbildung habe ich 2024 abgeschlossen, danach habe ich zwei Jahre auf einer inneren Station in Hyderabad gearbeitet, im Schichtdienst — Früh, Spät und Nacht. Zu meinen Aufgaben gehörten die Kontrolle der Vitalzeichen, die Medikamentengabe nach ärztlicher Anordnung und die Dokumentation. Wenn ich Vitalzeichen messe, desinfiziere ich zuerst die Hände und kontrolliere, ob die Geräte kalibriert sind. Bei der Medikamentengabe prüfe ich immer die fünf R: richtiges Medikament, richtige Dosis, richtiger Patient, richtige Zeit, richtige Applikationsform. Meine Muttersprache ist Kannada, außerdem spreche ich Englisch und Deutsch.",
  warum_deutschland: "Mich überzeugt vor allem, wie strukturiert hier gearbeitet wird — feste Standards, klare Übergaben, und die Möglichkeit, mich fachlich weiterzuentwickeln. In meinem letzten Haus habe ich viel improvisieren müssen; hier möchte ich nach einem Standard arbeiten und dabei lernen. Und die Fachweiterbildung nach der Anerkennung ist für mich ein konkretes Ziel.",
  stress: "Letzten Winter waren wir im Frühdienst zu zweit für achtzehn Patienten, weil zwei Kolleginnen krank waren. Ich habe zuerst nach Dringlichkeit sortiert: Medikamente und Vitalzeichen zuerst, Körperpflege danach. Dann habe ich die Stationsleitung informiert, dass die Dokumentation später kommt. Es war anstrengend, aber niemand ist zu kurz gekommen.",
};

const QUESTIONS = [
  // The universal opener. Every one of these interviews starts here, and the
  // transcript shows the structure a trainer expects: Beruf, Ausbildung, where
  // you worked, shifts, duties, languages — and only THEN qualities, each backed.
  {
    id: "vorstellen",
    de: "Können Sie sich bitte kurz vorstellen — professionell?",
    category: "self",
    sourced: true,
    assesses: "Structure, with no pressure on you yet. If this is shapeless, everything after it is harder.",
    trap: "Ending on a list of adjectives about yourself with nothing behind them.",
    strong: "Beruf, Ausbildung, wo Sie gearbeitet haben, Schichten, Aufgaben, Sprachen — und für jede Eigenschaft ein Beispiel.",
    followUp: "Geben Sie mir ein paar Beispiele, wo Sie Ihr Verantwortungsbewusstsein gezeigt haben.",
  },

  // ── Motivation. The block that appears in almost every interview ──────────
  {
    id: "warum_deutschland",
    de: "Warum möchten Sie in Deutschland arbeiten?",
    category: "motivation",
    sourced: true,
    assesses: "Whether you will stay. This is the single most reported question.",
    // The trap is specific and well documented, and it is the one candidates
    // walk into most often.
    trap: "Leading with salary. Employers read it as: you would leave for a better offer.",
    // Fires only in the OPENING of the answer — mentioning pay later, in context,
    // is fine. It is leading with it that costs the job.
    trapDetect: { pattern: "(gehalt|geld|verdien|bezahl|lohn)", scope: "opening" },
    strong: "The structure of the healthcare system, working conditions, further training, work-life balance.",
    followUp: "Und wenn Ihnen ein anderes Land mehr Gehalt bietet — würden Sie dann wechseln?",
  },
  {
    id: "warum_pflege",
    de: "Warum haben Sie sich für den Pflegeberuf entschieden?",
    category: "motivation",
    sourced: true,
    assesses: "Whether the choice is considered or accidental.",
    trap: "A story with no specifics. 'I like helping people' is what everyone says.",
    strong: "One concrete moment, and what it taught you about the work.",
    followUp: "Was war der schwierigste Tag in Ihrem Beruf, und was haben Sie daraus gelernt?",
  },
  {
    id: "warum_unsere_klinik",
    de: "Warum haben Sie sich gerade bei uns beworben?",
    category: "motivation",
    sourced: true,
    assesses: "Whether you looked them up. Employers expect you to know their focus areas.",
    trap: "An answer that would fit any hospital.",
    strong: "Naming something specific — a department, a care philosophy, a project.",
    followUp: "Was wissen Sie über unsere Station?",
  },

  // ── Self-assessment ───────────────────────────────────────────────────────
  {
    id: "staerken_schwaechen",
    de: "Was sind Ihre Stärken und Schwächen?",
    category: "self",
    sourced: true,
    assesses: "Self-awareness, and whether you can talk about a weakness without hiding.",
    trap: "A disguised strength ('I work too hard'). Interviewers hear it every time.",
    trapDetect: { pattern: "(zu (viel|hart|genau|perfekt)|perfektionist|arbeite zu)", scope: "all" },
    strong: "A real weakness plus what you actively do about it.",
    followUp: "Und woran merken Sie, dass sich das verbessert hat?",
  },

  // ── Experience ────────────────────────────────────────────────────────────
  {
    id: "bisherige_erfahrung",
    de: "Welche Erfahrungen haben Sie in der Pflege bereits gesammelt?",
    category: "experience",
    sourced: true,
    assesses: "Scope of practice, and whether you can describe clinical work in German.",
    trap: "Listing job titles instead of describing what you actually did.",
    strong: "Ward type, patient numbers, the tasks you owned.",
    followUp: "Beschreiben Sie mir einen typischen Frühdienst bei Ihnen — von Anfang bis Ende.",
  },
  {
    id: "arbeitsalltag",
    de: "Wie sah ein normaler Arbeitstag bei Ihrer letzten Stelle aus?",
    category: "experience",
    sourced: true,
    assesses: "Whether your described experience holds up under detail.",
    trap: "Vagueness. Detail is what makes it believable.",
    strong: "A sequence with times, handovers and responsibilities.",
    followUp: "Und wie viele Patientinnen und Patienten haben Sie dabei betreut?",
  },

  // ── Clinical situations ───────────────────────────────────────────────────
  {
    id: "aerztliche_anweisung",
    de: "Was tun Sie, wenn Sie mit einer ärztlichen Anweisung nicht einverstanden sind?",
    category: "clinical",
    sourced: true,
    assesses: "Whether you can escalate without either obeying blindly or going around the doctor.",
    trap: "Saying you would simply carry it out. Silent compliance is a patient-safety answer they do not want.",
    strong: "Ask, state the concern with a reason, document it, escalate up the line if unresolved.",
    followUp: "Und wenn die Ärztin auf der Anweisung besteht?",
  },
  {
    id: "prioritaeten",
    de: "Was hat für Sie Vorrang, wenn es sehr viel zu tun gibt?",
    category: "clinical",
    sourced: true,
    assesses: "Whether you triage by clinical urgency or just work faster.",
    trap: "\u201EIch mache alles\u201C. Nobody believes it, and it dodges the question.",
    strong: "A stated order — vital signs and medication first, documentation after — and who you tell.",
    followUp: "Und was lassen Sie dann liegen?",
  },
  {
    id: "schmerzen",
    de: "Wie gehen Sie vor, wenn ein Patient über Schmerzen klagt?",
    category: "clinical",
    sourced: true,
    assesses: "Whether you have an assessment routine rather than a sympathetic reflex.",
    trap: "Going straight to medication without assessing first.",
    strong: "Assess and rate the pain, check the chart, inform the Arzt, document, then reassess.",
    followUp: "Und wenn der Patient sich nicht äußern kann?",
  },
  {
    id: "team_beschreibung",
    de: "Wie würde Ihr jetziges Team Sie beschreiben?",
    category: "personal",
    sourced: true,
    assesses: "Whether your self-description survives being put in someone else's mouth.",
    trap: "Three adjectives with nothing behind them.",
    strong: "Two or three qualities, each with a moment a colleague would actually recall.",
    followUp: "Und was würde Ihre Stationsleitung anders sehen?",
  },
  {
    id: "fuenf_jahre",
    de: "Wo sehen Sie sich beruflich in fünf Jahren?",
    category: "personal",
    sourced: true,
    assesses: "Whether you are planning to stay — the thing they are actually paying to find out.",
    trap: "Plans that lead out of nursing, or out of Germany.",
    strong: "A direction inside the profession: a Fachweiterbildung, a ward, a role.",
    followUp: "Und was brauchen Sie von uns, damit das gelingt?",
  },
  {
    id: "patientenart",
    de: "Welche Art von Patienten bekommen Sie auf Ihrer Station?",
    category: "clinical",
    sourced: true,   // verbatim from a recorded screening call
    assesses: "Whether you can describe your actual ward in concrete clinical terms.",
    trap: "Naming a department and stopping. \u201ENotaufnahme\u201C is not an answer to this.",
    strong: "Case types with the German names — Herzinfarkt, Schlaganfall, Polytrauma — and roughly how often.",
    followUp: "Und welcher Fall kommt bei Ihnen am häufigsten vor?",
  },
  {
    id: "unfallpatient",
    de: "Ein Unfallpatient wird hereingebracht. Was ist Ihre Aufgabe — der Reihe nach?",
    category: "clinical",
    sourced: true,   // the interviewer narrowed to this the moment the general answer got vague
    assesses: "Whether the procedure is actually yours, in order, or only described in general.",
    trap: "Jumping to the doctor. They want what YOU do in the first minutes.",
    strong: "Vitalzeichen, Zugang legen, Monitor, then informing the Arzt — sequenced, with your own role clear.",
    followUp: "Und was machen Sie zuerst, wenn der Patient nicht ansprechbar ist?",
  },
  {
    id: "notfall",
    de: "Wie gehen Sie mit einem Notfall um?",
    category: "clinical",
    sourced: true,
    assesses: "Whether you work to a standard and stay calm — both, not one.",
    trap: "Improvising. They want to hear a procedure.",
    strong: "A named sequence, plus who you call and when.",
    followUp: "Und wenn die Ärztin nicht erreichbar ist?",
  },
  {
    id: "reanimation",
    de: "Welche Schritte sind bei einer Reanimation zu beachten?",
    category: "clinical",
    sourced: true,
    assesses: "Concrete protocol knowledge, in German.",
    trap: "Knowing it in your first language but not being able to say it in German.",
    strong: "The steps in order, with the German terms.",
    followUp: "Wer übernimmt bei Ihnen die Dokumentation, während Sie reanimieren?",
  },
  {
    id: "stress",
    de: "Wie gehen Sie mit stressigen Situationen um?",
    category: "clinical",
    sourced: true,
    assesses: "Whether you have a real strategy or just endure it.",
    trap: "'I stay calm.' Everyone says it; nobody is asked to prove it.",
    trapDetect: { pattern: "^(ich )?(bleibe|bin) (immer )?(ruhig|gelassen)", scope: "opening" },
    strong: "A concrete situation, what you did, what happened.",
    followUp: "Erzählen Sie mir von einer Schicht, die wirklich schlecht gelaufen ist.",
  },

  // ── Team and conflict ─────────────────────────────────────────────────────
  {
    id: "team",
    de: "Wie würden Sie Ihre Zusammenarbeit im Team beschreiben?",
    category: "team",
    sourced: true,
    assesses: "How you behave when the ward is short-staffed and tempers go.",
    trap: "Only describing harmony. They are listening for how you handle friction.",
    strong: "An example of a disagreement and how it resolved.",
    followUp: "Und wenn eine Kollegin einen Fehler macht — wie sprechen Sie das an?",
  },
  {
    id: "kritik",
    de: "Wie reagieren Sie auf Kritik von Vorgesetzten?",
    category: "team",
    sourced: false,
    assesses: "Hierarchy is explicit in German wards; they want to see you can take direction.",
    trap: "Defensiveness, or agreeing so fast it sounds hollow.",
    strong: "A specific piece of criticism you acted on.",
    followUp: "Und wenn Sie die Kritik für ungerecht halten?",
  },

  // ── Relocation and integration ────────────────────────────────────────────
  {
    id: "leben_in_deutschland",
    de: "Wie stellen Sie sich Ihr Leben in Deutschland vor?",
    category: "integration",
    sourced: true,
    assesses: "Whether you have thought past the job offer. Employers screen for people who leave in year one.",
    trap: "Only talking about work.",
    strong: "Housing, language, family, winter — evidence you have pictured it.",
    followUp: "Was wird für Sie am schwersten sein?",
  },
  {
    id: "schichtdienst",
    de: "Sind Sie bereit, im Schichtdienst zu arbeiten — auch nachts und am Wochenende?",
    category: "integration",
    sourced: false,
    assesses: "A yes/no with a reason. Hesitation here is costly.",
    trap: "Hedging.",
    strong: "A clear yes, and evidence you have already done it.",
    followUp: "Wie war das für Sie, als Sie zuletzt Nachtdienst hatten?",
  },

  // ── The gap question — the one people freeze on ───────────────────────────
  {
    id: "luecke",
    de: "Sie haben eine Zeit lang nicht als Pflegekraft gearbeitet. Können Sie mir sagen, warum?",
    category: "difficult",
    sourced: false,
    assesses: "Composure. There is no right answer — only answering without stopping.",
    trap: "Going silent, or apologising for the gap.",
    strong: "Name it, say what you did in that time, move on.",
    followUp: "Und was haben Sie in dieser Zeit gemacht, um fachlich auf dem Stand zu bleiben?",
  },
  {
    id: "fragen_an_uns",
    de: "Haben Sie noch Fragen an uns?",
    category: "difficult",
    sourced: true,
    assesses: "The last thing they remember. Having no questions reads as no interest.",
    trap: "'No, everything is clear.'",
    trapDetect: { pattern: "(nein|keine fragen|alles klar|alles beantwortet)", scope: "opening" },
    strong: "Two questions about the ward, the team or the Einarbeitung.",
    followUp: null,
  },
];

const CATEGORIES = {
  motivation: "Why Germany, why nursing, why us",
  self: "Talking about yourself",
  experience: "Your clinical background",
  clinical: "Situations on the ward",
  team: "Working with colleagues",
  integration: "Living and working in Germany",
  difficult: "The ones people freeze on",
};

/**
 * A practice set. Weighted toward the questions that actually appear, with at
 * least one from `difficult` — because handling an unprepared follow-up is the
 * skill the interview tests, and rehearsing only the easy ones builds a
 * confidence that collapses in the room.
 */
function practiceSet(n = 5, { categories = null } = {}) {
  const pool = categories ? QUESTIONS.filter(q => categories.includes(q.category)) : QUESTIONS.slice();
  const hard = pool.filter(q => q.category === "difficult");
  const rest = pool.filter(q => q.category !== "difficult").sort(() => Math.random() - 0.5);
  const set = rest.slice(0, Math.max(0, n - 1));
  if (hard.length) set.splice(Math.floor(Math.random() * (set.length + 1)), 0, hard[Math.floor(Math.random() * hard.length)]);
  return set.slice(0, n);
}

/* ── Responsive follow-ups ──────────────────────────────────────────────────
   An interview is not a quiz. The B2 threshold — and the thing that actually
   loses jobs — is sustaining a position across turns while someone probes it.
   One canned follow-up per question tests memory; a follow-up chosen from what
   the candidate ACTUALLY said tests the skill.

   Rules, not a model: an LLM here would be slower, non-deterministic and no
   better at picking which of four pressures to apply. */

const PROBES = {
  // The trainer's own move. The highest-value follow-up in the set, because the
  // claim-without-evidence answer is the most common one she hears.
  substantiate: "Geben Sie mir ein konkretes Beispiel dafür. Wann haben Sie das gezeigt?",
  // Her first move when an answer did not land was not a new question — it was
  // the SAME one again: "Noch einmal bitte." Rephrasing lets a candidate dodge;
  // repeating makes them face it, and it is what an interviewer actually does.
  repeat: "Noch einmal bitte — ich stelle die Frage anders herum. Antworten Sie ruhig langsam.",
  // They fell into the trap -> press exactly there.
  trap: {
    warum_deutschland: "Und wenn Ihnen ein anderes Land mehr Gehalt bietet — würden Sie dann wechseln?",
    staerken_schwaechen: "Das klingt eher nach einer Stärke. Nennen Sie mir eine echte Schwäche.",
    stress: "Das sagen alle. Erzählen Sie mir von einer konkreten Schicht, in der Sie es nicht geschafft haben.",
    fragen_an_uns: "Wirklich keine? Dann frage ich anders: was möchten Sie über die Station wissen?",
  },
  // Short or thin -> ask for the detail that makes it believable.
  vague: "Das war recht kurz. Erzählen Sie mir etwas konkreter — was genau haben Sie gemacht?",
  // They hesitated a lot -> a gentler prompt, because piling on pressure here
  // teaches avoidance rather than fluency.
  hesitant: "Lassen Sie sich Zeit. Sagen Sie es noch einmal in Ruhe — was ist der wichtigste Punkt?",
  // Good answer -> escalate. This is where the practice earns its keep.
  /* Real interviewers do not stay abstract. In the recorded call the employer
     asked the general duties question, heard a vague answer, and immediately
     narrowed: "wenn Sie bekommen einen Patient mit Unfall, was ist Ihre
     Aufgabe?" That narrowing is the whole test. */
  scenario: {
    aerztliche_anweisung: "Konkret: die Dosis erscheint Ihnen zu hoch. Was sagen Sie, wörtlich?",
    prioritaeten: "Ein Patient klingelt, ein anderer braucht Medikamente, das Telefon läutet. Was zuerst?",
    schmerzen: "Der Patient sagt, der Schmerz sei acht von zehn. Was machen Sie in den nächsten Minuten?",
    arbeitsalltag: "Konkret: ein Unfallpatient kommt herein. Was machen Sie zuerst?",
    patientenart: "Nehmen wir einen Herzinfarkt. Was ist dann Ihre Aufgabe?",
    notfall: "Der Patient ist nicht ansprechbar. Was tun Sie in den ersten zwei Minuten?",
    stress: "Zwei Notfälle gleichzeitig, Sie sind allein. Wie entscheiden Sie?",
    team: "Eine Kollegin macht einen Fehler bei der Übergabe. Was machen Sie?",
  },
  press: {
    warum_deutschland: "Und was, wenn Sie nach einem Jahr merken, dass Ihnen Ihre Familie sehr fehlt?",
    warum_pflege: "Was war der schwierigste Tag in Ihrem Beruf, und was haben Sie daraus gelernt?",
    warum_unsere_klinik: "Was wissen Sie konkret über unsere Station?",
    staerken_schwaechen: "Und woran merken Sie, dass sich das verbessert hat?",
    bisherige_erfahrung: "Beschreiben Sie mir einen typischen Frühdienst — von Anfang bis Ende.",
    arbeitsalltag: "Und wie viele Patientinnen und Patienten haben Sie dabei betreut?",
    notfall: "Und wenn die Ärztin nicht erreichbar ist?",
    reanimation: "Wer übernimmt bei Ihnen die Dokumentation, während Sie reanimieren?",
    stress: "Erzählen Sie mir von einer Schicht, die wirklich schlecht gelaufen ist.",
    team: "Und wenn eine Kollegin einen Fehler macht — wie sprechen Sie das an?",
    kritik: "Und wenn Sie die Kritik für ungerecht halten?",
    leben_in_deutschland: "Was wird für Sie am schwersten sein?",
    schichtdienst: "Wie war das für Sie, als Sie zuletzt Nachtdienst hatten?",
    luecke: "Und was haben Sie in dieser Zeit gemacht, um fachlich auf dem Stand zu bleiben?",
  },
};

/**
 * Pick the next thing the interviewer says, from what the candidate just did.
 * @param {number} turn  0 = first follow-up, 1 = second. Two probes is enough:
 *   a third reads as interrogation rather than interview.
 */
function nextProbe(q, graded, turn = 0, used = []) {
  if (turn >= 2) return null;
  const state = id => graded.notes.find(n => n.id === id)?.state;
  const fresh = p => (p && !used.includes(p.de) ? p : null);

  // The trap probe fires on the FIRST turn only. Once it has been put to them,
  // the question is whether they held their line — and re-firing it punishes a
  // recovery: an answer like "ich würde nicht wechseln, weil mir die Strukturen
  // wichtiger sind als das Gehalt" is a GOOD answer that happens to contain the
  // trap word. A keyword check cannot see that, so it must not get a second bite.
  // Unsupported claims come first — before the trap, before anything else. It is
  // the failure the trainer says she hears twenty-five times a day, and the probe
  // is the one she actually uses.
  if (state("substantiated") === "fail")
    return fresh({ de: PROBES.substantiate, kind: "substantiate" });

  if (turn === 0 && state("trap") === "fail" && PROBES.trap[q.id])
    return fresh({ de: PROBES.trap[q.id], kind: "trap" });

  // Barely engaged at all -> repeat, do not rephrase into something easier.
  if (state("sustained") === "fail" && state("substantiated") !== "fail" && turn === 0)
    return fresh({ de: PROBES.repeat, kind: "repeat" });
  if (state("sustained") === "fail") return fresh({ de: PROBES.vague, kind: "vague" });
  if (state("fluency") === "fail") return fresh({ de: PROBES.hesitant, kind: "hesitant" });
  if (PROBES.scenario[q.id]) return fresh({ de: PROBES.scenario[q.id], kind: "scenario" });
  if (PROBES.press[q.id]) return fresh({ de: PROBES.press[q.id], kind: "press" });
  return null;
}

/**
 * Grade one spoken interview answer.
 *
 * Deliberately NOT the exam rubric. An interview is not marked out of 100 and
 * nobody is scoring your Konjunktiv II. What decides it is whether you answered
 * the question, kept going, and avoided the two or three answers that read as
 * red flags to a German ward manager.
 *
 * @param {object} q       a question from QUESTIONS
 * @param {object} spoken  output of speech.assess()
 */

/* "Going deeper" — the examiner's own definition of what separates a B2 answer
   from a B1 one, given verbatim:
     "they should not give just a one line answer or list a point. They should
      explain the answer with a reason, give a relevant example from their
      professional life and add a little more detail. For eg, when asked about
      strengths they should not just say Teamwork is my strength, they should
      say what this means in work."
   So depth is four separable moves, and naming WHICH one is missing is the
   difference between a verdict and a lesson. Our old check only asked whether
   evidence existed at all, which could not tell a candidate what to add. */
const DEPTH_MOVES = {
  reason: {
    label: "a reason",
    re: /\b(weil|denn|da\s|deshalb|deswegen|darum|aus diesem grund|der grund (ist|dafür)|damit|sodass|um .{3,40} zu)\b/i,
    ask: "Say WHY — „weil…\u201C, „deshalb…\u201C.",
  },
  example: {
    label: "an example from your work",
    re: /\b(zum beispiel|beispielsweise|etwa als|einmal|neulich|letzte[nsr]? (woche|monat|jahr|schicht|dienst)|in meiner (letzten )?(stelle|station|abteilung)|bei uns auf (der )?station|ich hatte (einmal|mal)|einer meiner patienten|eine patientin von mir|als ich)\b/i,
    ask: "Give one moment from your own ward — „einmal hatte ich…\u201C.",
  },
  detail: {
    label: "concrete detail",
    re: /\b(\d+\s?(jahre|monate|patienten|betten|mg|ml|mal|stunden|minuten)|\d{1,2}[:.]\d{2}|blutdruck|puls|vitalzeichen|dokumentation|übergabe|frühdienst|spätdienst|nachtdienst|fünf r|reanimation|zugang|infusion)\b/i,
    ask: "Add something countable — how many, how often, which procedure.",
  },
  explanation: {
    label: "what it means in practice",
    re: /\b(das (heißt|bedeutet)|konkret (heißt|bedeutet)|in der praxis|im (arbeits)?alltag|das zeigt sich|für mich bedeutet|das sieht so aus)\b/i,
    ask: "Say what it looks like on shift, not just the quality itself.",
  },
};

/** Which of the four depth moves the answer actually makes. */
function depthMoves(text) {
  const present = [], missing = [];
  for (const [id, m] of Object.entries(DEPTH_MOVES)) {
    (m.re.test(text) ? present : missing).push({ id, label: m.label, ask: m.ask });
  }
  return { present, missing };
}

function gradeAnswer(q, spoken, turn = 0) {
  if (!spoken?.text) return null;
  const text = spoken.text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const opening = words.slice(0, 25).join(" ");
  const notes = [];

  // 1. Did they actually keep going? The failure the interviews describe is
  //    freezing, not poor grammar.
  const secs = spoken.durationSec || 0;
  // Duration OR word count, not both. An answer that ran 44 seconds is not
  // "too short" because it came to 39 words — an AND here punished a good
  // answer on a one-word margin.
  const lengthOk = secs >= 30 || words.length >= 40;
  notes.push({
    id: "sustained",
    state: lengthOk ? "pass" : secs >= 12 ? "warn" : "fail",
    detail: lengthOk
      ? `${Math.round(secs)}s without stopping. That is the hard part.`
      : `Only ${Math.round(secs)}s. Aim for 45 — stopping early reads as not knowing.`,
  });

  // 2. Fluency — Azure's score, which is what pausing to hunt for words costs.
  if (spoken.scores?.fluency != null) {
    const f = spoken.scores.fluency;
    notes.push({
      id: "fluency",
      state: f >= 85 ? "pass" : f >= 70 ? "warn" : "fail",
      detail: f >= 85 ? "Steady pace."
        : f >= 70 ? "You paused to find words a few times."
        : "You stopped to hunt for words. That costs you here, not grammar.",
    });
  }

  // 3. The trap. This is the part a generic AI interviewer will not tell them,
  //    because it is specific to hiring in German healthcare.
  // Trap scoring belongs to the opening answer only — see nextProbe.
  if (q.trapDetect && turn === 0) {
    const hay = q.trapDetect.scope === "opening" ? opening : text;
    let hit = false;
    try { hit = new RegExp(q.trapDetect.pattern, "i").test(hay); } catch { hit = false; }
    notes.push({
      id: "trap",
      state: hit ? "fail" : "pass",
      // Don't lowercase the whole trap sentence — it mangles it mid-clause.
      detail: hit ? q.trap : `You avoided the usual mistake here: ${q.trap.charAt(0).toLowerCase() + q.trap.slice(1)}`,
      strong: hit ? q.strong : null,
    });
  }

  // 4. Claims without evidence. Applies to EVERY answer, not one question:
  //    "ich bin verantwortungsbewusst" is a sentence anyone can produce, and it
  //    is what makes every candidate sound the same.
  const sub = substantiation(text);
  if (sub.claims.length) {
    notes.push({
      id: "substantiated",
      state: sub.unsupported ? "fail" : "pass",
      detail: sub.unsupported
        ? `You said ${sub.claims.join(", ")} — but did not show it. Every candidate says this.`
        : "You backed up what you claimed. That is what makes it sound like you.",
      // Not just "you failed to substantiate" — what substantiating THAT claim
      // would actually look like. Telling someone they are wrong without telling
      // them what right looks like is a scold, not coaching.
      teaches: sub.unsupported
        ? sub.claims.map(c => {
            const key = Object.keys(CLAIM_MEANING).find(k => c.startsWith(k.slice(0, 8)));
            return key ? { claim: c, means: CLAIM_MEANING[key] } : null;
          }).filter(Boolean)
        : null,
      strong: sub.unsupported ? q.strong : null,
    });
  }

  /* 4b. Depth, scored as the four moves rather than as one yes/no. An answer
     that names the point and gives a reason but no example is a different
     problem from one that is a bare assertion, and it needs different advice. */
  const depth = depthMoves(text);
  // A bare one-line claim is the exact thing this check exists to catch, so the
  // floor only skips a non-answer — gating at 12 words silenced the worst cases.
  if (words.length >= 6) {
    const n = depth.present.length;
    notes.push({
      id: "depth",
      state: n >= 3 ? "pass" : n === 2 ? "warn" : "fail",
      detail: n >= 3
        ? `You went deeper — ${depth.present.map(d => d.label).join(", ")}.`
        : `You stated the point but stopped there. Missing: ${depth.missing.map(d => d.label).join(", ")}.`,
      teaches: n >= 3 ? null : depth.missing.slice(0, 2).map(d => ({ claim: d.label, means: d.ask })),
    });
  }

  // 5. A framework they raised themselves but only half-named. The trainer's
  //    exact correction: "that is the last one — there are many coming before."
  for (const f of frameworkCheck(text)) {
    notes.push({
      id: "framework",
      state: "warn",
      detail: `${f.label}: you named ${f.got} of ${f.total}. Missing ${f.missing.join(", ")}.`,
    });
  }

  // 6. Register. She asked for it "professionell" and that is a constraint on
  //    the answer, not decoration on the question.
  if (q.id === "vorstellen" && OFF_REGISTER.test(text)) {
    notes.push({
      id: "register",
      state: "warn",
      detail: "Hobbies in a professional introduction. Spend those seconds on the ward and your duties.",
    });
  }


  /* 6b. Falling back into English. In a recorded screening this is the most
     visible thing a candidate does — an interviewer hears "Temperature, then
     I the station then this monitor" and stops hearing German at all. It is
     also the most fixable: the words are almost always ones they know.
     Matched as whole words, and only for terms with no German-cognate risk,
     so „Monitor", „Patient", „Team", „Notfall" and friends cannot trip it. */
  const ENGLISH = /\b(the|then|this|that|and|with|for|from|when|what|because|first aid|blood pressure|temperature|patient care|emergency room|i am|i have|i will|we are|my|your|his|her|it is|there is|okay so|you know|sorry|maybe)\b/gi;
  const eng = [...new Set((text.match(ENGLISH) || []).map(w => w.toLowerCase()))];
  if (eng.length >= 2) {
    notes.push({
      id: "english",
      state: eng.length >= 4 ? "fail" : "warn",
      detail: eng.length >= 4
        ? `You switched into English (${eng.slice(0, 4).join(", ")}…). Say it in German even if it comes out broken — a German sentence with mistakes counts, an English one does not.`
        : `A few English words slipped in (${eng.join(", ")}). Reach for the German first, however slowly.`,
    });
  }

  // 7. Structure — self-introduction only. An interview that wanders at the
  //    opening makes everything after it harder.
  if (q.id === "vorstellen") {
    const st = introStructure(text);
    notes.push({
      id: "structure",
      state: st.score >= 0.8 ? "pass" : st.score >= 0.5 ? "warn" : "fail",
      detail: st.missing.length
        ? `${st.present.length}/${INTRO_BLOCKS.length} covered. Missing: ${st.missing.join(", ")}.`
        : "Every block covered.",
    });
  }

  // 8. Pronunciation, but only the words worth naming.
  const weak = (spoken.words || [])
    .filter(w => w.errorType === "Mispronunciation" || (w.accuracy != null && w.accuracy < 60))
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0)).slice(0, 2);
  if (weak.length) {
    notes.push({
      id: "pronunciation",
      state: "warn",
      detail: `Hard to catch: ${weak.map(w => w.word).join(", ")}.`,
    });
  }

  // She corrected ONE thing. So does this: notes carry a rank so the screen can
  // lead with what matters and fold the rest away, rather than handing someone
  // five paragraphs the moment they stop speaking.
  const RANK = { substantiated: 1, depth: 2, trap: 3, sustained: 4, english: 5, structure: 6, framework: 7, register: 8, fluency: 9, pronunciation: 10 };
  notes.sort((a, b) => (a.state === "fail" ? 0 : 1) - (b.state === "fail" ? 0 : 1) || (RANK[a.id] || 9) - (RANK[b.id] || 9));

  const fails = notes.filter(n => n.state === "fail").length;
  return {
    notes,
    weakWords: weak.map(w => w.word),
    // No percentage. An interview is not marked out of 100 and pretending
    // otherwise would be the same false precision the exam side avoids.
    reads: fails === 0 ? "solid" : fails === 1 ? "one thing to fix" : "needs another go",
    followUp: q.followUp,
    transcript: spoken.text,
  };
}

/**
 * What the whole session says, which is more than the sum of its answers.
 * A learner told "some hesitation" five times separately does not hear a
 * pattern; told "you hesitated on four of five, and every one was a question
 * you had not prepared" they know what to work on.
 */

/* What a pre-screening round actually decides. The recorded call is the model:
   the employer never scored the candidate, they asked "können wir den auch für
   ICU benutzen?" and answered "eigentlich nicht" — the German level set the
   WARD, not the offer. So that is the currency the verdict should be in.

   PROVISIONAL. The thresholds below are read off a single recorded call and one
   employer's judgement. They are a defensible starting point, not a validated
   scale, and every band says what it is based on so nobody mistakes it for a
   measurement. Revisit once more calls with known outcomes exist. */
const PLACEMENT_BANDS = [
  {
    id: "icu",
    ward: "Intensiv / ICU",
    gate: (content, german) => content >= 70 && german >= 75,
    line: "Precise enough for intensive care, where being misunderstood is a clinical risk.",
  },
  {
    id: "acute",
    ward: "Notaufnahme / acute wards",
    gate: (content) => content >= 60,
    line: "Enough to work an acute ward — the clinical content came through. What keeps you out of ICU is precision, not knowledge.",
  },
  {
    id: "general",
    ward: "Allgemeinstation / general wards",
    gate: (content) => content >= 35,
    line: "You would get through a screening for a general ward. Acute wards will want the clinical detail said more specifically.",
  },
  {
    id: "not_yet",
    ward: "Not yet",
    gate: () => true,
    line: "Too little of the clinical picture reached them in German. That is what stops a screening call — and it moves faster than grammar does.",
  },
];

function placementFrom(answers, profile) {
  const dim = (id, dflt) => profile.find(d => d.id === id)?.score ?? dflt;

  /* Calibrated against the recorded call, which is the only ground truth here:
     that candidate code-switched heavily and hunted for words, yet was advanced
     for Notaufnahme and refused for ICU. So the two axes are NOT one score.
     CONTENT — did the clinical picture arrive at all — decides whether they
     advance. GERMAN — precision and fluency — decides the ceiling. Reading them
     as a single number is what made an advanced candidate read as "not yet". */
  const content = Math.round(dim("substantiated", 40) * 0.6 + dim("sustained", 60) * 0.4);
  const german  = Math.round(dim("english", 100) * 0.6 + dim("fluency", 60) * 0.4);

  const band = PLACEMENT_BANDS.find(b => b.gate(content, german));
  return { id: band.id, ward: band.ward, line: band.line, content, german, provisional: true };
}

function sessionSummary(answers = []) {
  if (!answers.length) return null;
  const n = answers.length;
  const count = (id, state) => answers.filter(a => a.notes?.find(x => x.id === id && x.state === state)).length;

  const froze = count("sustained", "fail");
  const hesitated = count("fluency", "fail") + count("fluency", "warn");
  const traps = count("trap", "fail");
  const unsupported = count("substantiated", "fail");
  const solid = answers.filter(a => a.reads === "solid").length;

  const wordHits = {};
  for (const a of answers)
    for (const w of a.weakWords || []) wordHits[w.toLowerCase()] = (wordHits[w.toLowerCase()] || 0) + 1;
  const repeated = Object.entries(wordHits).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([w]) => w);

  const findings = [];
  const half = Math.ceil(n / 2);

  // Ordered by what actually loses the interview.
  if (unsupported >= Math.max(1, half))
    findings.push({ id: "evidence", severity: "high",
      text: `You described yourself without showing it${n > 1 ? ` on ${unsupported} of ${n}` : ""}. Say what you DO — \u201Ewenn ich Medikamente gebe, prüfe ich die fünf R\u201C — not what you are.`,
      drill: "Pick one quality and write three concrete things you did that prove it. Say those, not the adjective." });
  if (froze >= Math.max(1, half))
    findings.push({ id: "freezing", severity: "high",
      text: `You stopped early${n > 1 ? ` on ${froze} of ${n}` : ""}. An interviewer reads a short answer as not knowing, not as being concise.`,
      drill: "Answer the same question again and do not stop until 45 seconds. Repeat yourself if you have to — keeping going is the skill." });
  if (traps >= Math.max(1, Math.ceil(n / 3)))
    findings.push({ id: "traps", severity: "high",
      text: `You gave an answer employers read as a red flag${n > 1 ? `, ${traps} times` : ""}.`,
      drill: "These are the same few every interview. Learn the three that matter and you have removed most of the risk." });
  const english = count("english", "fail") + count("english", "warn");
  if (english >= Math.max(1, Math.ceil(n / 3)))
    findings.push({ id: "english", severity: "high",
      text: `You fell back into English${n > 1 ? ` on ${english} of ${n}` : ""}. An interviewer stops hearing German at that point, even when the rest was fine.`,
      drill: "Pick the five words you reached for in English and learn only those. Broken German counts; English does not." });
  if (hesitated >= half)
    findings.push({ id: "hesitation", severity: "medium",
      text: `You hesitated${n > 1 ? ` on ${hesitated} of ${n}` : ""}, pausing to find words.`,
      drill: "Filler you choose — \u201Ealso…\u201C, \u201Enun ja…\u201C — buys the same thinking time without the silence." });
  if (repeated.length)
    findings.push({ id: "sounds", severity: "medium",
      text: `Hard to catch more than once: ${repeated.join(", ")}.`,
      drill: "Ten minutes on those specific sounds is worth more than an hour of general practice." });

  /* A session of one or two answers rarely trips a pattern threshold — and the
     screen was then showing a verdict with no reason, which is the complaint:
     "doesn't give me an idea of what to improve". So when nothing patterns,
     fall back to the single most important thing the grader actually found. */
  if (!findings.length) {
    const lead = answers
      .flatMap(a => a.notes || [])
      .find(x => x.state === "fail") || answers.flatMap(a => a.notes || []).find(x => x.state === "warn");
    if (lead) findings.push({ id: lead.id, severity: lead.state === "fail" ? "high" : "medium", text: lead.detail, drill: null });
  }

  if (!findings.length && solid === n)
    findings.push({ id: "ready", severity: "low",
      text: `${n === 1 ? "That one held up" : `All ${n} held up`}, including the follow-ups.`,
      drill: "Do this again with a different set closer to the date." });

  /* A scorecard, not a mark out of 100. Each dimension is scored only over the
     answers where it was actually observed — averaging a note that never fired
     into a "score" would be inventing precision the grader does not have. */
  const DIMS = [
    { id: "sustained",     label: "Kept going" },
    { id: "substantiated", label: "Backed it up" },
    { id: "depth",         label: "Went deeper" },
    { id: "trap",          label: "Avoided red flags" },
    { id: "structure",     label: "Structure" },
    { id: "fluency",       label: "Fluency" },
    { id: "english",       label: "Stayed in German" },
    { id: "register",      label: "Register" },
    { id: "pronunciation", label: "Pronunciation" },
  ];
  const WEIGHT = { pass: 1, warn: 0.5, fail: 0 };
  const profile = DIMS.map(d => {
    const seen = answers.flatMap(a => a.notes || []).filter(x => x.id === d.id && x.state in WEIGHT);
    if (!seen.length) return null;
    return {
      id: d.id, label: d.label, observed: seen.length,
      score: Math.round((seen.reduce((t, x) => t + WEIGHT[x.state], 0) / seen.length) * 100),
    };
  }).filter(Boolean).sort((a, b) => a.score - b.score);

  // The scorecard now carries the full shape, so the written notes no longer
  // have to. Four paragraphs is the wall this screen was built to avoid —
  // three at most, worst first, and the bars say the rest.
  const placement = placementFrom(answers, profile);

  return { total: n, solid, froze, hesitated, traps, unsupported, repeated, profile, placement, findings: findings.slice(0, 3) };
}

module.exports = { MODEL_ANSWERS, QUESTIONS, CATEGORIES, practiceSet, gradeAnswer, nextProbe, sessionSummary, PROBES, substantiation, frameworkCheck, introStructure, FRAMEWORKS };
