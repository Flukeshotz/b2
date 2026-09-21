import React from 'react';

/* Level ladder — src/pages/landing/components/LevelProgress.jsx as shipped.
   Four equal segments (A1 · A2 · B1 · B2) on a #f0f0f0 track, filled amber
   (#edb843) through the user's current level, with the level labels beneath.
   The `dynamic` variant switches to a slate track, a green fill and 25/50/
   75/100% labels, and floats an amber ball at the live percentage. */
export function LevelLadder({ level = 'A1', progress = 0, dynamic = false, style }) {
  const levels = ['A1', 'A2', 'B1', 'B2'];
  const current = levels.indexOf(String(level).toUpperCase());
  const pct = Math.max(0, Math.min(100, progress));
  return (
    <div style={{ padding: '0 16px 8px', ...style }}>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ margin: 0, color: 'var(--ui-text-brand)', fontSize: 16, fontWeight: 600, lineHeight: 1.35 }}>
          Your current German language level is {String(level).toUpperCase()}
        </h2>
        <p style={{ margin: '2px 0 0', color: 'rgba(0,0,0,0.7)', fontSize: 12 }}>
          B1 level is minimum to work as a nurse in Germany
        </p>
      </div>
      <div style={{ position: 'relative', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 24 }}>
          {levels.map((lv, i) => {
            const fill = dynamic
              ? pct >= (i + 1) * 25 ? 100 : pct <= i * 25 ? 0 : ((pct - i * 25) / 25) * 100
              : i <= current ? 100 : 0;
            const ball = dynamic && (i === 0 ? pct >= 0 && pct <= 25 : pct > i * 25 && pct <= (i + 1) * 25);
            return (
              <div key={lv} style={{ flex: 1, position: 'relative', height: 16, display: 'flex', alignItems: 'center', padding: '0 4px' }}>
                <div style={{ height: 10, width: '100%', borderRadius: 9999, overflow: 'hidden', background: dynamic ? 'var(--ui-border-muted)' : '#f0f0f0' }}>
                  <div style={{ height: '100%', borderRadius: 9999, width: `${fill}%`, background: dynamic ? '#00c853' : 'var(--ui-action-primary-bg)', transition: 'width .5s ease-out' }} />
                </div>
                {ball ? (
                  <div style={{ position: 'absolute', width: 12, height: 12, background: '#EDB843', border: '3px solid #002856', borderRadius: 9999, top: '50%', transform: 'translateY(-50%)', left: `calc(${((pct - i * 25) / 25) * 100}%)`, zIndex: 1 }} />
                ) : null}
              </div>
            );
          })}
        </div>
        <div style={{ width: '100%', marginTop: -6, display: 'flex', justifyContent: 'space-between' }}>
          {levels.map((lv, i) => (
            <span key={lv} style={{ width: '25%', textAlign: dynamic ? 'right' : 'center', color: dynamic ? 'rgba(0,40,86,0.5)' : 'var(--ui-text-brand)', fontSize: dynamic ? 9 : 10, fontWeight: dynamic ? 700 : 500 }}>
              {dynamic ? `${(i + 1) * 25}%` : lv}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LevelLadder;
