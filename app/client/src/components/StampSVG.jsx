// Longer titles (e.g. "Ask if they have strawberries") overflow the
// fixed 200x200 viewBox at the default size and get clipped by the SVG
// viewport -- scale font size/letter-spacing down by title length so
// everything up to the longest current title (30 chars) stays on the
// circle instead of running past its edge.
function titleFit(len) {
  if (len <= 13) return { size: 15, spacing: 1.5 };
  if (len <= 18) return { size: 13, spacing: 1 };
  if (len <= 23) return { size: 11, spacing: 0.6 };
  return { size: 9, spacing: 0.3 };
}

export default function StampSVG({ topic, animated = true }) {
  const d = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const title = topic.title.toUpperCase();
  const { size: titleSize, spacing: titleSpacing } = titleFit(title.length);
  return (
    <svg className={animated ? "stamp" : ""} viewBox="0 0 200 200"
      style={animated ? undefined : { opacity: 1, transform: "rotate(-7deg)" }}>
      <defs>
        <path id={`arc-${topic.id}`} d="M100,100 m-72,0 a72,72 0 1,1 144,0" fill="none" />
        <path id={`arc2-${topic.id}`} d="M100,100 m72,0 a72,72 0 1,1 -144,0" fill="none" />
      </defs>
      <circle cx="100" cy="100" r="86" fill="none" stroke="var(--accent)" strokeWidth="5" />
      <circle cx="100" cy="100" r="76" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeDasharray="4 4" />
      <text fontFamily="var(--display)" fontSize="15" fontWeight="800" letterSpacing="3.4" fill="var(--accent)">
        <textPath href={`#arc-${topic.id}`} startOffset="50%" textAnchor="middle">BUNDESREPUBLIK DEUTSCHLAND</textPath>
      </text>
      <text fontFamily="var(--display)" fontSize="12" fontWeight="700" letterSpacing="3" fill="var(--accent)">
        <textPath href={`#arc2-${topic.id}`} startOffset="50%" textAnchor="middle">{d}</textPath>
      </text>
      <text x="100" y="88" textAnchor="middle" fontSize="42">{topic.icon}</text>
      <text x="100" y="122" textAnchor="middle" fontFamily="var(--display)" fontSize={titleSize} fontWeight="800"
        letterSpacing={titleSpacing} fill="var(--accent)">{title}</text>
      <line x1="42" y1="133" x2="158" y2="133" stroke="var(--accent)" strokeWidth="1.5" />
      <text x="100" y="149" textAnchor="middle" fontFamily="var(--mono)" fontSize="11" fill="var(--accent)">EINGEREIST</text>
    </svg>
  );
}
