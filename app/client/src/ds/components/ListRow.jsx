import React from 'react';

/* Ported verbatim from the Skillcase Design System
   (project/components/core/ListRow.jsx) — the most reused composition in the
   product: media/title/meta/trailing, white card, radius 12, 1px hairline
   border. Renders as a real <button> when given onClick (keyboard-reachable),
   a plain <div> otherwise — production's own bare-clickable-<div> pattern was
   a defect this component exists specifically to not repeat. */
export function ListRow({ media, title, meta, trailing, hover = 'lift', disabled = false, onClick, style, children }) {
  const [over, setOver] = React.useState(false);
  const [down, setDown] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const active = over && !disabled;
  const interactive = !!onClick;
  const Tag = interactive ? 'button' : 'div';
  return (
    <Tag
      type={interactive ? 'button' : undefined}
      disabled={interactive && disabled ? true : undefined}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => { setOver(false); setDown(false); }}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      onFocus={(e) => { if (e.target.matches(':focus-visible')) setFocus(true); }}
      onBlur={() => setFocus(false)}
      style={{
        font: 'inherit', appearance: 'none', outline: 'none',
        minHeight: 'var(--ui-target-min)',
        width: '100%', padding: 12, background: 'var(--ui-surface-card)', borderRadius: 12,
        border: '1px solid ' + (active && hover === 'border' ? 'var(--ui-text-brand)' : 'var(--ui-border-default)'),
        display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left',
        transition: 'all .15s', flexShrink: 0,
        cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
        opacity: disabled ? 0.6 : 1,
        boxShadow: active && hover === 'lift' ? '0 4px 6px -1px rgba(0,0,0,.1)' : 'none',
        transform: !disabled && hover === 'lift' ? (down ? 'scale(.99)' : active ? 'scale(1.01)' : 'none') : 'none',
        ...(focus ? { boxShadow: 'var(--ui-focus-ring)' } : null),
        ...style,
      }}
    >
      {media ? <div style={{ flexShrink: 0 }}>{media}</div> : null}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {title ? <span style={{ display: 'block', color: 'var(--ui-text-body)', fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{title}</span> : null}
        {meta ? <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>{meta}</div> : null}
        {children}
      </div>
      {trailing ? <div style={{ flexShrink: 0, marginLeft: 8, display: 'flex', alignItems: 'center', gap: 8 }}>{trailing}</div> : null}
    </Tag>
  );
}

export default ListRow;
