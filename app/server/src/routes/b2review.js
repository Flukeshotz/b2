/**
 * Teacher review surface.
 *
 * Server-rendered on purpose: the reviewer is a German teacher, not a user of
 * our app, and this must open from a link on any device with nothing installed.
 *
 * NO AUTHENTICATION EXISTS in this repository, so access is a shared secret in
 * the URL (B2_REVIEW_TOKEN). That is honest for an internal reviewer and must
 * not outlive Phase 2 — it is listed as a known limitation, not a design.
 */

const express = require("express");
const pool = require("../db/pool");
const caps = require("../b2/capabilities");
const { getContentInventory, getGovernanceSummary, updateContentReviewStatus } = require("../b2/governance");

const router = express.Router();
const TOKEN = () => process.env.B2_REVIEW_TOKEN || "";

/* The form posts urlencoded, and the token may arrive in the BODY rather than
   the query — so the body has to be parsed BEFORE the token check runs. It was
   not, which made every approval fail with a 403 the reviewer never saw. */
router.use(express.urlencoded({ extended: true }));

router.use((req, res, next) => {
  if (!TOKEN()) return res.status(503).send(page("Review is not configured", "<p>Set <code>B2_REVIEW_TOKEN</code> on the API and reload.</p>"));
  if (req.query.token !== TOKEN() && req.body?.token !== TOKEN()) return res.status(403).send(page("Not authorised", "<p>This link needs a valid token.</p>"));
  next();
});

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const mmss = (ms) => `${String(Math.floor(ms / 60000)).padStart(2, "0")}:${String(Math.floor(ms % 60000 / 1000)).padStart(2, "0")}`;

router.get("/inventory/json", async (req, res) => {
  const { module: mod, status, skill } = req.query;
  const inventory = await getContentInventory({ module: mod, status, skill });
  const summary = await getGovernanceSummary();
  res.json({ summary, count: inventory.length, items: inventory });
});

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, title, status, duration_s, theme, updated_at FROM b2_sources ORDER BY updated_at DESC`);
  const list = rows.map(r => `
    <li><a href="/api/b2/review/${esc(r.id)}?token=${esc(req.query.token)}">${esc(r.title)}</a>
      <span class="tag ${r.status}">${esc(r.status)}</span>
      <small>${Math.round(r.duration_s / 60)} min · Thema ${r.theme}</small></li>`).join("");
  res.send(page("Content review", `<ul class="srcs">${list || "<li>Nothing to review.</li>"}</ul>`));
});

router.get("/:id", async (req, res) => {
  const { rows: s } = await pool.query(`SELECT * FROM b2_sources WHERE id=$1`, [req.params.id]);
  if (!s[0]) return res.status(404).send(page("Not found", ""));
  const src = s[0];
  const { rows: exps } = await pool.query(
    `SELECT * FROM b2_experiences WHERE source_id=$1 ORDER BY ord`, [req.params.id]);

  const d = src.declaration || {};
  const cap = (id) => caps.BY_ID.get(id);

  const decl = `
    <section class="card">
      <h2>Declaration</h2>
      <dl>
        <dt>Primary capability</dt><dd><b>${esc(cap(d.primary_capability)?.label)}</b> — <i>${esc(cap(d.primary_capability)?.de)}</i>
          <br><small>Evidence: ${esc(cap(d.primary_capability)?.evidence)}${cap(d.primary_capability)?.evidence === "ours" ? " — our pedagogical reading, not named by either board" : ", named in the board handbooks"}</small></dd>
        <dt>Also trains</dt><dd>${(d.secondary_capabilities || []).map(c => esc(cap(c)?.label)).join(" · ") || "—"}</dd>
        <dt>Theme</dt><dd>${d.theme} — ${esc(caps.THEMES[d.theme])}</dd>
        <dt>Difficulty</dt><dd>content: ${(d.difficulty?.content || []).join(", ") || "—"}<br>delivery: ${(d.difficulty?.delivery || []).join(", ") || "—"}</dd>
        <dt>Exam relevance</dt><dd>${esc(d.exam || "—")}</dd>
        <dt>Language taught</dt><dd>${(d.language_resources || []).map(r => `<div>${esc(r)}</div>`).join("")}</dd>
      </dl>
    </section>`;

  const gate = src.gate_report || {};
  const gateBlock = `
    <section class="card">
      <h2>Automated gates <span class="tag ${gate.ok ? "approved" : "rejected"}">${gate.ok ? "passed" : "blocked"}</span></h2>
      ${(gate.fails || []).map(f => `<p class="fail">FAIL — ${esc(f)}</p>`).join("")}
      ${(gate.warns || []).map(w => `<p class="warn">WARN — ${esc(w)}</p>`).join("") || "<p class=ok>No warnings.</p>"}
      <p><small>Checked: declaration validity · every taught phrase occurs in the script · every answer key in range and unique · every key carries an explanation · no item requires clinical knowledge · the script scores B2 on our own analyser · at least one inference item · at least one production experience.</small></p>
    </section>`;

  const script = (src.script || []).map(t => `
    <div class="turn"><span class="ts">${mmss(t.ms)}</span>
      <span class="who">${esc(t.speaker)}</span>
      <span class="de">${esc(t.de)}</span></div>`).join("");

  const markers = (src.markers || []).map(m => `
    <tr><td class="ts">${mmss(m.ms)}</td><td><b>${esc(m.phrase)}</b><br><small>${esc(m.en)}</small></td>
    <td>${esc(m.why)}</td></tr>`).join("");

  const stepHtml = (e, st, i) => {
    if (st.t === "sourceq") return `
      <div class="item">
        <div class="k">${esc(st.kind)}</div>
        <p class="q">${esc(st.q)}</p>
        <ol class="opts">${st.options.map((o, j) => `<li class="${j === st.answer ? "key" : ""}">${esc(o)}${j === st.answer ? " <b>← key</b>" : ""}</li>`).join("")}</ol>
        <p class="why">${esc(st.explain)}</p>
      </div>`;
    if (st.t === "spotmistake") return `
      <div class="item"><div class="k">spot the mistake</div>
        <p><i>${esc(st.context)}</i></p>
        <p class="q">${st.tokens.map((tk, j) => j === st.wrongIdx ? `<b class="bad">${esc(tk)}</b>` : esc(tk)).join(" ")}</p>
        <p class="why">Correct: <b>${esc(st.shouldBe)}</b> instead of <b>${esc(st.tokens[st.wrongIdx])}</b></p></div>`;
    if (st.t === "chunk") { const [de, en] = e.teaches[st.w] || [];
      return `<div class="item"><div class="k">expression</div><p class="q"><b>${esc(de)}</b> — ${esc(en)}</p>
        <p class="why">Im Gespräch: „${esc(st.quote)}“ <small>(${esc(st.who)})</small></p></div>`; }
    if (st.t === "pick") return `
      <div class="item"><div class="k">choose</div><p class="q">${st.q}</p>
        <ol class="opts">${st.from.map((w, j) => `<li class="${j === 0 ? "key" : ""}">${esc((e.teaches[w] || [])[0])}${j === 0 ? " <b>← key</b>" : ""}</li>`).join("")}</ol></div>`;
    if (st.t === "produce") return `
      <div class="item"><div class="k">the learner writes</div><p class="q">${esc(st.prompt)}</p>
        <p class="why">Mindestens ${st.minWords} Wörter. Hinweise <i>nach</i> dem Schreiben: ${(st.afterHints || []).map(esc).join(" · ")}</p></div>`;
    if (st.t === "build") return `
      <div class="item"><div class="k">build the sentence</div><p class="q">${esc(st.de.join(" "))}</p>
        <p class="why">${esc(st.en)}</p></div>`;
    if (st.t === "translate") return `
      <div class="item"><div class="k">translate</div><p class="q">${esc(st.de)}</p>
        <p class="why">${esc((st.en || []).join(" "))}</p></div>`;
    if (st.t === "hack") return `<div class="item note"><div class="k">explanation shown</div><p class="q">${esc(st.title)}</p><p class="why">${st.body}</p></div>`;
    if (st.t === "story") return `<div class="item note"><div class="k">narration</div><p class="why">${st.lines.map(esc).join("<br>")}</p></div>`;
    if (st.t === "listen_source") return `<div class="item note"><div class="k">audio</div><p class="why">Plays ${st.plays}×, ${esc(st.mode)}.</p></div>`;
    return `<div class="item note"><div class="k">${esc(st.t)}</div></div>`;
  };

  const expsHtml = exps.map(e => `
    <section class="card">
      <h2>${esc(e.title)} <span class="tag ${e.status}">${esc(e.status)}</span></h2>
      <p class="meta">${esc(e.kind)} · ${e.minutes} min · trains <b>${esc(cap(e.primary_capability)?.label)}</b>
        ${e.checks?.length ? `· measured by ${e.checks.map(esc).join(", ")}` : ""}</p>
      ${e.steps.map((st, i) => stepHtml(e, st, i)).join("")}
    </section>`).join("");

  const decided = ["approved", "live", "rejected"].includes(src.status);
  const form = `
    <section class="card decide">
      <h2>Your decision</h2>
      <p>Two questions only a person can answer:</p>
      <form method="POST" action="/api/b2/review/${esc(src.id)}/decide">
        <input type="hidden" name="token" value="${esc(req.query.token)}">
        <label><input type="checkbox" name="q_teacher" required> The German is natural and correct, and I would put this in front of a B2 class.</label>
        <label><input type="checkbox" name="q_finish" required> A real learner would want to finish this.</label>
        <label>Notes <textarea name="notes" rows="3" placeholder="Anything to change?"></textarea></label>
        <label>Your name <input name="who" required placeholder="e.g. Chinnu"></label>
        <div class="row">
          <button name="decision" value="approved" class="ok">Approve</button>
          <button name="decision" value="rejected" class="no">Send back</button>
        </div>
      </form>
      ${decided ? `<p class="ok">Currently <b>${esc(src.status)}</b>${src.approved_by ? ` by ${esc(src.approved_by)}` : ""}. ${esc(src.review_notes || "")}</p>` : ""}
    </section>`;

  res.send(page(src.title, `
    <p class="hook">${esc(src.hook)}</p>
    <p class="meta">${Math.round(src.duration_s / 60)} Minuten · ${(src.script || []).length} Redebeiträge ·
      ${[...new Set((src.script || []).map(t => t.speaker))].map(esc).join(" · ")}
      <span class="tag ${src.status}">${esc(src.status)}</span></p>
    ${decl}${gateBlock}
    <section class="card"><h2>Transcript</h2><div class="script">${script}</div></section>
    <section class="card"><h2>Expressions taught</h2><table>${markers}</table></section>
    ${expsHtml}${form}`));
});

router.post("/:id/decide", async (req, res) => {
  const { decision, notes, who } = req.body;
  if (!["approved", "rejected"].includes(decision)) return res.status(400).send("bad decision");
  await pool.query(
    `UPDATE b2_sources SET status=$2, review_notes=$3, approved_by=$4,
       approved_at = CASE WHEN $2='approved' THEN now() ELSE NULL END, updated_at=now()
     WHERE id=$1`, [req.params.id, decision, notes || null, who || null]);
  await pool.query(`UPDATE b2_experiences SET status=$2, updated_at=now() WHERE source_id=$1`,
    [req.params.id, decision]);
  res.send(page(decision === "approved" ? "Approved" : "Sent back", `
    <p class="ok">Thank you. <b>${esc(req.params.id)}</b> is now <b>${esc(decision)}</b>.</p>
    ${decision === "approved" ? "<p>It still has to be published before any learner sees it.</p>" : ""}
    <p><a href="/api/b2/review?token=${esc(req.body.token)}">Back to the list</a></p>`));
});

function page(title, body) {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} · Skillcase review</title>
<style>
:root{--bg:#f7f6f3;--card:#fff;--ink:#16130f;--dim:#5c554c;--line:#e2ded5;--ok:#186b45;--warn:#8a6209;--bad:#a02a1c}
@media(prefers-color-scheme:dark){:root{--bg:#0e0d0b;--card:#171512;--ink:#eceae4;--dim:#a49d92;--line:#272420;--ok:#69bd94;--warn:#d5a94f;--bad:#e0897a}}
*{box-sizing:border-box}body{margin:0;padding:0 16px 80px;background:var(--bg);color:var(--ink);
font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.w{max-width:860px;margin:0 auto}h1{font-size:30px;letter-spacing:-.02em;margin:34px 0 6px}
h2{font-size:17px;margin:0 0 12px;letter-spacing:-.01em}
.hook{font-size:18px;color:var(--dim);margin:0 0 8px}.meta{color:var(--dim);font-size:14px;margin:0 0 20px}
.card{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:18px;margin:0 0 16px}
dl{margin:0;display:grid;grid-template-columns:max-content 1fr;gap:8px 16px}
dt{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--dim)}dd{margin:0}
.script{max-height:460px;overflow:auto;border:1px solid var(--line);border-radius:6px;padding:12px}
.turn{display:grid;grid-template-columns:52px 120px 1fr;gap:10px;padding:7px 0;border-bottom:1px solid var(--line)}
.turn:last-child{border:0}.ts{color:var(--dim);font-variant-numeric:tabular-nums;font-size:13px}
.who{color:var(--dim);font-size:13px}.de{font-size:15.5px}
table{width:100%;border-collapse:collapse}td{padding:9px 10px 9px 0;border-bottom:1px solid var(--line);vertical-align:top;font-size:14.5px}
.item{border-top:1px solid var(--line);padding:14px 0}.item:first-of-type{border-top:0}
.k{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--dim);margin-bottom:6px}
.q{margin:0 0 8px;font-size:16px}.opts{margin:0 0 8px;padding-left:22px}.opts .key{color:var(--ok);font-weight:600}
.why{margin:0;color:var(--dim);font-size:14.5px}.item.note .q{font-weight:600}
.bad{color:var(--bad)}.fail{color:var(--bad)}.warn{color:var(--warn)}.ok{color:var(--ok)}
.tag{font-size:11px;text-transform:uppercase;letter-spacing:.08em;padding:3px 7px;border-radius:3px;background:var(--line);color:var(--dim)}
.tag.approved,.tag.live{background:#dff0e7;color:var(--ok)}.tag.rejected{background:#f8e4e0;color:var(--bad)}
.decide label{display:block;margin:0 0 14px;font-size:15px}
.decide input[type=checkbox]{margin-right:8px}
textarea,input[name=who]{width:100%;padding:9px;border:1px solid var(--line);border-radius:5px;background:var(--bg);color:var(--ink);font:inherit;margin-top:5px}
.row{display:flex;gap:10px}button{flex:1;padding:13px;border:0;border-radius:6px;font:600 15px/1 inherit;cursor:pointer}
button.ok{background:var(--ok);color:#fff}button.no{background:var(--line);color:var(--ink)}
.srcs{list-style:none;padding:0}.srcs li{padding:12px 0;border-bottom:1px solid var(--line)}
.srcs a{font-size:17px;font-weight:600;color:var(--ink)}small{color:var(--dim)}
</style></head><body><div class="w"><h1>${esc(title)}</h1>${body}</div></body></html>`;
}

module.exports = router;
