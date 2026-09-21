import React from 'react';

/* Ported verbatim from the Skillcase Design System
   (project/components/lesson/OptionRow.jsx) — the lettered answer row used
   for quiz, listen-and-choose and match-the-following screens, and (per
   ui_kits/exam-flow/ExamScreens.jsx) exam workspaces. This is the "verdict"
   row: it is the one the design system's own decisions.md names in the
   confirmed, deliberate split from ChoiceRow ("selection"). B2's assessment
   and exam-practice answer screens use this, not ChoiceRow, for exactly that
   reason — ChoiceRow stays for onboarding's pure-selection questions.

   default: white with a zinc-300 hairline. selected: blue-100 fill, #1E76F3
   edge, blue letter chip. correct: emerald wash + green-700 edge.
   incorrect: rose wash + red-500 edge. matched: correct, at 40% opacity. */
const PALETTE = {
  default: { bg: '#fff', edge: 'var(--ui-track-ring)', chipBg: 'var(--ui-surface-sunken)', chipFg: '#6b7280', fg: '#111827' },
  selected: { bg: 'var(--ui-surface-info)', edge: '#1E76F3', chipBg: '#bfdbfe', chipFg: '#1E76F3', fg: '#2563eb' },
  correct: { bg: 'rgba(209,250,229,0.5)', edge: 'var(--ui-success-fg)', chipBg: 'rgba(21,128,61,0.1)', chipFg: 'rgba(21,128,61,0.8)', fg: 'var(--ui-success-fg)' },
  incorrect: { bg: '#ffe4e6', edge: 'var(--ui-danger-fg)', chipBg: 'rgba(239,68,68,0.1)', chipFg: 'rgba(239,68,68,0.8)', fg: 'var(--ui-danger-fg)' },
};

export function OptionRow({ label = 'Option', letter, state = 'default', onClick, style }) {
  const matched = state === 'matched';
  const p = PALETTE[matched ? 'correct' : state] || PALETTE.default;
  return (
    <button type="button" onClick={onClick} style={{
      width: '100%', padding: '12px', borderRadius: 12, background: p.bg,
      border: '1px solid ' + p.edge, boxShadow: state === 'correct' ? '0 2px 8px rgba(21,128,61,.12)' : 'none',
      display: 'flex', alignItems: 'center', gap: 16, cursor: matched ? 'default' : 'pointer',
      opacity: matched ? 0.4 : 1, textAlign: 'left', boxSizing: 'border-box', ...style,
    }}>
      {letter ? (
        <span style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: p.chipBg, color: p.chipFg, fontSize: 14, fontWeight: 500,
        }}>{letter}</span>
      ) : null}
      <span style={{ flex: 1, color: p.fg, fontSize: 15, fontWeight: 500, lineHeight: 1.3 }}>{label}</span>
    </button>
  );
}

export default OptionRow;
