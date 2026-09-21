import { useEffect, useRef, useState } from "react";
import { b2 } from "../../lib/b2api";

/* THE WRITING LOOP — write, one weakness, practise, rewrite, compare.
   ═══════════════════════════════════════════════════════════════════════
   The whole product argument for this screen is that assessment on its own is
   a score screen, and a score screen teaches nobody anything. What is worth an
   evening is: you wrote something real, you were told ONE thing, you went and
   worked on it, you rewrote your own text, and you can see the difference.

   Five deliberate refusals:

   — NO RUBRIC BESIDE THE WRITING BOX. A learner writing with the marking
     criteria open writes for the criteria. They get the task, the points and
     the length; that is what a real exam gives them.
   — NO MODEL ANSWER, and no model phrases before submission. Handing over
     "Nur folgt daraus doch nicht" here would let them satisfy the assessment
     without meaning any of it.
   — NO LIST OF FINDINGS. One weakness, in their own sentence. The other eight
     exist and stay on the review surface where a teacher can see them.
   — NO PERCENTAGE, no band, no confetti. The feedback is a sentence.
   — NOTHING IS LOST. The draft is saved as they type, so closing the tab
     mid-paragraph costs nothing. Losing somebody's writing is the one failure
     this product could not come back from.
*/

/* Does the prompt already spell the required points out as a numbered list?
   Both boards write them that way ("1." … "4." on their own lines), so an
   enumeration in the prompt is the signal — matching the stored `label_de`
   against the prompt text would not work, because the labels are summaries
   ("Ihre eigene Position") and the prompt is the full instruction. */
function promptListsPoints(prompt = "") {
  return /(^|\n)\s*1[.)]\s/.test(prompt);
}

const stages = { write: 0, verdict: 1, rewrite: 2, compare: 3 };

export default function Write({ step, ctx }) {
  const [task, setTask] = useState(null);
  const [text, setText] = useState("");
  const [stage, setStage] = useState("write");
  const [result, setResult] = useState(null);      // first assessment
  const [compare, setCompare] = useState(null);    // rewrite assessment
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);
  const started = useRef(Date.now());
  const pastes = useRef(0);
  const original = useRef("");

  /* Going off to practise unmounts this component, so the verdict and the text
     she submitted have to survive the round trip — otherwise "practise this"
     costs her the whole task and she can never reach the rewrite. Kept in
     sessionStorage per task, cleared once the comparison has been shown. */
  const resumeKey = `b2_write:${step.taskId}`;

  useEffect(() => {
    let saved = null;
    try {
      const raw = sessionStorage.getItem(resumeKey);
      if (raw) saved = JSON.parse(raw);
    } catch { /* ignore */ }

    b2.getWrite(step.taskId)
      .then(t => {
        setTask(t);
        if (saved?.result) {
          setResult(saved.result);
          original.current = saved.original || "";
          setText(saved.original || "");
          setStage("rewrite");
        } else if (t.draft) setText(t.draft);
      })
      .catch(() => setErr("Die Aufgabe konnte nicht geladen werden."));
  }, [step.taskId]); // eslint-disable-line

  const practise = (topicId) => {
    try {
      sessionStorage.setItem(resumeKey, JSON.stringify({ result, original: original.current }));
    } catch { /* ignore quota errors */ }
    window.dispatchEvent(new CustomEvent("b2:navigate", { detail: { topicId } }));
  };

  /* Save as they write. Debounced so it is one request a second at most, and
     deliberately fire-and-forget: a failed autosave must never interrupt
     somebody mid-sentence. */
  useEffect(() => {
    if (!task || stage !== "write" || !text.trim()) return;
    const t = setTimeout(() => { b2.saveDraft(task.taskId, text, null).catch(() => {}); }, 900);
    return () => clearTimeout(t);
  }, [text, task, stage]);

  useEffect(() => {
    ctx.setHideFooter(stage !== "compare");
    return () => ctx.setHideFooter(false);
  }, [stage]); // eslint-disable-line

  const words = (text.trim().match(/[\wäöüßÄÖÜ'-]+/g) || []).length;

  const submit = async (parentId = null) => {
    if (sending) return;
    setSending(true); setErr(null);
    try {
      const r = await b2.submitWrite(task.taskId, {
        text, parentId, experienceId: step.experienceId,
        composeMs: Date.now() - started.current, pasteEvents: pastes.current,
      });
      if (r.refused) { setErr(r.message); setSending(false); return; }
      if (parentId) {
        try { sessionStorage.removeItem(resumeKey); } catch { /* ignore */ }
        setCompare(r); setStage("compare");
        /* NOT ctx.commit(). commit() sets a verdict, and the shared footer
           renders a verdict as Maya plus "Correct." — the A1 reward chrome
           this level is meant to be free of, printed over a rewrite that was
           never a right-or-wrong answer. `write` is in Lesson.jsx's NOCHECK
           list, so the footer button simply advances and finishes the sub. */
        ctx.setMainBtn({ label: "Continue", disabled: false });
      }
      else { setResult(r); original.current = text; setStage("verdict"); }
    } catch { setErr("Das kam gerade nicht durch. Ihr Text ist gespeichert."); }
    setSending(false);
  };

  if (err && !task) return <p className="b2-msg">{err}</p>;
  if (!task) return <div className="b2-skel" />;

  /* ── 1. WRITE ─────────────────────────────────────────────────────── */
  if (stage === "write") return (
    <div className="wr">
      <div className="eyebrow">{task.taskLabel}</div>
      <p className="wr-prompt">{task.prompt}</p>
      {/* The exam prompt usually enumerates the required points itself —
          "Gehen Sie dabei auf folgende Punkte ein: 1. … 4." — and printing the
          stored labels underneath said the same thing twice, pushing the
          writing box below the fold on a phone for no information gained.
          Shown only when the prompt does NOT already list them. */}
      {task.points.length > 0 && !promptListsPoints(task.prompt) && (
        <ol className="wr-points">{task.points.map(p => <li key={p}>{p}</li>)}</ol>
      )}
      <textarea className="wr-box" rows={14} spellCheck="false" value={text}
        onPaste={() => { pastes.current += 1; }}
        onChange={e => setText(e.target.value)}
        placeholder="Ihr Beitrag…" disabled={sending} />
      <div className="wr-foot">
        <span className={"wr-count" + (words >= task.targetWords ? " ok" : "")}>
          {words} / {task.targetWords} Wörter
        </span>
        {task.draft && <span className="wr-saved">gespeichert</span>}
      </div>
      {err && <p className="wr-err">{err}</p>}
      <button className="b2-cta wr-send" onClick={() => submit(null)} disabled={!text.trim() || sending}>
        {sending ? "…" : "Abgeben"}
      </button>
    </div>
  );

  /* ── 2. ONE WEAKNESS ──────────────────────────────────────────────── */
  if (stage === "verdict") return (
    <Verdict r={result} ctx={ctx}
      onRewrite={() => { setText(original.current); setStage("rewrite"); }}
      onPractise={practise} />
  );

  /* ── 3. REWRITE — their own text, not a new essay ──────────────────── */
  if (stage === "rewrite") return (
    <div className="wr">
      <div className="eyebrow">Noch einmal</div>
      <p className="wr-lead">
        Ihr Text, so wie Sie ihn abgegeben haben. Ändern Sie, was Sie ändern wollen —
        vor allem das eine: <b>{result.weakness?.workingOn}</b>.
      </p>
      <textarea className="wr-box" rows={14} spellCheck="false" value={text}
        onPaste={() => { pastes.current += 1; }}
        onChange={e => setText(e.target.value)} disabled={sending} />
      <div className="wr-foot">
        <span className={"wr-count" + (words >= task.targetWords ? " ok" : "")}>
          {words} / {task.targetWords} Wörter
        </span>
      </div>
      {err && <p className="wr-err">{err}</p>}
      <button className="b2-cta wr-send" onClick={() => submit(result.submissionId)}
        disabled={!text.trim() || sending}>{sending ? "…" : "Neue Fassung abgeben"}</button>
    </div>
  );

  /* ── 4. COMPARE ───────────────────────────────────────────────────── */
  return <Compare r={compare} />;
}

/* One thing. Not ten. The strengths come first because a learner told only what
   is wrong stops writing — but they are one line, not a celebration. */
function Verdict({ r, ctx, onRewrite, onPractise }) {
  if (!r.weakness) return (
    <div className="wr">
      <div className="eyebrow">Ihr Text</div>
      {/* Two different "nothing to do"s, and the learner is told which. Nothing
          wrong is praise. Nothing we can teach is OUR limit, not theirs — and
          saying only that to somebody who just passed eight checks out of nine
          reads as a shrug at a good text, so the strengths lead either way. */}
      {r.strengths.length > 0 && (
        <p className="wr-good">Das trägt: {r.strengths.join(" · ")}.</p>
      )}
      <p className="wr-verdict">
        {r.none === "nothing_wrong"
          ? "Auf das, was diese Aufgabe prüft, ist nichts auszusetzen. Das ist selten."
          : "Der Text hält, was die Aufgabe verlangt. Was jetzt noch fehlt, dafür haben wir Ihnen im Moment nichts Sinnvolles anzubieten — das liegt an uns, nicht an Ihnen."}
      </p>
      <button className="b2-cta wr-send" onClick={() => ctx.commit(true, null)}>Continue</button>
    </div>
  );

  const w = r.weakness;
  return (
    <div className="wr">
      <div className="eyebrow">Ihr Text</div>
      {r.strengths.length > 0 && (
        <p className="wr-good">Das trägt schon: {r.strengths.join(" · ")}.</p>
      )}

      <div className="wr-one">
        <div className="eyebrow">Eine Sache</div>
        <p className="wr-work">{w.workingOn}</p>
        <p className="wr-detail">{w.detail}</p>
        {w.yourSentence && (
          <blockquote className="wr-quote">„{w.yourSentence}“</blockquote>
        )}
      </div>

      {/* The route is real content, named. A learner is never told to improve
          something Skillcase has no way to teach — the selector filtered those
          out before this screen existed.

          This was an <a href="#/b2/lesson/…"> and nothing in B2 listens for a
          hash change, so the one click the whole product turns on did nothing.
          It now parks the verdict and asks B2App to open the lesson; coming
          back restores this text at the rewrite step. */}
      {w.route?.topicId && (
        <button className="b2-cta wr-lesson" onClick={() => onPractise(w.route.topicId)}>
          Üben: {w.route.title}
        </button>
      )}
      <button className="wr-skip" onClick={onRewrite}>Direkt überarbeiten</button>
    </div>
  );
}

/* Before and after, and one line saying what moved. Not a diff editor: the
   learner has to be able to answer "what did I actually improve?", and coloured
   markup all over two paragraphs answers a different question. */
function Compare({ r }) {
  const c = r.comparison;
  if (!c) return (
    <div className="wr"><p className="wr-verdict">Neue Fassung gespeichert.</p></div>
  );
  return (
    <div className="wr">
      <div className="eyebrow">Vorher und nachher</div>
      <p className={"wr-moved" + (c.improved ? " ok" : "")}>
        {c.improved
          ? `Besser geworden: ${c.workingOn}.`
          : `${c.workingOn} — daran hat sich diesmal nichts geändert.`}
      </p>

      {/* WHAT changed, not just THAT it changed. The screen named the feature
          and then printed two whole texts, leaving the learner to diff 180
          words of her own German herself — which is the work this screen
          exists to have already done.

          Composed on the SERVER (capabilities.js owns every check → German
          mapping in this product, and a check id has no business reaching a
          component). Absent when the change has no countable unit. */}
      {c.changed && <p className="wr-changed">{c.changed}</p>}

      <div className="wr-ba">
        <div className="wr-side">
          <span className="wr-tag">Vorher</span>
          <p className="wr-txt">{c.before}</p>
        </div>
        <div className="wr-side after">
          <span className="wr-tag">Nachher</span>
          <p className="wr-txt">{c.after}</p>
        </div>
      </div>

      <p className="wr-detail">{c.stateAfter === "pass"
        ? "Das reicht jetzt für diese Aufgabe."
        : c.improved
          ? "Noch nicht ganz, aber die Richtung stimmt."
          : "Nehmen Sie sich die eine Stelle noch einmal vor."}</p>
    </div>
  );
}
