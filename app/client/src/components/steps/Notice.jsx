import { useEffect, useState } from "react";
import { b2 } from "../../lib/b2api";
import { Thread } from "./SourceText";

/* NOTICE — an expression in the sentence somebody actually wrote it in.
   ═══════════════════════════════════════════════════════════════════════
   Deliberately NOT Chunk.jsx, which leads with the German in 24px and its
   English underneath. That is a dictionary entry with better typography, and a
   B2 learner can already look up „begründen“.

   What they cannot look up is what the expression DOES: that
   „Begründet wird das mit …“ puts the justification at arm's length, and that
   „ich begründe das mit …“ — same words, same meaning in a dictionary — makes
   it your own. So the card leads with the function, and it carries the
   plausible misreading next to it, because that is where the learner is
   actually going to go wrong.

   The post it came from is shown in full with the expression marked. An
   expression stripped out of its sentence is a word list again. */

export default function Notice({ step, ctx }) {
  const [x, setX] = useState(null);
  const [src, setSrc] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    Promise.all([b2.getExpression(step.ex), b2.getSource(step.sourceId)])
      .then(([a, b]) => { setX(a); setSrc(b); })
      .catch(() => setErr(true));
  }, [step.ex, step.sourceId]);

  useEffect(() => { ctx.setMainBtn({ label: "Continue", disabled: false }); }, []); // eslint-disable-line

  if (err) return <p className="b2-msg">Der Ausdruck konnte nicht geladen werden.</p>;
  if (!x) return <div className="b2-skel" />;

  /* Only the post it occurs in — the whole thread here would bury the point. */
  const post = src?.script?.find(p => p.de.includes(x.occurrence));

  return (
    <div className="nt">
      <div className="eyebrow">Ein Zug, kein Wort</div>
      <p className="nt-cite">„{x.citation}“</p>

      <div className="nt-does">
        <div className="eyebrow">Was der Satz tut</div>
        <p>{x.does}</p>
      </div>

      {x.notThis && (
        <div className="nt-not">
          <div className="eyebrow">Was er nicht heißt</div>
          <p>{x.notThis}</p>
        </div>
      )}

      {post && (
        <div className="nt-src">
          <div className="eyebrow">So stand es da</div>
          <Thread script={[post]} highlight={x.occurrence} />
        </div>
      )}

      {/* The English is available and small, because sometimes a learner just
          needs it — but it is not what the card is about. */}
      <p className="nt-gloss">{x.gloss}</p>
    </div>
  );
}
