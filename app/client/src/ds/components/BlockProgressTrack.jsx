import React from 'react';

/* Ported verbatim from the Skillcase Design System
   (project/components/exam/BlockProgressTrack.jsx) — the segmented block
   progress bar used in all four exam workspaces (and their per-block review
   mode). One segment per question, amber/filled through the current index,
   zinc after it. Replaces B2's own single continuous `.scr-bar`, which was
   a different, unvendored pattern for the same "N of N" position. Note the
   fill rule is `idx <= current`, so the first segment is filled the moment
   the section opens — there is no empty state. */
export function BlockProgressTrack({ count = 5, current = 0, style }) {
  const n = Math.max(0, Math.round(Number(count) || 0));
  return (
    <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 6, ...style }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 10, borderRadius: 200, transition: 'all .2s', background: i <= current ? 'var(--ui-progress-fill)' : 'var(--ui-track)' }} />
      ))}
    </div>
  );
}

export default BlockProgressTrack;
