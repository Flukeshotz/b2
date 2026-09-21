const express = require("express");
const pool = require("../db/pool");
const auth = require("../auth");

const router = require("../lib/safe_router")();

const validEmail = (e) => typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!validEmail(email)) return res.status(400).json({ error: "invalid_email" });
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "weak_password", message: "Password must be at least 8 characters." });
  }
  const existing = await pool.query(`SELECT id FROM users WHERE email=$1`, [email]);
  if (existing.rows[0]) return res.status(409).json({ error: "email_taken" });

  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id, email`,
    [name || email.split("@")[0], email, auth.hashPassword(password)]);
  const session = await auth.createSession(rows[0].id);
  res.status(201).json({ token: session.token, user: { id: rows[0].id, email: rows[0].email } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!validEmail(email) || typeof password !== "string") return res.status(400).json({ error: "invalid_credentials" });

  const { rows } = await pool.query(`SELECT id, email, password_hash FROM users WHERE email=$1`, [email]);
  const user = rows[0];
  // Same response whether the email is unknown or the password is wrong —
  // telling them apart lets an attacker enumerate registered emails.
  if (!user || !user.password_hash || !auth.verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "invalid_credentials" });
  }
  const session = await auth.createSession(user.id);
  res.json({ token: session.token, user: { id: user.id, email: user.email } });
});

router.post("/demo", async (req, res) => {
  let user = (await pool.query(`SELECT id, email FROM users WHERE id=1`)).rows[0];
  if (!user) {
    const inserted = await pool.query(
      `INSERT INTO users (id, name, email) VALUES (1, 'Priya Sharma', 'priya@skillcase.de') RETURNING id, email`
    );
    user = inserted.rows[0];
  }
  const session = await auth.createSession(user.id);
  res.json({ token: session.token, user: { id: user.id, email: user.email || "priya@skillcase.de" } });
});

router.post("/logout", async (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) await auth.destroySession(token);
  res.json({ ok: true });
});

router.get("/me", auth.requireAuth, (req, res) => {
  res.json({ user: { id: req.userId, email: req.userEmail } });
});

module.exports = router;
