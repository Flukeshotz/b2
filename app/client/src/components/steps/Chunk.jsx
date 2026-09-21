import { useEffect } from "react";
import { speak } from "../../lib/audio";
import Icon from "../../screens/b2/Icon";

/* An expression, shown in the line it was actually said in.
   Not Teach.jsx: there is no unlock, no flip, no "+1 word". A B2 learner is not
   collecting words, and the thing being taught is usually several words long.
   What matters here is the CONTEXT — the phrase alone is a dictionary entry,
   the phrase in the sentence somebody said is language she can reuse. */

export default function Chunk({ step, ctx }) {
  const [de, en] = ctx.teaches[step.w] || [];

  useEffect(() => {
    ctx.setMainBtn({ label: "Verstanden", disabled: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (!de) return null;

  // Highlight the expression inside its quote so the eye lands on it.
  const quote = step.quote || "";
  const head = de.split(/[\s,]+/).sort((a, b) => b.length - a.length)[0] || de;
  const at = quote.toLowerCase().indexOf(head.toLowerCase().slice(0, Math.max(4, head.length - 2)));

  return (
    <div className="chunk">
      <div className="eyebrow">Ausdruck</div>
      <h2 className="chunk-de">{de}</h2>
      <p className="chunk-en">{en}</p>

      {quote && (
        <blockquote className="chunk-quote">
          {at >= 0 ? (<>
            {quote.slice(0, at)}<b>{quote.slice(at, at + head.length)}</b>{quote.slice(at + head.length)}
          </>) : quote}
          {step.who && <cite>{step.who}</cite>}
        </blockquote>
      )}

      <button className="chunk-hear" onClick={() => speak(step.quote || de)}><Icon name="play" size={15} /> Anhören</button>
      {step.why && <p className="chunk-why">{step.why}</p>}
    </div>
  );
}
