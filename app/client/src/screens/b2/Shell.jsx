import "./b2.css";

/* Chrome shared by every B2 screen — the same shape the B1 exam flow already
   uses (back bar progress well footer), so it is a surface these learners
   have navigated before. */

export function Bar({ onBack, section }) {
  return (
    <div className="b2-bar">
      {onBack && (
        <button className="back" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </button>
      )}
      {section && <span className="sec">{section}</span>}
    </div>
  );
}

export function Steps({ n, of }) {
  return <div className="b2-steps">{Array.from({ length: of }, (_, i) => <i key={i} className={i < n ? "on" : ""} />)}</div>;
}

export function Meter({ done, total, seconds }) {
  const mm = seconds != null ? String(Math.floor(seconds / 60)).padStart(2, "0") : null;
  const ss = seconds != null ? String(seconds % 60).padStart(2, "0") : null;
  return (
    <div className="b2-meter">
      {Array.from({ length: total }, (_, i) => <i key={i} className={i < done ? "on" : ""} />)}
      {mm && <span className="clock">{mm}:{ss}</span>}
    </div>
  );
}

export function Card({ title, sub, on, onClick }) {
  return (
    <button className={"b2-card" + (on ? " on" : "")} onClick={onClick}>
      <span style={{ flexGrow: 1 }}>
        <span className="t">{title}</span>
        {sub && <span className="s">{sub}</span>}
      </span>
      {on && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--b2-cta)" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M20 6L9 17l-5-5" /></svg>
      )}
    </button>
  );
}

/* Maya carries the framing on every B2 screen. Not decoration: she is the
   familiar element that stops a timed assessment reading as an exam, which
   matters for a population the research describes as blocked by fear rather
   than ability. */
export function Maya({ mood = "wave", children, width = 205 }) {
  const src = new URL(`../../assets/maya/maya-${mood}.png`, import.meta.url).href;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
      <img src={src} alt="" style={{ width: 76, height: 76, objectFit: "contain", objectPosition: "bottom center", flexShrink: 0 }} />
      <span style={{ position: "relative", display: "inline-block", flexShrink: 0 }}>
        <svg width="34" height="30.5" viewBox="0 0 34 30.5" fill="var(--b2-surface)"
          style={{ position: "absolute", bottom: -6, left: -22 }}><path d="M 0 30.5 L 34 0 L 34 12.5 L 34 24 L 0 30.5 Z" /></svg>
        <span style={{
          position: "relative", display: "block", width, borderRadius: 12, background: "var(--b2-surface)",
          padding: "10px 12px", boxShadow: "0 4px 13px rgba(0,0,0,.25)", border: "1px solid var(--b2-line)",
          font: "500 15px/1.3 var(--b2-font)", color: "var(--b2-body)",
        }}>{children}</span>
      </span>
    </div>
  );
}

export function Foot({ children }) { return <div className="b2-foot">{children}</div>; }
export function Well({ children, style }) { return <div className="b2-well" style={style}>{children}</div>; }
