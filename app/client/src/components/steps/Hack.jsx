import { useEffect } from "react";

// Maya's "cheat codes" — dropped in right after she's already used the
// pattern successfully, never before. Given real visual weight (not a small
// footnote card) since it's meant to be a payoff moment, but still just a
// title and one short line, never a paragraph.
export default function Hack({ step, ctx }) {
  useEffect(() => { ctx.setMainBtn({ label: "Got it", disabled: false }); }, [step]); // eslint-disable-line

  return (
    <div className="hackwrap">
      <div className="hackcard">
        <div className="hacktag" aria-hidden="true">🔓</div>
        <div className="hackkicker">Hack unlocked</div>
        <div className="hacktitle">{step.title}</div>
        <div className="hackbody">{step.body}</div>
      </div>
    </div>
  );
}
