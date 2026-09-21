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

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const pct = latest?.measured ? Math.round((latest.correct / latest.measured) * 100) : 0;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="b2">
      <Bar onBack={onExit} section="Report" />
      <Well style={{ gap: 18, paddingBottom: 24 }}>
        {/* Header / Top gauge */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--b2-well)", padding: "14px 16px", borderRadius: 12 }}>
          {hasHistory ? (
            <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
              <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="36" cy="36" r={radius} fill="none" stroke="var(--b2-line)" strokeWidth="6" />
                <circle cx="36" cy="36" r={radius} fill="none" stroke="var(--b2-ok, #019035)" strokeWidth="6"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ font: "700 16px/1 var(--b2-font)", color: "var(--b2-ink)" }}>{pct}%</span>
              </div>
            </div>
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--b2-line)", display: "flex", alignItems: "center", justifyContent: "center", font: "600 20px/1 var(--b2-font)", color: "var(--b2-muted)" }}>
              —
            </div>
          )}
          <div>
            <h1 className="b2-title" style={{ fontSize: 18 }}>Where you stand</h1>
            <p className="b2-quiet" style={{ margin: "2px 0 0" }}>
              {hasHistory
                ? `Last sitting: ${latest.correct} of ${latest.measured} measured${latest.skipped ? ` · ${latest.skipped} skipped` : ""}`
                : "Take your first assessment to establish a baseline."}
            </p>
          </div>
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

        {/* 2 — THE SIX-DIMENSION PROFILE */}
        <div>
          <div className="b2-sec">Skills measured so far</div>
          <div className="b2-list">
            {profile.map(p => (
              <div key={p.dimension} className="b2-row" aria-disabled="true" style={{ cursor: "default" }}>
                <span className="tx">
                  <span className="t">{SKILL_EN[p.dimension] || p.dimension}</span>
                  <span className="s">{p.label}</span>
                </span>
                {p.trend && p.band && (
                  <span className="tag">{p.trend === "up" ? "↑" : p.trend === "down" ? "↓" : "→"}</span>
                )}
              </div>
            ))}
          </div>
        </div>

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
