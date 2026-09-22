// B2 API layer. Mirrors lib/api.js — same base URL, same shape — but sits on
// /api/b2 and carries one thing the A1 endpoints never had to: submissions that
// can be REFUSED rather than scored.
//
// A refusal is a designed outcome, not an error. Too short, off-topic, wrong
// language, inaudible — each returns a reason and a message written for the
// learner, and none of them consumes an attempt. Callers must handle
// `{ refused: true }` as a normal path, so the fetch wrapper below returns it
// instead of throwing.

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/* SESSION TOKEN. The server now requires a real session for every learner
   route (see routes/b2.js's requireAuth mount) — this is the client half of
   that: a token issued at signup/login, held in memory and mirrored to
   localStorage so a page refresh doesn't force a fresh login. Nothing here
   is trusted server-side; the token only ever proves "the server issued this
   to someone," which is exactly what a session is supposed to do. */
let TOKEN = (() => { try { return localStorage.getItem("b2_token") || null; } catch { return null; } })();

function setToken(token) {
  TOKEN = token;
  try { token ? localStorage.setItem("b2_token", token) : localStorage.removeItem("b2_token"); } catch { /* private mode etc. */ }
}
function authHeader() {
  return TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
}

async function req(path, opts) {
  const res = await fetch(BASE + "/b2" + path, {
    headers: { "Content-Type": "application/json", ...authHeader() },
    ...opts,
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 422 && body.refused) return body;     // a designed refusal
  if (res.status === 503) return { unavailable: true, ...body };
  if (res.status === 401) {
    setToken(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("b2:unauthenticated"));
    }
    throw new Error("unauthenticated");
  }
  if (!res.ok) throw new Error(body.error || `${path} -> ${res.status}`);
  return body;
}

/* AUTH — not under /b2, so it bypasses the req() helper's path prefix. */
async function authReq(path, opts) {
  const res = await fetch(BASE + "/auth" + path, {
    headers: { "Content-Type": "application/json", ...authHeader() },
    ...opts,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { error: body.error || `auth${path} -> ${res.status}` };
  return body;
}

export const b2 = {
  getTasks: (board = "goethe", module = "schreiben") =>
    req(`/tasks?board=${board}&module=${module}`),

  /* THE ASSESSMENT — the loop the product is built around.
     Distinct from the screening below, which marks answers and returns a
     profile without recording an attempt. These endpoints remember: every
     sitting has an id, a version, a completion time and a per-item record, and
     that is what makes "have I improved?" answerable at all.

     `start` is safe to call twice — the server resumes an unfinished attempt
     rather than opening a second, so a refresh cannot fork a learner's history.
     409 means the item pool is exhausted, which is a real state and not a
     failure: `req` throws on it, so callers catch and show the message. */
  startAssessment: (version) =>
    req("/assessment/start", { method: "POST", body: JSON.stringify(version ? { version } : {}) }),
  // The server's own pick of which core-2026b version comes next for this
  // learner (v1, then v2, then v3). The client never hardcodes a version id.
  getCurrentDiagnostic: () => req("/assessment/current-diagnostic"),
  getCurrentAssessment: () => req("/assessment/current"),
  getAssessment: (id) => req(`/assessment/${id}`),
  answerAssessmentItem: (id, itemId, response) =>
    req(`/assessment/${id}/item/${itemId}`, { method: "PUT", body: JSON.stringify({ response }) }),
  // Skipping is its own call, not an empty answer. An empty answer is
  // indistinguishable from a wrong one, and that distinction is the product.
  skipAssessmentItem: (id, itemId) =>
    req(`/assessment/${id}/item/${itemId}`, { method: "PUT", body: JSON.stringify({ skip: true }) }),
  finishAssessment: (id) => req(`/assessment/${id}/finish`, { method: "POST" }),
  getAssessmentResult: (id) => req(`/assessment/${id}/result`),
  getAssessmentHistory: () => req("/assessment/history"),
  getAssessmentProgress: () => req("/assessment/progress"),

  // The screening: items without their keys.
  getScreening: () => req("/screening"),
  /** Submits goal + answers + text; returns marks, profile and the first action. */
  submitScreening: (p) => req("/screening/submit", { method: "POST", body: JSON.stringify(p) }),
  // Where she stands, plus what to do next.
  getProfile: () => req("/profile"),

  /** Short written production from inside a session. May return {refused:true}. */
  submitProduction: (p) => req("/produce", { method: "POST", body: JSON.stringify(p) }),

  /** A Maya scenario's briefing and opening. Beats and model phrases are withheld. */
  getMaya: (id) => req(`/maya/${id}`),
  startMaya: (id) => req(`/maya/${id}/start`, { method: "POST" }),
  resetMaya: (id) => req(`/maya/${id}/reset`, { method: "POST" }),
  /** One learner turn. Returns Maya's response, or {done, summary} at the close. */
  mayaTurn: (id, p) => req(`/maya/${id}/turn`, { method: "POST", body: JSON.stringify(p) }),
  req: (path, opts) => req(path, opts),

  // One listening/reading source: sections, audio urls, markers, transcript.
  getSource: (id) => req(`/sources/${id}`),
  getExpression: (id) => req(`/expressions/${id}`),
  choseExpression: (id, correct) =>
    req(`/expressions/${id}/chose`, { method: "POST", body: JSON.stringify({ correct }) }),
  getExam: (id) => req(`/exam/${id}`),
  examPlay: (id, textNo) => req(`/exam/${id}/play/${textNo}`, { method: "POST" }),
  examHeard: (id, textNo) => req(`/exam/${id}/heard/${textNo}`, { method: "POST" }),
  examAnswer: (id, itemNo, value) =>
    req(`/exam/${id}/answer/${itemNo}`, { method: "PUT", body: JSON.stringify({ value }) }),
  examFinish: (id) => req(`/exam/${id}/finish`, { method: "POST" }),
  examRetake: (id) => req(`/exam/${id}/retake`, { method: "POST" }),
  getWrite: (taskId) => req(`/write/${taskId}`),
  saveDraft: (taskId, text, parentId) =>
    req(`/write/${taskId}/draft`, { method: "PUT", body: JSON.stringify({ text, parentId }) }),
  submitWrite: (taskId, body) =>
    req(`/write/${taskId}/submit`, { method: "POST", body: JSON.stringify(body) }),
  useGrammar: (check, text, quote) =>
    req(`/grammar/${check}/use`, { method: "POST", body: JSON.stringify({ text, quote }) }),
  produceExpression: (id, text) =>
    req(`/expressions/${id}/produce`, { method: "POST", body: JSON.stringify({ text }) }),

  // The B2 topic list, ungated, with this learner's progress folded in.
  getCurriculum: () => req("/curriculum"),
  // The single next action for the home screen's primary button, or null.
  getNext: () => req("/next"),
  // The performance report: assessment delta + evidence profile + recommendation.
  getReport: () => req("/report"),
  // Four fixed, evidence-only questions answered from the same report above.
  getCoach: () => req("/coach"),

  /* PRACTICE MODE — targeted skill drilling, distinct from exam-practice
     papers below. See b2/practice.js. */
  getPracticeCategories: () => req("/practice/categories"),
  getWeakArea: () => req("/practice/weak"),
  getPracticeBySkill: (skill) => req(`/practice/skill/${skill}`),
  getPracticeCounts: () => req("/practice/counts"),
  // Per-module practice papers ranked by the learner's weakest capabilities
  // in her latest assessment. See b2/suggest.js.
  getSuggestedPractice: () => req("/practice/suggested"),

  /* EXAM-PRACTICE PAPERS (Goethe/telc standalone sections). Separate attempt
     bookkeeping from the diagnostic assessment — see b2/exam_paper.js. */
  getCompletePapers: () => req("/paper/complete"),
  getPapersByBoard: (board) => req(`/paper/board/${board}`),
  startPaper: (paperId) => req(`/paper/${paperId}/start`, { method: "POST" }),
  getPaperAttempt: (attemptId) => req(`/paper/attempt/${attemptId}`),
  answerPaperItem: (attemptId, itemId, response) =>
    req(`/paper/attempt/${attemptId}/item/${itemId}`, { method: "PUT", body: JSON.stringify({ response }) }),
  finishPaper: (attemptId) => req(`/paper/attempt/${attemptId}/finish`, { method: "POST" }),

  /** @param {{taskId,text,composeMs,pasteEvents}} p */
  submit: (p) => req("/submissions", { method: "POST", body: JSON.stringify(p) }),

  /** Raw audio Blob straight from MediaRecorder — no multipart, no upload lib. */
  async speak(blob, { reference = "" } = {}) {
    const res = await fetch(
      `${BASE}/b2/speaking${reference ? `?reference=${encodeURIComponent(reference)}` : ""}`,
      { method: "POST", headers: { "Content-Type": blob.type || "audio/webm", ...authHeader() }, body: blob }
    );
    const body = await res.json().catch(() => ({}));
    if (res.status === 422 && body.refused) return body;
    if (res.status === 503) return { unavailable: true, ...body };
    if (!res.ok) throw new Error(body.error || `speaking -> ${res.status}`);
    return body;
  },

  recommend: (skills, opts = {}) =>
    req("/recommend", { method: "POST", body: JSON.stringify({ skills, ...opts }) }),

  interviewSet: (n = 5, categories = null) =>
    req(`/interview/set?n=${n}${categories ? `&categories=${categories.join(",")}` : ""}`),

  /** Grades one spoken answer against that question's own trap and follow-up. */
  async interviewAnswer(blob, questionId, turn = 0, used = []) {
    const q = `q=${encodeURIComponent(questionId)}&turn=${turn}` +
      (used.length ? `&used=${encodeURIComponent(used.join("|"))}` : "");
    const res = await fetch(`${BASE}/b2/interview/answer?${q}`, {
      method: "POST", headers: { "Content-Type": blob.type || "audio/webm", ...authHeader() }, body: blob,
    });
    const body = await res.json().catch(() => ({}));
    // 503 = we could not grade it; 422 = we could not hear it. Both mean
    // "nothing counted", and both carry a message that says which — throwing
    // on 422 replaced a specific, actionable reason with a generic one.
    if (res.status === 503 || res.status === 422) return { unavailable: true, ...body };
    if (!res.ok) throw new Error(body.error || `interview -> ${res.status}`);
    return body;
  },

  interviewSummary: (answers) =>
    req("/interview/summary", { method: "POST", body: JSON.stringify({ answers }) }),

  reportOutcome: (p) => req("/outcomes", { method: "POST", body: JSON.stringify(p) }),
  calibration: () => req("/calibration"),
  resources: (q = "") => req(`/resources${q}`),

  /* AUTH. Minimal by design (see src/auth.js on the server): email + password,
     no verification, no reset flow. `hasSession()` is synchronous so the
     shell can decide "show login or show the app" without a network round
     trip on first paint. */
  hasSession: () => !!TOKEN,
  signup: async (email, password) => {
    const r = await authReq("/signup", { method: "POST", body: JSON.stringify({ email, password }) });
    if (r.token) setToken(r.token);
    return r;
  },
  login: async (email, password) => {
    const r = await authReq("/login", { method: "POST", body: JSON.stringify({ email, password }) });
    if (r.token) setToken(r.token);
    return r;
  },
  demoLogin: async () => {
    const r = await authReq("/demo", { method: "POST" });
    if (r.token) setToken(r.token);
    return r;
  },
  logout: async () => {
    await authReq("/logout", { method: "POST" });
    setToken(null);
  },
};
