import React from 'react';

/* Plan pill — NewNavbar.jsx's three states, exactly as shipped:
   premium  → amber-300 well + Gem glyph, label "Premium"
   trial    → 24px countdown ring (#fbbf24 on #002856) with the day count
              inside, label "days left"
   free     → #002856 well + Gift glyph, label "Free Plan"
   All three sit in a bg-white/10 pill at radius 200 with 10px medium copy. */
export function PlanPill({ plan = 'free', daysLeft = 5, trialLength = 7, style }) {
  const label = { premium: 'Premium', trial: 'days left', free: 'Free Plan' }[plan] || 'Free Plan';
  const C = 2 * Math.PI * 9.5;
  return (
    <div title={plan === 'premium' ? 'Premium Plan' : plan === 'trial' ? `${daysLeft} days left in Premium Trial` : 'Free Plan'} style={{
      display: 'inline-flex', alignItems: 'center',
      gap: plan === 'premium' ? 6 : 4,
      padding: plan === 'trial' ? '2px 8px 2px 2px' : '4px 8px 4px 4px',
      background: 'rgba(255,255,255,0.1)', borderRadius: 200, flexShrink: 0, ...style,
    }}>
      {plan === 'premium' ? (
        <span style={{ padding: 4, background: 'var(--ui-progress-fill)', borderRadius: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#002856" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 12L2 9z" /><path d="M2 9h20M12 3 8 9l4 12 4-12-4-6" /></svg>
        </span>
      ) : plan === 'trial' ? (
        <span style={{ position: 'relative', width: 24, height: 24, flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" width="24" height="24" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="12" cy="12" r="9.5" fill="none" stroke="#002856" strokeWidth="3" />
            <circle cx="12" cy="12" r="9.5" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - Math.min(1, daysLeft / trialLength))} />
          </svg>
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 600, lineHeight: '12px', fontVariantNumeric: 'tabular-nums' }}>{String(daysLeft).padStart(2, '0')}</span>
        </span>
      ) : (
        <span style={{ width: 24, height: 24, background: 'var(--ui-text-brand)', borderRadius: 9999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M5 12v9h14v-9" /><path d="M12 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 0a3 3 0 1 0 0-6" /></svg>
        </span>
      )}
      <span style={{ color: '#fff', fontSize: 10, fontWeight: 500, lineHeight: '12px', whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );
}

export default PlanPill;
