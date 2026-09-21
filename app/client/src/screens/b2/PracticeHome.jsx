import { useEffect, useState } from "react";
import { b2 } from "../../lib/b2api";
import { Bar, Well } from "./Shell";
import Icon from "./Icon";
import StateMessage from "../../ds/components/StateMessage";
import ListRow from "../../ds/components/ListRow";

/* PRACTICE MODE — targeted skill/capability drilling, genuinely separate from
   EXAM PRACTICE (Goethe/telc papers on Home). Grammar/Vocabulary — and now
   Reading/Speaking/Writing, once `board='custom'` papers exist for them —
   route into the practice-paper bank via the same /paper/* attempt engine
   exam-practice already uses; where a skill ALSO has curriculum-track
   content (the Homeoffice reading experience, Maya, the writing loop), that
   stays reachable as its own row rather than being silently replaced.
   Workplace routes into the existing interview question bank. Nothing here
   is a new engine — only discovery/routing, and it stays driven by what
   `practice.js`'s categories() actually reports rather than a hardcoded
   per-skill list, so a newly-seeded paper for any skill becomes reachable
   here without a client change. */

const ICON = { reading: "file", listening: "headphones", speaking: "chat",
               writing: "pen", grammar: "ruler", vocabulary: "cap", workplace: "briefcase" };

function Loading() {
  return (
    <div className="b2">
      <Bar section="Practice" />
      <Well><div className="b2-skel" /><div className="b2-skel s" /></Well>
    </div>
  );
}

/**
 * @param {{onExit, onOpenTrack: (track:string)=>void, onOpenPaper: (paperId:string,label:string)=>void,
 *          onWorkplace: ()=>void, onTakeAssessment: ()=>void}} props
 */
export default function PracticeHome({ onExit, onOpenTrack, onOpenPaper, onWorkplace, onTakeAssessment }) {
  const [curriculum, setCurriculum] = useState(null);
  const [categories, setCategories] = useState(null);
  const [weak, setWeak] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    Promise.all([b2.getCurriculum(), b2.getPracticeCategories(), b2.getWeakArea().catch(() => null)])
      .then(([c, cats, w]) => { setCurriculum(c); setCategories(cats); setWeak(w); })
      .catch(() => setError("Couldn't load Practice. Check your connection and try again."));
  };
  useEffect(load, []);

  if (error) {
    return (
      <div className="b2">
        <Bar onBack={onExit} section="Practice" />
        <Well><StateMessage state="error" message={error} /></Well>
      </div>
    );
  }
  if (!curriculum || !categories) return <Loading />;

  const trackCount = (key) => curriculum.filter(t => t.track === key).length;
  const TRACK_SKILLS = ["reading", "listening", "speaking", "writing"];

  /* One row per REAL destination, not one row per skill. A skill can now have
     both a curriculum track (Homeoffice reading, Maya, the writing loop) and
     one or more practice-bank papers at once — Grammar/Vocabulary have always
     had several papers, and collapsing to `papers[0]` silently stranded every
     paper after the first. Every paper `categories()` reports gets its own
     row; a curriculum track is added alongside when one exists. A skill with
     neither gets exactly one disabled "coming soon" row. */
  const rows = [];
  for (const cat of categories) {
    if (cat.skill === "workplace") { rows.push({ ...cat, count: null, kind: "workplace", key: "workplace" }); continue; }

    const n = TRACK_SKILLS.includes(cat.skill) ? trackCount(cat.skill) : 0;
    if (n > 0) {
      rows.push({ ...cat, available: true, count: n, kind: "track", key: `${cat.skill}-track`,
        // Distinct wording only when a paper row will sit right next to it —
        // otherwise the plain category blurb reads better on its own.
        label: cat.papers.length ? `${cat.label} passages` : cat.label });
    }
    for (const paper of cat.papers) {
      rows.push({ ...cat, available: true, count: paper.items, kind: "paper", key: paper.paperId,
        label: cat.papers.length > 1 ? paper.title : cat.label, paperId: paper.paperId });
    }
    if (n === 0 && !cat.papers.length) {
      rows.push({ ...cat, available: false, count: null, kind: "none", key: `${cat.skill}-none` });
    }
  }

  const openRow = (row) => {
    if (!row.available) return;
    if (row.kind === "track") onOpenTrack(row.skill);
    else if (row.kind === "workplace") onWorkplace();
    else onOpenPaper(row.paperId, row.label);
  };

  return (
    <div className="b2">
      <Bar onBack={onExit} section="Practice" />
      <Well style={{ gap: 18 }}>
        <div>
          <div className="b2-sec">Practise your weak areas</div>
          {weak?.available ? (
            <div className="b2-list">
              <ListRow onClick={() => openRow({ available: true, kind: "paper", paperId: weak.paperId, label: weak.label })}
                media={<span className="ic"><Icon name={ICON[weak.dimension] || "compass"} /></span>}
                title={weak.message} meta={<span className="s">Practise {weak.label.toLowerCase()}</span>} />
            </div>
          ) : (
            <p className="b2-quiet">{weak?.message || "Take the quick test first to see what you should practise."}</p>
          )}
        </div>

        <div>
          <div className="b2-sec">Choose a skill</div>
          <div className="b2-list">
            {rows.map(row => row.available ? (
              <ListRow key={row.key} onClick={() => openRow(row)}
                media={<span className="ic"><Icon name={ICON[row.skill]} /></span>}
                title={row.label} meta={<span className="s">{row.blurb}</span>}
                trailing={row.count != null && <span className="tag">{row.count}</span>} />
            ) : (
              <ListRow key={row.key} disabled
                media={<span className="ic"><Icon name={ICON[row.skill]} /></span>}
                title={row.label}
                meta={<span className="s">{row.blurb} — coming soon</span>}
                trailing={<span className="tag">Soon</span>} />
            ))}
          </div>
        </div>

        <button className="b2-next" onClick={onTakeAssessment}>
          <span className="eyebrow">Ready to check your progress?</span>
          <span className="ttl">Take another assessment</span>
          <span className="go">Start</span>
        </button>
      </Well>
    </div>
  );
}
