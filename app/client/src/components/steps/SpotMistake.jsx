import { useState } from "react";
import { speak, blip } from "../../lib/audio";

const NOT_THAT = ["Not that one.", "Look again.", "Close, but no."];

// "Judgment" tier — she evaluates someone else's sentence instead of
// producing her own. Lower stakes than it sounds: she's grading a line, not
// herself.
export default function SpotMistake({ step, ctx }) {
  const [wrongIdx, setWrongIdx] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [hint, setHint] = useState(null);

  const tap = (i) => {
    if (ctx.answered || selected !== null) return;
    if (i !== step.wrongIdx) {
      setWrongIdx(prev => new Set(prev).add(i));
      blip(false);
      ctx.miss();
      setHint(NOT_THAT[Math.floor(Math.random() * NOT_THAT.length)]);
      return;
    }
    setSelected(i);
    blip(true);
    speak(step.shouldBe);
    ctx.commit(true, `It should be <b>${step.shouldBe}</b>, not <b>${step.tokens[i]}</b>.`);
  };

  return (
    <>
      <div className="eyebrow">Spot the Mistake</div>
      <div className="mistake-context">{step.context}</div>
      <div className="mistake-quote">
        <span className="qmark">“</span>
        {step.tokens.map((tok, i) => {
          const isWrong = wrongIdx.has(i);
          const isSel = selected === i;
          return (
            <button key={i} className={`word mistake-token ${isWrong ? "wrongish" : ""} ${isSel ? "sel right" : ""}`}
              style={isWrong ? { pointerEvents: "none" } : undefined}
              onClick={() => tap(i)}>
              {tok}
            </button>
          );
        })}
        <span className="qmark">.”</span>
      </div>
      <div className="prompt" style={{ fontSize: 17 }}>One word here is wrong. Tap it.</div>
      {hint && <div className="notthat">{hint}</div>}
    </>
  );
}
