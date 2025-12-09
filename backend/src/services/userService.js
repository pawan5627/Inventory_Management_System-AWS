const { getPool, getReadPool } = require("../config/db");
const bcrypt = require("bcryptjs");

const createUser = async ({ username, email, password, departmentCode = null, companyCode = null, name = null, status = 'Active' }) => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
  const hashed = await bcrypt.hash(password, saltRounds);
  // Use writer pool for consistency on inserts and related lookups
  const pool = getPool();
  // find department/company IDs by code if provided
  let departmentId = null;
  let companyId = null;
  if (departmentCode) {
    const dep = await pool.query(`SELECT id FROM departments WHERE code = $1`, [departmentCode]);
    departmentId = dep.rows[0]?.id || null;
  }
  if (companyCode) {
    const comp = await pool.query(`SELECT id FROM companies WHERE code = $1`, [companyCode]);
    companyId = comp.rows[0]?.id || null;
  }
  const { rows } = await pool.query(
    `INSERT INTO users (username, password_hash, name, email, status, department_id, company_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING id, username, name, email, status, department_id, company_id`,
    [username, hashed, name, email, status, departmentId, companyId]
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
    `SELECT u.id, u.username, u.name, u.email, u.status, u.last_login,
            d.name AS department, c.name AS company,
            COALESCE(json_agg(json_build_object('id', g.id, 'name', g.name)) FILTER (WHERE g.id IS NOT NULL), '[]') AS groups
       FROM users u
       LEFT JOIN departments d ON d.id = u.department_id
       LEFT JOIN companies c ON c.id = u.company_id
       LEFT JOIN user_groups ug ON ug.user_id = u.id
       LEFT JOIN groups g ON g.id = ug.group_id
     GROUP BY u.id, d.name, c.name
     ORDER BY u.id DESC`
  );
  return rows.map(r => ({
    id: r.id,
    username: r.username,
    name: r.name,
    email: r.email,
    status: r.status,
    lastLogin: r.last_login,
    department: r.department,
    company: r.company,
    groups: r.groups || []
  }));
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
