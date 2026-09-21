/**
 * REAL PER-REQUEST IDENTITY.
 *
 * Replaces the hardcoded `USER_ID = 1` every route used to run as. No new
 * native dependency: password hashing uses Node's built-in `crypto.scrypt`
 * rather than bcrypt, so nothing needs to compile in a sandboxed environment.
 * Sessions are opaque random tokens in a DB table, sent as a Bearer header —
 * no JWT, nothing to forge client-side, nothing that survives a DB wipe.
 *
 * WHAT THIS IS NOT: no OAuth, no email verification, no password reset, no
 * rate limiting on login attempts. Real gaps, not hidden by this module —
 * see B2_PRODUCTION_MASTER_MATRIX.md.
 */

const crypto = require("node:crypto");
const pool = require("./db/pool");

const SCRYPT_KEYLEN = 64;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  const want = Buffer.from(hash, "hex");
  // Constant-time compare — a length mismatch would throw in timingSafeEqual,
  // so guard it explicitly rather than let a malformed hash 500 the request.
  return want.length === check.length && crypto.timingSafeEqual(check, want);
}

async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await pool.query(
    `INSERT INTO sessions (token, user_id, expires_at) VALUES ($1,$2,$3)`,
    [token, userId, expiresAt]);
  return { token, expiresAt };
}

async function destroySession(token) {
  await pool.query(`DELETE FROM sessions WHERE token=$1`, [token]);
}

async function userForToken(token) {
  if (!token) return null;
  const { rows } = await pool.query(
    `SELECT u.id, u.email FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token=$1 AND s.expires_at > now()`, [token]);
  return rows[0] || null;
}

/** Bearer-token auth middleware. Sets req.userId; never trusts anything the
    client claims about who it is beyond a session token it was issued. */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    const user = await userForToken(token);
    if (!user) return res.status(401).json({ error: "unauthenticated" });
    req.userId = user.id;
    req.userEmail = user.email;
    next();
  } catch (err) { next(err); }
}

module.exports = { hashPassword, verifyPassword, createSession, destroySession, userForToken, requireAuth };
