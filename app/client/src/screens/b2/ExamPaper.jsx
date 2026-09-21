import { useEffect, useRef, useState } from "react";
import { b2 } from "../../lib/b2api";
import { Bar, Well, Foot } from "./Shell";
import Icon from "./Icon";
import B2Cta from "./B2Cta";
import StateMessage from "../../ds/components/StateMessage";
import OptionRow from "../../ds/components/OptionRow";
import BlockProgressTrack from "../../ds/components/BlockProgressTrack";

/* EXAM-PRACTICE PAPER RUNNER — Goethe/telc standalone sections.
   ═══════════════════════════════════════════════════════════════════════════
   Deliberately a SEPARATE screen from Assessment.jsx rather than a shared one
   with a mode flag: the two consume different endpoints (/paper/* here,
   /assessment/* there) with different attempt semantics (exam practice is
   never part of the diagnostic's comparability/retest machinery), and their
   item payload shapes differ (flat here, nested under `.content` there).
   Sharing a component across that difference would couple two systems that
   must be free to diverge. The item-type rendering itself is intentionally
   the same pattern as Assessment.jsx (OptionRow for MCQ/TRUE_FALSE/
   MULTI_SELECT, BlockProgressTrack for position) so a learner recognises the
   interaction — and because the design system's own decisions.md names
   OptionRow vs ChoiceRow ("verdict vs selection") as the deliberate split for
   exactly this: answering a scored question, not a plain onboarding pick. */

export default function ExamPaper({ paperId, label, onExit, mode = "exam" }) {
  const [data, setData] = useState(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [arr, setArr] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [played, setPlayed] = useState(false);
  const audioRef = useRef(null);

  const load = () => {
    setError(null);
    b2.startPaper(paperId)
      .then(a => {
        setData(a);
        const next = a.items.findIndex(it => !it.answered);
        setI(next === -1 ? 0 : next);
      })
      .catch(() => setError("Couldn't start this practice set. Check your connection and try again."));
  };
  useEffect(load, [paperId]); // eslint-disable-line

  const item = data?.items?.[i];
  const itemType = item?.itemType;
  const p = item?.payload || {};

  useEffect(() => { setPicked(null); setArr([]); setText(""); setPlayed(false); }, [item?.itemId]);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const minWords = p.min_words ?? 0;

  if (error) {
    return (
      <div className="b2">
        <Bar onBack={onExit} section={label} />
        <Well><StateMessage state="error" message={error} /><B2Cta onClick={load}>Try again</B2Cta></Well>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="b2">
        <Bar onBack={onExit} section={label} />
        <Well><div className="b2-skel" /><div className="b2-skel s" /></Well>
      </div>
    );
  }
  /* Build per-section breakdown for complete papers (multi-skill). */
  const sectionBreakdown = (graded) => {
    if (!graded?.length) return [];
    const SL = { reading: "Lesen", listening: "H\u00f6ren", grammar: "Sprachbausteine",
      writing: "Schreiben", speaking: "Sprechen" };
    const seen = new Map();
    for (const g of graded) {
      const s = g.skill;
      if (!seen.has(s)) seen.set(s, { skill: s, label: SL[s] || s, correct: 0, scorable: 0, answered: 0, total: 0 });
      const sec = seen.get(s);
      sec.total++;
      if (g.answered) sec.answered++;
      if (g.correct !== null) { sec.scorable++; if (g.correct) sec.correct++; }
    }
    return [...seen.values()];
  };

  function formatAnswerText(ans, options, itemType) {
    if (ans === null || ans === undefined || ans === "") return null;
    if (itemType === "TRUE_FALSE" || typeof ans === "boolean") {
      return (ans === true || ans === "true") ? "Richtig" : "Falsch";
    }
    if (Array.isArray(options) && options.length > 0 && typeof ans === "number" && options[ans] !== undefined) {
      const opt = options[ans];
      return typeof opt === "string" ? opt : (opt.text || opt.label || String(opt));
    }
    if (Array.isArray(ans)) {
      return ans.map(a => formatAnswerText(a, options, itemType)).join(", ");
    }
    if (typeof ans === "object") {
      return Object.entries(ans).map(([k, v]) => `${k} → ${v}`).join(", ");
    }
    return String(ans);
  }

  if (result) {
    const sections = sectionBreakdown(result.graded);
    const isMultiSection = sections.length > 1;

    return (
      <div className="b2">
        <Bar onBack={onExit} section={label} />
        <Well style={{ gap: 14 }}>
          <h1 className="b2-title">Result</h1>

          {isMultiSection && (
            <div className="b2-card b2-result-sections">
              {sections.map(sec => (
                <div className="exam-result-section" key={sec.skill}>
                  <span className="ers-label">{sec.label}</span>
                  <span className="ers-score">
                    {sec.scorable > 0
                      ? `${sec.correct}/${sec.scorable} correct`
                      : sec.answered > 0 ? "Captured \u2014 not automatically scored" : "Skipped"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {result.scores.scorable > 0 ? (
            <p className="b2-quiet">
              {isMultiSection ? "Objective total: " : ""}
              {result.scores.correct} of {result.scores.scorable} correct
              {result.scores.answered < result.scores.total ? ` · ${result.scores.total - result.scores.answered} not answered` : ""}.
              This is Skillcase practice, not an official score.
            </p>
          ) : (
            <p className="b2-quiet">
              {result.scores.answered > 0
                ? "Your response was recorded. This task isn’t automatically scored."
                : "Nothing was answered."}
            </p>
          )}

          {result.graded && result.graded.length > 0 && (
            <section className="b2-review">
              <h2 className="b2-section-title">Antworten &amp; Erklärungen</h2>
              {result.graded.map((g, idx) => {
                const isScorable = g.correct !== null;
                const isCorrect = g.correct === true;
                const tone = !isScorable ? "" : isCorrect ? " ok" : " bad";
                return (
                  <article key={g.itemId || idx} className={"b2-card b2-review-card" + tone}>
                    <div className="b2-review-head">
                      <span className="b2-review-status">
                        {isScorable ? (isCorrect ? "✓ Richtig" : "✗ Falsch") : "Erfasst"}
                      </span>
                      <span className="b2-review-no">Aufgabe {idx + 1}</span>
                    </div>
                    {g.stem && <p className="b2-review-stem">{g.stem}</p>}

                    {isScorable && (
                      <>
                        <div className={"b2-inset b2-review-row" + tone}>
                          <strong>Ihre Antwort:</strong>
                          <span>{formatAnswerText(g.userAnswer, g.options, g.itemType) || "— Keine Antwort —"}</span>
                        </div>
                        {(!isCorrect || g.userAnswer === null) && g.correctAnswer !== null && (
                          <div className="b2-inset b2-review-row ok">
                            <strong>Richtige Antwort:</strong>
                            <span>{formatAnswerText(g.correctAnswer, g.options, g.itemType)}</span>
                          </div>
                        )}
                      </>
                    )}

                    {!isScorable && g.userAnswer && (
                      <div className="b2-inset b2-review-free">
                        <strong>Ihre Antwort:</strong>
                        <p>{String(g.userAnswer)}</p>
                      </div>
                    )}

                    {g.rationale && (
                      <div className="b2-inset b2-review-note"><strong>Erklärung</strong><p>{g.rationale}</p></div>
                    )}
                  </article>
                );
              })}
            </section>
          )}
        </Well>
        <Foot><B2Cta onClick={onExit}>Done</B2Cta></Foot>
      </div>
    );
  }

  const total = data.items.length;
  const firstOfSkill = data.items.findIndex(it => it.skill === item.skill) === i;
  const ctx = data.context?.[item.skill] || {};

  const SKILL_LABEL = { reading: "Lesen", listening: "H\u00f6ren", grammar: "Sprachbausteine",
    writing: "Schreiben", speaking: "Sprechen" };
  const multiSkill = new Set(data.items.map(it => it.skill)).size > 1;
  const showSectionHeader = multiSkill && firstOfSkill;

  const canSubmit = itemType === "MULTI_SELECT" ? arr.length > 0
    : itemType === "LONG_TEXT" ? words >= (minWords || 1)
    : itemType === "SPOKEN_RESPONSE" ? false // never recorded — the only honest path is Skip
    : picked !== null;

  const advance = async () => {
    if (i + 1 < total) { setI(i + 1); return; }
    setBusy(true);
    try { setResult(await b2.finishPaper(data.attemptId)); }
    catch { setError("Couldn't submit that. Nothing has been lost — try again."); setBusy(false); }
  };

  const answer = async () => {
    setBusy(true);
    const value = itemType === "MULTI_SELECT" ? arr : itemType === "LONG_TEXT" ? text : picked;
    try { await b2.answerPaperItem(data.attemptId, item.itemId, value); setBusy(false); advance(); }
    catch { setError("Couldn't save that answer. Try again."); setBusy(false); }
  };

  const skip = async () => { setBusy(true); await advance(); setBusy(false); };

  return (
    <div className="b2">
      <Bar onBack={onExit} section={label} />
      <div style={{ padding: "4px 16px 0" }}><BlockProgressTrack count={total} current={i} /></div>
      <Well style={{ gap: 14 }}>
        <p className="scr-count">{i + 1} of {total}</p>

        {showSectionHeader && (
          <div className="exam-section-hdr">
            <p className="exam-sh-title">{SKILL_LABEL[item.skill] || item.skill}</p>
            {ctx.minutes && <p className="exam-sh-meta">{ctx.minutes} min</p>}
          </div>
        )}

        {item.skill === "listening" && firstOfSkill && (
          ctx.available ? (
            <div className="scr-audio">
              <audio ref={audioRef} onEnded={() => setPlayed(true)}
                src={`${import.meta.env.VITE_API_ORIGIN || "http://localhost:4000"}/b2/audio/${ctx.audioFile}.mp3`} />
              <button className="srcaudio-play" disabled={mode === "exam" && played}
                onClick={() => audioRef.current?.play()}>
                <Icon name="play" size={15} /> {mode === "exam" && played ? "Played once" : "Play"}
              </button>
              <p className="b2-quiet">
                {mode === "exam"
                  ? "Just like the exam: only once."
                  : "Practice — play it as many times as you like."}
              </p>
            </div>
          ) : (
            // Transcript exists; audio not attached. Same honest pattern as
            // Assessment.jsx: never render a player that plays nothing.
            <StateMessage state="empty"
              message="This listening clip hasn't been recorded yet. Skip it — it won't count against you." />
          )
        )}

        {item.skill !== "listening" && firstOfSkill && ctx.text && (
          <div className="scr-text"><b>{ctx.title}</b>
            {ctx.text.split("\n\n").map((para, k) => <p key={k}>{para}</p>)}</div>
        )}

        {p.context && <p className="scr-context">{p.context}</p>}
        <p className="scr-q">{item.stem}</p>

        {itemType === "MCQ" && (
          <div className="srcq-opts">
            {(item.options || []).map((o, k) => (
              <OptionRow key={k} letter={"ABC"[k]} label={o}
                state={picked === k ? "selected" : "default"} onClick={() => setPicked(k)} />
            ))}
          </div>
        )}
        {itemType === "TRUE_FALSE" && (
          <div className="srcq-opts">
            <OptionRow letter="R" label="Richtig" state={picked === true ? "selected" : "default"} onClick={() => setPicked(true)} />
            <OptionRow letter="F" label="Falsch" state={picked === false ? "selected" : "default"} onClick={() => setPicked(false)} />
          </div>
        )}
        {itemType === "MULTI_SELECT" && (
          <>
            <p className="scr-context">Multiple answers possible.</p>
            <div className="srcq-opts">
              {(item.options || p.options || []).map((o, k) => (
                <OptionRow key={k} letter={arr.includes(k) ? "✓" : "ABCD"[k]} label={o}
                  state={arr.includes(k) ? "selected" : "default"}
                  onClick={() => setArr(a => a.includes(k) ? a.filter(x => x !== k) : [...a, k])} />
              ))}
            </div>
          </>
        )}
        {itemType === "LONG_TEXT" && (
          <>
            {p.guidance && <ul className="produce-guide">{p.guidance.map(g => <li key={g}>{g}</li>)}</ul>}
            <textarea className="produce-box" rows={8} value={text} spellCheck="false"
              onChange={e => setText(e.target.value)} placeholder="Schreiben Sie hier…" />
            <span className={"produce-count" + (words >= minWords ? " ok" : "")}>{words} / {minWords} words</span>
          </>
        )}
        {itemType === "SPOKEN_RESPONSE" && (
          /* Same honest wording as the assessment's speaking item: nothing is
             recorded, and it never becomes part of a score. Skip is the only
             real path forward. */
          <StateMessage state="empty"
            message="This speaking task isn't recorded yet, and it isn't scored. Skipping it costs you nothing." />
        )}
      </Well>
      <Foot>
        <B2Cta ghost disabled={busy} onClick={skip}>Skip — doesn't count as wrong</B2Cta>
        <B2Cta disabled={busy || !canSubmit} onClick={answer}>
          {busy ? "…" : i + 1 === total ? "Finish" : "Next"}
        </B2Cta>
      </Foot>
    </div>
  );
}
