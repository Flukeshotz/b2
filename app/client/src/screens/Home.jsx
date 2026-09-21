import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import RingSVG from "../components/RingSVG";
import { MayaSays } from "../components/Maya";
import { topicDoneCount, openTopicIndex, nextUnfinishedIndex } from "../lib/curriculum";

export default function Home({ topics, done, review, wordsOwned, onOpenTopic, onOpenSub, onPassport }) {
  const [portalTarget, setPortalTarget] = useState(null);
  useEffect(() => { setPortalTarget(document.getElementById("fixedBottom")); }, []);

  /* Unchanged unlock rule, moved into lib/curriculum.js so it can be
     regression-tested: the first unfinished topic is the only one open, and
     everything after it is locked. `topics` arrives already scoped to A1 —
     /curriculum defaults to level=a1 — so no B2 row can move this cursor. */
  const openIndex = openTopicIndex(topics, done);
  const nextIdx = nextUnfinishedIndex(topics, done);

  let greet;
  if (done.length === 0) greet = "Hi, I'm Maya. I'll be your companion.";
  else if (nextIdx < 0) greet = "You finished A1. You can hold a real conversation at a counter. That is not nothing.";
  else greet = <>You own <b>{wordsOwned} German words</b>. Next you'll learn to {topics[openIndex].title.toLowerCase()}.</>;

  return (
    <section className="screen on" id="home">
      <div className="hero">
        <div className="eyebrow">Learn German · For nurses</div>
        <MayaSays text={greet} mood={done.length ? "cheer" : "greet"} />
      </div>

      <div className="gate">
        <span className="lvl">A1</span><span className="ttl">Get through the day</span><span className="rule" />
      </div>
      <div className="path">
        {topics.map((t, i) => {
          const doneCount = topicDoneCount(t, done);
          const total = t.subs.length;
          const complete = doneCount === total;
          const next = i === openIndex && !complete;
          const locked = i > openIndex;
          return (
            <div key={t.id}>
              <div className="node-row">
                <div className="node-ring" id={`ring-${t.id}`}>
                  <RingSVG done={doneCount} total={total} size={74} />
                  <button className={`node ${complete ? "done" : ""} ${next ? "next" : ""}`}
                    disabled={locked} aria-label={t.title} onClick={() => onOpenTopic(t.id)}>
                    {complete ? "✓" : t.icon}
                  </button>
                </div>
              </div>
              <div className="node-label">{t.title}</div>
              {total > 1 && !locked && !complete && <div className="node-subs">{doneCount}/{total} parts</div>}
              {complete && (
                <div className="replay-row">
                  {t.subs.map(s => (
                    <button key={s.key} className="replay-pill" onClick={() => onOpenSub(t.id, s.key)}>
                      🔁 {s.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="node-cap">{complete ? t.capability : (locked ? " " : t.capability)}</div>
            </div>
          );
        })}
      </div>

      {portalTarget && createPortal(
        <div className="home-cta">
          {review.length > 0 && (
            <div className="review-note">🔁 {review.length} word{review.length > 1 ? "s" : ""} from before will show up in your next lesson</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            <button className="skiplink" style={{ alignSelf: "center", marginBottom: 2, background: "none", border: 0, color: "var(--text-dim)", cursor: "pointer", font: "600 13px/1 var(--ui)" }} onClick={onPassport}>
              🛂 View Nursing Passport
            </button>
            <button className="btn" style={{ width: "100%" }} onClick={() => onOpenTopic(topics[openIndex].id)}>
              {done.length ? "Continue" : "Start lesson 1"}
            </button>
          </div>
        </div>,
        portalTarget
      )}
    </section>
  );
}
