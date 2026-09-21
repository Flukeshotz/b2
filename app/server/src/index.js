require("./env")();

const crypto = require("node:crypto");
const express = require("express");
const cors = require("cors");
const api = require("./routes/api");
const b2 = require("./routes/b2");
const authRoutes = require("./routes/auth");
const reviewRoutes = require("./routes/review");

/* A SINGLE BAD REQUEST MUST NOT TAKE THE WHOLE API DOWN FOR EVERY LEARNER.
 * Confirmed live: a stale client request for a non-numeric attempt id reached
 * `Number(req.params.attemptId)` -> NaN -> a Postgres 22P02 error inside an
 * async route handler with no try/catch. Express 4 does not catch a rejected
 * promise from a plain `async (req,res) => {...}` handler, so that became an
 * unhandled rejection — and Node's default for those is to terminate the
 * process. These two remain as the last-resort net for anything that still
 * finds a way around safe_router.js and the error middleware below — they
 * keep the PROCESS alive; they cannot answer the request that triggered them,
 * which is why the real fix is the error middleware, not these. */
process.on("unhandledRejection", (err) => {
  log("error", "unhandled_rejection", { message: err?.message, stack: err?.stack });
});
process.on("uncaughtException", (err) => {
  log("error", "uncaught_exception", { message: err?.message, stack: err?.stack });
});

/* STRUCTURED LOGGING. Not a library — one function, one JSON line per event,
 * because the audit found zero structured logging anywhere: plain
 * console.log/warn/error strings with no request id, no level, nothing
 * greppable. This is deliberately minimal rather than pulling in winston/pino
 * for a single-process pilot; the shape (level, event, requestId, fields) is
 * what would carry over to a real logger later.
 *
 * NEVER logs secrets: request bodies, tokens, and passwords are never passed
 * to this function by the call sites below. */
function log(level, event, fields = {}) {
  const line = { ts: new Date().toISOString(), level, event, ...fields };
  (level === "error" ? console.error : console.log)(JSON.stringify(line));
}

/* STARTUP ENVIRONMENT VALIDATION. The audit found every env var had a JS-level
 * fallback but several were functionally required — the app boots fine and
 * then fails deep inside a request (TTS, speech scoring, LLM grading) instead
 * of announcing the gap once at boot. This does not refuse to start (a demo/
 * dev environment may genuinely not have Azure credentials yet) — it logs
 * exactly what will not work, once, loudly, so "why did the LLM verdict come
 * back null" doesn't have to be re-discovered by request-log archaeology. */
function checkEnv() {
  const missing = [];
  if (!process.env.AZURE_SPEECH_REGION || !(process.env.AZURE_SPEECH_KEY || process.env.AZURE_AI_API_KEY || process.env.AZURE_OPENAI_API_KEY)) {
    missing.push("AZURE_SPEECH_REGION + AZURE_SPEECH_KEY (TTS + speaking assessment will not work)");
  }
  const hasAzureLLM = process.env.AZURE_AI_ENDPOINT && (process.env.AZURE_AI_API_KEY || process.env.AZURE_OPENAI_API_KEY);
  const hasDeepSeek = process.env.DEEPSEEK_API_KEY;
  if (!hasAzureLLM && !hasDeepSeek) {
    missing.push("AZURE_AI_ENDPOINT/AZURE_AI_API_KEY or DEEPSEEK_API_KEY (writing-verdict LLM grading will return null)");
  }
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL (falling back to postgresql://localhost/learn_german)");
  if (missing.length) log("warn", "startup_env_incomplete", { missing });
  else log("info", "startup_env_ok", {});
}

const app = express();
app.use(cors());
app.use(express.json());

/* REQUEST ID on every request, echoed back in the response header, included
 * in the access-log line and in any error payload — so "which request
 * failed" is answerable from a log line alone. */
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  const start = Date.now();
  res.on("finish", () => {
    log("info", "request", {
      requestId: req.id, method: req.method, path: req.path,
      status: res.statusCode, durationMs: Date.now() - start,
    });
  });
  next();
});

// Produced audio for B2 listening sources. Static files rather than a route:
// they are large, immutable once built, and the browser should cache them.
app.use("/b2/audio", express.static(require("node:path").join(__dirname, "../public/b2/audio"), {
  maxAge: "7d", fallthrough: false,
}));

app.use("/api/auth", authRoutes);
app.use("/api", api);
app.use("/api/b2", b2);
app.use("/api/review", reviewRoutes);

// The teacher content-review page — a static, no-build-step tool, same
// pattern as the audio files above. Gated by review.js's own token check on
// every API call it makes; the HTML/JS itself carries no secrets.
app.use("/review", express.static(require("node:path").join(__dirname, "../public/review")));

/* CENTRALIZED ERROR MIDDLEWARE. This is the piece that actually closes the
 * gap the process-level handlers above cannot: it answers the request. Every
 * route on both routers is wrapped by safe_router.js, so a thrown/rejected
 * error reaches here via next(err) instead of hanging or crashing the
 * process. One JSON shape, always, and the request id so a learner's bug
 * report ("it broke") can be traced to a specific log line. */
app.use((err, req, res, _next) => {
  log("error", "request_error", { requestId: req.id, path: req.path, message: err?.message, stack: err?.stack });
  if (res.headersSent) return;
  res.status(500).json({ error: "internal_error", requestId: req.id });
});

checkEnv();
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => log("info", "listening", { port: PORT }));
