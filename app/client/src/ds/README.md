# Vendored Skillcase design tokens

`app.css` and `semantic.css` are copied verbatim from
`Skillcase Design System/tokens/`. Do not edit them here — edit the design
system and re-copy, or the two drift.

Precedence, per the design system's own operating model:
  1. app.css     — the shipping app's index.css. Production truth.
  2. semantic.css — the `--ui-*` role tier. THIS is what components reference.
  3. brand.css / fig-tokens.css — not vendored; design-file and Untitled UI
     reference only, and the product does not use their brand ramp.

Both files were re-diffed against the design system on 11 Sep 2026 and are
byte-identical. There is no token drift to reconcile.

## components/

Copied verbatim from `Skillcase Design System/components/`, same rule: edit the
design system and re-copy, never edit here.

  AppButton.jsx    — components/app/AppButton.jsx. The canonical CTA. The
                     design system's own defect register (SD-005) says local
                     CTAs duplicating it should be deleted in its favour, so
                     B2 renders it through screens/b2/B2Cta.jsx.
  StateMessage.jsx — components/state/StateMessage.jsx. The centred
                     empty/error block, with the retry affordance.

Only what is actually used is vendored. Copying the whole library would be
dead weight and would invite drift in files nothing renders.

Deliberately NOT vendored for B2, and why — see screens/b2/B2Cta.jsx and the
notes in b2.css:
  ScoreRing / MetricBar    — draw a percentage against a scale. B2 shows no
                             score; the engine is uncalibrated and says so.
  StreakCard / LevelCompleteCard / LessonResultModal / PromoBanner /
  PaywallPanel             — the reward economy. B2 excludes streaks and
                             habit mechanics by design.
  AppHeaderBar             — a 64px product navbar with plan pill and avatar.
                             B2's Bar is a 52px back-and-section bar inside a
                             task flow. Not structurally equivalent.
  LessonProgressBar        — prints a percentage and fills orange. B2's
                             progress track carries neither.
