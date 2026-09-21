import { useEffect, useState, useCallback } from "react";
import { api } from "./lib/api";
import { subKey, topicFullyDone, topicDoneCount, nextSub } from "./lib/curriculum";
import Home from "./screens/Home";
import Lesson from "./screens/Lesson";
import Reward from "./screens/Reward";
import PartComplete from "./screens/PartComplete";
import Passport from "./screens/Passport";
import ExplainSheet from "./screens/ExplainSheet";
import B2App from "./screens/b2/B2App";
import ErrorBoundary from "./components/ErrorBoundary";

/* B2 is a different product, not a level inside this one: a different audience
   (nurses who mostly already hold B2), a different loop (produce → judge →
   practise, not teach → recognise → tap), and an adult, deadline-driven register
   with none of the journey map, streak or coin machinery.

   So it gets its own door at /b2 rather than a button on a beginner's home
   screen. Same codebase and same account — outcome capture depends on reaching
   the learner weeks later — but the entrance is separate. */
const isB2Route = () => window.location.pathname.replace(/\/+$/, "").endsWith("/b2");

export default function App() {
  const [topics, setTopics] = useState(null);
  const [userState, setUserState] = useState(null);
  const [screen, setScreen] = useState(() => (isB2Route() ? "b2" : "home"));
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [lessonTarget, setLessonTarget] = useState(null); // {topic, sub}
  const [rewardTopic, setRewardTopic] = useState(null);
  const [rewardStats, setRewardStats] = useState(null);
  const [partComplete, setPartComplete] = useState(null); // {topic, sub, doneCount, total, newWords}
  const [explainTokens, setExplainTokens] = useState(null);

  const refresh = useCallback(async () => {
    const [t, s] = await Promise.all([api.getCurriculum(), api.getState()]);
    setTopics(t);
    setUserState(s);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Keep the URL and the title honest about which product you are in. A shared
  // deployment is an implementation detail, not something a learner should see.
  useEffect(() => {
    const b2 = screen === "b2";
    document.title = b2 ? "Skillcase B2" : "Skillcase · German for nurses";
    const want = b2 ? "/b2" : "/";
    if (window.location.pathname !== want) window.history.replaceState({}, "", want);
  }, [screen]);

  useEffect(() => {
    const onPop = () => setScreen(isB2Route() ? "b2" : "home");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // B2 fetches its own data and must not wait on the A1 curriculum call — that
  // is a different product's payload and irrelevant here.
  if (screen === "b2") return (
    <div id="frame" className="frame">
      <ErrorBoundary>
        <B2App onExit={() => { window.history.pushState({}, "", "/"); setScreen("home"); }} />
      </ErrorBoundary>
    </div>
  );

  if (!topics || !userState) {
    return <div className="frame" id="frame"><div style={{ padding: 40, textAlign: "center", color: "var(--text-dim)" }}>Loading…</div></div>;
  }

  const openTopic = (topicId) => {
    const topic = topics.find(t => t.id === topicId);
    const sub = nextSub(topic, userState.done);
    setLessonTarget({ topic, sub });
    setScreen("lesson");
  };

  // Jumps straight into one specific sub-stage — used to replay a single
  // part (e.g. just the Apply chat scene) of an already-finished topic,
  // instead of forcing a full restart from Learn.
  const openSub = (topicId, subKey) => {
    const topic = topics.find(t => t.id === topicId);
    const sub = topic.subs.find(s => s.key === subKey);
    setLessonTarget({ topic, sub });
    setScreen("lesson");
  };

  const onSubFinished = async ({ topic, sub, bestCombo, misses, stepsLen, secs }) => {
    const { fresh, stats } = await api.completeSub(topic.id, sub.key);
    await api.reportCombo(bestCombo);
    const doneAfter = fresh ? [...userState.done, subKey(topic, sub)] : userState.done;
    setUserState(u => ({ ...u, done: doneAfter, stats }));

    if (!topicFullyDone(topic, doneAfter)) {
      const newWords = sub.steps.filter(s => s.t === "teach").map(s => sub.teaches[s.w]);
      const upNext = nextSub(topic, doneAfter);
      const accuracy = Math.max(0, Math.round(100 - (misses * 100 / stepsLen)));
      setPartComplete({
        topic, sub, upNext, accuracy, bestCombo,
        doneCount: topicDoneCount(topic, doneAfter), total: topic.subs.length, newWords,
      });
      setScreen("partcomplete");
      return;
    }
    const accuracy = Math.max(0, Math.round(100 - (misses * 100 / stepsLen)));
    const nextTopic = topics.find(t => !topicFullyDone(t, doneAfter)) || null;
    setRewardTopic(topic);
    setRewardStats({ accuracy, bestCombo, secs, totalStamps: topics.filter(t => topicFullyDone(t, doneAfter)).length, nextTopic });
    setScreen("reward");
  };

  // B2 owns the whole frame: it is a different loop (produce -> judge -> practise),
  // not another topic inside the A1 journey, and it carries its own chrome.
  return (
    <div id="frame" className="frame">
      {screen !== "lesson" && (
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 16, color: "var(--navy)", letterSpacing: "-0.02em" }}>
            <span>SKILLCASE</span>
          </div>
          <div className="stat streak" title="Day streak"><span>🔥</span><b>{userState.stats.streak}</b></div>
          <div className="stat stamps" title="Passport stamps"><span>🛂</span><b>{topics.filter(t => topicFullyDone(t, userState.done)).length}</b></div>
          <div className="stat words" title="Words you own"><span>📖</span><b>{userState.stats.words.length}</b></div>
          <button className="stat" title="Skillcase B2 — exam and interview readiness"
            onClick={() => { window.history.pushState({}, "", "/b2"); setScreen("b2"); }}
            style={{ cursor: "pointer", border: "1px solid var(--gold)", background: "var(--gold)", color: "#002856", fontWeight: 800 }}><b>B2</b></button>
          <button id="themeBtn" aria-label="Switch theme" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}>◐</button>
        </div>
      )}

      <div id="stage">
        {screen === "home" && (
          <Home topics={topics} done={userState.done} review={userState.review}
            wordsOwned={userState.stats.words.length}
            onOpenTopic={openTopic} onOpenSub={openSub}
            onPassport={() => setScreen("passport")} />
        )}
        {screen === "lesson" && lessonTarget && (
          <Lesson
            topics={topics}
            target={lessonTarget}
            userName={userState.name}
            stats={userState.stats}
            review={userState.review}
            onExit={() => { setScreen("home"); refresh(); }}
            onFinishSub={onSubFinished}
            onPushReview={async (de, en, icon) => { const r = await api.pushReview(de, en, icon); setUserState(u => ({ ...u, review: r.review })); }}
            onRemoveReview={async (de) => { const r = await api.removeReview(de); setUserState(u => ({ ...u, review: r.review })); }}
            onCooldown={async (kind) => { const r = await api.setCooldown(kind); setUserState(u => ({ ...u, stats: { ...u.stats, ...r } })); }}
            onExplain={setExplainTokens}
          />
        )}
        {screen === "reward" && rewardTopic && (
          <Reward topic={rewardTopic} stats={rewardStats}
            totalStamps={rewardStats.totalStamps}
            onNext={() => {
              setScreen("home");
              const n = topics.find(t => !topicFullyDone(t, userState.done));
              if (n) setTimeout(() => openTopic(n.id), 260);
            }}
            onPassport={() => setScreen("passport")}
            onHome={() => setScreen("home")}
          />
        )}
        {screen === "partcomplete" && partComplete && (
          <PartComplete {...partComplete}
            onContinue={() => {
              const n = nextSub(partComplete.topic, userState.done);
              setPartComplete(null);
              openSub(partComplete.topic.id, n.key);
            }}
          />
        )}
        {screen === "passport" && (
          <Passport topics={topics} done={userState.done} stats={userState.stats} onBack={() => setScreen("home")} />
        )}
      </div>

      {/* Portal target for anything that must stay pinned to the frame's
          bottom edge (Home's CTA bar, Lesson's footer, Chat's reply sheet) —
          must live OUTSIDE the scrollable #stage, or "position:absolute;
          bottom:0" anchors to the bottom of the scrollable content instead
          of the visible viewport. */}
      <div id="fixedBottom" />

      {explainTokens && (
        <ExplainSheet tokens={explainTokens} topics={topics} onClose={() => setExplainTokens(null)} />
      )}
    </div>
  );
}
