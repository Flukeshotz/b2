import { useEffect, useRef, useState } from "react";
import { b2 } from "../../lib/b2api";
import Icon from "../../screens/b2/Icon";

/* MAYA — a conversation the learner has to hold.
   ═══════════════════════════════════════════════════════════════════════
   Explicitly NOT Chat.jsx. That component walks a fixed list of turns and
   asks the learner to tap the right pre-written reply, or to assemble one
   from tiles. Both are recognition. Here the learner writes or speaks their
   own German, and what Maya says next depends on what they actually did —
   whether they gave a reason, conceded, got concrete, or adapted when
   she changed the offer.

   Server-authoritative state, persistent across reloads, speech support
   with safe typing fallback, and honest behavior-based evidence.
*/

export default function Converse({ step, ctx }) {
  const [brief, setBrief] = useState(null);
  const [err, setErr] = useState(null);
  const [log, setLog] = useState([]);          // [{who:'maya'|'me', text, nudge}]
  const [state, setState] = useState({ index: 0, press_count: 0 });
  const [history, setHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);
  const [started, setStarted] = useState(false);

  // Audio / Speech state
  const [recording, setRecording] = useState(false);
  const [audioBusy, setAudioBusy] = useState(false);
  const [micNotice, setMicNotice] = useState(null);
  const mrRef = useRef(null);
  const chunksRef = useRef([]);

  const endRef = useRef(null);

  useEffect(() => {
    b2.getMaya(step.scenarioId)
      .then(data => {
        setBrief(data);
        if (data.session) {
          setSessionId(data.session.sessionId);
          if (data.session.dialogueLog && data.session.dialogueLog.length > 0) {
            setStarted(true);
            setLog(data.session.dialogueLog);
          }
          if (data.session.turns) {
            setHistory(data.session.turns);
          }
          if (data.session.done) {
            setDone({
              summary: {
                verdict: data.session.terminalOutcome === "resolved"
                  ? "Sie sind im Gespräch drangeblieben, haben auf Gegenargumente reagiert und eine tragfähige Lösung vereinbart. Genau das prüft B2."
                  : (data.session.terminalOutcome === "trap_accepted"
                      ? "Sie haben den Sonntagnachtdienst angenommen — genau die Schicht vor Ihrer Prüfung."
                      : "Das Gespräch wurde beendet."),
                did: [],
                missing: [],
              },
              afterwards: data.afterwards || { strong: [], watchFor: "" },
            });
          }
        }
      })
      .catch(() => setErr("Wir konnten das Gespräch nicht laden. Prüfen Sie die Verbindung."));
  }, [step.scenarioId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log, done]);

  useEffect(() => {
    ctx.setHideFooter(!done);
    if (done) ctx.setMainBtn({ label: "Continue", disabled: false });
    return () => ctx.setHideFooter(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => () => {
    mrRef.current?.stream?.getTracks().forEach(t => t.stop());
  }, []);

  const partnerName = brief?.roles?.maya || (brief?.brief?.partner ? brief.brief.partner.split(" ist")[0] : "Frau Berger");

  const begin = async () => {
    setStarted(true);
    setLog([
      { who: "maya", text: brief.opening },
      { who: "maya", text: brief.firstSay },
    ]);
    try {
      const res = await b2.startMaya(step.scenarioId);
      if (res?.sessionId) setSessionId(res.sessionId);
    } catch {
      // Graceful fallback to client-generated session
    }
  };

  const restart = async () => {
    try {
      await b2.resetMaya(step.scenarioId);
    } catch {
      // ignore
    }
    setDone(null);
    setHistory([]);
    setText("");
    setStarted(false);
    setSessionId(null);
    setLog([]);
  };

  const startRecording = async () => {
    setMicNotice(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicNotice("Mikrofon nicht verfügbar — Sie können Ihre Antwort direkt tippen.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setAudioBusy(true);
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        try {
          const res = await b2.speak(blob);
          if (res.transcript) {
            setText(res.transcript);
            setMicNotice(null);
          } else if (res.refused || res.reason === "no_audio") {
            setMicNotice("Keine Sprache erkannt. Sie können es noch einmal versuchen oder die Antwort tippen.");
          } else if (res.unavailable) {
            setMicNotice("Spracherkennung gerade nicht verfügbar. Bitte tippen Sie die Antwort.");
          }
        } catch {
          setMicNotice("Die Aufnahme konnte nicht übertragen werden — bitte tippen.");
        }
        setAudioBusy(false);
      };
      mrRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      setMicNotice("Mikrofon-Zugriff verweigert — tippen Sie Ihre Antwort einfach in das Textfeld.");
    }
  };

  const stopRecording = () => {
    setRecording(false);
    mrRef.current?.stop();
  };

  const send = async () => {
    const mine = text.trim();
    if (!mine || sending) return;
    setSending(true);
    setMicNotice(null);
    setLog(l => [...l, { who: "me", text: mine }]);
    setText("");
    try {
      const r = await b2.mayaTurn(step.scenarioId, { text: mine, sessionId, state, history });
      if (r?.refused) {
        setLog(l => [...l, { who: "system", text: r.message }]);
        setSending(false);
        return;
      }
      if (r.sessionId) setSessionId(r.sessionId);
      setHistory(h => [...h, { text: mine, beat: state.current_beat || state.index }]);
      setLog(l => [...l, { who: "maya", text: r.say, nudge: r.nudge }]);
      if (r.done) {
        setDone(r);
        ctx.commit(true, r.summary.verdict);
      } else {
        setState(r.state || state);
      }
    } catch {
      setLog(l => [...l, { who: "system", text: "Das kam gerade nicht durch. Versuchen Sie es noch einmal." }]);
    }
    setSending(false);
  };

  if (err) return <div className="cv"><p className="b2-msg">{err}</p></div>;
  if (!brief) return <div className="cv"><div className="b2-skel" /></div>;

  /* The briefing */
  if (!started) return (
    <div className="cv">
      <div className="eyebrow">Gespräch</div>
      <h2 className="cv-title">{brief.title}</h2>
      <dl className="cv-brief">
        <dt>Sie</dt><dd>{brief.brief?.role || brief.roles?.learner}</dd>
        <dt>Die Lage</dt><dd>{brief.brief?.situation || brief.context}</dd>
        <dt>Ihr Gegenüber</dt><dd>{brief.brief?.partner || brief.roles?.maya}</dd>
        <dt>Ihr Ziel</dt><dd>{brief.brief?.goal || brief.objective}</dd>
      </dl>
      <p className="b2-quiet">Sie sprechen oder schreiben frei. Es gibt keine vorgegebenen Antwortoptionen.</p>
      <button className="b2-cta" onClick={begin}>Gespräch beginnen</button>
    </div>
  );

  return (
    <div className="cv">
      <div className="cv-log">
        {log.map((m, i) => (
          <div key={i} className={"cv-turn cv-" + m.who}>
            {m.who === "maya" && <span className="cv-who">{partnerName}</span>}
            <p className="cv-text">{m.text}</p>
            {m.nudge && <p className="cv-nudge"><Icon name="rotate" size={13} /> {m.nudge}</p>}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {done ? (
        <div className="cv-done">
          <div className="eyebrow">Das Gespräch</div>
          <p className="cv-verdict">{done.summary.verdict}</p>
          {done.summary.did?.length > 0 && (
            <div className="cv-moves">
              {done.summary.did.map(d => <span key={d} className="cv-chip did">{d}</span>)}
              {done.summary.missing?.map(d => <span key={d} className="cv-chip">{d}</span>)}
            </div>
          )}
          {done.afterwards && (
            <div className="cv-after">
              <div className="eyebrow">Das hätten Sie auch sagen können</div>
              {done.afterwards.strong?.map(p => <p key={p} className="cv-model">„{p}“</p>)}
              {done.afterwards.watchFor && <p className="cv-watch">{done.afterwards.watchFor}</p>}
            </div>
          )}
          <button className="b2-cta cv-send" style={{ marginTop: 12 }} onClick={restart}>
            Noch einmal versuchen
          </button>
        </div>
      ) : (
        <div className="cv-compose">
          {micNotice && (
            <div style={{ font: "400 12.5px/1.4 var(--b2-ui)", color: "var(--b2-muted)", padding: "4px 0" }}>
              {micNotice}
            </div>
          )}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
            placeholder="Ihre Antwort (tippen oder sprechen)…"
            rows={3}
            spellCheck="false"
            disabled={sending || audioBusy}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className={"b2-mic" + (recording ? " rec" : "")}
              onClick={recording ? stopRecording : startRecording}
              disabled={sending || audioBusy}
              title={recording ? "Aufnahme stoppen" : "Sprechen"}
              style={{ flex: "0 0 44px", height: 48, borderRadius: 10 }}
            >
              <span className="core">
                {recording ? "⏹️" : "🎙️"}
              </span>
            </button>
            <button
              className="b2-cta cv-send"
              style={{ flex: 1 }}
              onClick={send}
              disabled={!text.trim() || sending || recording || audioBusy}
            >
              {sending ? "…" : (audioBusy ? "Wird transkribiert…" : "Antworten")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
