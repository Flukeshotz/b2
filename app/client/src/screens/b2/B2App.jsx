import { useEffect, useState } from "react";
import { b2 } from "../../lib/b2api";
import { CHECK } from "./content";
import Onboarding from "./Onboarding";
import Check from "./Check";
import { ResultScreen, AdviceScreen, BoardScreen } from "./Result";
import Interview from "./Interview";
import { Bar, Maya, Well, Foot } from "./Shell";
import B2Home from "./B2Home";
import B2Lesson from "./B2Lesson";
import Screening from "./Screening";
import Assessment from "./Assessment";
import AssessmentResult from "./AssessmentResult";
import B2Cta from "./B2Cta";
import StateMessage from "../../ds/components/StateMessage";
import Auth from "./Auth";
import Report from "./Report";
import Coach from "./Coach";
import ExamPaper from "./ExamPaper";
import PracticeHome from "./PracticeHome";

/* The B2 product's own screen machine. Deliberately separate from the A1
   Lesson engine: the A1 loop is teach recognise tap the right tile, all
   closed-form and checkable against a stored answer. B2 is produce judge
   diagnose practise, and half its answers are free text and speech with no
   stored answer to check. Same app, same account, different loop. */



export default function B2App({ onExit }) {
  /* Opens on HOME, not on the fifteen-minute check.
     The check is still here and still the sharpest thing the product does — but
     180 words of German is not a first interaction for someone who just came
     off a shift. She gets material she can use in five minutes, and the check
     is one tap away under "Where I stand" for when she has the time to spend. */
  const [screen, setScreen] = useState(() => {
    try {
      return sessionStorage.getItem("b2_screen") || "home";
    } catch {
      return "home";
    }
  });
  const [lesson, setLesson] = useState(() => {
    try {
      const saved = sessionStorage.getItem("b2_lesson");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }); // {topicId, subKey}
  /* Persisted the same way `lesson` is, and for the same reason: without
     this, a refresh on ANY exam/practice paper (reading, writing, listening,
     grammar, vocabulary — every one of them, not just Listening) restored
     `screen="examPaper"` alone. The render guard below requires BOTH
     `screen==="examPaper"` AND a real `examPaper` object, so with only the
     screen name restored and this still null, every render fell through
     every `if` in this file and produced nothing — a permanently blank
     white page, no error, no way back except clearing storage by hand.
     ExamPaper.jsx's own /paper/:id/start already resumes the one open
     attempt for this learner+paper, so restoring just {paperId,label,mode}
     is enough for a refresh to actually continue the paper, not merely
     avoid the blank screen. */
  const [examPaper, setExamPaper] = useState(() => {
    try {
      const saved = sessionStorage.getItem("b2_examPaper");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }); // {paperId, label, mode}

  useEffect(() => {
    try {
      sessionStorage.setItem("b2_screen", screen);
      if (lesson) {
        sessionStorage.setItem("b2_lesson", JSON.stringify(lesson));
      } else {
        sessionStorage.removeItem("b2_lesson");
      }
      if (examPaper) {
        sessionStorage.setItem("b2_examPaper", JSON.stringify(examPaper));
      } else {
        sessionStorage.removeItem("b2_examPaper");
      }
    } catch {
      // ignore quota errors
    }
  }, [screen, lesson, examPaper]);

  // The just-finished assessment result. In memory only, like the check's
  // scores — see the refresh guard below.
  const [assessment, setAssessment] = useState(null);

  const [board, setBoard] = useState("goethe");
  const [content, setContent] = useState(null);
  const [scores, setScores] = useState(null);
  const [error, setError] = useState(null);
  // Every learner-data route requires a real session now (see routes/b2.js's
  // requireAuth mount) — nothing below this can render usefully without one.
  const [authed, setAuthed] = useState(() => b2.hasSession());
  const [practiceTrack, setPracticeTrack] = useState(null); // seeds B2Home's track view when opened from Practice
  // One-shot: B2Home reads this only at mount (useState(initialTrack)), so it
  // must be cleared right after so a later, ordinary visit to Home does not
  // keep reopening the same track.
  useEffect(() => { if (practiceTrack) setPracticeTrack(null); }, [screen]); // eslint-disable-line

  useEffect(() => {
    const onUnauth = () => setAuthed(false);
    window.addEventListener("b2:unauthenticated", onUnauth);
    return () => window.removeEventListener("b2:unauthenticated", onUnauth);
  }, []);

  // The writing task comes from the API so it carries its board's real rubric —
  // Goethe's four dimensions or telc's three. Generalising one onto the other
  // would produce a confident verdict against the wrong criteria.
  /* Which exam this learner will actually sit. A nurse chasing Anerkennung
     writes an Aufnahmebericht for telc Deutsch B1·B2 Pflege, not a Goethe
     Forumsbeitrag — different task, different criteria, a level rather than a
     score. We ask this in onboarding and then, until now, threw the answer away
     and served everyone Goethe: the Pflege engine existed and no learner could
     reach it. */
  const boardFor = (p) =>
    p?.goal === "anerkennung" || p?.goal === "ausbildung" ? "telc_pflege" : "goethe";

  useEffect(() => {
    // Every learner-data fetch requires a session now — nothing to load
    // before one exists, and firing it anyway would show a misleading
    // "couldn't load" error on top of the login screen.
    if (!b2.hasSession()) return;
    b2.getTasks(board, "schreiben")
      .then(tasks => {
        // An empty list is a seeding problem, not a network one, and it used to
        // sail through as `undefined` and break three screens later on a prompt
        // that would not render.
        if (!tasks?.length) {
          setError("No writing task is set up yet. Run the seed on the API and reload.");
          return;
        }
        setContent({ ...CHECK, writing: { task: tasks[0] } });
      })
      .catch(() => setError("Couldn't load the check. The API may not be running."));
  }, [board, authed]);

  /* PRACTISE THIS → and back again.
     The writing loop names one weakness and offers the lesson that teaches it.
     That lesson is a different published topic, so the CTA has to leave the
     writing screen and then return to it — otherwise "practise this" is a
     dead end and the one journey the product is built around does not close.

     Write.jsx fires this event rather than being handed a navigation prop:
     it renders deep inside the A1 lesson engine, and threading a B2 callback
     through nineteen shared step components would mean editing A1. */
  useEffect(() => {
    const go = (e) => {
      const topicId = e.detail?.topicId;
      if (!topicId || topicId === lesson?.topicId) return;
      // Where she is now IS the return target — the writing task she came from.
      try {
        if (lesson?.topicId) sessionStorage.setItem("b2_return", JSON.stringify(lesson));
      } catch { /* ignore quota errors */ }
      setLesson({ topicId, subKey: "main" });
      setScreen("lesson");
    };
    window.addEventListener("b2:navigate", go);
    return () => window.removeEventListener("b2:navigate", go);
  }, [lesson]);

  /* Leaving a lesson returns to whatever sent her there — the writing task if
     she came from "practise this", home otherwise. */
  const leaveLesson = () => {
    let back = null;
    try {
      const raw = sessionStorage.getItem("b2_return");
      if (raw) back = JSON.parse(raw);
      sessionStorage.removeItem("b2_return");
    } catch { /* ignore */ }
    if (back?.topicId) setLesson({ topicId: back.topicId, subKey: back.subKey || "main" });
    else if (back?.returnScreen) { setLesson(null); setScreen(back.returnScreen); }
    else { setLesson(null); setScreen("home"); }
  };

  /* The check's scores live in memory only; `screen` is persisted. A refresh on
     any result screen therefore used to render it with scores=null and throw
     on the first `scores.writing`. Send her home instead of to the error
     boundary — the result is gone either way, the crash is the avoidable part. */
  useEffect(() => {
    if (!scores && (screen === "result" || screen === "advice" || screen === "board")) {
      setScreen("home");
    }
    if (!assessment && screen === "assessmentResult") setScreen("home");
  }, [screen, scores, assessment]);

  /* Scoped to the check. This error used to replace the whole product — a
     missing writing task blanked every B2 screen, including the ones that do
     not need one. */
  if (error && screen !== "home" && screen !== "lesson") {
    return (
      <div className="b2">
        <Bar onBack={() => setScreen("home")} section="Where I stand" />
        <Well><StateMessage state="error" message={error} /></Well>
      </div>
    );
  }

  if (!authed) return <Auth onDone={() => setAuthed(true)} />;

  /* First run goes straight into goal + screening. Everything downstream is
     conditioned on what she says here, so there is nothing useful to show
     before it. A returning learner lands on home. */
  if (screen === "screening") {
    return <Screening
      onExit={() => setScreen("home")}
      onStart={(next) => { setLesson({ topicId: `b2_${next.experienceId.replace(/^exp_/, "")}`, subKey: "main" }); setScreen("lesson"); }} />;
  }

  /* THE QUICK TEST. "Take a quick test" now opens the ASSESSMENT, not the
     screening. The two are different products: the screening marks answers and
     returns a standing but records no attempt, so it can never answer "have I
     improved?". The assessment persists a version, a completion time and a
     per-item record, which is what the home screen's progress panel reads.

     The screening is deliberately left in place and unchanged — it still has
     learners on it and is still reachable — rather than deleted in passing. */
  if (screen === "assessment") {
    return <Assessment
      onExit={() => setScreen("home")}
      onDone={(r) => { setAssessment(r); setScreen("assessmentResult"); }} />;
  }

  /* Same guard as the check's result screens: `screen` is persisted and the
     result is not, so a refresh here would render with nothing. Home is a
     better answer than the error boundary — the result is still readable from
     history either way. */
  if (screen === "assessmentResult") {
    return assessment ? (
      <AssessmentResult result={assessment}
        onPractise={(topicId) => { setLesson({ topicId, subKey: "main" }); setScreen("lesson"); }}
        onReport={() => { setAssessment(null); setScreen("report"); }}
        onHome={() => { setAssessment(null); setScreen("home"); }} />
    ) : null;
  }

  if (screen === "home") {
    return <B2Home
      onExit={onExit}
      onStart={(topicId, subKey) => { setLesson({ topicId, subKey }); setScreen("lesson"); }}
      onExamPaper={(paperId, label) => { setExamPaper({ paperId, label, mode: "exam" }); setScreen("examPaper"); }}
      initialTrack={practiceTrack}
    />;
  }

  if (screen === "practice") {
    return <PracticeHome
      onExit={() => setScreen("home")}
      onOpenTrack={(track) => { setPracticeTrack(track); setScreen("home"); }}
      onOpenPaper={(paperId, label) => { setExamPaper({ paperId, label, mode: "practice" }); setScreen("examPaper"); }}
      onWorkplace={() => setScreen("interview")}
      onTakeAssessment={() => setScreen("assessment")}
    />;
  }

  if (screen === "examPaper" && examPaper) {
    return <ExamPaper paperId={examPaper.paperId} label={examPaper.label} mode={examPaper.mode}
      onExit={() => {
        setExamPaper(null);
        setScreen(examPaper.mode === "practice" ? "practice" : "home");
      }} />;
  }

  if (screen === "report") {
    return <Report onExit={() => setScreen("home")}
      onRetest={() => setScreen("assessment")}
      onPractise={(topicId, subKey) => {
        try { sessionStorage.setItem("b2_return", JSON.stringify({ returnScreen: "report" })); } catch {}
        setLesson({ topicId, subKey: subKey || "main" });
        setScreen("lesson");
      }} />;
  }

  if (screen === "coach") {
    return <Coach onExit={() => setScreen("home")}
      onRetest={() => setScreen("assessment")}
      onPractise={(topicId, subKey) => {
        try { sessionStorage.setItem("b2_return", JSON.stringify({ returnScreen: "coach" })); } catch {}
        setLesson({ topicId, subKey: subKey || "main" });
        setScreen("lesson");
      }} />;
  }

  if (screen === "lesson" && lesson) {
    return <B2Lesson {...lesson} key={lesson.topicId}
      onExit={leaveLesson}
      onDone={leaveLesson} />;
  }

  if (screen === "intro") {
    return (
      <div className="b2">
        <Bar onBack={onExit} section="Skillcase B2" />
        <Well style={{ gap: 18, paddingTop: 20 }}>
          <Maya mood="wave" width={210}>Three quick questions, then fifteen minutes.</Maya>
          <div className="b2-stack">
            {["Where you stand: reading, listening, writing, speaking",
              "Which exam to sit — telc or Goethe",
              "What to work on first"].map(t => (
              <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--b2-ok)" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 2 }}><path d="M20 6L9 17l-5-5" /></svg>
                <span style={{ font: "400 14px/1.4 var(--b2-font)", color: "var(--b2-body)" }}>{t}</span>
              </div>
            ))}
          </div>
          <p className="b2-note">Not a score — it tells you where to look first.</p>
        </Well>
        <Foot>
          <B2Cta disabled={!content} onClick={() => setScreen("onboarding")}>
            {content ? "Start" : "Loading…"}
          </B2Cta>
        </Foot>
      </div>
    );
  }

  if (screen === "onboarding") {
    return <Onboarding onBack={() => setScreen("intro")} onDone={p => {
      setBoard(boardFor(p));
      /* Q1 is the router. Someone already past B2 and into interviews does not
         need a reading test — the call data says they mostly HAVE the
         certificate and the gap is the interview itself. */
      setScreen(p.level === "jobs" || p.goal === "interview" ? "interview" : "check");
    }} />;
  }

  if (screen === "check") {
    return <Check content={content} onBack={() => setScreen("onboarding")}
      onDone={s => { setScores(s); setScreen("result"); }} />;
  }

  if (screen === "interview") return <Interview onExit={() => setScreen("home")} />;

  // The effect above redirects these to home when scores are gone; until it
  // runs, render nothing rather than dereferencing null.
  if (screen === "result") return scores ? <ResultScreen scores={scores} onNext={() => setScreen("advice")} /> : null;
  if (screen === "advice") return scores ? <AdviceScreen scores={scores} onBack={() => setScreen("result")} onNext={() => setScreen("board")} /> : null;
  if (screen === "board") return !scores ? null : (
    <BoardScreen scores={scores} onBack={() => setScreen("advice")} onDone={() => setScreen("home")}
      /* Sending them back for the one section that would settle it — not the
         whole check again. */
      onRedo={() => { setScores(s => ({ ...s, speaking: undefined })); setScreen("check"); }} />
  );

  return null;
}
