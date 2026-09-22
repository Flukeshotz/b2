import { useEffect, useState } from "react";
import { b2 } from "../../lib/b2api";
import { Bar, Well, Foot } from "./Shell";
import B2Cta from "./B2Cta";
import StateMessage from "../../ds/components/StateMessage";
import ListRow from "../../ds/components/ListRow";

/* THE PERFORMANCE REPORT.
   ═══════════════════════════════════════════════════════════════════════════
   Everything here is a read of `b2/report.js` — nothing is computed in this
   component. No Goethe/telc score, no CEFR claim, no pass probability: this
   screen says what was measured, what changed, and what to do next, in the
   same honest register as AssessmentResult. */

const SKILL_EN = { grammar: "Grammar", vocabulary: "Vocabulary", reading: "Reading",
                   listening: "Listening", writing: "Writing", speaking: "Speaking" };

export default function Report({ onExit, onPractise, onRetest }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    b2.getReport().then(setData).catch(() => setError("Couldn't load your report. Check your connection and try again."));
  };
  useEffect(load, []);

  if (error) {
    return (
      <div className="b2">
        <Bar onBack={onExit} section="Report" />
        <Well><StateMessage state="error" message={error} /><B2Cta onClick={load}>Try again</B2Cta></Well>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="b2">
        <Bar onBack={onExit} section="Report" />
        <Well><div className="b2-skel" /><div className="b2-skel s" /><div className="b2-skel s" /></Well>
      </div>
    );
  }

  const { assessment, profile, capabilities, recommendation } = data;
  const latest = assessment.latest;
  const hasHistory = !!latest;

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const pct = latest?.measured ? Math.round((latest.correct / latest.measured) * 100) : 0;
  const strokeDashoffset = circumference - (pct / 100) * circumference;
  // Same band thresholds the profile itself uses (b2/profile.js) — the ring's
  // colour is never a separate judgement from the row colours below it.
  const bandColor = (band) => band === "good" ? "var(--b2-ok)" : band === "developing" ? "var(--b2-warn)" : "var(--b2-bad)";
  const overallBand = pct >= 62 ? "good" : pct >= 42 ? "developing" : "needs_practice";
  // Best- and worst-measured dimensions with real evidence, for the two
  // feedback cards. `indicative`/null-score rows (speaking today) are
  // excluded — nothing is said about a dimension that was not measured.
  const scored = profile.filter(p => p.score !== null && !p.indicative);
  const best = scored.length ? scored.reduce((a, b) => (b.score > a.score ? b : a)) : null;
  const worst = scored.length ? scored.reduce((a, b) => (b.score < a.score ? b : a)) : null;

  return (
    <div className="b2">
      <Bar onBack={onExit} section="Report" />
      <Well style={{ gap: 18, paddingBottom: 24 }}>
        {/* Header / big ring — this is the ONLY place the full score lives;
            the home screen carries just the compact card that links here. */}
        <div className="b2-report-hero">
          {hasHistory ? (
            <>
              <div className="b2-report-ring" style={{ width: 140, height: 140 }}>
                <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--b2-line)" strokeWidth="10" />
                  <circle cx="70" cy="70" r={radius} fill="none" stroke={bandColor(overallBand)} strokeWidth="10"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                </svg>
                <div className="b2-report-ring-label">
                  <span className="b2-report-ring-pct">{pct}%</span>
                  <span className="b2-report-ring-sub">of measured questions</span>
                </div>
              </div>
              <p className="b2-quiet" style={{ margin: "10px 0 0", textAlign: "center" }}>
                Last sitting: {latest.correct} of {latest.measured} measured
                {latest.skipped ? ` · ${latest.skipped} skipped` : ""}. This is Skillcase practice, not an official score.
              </p>
            </>
          ) : (
            <>
              <div className="b2-report-ring" style={{ width: 140, height: 140, background: "var(--b2-well)", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ font: "600 20px/1 var(--b2-font)", color: "var(--b2-muted)" }}>—</span>
              </div>
              <p className="b2-quiet" style={{ margin: "10px 0 0", textAlign: "center" }}>Take your first assessment to establish a baseline.</p>
            </>
          )}
        </div>

        {/* 1 — LATEST vs PREVIOUS. Deterministic comparison */}
        {hasHistory && (
          <div className="b2-panel">
            <div className="b2-sec">Assessment Progress</div>
            {assessment.delta ? (
              <p className="b2-quiet" style={{ marginTop: 6, fontWeight: 500, color: "var(--b2-ink)" }}>
                {assessment.delta.claim}
              </p>
            ) : (
              <p className="b2-quiet" style={{ marginTop: 6 }}>{assessment.reason}</p>
            )}
            {assessment.skills && assessment.skills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {assessment.skills.filter(s => s.direction === "up" || s.direction === "down").map(s => (
                  <span key={s.skill} className="b2-row tag" style={{ display: "inline-flex", padding: "4px 8px", fontSize: 12 }}>
                    {SKILL_EN[s.skill] || s.skill} {s.direction === "up" ? "↑" : "↓"}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2 — THE SIX-DIMENSION PROFILE, as coloured bars: the same band the
            row's own label already says (good/developing/needs_practice),
            just also shown as a fill. A dimension with no evidence yet
            (speaking today) gets an empty track and its own line, never a
            fabricated bar. */}
        <div>
          <div className="b2-sec">Skills measured so far</div>
          <div className="b2-skillbars">
            {profile.map(p => (
              <div key={p.dimension} className="b2-skillbar">
                <div className="b2-skillbar-head">
                  <span className="b2-skillbar-name">{SKILL_EN[p.dimension] || p.dimension}</span>
                  <span className="b2-skillbar-val" style={p.score !== null ? { color: bandColor(p.band) } : null}>
                    {p.score !== null ? `${Math.round(p.score * 100)}%` : p.label}
                  </span>
                </div>
                <div className="b2-skillbar-track">
                  {p.score !== null && (
                    <div className="b2-skillbar-fill" style={{ width: `${Math.round(p.score * 100)}%`, background: bandColor(p.band) }} />
                  )}
                </div>
                <span className="b2-skillbar-sub">
                  {p.score !== null ? `${p.label} · ${p.evidence_n} measured` : p.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2b — "WHAT WENT WELL" / "TRY TO IMPROVE" — the two ends of the same
            `profile` array above, not a separate judgement and never a
            fabricated sub-skill (no invented Pronunciation/Fluency split —
            B2 speaking is transcript-only and stays out of this pair). */}
        {(best || worst) && (
          <div className="b2-feedback-pair">
            {best && (
              <div className="b2-feedback-card good">
                <span className="b2-feedback-icon">👍</span>
                <div>
                  <p className="b2-feedback-title">What went well</p>
                  <p className="b2-feedback-body">
                    {SKILL_EN[best.dimension] || best.dimension} is your strongest measured skill —
                    {" "}{Math.round(best.score * 100)}% over {best.evidence_n} items ({best.label.toLowerCase()}).
                  </p>
                </div>
              </div>
            )}
            {worst && worst !== best && (
              <div className="b2-feedback-card bad">
                <span className="b2-feedback-icon">💡</span>
                <div>
                  <p className="b2-feedback-title">Try to improve</p>
                  <p className="b2-feedback-body">
                    {SKILL_EN[worst.dimension] || worst.dimension} needs the most work —
                    {" "}{Math.round(worst.score * 100)}% over {worst.evidence_n} items ({worst.label.toLowerCase()}).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3 — 14 CANONICAL CAPABILITIES BREAKDOWN */}
        <div>
          <div className="b2-sec">Reliable capabilities (≥3 items)</div>
          {capabilities.reliable && capabilities.reliable.length > 0 ? (
            <div className="b2-list">
              {capabilities.reliable.map(c => (
                <div key={c.id} className="b2-row" aria-disabled="true" style={{ cursor: "default" }}>
                  <span className="tx">
                    <span className="t">{c.label}</span>
                    <span className="s">{c.learner}</span>
                  </span>
                  <span className="tag done">
                    {c.movement === "up" ? "↑ " : c.movement === "down" ? "↓ " : ""}{c.items} items
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="b2-quiet">No capabilities have reached the 3-item reliability floor yet.</p>
          )}
        </div>

        {capabilities.emerging && capabilities.emerging.length > 0 && (
          <div>
            <div className="b2-sec">Emerging capabilities (1–2 items)</div>
            <div className="b2-list">
              {capabilities.emerging.map(c => (
                <div key={c.id} className="b2-row soon" aria-disabled="true" style={{ cursor: "default" }}>
                  <span className="tx">
                    <span className="t">{c.label}</span>
                    <span className="s">{c.learner}</span>
                  </span>
                  <span className="tag">{c.items} measured</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4 — ONE RECOMMENDATION */}
        {recommendation && (
          <div>
            <div className="b2-sec">Start with this</div>
            <div className="b2-list">
              <ListRow onClick={() => onPractise(recommendation.topicId, recommendation.subKey || "main")}
                title={recommendation.title}
                meta={recommendation.reason && <span className="s">{recommendation.reason}</span>}
                trailing={<span className="tag">{recommendation.minutes} min</span>} />
            </div>
          </div>
        )}
      </Well>

      <Foot>
        {onRetest && (
          <B2Cta ghost onClick={onRetest}>
            Retest (Comparable Assessment) →
          </B2Cta>
        )}
        <B2Cta onClick={onExit}>Done</B2Cta>
      </Foot>
    </div>
  );
}
