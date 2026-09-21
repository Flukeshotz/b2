import { useEffect, useState } from "react";
import { b2 } from "../../lib/b2api";
import { Bar, Well } from "./Shell";
import Icon from "./Icon";
import B2Cta from "./B2Cta";
import StateMessage from "../../ds/components/StateMessage";
import ListRow from "../../ds/components/ListRow";
import LevelLadder from "../../ds/components/LevelLadder";
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

export default function B2Home({ onExit, onStart, onExamPaper, initialTrack = null }) {
  const [curriculum, setCurriculum] = useState(null);
  const [practiceCounts, setPracticeCounts] = useState({ reading: 0, listening: 0, writing: 0, speaking: 0 });
  const [completePapers, setCompletePapers] = useState([]);
  const [error, setError] = useState(null);

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
    ])
      .then(([curr, counts, complete]) => {
        setCurriculum(curr || []);
        setPracticeCounts(counts || { reading: 0, listening: 0, writing: 0, speaking: 0 });
        setCompletePapers(complete || []);
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
      {/* Navbar — AppHeaderBar's geometry (64px, brand navy, 16/12 title stack).
          The plan pill slot carries the A1 switch in PlanPill's styling; B2 has
          no plan state of its own to show. */}
      <header className="b2-appbar">
        <div className="b2-appbar-text">
          <h1>B2 German Level</h1>
          <p>Goethe &amp; telc exam prep</p>
        </div>
        {onExit && (
          <button type="button" className="b2-appbar-pill" onClick={onExit} title="Switch to Guided A1 German">
            A1 Path
          </button>
        )}
      </header>

      <div className="b2-home-sheet">
        <LevelLadder level="B2" />
        <div className="b2-tile-grid">
          {PRACTICE.map(t => (
            <PracticeTile key={t.key} title={t.label}
              caption={`${totalCountFor(t.key)} Übungen · ${t.blurb}`}
              image={t.image} onClick={() => setTrack(t.key)} />
          ))}
          <PracticeTile title="Exam Papers"
            caption={`${completePapers.length} Prüfungen · Goethe & telc`}
            image="/b2/home/tile-papers.webp?v=2" style={{ gridColumn: "span 2" }}
            onClick={() => { setPapersFilter("all"); setShowPapers(true); }} />
        </div>
      </div>
    </div>
  );
}
