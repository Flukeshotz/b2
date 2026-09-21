import { useEffect, useRef, useState } from "react";
import { b2 } from "../../lib/b2api";

/* PRODUCE — the learner's own sentence, about their own situation.
   ═══════════════════════════════════════════════════════════════════════
   This is the only step in the vocabulary experience that generates strong
   evidence, and the only one that can fail for a reason worth hearing.

   The server does not check that the expression appears. It checks that it was
   USED: that the structural promise it makes was kept ("Begründet wird das
   mit …" is unfinished until something follows the `mit`), and that enough of
   the sentence is the learner's own rather than the source's. A learner who
   pastes the phrase in front of a copied sentence is told so, and gets another
   go — the standing retry rule.

   ONE improvement, never a report. A wall of findings is what makes people
   stop writing. */

export default function ChunkProduce({ step, ctx }) {
  const [x, setX] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const box = useRef(null);

  useEffect(() => { b2.getExpression(step.ex).then(setX).catch(() => setX(null)); }, [step.ex]);

  useEffect(() => {
    ctx.setHideFooter(!result?.ok);
    return () => ctx.setHideFooter(false);
  }, [result]); // eslint-disable-line

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const r = await b2.produceExpression(step.ex, text);
      setResult(r);
      if (r.ok) ctx.commit(true, r.say);
    } catch {
      setResult({ ok: false, say: "Das kam gerade nicht durch. Versuchen Sie es noch einmal." });
    }
    setSending(false);
  };

  const retry = () => { setResult(null); box.current?.focus(); };

  return (
    <div className="cp">
      <div className="eyebrow">Jetzt Sie</div>
      {x && <p className="cp-cite">„{x.citation}“</p>}
      <p className="cp-ctx">{step.context}</p>
      {step.hint && !result && <p className="cp-hint">{step.hint}</p>}

      <textarea ref={box} className="cp-box" rows={4} spellCheck="false"
        value={text} onChange={e => setText(e.target.value)}
        placeholder="Ihr Satz…" disabled={sending || result?.ok} />

      {!result && (
        <button className="b2-cta cp-send" onClick={send} disabled={!text.trim() || sending}>
          {sending ? "…" : "Prüfen"}
        </button>
      )}

      {result && (
        <div className={"cp-said" + (result.ok ? " ok" : "")}>
          <p>{result.say}</p>
          {!result.ok && <button className="b2-cta cp-send" onClick={retry}>Noch einmal</button>}
        </div>
      )}
    </div>
  );
}
