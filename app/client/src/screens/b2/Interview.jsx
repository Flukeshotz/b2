import { useEffect, useRef, useState } from "react";
import { b2 } from "../../lib/b2api";
import { Bar, Meter, Maya, Well, Foot } from "./Shell";
import B2Cta from "./B2Cta";

/* Interview practice — a different job from the exam, and the screens reflect it.
   Published recruitment guidance describes the employer interview as a 30–60
   minute VIDEO call that checks language rather than practical nursing skill. So
   the interviewer speaks first, the learner answers aloud under time, and nothing
   is marked out of 100. What decides an interview is whether you answered, kept
   going, and avoided the two or three answers that read as red flags. */

const LISTEN = "listen", ANSWER = "answer", RECORDING = "recording", THINKING = "thinking", FEEDBACK = "feedback";

function Mic({ recording, busy, onClick }) {
  return (
    <button className={"b2-mic" + (recording ? " rec" : "")} onClick={onClick} disabled={busy}>
      <span className="ring a" /><span className="ring b" />
      <span className="core">
        {recording
          ? <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--b2-surface)"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
          : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--b2-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="11" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3" /></svg>}
      </span>
    </button>
  );
}


/* Hearing your own take is the only way to tell a bad answer from a bad mic.
   It also settles the question the grader cannot: if the playback is silent,
   nothing reached us and the problem is the input, not the German. */
/* The shape of the session before any of the words. Deliberately NOT a mark
   out of 100 — each bar is scored only over the answers where that dimension
   was actually observed, weakest first, because the weakest bar is the thing
   worth their next hour. */
/* A pre-screening round does not produce a mark, it produces a decision: who
   advances, and for which ward. That is what the recorded call actually did,
   so it is what this screen leads with. */
function Placement({ placement }) {
  if (!placement) return null;
  const tone = { icu: "var(--b2-ok)", acute: "var(--b2-ok)", general: "var(--b2-warn)", not_yet: "var(--b2-bad)" }[placement.id];
  return (
    <div className="b2-callout" style={{ background: `${tone}0d`, borderColor: `${tone}33` }}>
      <span className="eyebrow">Today, you&rsquo;d read as ready for</span>
      <span style={{ font: "600 20px/1.25 var(--b2-font)", color: tone }}>{placement.ward}</span>
      <p className="body">{placement.line}</p>
    </div>
  );
}

function Scorecard({ summary }) {
  const profile = summary?.profile || [];
  if (!profile.length) return null;
  const hue = v => (v >= 75 ? "var(--b2-ok)" : v >= 45 ? "var(--b2-warn)" : "var(--b2-bad)");
  return (
    <div style={{ border: "1px solid var(--b2-line)", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ font: "600 11px/1 var(--b2-font)", letterSpacing: ".1em", color: "var(--b2-muted)" }}>
          How it went
        </span>
        <span style={{ font: "400 12px/1 var(--b2-font)", color: "var(--b2-muted)" }}>
          held {summary.solid} of {summary.total}
        </span>
      </div>
      {profile.map(d => (
        <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ flex: "0 0 118px", font: "400 12.5px/1.3 var(--b2-font)", color: "var(--b2-body)" }}>{d.label}</span>
          <span style={{ flex: 1, height: 7, borderRadius: 4, background: "var(--b2-card)", overflow: "hidden" }}>
            <span style={{ display: "block", width: `${d.score}%`, height: "100%", borderRadius: 4, background: hue(d.score) }} />
          </span>
          <span style={{ flex: "0 0 34px", textAlign: "right", font: "600 12px/1 var(--b2-font)", color: hue(d.score), fontVariantNumeric: "tabular-nums" }}>
            {d.score}%
          </span>
        </div>
      ))}
    </div>
  );
}

function Playback({ take }) {
  if (!take) return null;
  const thin = take.size < 8000;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{ font: "500 12.5px/1 var(--b2-font)", color: "var(--b2-muted)" }}>Your recording</span>
      <audio src={take.url} controls preload="auto" style={{ height: 32, flex: "1 1 200px", minWidth: 180 }} />
      {thin && (
        <span style={{ font: "400 12px/1.45 var(--b2-font)", color: "var(--b2-bad)", flexBasis: "100%" }}>
          Almost nothing was captured. Check the right microphone is selected and that it is not muted.
        </span>
      )}
    </div>
  );
}


export default function Interview({ onExit }) {
  const [set, setSet] = useState(null);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState(LISTEN);
  const [result, setResult] = useState(null);
  const [problem, setProblem] = useState(null);
  const [secs, setSecs] = useState(0);
  const [turn, setTurn] = useState(0);           // 0 = the question, 1-2 = probes
  const [probe, setProbe] = useState(null);      // what the interviewer just said back
  const [usedProbes, setUsedProbes] = useState([]);  // never ask the same thing twice
  const [nudge, setNudge] = useState(null);          // encouragement mid-answer
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const probeMap = useRef(null);
  /* The recorded interviewer spoke fast and not at all like a textbook. Clean
     TTS is the fair default — but meeting the real thing for the first time in
     the actual screening is the failure mode this product exists to prevent. */
  const [asItSounds, setAsItSounds] = useState(false);

  const audio = useRef(null);
  const mr = useRef(null), chunks = useRef([]), tick = useRef(null);
  // Their own recording, kept so they can hear it. When the mic is muted or the
  // gain is dead, the transcript alone cannot tell them whose fault it was.
  const [take, setTake] = useState(null);
  const q = set?.[i];

  useEffect(() => { b2.interviewSet(5).then(setSet).catch(() => setProblem("Couldn't load the questions.")); }, []);
  // Probe audio is content-addressed — the manifest maps the German sentence to
  // its clip, so a probe reused across questions is stored once.
  useEffect(() => { fetch("/b2/interview/probes.json").then(r => r.json()).then(m => (probeMap.current = m)).catch(() => {}); }, []);
  useEffect(() => () => { clearInterval(tick.current); mr.current?.stream?.getTracks().forEach(t => t.stop()); }, []);

  // The interviewer speaks first, unprompted. That is the simulation — reading
  // the question off a card is a different, much easier task.
  useEffect(() => {
    if (!q || phase !== LISTEN) return;
    setResult(null); setProblem(null); setSecs(0);
    const isProbe = probe && probeMap.current?.[probe.de];
    const file = isProbe ? probeMap.current[probe.de] : q.id;
    // Only the questions have a realistic pass; probes fall back to the clean take.
    const a = new Audio(`/b2/interview/${file}${!isProbe && asItSounds ? "_real" : ""}.mp3`);
    a.onerror = () => setPhase(ANSWER);
    audio.current = a;
    a.onended = () => setPhase(ANSWER);
    a.play().catch(() => setPhase(ANSWER));   // autoplay blocked — never strand them
    return () => a.pause();
  }, [q, phase, asItSounds, probe]);

  const start = async () => {
    setProblem(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      chunks.current = [];
      r.ondataavailable = e => chunks.current.push(e.data);
      r.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        clearInterval(tick.current); setNudge(null);
        setPhase(THINKING);
        const blob = new Blob(chunks.current, { type: r.mimeType || "audio/webm" });
        setTake(prev => { if (prev?.url) URL.revokeObjectURL(prev.url); return { url: URL.createObjectURL(blob), size: blob.size }; });
        try {
          const res = await b2.interviewAnswer(blob, q.id, turn, usedProbes);
          if (res.unavailable) { setProblem(res.message); setPhase(ANSWER); return; }
          setResult(res);
          // Every turn counts toward the session pattern, including the probes —
          // freezing on the follow-up is the thing this exists to catch.
          setHistory(h => [...h, { id: q.id, turn, reads: res.reads, notes: res.notes, weakWords: res.weakWords }]);
          setPhase(FEEDBACK);
        } catch {
          setProblem("That didn't send. Nothing has been counted — try again.");
          setPhase(ANSWER);
        }
      };
      mr.current = r; r.start(); setSecs(0); setNudge(null);
      /* The trainer did not sit in silence — she interjected "Ah ja, interessant,
         gut, erzählen Sie weiter" to keep the candidate going. Recording into a
         dead screen is the opposite: it invites you to stop. These are the same
         nudge, at the two moments people trail off. */
      tick.current = setInterval(() => setSecs(s => {
        const n = s + 1;
        if (n === 15) setNudge("Gut — erzählen Sie weiter.");
        if (n === 30) setNudge("Ja, interessant. Und weiter?");
        if (n === 45) setNudge(null);
        return n;
      }), 1000);
      setPhase(RECORDING);
    } catch {
      setProblem("No microphone here. You can come back to this — nothing has been counted.");
    }
  };

  if (problem && !set) return <div className="b2"><Bar onBack={onExit} section="Interview" /><Well><div className="b2-warn">{problem}</div></Well></div>;
  if (!set) return <div className="b2"><Bar onBack={onExit} section="Interview" /><Well><p className="b2-note">Loading…</p></Well></div>;

  // ── session summary ──
  if (!q) {
    const solid = history.filter(h => h.reads === "solid").length;
    const sev = { high: "var(--b2-bad)", medium: "var(--b2-warn)", low: "var(--b2-ok)" };
    return (
      <div className="b2">
        <Bar section="Interview practice" />
        <Well style={{ gap: 18, paddingTop: 18 }}>
          <Maya mood={solid >= history.length / 2 ? "thumbsup" : "curious"} width={212}>
            {summary?.findings?.length > 1
              ? <>Two things to work on before the next one.</>
              : summary?.findings?.[0]
              ? <>One thing to work on — here it is.</>
              : <>You held {solid} of {history.length}. That&rsquo;s the hard part.</>}
          </Maya>

          <Placement placement={summary?.placement} />
          <Scorecard summary={summary} />

          {/* The pattern first. Five separate "some hesitation" notes are five
              data points; "you hesitated on four of five" is something a learner
              can actually act on. */}
          {summary?.findings?.length > 0 && (
            <div className="b2-stack">
              {summary.findings.map((f, k) => (
                <div key={k} className="b2-callout accent" style={{ "--b2-accent": sev[f.severity] }}>
                  <p className="body">{f.text}</p>
                  {f.drill && (
                    <p className="body" style={{ color: "var(--b2-ink)", fontWeight: 500 }}>
                      <span style={{ color: "var(--b2-muted)", fontWeight: 400 }}>Try this — </span>{f.drill}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ background: "var(--b2-sunk)", borderRadius: 12, padding: "6px 18px" }}>
            {history.map((h, n) => (
              <div key={n} style={{ borderBottom: n < history.length - 1 ? "1px solid var(--b2-line)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "11px 0 6px" }}>
                <span style={{ font: "400 13px/1.35 var(--b2-font)", color: h.turn > 0 ? "var(--b2-muted)" : "var(--b2-body)" }}>
                  {h.turn > 0 && <span style={{ color: "var(--b2-warn)", fontWeight: 600 }}></span>}
                  {h.turn > 0 ? "their follow-up" : set.find(x => x.id === h.id)?.de.slice(0, 30) + "…"}
                </span>
                <span style={{ font: "600 12px/1.35 var(--b2-font)", whiteSpace: "nowrap", marginLeft: 10,
                  color: h.reads === "solid" ? "var(--b2-ok)" : h.reads === "one thing to fix" ? "var(--b2-warn)" : "var(--b2-bad)" }}>
                  {h.reads}
                </span>
                </div>
                {(() => {
                  const why = (h.notes || []).find(x => x.state === "fail") || (h.notes || []).find(x => x.state === "warn");
                  return why ? (
                    <p style={{ margin: "0 0 11px", font: "400 12.5px/1.5 var(--b2-font)", color: "var(--b2-muted)" }}>{why.detail}</p>
                  ) : null;
                })()}
              </div>
            ))}
          </div>
          {summary?.placement?.provisional && (
            <p className="b2-note" style={{ marginTop: -4 }}>
              A guide, not a decision — based on how employers we have recorded talk about ward placement.
            </p>
          )}
          <p className="b2-note">
            {summary?.findings?.[0]?.drill
              ? <>Do that one drill, then run these same questions again — the point is the second attempt.</>
              : <>Run these again closer to the date.</>}
          </p>
        </Well>
        <Foot>
          <B2Cta ghost onClick={onExit}>Done</B2Cta>
          <B2Cta onClick={() => { setI(0); setTurn(0); setProbe(null); setUsedProbes([]); setHistory([]); setSummary(null); setPhase(LISTEN); }}>Another five</B2Cta>
        </Foot>
      </div>
    );
  }

  const recording = phase === RECORDING;

  return (
    <div className="b2">
      <Bar onBack={i === 0 ? onExit : undefined} section={`Interview · ${i + 1} of ${set.length}`} />
      <Meter done={i} total={set.length} seconds={recording ? secs : null} />
      {turn > 0 && (
        <p style={{ margin: "0 16px 10px", font: "600 11px/1 var(--b2-font)", letterSpacing: ".1em", color: "var(--b2-warn)" }}>
          They came back at you · {turn === 1 ? "second" : "third"} turn
        </p>
      )}

      <Well style={{ gap: 14 }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/10", borderRadius: 12, overflow: "hidden",
          background: "linear-gradient(160deg, color-mix(in srgb, var(--b2-navy) 78%, white) 0%, var(--b2-navy) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.4">
            <circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" /></svg>
          <span style={{ position: "absolute", left: 12, top: 12, padding: "4px 9px", borderRadius: 200, background: "rgba(0,0,0,.45)", font: "600 11px/1 var(--b2-font)", color: "var(--b2-surface)" }}>
            Pflegedienstleitung
          </span>
          <button onClick={() => audio.current?.play()} style={{ position: "absolute", right: 12, bottom: 12, border: 0, borderRadius: 200, padding: "6px 12px", background: "rgba(255,255,255,.9)", font: "600 11px/1 var(--b2-font)", color: "var(--b2-cta)", cursor: "pointer" }}>
            Again
          </button>
        </div>

        <div style={{ background: "var(--b2-card)", border: "1px solid var(--b2-muted)", borderRadius: 12, padding: "12px 14px" }}>
          <p style={{ margin: 0, font: "400 14.5px/1.55 var(--b2-font)", color: "var(--b2-ink)" }}>
            „{probe ? probe.de : q.de}“
          </p>
        </div>

        {phase !== FEEDBACK && (
          <>
            <div className="b2-task">{q.assesses}</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "6px 0" }}>
              <Mic recording={recording} busy={phase === THINKING} onClick={recording ? () => mr.current?.stop() : start} />
              <span style={{ font: "500 12px/1 var(--b2-font)", color: "var(--b2-muted)", fontVariantNumeric: "tabular-nums" }}>
                {phase === THINKING ? "Listening back…"
                  : recording ? `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")} — tap to stop`
                  : phase === LISTEN ? "Wait for the question…" : "Tap to answer · aim for about 45 seconds"}
              </span>
              {!recording && phase !== THINKING && (
                <button
                  onClick={() => setAsItSounds(v => !v)}
                  style={{ background: "none", border: "none", padding: "2px 6px", cursor: "pointer",
                    font: "500 12px/1 var(--b2-font)", color: asItSounds ? "var(--b2-ok)" : "var(--b2-muted)",
                    textDecoration: "underline", textUnderlineOffset: 3 }}>
                  {asItSounds ? "Real pace — as they actually speak" : "Hear it at real interview pace"}
                </button>
              )}
            </div>
            {recording && nudge && (
              <p style={{ margin: 0, textAlign: "center", font: "500 14px/1.4 var(--b2-font)", color: "var(--b2-ok)" }}>
                {nudge}
              </p>
            )}
            {problem && <div className="b2-warn">{problem}</div>}
            {problem && <Playback take={take} />}
          </>
        )}

        {phase === FEEDBACK && result && (() => {
          const [lead, ...rest] = result.notes;
          const dot = st => ({ pass: "var(--b2-ok)", warn: "var(--b2-warn)", fail: "var(--b2-bad)" }[st]);
          return (
            <>
              <Playback take={take} />
              {/* ONE thing, big. She corrected one thing per answer; five
                  paragraphs the moment someone stops speaking is not feedback,
                  it is a wall. */}
              <div style={{ border: `1px solid ${dot(lead.state)}33`, background: lead.state === "fail" ? "var(--b2-bad-bg)" : lead.state === "warn" ? "var(--b2-warn-bg)" : "var(--b2-ok-bg)",
                borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ font: "600 11px/1 var(--b2-font)", letterSpacing: ".1em", color: dot(lead.state) }}>
                  {lead.state === "fail" ? "Fix this one" : lead.state === "warn" ? "Watch this" : "Good"}
                </span>
                <p style={{ margin: 0, font: "500 15px/1.5 var(--b2-font)", color: "var(--b2-ink)" }}>{lead.detail}</p>
                {lead.teaches?.slice(0, 1).map((t, k) => (
                  <p key={k} style={{ margin: 0, font: "400 13px/1.5 var(--b2-font)", color: "var(--b2-body)" }}>
                    Show it by {t.means}.
                  </p>
                ))}
              </div>

              {/* Everything else as one quiet line each, behind a tap. */}
              {rest.length > 0 && (
                <details>
                  <summary style={{ cursor: "pointer", font: "500 12.5px/1 var(--b2-font)", color: "var(--b2-muted)", padding: "2px 0" }}>
                    {rest.length} more
                  </summary>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                    {rest.map((n, k) => (
                      <div key={k} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                        <span style={{ width: 7, height: 7, borderRadius: 9999, background: dot(n.state), flex: "none", marginTop: 6 }} />
                        <p style={{ margin: 0, font: "400 13px/1.5 var(--b2-font)", color: "var(--b2-body)" }}>{n.detail}</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {result.model && (
                /* Hearing it beats reading about it. */
                <button onClick={() => new window.Audio(result.model.audio).play()}
                  style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid color-mix(in srgb, var(--b2-ok) 35%, var(--b2-surface))", background: "var(--b2-ok-bg)",
                    borderRadius: 12, padding: "12px 14px", cursor: "pointer", font: "600 13px/1 var(--b2-font)", color: "var(--b2-ink)" }}>
                  <span style={{ width: 32, height: 32, borderRadius: 9999, background: "var(--b2-ok)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--b2-surface)"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                  Hear one that works
                </button>
              )}
            </>
          );
        })()}
      </Well>

      <Foot>
        {phase === FEEDBACK && result?.probe && (
          <button className="b2-cta ghost"
            onClick={async () => {
              if (i + 1 < set.length) { setI(i + 1); setTurn(0); setProbe(null); setUsedProbes([]); setPhase(LISTEN); return; }
              try { setSummary(await b2.interviewSummary(history)); } catch { setSummary({ total: history.length, findings: [] }); }
              setI(i + 1);
            }}>
            {i + 1 < set.length ? "Skip probe · Next question" : "Skip probe · Finish"}
          </button>
        )}
        {phase === FEEDBACK && result?.probe && (
          /* The probe IS the skill. An interviewer never stops at the rehearsed
             answer, and the probe is chosen from what was just said — pressing
             the trap, asking for detail after a freeze, escalating a good one. */
          <B2Cta onClick={() => { setProbe(result.probe); setTurn(turn + 1); setPhase(LISTEN); }}>
            {result.probe.kind === "scenario" ? "They make it concrete — walk them through it"
              : result.probe.kind === "substantiate" ? "They want an example — give one"
              : result.probe.kind === "repeat" ? "They ask again — take it slower"
              : result.probe.kind === "trap" ? "They push back — answer that"
              : result.probe.kind === "vague" ? "They want more — go again"
              : result.probe.kind === "hesitant" ? "Take another run at it"
              : "They follow up — answer that"}
          </B2Cta>
        )}
        {phase === FEEDBACK && !result?.probe && (
          <button className="b2-cta"
            onClick={async () => {
              if (i + 1 < set.length) { setI(i + 1); setTurn(0); setProbe(null); setUsedProbes([]); setPhase(LISTEN); return; }
              try { setSummary(await b2.interviewSummary(history)); } catch { setSummary({ total: history.length, findings: [] }); }
              setI(i + 1);
            }}>
            {i + 1 < set.length ? "Next question" : "Finish"}
          </button>
        )}
        {(phase === ANSWER || phase === LISTEN) && (
          <B2Cta ghost onClick={() => { setI(i + 1); setPhase(LISTEN); }}>Skip this one</B2Cta>
        )}
      </Foot>
    </div>
  );
}
