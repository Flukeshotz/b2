import { useEffect, useRef, useState } from "react";
import { shuffle } from "../../lib/curriculum";
import { speak, blip } from "../../lib/audio";
import MistakeBadge from "../MistakeBadge";

const NOT_THAT = ["Not that one.", "Not quite. Try another.", "Close, but no."];

export default function Listen({ step, ctx }) {
  const [opts] = useState(() => shuffle(step.from.slice()));
  const [wrongIdx, setWrongIdx] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [hint, setHint] = useState(null);
  const [playing, setPlaying] = useState(false);
  const correct = step.w;
  const word = (i) => ctx.teaches[i];

  const play = () => {
    setPlaying(true);
    speak(word(correct)[0]);
    setTimeout(() => setPlaying(false), 1400);
  };
  useEffect(() => {
    play();
    ctx.setFootSkip({ label: "Can't listen right now", onSkip: () => { ctx.onCooldown("listen"); ctx.advance(); } });
    // eslint-disable-next-line
  }, [step]);

  const tap = (i) => {
    if (ctx.answered || selected !== null) return;
    if (i !== correct) {
      setWrongIdx(prev => new Set(prev).add(i));
      blip(false);
      ctx.miss();
      const [cde, cen, cicon] = word(correct);
      ctx.onPushReview(cde, cen, cicon);
      setHint(NOT_THAT[Math.floor(Math.random() * NOT_THAT.length)]);
      return;
    }
    setSelected(i);
    blip(true);
    const [de] = word(correct);
    ctx.commit(true, `That's <b>${de}</b>.`);
  };

  return (
    <>
      {step.reviewWord && <MistakeBadge />}
      <div className="eyebrow">Listen</div>
      <button className={`speaker ${playing ? "playing" : ""}`} style={{ marginTop: 12 }} onClick={play}>
        <span className="ico">🔊</span>
        <div className="wave"><i /><i /><i /><i /><i /></div>
        <small>Tap to hear it again</small>
      </button>
      <div className="prompt" style={{ fontSize: 17 }}>Which word did you hear?</div>
      <div className="stack">
        {opts.map(i => {
          const [de, en] = word(i);
          const isWrong = wrongIdx.has(i);
          const isSel = selected === i;
          return (
            <button key={i} className={`opt ${isWrong ? "wrongish" : ""} ${isSel ? "sel right" : ""}`}
              style={isWrong ? { pointerEvents: "none" } : undefined}
              onClick={() => tap(i)}>
              <span><span className="de">{de}</span><br /><span className="en">{en}</span></span>
            </button>
          );
        })}
      </div>
      {hint && <div className="notthat">{hint}</div>}
    </>
  );
}
