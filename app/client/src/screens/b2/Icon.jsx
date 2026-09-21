/* Line icons, 24×24 box, 2px stroke, rounded caps, single colour via
   currentColor — the geometry the design system specifies, and the geometry
   lucide-react ships at runtime in the production app.

   This replaces the emoji the B2 screens were using. The design system is
   explicit: emoji are not used anywhere in the product except the 🇩🇪 flag as
   the country marker on journey nodes. Emoji also render differently on every
   device, which is the practical reason as well as the brand one. */

const P = {
  headphones: "M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3",
  ruler: "M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0zM14.5 12.5l2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2",
  link: "M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 1 1 0 10h-2M8 12h8",
  pen: "M12 20h9M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",
  clipboard: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM9 12h6M9 16h4",
  file: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zM14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8",
  stethoscope: "M11 2v2M5 2v2M5 4a3 3 0 0 0 3 3 3 3 0 0 0 3-3M8 7v5a4 4 0 0 0 8 0v-1M16 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  briefcase: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",
  cap: "M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5",
  compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z",
  chat: "M7.9 20A9 9 0 1 0 4 16.1L2 22zM8 12h.01M12 12h.01M16 12h.01",
  check: "M20 6 9 17l-5-5",
  chevronRight: "m9 18 6-6-6-6",
  chevronLeft: "m15 18-6-6 6-6",
  // Absolute coordinates, not the relative "m6 3 14 9-14 9z" this used to be:
  // the multi-subpath splitter below only recognises uppercase "M", so a
  // path starting with lowercase "m" got a second "M" prepended, producing
  // the invalid "Mm6 3 14 9-14 9z" — silently dropped by the browser, so
  // every Play button rendered with no visible triangle.
  play: "M6 3 20 12 6 21z",
  rotate: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5",
  lock: "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4",
};

export default function Icon({ name, size = 22, stroke = 2, style, ...rest }) {
  const d = P[name];
  if (!d) return null;
  const fill = name === "play" ? "currentColor" : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false"
      style={{ flex: "none", display: "block", ...style }} {...rest}>
      {d.split("M").filter(Boolean).map((seg, i) => <path key={i} d={"M" + seg} />)}
    </svg>
  );
}
