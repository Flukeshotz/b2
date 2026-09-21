import { useEffect, useState } from "react";
import { shuffle, findTaughtWord } from "../../lib/curriculum";
import { speak, narrate } from "../../lib/audio";
import { MayaSays } from "../Maya";
import MistakeBadge, { HardBadge } from "../MistakeBadge";

export default function Translate({ step, ctx }) {
  const target = step.en;
  const [bank] = useState(() => shuffle(target.concat(step.extra || []).filter((v, i, a) => a.indexOf(v) === i)));
  const [picked, setPicked] = useState([]);
  const [used, setUsed] = useState(new Set());
  const [playing, setPlaying] = useState(false);

  const play = () => { setPlaying(true); speak(step.de); setTimeout(() => setPlaying(false), 1400); };
  useEffect(() => {
    play();
    ctx.setFootSkip({ label: "Can't listen right now", onSkip: () => { ctx.onCooldown("listen"); ctx.advance(); } });
    // eslint-disable-next-line
  }, [step]);

  const submit = (finalPicked) => {
    const said = finalPicked.map(p => p.w.toLowerCase()).join(" ");
    const ok = said === target.join(" ").toLowerCase();
    if (!ok) {
      const clean = step.de.replace(/[.,!?]+$/, "");
      clean.split(" ").forEach(tok => {
        const hit = findTaughtWord(tok.replace(/[.,!?]+$/, ""), ctx.topics);
        if (hit) ctx.onPushReview(hit[0], hit[1], hit[2]);
      });
    }
    ctx.commit(ok, ok ? `<b>${step.de}</b>. ${target.join(" ")}` : `It's <b>${target.join(" ")}</b>.`);
  };

  const pickTile = (w, i) => {
    if (ctx.answered) return;
    const next = [...picked, { w, i }];
    setUsed(prev => new Set(prev).add(i));
    setPicked(next);
    narrate(w);
    if (next.length === target.length) submit(next);
  };

  const removeTile = (idx) => {
    const p = picked[idx];
    setPicked(picked.filter((_, i) => i !== idx));
    setUsed(prev => { const n = new Set(prev); n.delete(p.i); return n; });
  };

  return (
    <>
      {step.reviewWord ? <MistakeBadge /> : (step.hard && <HardBadge />)}
      <div className="eyebrow">Translate this sentence</div>
      <MayaSays text={step.de} mood="curious" />
      <button className={`speaker ${playing ? "playing" : ""}`} style={{ margin: "10px auto 0" }} onClick={play}>
        <span className="ico">🔊</span>
        <div className="wave"><i /><i /><i /><i /><i /></div>
        <small>Tap to hear it again</small>
      </button>
      <div className="slots">
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
