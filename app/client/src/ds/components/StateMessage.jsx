import React from 'react';

/* The centred block every list surface shows instead of its rows. One frame,
   two states — the production code repeats this markup verbatim across
   ExamSelect, PaperSelect, ExamBlockSelector and DescribeSpeakSelect, which is
   why it is one component and not two:

     empty  →  py-12, slate-400, 12px semibold, message only
     error  →  the same frame plus a red AlertCircle and a navy
               "Tap to retry" underline that re-runs the fetch

   Copy is passed in, never defaulted to something generic: the app writes
   surface-specific lines ("No exams configured yet. Check back soon.") and a
   shared default would flatten that. */
export function StateMessage({ state = 'empty', message, retryLabel = 'Tap to retry', onRetry, style }) {
  if (state === 'error') {
    return (
      <div style={{ width: '100%', textAlign: 'center', padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, ...style }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
        <p style={{ margin: 0, color: 'var(--ui-text-secondary)', fontSize: 12, fontWeight: 600 }}>{message}</p>
        {onRetry ? (
          <button type="button" onClick={onRetry} style={{ background: 'none', border: 0, padding: 0, color: 'var(--ui-text-brand)', fontSize: 12, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2, cursor: 'pointer' }}>{retryLabel}</button>
        ) : null}
      </div>
    );
  }
  return (
    <div style={{ width: '100%', textAlign: 'center', padding: '48px 0', color: 'var(--ui-text-faint)', fontSize: 12, fontWeight: 600, ...style }}>{message}</div>
  );
}

export default StateMessage;
