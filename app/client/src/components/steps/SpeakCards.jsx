import { useEffect, useRef, useState } from "react";
import { speak, blip } from "../../lib/audio";

const norm = (s) => s.toLowerCase().replace(/[.,!?]/g, "").replace(/\s+/g, " ").trim();

function getRecognizer() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = "de-DE";
  r.interimResults = false;
  r.maxAlternatives = 3;
  return r;
}

// True flashcard: one card on screen at a time, not a stack. A correct
// match flips straight to the next one. "Can't speak right now" exits the
// whole exercise in one tap, same as the plain Speak step, not a per-card
// skip that leaves her stuck cycling through more cards she also can't say.
export default function SpeakCards({ step, ctx }) {
  const cards = step.cards; // [{de, en}, ...]
  const [idx, setIdx] = useState(0);
  const [state, setState] = useState("idle"); // idle | listening | correct | retry
  const [supported] = useState(() => !!getRecognizer());
  const recRef = useRef(null);

  const card = cards[idx];

  useEffect(() => {
    setState("idle");
    speak(card.de);
    ctx.setFootSkip({ label: "Can't speak right now", onSkip: () => { ctx.onCooldown("speak"); ctx.advance(); } });
    // eslint-disable-next-line
  }, [idx]);

  const finishAll = () => {
    ctx.commit(true, `<b>${cards.map(c => c.de).join(" · ")}</b>. All three, out loud.`);
  };

  const goNext = () => {
    if (idx + 1 >= cards.length) { finishAll(); return; }
    setIdx(i => i + 1);
  };

  const onCorrect = () => {
    blip(true);
    setState("correct");
    setTimeout(goNext, 650);
  };

  const listen = () => {
    if (!supported || state === "listening") return;
    setState("listening");
    const r = getRecognizer();
    recRef.current = r;
    r.onresult = (e) => {
      const heard = Array.from(e.results[0]).map(a => norm(a.transcript));
      if (heard.some(h => h === norm(card.de) || h.includes(norm(card.de)))) {
        onCorrect();
      } else {
        blip(false);
        setState("retry");
      }
    };
    r.onerror = () => setState("retry");
    r.onend = () => { if (state === "listening") setState(s => s === "listening" ? "retry" : s); };
    r.start();
  };

  const manualSaid = () => onCorrect(); // no-speech-recognition fallback, same trust-her spirit as the old Speak step

  return (
    <div className="stepcenter">
      <div className="eyebrow">Say it — card {idx + 1} of {cards.length}</div>
      <div className="flashcard">
        <div className="flashcard-de">{card.de}</div>
        <div className="flashcard-en">{card.en}</div>
      </div>

      {supported ? (
        <button className={`mic ${state === "listening" ? "rec" : ""}`} aria-label="Tap to speak" onClick={listen}>
          {state === "correct" ? "✅" : "🎙️"}
        </button>
      ) : (
        <button className="btn" style={{ marginTop: 18 }} onClick={manualSaid}>I said it</button>
      )}

      {state === "retry" && <div className="notthat">Didn't catch that. Try again.</div>}
    </div>
  );
}
