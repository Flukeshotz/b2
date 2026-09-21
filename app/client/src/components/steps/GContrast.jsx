import { useState } from "react";

/* CONTRAST — a minimal pair, and a question about what changes.
   ═══════════════════════════════════════════════════════════════════════
   Not a conjugation table and not "pick the correct ending". Two sentences
   made of nearly the same words sit side by side, and the learner has to work
   out what the difference DOES: which one says it did not happen, which one
   leaves the matter open, which one is harder to argue with.

   That is the only honest way to teach a form whose whole job is meaning. A
   learner who can conjugate hätte and does not know that it closes the door on
   an option has learned nothing they can use in a discussion. */

export default function GContrast({ step, ctx }) {
  const [wrong, setWrong] = useState(new Set());
  const [chosen, setChosen] = useState(null);

  const tap = (i) => {
    if (ctx.answered || chosen !== null) return;
    if (i !== step.answer) { setWrong(prev => new Set(prev).add(i)); ctx.miss(); return; }
    setChosen(i);
    ctx.commit(true, step.explain);
  };

  return (
    <div className="gc">
      <div className="eyebrow">Zwei Fassungen</div>
      {step.lead && <p className="gc-lead">{step.lead}</p>}

      <div className="gc-pair">
        {step.variants.map(v => (
          <div key={v.label} className="gc-var">
            <span className="gc-tag">{v.label}</span>
            <p className="gc-de">{v.de}</p>
          </div>
        ))}
      </div>

      <p className="gc-q">{step.q}</p>
      <div className="gc-opts">
        {step.options.map((o, i) => (
          <button key={i}
            className={"gc-opt" + (wrong.has(i) ? " wrongish" : "") + (chosen === i ? " right" : "")}
            style={wrong.has(i) ? { pointerEvents: "none" } : undefined}
            onClick={() => tap(i)}>{o}</button>
        ))}
      </div>
    </div>
  );
}
