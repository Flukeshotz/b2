const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function req(path, opts) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

export const api = {
  // Defaults to a1 so every existing caller behaves exactly as before.
  getCurriculum: (level) => req(level ? `/curriculum?level=${level}` : "/curriculum"),
  getState: () => req("/state"),
  completeSub: (topicId, subKey) =>
    req("/progress/complete", { method: "POST", body: JSON.stringify({ topicId, subKey }) }),
  pushReview: (de, en, icon) =>
    req("/review/push", { method: "POST", body: JSON.stringify({ de, en, icon }) }),
  removeReview: (de) =>
    req("/review/remove", { method: "POST", body: JSON.stringify({ de }) }),
  setCooldown: (kind) =>
    req("/cooldown", { method: "POST", body: JSON.stringify({ kind }) }),
  reportCombo: (bestCombo) =>
    req("/combo", { method: "POST", body: JSON.stringify({ bestCombo }) }),
};
