import { useState } from "react";
import { shuffle } from "../../lib/curriculum";
import { speak, blip } from "../../lib/audio";

const NOT_THAT = ["Not that one.", "Not quite. Try another.", "Close, but no."];

// Riya's scenario-picker engine — one shared mechanic behind several of her
// ideas (What Time Is It?, Formal or Casual?, Taste Reaction, Count What You
// See). A little scene sets the context, then you tap the word that actually
// fits it. `flip:true` (Price Tag Flip) gates the options behind a tap-to-ask
// reveal first, so the question always comes before the answer. `free:true`
// is for scenes with no single right answer (is 2€ coffee cheap or
// expensive? depends who you ask) — any tap is accepted, same spirit as
// Chat's "choice" mode.
export default function SceneTap({ step, ctx }) {
  const [opts] = useState(() => shuffle(step.from.slice()));
  const [wrongIdx, setWrongIdx] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [hint, setHint] = useState(null);
  const [revealed, setRevealed] = useState(!step.flip);
  const correct = step.from[0];
  const word = (i) => ctx.teaches[i];

  const ask = () => {
    setRevealed(true);
    if (step.askAudio) speak(step.askAudio);
  };

  const tap = (i) => {
    if (ctx.answered || selected !== null) return;
    const [de] = word(i);
    speak(de);
    if (!step.free && i !== correct) {
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
    ctx.commit(true, step.free ? `<b>${de}</b>. Fair enough.` : `That's <b>${de}</b>.`);
  };

  return (
    <>
      <div className="eyebrow">{step.eyebrow || "What fits?"}</div>
      <div className="scene">
        <div className={`scene-emoji ${step.flip && !revealed ? "facedown" : ""}`}>{step.scene}</div>
        {(revealed && step.revealCaption ? step.revealCaption : step.sceneCaption) && (
          <div className="scene-caption">{revealed && step.revealCaption ? step.revealCaption : step.sceneCaption}</div>
        )}
      </div>
      <div className="prompt" dangerouslySetInnerHTML={{ __html: step.q }} />

      {!revealed ? (
        <button className="btn" style={{ marginTop: 16 }} onClick={ask}>{step.askLabel || "Ask"}</button>
      ) : (
        <>
          <div className="grid2 scenegrid">
            {opts.map(i => {
              const [de, en, pic] = word(i);
              const isWrong = wrongIdx.has(i);
              const isSel = selected === i;
              return (
                <button key={i} className={`tile scenetile ${isWrong ? "wrongish" : ""} ${isSel ? "sel right" : ""}`}
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
      )}
    </>
  );
}
