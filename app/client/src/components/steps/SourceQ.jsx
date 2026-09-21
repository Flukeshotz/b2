import { useState } from "react";

/* A comprehension question against a source she has just heard or read.
   Three options, Goethe's shape. The kind is shown because at B2 the TYPE of
   question is itself information — "Hauptaussage" tells her to think about the
   whole thing, "Detail" tells her one sentence decides it, and "Absicht" warns
   her that nobody says the answer out loud.

   Wrong answers are not fatal: she picks again. The explanation appears either
   way, because a key without a reason teaches nothing. */

const KIND = {
  main_idea: { label: "Hauptaussage", hint: "Worum geht es insgesamt?" },
  detail:    { label: "Detail", hint: "Eine Stelle im Text entscheidet." },
  inference: { label: "Zwischen den Zeilen", hint: "Das wird nicht direkt gesagt." },
  attitude:  { label: "Haltung", hint: "Wie steht die Person dazu?" },
};

export default function SourceQ({ step, ctx }) {
  const [wrong, setWrong] = useState(new Set());
  const [chosen, setChosen] = useState(null);
  const k = KIND[step.kind] || { label: "Frage", hint: "" };

  const tap = (i) => {
    if (ctx.answered || chosen !== null) return;
    if (i !== step.answer) {
      // Retry rather than hard-fail — the standing rule. She loses the
      // first-try credit, not the question.
      setWrong(prev => new Set(prev).add(i));
      ctx.miss();
      return;
    }
    setChosen(i);
    ctx.commit(true, step.explain);
  };

  return (
    <>
      <div className="eyebrow">{k.label}</div>
      <p className="srcq-q">{step.q}</p>
      {k.hint && !chosen && <p className="srcq-hint">{k.hint}</p>}
      <div className="srcq-opts">
        {step.options.map((o, i) => (
          <button key={i}
            className={"srcq-opt" + (wrong.has(i) ? " wrongish" : "") + (chosen === i ? " right" : "")}
            style={wrong.has(i) ? { pointerEvents: "none" } : undefined}
            onClick={() => tap(i)}>
            <span className="ltr">{"ABC"[i]}</span>
            <span>{o}</span>
          </button>
        ))}
      </div>
    </>
  );
}
