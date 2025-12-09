const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getPool } = require("../config/db");
const crypto = require('crypto');

const login = async (identifier, password) => {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.email, u.password_hash
       FROM users u
      WHERE LOWER(u.username) = LOWER($1) OR LOWER(u.email) = LOWER($1)
      LIMIT 1`,
    [identifier]
  );
  const user = rows[0];
  if (!user) throw new Error("Invalid credentials");
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error("Invalid credentials");

  // record last login timestamp
  await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

  // derive roles (flatten)
  const roleNames = new Set();
  const ro = await pool.query(
    `SELECT r.name FROM roles r
       INNER JOIN group_roles gr ON gr.role_id = r.id
       INNER JOIN user_groups ug ON ug.group_id = gr.group_id
      WHERE ug.user_id = $1`,
    [user.id]
  );
  ro.rows.forEach(r => roleNames.add(r.name));

  const payload = {
    sub: String(user.id),
    username: user.username,
    roles: Array.from(roleNames),
    companyId: null
  };

  const secret = process.env.JWT_SECRET || 'dev-secret';
  const token = jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
  return { token, user: { id: user.id, username: user.username, email: user.email, roles: payload.roles } };
};

module.exports = { login };

// Ensure password_resets table exists
let resetTableChecked = false;
const ensureResetTable = async (pool) => {
  if (resetTableChecked) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(128) NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
  resetTableChecked = true;
};

const createPasswordReset = async (email) => {
  const pool = getPool();
  await ensureResetTable(pool);
  const { rows } = await pool.query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`, [email]);
  const userId = rows[0]?.id;
  if (!userId) throw new Error('No account with that email');
  const token = crypto.randomBytes(32).toString('hex');
  const expiresInMinutes = parseInt(process.env.RESET_TOKEN_TTL_MIN || '30', 10);
  await pool.query(`INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1,$2, NOW() + ($3 || ' minutes')::interval)`, [userId, token, String(expiresInMinutes)]);
  const base = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
  const url = `${base}/?view=reset&token=${token}`;
  return url;
};

const resetPasswordWithToken = async (token, password) => {
  const pool = getPool();
  await ensureResetTable(pool);
  const { rows } = await pool.query(`
    SELECT pr.user_id, pr.used, pr.expires_at
      FROM password_resets pr
     WHERE pr.token = $1
     LIMIT 1
  `, [token]);
  const pr = rows[0];
  if (!pr) throw new Error('Invalid reset token');
  if (pr.used) throw new Error('Reset token already used');
  if (new Date(pr.expires_at) < new Date()) throw new Error('Reset token expired');
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
  const hashed = await bcrypt.hash(password, saltRounds);
  await pool.query(`UPDATE users SET password_hash = $2 WHERE id = $1`, [pr.user_id, hashed]);
  await pool.query(`UPDATE password_resets SET used = TRUE WHERE token = $1`, [token]);
  return { ok: true };
};

module.exports.createPasswordReset = createPasswordReset;
module.exports.resetPasswordWithToken = resetPasswordWithToken;
