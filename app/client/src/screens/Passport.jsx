import StampSVG from "../components/StampSVG";
import { topicFullyDone } from "../lib/curriculum";

export default function Passport({ topics, done, stats, onBack }) {
  const stampCount = topics.filter(t => topicFullyDone(t, done)).length;
  const words = stats?.words || [];
  const streak = stats?.streak || 1;

  return (
    <section className="screen on" id="passport">
      <div className="eyebrow">Reisepass · Travel document</div>
      <h1 style={{ margin: "6px 0 12px" }}>Your passport</h1>
      <div className="ppage">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="eyebrow">Holder</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 17 }}>PRIYA SHARMA</div>
            <div className="eyebrow" style={{ marginTop: 9 }}>Profession</div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 15 }}>KRANKENSCHWESTER</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="eyebrow">Stamps</div>
            <div className="mono" style={{ fontSize: 30, fontWeight: 700, color: "var(--accent)" }}>{stampCount}/{topics.length}</div>
          </div>
        </div>
        <div className="stamps">
          {topics.map(t => topicFullyDone(t, done)
            ? <div className="mini" key={t.id}><StampSVG topic={t} animated={false} /></div>
            : <div className="mini empty" key={t.id}>EMPTY<br />PAGE</div>)}
        </div>
        <div className="mrz">
          P&lt;INDSHARMA&lt;&lt;PRIYA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br />
          WORDS{String(words.length).padStart(3, "0")}&lt;STREAK{String(streak).padStart(2, "0")}&lt;A1&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
        </div>
      </div>
      <div className="sp" />
      <div className="eyebrow">Words you own</div>
      <div style={{ fontFamily: "var(--body)", fontSize: 15.5, lineHeight: 1.8, color: "var(--text-dim)", marginTop: 6 }}>
        {words.length
          ? words.map((w, i) => <span key={w}>{i > 0 && " · "}<b style={{ color: "var(--text)" }}>{w}</b></span>)
          : "None yet. One lesson changes that."}
      </div>
      <div className="sp" />
      <button className="btn ghost" onClick={onBack}>Back</button>
    </section>
  );
}
