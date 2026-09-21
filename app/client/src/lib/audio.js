// Browser TTS is a stand-in — the real app ships pre-rendered audio for
// German lines (see architecture.md §5). Ported as-is from the prototype.
let deVoice = null, enVoice = null;
function pickVoice() {
  const v = speechSynthesis.getVoices();
  deVoice = v.find(x => x.lang && x.lang.startsWith("de")) || null;
  enVoice = v.find(x => x.lang && x.lang.startsWith("en")) || null;
}
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

let speakWatchdog = null;
function speakRaw(text, lang, voice, rate) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  clearTimeout(speakWatchdog);
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; if (voice) u.voice = voice; u.rate = rate;
  let started = false;
  u.onstart = () => { started = true; clearTimeout(speakWatchdog); };
  speechSynthesis.speak(u);
  // Chrome/WebKit can wedge the speech queue — if nothing starts within
  // 600ms, force a hard reset (the only recovery that actually works).
  speakWatchdog = setTimeout(() => {
    if (started) return;
    speechSynthesis.cancel();
    if (typeof speechSynthesis.getVoices === "function") pickVoice();
  }, 600);
}
export function speak(text, slow) { speakRaw(text, "de-DE", deVoice, slow ? 0.6 : 0.85); }
export function narrate(text) { speakRaw(text, "en-US", enVoice, 0.95); }

export function blip(ok) {
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)();
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = "sine"; o.frequency.value = ok ? 660 : 300;
    if (ok) {
      o.frequency.setValueAtTime(660, c.currentTime);
      o.frequency.setValueAtTime(880, c.currentTime + 0.09);
    }
    g.gain.setValueAtTime(0.14, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.28);
    o.start(); o.stop(c.currentTime + 0.3);
  } catch (e) {}
}
