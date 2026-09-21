import { useState } from "react";
import { shuffle } from "../../lib/curriculum";
import { speak, blip } from "../../lib/audio";
import MistakeBadge, { HardBadge } from "../MistakeBadge";

const NOT_THAT = ["Not that one.", "Not quite. Try another.", "Close, but no."];

export default function Pick({ step, ctx }) {
  const [opts] = useState(() => shuffle(step.from.slice()));
  const [wrongIdx, setWrongIdx] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [hint, setHint] = useState(null);
  const correct = step.from[0];
  const word = (i) => ctx.teaches[i];
  // "Which one IS Kaffee?" gives her the German and asks for the meaning —
  // tiles show the English. "Which one MEANS thank you?" gives her the
  // English and asks her to recognize the German — tiles must show the
  // German, or she'd solve it by matching pictures to English words and
  // never actually read a word of German.
  const askForGerman = /\bmeans\b/i.test(step.q);

  const tap = (i) => {
    if (ctx.answered || selected !== null) return;
    const [de] = word(i);
    speak(de);
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
    ctx.commit(true, `That's <b>${de}</b>.`);
  };

  return (
    <>
      {step.reviewWord ? <MistakeBadge /> : (step.hard ? <HardBadge /> : null)}
      <div className="prompt" dangerouslySetInnerHTML={{ __html: step.q }} />
      <div className="grid2">
        {opts.map(i => {
          const [de, en, pic] = word(i);
          const isWrong = wrongIdx.has(i);
          const isSel = selected === i;
          const revealed = isWrong || isSel;
          return (
            <button key={i} className={`tile ${isWrong ? "wrongish" : ""} ${isSel ? "sel right" : ""}`}
              style={isWrong ? { pointerEvents: "none" } : undefined}
              onClick={() => tap(i)}>
              <span className="pic">{pic}</span>
              {askForGerman ? (
                <>
                  <span className="de">{de}</span>
                  {revealed && <span className="en">{en}</span>}
                </>
              ) : (
                <>
                  <span className="en">{en}</span>
                  {revealed && <span className="de">{de}</span>}
                </>
              )}
            </button>
          );
        })}
      </div>
      {hint && <div className="notthat">{hint}</div>}
    </>
  );
}
