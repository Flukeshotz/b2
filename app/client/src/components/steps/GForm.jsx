import { useEffect } from "react";

/* UNDERSTAND — the form, in about forty words, and only after the learner
   already knows what it does.
   ═══════════════════════════════════════════════════════════════════════
   The two halves are shown as halves, each labelled by the JOB it does
   (Bedingung / Folge, Zugeständnis / Einwand) rather than by its grammatical
   name. The terminology sits in one small tag at the top: a learner who forgets
   the words "Konjunktiv II" tomorrow can still use the construction, which is
   the test this whole experience is built to pass.

   No table. Nothing to memorise. The gate caps the prose at ninety words. */

export default function GForm({ step, ctx }) {
  useEffect(() => { ctx.setMainBtn({ label: "Continue", disabled: false }); }, []); // eslint-disable-line

  return (
    <div className="gf">
      <div className="eyebrow">Die Form</div>
      {step.label && <span className="gf-label">{step.label}</span>}
      {step.lead && <p className="gf-lead">{step.lead}</p>}

      <div className="gf-parts">
        {step.parts.map(p => (
          <div key={p.role} className="gf-part">
            <span className="gf-role">{p.role}</span>
            <p className="gf-de">{p.de}</p>
            {p.note && <p className="gf-note">{p.note}</p>}
          </div>
        ))}
      </div>

      <p className="gf-rule" dangerouslySetInnerHTML={{ __html: step.rule }} />
      {(step.extras || []).map((x, i) => (
        <p key={i} className="gf-extra" dangerouslySetInnerHTML={{ __html: x }} />
      ))}
    </div>
  );
}
