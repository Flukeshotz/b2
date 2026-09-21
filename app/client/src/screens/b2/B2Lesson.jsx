import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { b2 } from "../../lib/b2api";
import Lesson from "../Lesson";
import { Bar, Well } from "./Shell";
import B2Cta from "./B2Cta";
import StateMessage from "../../ds/components/StateMessage";

/* B2 lessons run on the A1 lesson engine. Unmodified — same Lesson.jsx, same
   nineteen step components, same review injection. The only thing this wrapper
   does is fetch the state Lesson needs and own the completion call, so B2 can
   reach the engine without App.jsx having to know B2 exists.
   
   It is also the proof the level split was worth doing: B2 content, B2 door,
   zero duplicated lesson machinery. */

export default function B2Lesson({ topicId, subKey, onExit, onDone }) {
  const [state, setState] = useState(null);
  const [topic, setTopic] = useState(null);
  const [all, setAll] = useState([]);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    Promise.all([b2.getCurriculum(), api.getState()])
      .then(([topics, s]) => {
        const t = topics.find(x => x.id === topicId);
        if (!t) return setError("That lesson isn't available. Go back and pick another.");
        // All B2 topics, not just this one: review decoys and eligibility are
        // drawn from the whole level, the same way A1 draws from its thirty.
        setTopic(t); setAll(topics); setState(s);
      })
      .catch(() => setError("Couldn't load the lesson. Check your connection and try again."));
  };
  useEffect(load, [topicId]);

  if (error) {
    return (
      <div className="b2">
        <Bar onBack={onExit} section="German B2" />
        <Well>
          <StateMessage state="error" message={error} />
          <B2Cta onClick={load}>Try again</B2Cta>
        </Well>
      </div>
    );
  }
  if (!topic || !state) {
    return (
      <div className="b2">
        <Bar onBack={onExit} section="German B2" />
        <Well><div className="b2-skel" /><div className="b2-skel s" /></Well>
      </div>
    );
  }

  const sub = topic.subs.find(s => s.key === subKey) || topic.subs[0];

  /* Lesson portals its footer — the Check / Continue button, and Chat's own
     composer — into #fixedBottom, and renders its body inside #stage. Both live
     in App.jsx's A1 branch, which never renders when B2 owns the frame. Without
     them the lesson appeared with no way to answer anything.

     Reproduced here rather than hoisted into App.jsx: A1's branch is untouched,
     and B2 carries the scaffolding its own screens need. */
  return (
    <>
      <div id="stage" className="b2-step">
    <Lesson
      topics={all}
      target={{ topic, sub }}
      userName={state.name}
      stats={state.stats}
      review={state.review}
      tone="exam"
      onExit={onExit}
      /* Same endpoint A1 posts to — user_progress is shared, keyed by
         (user_id, topic_id, sub_key), and needs nothing B2-specific. */
      onFinishSub={async ({ topic: t, sub: s }) => {
        await api.completeSub(t.id, s.key);
        onDone();
      }}
      onPushReview={(de, en, icon) => api.pushReview(de, en, icon)}
      onRemoveReview={(de) => api.removeReview(de)}
      onCooldown={(kind) => api.setCooldown(kind)}
      /* Explain-my-answer is an A1 affordance wired through App.jsx's own
         sheet. B2 carries no such screen, so the button is not offered at all —
         Lesson hides it when no handler is passed. */
    />
      </div>
      <div id="fixedBottom" className="b2-step" />
    </>
  );
}
