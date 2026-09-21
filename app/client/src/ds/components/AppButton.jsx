import React from 'react';

/* Production Button — a direct port of SkillCase-Frontend/src/components/ui/Button.jsx.
   Named AppButton here because the imported Figma library already publishes a
   `ButtonsButton`; this is the one the shipping app renders.

   Phase 7: production sets `outline-none` and supplies no replacement, so a
   keyboard user sees nothing. The dual focus ring (--ui-focus-ring) is applied
   on :focus-visible only, so pointer users see no change from today. It
   replaces the resting shadow rather than stacking, because both occupy
   box-shadow and the ring must not be dulled by the shadow underneath. */
const SIZES = {
  sm: { padding: '8px 16px', fontSize: 14 },
  md: { padding: '12px 20px', fontSize: 16 },
  lg: { padding: '16px 24px', fontSize: 18 },
};

const VARIANTS = {
  primary: { background: 'var(--ui-action-primary-bg)', color: 'var(--ui-text-brand)', borderColor: 'rgba(255,255,255,0.12)', hover: '#d4a53c', active: '#c48b0e' },
  secondary: { background: 'var(--ui-surface-card)', color: 'var(--ui-surface-inverse-alt)', borderColor: 'var(--ui-text-brand)', hover: '#f9fafb', active: '#f3f4f6' },
  dark: { background: 'var(--ui-text-brand)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.12)', hover: '#003d83', active: '#001d40' },
  outline: { background: 'transparent', color: 'var(--ui-text-brand)', borderColor: 'var(--ui-text-brand)', hover: 'var(--ui-text-brand)', active: 'var(--ui-text-brand)' },
};

export function AppButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  rounded = false,
  icon,
  disabled = false,
  busy = false,
  state = 'default',
  children = 'Continue',
  style,
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const [focus, setFocus] = React.useState(false);
  const isHover = state === 'hover';
  const isActive = state === 'active';
  // Submitting: production overrides the brand fill with a pulsing blue rather
  // than dimming the button — see A1Flashcard / A2Flashcard / B1Flashcard /
  // A1TestQuestions / A2TestQuestions, all of which do this identically.
  const bg = busy ? 'var(--ui-action-busy-bg)' : isActive ? v.active : isHover ? v.hover : v.background;
  const fg = variant === 'outline' && (isHover || isActive) ? '#ffffff' : v.color;
  return (
    <button
      type="button"
      disabled={disabled || busy}
      onFocus={(e) => { if (e.target.matches(':focus-visible')) setFocus(true); }}
      onBlur={() => setFocus(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: "var(--font-family, 'Poppins', sans-serif)", fontWeight: 600,
        border: `2px solid ${v.borderColor}`,
        borderRadius: rounded ? 9999 : 8,
        width: fullWidth ? '100%' : undefined,
        background: bg, color: busy ? '#ffffff' : fg,
        animation: busy ? 'sc-btn-pulse 2s cubic-bezier(.4,0,.6,1) infinite' : undefined,
        boxShadow: focus ? 'var(--ui-focus-ring)' : variant === 'outline' ? 'none' : 'var(--shadow-xs, 0px 1px 2px 0px rgba(10,13,18,0.05))',
        outline: 'none',
        transition: 'all .2s',
        cursor: disabled || busy ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...s, ...style,
      }}
      {...rest}
    >
      <style>{'@keyframes sc-btn-pulse{0%,100%{opacity:1}50%{opacity:.6}}'}</style>
      {icon ? <span style={{ flexShrink: 0, display: 'inline-flex' }}>{icon}</span> : null}
      {children}
    </button>
  );
}

export default AppButton;
