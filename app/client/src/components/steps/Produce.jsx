import { useEffect, useRef, useState } from "react";
import { b2 } from "../../lib/b2api";

/* THE PRODUCTION STEP.
   Everything before this is recognition or judgement. Here she writes German
   nobody wrote for her, and it is the only place in the session that emits our
   strongest evidence.

   Three deliberate choices:
   — The useful expressions are NOT shown while she writes. Offering them turns
     production into a gap-fill with extra steps. They appear afterwards, as
     "here is what you could also have said".
   — Her text is never lost. It is kept in local storage as she types, so
     closing the app mid-sentence costs nothing.
   — Too short is a REFUSAL, not a failure: it does not consume an attempt and
     it says exactly how much more is needed. */

const draftKey = (id) => `b2draft:${id}`;

export default function Produce({ step, ctx }) {
  const [text, setText] = useState(() => {
    try { return localStorage.getItem(draftKey(step.prompt)) || ""; } catch { return ""; }
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [refused, setRefused] = useState(null);
  const t0 = useRef(Date.now());
  const pastes = useRef(0);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const min = step.minWords || 70;
  const enough = words >= min;

  useEffect(() => {
    try { localStorage.setItem(draftKey(step.prompt), text); } catch { /* private mode */ }
  }, [text, step.prompt]);

  useEffect(() => {
    ctx.setHideFooter(true);
    return () => ctx.setHideFooter(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (!enough || sending) return;
    setSending(true); setRefused(null);
    try {
      const r = await b2.submitProduction({
        experienceId: step.experienceId || null,
        /* Without one of these, the server cannot tell what genre this text
           is and silently landed on an argumentative default that flagged a
           clinical Aufnahmebericht for missing Konjunktiv II. Every `produce`
           step must declare which — the content gate now refuses to publish
           one that doesn't (see gate_b2_source.js). */
        taskId: step.taskId || null,
        taskType: step.taskType || null,
        text,
        composeMs: Date.now() - t0.current,
        pasteEvents: pastes.current,
        capabilities: step.capabilities || [],
      });
      if (r?.refused) { setRefused(r.message || "Das reicht noch nicht."); setSending(false); return; }
      setResult(r);
      try { localStorage.removeItem(draftKey(step.prompt)); } catch { /* ignore */ }
      ctx.setHideFooter(false);
      ctx.commit(true, r?.finding?.detail || "Gespeichert.");
    } catch {
      setRefused("Wir konnten das gerade nicht senden. Ihr Text ist gespeichert — versuchen Sie es noch einmal.");
      setSending(false);
    }
  };

  if (result) return (
    <div className="produce">
      <div className="eyebrow">Ihr Text</div>
      <p className="produce-back">{text}</p>

      {/* ONE weakness, not a report. The rest is available and not pushed at her. */}
      {result.finding ? (
        <div className="produce-finding">
          <div className="eyebrow">Das würde ein Prüfer zuerst anstreichen</div>
          <p className="produce-what">{result.finding.detail}</p>
          {result.finding.evidence?.length > 0 && (
            <p className="produce-ev">Bei Ihnen: {result.finding.evidence.slice(0, 3).join(" · ")}</p>
          )}
        </div>
      ) : (
        <p className="produce-ok">Nichts Auffälliges. Das ist auf diesem Niveau selten.</p>
      )}

      <div className="produce-alt">
        <div className="eyebrow">Das hätten Sie auch sagen können</div>
        {(step.afterHints || []).map(h => <span key={h} className="produce-chip">{h}</span>)}
      </div>
    </div>
  );

  return (
    <div className="produce">
      <div className="eyebrow">Schreiben</div>
      <p className="produce-prompt">{step.prompt}</p>
      {step.guidance?.length > 0 && (
        <ul className="produce-guide">{step.guidance.map(g => <li key={g}>{g}</li>)}</ul>
      )}

      <textarea
        className="produce-box"
        value={text}
        onChange={e => setText(e.target.value)}
        onPaste={() => { pastes.current += 1; }}
        placeholder="Schreiben Sie hier…"
        rows={9}
        spellCheck="false"
        autoCorrect="off"
      />

      <div className="produce-foot">
        <span className={"produce-count" + (enough ? " ok" : "")}>
          {words} / {min} Wörter
        </span>
        <button className="b2-cta produce-send" disabled={!enough || sending} onClick={submit}>
          {sending ? "Wird geprüft…" : enough ? "Abgeben" : `Noch ${min - words} Wörter`}
        </button>
      </div>

      {refused && <p className="produce-refused">{refused}</p>}
      <p className="produce-saved">Ihr Text wird beim Tippen gespeichert.</p>
    </div>
  );
}
