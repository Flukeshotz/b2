import { MayaSays } from "../components/Maya";

// The gap this closes: finishing Learn or Learn More used to just dump you
// back on the path with no explanation — it read as the whole thing ending,
// not as "one part down." This is the missing beat in between: what you just
// learned, how you did, and a single clear next step. Kept deliberately
// plain — one short line from Maya, not a data dump.
export default function PartComplete({ topic, sub, upNext, accuracy, bestCombo, doneCount, total, newWords, onContinue }) {
  const perfLine = accuracy === 100
    ? "No mistakes. Every tap was the right one."
    : bestCombo >= 2
      ? `${bestCombo + 1} right in a row at your best.`
      : "You got there. That's what counts.";

  return (
    <section className="screen on" id="partcomplete">
      <div className="eyebrow">{sub.label} done</div>
      <div className="partring">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`partdot ${i < doneCount ? "on" : ""}`} />
        ))}
      </div>
      <div className="capline">{doneCount} of {total} parts done</div>
      <div className="capsub">{perfLine}</div>

      {newWords.length > 0 && (
        <div className="newwords">
          {newWords.map(([de, en, icon]) => (
            <div key={de} className="newword-chip"><span>{icon}</span>{de}</div>
          ))}
        </div>
      )}

      <MayaSays text="Nice. Ready for the next part?" mood="cheer" />

      <div className="sp" />
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 9 }}>
        <button className="btn" onClick={onContinue}>Continue{upNext ? ` to ${upNext.label}` : ""}</button>
      </div>
    </section>
  );
}
