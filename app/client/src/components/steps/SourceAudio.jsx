import { useEffect, useRef, useState } from "react";
import { b2 } from "../../lib/b2api";
import Icon from "../../screens/b2/Icon";

/* THE B2 LISTENING PLAYER.
   Not Listen.jsx with a longer file. That plays one word to be recognised; this
   is eight minutes of argument, and the exam format it has to reproduce is
   specific: Goethe's Hören Aufgabe 2 plays the text WHOLE, then AGAIN IN
   SECTIONS with the questions for each section read first. Aufgabe 1 is heard
   ONCE. So replay is a property of the item, not of the player.

   Deliberately absent: a scrubber. A learner who can drag back three seconds
   until she catches the word is practising a different skill from the one the
   exam tests, and the whole point of this content is the real thing. She gets
   the plays the exam gives her, and section replay on the second pass. */

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function SourceAudio({ step, ctx }) {
  const [src, setSrc] = useState(null);
  const [err, setErr] = useState(null);
  const [phase, setPhase] = useState("idle");   // idle whole sections done
  const [sec, setSec] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [playsLeft, setPlaysLeft] = useState(step.plays ?? 2);
  const audio = useRef(null);

  useEffect(() => {
    let alive = true;
    b2.getSource(step.sourceId)
      .then(s => { if (alive) setSrc(s); })
      .catch(() => alive && setErr("Das Audio konnte nicht geladen werden. Prüfen Sie die Verbindung."));
    return () => { alive = false; };
  }, [step.sourceId]);

  // The footer button is the only way forward, and it stays disabled until she
  // has actually heard it — the questions are unanswerable otherwise.
  useEffect(() => {
    ctx.setMainBtn({
      label: phase === "done" ? "Continue" : "Listen first",
      disabled: phase !== "done",
    });
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const sections = src?.sections || [];
  const cur = sections[sec];

  const play = () => {
    const a = audio.current;
    if (!a) return;
    a.play().then(() => setPlaying(true)).catch(() => setErr("Playback blocked. Please tap again."));
  };
  const pause = () => { audio.current?.pause(); setPlaying(false); };

  const onEnded = () => {
    setPlaying(false);
    if (phase === "whole") {
      // Whole-text pass: roll straight into the next section.
      if (sec + 1 < sections.length) { setSec(sec + 1); setTimeout(play, 120); return; }
      const left = playsLeft - 1;
      setPlaysLeft(left);
      if (left > 0) { setPhase("sections"); setSec(0); }
      else setPhase("done");
      return;
    }
    if (phase === "sections") {
      if (sec + 1 < sections.length) setSec(sec + 1);
      else setPhase("done");
    }
  };

  useEffect(() => { setPos(0); }, [sec]);

  if (err) return (
    <div className="stepcenter">
      <p className="b2-msg">{err}</p>
      <button className="b2-cta" onClick={() => { setErr(null); setSrc(null); b2.getSource(step.sourceId).then(setSrc).catch(() => setErr(err)); }}>Try again</button>
    </div>
  );
  if (!src) return <div className="stepcenter"><div className="b2-skel" /></div>;

  const total = src.duration_s;
  const elapsed = (cur?.startMs || 0) / 1000 + pos;

  return (
    <div className="srcaudio">
      <div className="eyebrow">Listening</div>
      <h2 className="srcaudio-title">{src.title}</h2>
      <p className="srcaudio-hook">{src.hook}</p>

      <audio ref={audio} src={cur?.url ? (import.meta.env.VITE_API_ORIGIN || "http://localhost:4000") + cur.url : undefined}
        onTimeUpdate={e => setPos(e.target.currentTime)} onEnded={onEnded} preload="auto" />

      <div className="srcaudio-band" aria-hidden="true">
        {sections.map((s, i) => (
          <i key={s.id}
            className={i < sec ? "done" : i === sec ? "on" : ""}
            style={{ flex: s.durationMs || 1 }} />
        ))}
      </div>
      <div className="srcaudio-time">
        <span>{mmss(elapsed)}</span>
        <span>{mmss(total)}</span>
      </div>

      {phase === "idle" && (
        <>
          <p className="srcaudio-note">
            {step.plays === 1
              ? "You will hear the text once. Like in the exam."
              : "You will hear the text twice: once completely, then in sections."}
          </p>
          <button className="srcaudio-play big" onClick={() => { setPhase("whole"); setSec(0); setTimeout(play, 60); }}>
            <Icon name="play" size={16} /> Play audio
          </button>
        </>
      )}

      {phase === "whole" && (
        <>
          <p className="srcaudio-note">First pass — full audio.</p>
          <button className="srcaudio-play" onClick={playing ? pause : play}>
            {playing ? <><Icon name="pause" size={16} /> Pause</> : <><Icon name="play" size={16} /> Resume audio</>}
          </button>
        </>
      )}

      {phase === "sections" && (
        <>
          <p className="srcaudio-note">Second pass — Section {sec + 1} of {sections.length}</p>
          <p className="srcaudio-label">{cur?.label}</p>
          <button className="srcaudio-play" onClick={playing ? pause : play}>
            {playing ? <><Icon name="pause" size={16} /> Pause</> : <><Icon name="play" size={16} /> Play section</>}
          </button>
          <div className="srcaudio-row">
            {/* Replay within the section only — never a scrubber across the text. */}
            <button className="srcaudio-ghost" onClick={() => { const a = audio.current; if (a) { a.currentTime = 0; play(); } }}>
              <Icon name="rotate" size={15} /> Replay
            </button>
            <button className="srcaudio-ghost" onClick={() => (sec + 1 < sections.length ? setSec(sec + 1) : setPhase("done"))}>
              Skip section
            </button>
          </div>
        </>
      )}

      {phase === "done" && (
        <>
          <p className="srcaudio-note done">Listening complete. Now answer the questions below.</p>
          {/* Transcript only AFTER listening: reading along while listening is an
              easier, different skill, and offering it first quietly removes the
              exercise. */}
          <details className="srcaudio-tx">
            <summary>View transcript</summary>
            <div className="srcaudio-txbody">
              {src.script.map((t, i) => (
                <p key={i}><b>{t.speaker}</b> {t.de}</p>
              ))}
            </div>
          </details>
        </>
      )}
    </div>
  );
}
