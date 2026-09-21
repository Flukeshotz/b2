export default function MistakeBadge() {
  return (
    <div className="mistakebadge">
      <svg viewBox="0 0 24 24"><path d="M12 4V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z" /></svg>
      PREVIOUS MISTAKE
    </div>
  );
}

export function HardBadge() {
  return <div className="hardbadge">Hard exercise</div>;
}
