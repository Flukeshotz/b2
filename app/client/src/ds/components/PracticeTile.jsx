import React from 'react';

/* German Practice tile — the 3-up grid on the practice hub.
   White card at radius 12 with a soft shadow, a photo strip on top at radius
   8, a 13px semibold title and an 11px grey caption. Every tile is the same
   152px height so the rows line up regardless of caption length; lay them out
   in a 3-column grid with 10px gaps inside the 16px page gutter. */
export function PracticeTile({
  title = 'Flashcards',
  caption = 'Learn image-based vocabulary with quiz checkpoints',
  image,
  locked = false,
  onClick,
  style,
}) {
  return (
    <button type="button" onClick={onClick} style={{
      width: '100%', height: 152, background: 'var(--ui-surface-card)', borderRadius: 12, border: 'none', padding: 0,
      boxShadow: '0 2px 10px rgba(8,50,98,0.08)', cursor: 'pointer', textAlign: 'left',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      opacity: locked ? 0.6 : 1, boxSizing: 'border-box', ...style,
    }}>
      <span style={{
        display: 'block', height: 74, margin: 4, borderRadius: 8, flexShrink: 0,
        background: image ? `url(${image}) center / cover no-repeat` : '#e8eef7',
      }} />
      <span style={{ display: 'block', padding: '2px 8px 10px' }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>{title}</span>
        <span style={{ display: 'block', fontSize: 10, color: '#6b7280', lineHeight: 1.35, marginTop: 3 }}>{caption}</span>
      </span>
    </button>
  );
}

export default PracticeTile;
