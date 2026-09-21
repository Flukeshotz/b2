import { useEffect, useRef, useState } from "react";
import { b2 } from "../../lib/b2api";

/* GOETHE B2 HÖREN, TEIL 1 — five short conversations, each heard once.
   ═══════════════════════════════════════════════════════════════════════
   The exam constraint IS the experience. Everything else in this product
   forgives a reload; this does not, because the one thing Teil 1 trains is
   what you can take from a conversation on a single pass. A player with a
   replay button would be a different exercise wearing the exam's clothes.

   HOW THE SINGLE PLAY IS ACTUALLY KEPT — and it is not by hiding a button:

   — The audio URL is requested from the server per text, and the server does
     not send one for a text already heard. There is nothing in the DOM to
     re-trigger, nothing in memory to replay, and a reload asks again and is
     refused. A disabled button would only be a suggestion.
   — `controls` is never set on the audio element, so there is no native seek
     bar, no scrub, no restart.
   — The play is confirmed to the server on the `playing` event, not on click.
     A click that never becomes sound — a dead network, a blocked autoplay —
     costs the learner nothing and can be retried.
   — A second click while a request is in flight is ignored by `busy`, so a
     double-click cannot spend two plays.

   The countdown is the exam's own 15 seconds to read the items. It is not
   pressure for its own sake: reading two questions before the audio starts is
   half of what Teil 1 tests, and a learner who has never practised it under
   the clock meets it for the first time in the exam.
*/

const PHASES = { reading: 0, playing: 1, answering: 2 };

export default function HoerenTeil1({ step, ctx }) {
  const [data, setData] = useState(null);
  const [idx, setIdx] = useState(0);           // which text
  const [phase, setPhase] = useState("intro");
  const [left, setLeft] = useState(0);         // countdown seconds
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [result, setResult] = useState(null);
  const audio = useRef(null);

  useEffect(() => {
    b2.getExam(step.sectionId)
      .then(async (d) => {
        setData(d);
        setAnswers(d.responses || {});
        if (d.finished && d.scores) {
          /* Reopening a completed attempt. The GET payload only carries the
             raw scores, not the per-item review with transcripts — rebuilding
             that here would duplicate scoring logic the finish route already
             owns. finish() is idempotent (a second call re-reads the stored
             result rather than re-scoring or recording evidence twice), so
             calling it again is the correct way to rehydrate the full review
             rather than leaving the learner at a bare score with no detail. */
          try { setResult(await b2.examFinish(step.sectionId)); }
          catch { /* the raw scores above still render something */ }
          setPhase("done");
        } else {
          /* Resume where they stopped.
             MUST NOT be "the first text not yet HEARD" — that was the original
             version, and it silently orphaned a real case: reload after
             hearing a text but answering only one of its two items lands on
             the NEXT text (since the current one already counts as "heard"),
             and the unanswered item can never be reached again — that text
             cannot be replayed, so there is no way back to it. The section
             would reach "Auswertung" with an item permanently unanswered and
             no indication why.
             The correct target is the first text that is not yet COMPLETE:
             not heard, OR heard but missing an answer. And if that text was
             already heard, the countdown/play screens must not be offered
             again — jump straight to answering. */
          const responses = d.responses || {};
          const next = d.texts.findIndex(t =>
            !t.heard || t.items.some(it => responses[it.itemNo] === undefined));
          const at = next < 0 ? d.texts.length - 1 : next;
          setIdx(at);
          if (d.texts[at]?.heard) setPhase("answering");
        }
      })
      .catch(() => setErr("Der Prüfungsteil konnte nicht geladen werden."));
  }, [step.sectionId]);

  useEffect(() => { ctx.setHideFooter(phase !== "done"); return () => ctx.setHideFooter(false); }, [phase]); // eslint-disable-line

  /* The reading countdown. */
  useEffect(() => {
    if (phase !== "reading") return;
    if (left <= 0) { startPlay(); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, left]); // eslint-disable-line

  const text = data?.texts?.[idx];

  const beginReading = () => { setErr(null); setLeft(data.readSeconds); setPhase("reading"); };

  const startPlay = async () => {
    if (busy) return;                       // a double-click must not spend two plays
    setBusy(true); setErr(null);
    try {
      const r = await b2.examPlay(step.sectionId, text.no);
      /* `refused` (422), matching every other refusal in this API — see the
         route for why this used to be an unreachable branch. */
      if (r.refused) { setErr(r.message); setPhase("answering"); setBusy(false); return; }
      setPhase("playing");
      const el = audio.current;
      /* The URL the server returns is relative, and the B2 client is served
         from its own dev origin (localhost:5181) — separate from the API
         (localhost:4000) that actually serves the audio, same as
         SourceAudio.jsx's existing pattern. Without the origin prefix this
         resolves against the CLIENT's own origin, Vite's dev server has no
         route for it, and its SPA fallback returns index.html — status 200,
         so nothing here would treat it as a failed request — and the browser
         then correctly refuses to play HTML as audio. Found in a manual pass:
         the failure surfaced as a generic "could not start" message with no
         indication that the file was never the right one to begin with. */
      el.src = (import.meta.env.VITE_API_ORIGIN || "http://localhost:4000") + r.url;
      /* Confirm on `playing` — sound actually started — not on click. */
      el.onplaying = () => { b2.examHeard(step.sectionId, text.no).catch(() => {}); };
      el.onended = () => { setPhase("answering"); };
      el.onerror = () => {
        /* Nothing was consumed: the server only closes the door on `playing`. */
        setErr("Die Aufnahme konnte nicht geladen werden. Ihr Hörversuch ist noch offen.");
        setPhase("intro");
      };
      await el.play();
    } catch {
      setErr("Die Aufnahme konnte nicht gestartet werden. Ihr Hörversuch ist noch offen.");
      setPhase("intro");
    }
    setBusy(false);
  };

  const answer = async (itemNo, value) => {
    setAnswers(a => ({ ...a, [itemNo]: String(value) }));
    try { await b2.examAnswer(step.sectionId, itemNo, value); }
    catch { setErr("Die Antwort konnte nicht gespeichert werden."); }
  };

  const next = async () => {
    if (idx + 1 < data.texts.length) {
      setIdx(idx + 1); setPhase("intro"); setErr(null); return;
    }
    const r = await b2.examFinish(step.sectionId);
    setResult(r); setPhase("done"); ctx.commit(true, null);
  };

  const restart = async () => {
    setBusy(true);
    try {
      await b2.examRetake(step.sectionId);
      const d = await b2.getExam(step.sectionId);
      setData(d);
      setAnswers({});
      setResult(null);
      setIdx(0);
      setPhase("intro");
    } catch {
      setErr("Der Prüfungsteil konnte nicht neu gestartet werden.");
    }
    setBusy(false);
  };

  if (err && !data) return <p className="b2-msg">{err}</p>;
  if (!data) return <div className="b2-skel" />;

  if (phase === "done") return <Review r={result} data={data} onRestart={restart} />;

  const items = text.items;
  const bothAnswered = items.every(i => answers[i.itemNo] !== undefined);

  return (
    <div className="ht">
      {/* Never "Modellsatz", never a claim to be the exam. */}
      <div className="eyebrow">{data.label}</div>
      <p className="ht-count">Text {text.no} von {data.texts.length}</p>
      <p className="ht-sit">{text.situation}</p>

      {phase === "intro" && (
        <>
          <p className="ht-note">{data.instruction}</p>
          <Items items={items} answers={answers} onAnswer={() => {}} locked />
          <button className="b2-cta ht-go" onClick={beginReading} disabled={busy}>
            {data.readSeconds} Sekunden lesen, dann hören
          </button>
        </>
      )}

      {phase === "reading" && (
        <>
          <div className="ht-clock" role="timer" aria-live="off">{left}</div>
          <p className="ht-note">Lesen Sie die beiden Aufgaben.</p>
          <Items items={items} answers={answers} onAnswer={() => {}} locked />
        </>
      )}

      {phase === "playing" && (
        <>
          <div className="ht-wave" aria-hidden="true"><span /><span /><span /></div>
          <p className="ht-note">Sie hören den Text einmal.</p>
          <Items items={items} answers={answers} onAnswer={answer} />
        </>
      )}

      {phase === "answering" && (
        <>
          <p className="ht-note ht-done">Der Text ist zu Ende. Er wird nicht wiederholt.</p>
          <Items items={items} answers={answers} onAnswer={answer} />
          <button className="b2-cta ht-go" onClick={next} disabled={!bothAnswered}>
            {idx + 1 < data.texts.length ? "Nächster Text" : "Auswertung"}
          </button>
        </>
      )}

      {err && <p className="ht-err">{err}</p>}
      {/* No `controls`: no seek bar, no scrub, no restart. */}
      <audio ref={audio} preload="none" />
    </div>
  );
}

function Items({ items, answers, onAnswer, locked = false }) {
  return (
    <ol className="ht-items">
      {items.map(it => (
        <li key={it.itemNo} className="ht-item">
          <span className="ht-no">{it.itemNo}</span>
          <p className="ht-stem">{it.stem}</p>
          <div className={"ht-opts" + (it.type === "rf" ? " rf" : "")}>
            {(it.type === "rf" ? ["Richtig", "Falsch"] : it.options).map((o, i) => {
              const value = it.type === "rf" ? String(i === 0) : String(i);
              const on = answers[it.itemNo] === value;
              return (
                <button key={i} className={"ht-opt" + (on ? " on" : "")}
                  disabled={locked}
                  onClick={() => onAnswer(it.itemNo, value)}>
                  {it.type === "mc3" && <span className="ltr">{"abc"[i]}</span>}
                  <span>{o}</span>
                </button>
              );
            })}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* The review. A count, never a Goethe score: the conversion table is defined
   over all thirty items of the module, so turning ten into "23 Punkte" — or
   into "nicht bestanden" — would be inventing a result about a real
   certificate. The transcript is shown here and only here, because by now the
   learner has heard every text it belongs to. */
function Review({ r, data, onRestart }) {
  if (!r) return <div className="ht"><p className="b2-msg">{data.label}</p></div>;
  return (
    <div className="ht">
      <div className="eyebrow">{r.label}</div>
      <p className="ht-score">{r.correct} von {r.scorable} richtig</p>
      {r.unheard > 0 && (
        <p className="ht-note">{r.unheard} Aufgaben bleiben ungewertet — die zugehörigen Texte haben Sie nicht gehört.</p>
      )}
      <ol className="ht-review">
        {r.review.map(x => (
          <li key={x.itemNo} className={"ht-rev" + (x.correct ? " ok" : x.listened ? " no" : " skip")}>
            <span className="ht-no">{x.itemNo}</span>
            <p className="ht-stem">{x.stem}</p>
            {x.listened ? (
              <>
                <p className="ht-yours">
                  Ihre Antwort: {label(x, x.yours)}{!x.correct && <> · Richtig: {label(x, x.answer)}</>}
                </p>
                <p className="ht-why">{x.because}</p>
              </>
            ) : <p className="ht-why">Nicht gehört — deshalb nicht gewertet.</p>}
          </li>
        ))}
      </ol>
      {onRestart && (
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <button className="b2-cta ht-go" onClick={onRestart}>
            Practice again
          </button>
        </div>
      )}
    </div>
  );
}

function label(x, v) {
  if (v === null || v === undefined) return "—";
  if (x.type === "rf") return v === "true" ? "Richtig" : "Falsch";
  return x.options?.[Number(v)] ?? "—";
}
