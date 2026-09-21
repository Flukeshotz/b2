import { Bar, Well, Foot } from "./Shell";
import B2Cta from "./B2Cta";

/* WHERE YOU STAND, FROM THIS SITTING.
   ═══════════════════════════════════════════════════════════════════════════
   What this screen is NOT allowed to be: a score. There is no Goethe number, no
   telc number, no pass probability, no CEFR level and no mastery percentage,
   because none of them is defensible on nineteen items and no calibration
   exists. It says what was measured, what was not, and what to do next.

   WHAT WAS NOT MEASURED IS GIVEN THE SAME WEIGHT AS WHAT WAS. A learner who
   skipped listening has not failed listening — she has an unanswered question,
   and the screen has to say that rather than leaving a silent gap she will read
   as a bad result. */

const LABEL = { grammar: "Grammatik", vocabulary: "Wortschatz", reading: "Lesen",
                listening: "Hören", writing: "Schreiben", speaking: "Sprechen" };
const EN = { grammar: "Grammar", vocabulary: "Vocabulary", reading: "Reading",
             listening: "Listening", writing: "Writing", speaking: "Speaking" };

export default function AssessmentResult({ result, onPractise, onHome, onReport }) {
  if (!result) return null;
  const { measured, skipped, measuredAreas = [], notMeasured = [],
          stronger = [], practiseNext = [], recommendation } = result;

  const totalQuestions = measured + (skipped || 0);
  const pct = totalQuestions > 0 ? Math.round((measured / totalQuestions) * 100) : 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="b2">
      <Bar section="Your result" />
      <Well style={{ gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "12px 0 6px" }}>
          <div style={{ position: "relative", width: 96, height: 96, marginBottom: 12 }}>
            <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--b2-line)" strokeWidth="8" />
              <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--b2-ok, #019035)" strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.6s ease" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ font: "700 20px/1 var(--b2-font)", color: "var(--b2-ink)" }}>{measured}</span>
              <span style={{ font: "500 11px/1 var(--b2-ui)", color: "var(--b2-muted)", marginTop: 2 }}>measured</span>
            </div>
          </div>
          <h1 className="b2-title" style={{ textAlign: "center" }}>Where you stand</h1>
          <p className="b2-quiet" style={{ textAlign: "center", maxWidth: 320 }}>
            {measured} question{measured === 1 ? "" : "s"} measured
            {skipped ? `, ${skipped} skipped` : ""}. This is a diagnostic sitting, not an exam score.
          </p>
        </div>

        {measuredAreas.length > 0 && (
          <div>
            <div className="b2-sec">What we measured</div>
            <div className="b2-list">
              {measuredAreas.map(a => (
                <div key={a.skill} className="b2-row" aria-disabled="true">
                  <span className="tx">
                    <span className="t">{EN[a.skill] || a.skill}</span>
                    <span className="s">{LABEL[a.skill]}</span>
                  </span>
                  {/* A count, never a percentage — "4 of 6" is a fact about this
                      sitting; "67%" invites being read as a level. */}
                  <span className="tag">{a.correct} von {a.measured}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {notMeasured.length > 0 && (
          <div>
            <div className="b2-sec">Not measured yet</div>
            <div className="b2-list">
              {notMeasured.map(s => (
                <div key={s} className="b2-row soon" aria-disabled="true">
                  <span className="tx">
                    <span className="t">{EN[s] || s}</span>
                    {/* THREE DIFFERENT REASONS, NOT ONE.
                        "Not measured" can mean she skipped it, or that the
                        component is judged by a person rather than a key, or
                        that we do not measure it at all yet. Collapsing them
                        lets a learner read "not measured" as "you failed to do
                        it", and lets speaking look like something she missed
                        rather than something we have not built. */}
                    <span className="s">
                      {s === "speaking"
                        ? "Not measured yet — speaking isn't part of your result."
                        : s === "writing"
                          ? "Judged separately — it doesn't count towards this number."
                          : "You skipped these, so they don't count either way."}
                    </span>
                  </span>
                  <span className="tag">—</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stronger.length > 0 && (
          <div>
            <div className="b2-sec">Stronger here</div>
            <p className="b2-quiet">{stronger.map(s => EN[s] || s).join(" · ")}</p>
          </div>
        )}

        {practiseNext.length > 0 && (
          <div>
            <div className="b2-sec">Worth practising</div>
            <p className="b2-quiet">{practiseNext.map(s => EN[s] || s).join(" · ")}</p>
          </div>
        )}

        {recommendation && (
          <div>
            <div className="b2-sec">Start with this</div>
            <div className="b2-list">
              <button className="b2-row" onClick={() => onPractise(recommendation.topicId)}>
                <span className="tx">
                  <span className="t">{recommendation.title}</span>
                  {recommendation.reason && <span className="s">{recommendation.reason}</span>}
                </span>
                <span className="tag">{recommendation.minutes} min</span>
              </button>
            </div>
          </div>
        )}
      </Well>
      <Foot>
        {onReport && (
          <B2Cta ghost onClick={onReport}>See Where You Stand (Report) →</B2Cta>
        )}
        <B2Cta onClick={onHome}>Done</B2Cta>
      </Foot>
    </div>
  );
}
