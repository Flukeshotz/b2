import { useEffect, useRef } from "react";
import StampSVG from "../components/StampSVG";
import { MayaSays } from "../components/Maya";
import { rewardLine } from "../lib/curriculum";
import { speak } from "../lib/audio";

function Confetti() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const frame = document.getElementById("frame");
    const ctx = c.getContext("2d");
    c.width = frame.clientWidth; c.height = frame.clientHeight;
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const cols = ["#D8402E", "#E8B33C", "#12203A", "#1F6F6B", "#FFFFFF"];
    const P = Array.from({ length: 90 }, () => ({
      x: c.width / 2 + (Math.random() - 0.5) * 120, y: c.height * 0.34,
      vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 13 - 4,
      r: Math.random() * 6 + 3, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3,
      col: cols[Math.floor(Math.random() * 5)], life: 0,
    }));
    let raf;
    (function tick() {
      ctx.clearRect(0, 0, c.width, c.height);
      let alive = false;
      for (const p of P) {
        p.vy += 0.42; p.x += p.vx; p.y += p.vy; p.a += p.va; p.life++;
        if (p.y < c.height + 30) {
          alive = true;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.col;
          ctx.globalAlpha = Math.max(0, 1 - p.life / 150);
          ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6); ctx.restore();
        }
      }
      if (alive) raf = requestAnimationFrame(tick); else ctx.clearRect(0, 0, c.width, c.height);
    })();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas id="confetti" ref={ref} />;
}

export default function Reward({ topic, stats, totalStamps, onNext, onPassport, onHome }) {
  const { accuracy, bestCombo, secs, nextTopic } = stats;
  useEffect(() => { const t = setTimeout(() => speak(topic.proof), 700); return () => clearTimeout(t); }, [topic]);

  // Council revision (2026-08-11): the old version stacked a stamp, two
  // lines of copy, three stat cards (stamps/combo/accuracy%), Maya's line,
  // a separate "next time" preview card, then three buttons -- eight
  // distinct things before one action. Accuracy/combo read as a report
  // card at the exact moment the screen should feel like a celebration
  // (Anjali), and three stacked buttons meant no single clear next step
  // (Fatima). Stats aren't relocated to Passport -- they're momentary
  // performance detail, not identity-building data like "words you own,"
  // and don't need a permanent home at all. What's kept: the stamp, the
  // capability + proof sentence (Grace: this is the real motivating
  // payoff, not filler), Maya's line right after with nothing between,
  // one primary button with the next lesson folded directly into its own
  // label (Petra's anticipation point, without a separate card), and the
  // other two options demoted to small text links.
  return (
    <section className="screen on" id="reward">
      <Confetti />
      <div className="eyebrow">Stamp earned</div>
      <div className="stampwrap"><StampSVG topic={topic} /></div>
      <div className="capline">{topic.capability}</div>
      <div className="capsub">Walk into any café in Berlin and say <b>"{topic.proof}"</b>.</div>
      <MayaSays text={rewardLine(accuracy, bestCombo, secs)} mood="cheer" />
      <div className="sp" />
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="rewardlinks">
          <button className="skiplink" onClick={onPassport}>See my passport</button>
          <span className="rewardlinks-dot">·</span>
          <button className="skiplink" onClick={onHome}>Back to path</button>
        </div>
        <button className="btn" onClick={onNext}>
          {nextTopic ? `Next: ${nextTopic.icon} ${nextTopic.title}` : "Next lesson"}
        </button>
      </div>
    </section>
  );
}
