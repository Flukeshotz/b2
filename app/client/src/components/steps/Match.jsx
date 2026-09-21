import { useEffect, useState } from "react";
import { shuffle } from "../../lib/curriculum";
import { speak, blip } from "../../lib/audio";

const MAX_PAIRS = 3; // more than 3 pairs on screen at once is too much to visually track

export default function Match({ step, ctx }) {
  const [ws] = useState(() => shuffle(step.ws.slice()).slice(0, MAX_PAIRS));
  const [left] = useState(() => shuffle(ws.slice()));
  // Independent shuffles of the same short list have a real chance of
  // landing in the same relative order (50% with just 2 pairs, the most
  // common case here) -- which lets a learner match by row position
  // instead of by meaning. Force a different arrangement whenever that
  // happens, rather than leaving it to a second coin flip.
  const [right] = useState(() => {
    let r = shuffle(ws.slice());
    if (ws.length > 1 && r.every((w, i) => w === left[i])) {
      [r[0], r[1]] = [r[1], r[0]];
    }
    return r;
  });
  const [gone, setGone] = useState(new Set());
  const [miss, setMiss] = useState(new Set());
  const [pickDe, setPickDe] = useState(null);
  const word = (i) => ctx.teaches[i];

  useEffect(() => { ctx.setMainBtn({ label: "Check", disabled: true }); }, []); // eslint-disable-line
  useEffect(() => {
    if (gone.size === ws.length) ctx.setMainBtn({ label: "Continue", disabled: false });
    // eslint-disable-next-line
  }, [gone]);

  const tapDe = (i) => { setPickDe(i); speak(word(i)[0]); };
  const tapEn = (i) => {
    if (pickDe === null) return;
    if (pickDe === i) {
      setGone(prev => new Set(prev).add(i));
      blip(true);
    } else {
      setMiss(new Set([pickDe, i]));
      blip(false);
      setTimeout(() => setMiss(new Set()), 450);
    }
    setPickDe(null);
  };

  const visual = step.visual; // picture <-> German word, instead of German <-> English

  return (
    <>
      <div className="eyebrow">Match them up</div>
      <div className="prompt" style={{ fontSize: 19 }}>
        {visual ? "Tap a picture, then its word." : "Tap a German word, then its meaning."}
      </div>
      <div className="matchgrid">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {left.map(i => (
            <button key={i} className={`mcell ${visual ? "pic" : "de"} ${pickDe === i ? "sel" : ""} ${gone.has(i) ? "gone" : ""} ${miss.has(i) ? "miss" : ""}`}
              disabled={gone.has(i)} onClick={() => tapDe(i)}>{visual ? word(i)[2] : word(i)[0]}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {right.map(i => (
            <button key={i} className={`mcell ${visual ? "de" : ""} ${gone.has(i) ? "gone" : ""} ${miss.has(i) ? "miss" : ""}`}
              disabled={gone.has(i)} onClick={() => tapEn(i)}>{visual ? word(i)[0] : word(i)[1]}</button>
          ))}
        </div>
      </div>
    </>
  );
}
