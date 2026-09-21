import { useEffect, useRef, useState } from "react";
import { speak } from "../../lib/audio";
import { ENCOURAGE } from "../../lib/curriculum";
import Maya from "../Maya";

// Word shown directly, no reveal gate, one thing to do: hear it, say it.
// Recording is real but never graded.
export default function Speak({ step, ctx }) {
  const [recording, setRecording] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState(null);
  const [noMic, setNoMic] = useState(false);
  const recRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    speak(step.de);
    ctx.setMainBtn({ label: "I said it", disabled: false });
    ctx.setFootSkip({ label: "Can't speak right now", onSkip: () => { ctx.onCooldown("speak"); ctx.advance(); } });
    ctx.registerSpeakCheck(() => ({ ok: true, msg: ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)] }));
    // eslint-disable-next-line
  }, [step]);

  const start = async () => {
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => {
        setPlaybackUrl(URL.createObjectURL(new Blob(chunksRef.current)));
        stream.getTracks().forEach(t => t.stop());
      };
      rec.start();
      recRef.current = rec;
    } catch (e) {
      setNoMic(true);
    }
  };
  const stop = () => {
    setRecording(false);
    if (recRef.current && recRef.current.state === "recording") recRef.current.stop();
  };

  return (
    <div className="stepcenter">
      <div className="eyebrow">Say it</div>
      <div className="repeat-row">
        <button className="repeat-bubble" onClick={() => speak(step.de)}>
          <span className="ico">🔊</span>
          <span className="repeat-text">{step.de}</span>
        </button>
        <div className="repeat-maya"><Maya mood="bob" /></div>
      </div>
      <div className="repeat-en">{step.en}</div>

      <button className={`mic ${recording ? "rec" : ""}`} aria-label="Hold to record"
        onPointerDown={start} onPointerUp={stop} onPointerLeave={stop}>🎙️</button>

      <div style={{ textAlign: "center", marginTop: 14 }}>
        {playbackUrl && (
          <audio controls src={playbackUrl} style={{ width: "100%" }} />
        )}
        {noMic && (
          <div style={{ fontFamily: "var(--body)", color: "var(--text-dim)", fontSize: 14 }}>
            No microphone here. Say it out loud anyway.
          </div>
        )}
      </div>
    </div>
  );
}
