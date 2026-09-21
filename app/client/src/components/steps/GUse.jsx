import { useEffect, useRef, useState } from "react";
import { b2 } from "../../lib/b2api";

/* USE — the learner's own sentence, doing the same job.
   ═══════════════════════════════════════════════════════════════════════
   The server does not look for a string. It asks whether the communicative
   RELATIONSHIP is there: a condition that did not hold and the consequence
   that therefore did not follow; or a concession followed by an objection, in
   that order. Which is why the feedback can say which half is missing rather
   than "not quite".

   A learner who expresses the relationship in imperfect German has done the
   thing being measured and is told what to fix. A learner who hands back the
   sentence from the source has not, whatever else they got right. */

export default function GUse({ step, ctx }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const box = useRef(null);

  useEffect(() => {
    ctx.setHideFooter(!result?.ok);
    return () => ctx.setHideFooter(false);
  }, [result]); // eslint-disable-line

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const r = await b2.useGrammar(step.check || "irrealis", text, step.quote || "");
      setResult(r);
      if (r.ok) ctx.commit(true, r.say);
    } catch {
      setResult({ ok: false, say: "Das kam gerade nicht durch. Versuchen Sie es noch einmal." });
    }
    setSending(false);
  };

  return (
    <div className="gu">
      <div className="eyebrow">Jetzt Sie</div>
      <p className="gu-ctx">{step.context}</p>
      {step.hint && !result && <p className="gu-hint">{step.hint}</p>}

      <textarea ref={box} className="gu-box" rows={4} spellCheck="false"
        value={text} onChange={e => setText(e.target.value)}
        placeholder="Ihr Satz…" disabled={sending || result?.ok} />

      {!result && (
        <button className="b2-cta gu-send" onClick={send} disabled={!text.trim() || sending}>
          {sending ? "…" : "Prüfen"}
        </button>
      )}
      {result && (
        <div className={"gu-said" + (result.ok ? " ok" : "")}>
          <p>{result.say}</p>
          {!result.ok && (
            <button className="b2-cta gu-send"
              onClick={() => { setResult(null); box.current?.focus(); }}>Noch einmal</button>
          )}
        </div>
      )}
    </div>
  );
}
