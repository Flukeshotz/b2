import { useEffect, useState } from "react";
import { shuffle } from "../../lib/curriculum";
import { speak, blip } from "../../lib/audio";
import Maya from "../Maya";
import MistakeBadge from "../MistakeBadge";

const NOT_THAT = ["Not that one.", "Not quite. Try another.", "Close, but no."];

// Maya sends a voice note -- a full sentence, not an isolated word, in a
// texting-a-friend register rather than classroom-audio register. The
// question stays exactly as easy as Listen.jsx (tap which of two taught
// words she said); what's different is that the learner has to pick the
// word out of a real sentence around it, closing the "everything is a
// single word in isolation" gap without adding any new answer format.
export default function VoiceNote({ step, ctx }) {
  const [opts] = useState(() => shuffle(step.from.slice()));
  const [wrongIdx, setWrongIdx] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [hint, setHint] = useState(null);
  const [playing, setPlaying] = useState(false);
  const correct = step.w;
  const word = (i) => ctx.teaches[i];

  const play = () => {
    setPlaying(true);
    speak(step.sentence);
    setTimeout(() => setPlaying(false), 1800);
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
      <div className="eyebrow">Voice note from Maya</div>
      <div className="voicenote">
        <Maya mood="bob" className="voicenote-av" />
        <button className={`voicenote-bubble ${playing ? "playing" : ""}`} onClick={play}>
          <span className="wave"><i /><i /><i /><i /><i /></span>
          <small>Tap to play again</small>
        </button>
      </div>
      {step.context && <div className="voicenote-context">{step.context}</div>}
      <div className="prompt" style={{ fontSize: 17 }}>Which word did she say?</div>
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
