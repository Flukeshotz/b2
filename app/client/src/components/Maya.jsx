import mayaNeutral from "../assets/maya/maya-neutral.png";
import mayaCheer from "../assets/maya/maya-cheer.png";
import mayaWobble from "../assets/maya/maya-wobble.png";
import mayaCurious from "../assets/maya/maya-curious.png";
import mayaWave from "../assets/maya/maya-wave.png";
import mayaThumbsup from "../assets/maya/maya-thumbsup.png";

// The real Skillcase Maya character (not a hand-drawn placeholder) — one
// photo per mood, swapped by the same `mood` prop every screen already uses.
const MOODS = {
  bob: mayaNeutral,
  cheer: mayaCheer,
  wobble: mayaWobble,
  curious: mayaCurious,
  concerned: mayaWobble,
  greet: mayaWave,
  proud: mayaThumbsup,
};

export default function Maya({ mood = "bob", className = "" }) {
  const src = MOODS[mood] || MOODS.bob;
  return (
    <img className={`maya ${mood} ${className}`} src={src} alt="Maya" draggable="false" />
  );
}

export function MayaSays({ text, mood }) {
  return (
    <div className="maya-wrap">
      <Maya mood={mood} />
      <div className="bubble maya-says">{text}</div>
    </div>
  );
}
