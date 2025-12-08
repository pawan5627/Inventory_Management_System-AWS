const { getPool } = require("../config/db");

// Using groups table as categories (has id, name). If you want a distinct categories table, create it similarly.

const listCategories = async () => {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id, name FROM groups ORDER BY id DESC`
  );
  return rows;
};

const createCategory = async ({ id, name }) => {
  const pool = getPool();
  if (id) {
    const { rows } = await pool.query(
      `INSERT INTO groups (id, name) VALUES ($1, $2) RETURNING id, name`,
      [id, name]
    );
    return rows[0];
  }
  const { rows } = await pool.query(
    `INSERT INTO groups (name) VALUES ($1) RETURNING id, name`,
    [name]
  );
  return rows[0];
};

module.exports = { listCategories, createCategory };
