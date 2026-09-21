const express = require("express");
const pool = require("../db/pool");
const router = require("../lib/safe_router")();

// Single demo user for this prototype — no auth/session system yet.
const USER_ID = 1;
const REVIEW_CAP = 30;

/* Defaults to a1, deliberately. This endpoint predates levels and its existing
   caller (the A1 app) sends no parameter, so the default has to reproduce the
   old behaviour exactly: the thirty A1 topics, in order, and nothing else. A B2
   topic leaking into this response would appear as a locked node in the middle
   of a beginner's journey map. */
router.get("/curriculum", async (req, res) => {
  const level = String(req.query.level || "a1").toLowerCase();
  if (!["a1", "a2", "b1", "b2"].includes(level)) {
    return res.status(400).json({ error: "level must be one of a1, a2, b1, b2" });
  }
  const { rows } = await pool.query(
    `SELECT id, order_index, icon, title, capability, proof, subs, level
       FROM topics WHERE level = $1 AND status = 'live' ORDER BY order_index`,
    [level]
  );
  res.json(rows);
});

router.get("/state", async (req, res) => {
  const [progress, stats, review, user] = await Promise.all([
    pool.query("SELECT topic_id, sub_key FROM user_progress WHERE user_id=$1", [USER_ID]),
    pool.query("SELECT * FROM user_stats WHERE user_id=$1", [USER_ID]),
    pool.query("SELECT de, en, icon FROM review_queue WHERE user_id=$1 ORDER BY queued_at", [USER_ID]),
    pool.query("SELECT name FROM users WHERE id=$1", [USER_ID]),
  ]);
  res.json({
    done: progress.rows.map(r => `${r.topic_id}:${r.sub_key}`),
    stats: stats.rows[0] || { streak: 1, last_day: null, words: [], best_combo: 0, listen_skip_until: null, speak_skip_until: null },
    review: review.rows,
    name: user.rows[0]?.name || null,
  });
});

router.post("/progress/complete", async (req, res) => {
  const { topicId, subKey } = req.body;
  if (!topicId || !subKey) return res.status(400).json({ error: "topicId and subKey required" });

  const topicRes = await pool.query("SELECT subs FROM topics WHERE id=$1", [topicId]);
  if (!topicRes.rows[0]) return res.status(404).json({ error: "topic not found" });
  const sub = topicRes.rows[0].subs.find(s => s.key === subKey);
  if (!sub) return res.status(404).json({ error: "sub not found" });

  const inserted = await pool.query(
    `INSERT INTO user_progress (user_id, topic_id, sub_key) VALUES ($1,$2,$3)
     ON CONFLICT DO NOTHING RETURNING *`,
    [USER_ID, topicId, subKey]
  );
  const fresh = inserted.rowCount > 0;

  if (fresh) {
    // Every sub carries the topic's full teaches array for word() lookups by
    // index, but since a topic can now spread new words across learn1/learn2
    // (2 each) with apply teaching none, crediting the whole array here would
    // award words a sub never actually taught. Only credit words this sub's
    // own `teach` steps introduced.
    const newWords = sub.steps.filter(s => s.t === "teach").map(s => sub.teaches[s.w][0]);
    await pool.query(
      `UPDATE user_stats SET words = (SELECT array_agg(DISTINCT w) FROM unnest(words || $2::text[]) AS w) WHERE user_id=$1`,
      [USER_ID, newWords]
    );
    const today = new Date().toISOString().slice(0, 10);
    // Fetch last_day as plain text — letting `pg` parse it into a JS Date and
    // round-tripping through toISOString() shifts the calendar date under any
    // timezone ahead of UTC (e.g. IST), causing false same-day mismatches.
    const cur = await pool.query("SELECT last_day::text AS last_day, streak FROM user_stats WHERE user_id=$1", [USER_ID]);
    const lastDay = cur.rows[0]?.last_day || null;
    if (lastDay !== today) {
      await pool.query(
        "UPDATE user_stats SET streak = streak + $2, last_day = $3 WHERE user_id=$1",
        [USER_ID, lastDay ? 1 : 0, today]
      );
    }
  }

  const stats = await pool.query("SELECT * FROM user_stats WHERE user_id=$1", [USER_ID]);
  res.json({ fresh, stats: stats.rows[0] });
});

router.post("/review/push", async (req, res) => {
  const { de, en, icon } = req.body;
  if (!de || !en) return res.status(400).json({ error: "de and en required" });
  await pool.query(
    `INSERT INTO review_queue (user_id, de, en, icon) VALUES ($1,$2,$3,$4)
     ON CONFLICT (user_id, de) DO NOTHING`,
    [USER_ID, de, en, icon || "❓"]
  );
  // cap at 30, drop oldest first — matches the prototype's queue behavior
  await pool.query(
    `DELETE FROM review_queue WHERE user_id=$1 AND de NOT IN (
       SELECT de FROM review_queue WHERE user_id=$1 ORDER BY queued_at DESC LIMIT $2
     )`,
    [USER_ID, REVIEW_CAP]
  );
  const review = await pool.query("SELECT de, en, icon FROM review_queue WHERE user_id=$1 ORDER BY queued_at", [USER_ID]);
  res.json({ review: review.rows });
});

router.post("/review/remove", async (req, res) => {
  const { de } = req.body;
  await pool.query("DELETE FROM review_queue WHERE user_id=$1 AND de=$2", [USER_ID, de]);
  const review = await pool.query("SELECT de, en, icon FROM review_queue WHERE user_id=$1 ORDER BY queued_at", [USER_ID]);
  res.json({ review: review.rows });
});

router.post("/cooldown", async (req, res) => {
  const { kind } = req.body; // 'listen' | 'speak'
  if (kind !== "listen" && kind !== "speak") return res.status(400).json({ error: "kind must be listen or speak" });
  const col = kind === "listen" ? "listen_skip_until" : "speak_skip_until";
  const until = new Date(Date.now() + 15 * 60 * 1000);
  await pool.query(`UPDATE user_stats SET ${col} = $2 WHERE user_id=$1`, [USER_ID, until]);
  res.json({ [col]: until });
});

router.post("/combo", async (req, res) => {
  const { bestCombo } = req.body;
  await pool.query(
    "UPDATE user_stats SET best_combo = GREATEST(best_combo, $2) WHERE user_id=$1",
    [USER_ID, bestCombo || 0]
  );
  res.json({ ok: true });
});

module.exports = router;
