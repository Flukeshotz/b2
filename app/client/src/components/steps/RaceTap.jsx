import { useState } from "react";
import { shuffle } from "../../lib/curriculum";
import { speak, blip } from "../../lib/audio";

// Riya's "Beat Maya" — she counts out loud at a gentle pace; you race to tap
// the next number in the sequence. No timer, no penalty for missing — just
// the small thrill of getting there first.
export default function RaceTap({ step, ctx }) {
  const order = step.from; // teaches-indices, correct ascending order
  const [grid] = useState(() => shuffle(order.slice()));
  const [done, setDone] = useState([]);
  const [wrong, setWrong] = useState(null);
  const word = (i) => ctx.teaches[i];
  const next = order[done.length];

  const tap = (i) => {
    if (ctx.answered || done.includes(i)) return;
    if (i !== next) {
      blip(false);
      ctx.miss();
      setWrong(i);
      setTimeout(() => setWrong(null), 350);
      return;
    }
    blip(true);
    speak(word(i)[0]);
    const nd = [...done, i];
    setDone(nd);
    if (nd.length === order.length) {
      ctx.commit(true, `<b>${order.map(x => word(x)[0]).join(", ")}</b>. Beat her every time.`);
    }
  };

  return (
    <>
      <div className="eyebrow">Beat Maya</div>
      <div className="prompt" style={{ fontSize: 19 }}>{step.en}</div>
      <div className="racecue">
        {done.length < order.length ? <>Maya's turn: <b>{word(next)[0]}</b> is next. Tap it first.</> : "You beat her to every one."}
      </div>
      <div className="grid2 racegrid">
        {grid.map(i => {
          const isDone = done.includes(i);
          const isWrong = wrong === i;
          return (
            <button key={i} className={`tile ${isDone ? "sel right" : ""} ${isWrong ? "wrongish" : ""}`}
              disabled={isDone} onClick={() => tap(i)}>
              <span className="de">{word(i)[0]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
