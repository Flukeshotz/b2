import { useEffect, useRef, useState } from "react";
import { b2 } from "../../lib/b2api";
import { Bar, Maya, Well, Foot } from "./Shell";
import Icon from "./Icon";
import B2Cta from "./B2Cta";

/* GOAL SCREENING WHERE YOU STAND TODAY, in one sitting.
   Never a dead-end score screen: the last thing she sees is a button that starts
   the first practice, not a number.

   Eleven minutes, and she is told that up front. The single fact that decides
   whether a tired person begins is how long it takes. */

const GOALS = [
  { key: "anerkennung", icon: "stethoscope", label: "Anerkennung als Pflegekraft", sub: "telc B1·B2 Pflege" },
  { key: "job",         icon: "briefcase",   label: "Eine Stelle in Deutschland",   sub: "Bewerbungen und Gespräche" },
  { key: "ausbildung",  icon: "cap",         label: "Eine Ausbildung",              sub: "telc B2" },
  { key: "exam",        icon: "clipboard",   label: "Eine B2-Prüfung",              sub: "Goethe oder telc" },
  { key: "unsure",      icon: "compass",     label: "Noch nicht sicher",            sub: "Wir finden es zusammen heraus" },
];

const BAND_TONE = { strong: "ok", good: "ok", developing: "warn", needs_practice: "bad" };
const DIM_LABEL = {
  writing: "Schreiben", grammar: "Grammatik", vocabulary: "Wortschatz",
  listening: "Hören", reading: "Lesen", speaking: "Sprechen",
};

export default function Screening({ onExit, onStart }) {
  const [stage, setStage] = useState("goal");     // goal intro run standing
  const [goal, setGoal] = useState(null);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [si, setSi] = useState(0);                // section index
  const [ii, setIi] = useState(0);                // item index within section
  const [answers, setAnswers] = useState({});
  const [text, setText] = useState("");
  const [picked, setPicked] = useState(null);
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);
  const audioRef = useRef(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    b2.getScreening().then(setData)
      .catch(() => setErr("Wir konnten den Test nicht laden. Prüfen Sie die Verbindung."));
  }, []);

  if (err) return (
    <div className="b2"><Bar onBack={onExit} section="Skillcase B2" />
      <Well><p className="b2-msg">{err}</p>
        <B2Cta onClick={() => { setErr(null); b2.getScreening().then(setData).catch(() => setErr(err)); }}>Nochmal versuchen</B2Cta>
      </Well></div>
  );

  /* ── 1. GOAL ─────────────────────────────────────────────────────────── */
  if (stage === "goal") return (
    <div className="b2">
      <Bar onBack={onExit} section="Skillcase B2" />
      <Well style={{ gap: 18 }}>
        <Maya mood="wave" width={210}>Zuerst: Wohin wollen Sie mit Ihrem Deutsch?</Maya>
        <div className="b2-list">
          {GOALS.map(g => (
            <button key={g.key} className={"b2-row" + (goal === g.key ? " picked" : "")} onClick={() => setGoal(g.key)}>
              <span className="ic"><Icon name={g.icon} /></span>
              <span className="tx"><span className="t">{g.label}</span><span className="s">{g.sub}</span></span>
            </button>
          ))}
        </div>
      </Well>
      <Foot>
        <B2Cta disabled={!goal || !data} onClick={() => setStage("intro")}>
          {data ? "Weiter" : "Lädt…"}
        </B2Cta>
      </Foot>
    </div>
  );

  /* ── 2. WHAT HAPPENS NEXT ────────────────────────────────────────────── */
  if (stage === "intro") return (
    <div className="b2">
      <Bar onBack={() => setStage("goal")} section="Skillcase B2" />
      <Well style={{ gap: 18 }}>
        <Maya mood="curious" width={215}>Jetzt schauen wir, wo Ihr Deutsch gerade steht.</Maya>
        <div className="scr-plan">
          {data.sections.map(s => (
            <div key={s.key} className="scr-planrow">
              <span className="t">{s.label}</span>
              <span className="m">{s.minutes} min</span>
            </div>
          ))}
        </div>
        <p className="b2-quiet">
          Etwa {data.totalMinutes} Minuten. Sie können jeden Teil überspringen — wir arbeiten dann
          mit dem, was wir haben. Am Ende sagen wir Ihnen, was als Erstes dran ist.
        </p>
      </Well>
      <Foot><B2Cta onClick={() => setStage("run")}>Los</B2Cta></Foot>
    </div>
  );

  /* ── 4. WHERE YOU STAND TODAY ──────────────────────────────────────── */
  if (stage === "standing" && result) {
    return (
      <div className="b2">
        <Bar section="Wo Sie stehen" />
        <Well style={{ gap: 16 }}>
          <Maya mood="confident" width={215}>Das ist Ihr Stand. Kein Zeugnis — ein Startpunkt.</Maya>
          <div className="stand">
            {result.profile.map(p => (
              <div key={p.dimension} className="stand-row">
                <span className="d">{DIM_LABEL[p.dimension]}</span>
                <span className={"b " + (p.band ? BAND_TONE[p.band] : "none")}>
                  {p.indicative && p.band ? "—" : p.label}
                </span>
              </div>
            ))}
          </div>
          {result.goal?.why && <p className="stand-why">{result.goal.why}</p>}

          {result.writing?.finding && (
            <div className="stand-finding">
              <span className="eyebrow">Aus Ihrem Text</span>
              <p>{result.writing.finding.working_on}</p>
            </div>
          )}

          {result.next && (
            <button className="b2-next" onClick={() => onStart(result.next)}>
              <span className="eyebrow">Als Erstes</span>
              <span className="ttl">{result.next.title}</span>
              <span className="meta">{result.next.minutes} min · {result.next.reason}</span>
              <span className="go">Anfangen</span>
            </button>
          )}
        </Well>
      </div>
    );
  }

  /* ── 3. RUNNING THE SECTIONS ─────────────────────────────────────────── */
  const sec = data.sections[si];
  const items = sec.items || [];
  const totalItems = data.sections.reduce((n, s) => n + (s.items?.length || 0), 0) + 1;
  const doneItems = data.sections.slice(0, si).reduce((n, s) => n + (s.items?.length || 0), 0) + ii;

  const nextStep = () => {
    setPicked(null); setPlayed(false);
    if (ii + 1 < items.length) { setIi(ii + 1); return; }
    if (si + 1 < data.sections.length) { setSi(si + 1); setIi(0); return; }
  };

  const submit = async () => {
    setSending(true);
    try {
      const r = await b2.submitScreening({ answers, text, goal });
      setResult(r); setStage("standing");
    } catch { setErr("Wir konnten das nicht senden. Versuchen Sie es noch einmal."); setSending(false); }
  };

  const isWriting = sec.key === "writing";
  const item = items[ii];
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="b2">
      <Bar section={sec.label} />
      <div className="scr-bar"><i style={{ width: `${(doneItems / totalItems) * 100}%` }} /></div>
      <Well style={{ gap: 14 }}>
        <p className="scr-count">{isWriting ? "Letzter Teil" : `${ii + 1} von ${items.length}`} · {sec.label}</p>

        {isWriting ? (
          <>
            <p className="scr-prompt">{sec.prompt}</p>
            <ul className="produce-guide">{sec.guidance.map(g => <li key={g}>{g}</li>)}</ul>
            <textarea className="produce-box" rows={8} value={text} spellCheck="false"
              onChange={e => setText(e.target.value)} placeholder="Schreiben Sie hier…" />
            <span className={"produce-count" + (words >= sec.minWords ? " ok" : "")}>
              {words} / {sec.minWords} Wörter
            </span>
          </>
        ) : (
          <>
            {sec.key === "reading" && ii === 0 && (
              <div className="scr-text"><b>{sec.title}</b>{sec.text.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}</div>
            )}
            {sec.key === "listening" && (
              <div className="scr-audio">
                <audio ref={audioRef}
                  src={`${import.meta.env.VITE_API_ORIGIN || "http://localhost:4000"}/b2/audio/${sec.sourceId}_${sec.sectionId}.mp3`}
                  onEnded={() => setPlayed(true)} />
                <button className="srcaudio-play" disabled={played}
                  onClick={() => audioRef.current?.play()}>
                  {played ? "Einmal gehört" : <><Icon name="play" size={15} /> Einmal anhören</>}
                </button>
                <p className="b2-quiet">Wie in der Prüfung: nur einmal.</p>
              </div>
            )}
            {item?.context && <p className="scr-context">{item.context}</p>}
            {/* Grammar items carry a situation and options but no question of
                their own — the question is the section's instruction. Without
                this fallback the learner saw a blank line where the task should
                be, and had to infer what was being asked. */}
            <p className="scr-q">{item?.q || item?.sentence || sec.instruction}</p>
            <div className="srcq-opts">
              {(item?.options || []).map((o, i) => (
                <button key={i} className={"srcq-opt" + (picked === i ? " right" : "")}
                  onClick={() => setPicked(i)}>
                  <span className="ltr">{"ABC"[i]}</span><span>{o}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </Well>
      <Foot>
        {isWriting ? (
          <B2Cta disabled={sending} onClick={submit}>
            {sending ? "Wird ausgewertet…" : words >= sec.minWords ? "Fertig" : "Überspringen"}
          </B2Cta>
        ) : (
          <B2Cta disabled={picked === null}
            onClick={() => { setAnswers(a => ({ ...a, [item.id]: picked })); nextStep(); }}>
            Weiter
          </B2Cta>
        )}
      </Foot>
    </div>
  );
}
