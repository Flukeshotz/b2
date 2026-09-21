import { useEffect, useState } from "react";
import { glossFor, GLOSS_EX } from "../lib/curriculum";
import { speak } from "../lib/audio";

export default function ExplainSheet({ tokens, topics, onClose }) {
  const [sel, setSel] = useState(0);
  useEffect(() => { speak(tokens[sel]); }, [sel, tokens]);

  const clean = tokens[sel].replace(/[.,!?]+$/, "").toLowerCase();
  const en = glossFor(tokens[sel], topics);
  const examples = GLOSS_EX[clean] || [];

  return (
    <div id="explainScreen">
      <div className="expTop">
        <button className="xbtn" aria-label="Back" onClick={onClose}>←</button>
        <div className="eyebrow" style={{ flex: 1, textAlign: "center" }}>Explain my answer</div>
        <span style={{ width: 20 }} />
      </div>
      <div className="expChips">
        {tokens.map((t, i) => (
          <button key={i} className={`chip ${i === sel ? "on" : ""}`} onClick={() => setSel(i)}>{t}</button>
        ))}
      </div>
      <div className="expCard">
        <p><b className="hl">{tokens[sel].replace(/[.,!?]+$/, "")}</b> means <b>{en}</b> in German.</p>
        {examples.length > 0 && (
          <div className="exlist">
            {examples.map((x, i) => {
              const re = new RegExp(clean, "i");
              const parts = x.split(re);
              const match = x.match(re);
              return (
                <div className="exline" key={i}>
                  • {parts[0]}{match && <b className="hl">{match[0]}</b>}{parts[1]}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <button className="btn ghost" style={{ marginTop: "auto" }} onClick={onClose}>Back to lesson</button>
    </div>
  );
}
