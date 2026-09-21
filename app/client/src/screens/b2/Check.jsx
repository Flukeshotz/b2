import { useEffect, useRef, useState } from "react";
import { b2 } from "../../lib/b2api";
import {Bar, Meter, Well, Foot } from "./Shell";
import B2Cta from "./B2Cta";

/* The 15-minute check. Four sections, weighted by how much each yields per
   minute: reading and listening are closed-form and converge fast, so they get
   less clock; writing and speaking take the time, because they are the two
   nobody else can mark and the two the exam actually turns on. */

const SECTIONS = ["reading", "listening", "writing", "speaking"];
const LABEL = { reading: "Reading", listening: "Listening", writing: "Writing", speaking: "Speaking" };

/* ── closed-form items (reading, listening) ─────────────────────────────── */

function Closed({ section, items, index, onAnswer }) {
  const it = items[index];
  const [picked, setPicked] = useState(null);
  useEffect(() => { setPicked(null); }, [index]);

  const choose = (i) => {
    if (picked !== null) return;
    setPicked(i);
    setTimeout(() => onAnswer(i === it.answer), 200);
  };

  return (
    <Well>
      <p className="b2-h1">{section === "reading" ? `Question ${index + 1} of ${items.length}` : "Listen, then answer"}</p>
      {section === "listening" ? <Audio key={it.audio} src={it.audio} next={items[index + 1]?.audio} /> : <div className="b2-task">{it.passage}</div>}
      <p style={{ margin: 0, font: "600 15px/1.45 var(--b2-font)", color: "var(--b2-ink)" }}>{it.q}</p>
      <div className="b2-stack">
        {it.opts.map((o, i) => (
          <button key={i} className={"b2-opt" + (picked === i ? " on" : "")} onClick={() => choose(i)}>{o}</button>
        ))}
      </div>
    </Well>
  );
}

function Audio({ src, next }) {
  const ref = useRef(null);
  const [plays, setPlays] = useState(0);
  const [ready, setReady] = useState(false);

  // React reuses this component across items — only `src` changes — so `plays`
  // carried over. Item 2 opened with the counter already spent and its audio
  // could not be played at all, which makes the question unanswerable and reads
  // to the learner as their own failure. Reset the counter and stop the previous
  // clip whenever the source changes.
  useEffect(() => {
    setPlays(0);
    setReady(false);
    const el = ref.current;
    // preload="auto" alone still leaves the first play waiting on the network,
    // so load() eagerly on mount and warm the NEXT clip while they answer this
    // one. The wait was landing at the worst moment — after the tap, with a
    // dead button and no indication anything was happening.
    if (el) el.load();
    return () => { if (el) { el.pause(); el.currentTime = 0; } };
  }, [src]);

  useEffect(() => {
    if (!next) return;
    const warm = new window.Audio();
    warm.preload = "auto";
    warm.src = next;
    warm.load();
    return () => { warm.src = ""; };
  }, [next]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "10px 0" }}>
      <audio ref={ref} src={src} preload="auto" onEnded={() => setPlays(p => p + 1)}
        onCanPlayThrough={() => setReady(true)} onLoadedData={() => setReady(true)} />
      <button className="b2-mic" onClick={() => ready && plays < 2 && ref.current?.play()} disabled={!ready || plays >= 2}>
        <span className="ring a" /><span className="ring b" />
        <span className="core" style={(plays >= 2 || !ready) ? { background: "var(--b2-muted)" } : undefined}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--b2-surface)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a9 9 0 0 1 0 14" />
          </svg>
        </span>
      </button>
      {/* Two plays, stated up front. The exam gives you one or two; pretending
          otherwise trains a habit the exam room will punish. */}
      <span style={{ font: "500 12px/1 var(--b2-font)", color: "var(--b2-muted)" }}>
        {!ready ? "Loading the clip…" : plays >= 2 ? "No plays left" : plays === 1 ? "One play left" : "Tap to play · you can replay once"}
      </span>
    </div>
  );
}

/* ── writing ────────────────────────────────────────────────────────────── */

function Writing({ task, onDone }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [refusal, setRefusal] = useState(null);
  const [pasted, setPasted] = useState(false);
  const started = useRef(Date.now());
  const pastes = useRef(0);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const target = task?.target_words || 80;

  const submit = async () => {
    setBusy(true); setRefusal(null);
    try {
      const r = await b2.submit({
        taskId: task.id, text,
        composeMs: Date.now() - started.current,
        pasteEvents: pastes.current,
      });
      if (r.refused) { setRefusal(r); setBusy(false); return; }
      onDone(r);
    } catch { setRefusal({ message: "That didn't send. Your text is safe — try again." }); setBusy(false); }
  };

  return (
    <>
      <Well>
        <p className="b2-h1">Write about {target} words</p>
        <div className="b2-task" style={{ whiteSpace: "pre-line" }}>{task?.prompt_de}</div>
        <textarea
          className="b2-write" value={text} spellCheck={false}
          placeholder="Schreiben Sie hier auf Deutsch…"
          onChange={e => { setText(e.target.value); setRefusal(null); }}
          /* Blocked, not warned. The score is about the learner, not the text —
             and a pasted submission also poisons the calibration set, which
             cannot be cleaned afterwards. */
          onPaste={e => { e.preventDefault(); pastes.current++; setPasted(true); setTimeout(() => setPasted(false), 1800); }}
        />
        {pasted && <div className="b2-warn">Pasting is off. The result is about you, not the text — if you drafted it elsewhere, type it out.</div>}
        {refusal && <div className="b2-warn">{refusal.message}</div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="b2-note">Pasting is off</span>
          <span style={{ font: "600 13px/1 var(--b2-font)", color: "var(--b2-ink)", fontVariantNumeric: "tabular-nums" }}>
            {words}/{target}
          </span>
        </div>
      </Well>
      <Foot>
        <B2Cta disabled={busy || words < 20} onClick={submit}>
          {busy ? "Marking…" : "Get my result"}
        </B2Cta>
      </Foot>
    </>
  );
}

/* ── speaking ───────────────────────────────────────────────────────────── */

function Speaking({ prompt, onDone }) {
  /* A learner who cannot speak right now must never be stuck. The A1 app already
     established this with "Can't speak right now" on Speak.jsx, and the reason is
     the same here: a nurse mid-shift, a shared room, a broken mic. Skipping
     records the section as NOT ASSESSED rather than as a zero — the result screen
     already reports per-skill confidence, so an honest gap costs nothing. */
  const [rec, setRec] = useState(false);
  const [busy, setBusy] = useState(false);
  const [secs, setSecs] = useState(0);
  const [problem, setProblem] = useState(null);
  const mr = useRef(null); const chunks = useRef([]); const tick = useRef(null);
  const [take, setTake] = useState(null);

  useEffect(() => () => { clearInterval(tick.current); mr.current?.stream?.getTracks().forEach(t => t.stop()); }, []);
  useEffect(() => () => { if (take?.url) URL.revokeObjectURL(take.url); }, [take]);

  const start = async () => {
    setProblem(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      chunks.current = [];
      r.ondataavailable = e => chunks.current.push(e.data);
      r.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        clearInterval(tick.current);
        setBusy(true);
        const blob = new Blob(chunks.current, { type: r.mimeType || "audio/webm" });
        setTake({ url: URL.createObjectURL(blob), size: blob.size });
        try {
          const res = await b2.speak(blob);
          if (res.unavailable || res.refused) { setProblem(res.message); setBusy(false); setSecs(0); return; }
          onDone(res);
        } catch { setProblem("That recording didn't send. Nothing has been counted — try again."); setBusy(false); setSecs(0); }
      };
      mr.current = r; r.start(); setRec(true); setSecs(0);
      tick.current = setInterval(() => setSecs(s => s + 1), 1000);
    } catch {
      setProblem("No microphone here. Sketch what you'd say and record it later — this hasn't been counted.");
    }
  };

  const stop = () => { setRec(false); mr.current?.stop(); };

  return (
    <>
      <Well style={{ gap: 14 }}>
        <p className="b2-h1">Speak for about a minute</p>
        <div className="b2-task">{prompt}</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "10px 0" }}>
          <button className={"b2-mic" + (rec ? " rec" : "")} onClick={rec ? stop : start} disabled={busy}>
            <span className="ring a" /><span className="ring b" />
            <span className="core">
              {rec
                ? <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--b2-surface)"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--b2-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="2" width="6" height="11" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3" /></svg>}
            </span>
          </button>
          <span style={{ font: "500 12px/1 var(--b2-font)", color: "var(--b2-muted)", fontVariantNumeric: "tabular-nums" }}>
            {busy ? "Listening back…" : rec ? `Recording · ${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")} — tap to stop` : "Tap to record · about a minute"}
          </span>
        </div>
        {problem && <div className="b2-warn">{problem}</div>}
        {take && !busy && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ font: "500 12.5px/1 var(--b2-font)", color: "var(--b2-muted)" }}>Your recording</span>
            <audio src={take.url} controls preload="auto" style={{ height: 32, flex: "1 1 200px", minWidth: 180 }} />
            {take.size < 8000 && (
              <span style={{ font: "400 12px/1.45 var(--b2-font)", color: "var(--b2-bad)", flexBasis: "100%" }}>
                Almost nothing was captured. Check the right microphone is selected and that it is not muted.
              </span>
            )}
          </div>
        )}
        <p className="b2-note">Nobody hears this but the marker, and you can redo it as often as you like.</p>
      </Well>
      <Foot>
        <B2Cta ghost disabled={rec || busy} onClick={() => onDone({ skipped: true })}>
          Can&rsquo;t speak right now
        </B2Cta>
      </Foot>
    </>
  );
}

/* ── orchestrator ───────────────────────────────────────────────────────── */

export default function Check({ content, onDone, onBack }) {
  const [s, setS] = useState(0);       // section index
  const [i, setI] = useState(0);       // item index within a closed section
  const [scores, setScores] = useState({});
  const [correct, setCorrect] = useState([]);

  const section = SECTIONS[s];
  const items = content[section]?.items || [];

  const nextSection = (result) => {
    setScores(sc => ({ ...sc, [section]: result }));
    setI(0);
    if (s + 1 < SECTIONS.length) setS(s + 1);
    else onDone({ ...scores, [section]: result });
  };

  const answer = (ok) => {
    const acc = [...correct, ok];
    if (i + 1 < items.length) { setCorrect(acc); setI(i + 1); return; }
    setCorrect([]);
    nextSection({ pct: Math.round(100 * acc.filter(Boolean).length / acc.length), items: acc.length });
  };

  return (
    <div className="b2">
      <Bar onBack={s === 0 && i === 0 ? onBack : undefined} section={`${LABEL[section]} · ${s + 1} of 4`} />
      <Meter done={s} total={4} />
      {(section === "reading" || section === "listening") && (
        <>
          <Closed section={section} items={items} index={i} onAnswer={answer} />
          <Foot />
        </>
      )}
      {section === "writing" && (
        <Writing task={content.writing?.task} onDone={r => nextSection({ verdict: r.verdict, findings: r.findings })} />
      )}
      {section === "speaking" && (
        <Speaking prompt={content.speaking?.prompt} onDone={r => nextSection(r)} />
      )}
    </div>
  );
}
