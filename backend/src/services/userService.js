const { getPool } = require("../config/db");
const bcrypt = require("bcryptjs");

const createUser = async ({ username, email, password, companyId }) => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
  const hashed = await bcrypt.hash(password, saltRounds);
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO users (username, password_hash, created_at)
     VALUES ($1, $2, NOW())
     RETURNING id, username`,
    [username, hashed]
  );
  return rows[0];
};

const findByUsername = async (username) => {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.password_hash
     FROM users u
     WHERE u.username = $1
     LIMIT 1`,
    [username]
  );
  return rows[0] || null;
};

const listUsers = async () => {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id, username, created_at FROM users ORDER BY id DESC`
  );
  return rows;
};

const addGroupsToUser = async (userId, groupIds) => {
  const pool = getPool();
  // ensure user exists
  const userCheck = await pool.query(`SELECT id FROM users WHERE id = $1`, [userId]);
  if (!userCheck.rowCount) throw new Error("User not found");
  // insert memberships, ignore duplicates
  for (const gid of groupIds) {
    await pool.query(
      `INSERT INTO user_groups (user_id, group_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, group_id) DO NOTHING`,
      [userId, gid]
    );
  }
  return { id: userId, groupsAdded: groupIds };
};

module.exports = { createUser, findByUsername, listUsers, addGroupsToUser };
