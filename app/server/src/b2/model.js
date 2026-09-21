// Model pass — docs/04-architecture.md §5.
//
// Four dimensions that genuinely need inference. Everything else is handled by
// the deterministic pass, which is free and cannot hallucinate.
//
// Backend matches the one already in use by "QP Editorial AI": DeepSeek on
// Azure AI Foundry via the Model Inference route, with DeepSeek's direct API as
// a fallback. Same env var names, so an existing .env works unchanged:
//   AZURE_AI_ENDPOINT / AZURE_AI_API_KEY / AZURE_AI_DEPLOYMENT / AZURE_AI_API_VERSION
//   DEEPSEEK_API_KEY / DEEPSEEK_MODEL / DEEPSEEK_BASE_URL
//
// Returns null whenever it cannot run -- no key, a timeout, a rate limit, or a
// malformed response. That is a designed path: verdict.js compresses the score
// and widens the interval when the model is absent, so the product degrades
// instead of breaking.
//
// HARD RULE: a dimension without an evidence span quoted from the learner's own
// text is discarded. A score we cannot point at is indistinguishable from the
// free AI scoring competitors already give away.

const PROVIDER = process.env.QP_LLM_PROVIDER || "azure";
const TIMEOUT_MS = Number(process.env.QP_LLM_TIMEOUT || 60) * 1000;
const MAX_TOKENS = Number(process.env.QP_LLM_MAX_TOKENS || 8192);

const AZURE_ENDPOINT = process.env.AZURE_AI_ENDPOINT || "";
// Azure AI Foundry issues one key per resource, used by both the
// OpenAI-compatible route and the Model Inference route. The image pipeline
// already stores it as AZURE_OPENAI_API_KEY against the same host, so fall back
// to it rather than duplicating a secret under a second name.
const AZURE_KEY = process.env.AZURE_AI_API_KEY || process.env.AZURE_OPENAI_API_KEY || "";
const AZURE_DEPLOYMENT = process.env.AZURE_AI_DEPLOYMENT || "deepseek-v4-pro";
const AZURE_API_VERSION = process.env.AZURE_AI_API_VERSION || "2024-05-01-preview";

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const DEEPSEEK_BASE = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

const DIMENSIONS = [
  { id: "korrektheit",   label: "Grammatische Korrektheit" },
  { id: "kohaerenz",     label: "Kohärenz und Textaufbau" },
  { id: "wortschatz",    label: "Wortschatz und Idiomatik" },
  { id: "argumentation", label: "Argumentqualität" },
];

// Mirrors utils/llm.py::_azure_inference_url. A project endpoint
// (".../api/projects/<name>") is normalised back to the resource root before
// the Model Inference route is appended.
function azureUrl() {
  let ep = AZURE_ENDPOINT.trim().replace(/\/+$/, "");
  const marker = "/api/projects/";
  if (ep.includes(marker)) ep = ep.slice(0, ep.indexOf(marker));
  const base = ep.includes("/chat/completions") ? ep : ep + "/models/chat/completions";
  return `${base}${base.includes("?") ? "&" : "?"}api-version=${AZURE_API_VERSION}`;
}


/* ── what each band actually means ──────────────────────────────────────
   Verbatim CEFR descriptors from telc's published Bewertungskriterien
   (telc Deutsch B1·B2 Pflege, Übungstest 1, pp. 36-37). They are the
   board's own wording for what a B2, a B1 and an A2 performance looks
   like on each dimension, so they anchor our 0-3 bands to real levels
   instead of leaving "band 2" to the model's imagination.

   Measured effect of giving the model rubric wording rather than a bare
   dimension name: on examiner-marked scripts, adding ONE sentence defining
   Korrektheit as error density moved a whole reported level. The model was
   never wrong about the German — it was answering a different question. */
const BAND_DESCRIPTORS = {
  korrektheit: {
    3: "Zeigt eine recht gute Beherrschung der Grammatik. Macht keine Fehler, die zu Missverständnissen führen, aber gelegentliche Ausrutscher können vorkommen. Rechtschreibung und Zeichensetzung sind hinreichend korrekt.",
    2: "Zeigt im Allgemeinen gute Beherrschung der grammatischen Strukturen. Zwar kommen Fehler vor, aber es bleibt ganz überwiegend klar, was ausgedrückt werden soll.",
    1: "Kann einige einfache Strukturen korrekt verwenden, macht aber noch systematisch elementare Fehler — z. B. Zeitformen vermischen oder die Subjekt-Verb-Kongruenz nicht markieren.",
    0: "So viele Fehler, dass die Aussage nicht mehr verständlich ist.",
  },
  wortschatz: {
    3: "Verfügt über einen schon differenzierten Wortschatz. Kann Formulierungen variieren, um häufige Wiederholungen zu vermeiden. Die Genauigkeit in der Verwendung ist im Allgemeinen groß, auch wenn einige Verwechslungen vorkommen.",
    2: "Verfügt über einen ausreichenden Wortschatz, um in vertrauten Situationen routinemäßige Angelegenheiten zu erledigen, macht aber noch elementare Fehler bei komplexeren Sachverhalten.",
    1: "Beherrscht einen begrenzten Wortschatz in Zusammenhang mit konkreten Alltagsbedürfnissen.",
    0: "Der Wortschatz reicht für die Aufgabe nicht aus.",
  },
  kohaerenz: {
    3: "Kann sich in formellem Stil klar ausdrücken, wie es für die Situation angemessen ist. Kann eine begrenzte Anzahl von Verknüpfungsmitteln verwenden, um Äußerungen zu einem klaren zusammenhängenden Beitrag zu verbinden.",
    2: "Kann sich so ausdrücken, dass es für die Situation akzeptabel ist. Kann eine Reihe kurzer und einfacher Einzelelemente zu einer linearen, zusammenhängenden Äußerung verbinden.",
    1: "Kann elementare Sprachfunktionen anwenden und die häufigsten Konnektoren („und\u201C, „aber\u201C, „weil\u201C) benutzen, um einfache Sätze zu verbinden.",
    0: "Kein erkennbarer Textzusammenhang.",
  },
  argumentation: {
    3: "Behandelt die Aufgabe vollständig und geht in die Tiefe: erklärt den Punkt, nennt einen Grund, gibt ein konkretes Beispiel und ergänzt relevante Details.",
    2: "Behandelt die Aufgabe weitgehend, bleibt aber an mehreren Stellen an der Oberfläche — Behauptungen ohne Begründung oder Beispiel.",
    1: "Nennt Punkte nur stichwortartig oder in einem Satz, ohne Begründung, Beispiel oder Detail.",
    0: "Die Aufgabe wird nicht behandelt.",
  },
};

function describe(id) {
  const d = BAND_DESCRIPTORS[id];
  if (!d) return "";
  return `\n  ${id}:\n` + [3, 2, 1, 0].map(b => `    ${b} = ${d[b]}`).join("\n");
}


/* ── graded anchors ─────────────────────────────────────────────────────
   Real learner texts with the levels trained raters actually gave them
   (MERLIN, CC BY-SA 4.0, Eurac Research). Drawn ONLY from the training
   split, so held-out evaluation stays honest.

   This is how the boards train their own examiners: Goethe's Prüfertraining
   opens with "Vertrautmachen mit bewerteten Kandidatenbeispielen" — get
   familiar with graded candidate examples — before anyone marks anything.
   A descriptor tells you what B2 is supposed to mean; an anchor shows you
   where a rater actually drew the line, which is the part descriptors have
   never been able to carry.

   Board-independent by design: these are CEFR judgements, and B2 German is
   B2 German whether telc or Goethe is asking. */
let EXEMPLARS = [];
try { EXEMPLARS = require("./exemplars.json"); } catch { /* anchors are an improvement, never a requirement */ }

function anchorBlock() {
  if (!EXEMPLARS.length) return "";
  return `\nZur Eichung — echte Lernertexte mit den Bändern, die geschulte ` +
    `Bewerterinnen und Bewerter tatsächlich vergeben haben:\n` +
    EXEMPLARS.map(e =>
      `\n[${e.level}] korrektheit=${e.bands.korrektheit}, kohaerenz=${e.bands.kohaerenz}, ` +
      `wortschatz=${e.bands.wortschatz}, argumentation=${e.bands.argumentation}\n"${e.text}"\n`
    ).join("") + `\nBewerten Sie den folgenden Text mit demselben Maßstab.\n`;
}

function buildPrompt(text, task, rubric) {
  /* BOARD-NEUTRAL BY DESIGN. Naming the board here cost telc eleven points of
     accuracy against Goethe on the same held-out texts: told it was marking
     telc, the model compressed its range and separated B1 from B2 by under ten
     points where Goethe got fourteen. Nothing about the German changed — only
     who was asking.

     B2 German is B2 German whichever board sets the paper. This call makes one
     CEFR judgement against the shared descriptors; the board's own criteria,
     bands and weightings are applied downstream in verdict.js, where they
     belong and where they can be tested. */
  /* Korrektheit is error density and NOTHING else. Without saying so, the model
     marked a short, plain, entirely correct Aufnahmebericht 0 — punishing it for
     being thin, which is Criterion I's job, not this one. On examiner-marked
     scripts that single confusion cost a whole level, because the reported
     level is the weakest criterion. */
  const korrektheitRule =
    `WICHTIG zu "korrektheit": Bewerte AUSSCHLIESSLICH Fehlerdichte — Grammatik, ` +
    `Morphologie, Rechtschreibung, Zeichensetzung. Ein kurzer, einfacher, aber ` +
    `fehlerfreier Text bekommt hier die HÖCHSTE Bewertung. Einfachheit, fehlender ` +
    `Inhalt und dürftiger Wortschatz sind KEINE Korrektheitsfehler und werden ` +
    `anderswo bewertet.\n\n`;
  return (
    `Du bist Prüfer für Deutsch als Fremdsprache und bewertest eine ` +
    `Schreibleistung auf dem Niveau B2 nach dem GER.\n\n` +
    korrektheitRule +
    `Bewerte NUR diese vier Dimensionen. Die Bänder sind an die offiziellen ` +
    `Deskriptoren gebunden — 3 entspricht B2, 2 entspricht B1, 1 entspricht A2:\n` +
    DIMENSIONS.map(d => describe(d.id)).join("") + `\n\n` +
    `Für jede Dimension: ein Band von 0 bis 3 und ein WÖRTLICHES Zitat aus dem Text des Lernenden als Beleg.\n` +
    `Das Zitat muss exakt so im Text stehen. Ohne wörtliches Zitat keine Bewertung.\n\n` +
    anchorBlock() +
    `\nAntworte ausschließlich als JSON:\n` +
    `{"dimensions":[{"id":"...","band":0,"evidence":"wörtliches Zitat","comment":"kurze Begründung"}]}\n\n` +
    `Aufgabe: ${task.prompt_de}\n\nText des Lernenden:\n---\n${text}\n---`
  );
}

async function post(url, headers, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) return null; // includes 429 -- degrade rather than queue
    const body = await res.json();
    return body.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function callAzure(prompt) {
  if (!AZURE_KEY || !AZURE_ENDPOINT) return null;
  // R1-style reasoning deployments reject temperature and response_format.
  const isReasoner = /r1|reason/i.test(AZURE_DEPLOYMENT);
  const payload = {
    model: AZURE_DEPLOYMENT,
    messages: [{ role: "user", content: prompt }],
    max_tokens: MAX_TOKENS,
    stream: false,
    ...(isReasoner ? {} : { temperature: 0, response_format: { type: "json_object" } }),
  };
  // Foundry accepts either header depending on how the resource was provisioned;
  // utils/llm.py sends both, so we do too.
  return post(azureUrl(), { "api-key": AZURE_KEY, Authorization: `Bearer ${AZURE_KEY}` }, payload);
}

async function callDeepSeek(prompt) {
  if (!DEEPSEEK_KEY) return null;
  return post(
    DEEPSEEK_BASE.replace(/\/+$/, "") + "/chat/completions",
    { Authorization: `Bearer ${DEEPSEEK_KEY}` },
    {
      model: DEEPSEEK_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: MAX_TOKENS,
      temperature: 0,
      stream: false,
      response_format: { type: "json_object" },
    }
  );
}

function parse(raw, text) {
  if (!raw) return null;
  // Models occasionally wrap JSON in a fenced block despite response_format.
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  let parsed;
  try { parsed = JSON.parse(cleaned); } catch { return null; }

  const valid = (parsed.dimensions || []).filter(
    d =>
      DIMENSIONS.some(x => x.id === d.id) &&
      Number.isFinite(d.band) && d.band >= 0 && d.band <= 3 &&
      typeof d.evidence === "string" &&
      // The span must actually appear in the submission. A model that
      // paraphrases its "quote" is inventing evidence, and evidence is the
      // whole reason a learner should believe the number.
      text.includes(d.evidence.trim())
  );
  return valid.length ? { dimensions: valid } : null;
}

async function assess(text, task, rubric) {
  const prompt = buildPrompt(text, task, rubric);
  const raw = PROVIDER === "deepseek"
    ? await callDeepSeek(prompt)
    : (await callAzure(prompt)) ?? (await callDeepSeek(prompt));
  return parse(raw, text);
}


/* Two raters, and a third when they disagree — telc's own procedure, and for
   the same reason: single marking is noisy. At temperature 0 this model still
   returned bands of 0, 2, 0 across three calls on one short text, enough to
   swing a whole reported level. Averaging per dimension costs one extra call
   and removes a class of error we could not otherwise see. */
async function assessDoubleMarked(text, task, rubric) {
  const first = await assess(text, task, rubric).catch(() => null);
  const second = await assess(text, task, rubric).catch(() => null);
  if (!first) return second;
  if (!second) return first;

  const merged = [];
  for (const d of first.dimensions || []) {
    const other = (second.dimensions || []).find(x => x.id === d.id);
    if (!other) { merged.push(d); continue; }
    if (d.band === other.band) { merged.push({ ...d, raters: 2 }); continue; }
    const third = await assess(text, task, rubric).catch(() => null);
    const t = third?.dimensions?.find(x => x.id === d.id);
    const marks = [d.band, other.band, ...(t ? [t.band] : [])];
    merged.push({
      ...d,
      band: Math.round(marks.reduce((a, b) => a + b, 0) / marks.length),
      raters: marks.length,
      // Keep the disagreement rather than hiding it — a dimension the raters
      // split on is exactly the one a human should look at.
      disputed: true,
    });
  }
  return { ...first, dimensions: merged };
}

const configured = () => !!((AZURE_KEY && AZURE_ENDPOINT) || DEEPSEEK_KEY);

module.exports = { assess, assessDoubleMarked, DIMENSIONS, BAND_DESCRIPTORS, configured, azureUrl, parse };
