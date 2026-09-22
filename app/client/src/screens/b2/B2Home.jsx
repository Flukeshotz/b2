import { useEffect, useState } from "react";
import { b2 } from "../../lib/b2api";
import { Bar, Well } from "./Shell";
import Icon from "./Icon";
import B2Cta from "./B2Cta";
import StateMessage from "../../ds/components/StateMessage";
import ListRow from "../../ds/components/ListRow";
import PlanPill from "../../ds/components/PlanPill";
import PracticeTile from "../../ds/components/PracticeTile";

/* THE B2 HOME.
   Strict two-tier separation:
   1. PRACTICE BY SKILL: All seeded practice material (Goethe, telc, Sprachbausteine,
      custom exercises, and curriculum topics) organized under their respective skill
      (Reading, Listening, Writing, Speaking) with dynamic filter tabs.
   2. FULL EXAM PAPERS: Complete Goethe B2 and telc B2 full-length papers ONLY (all
      sections/modules in one continuous sitting).
*/

const PRACTICE = [
  { key: "reading",   label: "Reading",   blurb: "Lesen & Grammatik", image: "/b2/home/tile-reading.webp" },
  { key: "listening", label: "Listening", blurb: "Echtes Prüfungsaudio", image: "/b2/home/tile-listening.webp" },
  { key: "writing",   label: "Writing",   blurb: "E-Mails & Beiträge", image: "/b2/home/tile-writing.webp" },
  { key: "speaking",  label: "Speaking",  blurb: "Prüfung & Maya", image: "/b2/home/tile-speaking.webp" },
];

/* SCORE CARD — the home screen's entry into assess -> practise -> re-assess.
   Three states:
   - never sat one: the mockup's "Take a test to check where you stand" banner.
   - sat one: her last score, and a prompt that opens the Test screen
     (TestHub.jsx) — never a breakdown inline on Home. Home only ever shows
     the one number; everything else (previous score, history, the detailed
     report) lives one tap away, on its own screen.
   `progress` is exactly assessment_store.progress()'s `.latest` — no second
   scoring model, same numbers TestHub.jsx and AssessmentResult.jsx show. */
function TestCard({ progress, nextVersion, onTakeAssessment, onOpenTest }) {
  if (nextVersion === undefined) return null; // still loading — nothing to show yet
  const latest = progress?.latest;

  if (!latest) {
    return (
      <button type="button" className="b2-test-banner" onClick={onTakeAssessment}>
        <img className="b2-test-banner-img" src="/b2/home/maya-banner.webp" alt="" aria-hidden="true" />
        <span className="b2-test-banner-text">
          <span className="b2-test-banner-title">Take a test to check where you stand</span>
          <span className="b2-test-banner-sub">Fifteen minutes across reading, listening, grammar and vocabulary</span>
        </span>
        <span className="b2-test-banner-chev" aria-hidden="true">›</span>
      </button>
    );
  }

  const pct = Math.round(latest.score * 100);
  // delta is { value, direction, basis, claim } — never null (that would be
  // silently ignored below), null before a second comparable attempt exists.
  const delta = progress.delta;

  // Tapping opens the Test screen — it decides what's next (retake, or every
  // version already sat), shows the previous score, and gates the rest.
  return (
    <button type="button" className="b2-test-banner scored" onClick={onOpenTest}>
      <img className="b2-test-banner-img" src="/b2/home/maya-banner.webp" alt="" aria-hidden="true" />
      <span className="b2-test-banner-text">
        <span className="b2-test-banner-title">Your last test: {pct}%</span>
        <span className="b2-test-banner-sub">
          See your score and take the next one
          {delta && delta.direction !== "flat" && (
            <span className={"b2-test-banner-delta " + delta.direction}>
              {delta.direction === "up" ? " ▲" : " ▼"} {Math.abs(Math.round(delta.value * 100))} pts since last time
            </span>
          )}
        </span>
      </span>
      <span className="b2-test-banner-chev" aria-hidden="true">›</span>
    </button>
  );
}

function sanitizeTitle(raw) {
  if (!raw) return "";
  return raw.replace(/^(goethe(-zertifikat)?|telc)(\s+deutsch)?\s*(b2)?\s*—\s*/i, "").trim();
}

function Loading() {
  return (
    <div className="b2">
      <Bar section="German B2" />
      <Well><div className="b2-skel" /><div className="b2-skel s" /><div className="b2-skel s" /></Well>
    </div>
  );
}

export default function B2Home({ onExit, onStart, onExamPaper, onTakeAssessment, onOpenTest, initialTrack = null }) {
  const [curriculum, setCurriculum] = useState(null);
  const [practiceCounts, setPracticeCounts] = useState({ reading: 0, listening: 0, writing: 0, speaking: 0 });
  const [completePapers, setCompletePapers] = useState([]);
  const [error, setError] = useState(null);
  // Score card: her latest assessment (null = never sat one) and whether a
  // fresh, not-yet-seen version exists to retest against (see
  // b2/assessment_store.currentDiagnosticVersion — never repeats a version).
  const [progress, setProgress] = useState(null);
  const [nextVersion, setNextVersion] = useState(undefined); // undefined = loading, null = exhausted
  const [suggested, setSuggested] = useState(null);

  // Navigation states
  const [track, setTrack] = useState(initialTrack);
  const [skillFilter, setSkillFilter] = useState("all");
  const [skillPapers, setSkillPapers] = useState(null);
  const [loadingSkill, setLoadingSkill] = useState(false);

  // Full papers modal/screen
  const [showPapers, setShowPapers] = useState(false);
  const [papersFilter, setPapersFilter] = useState("all"); // "all" | "goethe" | "telc"

  const loadInitial = () => {
    setError(null);
    Promise.all([
      b2.getCurriculum().catch(err => {
        if (err?.message === "unauthenticated") return [];
        throw err;
      }),
      b2.getPracticeCounts().catch(() => ({ reading: 0, listening: 0, writing: 0, speaking: 0 })),
      b2.getCompletePapers().catch(() => []),
      b2.getAssessmentProgress().catch(() => null),
      b2.getCurrentDiagnostic().catch(() => ({ version: null })),
      b2.getSuggestedPractice().catch(() => ({ available: false, focus: [], modules: {} })),
    ])
      .then(([curr, counts, complete, prog, diag, sugg]) => {
        setCurriculum(curr || []);
        setPracticeCounts(counts || { reading: 0, listening: 0, writing: 0, speaking: 0 });
        setCompletePapers(complete || []);
        setProgress(prog || null);
        setNextVersion(diag?.version ?? null);
        setSuggested(sugg || { available: false, focus: [], modules: {} });
      })
      .catch(() => {
        setError("Couldn't load practice data. Check your connection and try again.");
      });
  };

  useEffect(loadInitial, []);

  // When opening a skill track, fetch that skill's seeded practice papers
  useEffect(() => {
    if (!track) {
      setSkillPapers(null);
      setSkillFilter("all");
      return;
    }
    setLoadingSkill(true);
    setSkillFilter("all");
    b2.getPracticeBySkill(track)
      .then(res => {
        setSkillPapers(res || []);
        setLoadingSkill(false);
      })
      .catch(() => {
        setSkillPapers([]);
        setLoadingSkill(false);
      });
  }, [track]);

  if (error) {
    return (
      <div className="b2">
        <Bar section="German B2" />
        <Well>
          <StateMessage state="error" message={error} />
          <B2Cta onClick={loadInitial}>Try again</B2Cta>
        </Well>
      </div>
    );
  }

  if (!curriculum) return <Loading />;

  // Total exercise count for each skill card
  const totalCountFor = (key) => {
    const topicsCount = curriculum.filter(t => t.track === key).length;
    const papersCount = practiceCounts[key] || 0;
    return topicsCount + papersCount;
  };

  /* ──────────────────────────────────────────────────────────────────────────
     VIEW 1: DRILLDOWN FOR "PRACTICE BY SKILL"
     Contains ALL seeded material for this skill (Goethe, telc, custom, topics).
     ────────────────────────────────────────────────────────────────────────── */
  if (track) {
    const meta = PRACTICE.find(t => t.key === track) || { label: "Practice", icon: "file" };
    const topics = curriculum.filter(t => t.track === track);
    const papers = skillPapers || [];

    // Categorization. "Sprachbausteine" is the name of a telc exam part, so only
    // telc papers carry it; Skillcase's own grammar/vocabulary drills are
    // Übungen, labelled by what they train. telc B2 lists ALL telc papers,
    // Sprachbausteine included — it is part of that exam.
    const isSprachbausteine = (p) =>
      p.board === "telc" && (p.modules || []).includes("sprachbausteine");
    const drillLabel = (p) => {
      const skills = p.skills || [];
      if (skills.includes("vocabulary")) return "Wortschatz";
      if (skills.includes("grammar")) return "Grammatik";
      return "Übung";
    };

    const goethePapers = papers.filter(p => p.board === "goethe");
    const telcPapers = papers.filter(p => p.board === "telc");
    const sbPapers = papers.filter(isSprachbausteine);
    const customPapers = papers.filter(p => p.board === "custom");

    // Filter tabs configuration
    const tabs = [
      { id: "all", label: `Alle (${papers.length + topics.length})` },
      { id: "goethe", label: `Goethe B2 (${goethePapers.length})` },
      { id: "telc", label: `telc B2 (${telcPapers.length})` },
    ];
    if (track === "reading" && sbPapers.length > 0) {
      tabs.push({ id: "sprachbausteine", label: `Sprachbausteine (${sbPapers.length})` });
    }
    if (customPapers.length > 0) {
      tabs.push({ id: "custom", label: `Übungen (${customPapers.length})` });
    }
    if (topics.length > 0) {
      tabs.push({ id: "themen", label: `Themen (${topics.length})` });
    }

    // Filter items to show
    let displayPapers = [];
    let displayTopics = [];

    if (skillFilter === "all") {
      displayPapers = papers;
      displayTopics = topics;
    } else if (skillFilter === "goethe") {
      displayPapers = goethePapers;
    } else if (skillFilter === "telc") {
      displayPapers = telcPapers;
    } else if (skillFilter === "sprachbausteine") {
      displayPapers = sbPapers;
    } else if (skillFilter === "custom") {
      displayPapers = customPapers;
    } else if (skillFilter === "themen") {
      displayTopics = topics;
    }

    // Papers ranked by the learner's weakest capabilities from her last test
    // (see b2/suggest.js). Only shown once she has sat one.
    const forYou = (suggested?.modules?.[track] || []).filter(s => !s.done);

    return (
      <div className="b2">
        <Bar onBack={() => setTrack(null)} section={meta.label} />
        <Well>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h1 className="b2-title" style={{ margin: 0 }}>{meta.label}</h1>
            <span style={{ font: "500 13px var(--b2-ui)", color: "var(--b2-muted)" }}>
              {papers.length + topics.length} Übungen &amp; Themen
            </span>
          </div>

          {/* One suggestion, one compact row — not a card with its own
              header and a list. Same footprint on every skill page, roughly
              what a small banner takes, never a second scrollful. */}
          {forYou[0] && (
            <button type="button" className="b2-suggested-compact"
              onClick={() => onExamPaper(forYou[0].paperId, sanitizeTitle(forYou[0].title))}>
              <Icon name="compass" size={16} />
              <span className="b2-suggested-compact-text">
                <span className="b2-suggested-compact-title">{sanitizeTitle(forYou[0].title)}</span>
                <span className="s">Suggested · {forYou[0].why}</span>
              </span>
              <span className="b2-row-go" aria-hidden="true">→</span>
            </button>
          )}

          {/* Filter Pills */}
          <div className="b2-filter-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={"b2-filter-tab" + (skillFilter === tab.id ? " active" : "")}
                onClick={() => setSkillFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loadingSkill ? (
            <div style={{ padding: "20px 0" }}>
              <div className="b2-skel s" />
              <div className="b2-skel s" />
            </div>
          ) : (
            <div className="b2-list">
              {/* Render Practice Papers */}
              {displayPapers.map(p => {
                const isSb = isSprachbausteine(p);
                const chipClass = p.board === "goethe" ? "goethe"
                  : isSb ? "sprachbausteine"
                  : p.board === "telc" ? "telc"
                  : "custom";
                const chipLabel = p.board === "goethe" ? "Goethe B2"
                  : isSb ? "Sprachbausteine"
                  : p.board === "telc" ? "telc B2"
                  : drillLabel(p);

                return (
                  <ListRow
                    key={p.id}
                    onClick={() => onExamPaper(p.id, sanitizeTitle(p.title))}
                    title={sanitizeTitle(p.title)}
                    meta={<>
                      <span className={`b2-board-chip ${chipClass}`}>{chipLabel}</span>
                      <span className="s">{p.item_count} Aufgaben · {p.minutes} Min</span>
                    </>}
                    trailing={<span className="b2-row-go" aria-hidden="true">→</span>}
                  />
                );
              })}

              {/* Render Curriculum Topics */}
              {displayTopics.map(t => (
                <ListRow
                  key={t.id}
                  onClick={() => onStart(t.id, t.nextSub)}
                  title={t.title}
                  meta={<>
                    <span className="b2-board-chip themen">Thema</span>
                    <span className="s">{t.capability || "Lerneinheit"}</span>
                  </>}
                  trailing={
                    <span className={"tag" + (t.complete ? " done" : "")}>
                      {t.complete ? "Done" : t.doneCount ? `${t.doneCount}/${t.total}` : `${t.minutes} min`}
                    </span>
                  }
                />
              ))}

              {displayPapers.length === 0 && displayTopics.length === 0 && (
                <div style={{ padding: 24, textAlign: "center", color: "var(--b2-muted)" }}>
                  Keine Übungen in dieser Kategorie gefunden.
                </div>
              )}
            </div>
          )}
        </Well>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────────────────────
     VIEW 2: FULL EXAM PAPERS ONLY (Goethe B2 & telc B2)
     Per specification: "the paper section should ONLY be full papers for telc
     or goethe, that's it".
     ────────────────────────────────────────────────────────────────────────── */
  if (showPapers) {
    const goetheFull = completePapers.filter(p => p.board === "goethe");
    const telcFull = completePapers.filter(p => p.board === "telc");

    let displayed = completePapers;
    if (papersFilter === "goethe") displayed = goetheFull;
    if (papersFilter === "telc") displayed = telcFull;

    return (
      <div className="b2">
        <Bar onBack={() => setShowPapers(false)} section="Exam Papers" />
        <Well>
          <div style={{ marginBottom: 4 }}>
            <h1 className="b2-title" style={{ margin: "0 0 4px" }}>Full Exam Papers</h1>
            <p style={{ font: "400 13px/1.4 var(--b2-ui)", color: "var(--b2-muted)", margin: 0 }}>
              Komplette Prüfungssimulationen für Goethe-Zertifikat B2 und telc B2 (alle Prüfungsteile in einem Durchgang).
            </p>
          </div>

          <div className="b2-filter-tabs">
            <button
              className={"b2-filter-tab" + (papersFilter === "all" ? " active" : "")}
              onClick={() => setPapersFilter("all")}
            >
              Alle ({completePapers.length})
            </button>
            <button
              className={"b2-filter-tab" + (papersFilter === "goethe" ? " active" : "")}
              onClick={() => setPapersFilter("goethe")}
            >
              Goethe B2 ({goetheFull.length})
            </button>
            <button
              className={"b2-filter-tab" + (papersFilter === "telc" ? " active" : "")}
              onClick={() => setPapersFilter("telc")}
            >
              telc B2 ({telcFull.length})
            </button>
          </div>

          <div className="b2-list">
            {displayed.map(p => {
              const chipClass = p.board === "goethe" ? "goethe" : "telc";
              const chipLabel = p.board === "goethe" ? "Goethe B2 Full" : "telc B2 Full";
              const moduleStr = (p.modules || []).map(m => {
                if (m === "lesen") return "Lesen";
                if (m === "hoeren") return "Hören";
                if (m === "sprachbausteine") return "Sprachbausteine";
                if (m === "schreiben") return "Schreiben";
                if (m === "sprechen") return "Sprechen";
                return m;
              }).join(" • ");

              return (
                <ListRow
                  key={p.id}
                  onClick={() => onExamPaper(p.id, sanitizeTitle(p.title))}
                  title={sanitizeTitle(p.title)}
                  meta={<>
                    <span className={`b2-board-chip ${chipClass}`}>{chipLabel}</span>
                    <span className="s">{moduleStr}</span>
                    <span className="s">{p.section_count} Abschnitte · {p.item_count} Aufgaben · {p.minutes} Min</span>
                  </>}
                  trailing={<span className="b2-row-go" aria-hidden="true">→</span>}
                />
              );
            })}
          </div>
        </Well>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────────────────────────
     VIEW 3: B2 HOME SCREEN
     1. Practice by skill (4 cards with full total counts)
     2. Full Exam Papers button (Goethe & telc complete exam simulations)
     ────────────────────────────────────────────────────────────────────────── */
  return (
    <div className="b2 b2-home-root">
      {/* Navbar — AppHeaderBar's real geometry: 64px navy, title/subtitle
          stack on the left, PlanPill + avatar on the right. `plan="free"` is
          the honest state — B2 has no purchase flow, so it never claims
          Premium (see the "Detailed report" lock elsewhere on this screen). */}
      <header className="b2-appbar">
        <div className="b2-appbar-text">
          <h1>B2 German Level</h1>
          <p>Goethe &amp; telc exam prep</p>
        </div>
        <div className="b2-appbar-right">
          <PlanPill plan="free" />
          <span className="b2-appbar-avatar" aria-hidden="true">
            <svg viewBox="0 0 100 100" width="28" height="28"><circle cx="50" cy="50" r="50" fill="#D1D5DB" /><circle cx="50" cy="38" r="16" fill="#9CA3AF" /><ellipse cx="50" cy="78" rx="28" ry="20" fill="#9CA3AF" /></svg>
          </span>
        </div>
      </header>

      {/* Mode row — ModeRail's geometry (57px, active tab white and 53px
          tall, inactive 44px at white/10). B2 only HAS the practice surface
          today; the other two are named and visible, matching the reference,
          but inert until Jobs/Classes exist for B2. */}
      <div className="b2-moderail">
        <button type="button" className="b2-moderail-tab active" aria-selected="true">
          <Icon name="clipboard" size={16} />
          <span className="b2-moderail-label"><span>Job</span><span>Preparation</span></span>
        </button>
        <span className="b2-moderail-tab soon" title="Not built for B2 yet">
          <Icon name="briefcase" size={16} />
          <span className="b2-moderail-label"><span>German</span><span>Jobs</span></span>
        </span>
        <span className="b2-moderail-tab soon" title="Not built for B2 yet">
          <Icon name="cap" size={16} />
          <span className="b2-moderail-label"><span>German</span><span>Classes</span></span>
        </span>
      </div>

      <div className="b2-home-sheet">
        <div className="b2-home-testslot">
          <TestCard progress={progress} nextVersion={nextVersion}
            onTakeAssessment={onTakeAssessment} onOpenTest={onOpenTest} />
        </div>
        <div className="b2-tile-grid b2-tile-grid-2col">
          {PRACTICE.map(t => (
            <PracticeTile key={t.key} title={t.label}
              caption={`${totalCountFor(t.key)} Übungen · ${t.blurb}`}
              image={t.image} onClick={() => setTrack(t.key)} />
          ))}
        </div>

        {/* Full Exam Papers — its own section below Practice, never mixed
            into the skill grid: a paper is a complete, timed sitting across
            every module, not a single-skill drill. Gold "Start" is a
            deliberate one-off (see comment on .b2-papers-banner-start in
            b2.css) — everywhere else in B2, gold stays out. */}
        <div className="b2-home-papers">
          <div className="b2-sec">Full Exam Papers</div>
          <div className="b2-papers-banner">
            <div className="b2-papers-banner-row">
              <div className="b2-papers-banner-text">
                <span className="b2-papers-banner-title">Timed Full Length Papers</span>
                <span className="b2-papers-banner-sub">Goethe &amp; telc · {completePapers.length} available</span>
              </div>
              <img className="b2-papers-banner-art" src="/b2/home/maya-banner.webp" alt="" aria-hidden="true" />
            </div>
            <button type="button" className="b2-papers-banner-start"
              onClick={() => { setPapersFilter("all"); setShowPapers(true); }}>
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
