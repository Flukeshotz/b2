import { useState } from "react";
import { Bar, Steps, Card, Maya, Well, Foot } from "./Shell";

/* Three questions, one per screen, and nothing asked twice.
   Q1 is the router: four answers continue into the exam track, the fifth
   ("applying for jobs") branches to the interview track, where speaking and
   listening carry the check and reading and writing drop out. */

const LEVELS = [
  { id: "starting", title: "Just starting", sub: "B1 is done, B2 is new" },
  { id: "middle", title: "Somewhere in the middle", sub: "Studying B2, not ready for the exam" },
  { id: "finished", title: "Finished studying", sub: "The course is done — the exam is what's left" },
  { id: "retaking", title: "Already sat it", sub: "I need to retake part of it" },
  { id: "jobs", title: "Applying for jobs", sub: "B2 is behind me — interviews now", branch: true },
];

const GOALS = [
  { id: "anerkennung", title: "A nursing licence in Germany", sub: "Anerkennung — B2 is the gate" },
  { id: "ausbildung", title: "An Ausbildung place", sub: "Your profile goes out once you have B2" },
  { id: "interview", title: "A job interview", sub: "You need to speak it, not just pass" },
  { id: "study", title: "University", sub: "B2 on the way to C1 or TestDaF" },
];

const WHENS = [
  { id: "booked", title: "Yes, it's booked", sub: "I know the date" },
  { id: "soon", title: "Not booked yet", sub: "I know roughly when, not the date" },
  { id: "unsure", title: "I don't know which exam to take", sub: "telc or Goethe — help me pick" },
];

export default function Onboarding({ onDone, onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ level: null, goal: null, when: null });

  const pick = (key, id) => {
    const next = { ...answers, [key]: id };
    setAnswers(next);
    // A beat before advancing, so the selection is visibly registered rather
    // than the screen just vanishing under the thumb.
    setTimeout(() => (step === 2 ? onDone(next) : setStep(step + 1)), 180);
  };

  const back = () => (step === 0 ? onBack?.() : setStep(step - 1));

  const screens = [
    {
      key: "level", section: "1 of 3", mood: "wave", width: 190,
      ask: "Where are you with B2 right now?", options: LEVELS,
    },
    {
      key: "goal", section: "2 of 3", mood: "curious", width: 174,
      ask: "And what do you need it for?", options: GOALS,
    },
    {
      key: "when", section: "3 of 3", mood: "curious", width: 182,
      ask: answers.level === "jobs" ? "When's the interview?" : "Have you got an exam date?",
      options: WHENS,
      note: "That's everything — nothing else to fill in.",
    },
  ][step];

  return (
    <div className="b2">
      <Bar onBack={back} section={screens.section} />
      <Steps n={step + 1} of={3} />
      <Well style={{ gap: 16 }}>
        <Maya mood={screens.mood} width={screens.width}>{screens.ask}</Maya>
        <div className="b2-stack">
          {screens.options.map(o => (
            <Card key={o.id} title={o.title} sub={o.sub}
              on={answers[screens.key] === o.id}
              onClick={() => pick(screens.key, o.id)} />
          ))}
        </div>
        {screens.note && <p className="b2-note">{screens.note}</p>}
        {step === 2 && answers.level === "jobs" && (
          <div className="b2-warn">
            Most employers still want the <b>B2 certificate</b> too. This gets you through
            the interview — the exam is a separate job, and it's still there when you want it.
          </div>
        )}
      </Well>
      <Foot />
    </div>
  );
}
