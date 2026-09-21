import { useEffect, useState } from "react";
import { b2 } from "../../lib/b2api";
import { Thread } from "./SourceText";

/* READING TASKS — five modes, one component.
   ═══════════════════════════════════════════════════════════════════════
   Deliberately NOT SourceQ with a different label. SourceQ asks what a text
   said; every mode here asks something the text does not say in so many words:

     attribute    which of these four people holds this position
     stance       is this sentence a claim or is it evidence
     relation     how does this sentence stand to the one before it
     implication  what follows that nobody wrote down
     intention    why the writer put that sentence there
     meaning      what the sentence actually claims happened — the noticing
                  question the grammar experiences open with

   TWO THINGS MAKE IT B2 RATHER THAN A QUIZ.

   First, the text never goes away. Every task carries a drawer holding the
   whole thread, and for `stance` and `relation` the sentence in question is
   highlighted inside it. A reading task that hides the text is a memory test,
   and memory is not the capability.

   Second, `attribute` options are PEOPLE, not sentences. The learner has to
   have built a map of who thinks what — which is the work `compare` names, and
   which no amount of scanning for keywords will do for them.

   Wrong answers cost the first-try credit, never the item: the standing retry
   rule. The explanation shows either way, and it says why the near-miss option
   was tempting, because that is where the reading actually goes wrong.
*/

const MODE = {
  attribute:   { label: "Wer sagt was?",        hint: "Vier Leute, vier Positionen." },
  stance:      { label: "Behauptung oder Beleg?", hint: "Klingt überzeugend ist nicht dasselbe wie belegt." },
  relation:    { label: "Wie hängt das zusammen?", hint: "Stützt, schränkt ein, widerspricht — oder wiederholt nur?" },
  implication: { label: "Was folgt daraus?",    hint: "Das steht so nicht da." },
  intention:   { label: "Warum steht das da?",  hint: "Nicht was sie sagt — warum sie es sagt." },
  /* Used by the grammar experiences: what does this sentence actually claim
     happened? It is the noticing question that has to be answerable by
     somebody who has never heard the word "Konjunktiv". */
  meaning:     { label: "Was steht da wirklich?", hint: "Nicht die Form — die Behauptung." },
};

export default function ReadTask({ step, ctx }) {
  const [src, setSrc] = useState(null);
  const [wrong, setWrong] = useState(new Set());
  const [chosen, setChosen] = useState(null);
  const [open, setOpen] = useState(false);
  const m = MODE[step.mode] || { label: "Frage", hint: "" };

  useEffect(() => { b2.getSource(step.sourceId).then(setSrc).catch(() => setSrc(null)); },
    [step.sourceId]);

  /* Attribution answers with a poster handle. The display names come from the
     text itself rather than being retyped into the item, so renaming a poster
     can never leave an option pointing at somebody who is not in the thread. */
  const nameOf = (handle) =>
    src?.script?.find(p => p.handle === handle)?.speaker || handle;

  const label = (o) => (step.mode === "attribute" ? nameOf(o) : o);

  const tap = (i) => {
    if (ctx.answered || chosen !== null) return;
    if (i !== step.answer) { setWrong(prev => new Set(prev).add(i)); ctx.miss(); return; }
    setChosen(i);
    ctx.commit(true, step.explain);
  };

  return (
    <div className="rdq">
      <div className="eyebrow">{m.label}</div>

      {/* For stance and relation the sentence is the item, so it is shown as
          the item — not buried in the question. */}
      {step.quote && <blockquote className="rdq-quote">„{step.quote}“</blockquote>}

      <p className="rdq-q">{step.q}</p>
      {m.hint && chosen === null && <p className="rdq-hint">{m.hint}</p>}

      <div className={"rdq-opts" + (step.mode === "attribute" ? " people" : "")}>
        {step.options.map((o, i) => (
          <button key={i}
            className={"rdq-opt" + (wrong.has(i) ? " wrongish" : "") + (chosen === i ? " right" : "")}
            style={wrong.has(i) ? { pointerEvents: "none" } : undefined}
            onClick={() => tap(i)}>
            {step.mode !== "attribute" && <span className="ltr">{"ABCD"[i]}</span>}
            <span>{label(o)}</span>
          </button>
        ))}
      </div>

      {/* The text, one tap away, always. */}
      <button className="rdq-open" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        {open ? "Text schließen" : "Text ansehen"}
      </button>
      {open && src?.script && (
        <div className="rdq-drawer">
          <Thread script={src.script} highlight={step.quote || null} />
        </div>
      )}
    </div>
  );
}
