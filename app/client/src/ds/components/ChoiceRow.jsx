import React from 'react';

/* Ported verbatim from the Skillcase Design System
   (project/components/app/ChoiceRow.jsx) — the lettered choice row used for
   onboarding questions and lesson answer options. 358×52, radius 8, a 1px
   inset ring (never a border stacked with a shadow), a lettered chip at
   radius 4, Inter Medium 16/24 copy. Selected turns ring/chip/copy blue;
   correct/incorrect are scored states.

   B2 replaces its own `.srcq-opt` class with this so every multiple-choice
   surface in the product — onboarding, the legacy screening, and the
   core-2026b assessment's MCQ/TRUE_FALSE/MULTI_SELECT items — shares one
   option-row implementation instead of five near-identical ones. */
const STATES = {
  default:   { ring: 'rgb(219,219,219)', bg: '#fff',                 chip: 'var(--ui-surface-sunken)',        letter: 'rgba(24,29,39,0.3)',  text: 'rgb(24,29,39)' },
  selected:  { ring: 'rgb(30,118,243)',  bg: 'rgba(30,118,243,0.04)', chip: 'rgba(30,118,243,0.08)',  letter: 'rgba(30,118,243,0.6)', text: 'rgb(30,118,243)' },
  correct:   { ring: 'rgb(1,144,53)',    bg: 'rgba(1,144,53,0.06)',   chip: 'rgba(1,144,53,0.10)',    letter: 'rgba(1,144,53,0.7)',   text: 'rgb(24,29,39)' },
  incorrect: { ring: 'rgb(236,70,58)',   bg: 'rgba(236,70,58,0.06)',  chip: 'rgba(236,70,58,0.10)',   letter: 'rgba(236,70,58,0.7)',  text: 'rgb(24,29,39)' },
};

export function ChoiceRow({
  letter = 'A',
  label = '',
  hint,
  state = 'default',
  badge,
  showLetter = true,
  onClick,
  style,
}) {
  const s = STATES[state] || STATES.default;
  return (
    <button type="button" onClick={onClick} style={{
      width: '100%', minHeight: 52, borderRadius: 8, border: 'none',
      boxShadow: `inset 0 0 0 ${state === 'default' ? 1 : 1.5}px ${s.ring}`,
      background: s.bg, display: 'flex', gap: 36, alignItems: 'center',
      padding: 10, boxSizing: 'border-box', cursor: 'pointer', textAlign: 'left', ...style,
    }}>
      <span style={{ display: 'flex', gap: 8, alignItems: 'stretch', flex: 1, minWidth: 0 }}>
        {showLetter ? (
          <span style={{ width: 32, borderRadius: 4, background: s.chip, alignSelf: 'stretch', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Inter',sans-serif", fontWeight: 500, fontSize: 16, lineHeight: '24px', color: s.letter }}>{letter}</span>
        ) : null}
        <span style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4px 0', flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 500, fontSize: 16, lineHeight: '24px', color: s.text }}>{label}</span>
          {hint ? <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 400, fontSize: 13, lineHeight: '18px', color: 'rgba(24,29,39,0.55)' }}>{hint}</span> : null}
        </span>
      </span>
      {badge ? (
        <span style={{ flexShrink: 0, background: 'rgba(237,184,67,0.22)', color: '#8a5f06', fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>{badge}</span>
      ) : null}
    </button>
  );
}

export default ChoiceRow;
