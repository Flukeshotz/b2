import { useEffect, useState } from "react";
import { b2 } from "../../lib/b2api";
import { Bar, Maya, Well, Foot } from "./Shell";
import B2Cta from "./B2Cta";

/* Result Advice Recommendation.
   Three screens rather than one, because they answer three different questions
   and collapsing them buries the only one that is unique to this product:
   which exam to sit. */

const LABEL = { writing: "Writing", reading: "Reading", listening: "Listening", speaking: "Speaking" };

/* WHERE THE SCORE RING USED TO BE.
   It drew `predicted_score` as a percentage captioned "pass mark 60" — directly
   above a line saying "No B2 score here, on purpose". The number won, and it
   was not a number we can defend: the engine's thresholds are fitted against
   CEFR-rated texts, not against Goethe module marks, and no prediction has ever
   been compared to a real exam result. A ring against a pass line claims a
   calibrated exam prediction we do not have.

   So: the standing, in words, and what it rests on. The engine still computes
   the score, the interval and `calibrated` — none of that changed. We just stop
   showing a learner a figure that would be the most expensive kind of wrong. */
const STANDING = {
  clear:      "Your writing is currently at or above the B2 reference level.",
  borderline: "Your writing is currently close to the B2 reference level — it could fall either side.",
  short:      "Your writing is currently below the B2 reference level.",
};

function Standing({ verdict }) {
  if (!verdict) return null;
  const tone = { clear: "var(--b2-ok)", borderline: "var(--b2-warn)", short: "var(--b2-bad)" }[verdict.standing]
    || "var(--b2-muted)";
  return (
    <div className="b2-callout accent" style={{ "--b2-accent": tone }}>
      <span className="eyebrow">Current assessment</span>
      <p className="title" style={{ fontSize: 16 }}>
        {STANDING[verdict.standing] || "Not enough yet to place your writing."}
      </p>
      <p className="body" style={{ color: "var(--b2-muted)" }}>Based on one task — not yet calibrated.</p>
    </div>
  );
}

/* Confidence is reported per skill and never flattened. Writing and speaking are
   genuinely marked; reading and listening are estimated from a handful of items.
   Presenting four numbers as if they were equally trustworthy would be the same
   dishonesty as printing a B2 score after fifteen minutes. */
function skillRows(scores) {
  return [
    { key: "writing", pct: scores.writing?.verdict?.predicted_score ?? null, tag: "measured", colour: "var(--b2-ok)" },
    { key: "speaking", pct: scores.speaking?.skipped ? null : (scores.speaking?.pronunciation?.overall != null ? Math.round(scores.speaking.pronunciation.overall) : null),
      tag: scores.speaking?.skipped ? "skipped" : "measured", colour: "var(--b2-ok)" },
    { key: "reading", pct: scores.reading?.pct ?? null, tag: `estimated · ${scores.reading?.items ?? 0} items`, colour: "var(--b2-warn)" },
    { key: "listening", pct: scores.listening?.pct ?? null, tag: `estimated · ${scores.listening?.items ?? 0} items`, colour: "var(--b2-warn)" },
  ];
}


/* telc does not mark out of 100 — it bands three criteria A/B/C/D, and a "D"
   on Inhalt or Sprache voids the whole text. Showing a percentage for a telc
   task hides both facts, so where the engine has banded the criteria we show
   those instead of the ring. */
function TelcCriteria({ telc }) {
  if (!telc || telc.incomplete) return null;
  const TONE = { A: "var(--b2-ok)", B: "var(--b2-ok)", C: "var(--b2-warn)", D: "var(--b2-bad)" };
  const NAME = { leitpunkte: "Inhalt", gestaltung: "Kommunikative Gestaltung", richtigkeit: "Sprache" };
  return (
    <div style={{ width: "100%", border: "1px solid var(--b2-line)", borderRadius: 12, padding: 16,
      display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ font: "600 10px/1 var(--b2-font)", letterSpacing: ".09em",
          color: "var(--b2-muted)" }}>telc criteria</span>
        <span style={{ font: "600 13px/1 var(--b2-font)",
          color: telc.voided ? "var(--b2-bad)" : "var(--b2-ink)" }}>
          {telc.voided ? "0 of 15" : `${telc.points} of 15`}
        </span>
      </div>
      {Object.entries(telc.criteria).map(([k, c]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ font: "400 13.5px/1.35 var(--b2-font)", color: "var(--b2-body)" }}>{NAME[k] || k}</span>
          <span style={{ font: "600 14px/1 var(--b2-font)", color: c.band ? TONE[c.band] : "var(--b2-muted)" }}>
            {c.band || "not assessed"}
          </span>
        </div>
      ))}
      {telc.voided && (
        <p style={{ margin: 0, font: "400 13px/1.5 var(--b2-font)", color: "var(--b2-bad)" }}>
          A D on Inhalt or Sprache voids the whole text — fix that first.
        </p>
      )}
    </div>
  );
}

export function ResultScreen({ scores, onNext }) {
  const rows = skillRows(scores);
  const scored = rows.filter(r => r.pct != null);
  /* Rank by weakness, but only let an ESTIMATE outrank a MEASURED skill when it
     is clearly worse. Reading and listening come from a handful of items; writing
     and speaking are marked. Telling someone to prioritise a 2-item estimate over
     a marked script is confident bad advice. */
  const MEASURED = new Set(["writing", "speaking"]);
  const weakest = scored.slice().sort((a, b) => {
    const am = MEASURED.has(a.key), bm = MEASURED.has(b.key);
    if (am !== bm) {
      const [meas, est] = am ? [a, b] : [b, a];
      // an estimate must be at least 10 points worse to jump a measured skill
      return est.pct + 10 < meas.pct ? (am ? 1 : -1) : (am ? -1 : 1);
    }
    return a.pct - b.pct;
  })[0];

  return (
    <div className="b2">
      <Bar section="Your result" />
      <Well style={{ alignItems: "center" }}>
        <Standing verdict={scores.writing?.verdict} />
        <Maya mood="curious" width={212}>
          {weakest ? <>{LABEL[weakest.key]} is what&rsquo;s holding you back.</> : "Here's where you stand."}
        </Maya>
        <TelcCriteria telc={scores.writing?.verdict?.telc} />
        <div style={{ width: "100%", background: "var(--b2-sunk)", borderRadius: 12, padding: "6px 18px" }}>
          {rows.map((r, n) => (
            <div key={r.key} style={{ padding: "13px 0", borderBottom: n < 3 ? "1px solid var(--b2-line)" : "none", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ font: "600 14px/1 var(--b2-font)", color: r.pct == null ? "var(--b2-muted)" : "var(--b2-ink)" }}>{LABEL[r.key]}</span>
                <span style={{ font: "600 10px/1 var(--b2-font)", letterSpacing: ".08em", color: r.pct == null ? "var(--b2-muted)" : r.colour }}>
                  {r.pct == null ? (r.tag === "skipped" ? "skipped — come back to it" : "not assessed") : r.tag}
                </span>
              </div>
              <div style={{ height: 8, background: "var(--b2-card)", borderRadius: 200 }}>
                {r.pct != null && <div style={{ width: `${r.pct}%`, height: "100%", background: "var(--b2-cta)", borderRadius: 200 }} />}
              </div>
            </div>
          ))}
        </div>
        <p className="b2-note" style={{ textAlign: "center" }}>
          <b style={{ color: "var(--b2-ink)" }}>No B2 score here, on purpose.</b> Fifteen minutes can&rsquo;t give an honest one.
        </p>
      </Well>
      <Foot><B2Cta onClick={onNext}>What should I work on?</B2Cta></Foot>
    </div>
  );
}

export function AdviceScreen({ scores, onNext, onBack }) {
  const [links, setLinks] = useState([]);
  useEffect(() => { b2.resources().then(setLinks).catch(() => {}); }, []);

  const MEASURED = new Set(["writing", "speaking"]);
  const ranked = skillRows(scores).filter(r => r.pct != null).sort((a, b) => {
    const am = MEASURED.has(a.key), bm = MEASURED.has(b.key);
    if (am !== bm) {
      const [meas, est] = am ? [a, b] : [b, a];
      return est.pct + 10 < meas.pct ? (am ? 1 : -1) : (am ? -1 : 1);
    }
    return a.pct - b.pct;
  });
  const RANK = ["1st", "2nd", "3rd", "4th"];
  const DOT = ["var(--b2-bad)", "var(--b2-warn)", "var(--b2-warn)", "var(--b2-ok)"];
  const free = links.find(l => l.kind === "input");

  const why = {
    writing: "You can't mark this yourself.",
    speaking: "You hesitated hunting for words.",
    listening: "You missed the numbers.",
    reading: "Already solid — skip it.",
  };

  return (
    <div className="b2">
      <Bar onBack={onBack} section="What to do next" />
      <Well style={{ gap: 12 }}>
        <Maya mood="curious" width={190}>Six weeks is enough — in this order.</Maya>
        <div className="b2-stack">
          {ranked.map((r, n) => {
            const last = n === ranked.length - 1;
            return (
              <div key={r.key} className="b2-rank-row">
                <div className="head">
                  <span className="badge" style={{ background: last ? "var(--b2-ok)" : DOT[n] }}>
                    {last ? "OK" : RANK[n]}
                  </span>
                  <span className="t">{LABEL[r.key]}</span>
                </div>
                <p className="body">{why[r.key]}</p>
              </div>
            );
          })}
        </div>
        {/* Routing to free material by name, where that is the honest answer. It
            is also what keeps the product from becoming a content library. */}
        {free && (
          <div className="b2-callout">
            <p className="body">Free listening material: <b style={{ color: "var(--b2-ink)" }}>{free.label_en}</b></p>
          </div>
        )}
      </Well>
      <Foot><B2Cta onClick={onNext}>Which exam should I take?</B2Cta></Foot>
    </div>
  );
}

export function BoardScreen({ scores, onDone, onBack, onRedo }) {
  const [rec, setRec] = useState(null);
  useEffect(() => {
    const skills = {};
    for (const r of skillRows(scores)) if (r.pct != null) skills[r.key] = r.pct;
    b2.recommend(skills).then(setRec).catch(() => setRec({ reasons: ["Couldn't work that out just now."] }));
  }, [scores]);

  if (!rec) return <div className="b2"><Bar section="Which exam" /><Well><p className="b2-note">Working it out…</p></Well></div>;

  const depends = rec.confidence === "depends";

  return (
    <div className="b2">
      <Bar onBack={onBack} section="Which exam" />
      <Well style={{ gap: 16 }}>
        <Maya mood={depends ? "curious" : "thumbsup"} width={depends ? 212 : 200}>
          {depends
            ? <>I can&rsquo;t call this one yet &mdash; it turns on the bit you skipped.</>
            : rec.label ? <>Sit {rec.label.replace(/ B2$/, "")}. Here&rsquo;s why.</> : "Let's work this one out together."}
        </Maya>
        {/* When the answer genuinely depends on a skill we did not measure, the
            product must not pick one and hope. The two boards differ by about
            ₹9,000 and one has no dates in India — a confident guess here is the
            most expensive kind of wrong this product can be. */}
        <div style={{ background: depends ? "var(--b2-card)" : "var(--b2-warn-bg)", border: `1px solid ${depends ? "var(--b2-muted)" : "var(--b2-gold)"}`, borderRadius: 12, padding: "18px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ font: "600 11px/1 var(--b2-font)", letterSpacing: ".12em", color: depends ? "var(--b2-cta)" : "var(--b2-warn)" }}>
            {depends ? "Not enough to call it" : "Recommended"}
          </span>
          <p style={{ margin: 0, font: "600 22px/1.15 var(--b2-font)", color: "var(--b2-ink)" }}>
            {depends ? "telc or Goethe" : rec.label}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rec.reasons.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                {depends
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--b2-cta)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 2 }}><circle cx="12" cy="12" r="10" /><path d="M12 8v5M12 16h.01" /></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--b2-ok)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 2 }}><path d="M20 6L9 17l-5-5" /></svg>}
                <span style={{ font: "400 13px/1.5 var(--b2-font)", color: "var(--b2-body)" }} dangerouslySetInnerHTML={{ __html: t }} />
              </div>
            ))}
          </div>
        </div>
        {rec.alternative && (
          <div className="b2-callout">
            <p className="title" style={{ fontSize: 14 }}>{rec.alternative.label}</p>
            <p className="body">{rec.alternative.when}</p>
          </div>
        )}
        {rec.overrideNote && <p className="b2-note">{rec.overrideNote}</p>}
      </Well>
      <Foot>
        {depends && rec.action
          ? <>
              <B2Cta onClick={() => onRedo?.(rec.action.skill)}>{rec.action.label} · 2 min</B2Cta>
              <B2Cta ghost onClick={onDone}>Decide later</B2Cta>
            </>
          : <B2Cta onClick={onDone}>Start working on it</B2Cta>}
      </Foot>
    </div>
  );
}
