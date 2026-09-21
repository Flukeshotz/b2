import { useEffect, useState } from "react";
import Maya from "../Maya";
import { narrate } from "../../lib/audio";

export default function Story({ step, ctx }) {
  const [li, setLi] = useState(0);

  useEffect(() => { narrate(step.lines[li]); }, [li, step]);

  const next = () => {
    if (li + 1 >= step.lines.length) { ctx.advance(); return; }
    setLi(li + 1);
  };

  return (
    <div className="storywrap">
      <Maya mood="cheer" />
      <div className="storyline">{step.lines[li]}</div>
      <div className="storydots">
        {step.lines.map((_, i) => <i key={i} className={i === li ? "on" : ""} />)}
      </div>
      <button className="btn" style={{ maxWidth: 220 }} onClick={next}>Next</button>
      <button className="skiplink" onClick={ctx.advance}>Skip intro</button>
    </div>
  );
}
