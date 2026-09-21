import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Maya from "../components/Maya";
import { buildReviewSteps, wordsForStep, pickPraise, pickMindBlown } from "../lib/curriculum";
import StepBody from "../components/steps";

/* Steps the footer just advances past — there is nothing to be right about.
   `listen_source`, `read_source`, `chunk` and `notice` are B2 additions: a
   nine-minute audio, a forum thread and an expression card are things the
   learner CONSUMES. Running them through commit() printed "Correct." over a
   text somebody had merely finished reading, which is exactly the A1 reward
   chrome B2 is supposed to be free of. They manage their own footer label via
   ctx.setMainBtn.

   `chunk` was missing from this list and its footer button was therefore DEAD:
   the step set the label "Verstanden", the handler found nothing to check and
   nothing to advance, and the lesson could not be finished. It shipped live in
   b2_muede_chunks. Any step whose component sets a main button but never calls
   commit() belongs here — the regression test at the bottom of
   test/b2_expressions.test.js enforces that. */
/* `write` joins them for the same reason, one stage later: its compare screen
   is the end of a rewrite, not an answer. It used to call ctx.commit(true) so
   the footer would offer "Continue", and commit()'s side effect is a verdict —
   so Maya and "Correct." were printed over a before/after comparison nobody
   had answered. It now sets its own button and this list advances past it. */
const NOCHECK = ["teach", "match", "chat", "hack", "chunk", "listen_source", "read_source", "notice", "gform", "write"];

/* Step types whose OWN component decides when the shared footer shows, by
   calling ctx.setHideFooter itself (Write's "Abgeben" vs "Neue Fassung
   abgeben", GUse's "Prüfen", HoerenTeil1's per-phase controls, and so on).
   `goToStep` still needs a value to seed `hideFooter` with on the step's very
   first mount, and it must NOT be a blanket "false" default: this list existed
   only as ["story","chat","converse"] and every step below it was silently
   broken the same way "hoeren_t1" was found to be — its component's own
   mount-time `ctx.setHideFooter(true)` call was overwritten a moment later by
   this exact line, because `goToStep` fires as part of the SAME initial commit
   and runs after the child, unconditionally resetting anything not in the
   list. The result was a dead, permanently-disabled "Check" button sitting
   underneath the step's real controls for the entire step — not a flash, a
   standing defect. Found on hoeren_t1; the same mechanism affects every step
   type below by the same reasoning, so all of them go in the list rather than
   patching the one that happened to get noticed.
   Kept as an explicit list rather than something computed from the component
   source at runtime, matching NOCHECK above — but test/b2_exam_hoeren-style
   suites elsewhere in this codebase read the step components' own source to
   assert every one that calls ctx.setHideFooter is listed here, so the list
   cannot silently drift out of sync again. */
const SELF_FOOTER_ON_ENTRY = ["story", "chat", "converse", "write", "guse", "chunk_produce", "produce", "hoeren_t1"];
const REVIEW_PER_SESSION = 2; // folded into the front of whatever she opens next, not a separate destination

/* `tone` is the one thing that differs between an A1 lesson and a B2 lesson.
   The MECHANICS are shared on purpose — nineteen step components, one review
   injector, one progress call — and rebuilding them per level would be waste.
   The motivation layer is not shared, because the two learners are not the
   same person:

     "play" — a beginner building a habit. Unlocks, combos, escalating praise.
     "exam" — an adult with a test date and ten minutes after a shift. She is
              not collecting words; she is closing a gap an examiner marked.
              Praise that oversells a correct answer reads as condescension.

   Reusing the engine is right. Reusing the reward economy is not, and B2's own
   design note says so: no streaks, no coins, no journey. */
export default function Lesson({ topics, target, userName, stats, review, tone = "play", onExit, onFinishSub, onPushReview, onRemoveReview, onCooldown, onExplain }) {
  const exam = tone === "exam";
  const L = useMemo(() => {
    const base = { steps: target.sub.steps, teaches: target.sub.teaches };
    /* B2 TAKES NO A1 REVIEW INJECTION.
       The injector's three mechanics are pick, listen and soundmatch — all
       recognition, all A1. Sound-matching "Nur folgt daraus doch nicht" is not
       a B2 review of that expression; it is the recognition drill the learner
       has already outgrown, and it broke the standing rule directly: an
       expression they had PRODUCED came back as a flashcard.

       B2 already has a repetition model, and a better one: the expression
       ladder in b2/chunks.js, applied at serve time in b2/curriculum.js. It
       drops what has been produced and will raise the demand rather than lower
       it. Running the A1 queue alongside it would be a second, contradictory
       progress model — the thing the architecture explicitly forbids. */
    const pending = exam ? [] : (review || []).slice(0, REVIEW_PER_SESSION);
    if (!pending.length) return base;
    const { steps: reviewSteps, teaches: reviewTeaches } = buildReviewSteps(pending, topics, stats.words, base.teaches.length);
    return { steps: [...reviewSteps, ...base.steps], teaches: [...base.teaches, ...reviewTeaches] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, exam]);

  const [step, setStep] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [misses, setMisses] = useState(0);
  const [mainBtn, setMainBtnState] = useState({ label: "Check", disabled: true });
  const [footSkip, setFootSkipState] = useState(null);
  const [lastWords, setLastWords] = useState([]);
  const [hideFooter, setHideFooter] = useState(false); // story/chat steps replace the standard footer with their own UI
  const [portalTarget, setPortalTarget] = useState(null);
  const t0 = useRef(Date.now());
  const speakCheckRef = useRef(null);
  const stepHadMiss = useRef(false); // any wrong tap this step? gates the first-try "mind blown" praise

  useEffect(() => { setPortalTarget(document.getElementById("fixedBottom")); }, []);

  const now = () => Date.now();
  const onListenCooldown = () => stats.listen_skip_until && now() < new Date(stats.listen_skip_until).getTime();
  const onSpeakCooldown = () => stats.speak_skip_until && now() < new Date(stats.speak_skip_until).getTime();

  // Walk `step` forward past any listen/translate/speak steps currently
  // under a 15-minute skip cooldown, same as the prototype.
  const resolveStep = (idx) => {
    let i = idx;
    while (L.steps[i] && (
      ((L.steps[i].t === "listen" || L.steps[i].t === "translate") && onListenCooldown()) ||
      (L.steps[i].t === "speak" && onSpeakCooldown())
    )) i++;
    return i;
  };

  const finishNow = async () => {
    const secs = Math.round((now() - t0.current) / 1000);
    onFinishSub({ topic: target.topic, sub: target.sub, bestCombo, misses, stepsLen: L.steps.length, secs });
  };

  const goToStep = (idx) => {
    const resolved = resolveStep(idx);
    if (!L.steps[resolved]) { finishNow(); return; }
    setStep(resolved);
    setAnswered(false); setVerdict(null); setMainBtnState({ label: "Check", disabled: true });
    setFootSkipState(null); speakCheckRef.current = null; stepHadMiss.current = false;
    // Steps that carry their own footer. `converse` composes into its own send
    // button, so the shared Check bar would sit under it doing nothing.
    setHideFooter(SELF_FOOTER_ON_ENTRY.includes(L.steps[resolved].t));
  };

  useEffect(() => { goToStep(0); /* eslint-disable-next-line */ }, [L]);

  const s = L.steps[step];
  if (!s) return null;

  const commit = (ok, msg, words) => {
    setAnswered(true);
    /* Flat, factual, and the same every time in exam tone. "Mind. Blown." for
       getting a genitive right is the wrong register for someone preparing to
       be marked on it. */
    const headline = exam
      ? (ok ? "Correct." : "Not quite.")
      : (!ok ? "Not that one. No harm done." : (!stepHadMiss.current ? pickMindBlown() : pickPraise()));
    setVerdict({ ok, msg, headline });
    if (ok) { setCombo(c => { const n = c + 1; setBestCombo(b => Math.max(b, n)); return n; }); }
    else { setCombo(0); setMisses(m => m + 1); }
    setMainBtnState({ label: "Continue", disabled: false });
    setLastWords(ok ? words : []);
    if (ok && s.reviewWord) onRemoveReview(s.reviewWord);
  };

  const advance = () => {
    goToStep(step + 1);
  };

  const handleMainBtn = () => {
    if (NOCHECK.includes(s.t)) { advance(); return; }
    if (!answered) {
      if (s.t === "speak" && speakCheckRef.current) {
        const v = speakCheckRef.current();
        commit(v.ok, v.msg, wordsForStep(s, L.teaches));
      }
      return;
    }
    advance();
  };

  const progressPct = (step / L.steps.length) * 100;

  // A wrong tap on a multi-option screen (pick/listen) doesn't end the step —
  // it just resets combo and counts a miss, same as the prototype.
  const miss = () => { setCombo(0); setMisses(m => m + 1); stepHadMiss.current = true; };
  // chat bumps combo per correct exchange without going through the
  // answered/verdict flow (the thread has its own inline feedback).
  const bumpCombo = () => setCombo(c => { const n = c + 1; setBestCombo(b => Math.max(b, n)); return n; });

  const ctx = {
    teaches: L.teaches, topics,
    userFirstName: userName ? userName.split(" ")[0] : null,
    commit: (ok, msg) => commit(ok, msg, wordsForStep(s, L.teaches)),
    miss,
    bumpCombo,
    advance,
    setMainBtn: (v) => setMainBtnState(v),
    setFootSkip: (v) => setFootSkipState(v),
    registerSpeakCheck: (fn) => { speakCheckRef.current = fn; },
    onPushReview, onRemoveReview, onCooldown,
    setHideFooter, finishNow,
    answered,
    tone,
  };

  return (
    <section className="screen on" id="lesson">
      <div className="progress">
        <button className="xbtn" aria-label="Leave lesson" onClick={onExit}>✕</button>
        <div className="pbar"><i style={{ width: progressPct + "%" }} /></div>
        {/* A combo counter is a game score. There is no score in this product
            for B2 and there should not be one on the way to an exam. */}
        {!exam && <div className={`combo ${combo >= 2 ? "on" : ""}`}>×{combo + 1} COMBO</div>}
      </div>
      <div className="qbody">
        <StepBody key={step} step={s} ctx={ctx} />
      </div>

      {!hideFooter && portalTarget && createPortal(
        <div id="foot">
          {footSkip && (
            <button className="footskip" onClick={() => { footSkip.onSkip(); }}>{footSkip.label}</button>
          )}
          {verdict && (
            <div className="verdict">
              <div style={{ width: 44, flex: "0 0 44px" }}><Maya mood={verdict.ok ? "cheer" : "wobble"} /></div>
              <div>
                <h3 style={{ color: verdict.ok ? "var(--good)" : "var(--text)" }}>
                  {verdict.headline}
                </h3>
                {verdict.ok ? (
                  verdict.msg ? (
                    <details className="verdict-more">
                      <summary>Why this works</summary>
                      <p dangerouslySetInnerHTML={{ __html: verdict.msg }} />
                    </details>
                  ) : null
                ) : (
                  <p dangerouslySetInnerHTML={{ __html: verdict.msg || "" }} />
                )}
              </div>
            </div>
          )}
          <button className="btn" disabled={mainBtn.disabled} onClick={handleMainBtn}>{mainBtn.label}</button>
          {/* Only offered where something can actually answer it. B2 runs this
              same engine but carries no Explain sheet, and a button that does
              nothing when tapped is worse than no button. */}
          {answered && verdict?.ok && lastWords.length > 0 && onExplain && (
            <button className="btn ghost" onClick={() => onExplain(lastWords)}>Explain my answer</button>
          )}
        </div>,
        portalTarget
      )}
    </section>
  );
}
