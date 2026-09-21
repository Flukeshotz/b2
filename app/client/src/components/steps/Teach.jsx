import { useEffect, useRef, useState } from "react";
import { speak, blip } from "../../lib/audio";

// The moment a new word appears is the one beat every single lesson shares —
// worth a real "I just unlocked this" feeling instead of a flat fade-in: the
// tile spins like a slot reel, flips over mid-spin to reveal the word, then
// settles with a sound and a badge, and only then does she hear it spoken.
export default function Teach({ step, ctx }) {
  const [de, en, pic] = ctx.teaches[step.w];
  /* B2 items are often phrases, not words, and a B2 learner is not building a
     word count — so neither the label nor the unlock badge belongs there. */
  const exam = ctx.tone === "exam";
  const [phase, setPhase] = useState("spin"); // spin -> settle -> done
  const held = useRef(null);
  const play = (slow) => speak(de, slow);

  useEffect(() => {
    setPhase("spin");
    ctx.setMainBtn({ label: "Got it", disabled: true });
    const t1 = setTimeout(() => {
      setPhase("settle");
      blip(true);
    }, 620);
    const t2 = setTimeout(() => {
      setPhase("done");
      ctx.setMainBtn({ label: "Got it", disabled: false });
      play(false);
    }, 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line
  }, [step]);

  const revealed = phase !== "spin";

  return (
    <div className="stepcenter">
      <div className="eyebrow">{exam ? "Learn this" : "New word"}</div>
      <div className="flip3d">
        <div className={`flip3d-inner ${phase === "spin" ? "spin" : "settle"}`}>
          {phase === "spin" ? (
            <div className="unlock-face unlock-lock" aria-hidden="true">🔒</div>
          ) : (
            <div className="unlock-face">
              <div style={{ fontSize: 82, lineHeight: 1 }}>{pic}</div>
              <div className="prompt" style={{ fontSize: 34, textAlign: "center", margin: "10px 0 0" }}>{de}</div>
              <div style={{ fontFamily: "var(--body)", color: "var(--text-dim)", fontSize: 17 }}>{en}</div>
            </div>
          )}
        </div>
      </div>
      {revealed && !exam && <div className="unlock-badge">+1 word unlocked</div>}
      <div className="sp" />
      <button className="speaker" disabled={!revealed}
        onClick={() => play(false)}
        onPointerDown={() => { held.current = setTimeout(() => play(true), 450); }}
        onPointerUp={() => clearTimeout(held.current)}>
        <span className="ico">🔊</span>
        <div className="wave"><i /><i /><i /><i /><i /></div>
        <small>Tap to hear it · hold for slow</small>
      </button>
    </div>
  );
}
