import { useState } from "react";
import AppButton from "../../ds/components/AppButton";

/* B2's call to action, rendered through the design system's AppButton.
   ═══════════════════════════════════════════════════════════════════════
   The design system's own defect register, SD-005: four local CTAs
   reimplementing AppButton, "each carries its own hardcoded gradient, and none
   inherits the focus ring, the busy state, or the disabled treatment the
   component has. Four near-identical buttons is how a palette drifts and how
   an accessibility fix lands in one place out of five." `.b2-cta` was a fifth.

   WHY A WRAPPER RATHER THAN AppButton AT EVERY CALL SITE
   Nineteen call sites, one decision. If the exam-tier colour or the 48px
   minimum has to change, it changes here, and B2 cannot drift button by
   button — which is the failure SD-005 describes.

   TWO DELIBERATE DEPARTURES FROM AppButton'S DEFAULTS, both to avoid
   redesigning screens that are already validated:

   1. NOT `variant="primary"`. That variant is gold (--ui-action-primary-bg,
      #edb843). Gold is the reward economy in this product — coins, streaks,
      premium — and B2 carries none of it. `variant="dark"` is the canonical
      non-gold dark variant, so that is the base.

   2. The fill stays B2's own `--b2-cta`, which resolves to the semantic token
      `--ui-exam-cta-bg` (#172554, blue-950). AppButton's `dark` variant paints
      `--ui-text-brand` (#002856, navy) instead. Both are design-system
      tokens and neither is wrong — they are different ROLE TIERS, and the
      design system treats that distinction as real: "the Review Answers button
      is navy, not blue-950", and "Exam headings are #082f49, not brand navy. A
      real product distinction, deliberately preserved." Repainting nineteen
      B2 buttons from the exam tier to the brand tier would be a visual
      redesign of validated screens, which this pass is explicitly not.

   Geometry is pinned to what `.b2-cta` already rendered — 48px minimum, 15px
   label, radius 8, full width, B2's shadow — so no screen reflows. What B2
   gains is AppButton's behaviour: the :focus-visible ring, the busy state and
   the disabled treatment, in one place instead of nineteen.

   `ghost` is B2's quiet secondary ("Decide later", "Skip this one"). It is not
   AppButton's `outline` variant, which paints a 2px brand border and inverts
   on hover; B2's is borderless and shadowless by design. */

export default function B2Cta({ ghost = false, disabled = false, className = "", children, style, ...rest }) {
  /* FOCUS IS TRACKED HERE, and it has to be.
     AppButton already sets `box-shadow: var(--ui-focus-ring)` on :focus-visible
     — but its resting shadow is hardcoded to `--shadow-xs`, and B2's buttons
     carry `--b2-shadow` (which is `--shadow-md`, three steps heavier). Passing
     a resting shadow through `style` overrides AppButton's whole box-shadow
     declaration, focus ring included, because both occupy the same property
     and `style` is spread last. Inline also beats the stylesheet, so the
     `:focus-visible` rule in b2.css cannot rescue it either.

     Measured that regression before fixing it: with a static boxShadow in this
     object, all nineteen B2 CTAs silently lost their focus ring.

     So the two states are resolved here rather than fought over: B2's shadow at
     rest, the design system's ring on keyboard focus. Same `:focus-visible`
     gate AppButton uses, so nothing changes for a pointer user. */
  const [focused, setFocused] = useState(false);

  /* `.b2-cta:disabled` was `opacity:.35; box-shadow:none`. AppButton's own
     disabled treatment is `opacity:.5` with the shadow left on, so both are
     restated — otherwise every disabled B2 button would lighten and gain a
     shadow it never had. */
  const fill = ghost
    ? { background: "transparent", color: "var(--b2-body)", fontWeight: 500 }
    : { background: "var(--b2-cta)", color: "var(--b2-cta-fg)" };

  const shadow = disabled || ghost
    ? "none"
    : focused ? "var(--ui-focus-ring)" : "var(--b2-shadow)";

  return (
    <AppButton
      variant="dark"
      size="md"
      fullWidth
      disabled={disabled}
      className={className}
      onFocus={(e) => { if (e.target.matches(":focus-visible")) setFocused(true); }}
      onBlur={() => setFocused(false)}
      style={{
        minHeight: 48,
        border: 0,
        borderRadius: 8,
        fontSize: 15,
        fontFamily: "var(--b2-font)",
        padding: "0 18px",
        ...fill,
        boxShadow: shadow,
        ...(disabled ? { opacity: 0.35 } : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </AppButton>
  );
}
