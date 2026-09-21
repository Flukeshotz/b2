import { useState } from "react";
import { shuffle, findTaughtWord } from "../../lib/curriculum";
import { speak } from "../../lib/audio";
import { HardBadge } from "../MistakeBadge";

export default function Build({ step, ctx }) {
  const target = step.de;
  const sep = step.fuse ? "" : " ";
  const [bank] = useState(() => shuffle(target.concat(step.extra || []).filter((v, i, a) => a.indexOf(v) === i)));
  const [picked, setPicked] = useState([]); // [{w, bankIdx}]
  const [used, setUsed] = useState(new Set());

  const submit = (finalPicked) => {
    const said = finalPicked.map(p => p.w).join(sep);
    const ok = said.toLowerCase().replace(/[.,]/g, "") === target.join(sep).toLowerCase().replace(/[.,]/g, "");
    if (ok) speak(target.join(sep));
    else {
      // wrong build/translate answers resurface via the review queue, same as pick/listen
      target.forEach(tok => {
        const clean = tok.replace(/[.,!?]+$/, "");
        const hit = findTaughtWord(clean, ctx.topics);
        if (hit) ctx.onPushReview(hit[0], hit[1], hit[2]);
      });
    }
    const hardPayoff = step.hard && ok ? " That one was marked hard, and you just did it without blinking." : "";
    ctx.commit(ok, ok ? `<b>${target.join(sep)}</b>. ${step.en}${hardPayoff}` : `It's <b>${target.join(sep)}</b>.`);
  };

  const pickTile = (w, i) => {
    if (ctx.answered) return;
    const next = [...picked, { w, i }];
    setUsed(prev => new Set(prev).add(i));
    setPicked(next);
    if (!step.fuse) speak(w);
    if (next.length === target.length) submit(next);
  };

  const removeTile = (idx) => {
    const p = picked[idx];
    setPicked(picked.filter((_, i) => i !== idx));
    setUsed(prev => { const n = new Set(prev); n.delete(p.i); return n; });
  };

  return (
    <>
      {step.hard && <HardBadge />}
      <div className="eyebrow">{step.fuse ? "Build the word" : "Build the sentence"}</div>
      <div className="prompt" style={{ fontSize: 19 }}>{step.en}</div>
      <div className={`slots ${step.fuse ? "fuse" : ""}`}>
        {picked.map((p, i) => <button key={i} className="word placed" onClick={() => removeTile(i)}>{p.w}</button>)}
      </div>
      <div className="bank">
        {bank.map((w, i) => (
          <button key={i} className={`word ${used.has(i) ? "used" : ""}`} onClick={() => pickTile(w, i)}>{w}</button>
        ))}
      </div>
    </>
  );
}
