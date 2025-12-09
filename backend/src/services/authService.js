const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getPool } = require("../config/db");

const login = async (username, password) => {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.password_hash
       FROM users u
      WHERE u.username = $1
      LIMIT 1`,
    [username]
  );
  const user = rows[0];
  if (!user) throw new Error("Invalid credentials");
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error("Invalid credentials");

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
  return { token, user: { id: user.id, username: user.username, roles: payload.roles } };
};

module.exports = { login };
