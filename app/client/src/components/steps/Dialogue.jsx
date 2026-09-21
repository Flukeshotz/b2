import { useState } from "react";
import { shuffle } from "../../lib/curriculum";
import { speak, blip } from "../../lib/audio";

// Two people talking, mostly passive — she reads/hears real back-and-forth
// instead of picking a line on every single turn, with exactly one
// interactive checkpoint per screen. Three flavors of that checkpoint:
// fillblank (tap the word that completes a line), audiochoice (audio plays,
// pick the word you heard), truefalse (judge a statement about what was
// actually said — real comprehension, not just word-matching).
export default function Dialogue({ step, ctx }) {
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState(null);
  const [wrong, setWrong] = useState(new Set());

  const mode = step.mode;
  const idx = step.interactiveIndex ?? step.lines.length - 1;
  const target = step.lines[idx];
  const [opts] = useState(() => target.options ? shuffle(target.options.slice()) : []);
  // Two-speaker layout: whoever talks first sits on the left, the other
  // speaker sits on the right, for the rest of the thread — same visual
  // language as any real messaging app, so it reads as two sides of a
  // conversation instead of one column of identical bubbles.
  const firstSpeaker = step.lines[0].who;

  const finish = (ok, answer) => {
    setAnswered(true);
    blip(ok);
    const filledDe = target.blankWord && answer ? target.de.replace(target.blankWord, answer) : target.de;
    if (ok) speak(filledDe);
    ctx.commit(ok, ok
      ? (mode === "truefalse" ? `Right. ${target.en}.` : `<b>${filledDe}</b>. ${target.en}.`)
      : `It's <b>${filledDe}</b>.`);
  };

  const tapOption = (opt) => {
    if (answered) return;
    if (opt !== target.correct) {
      setWrong(prev => new Set(prev).add(opt));
      blip(false);
      ctx.miss();
      return;
    }
    setPicked(opt);
    finish(true, opt);
  };

  const tapTrueFalse = (val) => {
    if (answered) return;
    if (val !== step.statementTrue) { blip(false); ctx.miss(); }
    finish(val === step.statementTrue);
  };

  return (
    <>
      {step.title && <div className="eyebrow">{step.title}</div>}
      {step.setup && <div className="dialogue-setup">🔊 {step.setup}</div>}
      <div className="dialogue-thread">
        {step.lines.map((l, i) => {
          const isTarget = i === idx;
          const hideText = isTarget && mode === "audiochoice" && !answered;
          const showBlank = isTarget && mode === "fillblank" && !picked;
          const side = l.who === firstSpeaker ? "left" : "right";
          return (
            <div key={i} className={`dialogue-turn ${side}`}>
              <button className="dialogue-avatar" onClick={() => speak(l.de)} aria-label={`Play ${l.who}`}>{l.avatar}</button>
              <button className="dialogue-bubble" onClick={() => speak(l.de)}>
                <span className="ico">🔊</span>
                {hideText ? (
                  <span className="dialogue-hidden">tap the word you hear</span>
                ) : showBlank ? (
                  <span className="dialogue-text">{l.de.replace(l.blankWord, "___")}</span>
                ) : (
                  <span className="dialogue-text">{isTarget && mode !== "truefalse" ? l.de.replace(l.blankWord || "", picked || l.blankWord || "") : l.de}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {(mode === "fillblank" || mode === "audiochoice") && (
        <>
          <div className="grid2" style={{ marginTop: 14 }}>
            {opts.map(opt => {
              const isWrong = wrong.has(opt);
              const isSel = picked === opt;
              return (
                <button key={opt} className={`tile dialogue-opt ${isWrong ? "wrongish" : ""} ${isSel ? "sel right" : ""}`}
                  style={isWrong ? { pointerEvents: "none" } : undefined}
                  onClick={() => tapOption(opt)}>
                  <span className="de">{opt}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {mode === "truefalse" && (
        <>
          <div className="dialogue-statement">{step.statement}</div>
          <div className="row" style={{ gap: 12, marginTop: 12 }}>
            <button className="btn ghost" style={{ flex: 1 }} disabled={answered} onClick={() => tapTrueFalse(true)}>✓ True</button>
            <button className="btn ghost" style={{ flex: 1 }} disabled={answered} onClick={() => tapTrueFalse(false)}>✗ False</button>
          </div>
        </>
      )}
    </>
  );
}
