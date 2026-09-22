import { useEffect, useState } from "react";
import { b2 } from "../../lib/b2api";
import { Bar, Well } from "./Shell";
import B2Cta from "./B2Cta";
import Icon from "./Icon";
import StateMessage from "../../ds/components/StateMessage";

/* THE TEST SCREEN — test-first. Home's banner opens here.

   Top to bottom:
   1. Take your next test (Test N of 10) — the primary action.
   2. Your last test — basic scores: overall %, one bar per taught skill,
      a one-line summary. The item-by-item breakdown is a locked row.
   3. Practise next — one paper per weak skill, from b2/suggest.js.
   4. Previous tests — each shows its basic score; its report is locked.

   "Premium"/locked rows are placeholders: no payment provider is wired in,
   and the note says so rather than faking a purchase. */

const VERSION_LABEL = (v) => {
  if (!v) return "";
  const m = /^core-2026b-v(\d+)$/.exec(v);
  return m ? `Test ${m[1]}` : v;
};

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

// The 4 skills B2 teaches (matching the Home tiles), in this fixed order.
// Reading and Listening get a real bar from this sitting's objective score.
// Writing and Speaking are rubric/transcript items with no answer key yet
// (see blueprint.js) — the assessment captures them but doesn't score them,
// so they show as "Not measured yet" rather than a fabricated number. Wiring
// real writing/speech scoring into the diagnostic is follow-up engineering
// work, not a screens change.
const SKILL_ORDER = ["reading", "listening", "writing", "speaking"];
const SKILL_EN = { reading: "Reading", listening: "Listening", writing: "Writing", speaking: "Speaking" };
// Same thresholds b2/profile.js bands a skill with (good ≥62%, developing ≥42%).
const bandOf = (score) => score >= 0.62 ? "good" : score >= 0.42 ? "developing" : "needs_practice";
const bandColor = (band) => band === "good" ? "var(--b2-ok)" : band === "developing" ? "var(--b2-warn)" : "var(--b2-bad)";

export default function TestHub({ onExit, onTakeAssessment, onOpenPaper }) {
  const [history, setHistory] = useState(null);
  const [nextVersion, setNextVersion] = useState(undefined);
  const [progress, setProgress] = useState(null);
  const [suggested, setSuggested] = useState(null);
  const [error, setError] = useState(null);
  const [premiumNote, setPremiumNote] = useState(false);

  const load = () => {
    setError(null);
    Promise.all([
      b2.getAssessmentHistory().catch(() => []),
      b2.getCurrentDiagnostic().catch(() => ({ version: null })),
      b2.getAssessmentProgress().catch(() => null),
      b2.getSuggestedPractice().catch(() => null),
    ])
      .then(([h, d, p, sg]) => { setHistory(h || []); setNextVersion(d?.version ?? null); setProgress(p || null); setSuggested(sg || null); })
      .catch(() => setError("Couldn't load your tests. Check your connection and try again."));
  };
  useEffect(load, []);

  if (error) {
    return (
      <div className="b2">
        <Bar onBack={onExit} section="Your Test" />
        <Well><StateMessage state="error" message={error} /><B2Cta onClick={load}>Try again</B2Cta></Well>
      </div>
    );
  }
  if (history === null || nextVersion === undefined) {
    return (
      <div className="b2">
        <Bar onBack={onExit} section="Your Test" />
        <Well><div className="b2-skel" /><div className="b2-skel s" /><div className="b2-skel s" /></Well>
      </div>
    );
  }

  const completed = history.filter(h => h.status === "completed");
  const latest = completed[0] || null;
  // Every earlier sitting: basic score visible, detailed report locked.
  const earlier = completed.slice(1);
  const pct = (h) => Math.round((h.score ?? 0) * 100);
  const radius = 44, circumference = 2 * Math.PI * radius;
  const ringColor = (p) => p >= 62 ? "var(--b2-ok)" : p >= 42 ? "var(--b2-warn)" : "var(--b2-bad)";

  // Per-skill bars + a one-line verdict, both for THIS sitting specifically
  // (progress.latest.bySkill), never the blended-across-attempts profile —
  // that number would not match the ring above it.
  const bySkill = progress?.latest?.bySkill || {};
  // Every taught skill gets a row; only the ones this sitting actually
  // measured get a real bar. The rest read "Not measured yet" — never a
  // fabricated score for writing/speaking (see the note on SKILL_ORDER).
  const skillRows = SKILL_ORDER.map(s => {
    const m = bySkill[s];
    return m?.measured > 0
      ? { skill: s, score: m.score, measured: m.measured, band: bandOf(m.score), measuredHere: true }
      : { skill: s, score: null, measured: 0, band: null, measuredHere: false };
  });
  const byBand = (b) => skillRows.filter(r => r.band === b).map(r => SKILL_EN[r.skill]);
  const good = byBand("good"), developing = byBand("developing"), weak = byBand("needs_practice");
  const say = (names, verb, rest) => names.length
    ? `${names.join(" and ")} ${names.length > 1 ? verb.pl : verb.sg} ${rest}` : null;
  // Test-first: which sitting is next, out of the ten comparable versions.
  const TOTAL_TESTS = 10;
  const nextNumber = Math.min(completed.length + 1, TOTAL_TESTS);

  // PRACTISE NEXT — one suggested paper per skill (b2/suggest.js ranks them
  // by this learner's weakest capabilities), ordered weakest skill first.
  // Skills this test didn't score (writing/speaking) come after the scored ones.
  const skillScore = (s) => (bySkill[s]?.measured > 0 ? bySkill[s].score : 2);
  const practiseNext = SKILL_ORDER
    .map(s => ({ skill: s, paper: suggested?.modules?.[s]?.[0] }))
    .filter(x => x.paper)
    .sort((a, b) => skillScore(a.skill) - skillScore(b.skill))
    .slice(0, 3);
  const cleanTitle = (t) => (t || "").replace(/^(goethe(-zertifikat)?|telc)(\s+deutsch)?\s*(b2)?\s*—\s*/i, "").trim();

  const verdictParts = [
    say(good, { sg: "is", pl: "are" }, "good."),
    say(developing, { sg: "is", pl: "are" }, "coming along."),
    say(weak, { sg: "needs", pl: "need" }, "more practice."),
  ].filter(Boolean);

  return (
    <div className="b2">
      <Bar onBack={onExit} section="Your Test" />
      <Well style={{ gap: 18, paddingBottom: 24 }}>
        {!latest ? (
          <>
            <StateMessage state="empty" message="You haven't taken a test yet — fifteen minutes tells you where you stand." />
            <B2Cta onClick={onTakeAssessment}>Take your first test</B2Cta>
          </>
        ) : (
          <>
            {/* 1 — THE TEST. Primary action on this screen, at the top. */}
            {nextVersion && (
              <div className="b2-testhub-hero">
                <span className="b2-testhub-hero-kicker">Test {nextNumber} of {TOTAL_TESTS}</span>
                <span className="b2-testhub-hero-title">Take your next test</span>
                <span className="b2-testhub-hero-sub">15 minutes · Reading, Listening, Writing, Speaking</span>
                <B2Cta onClick={onTakeAssessment}>Start test →</B2Cta>
              </div>
            )}

            {/* 2 — LAST TEST, basic scores only. Compact: a score line and the
                per-skill bars. The item-by-item version is the locked row. */}
            <div className="b2-card b2-testhub-last">
              <div className="b2-testhub-last-head">
                <div className="b2-testhub-ring" style={{ width: 56, height: 56 }}>
                  <svg width="56" height="56" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--b2-line)" strokeWidth="10" />
                    <circle cx="48" cy="48" r={radius} fill="none" stroke={ringColor(pct(latest))} strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - (pct(latest) / 100) * circumference}
                      strokeLinecap="round" />
                  </svg>
                  <span className="b2-testhub-ring-pct small">{pct(latest)}%</span>
                </div>
                <span className="b2-testhub-last-text">
                  <span className="b2-testhub-last-title">Your last test</span>
                  <span className="b2-testhub-label">{VERSION_LABEL(latest.version)} · {fmtDate(latest.completedAt)}</span>
                </span>
              </div>

              <div className="b2-skillbars">
                {skillRows.map(r => (
                  <div key={r.skill} className={"b2-skillbar" + (r.measuredHere ? "" : " unmeasured")}>
                    <div className="b2-skillbar-head">
                      <span className="b2-skillbar-name">{SKILL_EN[r.skill]}</span>
                      {r.measuredHere ? (
                        <span className="b2-skillbar-val" style={{ color: bandColor(r.band) }}>
                          {Math.round(r.score * 100)}%
                        </span>
                      ) : (
                        <span className="b2-skillbar-val muted">Not measured yet</span>
                      )}
                    </div>
                    <div className="b2-skillbar-track">
                      {r.measuredHere && (
                        <div className="b2-skillbar-fill" style={{ width: `${Math.round(r.score * 100)}%`, background: bandColor(r.band) }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {verdictParts.length > 0 && (
                <p className="b2-testhub-verdict">{verdictParts.join(" ")}</p>
              )}

              <button type="button" className="b2-locked-card b2-testhub-detail" onClick={() => setPremiumNote(v => !v)}>
                <span className="b2-locked-icon"><Icon name="lock" size={16} /></span>
                <span className="b2-locked-text">
                  <span className="b2-locked-title">Detailed report</span>
                  <span className="b2-locked-sub">Item-by-item breakdown for this test</span>
                </span>
                <span className="b2-premium-badge">Premium</span>
              </button>
              {premiumNote && (
                <p className="b2-test-note">
                  A deeper, item-by-item report is planned but not yet available to buy —
                  this screen doesn't process payments.
                </p>
              )}
            </div>

            {/* 3 — PRACTISE NEXT: topics picked from the weakest skills above. */}
            {practiseNext.length > 0 && (
              <div className="b2-testhub-section">
                <div className="b2-sec">Practise next</div>
                <div className="b2-card b2-testhub-list">
                  {practiseNext.map((x, i) => (
                    <button key={x.paper.paperId} type="button"
                      className={"b2-testhub-row" + (i > 0 ? " sep" : "")}
                      onClick={() => onOpenPaper?.(x.paper.paperId, cleanTitle(x.paper.title))}>
                      <span className="b2-testhub-row-text">
                        <span className="b2-testhub-row-title">{cleanTitle(x.paper.title)}</span>
                        <span className="b2-testhub-row-sub">{SKILL_EN[x.skill]} · {x.paper.why}</span>
                      </span>
                      <span className="b2-row-go" aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4 — PREVIOUS TESTS: basic score visible, detailed report locked. */}
            {earlier.length > 0 && (
              <div className="b2-testhub-section">
                <div className="b2-sec">Previous tests</div>
                <div className="b2-card b2-testhub-list">
                  {earlier.map((h, i) => (
                    <div key={h.attemptId} className={"b2-testhub-row static" + (i > 0 ? " sep" : "")}>
                      <span className="b2-testhub-prev-score" style={{ color: ringColor(pct(h)) }}>{pct(h)}%</span>
                      <span className="b2-testhub-row-text">
                        <span className="b2-testhub-row-title">{VERSION_LABEL(h.version)}</span>
                        <span className="b2-testhub-row-sub">{fmtDate(h.completedAt)}</span>
                      </span>
                      <span className="b2-testhub-lockpill"><Icon name="lock" size={11} /> Report</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Well>
    </div>
  );
}
