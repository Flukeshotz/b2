import { useState } from "react";
import { shuffle } from "../../lib/curriculum";
import { speak, blip } from "../../lib/audio";

const NOT_THAT = ["Not that one.", "That one fits. Look again.", "Close, but no."];

// Category reasoning instead of matching — three words share something, one
// doesn't. Cross-module by design: it's a recall check on everything she
// already owns, not just this session's two new words.
export default function OddOneOut({ step, ctx }) {
  const [opts] = useState(() => shuffle(step.items.map((_, i) => i)));
  const [wrongIdx, setWrongIdx] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [hint, setHint] = useState(null);

  const tap = (i) => {
    if (ctx.answered || selected !== null) return;
    const [de] = step.items[i];
    speak(de);
    if (i !== step.oddIdx) {
      setWrongIdx(prev => new Set(prev).add(i));
      blip(false);
      ctx.miss();
      setHint(NOT_THAT[Math.floor(Math.random() * NOT_THAT.length)]);
      return;
    }
    setSelected(i);
    blip(true);
    ctx.commit(true, `<b>${de}</b> doesn't belong with the others.`);
  };

  return (
    <>
      <div className="eyebrow">Odd One Out</div>
      <div className="prompt" dangerouslySetInnerHTML={{ __html: step.q }} />
      <div className="grid2">
        {opts.map(i => {
          const [de, en, pic] = step.items[i];
          const isWrong = wrongIdx.has(i);
          const isSel = selected === i;
          return (
            <button key={i} className={`tile oddtile ${isWrong ? "wrongish" : ""} ${isSel ? "sel right" : ""}`}
              style={isWrong ? { pointerEvents: "none" } : undefined}
              onClick={() => tap(i)}>
              <span className="pic">{pic}</span>
              <span className="de">{de}</span>
              <span className="en">{en}</span>
            </button>
          );
        })}
      </div>
      {hint && <div className="notthat">{hint}</div>}
    </>
  );
}
