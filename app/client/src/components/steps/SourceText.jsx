import { useEffect, useState } from "react";
import { b2 } from "../../lib/b2api";

/* THE READING PANE — a text source presented as what it actually is.
   ═══════════════════════════════════════════════════════════════════════
   A forum thread is not a paragraph. Rendering it as running prose would
   destroy the one thing the learner has to do with it: keep four people's
   positions apart. So the posts stay separate, each with its author and the
   time it was written, and consecutive posts by the same person are visibly
   the same person — because noticing that Kerstin_M comes back at the end and
   says something different is the whole source.

   No timer, no "you have read this" gate. An adult reading a forum thread
   scrolls back. The Weiter button is enabled from the start.
*/

export default function SourceText({ step, ctx }) {
  const [src, setSrc] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    b2.getSource(step.sourceId)
      .then(setSrc)
      .catch(() => setErr("Der Text konnte nicht geladen werden."));
  }, [step.sourceId]);

  /* No commit(). Reading is not scored, and Lesson lists read_source under
     NOCHECK so the footer simply advances — a text the learner has finished
     does not get told it was "Correct." */
  useEffect(() => { ctx.setMainBtn({ label: "Continue", disabled: false }); }, []); // eslint-disable-line

  if (err) return <p className="b2-msg">{err}</p>;
  if (!src) return <div className="b2-skel" />;

  return (
    <div className="rd">
      <div className="eyebrow">Forum · Arbeit &amp; Beruf</div>
      <h2 className="rd-title">{src.title}</h2>
      <Thread script={src.script} />
    </div>
  );
}

/* Exported because every reading task reuses it inside the "Text ansehen"
   drawer. One renderer, so the thread the learner answers about is byte for
   byte the thread they read. */
/* Speaker identity. Forum posts carry a stable `handle`; an audio transcript
   has only the speaker's name. Keying on `handle` alone made every turn of an
   audio source "the same speaker" (undefined === undefined) and collapsed the
   rules between them. */
const who = (p) => (p ? (p.handle || p.speaker) : null);

export function Thread({ script, highlight = null }) {
  return (
    <ol className="rd-thread">
      {script.map((p, i) => (
        <li key={i} className={"rd-post" + (who(script[i - 1]) === who(p) ? " same" : "")}>
          <div className="rd-meta">
            <span className="rd-who">{p.speaker}</span>
            {p.when && <span className="rd-when">{p.when}</span>}
          </div>
          <p className="rd-body">{mark(p.de, highlight)}</p>
        </li>
      ))}
    </ol>
  );
}

/* Marks the sentence a task is about, so the learner is answering about a
   sentence they can see rather than one they have to find. Substring match on
   the authored quote — the gate has already proved it occurs. */
function mark(text, quote) {
  if (!quote) return text;
  const at = text.indexOf(quote);
  if (at < 0) return text;
  return (<>
    {text.slice(0, at)}
    <mark className="rd-mark">{quote}</mark>
    {text.slice(at + quote.length)}
  </>);
}
