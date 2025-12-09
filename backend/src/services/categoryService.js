const { getPool, getReadPool } = require("../config/db");

// Now using the dedicated categories table

const listCategories = async () => {
  const pool = getReadPool();
  const { rows } = await pool.query(
    `SELECT c.id, c.name, c.description, c.status,
            COALESCE(i.items_count, 0) AS items_count
       FROM categories c
       LEFT JOIN (
         SELECT category_id, COUNT(*) AS items_count
         FROM items
         GROUP BY category_id
       ) i ON i.category_id = c.id
     ORDER BY c.id DESC`
  );
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    status: r.status,
    itemsCount: Number(r.items_count || 0)
  }));
};

const createCategory = async ({ name, description = null, status = 'Active' }) => {
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO categories (name, description, status)
     VALUES ($1, $2, $3)
     ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, status = EXCLUDED.status
     RETURNING id, name, description, status`,
    [name, description, status]
  );
  const r = rows[0];
  return { id: r.id, name: r.name, description: r.description, status: r.status };
};

module.exports = { listCategories, createCategory };
