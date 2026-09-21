import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { shuffle } from "../../lib/curriculum";
import { speak, blip } from "../../lib/audio";
import { MayaSays } from "../Maya";

const CHAT_HINTS = [
  "Not that one. Look at what she just asked.",
  "Close, but that doesn't answer her.",
  "Try the one that matches the goal above.",
  "Read her line again -- the answer's in there.",
  "That reply doesn't fit what she said.",
  "Almost -- check which one actually responds to her.",
  "Not quite. What is she really asking?",
];

// Production-turn reply: the learner assembles their own line from tiles
// (target words + a few decoys) instead of tapping a pre-written option.
// This is the first place in the app the learner produces German rather
// than recognizing it -- kept deliberately simple (tap tiles in order,
// wrong attempts just miss and reset, no free-text) per the roadmap's
// "controlled recall, not open-ended generation" call for module 21+.
const PRODUCTION_HINTS = [
  "Not quite the right order. Try again.",
  "Close -- one of those words isn't right for this reply.",
  "Almost. Look at what she just asked.",
  "Check the order -- German word order matters here.",
  "One of those tiles is a decoy. Look again.",
  "Nearly -- reread what she said and try once more.",
];

// Graduated scaffold, not just a retry: a first wrong attempt gets a
// text hint and a clean reset (the learner might just have fat-
// fingered the order). A SECOND wrong attempt on the same turn means
// they're actually stuck, not careless -- resetting to a blank bank
// again risks the exact drop-off this mechanic exists to avoid, so
// instead the correct first tile gets placed for them automatically
// and the hint explains why. This is still recall, not recognition --
// they still have to finish the sentence themselves -- but nobody is
// left staring at an empty bank with no path forward.
function ProductionReply({ turn, hardChat, onSubmit, missTurn, onWrong }) {
  const [bank] = useState(() => shuffle(turn.answer.concat(turn.decoys || [])));
  const [picked, setPicked] = useState([]); // [{w, bankIdx}]
  const [used, setUsed] = useState(new Set());
  const [shake, setShake] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  const target = turn.answer;
  const norm = (s) => s.toLowerCase().replace(/[.,!?]/g, "").trim();

  const reset = (scaffold) => {
    if (scaffold) {
      const firstIdx = bank.findIndex(w => w === target[0]);
      setPicked([{ w: target[0], i: firstIdx }]);
      setUsed(new Set([firstIdx]));
    } else {
      setPicked([]);
      setUsed(new Set());
    }
  };

  const tryClearShake = () => setShake(false);

  const submit = (finalPicked) => {
    const said = finalPicked.map(p => p.w).join(" ");
    const ok = norm(said) === norm(target.join(" "));
    if (ok) {
      onSubmit({ de: target.join(" "), en: turn.answerEn, ack: turn.ack, ackEn: turn.ackEn });
    } else {
      missTurn();
      const nextWrongCount = wrongCount + 1;
      setWrongCount(nextWrongCount);
      const scaffold = nextWrongCount >= 2;
      onWrong(scaffold
        ? `Here's the first word to get you started -- ${target[0]}.`
        : PRODUCTION_HINTS[Math.floor(Math.random() * PRODUCTION_HINTS.length)]);
      setShake(true);
      setTimeout(() => { tryClearShake(); reset(scaffold); }, 650);
    }
  };

  const pickTile = (w, i) => {
    if (shake) return;
    if (picked.length === 0) onWrong(null);
    const next = [...picked, { w, i }];
    setUsed(prev => new Set(prev).add(i));
    setPicked(next);
    if (next.length === target.length) submit(next);
  };

  const removeTile = (idx) => {
    const p = picked[idx];
    setPicked(picked.filter((_, i) => i !== idx));
    setUsed(prev => { const n = new Set(prev); n.delete(p.i); return n; });
  };

  return (
    <div className="prodreply">
      <div className="lbl">Build your reply{hardChat ? "" : " · tap the words in order"}</div>
      <div className={`slots ${shake ? "shake" : ""}`}>
        {picked.length === 0 && <span className="slotsplaceholder">Tap words below</span>}
        {picked.map((p, i) => <button key={i} className="word placed" onClick={() => removeTile(i)}>{p.w}</button>)}
      </div>
      <div className="bank">
        {bank.map((w, i) => (
          <button key={i} className={`word ${used.has(i) ? "used" : ""}`} onClick={() => pickTile(w, i)}>{w}</button>
        ))}
      </div>
    </div>
  );
}

export default function Chat({ step, ctx }) {
  const [thread, setThread] = useState([]); // {side:'me'|'them', de, en, tick}
  const [typing, setTyping] = useState(false);
  const [ti, setTi] = useState(0);
  const [hardChat, setHardChat] = useState(() => localStorage.getItem("hardChat") === "1");
  const [hint, setHint] = useState(null);
  const [nopeIdx, setNopeIdx] = useState(new Set());
  const [recording, setRecording] = useState(false);
  const [done, setDone] = useState(false);
  const [portalTarget, setPortalTarget] = useState(null);
  const timers = useRef([]);
  const bottomRef = useRef(null);

  const setTimer = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); return id; };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { setPortalTarget(document.getElementById("fixedBottom")); }, []);

  const toBottom = () => bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  // hint and done both render new content above bottomRef without changing
  // thread/typing -- missing them here is why a wrong-answer hint or the
  // end-of-chat message could land off-screen, forcing a manual scroll.
  useEffect(toBottom, [thread, typing, hint, done]);

  // Curriculum content can drop a {name} token into a colleague's line to
  // address the learner directly -- substituted here so both the thread
  // and the TTS get the real name, not the raw token.
  const withName = (s) => s && s.includes("{name}") ? s.replace(/\{name\}/g, ctx.userFirstName || "") : s;

  const nextTurn = (curTi) => {
    if (curTi >= step.turns.length) {
      setDone(true);
      ctx.setHideFooter(false);
      ctx.setMainBtn({ label: "Continue", disabled: false });
      return;
    }
    const t = step.turns[curTi];
    setTyping(true);
    setTimer(() => {
      setTyping(false);
      const de = withName(t.them);
      setThread(prev => [...prev, { side: "them", de, en: withName(t.en) }]);
      speak(de);
    }, 700);
  };

  useEffect(() => { nextTurn(0); /* eslint-disable-next-line */ }, []);

  const turn = step.turns[ti];

  const sendMine = (o) => {
    setNopeIdx(new Set()); setHint(null);
    setThread(prev => [...prev, { side: "me", de: o.de, en: o.en, tick: true }]);
    speak(o.de); blip(true); ctx.bumpCombo();
    if (o.ack) {
      setTyping(true);
      setTimer(() => {
        setTyping(false);
        const ack = withName(o.ack);
        setThread(prev => [...prev, { side: "them", de: ack, en: withName(o.ackEn) }]);
        speak(ack);
        const n = ti + 1; setTi(n);
        setTimer(() => nextTurn(n), 900);
      }, 600);
    } else {
      const n = ti + 1; setTi(n);
      setTimer(() => nextTurn(n), 650);
    }
  };

  const choose = (i) => {
    const o = turn.opts[i];
    if (!o.ok && turn.mode !== "choice") {
      setNopeIdx(prev => new Set(prev).add(i));
      blip(false); ctx.miss();
      setHint(CHAT_HINTS[Math.floor(Math.random() * CHAT_HINTS.length)]);
      return;
    }
    sendMine(o);
  };

  const micDone = () => {
    if (!recording) return;
    setRecording(false);
    const isChoice = turn.mode === "choice";
    const ok = isChoice ? 0 : turn.opts.findIndex(o => o.ok);
    sendMine(turn.opts[ok]);
  };

  const toggleHard = () => {
    const next = !hardChat;
    setHardChat(next);
    localStorage.setItem("hardChat", next ? "1" : "0");
  };

  return (
    <>
      <div className="goalbar">
        <div className="gt"><span className="eyebrow">Your goal</span><div className="goaltext">{step.goal}</div></div>
        <button className={`modepill ${hardChat ? "hard" : ""}`} onClick={toggleHard}>{hardChat ? "HARD" : "EASY"}</button>
      </div>
      <div className="thread">
        {thread.map((m, i) => (
          <div className={`turn ${m.side}`} key={i}>
            <div className="av">{m.side === "me" ? "👩🏽‍⚕️" : step.avatar}</div>
            <div className="msg" onClick={() => speak(m.de)}>
              <span className="de">{m.de}</span>
              <span className="gloss" style={m.side === "me" && hardChat ? { display: "none" } : undefined}>{m.en}</span>
              {m.tick && <span className="tick">✓✓</span>}
            </div>
          </div>
        ))}
        {typing && (
          <div className="turn"><div className="av">{step.avatar}</div><div className="msg typing"><i /><i /><i /></div></div>
        )}
        {hint && <div className="chathint"><MayaSays text={hint} mood="concerned" /></div>}
        {done && <div className="chatdone"><MayaSays text="You just held a conversation in German. Every word in it was yours." mood="cheer" /></div>}
        <div ref={bottomRef} />
      </div>

      {!done && turn && !typing && turn.mode === "production" && portalTarget && createPortal(
        <div id="sheet">
          <ProductionReply turn={turn} hardChat={hardChat} onSubmit={sendMine} missTurn={ctx.miss} onWrong={setHint} />
        </div>,
        portalTarget
      )}

      {!done && turn && !typing && turn.mode !== "production" && portalTarget && createPortal(
        <div id="sheet">
          <div className="lbl">{turn.mode === "choice" ? "Your choice. Anything here is right" : `Choose your reply${hardChat ? "" : " · tap to hear it"}`}</div>
          <div className="sheetrow">
            <div className="col">
              {turn.opts.map((o, i) => (
                <button key={i} className={`reply ${turn.mode === "choice" ? "choice" : ""} ${nopeIdx.has(i) ? "nope" : ""}`}
                  style={nopeIdx.has(i) ? { pointerEvents: "none" } : undefined}
                  onClick={() => choose(i)}>
                  <span>
                    <span className="de">{o.de}</span>
                    {!hardChat && <span className="gloss">{o.en}</span>}
                  </span>
                </button>
              ))}
            </div>
            <button className={`micbtn ${recording ? "rec" : ""}`} aria-label="Hold and say your reply"
              onPointerDown={() => setRecording(true)}
              onPointerUp={micDone}
              onPointerLeave={() => setRecording(false)}>🎙️</button>
          </div>
        </div>,
        portalTarget
      )}
    </>
  );
}
