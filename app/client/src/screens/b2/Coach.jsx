import { useEffect, useState } from "react";
import { b2 } from "../../lib/b2api";
import { Bar, Well, Foot } from "./Shell";
import B2Cta from "./B2Cta";
import StateMessage from "../../ds/components/StateMessage";
import ListRow from "../../ds/components/ListRow";

/* THE COACH.
   ═══════════════════════════════════════════════════════════════════════════
   Four fixed questions, four answers straight from `b2/coach.js` — no chat
   input, no free text, no LLM. Every sentence traces back to the report; this
   component only lays them out under their questions. */

const QUESTIONS = [
  { q: "What am I weak at?", key: "whatAmIWeakAt" },
  { q: "Why?", key: "why" },
  { q: "What should I practise?", key: "whatToPractise" },
  { q: "What changed?", key: "whatChanged" },
];

export default function Coach({ onExit, onPractise, onRetest }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    b2.getCoach().then(setData).catch(() => setError("Couldn't load the coach. Check your connection and try again."));
  };
  useEffect(load, []);

  if (error) {
    return (
      <div className="b2">
        <Bar onBack={onExit} section="Coach" />
        <Well><StateMessage state="error" message={error} /><B2Cta onClick={load}>Try again</B2Cta></Well>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="b2">
        <Bar onBack={onExit} section="Coach" />
        <Well><div className="b2-skel" /><div className="b2-skel s" /></Well>
      </div>
    );
  }

  return (
    <div className="b2">
      <Bar onBack={onExit} section="Coach" />
      <Well style={{ gap: 16 }}>
        <h1 className="b2-title">Your B2 coach</h1>
        <p className="b2-quiet">Built only from your own assessment and practice evidence — not a general chat.</p>

        {QUESTIONS.map(({ q, key }) => (
          <div key={key} className="b2-panel">
            <div className="b2-sec">{q}</div>
            <p className="b2-quiet" style={{ marginTop: 6, color: "var(--b2-ink)" }}>{data[key]}</p>
          </div>
        ))}

        {data.recommendation && (
          <div className="b2-list">
            <ListRow onClick={() => onPractise(data.recommendation.topicId, data.recommendation.subKey || "main")}
              title={data.recommendation.title}
              meta={data.recommendation.reason && <span className="s">{data.recommendation.reason}</span>}
              trailing={<span className="tag">{data.recommendation.minutes} min</span>} />
          </div>
        )}
      </Well>

      <Foot>
        {onRetest && data.retestAvailable && (
          <B2Cta ghost onClick={onRetest}>
            Retest (Comparable Assessment) →
          </B2Cta>
        )}
        <B2Cta onClick={onExit}>Done</B2Cta>
      </Foot>
    </div>
  );
}
