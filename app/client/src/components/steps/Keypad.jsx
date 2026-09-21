import { useState } from "react";
import { shuffle } from "../../lib/curriculum";
import { speak } from "../../lib/audio";

// Riya's "Digit Dial" — the same words as a normal build step, but tapped out
// on a phone-keypad layout instead of a flat word bank. The shape her thumb
// already knows from dialing anyone, ever.
export default function Keypad({ step, ctx }) {
  const target = step.target; // array of teaches-indices, in order
  const [picked, setPicked] = useState([]); // indices into target order
  const word = (i) => ctx.teaches[i];
  const [keys] = useState(() => shuffle(step.keys.slice())); // shuffled once so the layout doesn't just mirror the answer order

  const submit = (final) => {
    const said = final.map(i => word(i)[0]).join(" ");
    const wanted = target.map(i => word(i)[0]).join(" ");
    const ok = said.toLowerCase() === wanted.toLowerCase();
    if (ok) speak(wanted);
    ctx.commit(ok, ok ? `<b>${wanted}</b>. Dialed correctly.` : `It's <b>${wanted}</b>.`);
  };

  const tapKey = (i) => {
    if (ctx.answered) return;
    const next = [...picked, i];
    setPicked(next);
    speak(word(i)[0]);
    if (next.length === target.length) submit(next);
  };

  const clear = () => { if (!ctx.answered) setPicked([]); };

  return (
    <>
      <div className="eyebrow">Digit Dial</div>
      <div className="prompt" style={{ fontSize: 19 }}>{step.en}</div>
      <div className="dialscreen">
        {picked.length === 0
          ? <span className="dial-placeholder">tap the keypad</span>
          : picked.map((i, idx) => <span key={idx} className="dial-digit">{word(i)[0]}</span>)}
      </div>
      <div className="keypad">
        {keys.map((i, idx) => (
          <button key={idx} className="key" onClick={() => tapKey(i)} disabled={ctx.answered}>
            {word(i)[0]}
          </button>
        ))}
      </div>
      {picked.length > 0 && !ctx.answered && (
        <button className="footskip" style={{ marginTop: 10 }} onClick={clear}>Clear</button>
      )}
    </>
  );
}
