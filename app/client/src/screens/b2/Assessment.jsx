import { useEffect, useRef, useState } from "react";
import { b2 } from "../../lib/b2api";
import { Bar, Well, Foot } from "./Shell";
import Icon from "./Icon";
import B2Cta from "./B2Cta";
import StateMessage from "../../ds/components/StateMessage";
import OptionRow from "../../ds/components/OptionRow";
import BlockProgressTrack from "../../ds/components/BlockProgressTrack";

/* THE ASSESSMENT RUNNER.
   ═══════════════════════════════════════════════════════════════════════════
   One question at a time, fifteen minutes, and a Skip on every single screen.

   SKIP IS A FIRST-CLASS BUTTON, not a hidden escape. The server records a
   skipped item as "not measured" — it never counts as wrong, never lowers a
   score and never creates a weakness — and the UI has to make that offer
   visible, or a learner who does not know an answer guesses, and a guess is
   recorded as real evidence about her German.

   THE SERVER OWNS THE STATE. Every answer is a PUT; nothing is batched in
   memory waiting for a submit. That is what makes a refresh survivable: the
   attempt is reloaded from the server and the learner lands exactly where she
   was, with her earlier answers intact. Starting twice resumes rather than
   duplicating, so a reload cannot fork her history into two sittings.

   NINE ITEM TYPES, ONE SCHEMA. core-2026a only ever produced MCQ and free-text,
   so `item.content` there is a bare `{ q|sentence, options }` shape with no
   `itemType` field at all. core-2026b's items carry `itemType` + a typed
   `payload` (see assessment_content.js:safeItem). The renderer below switches
   on that field's PRESENCE first — undefined means "legacy core-2026a", which
   keeps its original MCQ/free-text rendering untouched — and then on its VALUE
   for every new type. The client never decides what is correct; it only shapes
   the response into whatever `content.grade()` on the server expects to compare
   against `answer_payload` (see assessment_content.js:grade), and sends that.

   Deliberately NOT a redesign. Same Bar/Well/Foot, same scr-, srcq- and b2-
   prefixed classes the screening and legacy assessment already use, so this
   reads as the same product for every item type rather than nine different ones. */

export default function Assessment({ onExit, onDone }) {
  const [data, setData] = useState(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);   // MCQ index, or TRUE_FALSE boolean
  const [arr, setArr] = useState([]);           // MULTI_SELECT indices / ORDERING permutation / GAP_FILL values
  const [obj, setObj] = useState({});           // MATCHING: { leftIndex: rightIndex }
  const [text, setText] = useState("");         // SHORT_TEXT / LONG_TEXT / legacy free-text
  const [played, setPlayed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [exhausted, setExhausted] = useState(null);
  const audioRef = useRef(null);

  const load = () => {
    setError(null);
    /* THE SERVER PICKS THE VERSION. "Take a quick test" always means "the
       current production diagnostic" — core-2026b-v1, then v2, then v3 once
       she has sat the one before — never a hardcoded id and never core-2026a,
       which stays historical. If all three are used up, that IS exhaustion:
       falling back to the old core-2026a composer would mix a learner's
       history across two groups that `assessment_progress.comparable()`
       correctly refuses to compare, silently breaking her delta. */
    b2.getCurrentDiagnostic()
      .then(diag => {
        if (diag.exhausted) { setExhausted(true); return; }
        return b2.startAssessment(diag.version);
      })
      .then(a => {
        if (!a) return; // exhausted, handled above
        setData(a);
        /* RESUME AT THE FIRST UNANSWERED ITEM. Dropping her back at question one
           after a refresh would make her re-answer work the server already has,
           and re-answering is indistinguishable from changing her mind. */
        const next = a.items.findIndex(it => !it.answered);
        setI(next === -1 ? 0 : next);
      })
      .catch(async (e) => {
        /* 409 is content exhaustion — a real state, not a failure. She has
           worked through every assessment we have, and saying so is better than
           serving her the same questions again and calling it a new test. */
        try {
          const r = await b2.getCurrentAssessment();
          if (r?.attemptId) { setData(r); return; }
        } catch { /* fall through */ }
        if (/409/.test(String(e.message))) setExhausted(true);
        else setError("We couldn't start the assessment. Check your connection and try again.");
      });
  };
  useEffect(load, []);

  const item = data?.items?.[i];
  const c = item?.content || {};
  const itemType = c.itemType;               // undefined => legacy core-2026a item
  const p = c.payload || {};

  /* PER-ITEM DEFAULTS. An ORDERING item starts in its given (unsorted) order —
     the learner rearranges from there — and a GAP_FILL item starts with one
     empty string per blank so `arr[k]` is always defined to type into. Keyed on
     the item id, not just `i`, so this never re-fires mid-item from an unrelated
     re-render. */
  useEffect(() => {
    if (!item) return;
    setPicked(null); setObj({});
    if (itemType === "ORDERING") setArr((p.items || []).map((_, k) => k));
    else if (itemType === "GAP_FILL") setArr(new Array((p.text || "").split(/_{2,}/).length - 1).fill(""));
    else setArr([]);
    setText("");
    setPlayed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.itemId]);

  if (exhausted) {
    return (
      <div className="b2">
        <Bar onBack={onExit} section="Quick test" />
        <Well>
          <StateMessage state="empty"
            message="You've worked through every assessment we have. There's nothing new to test you on yet — more material is on the way." />
          <B2Cta onClick={onExit}>Back</B2Cta>
        </Well>
      </div>
    );
  }
  if (error) {
    return (
      <div className="b2">
        <Bar onBack={onExit} section="Quick test" />
        <Well><StateMessage state="error" message={error} /><B2Cta onClick={load}>Try again</B2Cta></Well>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="b2">
        <Bar onBack={onExit} section="Quick test" />
        <Well><div className="b2-skel" /><div className="b2-skel s" /><div className="b2-skel s" /></Well>
      </div>
    );
  }

  const ctx = data.context?.[item.skill] || {};
  const total = data.items.length;
  // Legacy items carry no scoringMode, so writing/speaking-by-skill is the only
  // signal available for them; db-backed items ask the server's own classification.
  const objective = itemType ? c.scoringMode === "OBJECTIVE" : !["writing", "speaking"].includes(item.skill);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const minWords = p.min_words ?? (item.skill === "writing" ? 60 : 0);

  const advance = () => {
    setPicked(null); setArr([]); setObj({}); setText(""); setPlayed(false);
    if (i + 1 < total) setI(i + 1);
    else finish();
  };

  const finish = async () => {
    setBusy(true);
    try { const r = await b2.finishAssessment(data.attemptId); onDone(r); }
    catch { setError("We couldn't submit that. Nothing has been lost — try again."); setBusy(false); }
  };

  /* THE RESPONSE SHAPE PER TYPE, matching what assessment_content.js:grade()
     compares against answer_payload on the server. Nothing here is scored on
     the client — this only packs the learner's input into the right shape. */
  const responseValue = () => {
    if (!itemType) return objective ? picked : text;              // legacy
    switch (itemType) {
      case "MCQ": return picked;
      case "TRUE_FALSE": return picked;
      case "MULTI_SELECT": return arr;
      case "MATCHING": return obj;
      case "ORDERING": return arr;
      case "GAP_FILL": return arr;
      case "SHORT_TEXT":
      case "LONG_TEXT": return text;
      default: return null;
    }
  };

  const canSubmit = (() => {
    if (!itemType) return objective ? picked !== null : words >= minWords;
    switch (itemType) {
      case "MCQ": return picked !== null;
      case "TRUE_FALSE": return picked !== null;
      case "MULTI_SELECT": return arr.length > 0;
      case "MATCHING": return (p.left || []).length > 0 && (p.left || []).every((_, k) => obj[k] !== undefined);
      case "ORDERING": return arr.length === (p.items || []).length && (p.items || []).length > 0;
      case "GAP_FILL": return arr.length > 0 && arr.every(v => v.trim().length > 0);
      case "SHORT_TEXT":
      case "LONG_TEXT": return words >= (minWords || 1);
      // Never recorded — the only honest path is Skip.
      case "SPOKEN_RESPONSE": return false;
      default: return false;
    }
  })();

  const answer = async () => {
    setBusy(true);
    try {
      await b2.answerAssessmentItem(data.attemptId, item.itemId, responseValue());
      setBusy(false); advance();
    } catch { setError("We couldn't save that answer. Try again."); setBusy(false); }
  };

  const skip = async () => {
    setBusy(true);
    try { await b2.skipAssessmentItem(data.attemptId, item.itemId); setBusy(false); advance(); }
    catch { setError("We couldn't save that. Try again."); setBusy(false); }
  };

  // UI chrome stays English throughout — same convention as Home. Only the
  // test content itself (passages, questions, options) is German.
  const LABEL = { grammar: "Grammar", vocabulary: "Vocabulary", reading: "Reading",
                  listening: "Listening", writing: "Writing", speaking: "Speaking" };
  // The first reading item carries the passage; the others do not repeat it.
  const firstOfSkill = data.items.findIndex(it => it.skill === item.skill) === i;

  const moveOrdering = (pos, dir) => setArr(a => {
    const n = [...a]; const j = pos + dir;
    if (j < 0 || j >= n.length) return a;
    [n[pos], n[j]] = [n[j], n[pos]];
    return n;
  });

  /* THE ANSWER AREA, by item type. Legacy (itemType undefined) falls through to
     its original MCQ/free-text rendering unchanged; every db-backed type gets
     its own control, but all of them share Skip/Next in the footer below. */
  const renderAnswer = () => {
    if (item.skill === "writing" && !itemType) {
      return (
        <>
          <p className="scr-prompt">{ctx.prompt}</p>
          {ctx.guidance && <ul className="produce-guide">{ctx.guidance.map(g => <li key={g}>{g}</li>)}</ul>}
          <textarea className="produce-box" rows={8} value={text} spellCheck="false"
            onChange={e => setText(e.target.value)} placeholder="Write your answer here…" />
          <span className={"produce-count" + (words >= minWords ? " ok" : "")}>
            {words} / {minWords} words
          </span>
        </>
      );
    }
    if (item.skill === "speaking" && !itemType) {
      return (
        <>
          <p className="scr-prompt">{ctx.prompt}</p>
          <StateMessage state="empty"
            message="This speaking task isn't recorded yet, and speaking is not part of your measured result. Skipping it costs you nothing." />
        </>
      );
    }
    if (!itemType) {
      return (
        <>
          {item.content?.context && <p className="scr-context">{item.content.context}</p>}
          <p className="scr-q">{item.content?.q || item.content?.sentence || ctx.instruction}</p>
          <div className="srcq-opts">
            {(item.content?.options || []).map((o, k) => (
              <OptionRow key={k} letter={"ABC"[k]} label={o}
                state={picked === k ? "selected" : "default"} onClick={() => setPicked(k)} />
            ))}
          </div>
        </>
      );
    }

    // db-backed core-2026b: stem is always the question/instruction.
    const stem = (
      <>
        {p.context && <p className="scr-context">{p.context}</p>}
        <p className="scr-q">{c.stem}</p>
      </>
    );

    switch (itemType) {
      case "MCQ":
        return (
          <>
            {stem}
            <div className="srcq-opts">
              {(c.options || []).map((o, k) => (
                <OptionRow key={k} letter={"ABC"[k]} label={o}
                  state={picked === k ? "selected" : "default"} onClick={() => setPicked(k)} />
              ))}
            </div>
          </>
        );

      case "TRUE_FALSE":
        return (
          <>
            {stem}
            <div className="srcq-opts">
              <OptionRow letter="R" label="Richtig" state={picked === true ? "selected" : "default"}
                onClick={() => setPicked(true)} />
              <OptionRow letter="F" label="Falsch" state={picked === false ? "selected" : "default"}
                onClick={() => setPicked(false)} />
            </div>
          </>
        );

      case "MULTI_SELECT":
        return (
          <>
            {stem}
            <p className="scr-context">Multiple answers possible.</p>
            <div className="srcq-opts">
              {(c.options || p.options || []).map((o, k) => (
                <OptionRow key={k} letter={arr.includes(k) ? "✓" : "ABCD"[k]} label={o}
                  state={arr.includes(k) ? "selected" : "default"}
                  onClick={() => setArr(a => a.includes(k) ? a.filter(x => x !== k) : [...a, k])} />
              ))}
            </div>
          </>
        );

      case "MATCHING":
        return (
          <>
            {stem}
            <div className="b2-list">
              {(p.left || []).map((l, k) => (
                <div key={k} className="b2-row match-row">
                  <span className="tx"><span className="t">{l}</span></span>
                  <select className="match-select" value={obj[k] ?? ""}
                    onChange={e => setObj(o => ({ ...o, [k]: Number(e.target.value) }))}>
                    <option value="" disabled>Choose…</option>
                    {(p.right || []).map((r, ri) => <option key={ri} value={ri}>{r}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </>
        );

      case "ORDERING":
        return (
          <>
            {stem}
            <div className="b2-list">
              {arr.map((idx, pos) => (
                <div key={idx} className="b2-row order-row">
                  <span className="tx"><span className="t">{(p.items || [])[idx]}</span></span>
                  <span className="order-buttons">
                    <button type="button" className="order-btn" disabled={pos === 0}
                      aria-label="Move up" onClick={() => moveOrdering(pos, -1)}>↑</button>
                    <button type="button" className="order-btn" disabled={pos === arr.length - 1}
                      aria-label="Move down" onClick={() => moveOrdering(pos, 1)}>↓</button>
                  </span>
                </div>
              ))}
            </div>
          </>
        );

      case "GAP_FILL": {
        const parts = (p.text || "").split(/_{2,}/);
        return (
          <>
            {stem}
            <p className="scr-q gapfill-text">
              {parts.map((part, k) => (
                <span key={k}>
                  {part}
                  {k < parts.length - 1 && (
                    <input className="gapfill-input" value={arr[k] ?? ""}
                      onChange={e => setArr(a => { const n = [...a]; n[k] = e.target.value; return n; })}
                      placeholder="…" />
                  )}
                </span>
              ))}
            </p>
          </>
        );
      }

      case "SHORT_TEXT":
      case "LONG_TEXT":
        return (
          <>
            {stem}
            {p.guidance && <ul className="produce-guide">{p.guidance.map(g => <li key={g}>{g}</li>)}</ul>}
            <textarea className="produce-box" rows={itemType === "LONG_TEXT" ? 8 : 3} value={text}
              spellCheck="false" onChange={e => setText(e.target.value)} placeholder="Write your answer here…" />
            <span className={"produce-count" + (words >= minWords ? " ok" : "")}>
              {words} / {minWords} words
            </span>
          </>
        );

      case "SPOKEN_RESPONSE":
        return (
          <>
            {stem}
            {/* SAYS WHAT IS ACTUALLY TRUE. "Recorded and transcribed but not
                scored" would claim a recording that does not happen: the
                recorder is not wired into this flow, so nothing is captured at
                all. Both facts are stated separately because they are separate:
                not recorded yet, and not part of the measured result. */}
            <StateMessage state="empty"
              message="This speaking task isn't recorded yet, and speaking is not part of your measured result. Skipping it costs you nothing." />
          </>
        );

      default:
        return <StateMessage state="error" message={`Unsupported item type: ${itemType}`} />;
    }
  };

  return (
    <div className="b2">
      <Bar onBack={onExit} section={LABEL[item.skill] || "Quick test"} />
      <div style={{ padding: "4px 16px 0" }}><BlockProgressTrack count={total} current={i} /></div>
      <Well style={{ gap: 14 }}>
        <p className="scr-count">{i + 1} of {total} · {LABEL[item.skill]}</p>

        {item.skill === "reading" && firstOfSkill && ctx.text && (
          <div className="scr-text"><b>{ctx.title}</b>
            {ctx.text.split("\n\n").map((p, k) => <p key={k}>{p}</p>)}</div>
        )}

        {item.skill === "listening" && firstOfSkill && (
          ctx.available ? (
            <div className="scr-audio">
              <audio ref={audioRef}
                src={`${import.meta.env.VITE_API_ORIGIN || "http://localhost:4000"}/b2/audio/${ctx.audioFile}.mp3`}
                onEnded={() => setPlayed(true)} />
              <button className="srcaudio-play" disabled={played} onClick={() => audioRef.current?.play()}>
                {played ? "Played once" : <><Icon name="play" size={15} /> Play once</>}
              </button>
              <p className="b2-quiet">Just like the exam: only once.</p>
            </div>
          ) : (
            /* The transcript exists; the audio has not been cut yet. Saying so
               and offering the skip is the only honest option — a player that
               plays nothing would have her fail a listening item she was never
               able to hear. */
            <StateMessage state="empty"
              message="This listening clip hasn't been recorded yet. Skip it — it won't count against you." />
          )
        )}

        {renderAnswer()}
      </Well>
      <Foot>
        {/* Always available, never styled as failure. Positioned above the primary button per design system. */}
        <B2Cta ghost disabled={busy} onClick={skip}>
          Skip — doesn’t count as wrong
        </B2Cta>
        <B2Cta disabled={busy || !canSubmit} onClick={answer}>
          {busy ? "…" : i + 1 === total ? "Done" : "Next"}
        </B2Cta>
      </Foot>
    </div>
  );
}
