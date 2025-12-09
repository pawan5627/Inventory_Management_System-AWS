const { getPool, getReadPool } = require("../config/db");

const listItems = async () => {
  const pool = getReadPool();
  const { rows } = await pool.query(
    `SELECT i.id, i.name, i.sku,
            COALESCE(c.name,'Uncategorized') AS category,
            i.stock, i.reorder_point as "reorderPoint",
            i.price::float as price,
            i.status, to_char(i.last_updated, 'YYYY-MM-DD') as "lastUpdated"
     FROM items i
     LEFT JOIN categories c ON c.id = i.category_id
     ORDER BY i.id DESC`
  );
  return rows;
};

const createItem = async (data) => {
  const pool = getPool();
  const catRow = data.category
    ? await pool.query(`SELECT id FROM categories WHERE name = $1 LIMIT 1`, [data.category])
    : { rows: [] };
  const categoryId = catRow.rows[0]?.id || null;

  const { rows } = await pool.query(
    `INSERT INTO items (name, sku, category_id, stock, reorder_point, price, status, last_updated)
     VALUES ($1,$2,$3,$4,$5,$6,$7, CURRENT_DATE)
     RETURNING id`,
    [data.name, data.sku, categoryId, data.stock || 0, data.reorderPoint || 0, data.price || 0, data.status || 'In Stock']
  );
  return await getItemById(rows[0].id);
};

const getItemById = async (id) => {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT i.id, i.name, i.sku,
            COALESCE(c.name,'Uncategorized') AS category,
            i.stock, i.reorder_point as "reorderPoint",
            i.price::float as price,
            i.status, to_char(i.last_updated, 'YYYY-MM-DD') as "lastUpdated"
     FROM items i
     LEFT JOIN categories c ON c.id = i.category_id
     WHERE i.id = $1`,
    [id]
  );
  return rows[0] || null;
};

module.exports = { listItems, createItem, getItemById };
