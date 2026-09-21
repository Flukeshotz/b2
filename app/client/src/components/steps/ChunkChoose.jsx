import { useState } from "react";
import { b2 } from "../../lib/b2api";

/* CHOOSE — a situation, not a gap.
   ═══════════════════════════════════════════════════════════════════════
   The A1 `pick` step asks "which one is obwohl?", which tests whether the
   learner can match a label to a string. This asks: here is a situation you
   have been in — what do you say? At least two of the options are German
   somebody could really say, so the item cannot be answered by eliminating
   nonsense, and the explanation says why the tempting one is tempting.

   Wrong answers cost the first-try credit, never the item. */

export default function ChunkChoose({ step, ctx }) {
  const [wrong, setWrong] = useState(new Set());
  const [chosen, setChosen] = useState(null);

  const tap = (i) => {
    if (ctx.answered || chosen !== null) return;
    if (i !== step.answer) {
      setWrong(prev => new Set(prev).add(i));
      ctx.miss();
      /* NO evidence is recorded here. An earlier version posted one negative
         row per wrong tap, so a learner working down a three-option list
         generated two "wrong" rows for a single item and the recommender saw
         guessing as repeated failure. One item is one demonstration: it is
         recorded once, below, and it counts as correct only if it was right
         first time. */
      return;
    }
    setChosen(i);
    const firstTry = wrong.size === 0;
    for (const ex of step.exercises || []) b2.choseExpression(ex, firstTry).catch(() => {});
    ctx.commit(true, step.explain);
  };

  return (
    <div className="cc">
      <div className="eyebrow">Die Lage</div>
      <p className="cc-sit">{step.situation}</p>
      <p className="cc-q">{step.q}</p>
      <div className="cc-opts">
        {step.options.map((o, i) => (
          <button key={i}
            className={"cc-opt" + (wrong.has(i) ? " wrongish" : "") + (chosen === i ? " right" : "")}
            style={wrong.has(i) ? { pointerEvents: "none" } : undefined}
            onClick={() => tap(i)}>
            <span className="ltr">{"ABC"[i]}</span>
            <span>„{o}“</span>
          </button>
        ))}
      </div>
    </div>
  );
}
