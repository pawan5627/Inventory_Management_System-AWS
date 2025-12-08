const { getPool } = require("../config/db");

const createRole = async (data) => {
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO roles (name) VALUES ($1) RETURNING id, name`,
    [data.name]
  );
  return rows[0];
};

const listRoles = async () => {
  const pool = getPool();
  const { rows } = await pool.query(`SELECT id, name FROM roles ORDER BY id DESC`);
  return rows;
};

const getRoleById = async (id) => {
  const pool = getPool();
  const { rows } = await pool.query(`SELECT id, name FROM roles WHERE id = $1`, [id]);
  return rows[0] || null;
};

module.exports = { createRole, listRoles, getRoleById };
