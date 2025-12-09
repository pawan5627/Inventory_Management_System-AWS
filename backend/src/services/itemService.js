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

const updateItem = async (id, data) => {
  const pool = getPool();
  
  // Get category ID if category name is provided
  let categoryId = null;
  if (data.category) {
    const catRow = await pool.query(`SELECT id FROM categories WHERE name = $1 LIMIT 1`, [data.category]);
    categoryId = catRow.rows[0]?.id || null;
  }

  // Build dynamic update query
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.sku !== undefined) {
    updates.push(`sku = $${paramCount++}`);
    values.push(data.sku);
  }
  if (categoryId !== null || data.category !== undefined) {
    updates.push(`category_id = $${paramCount++}`);
    values.push(categoryId);
  }
  if (data.stock !== undefined) {
    updates.push(`stock = $${paramCount++}`);
    values.push(data.stock);
  }
  if (data.reorderPoint !== undefined) {
    updates.push(`reorder_point = $${paramCount++}`);
    values.push(data.reorderPoint);
  }
  if (data.price !== undefined) {
    updates.push(`price = $${paramCount++}`);
    values.push(data.price);
  }
  if (data.status !== undefined) {
    updates.push(`status = $${paramCount++}`);
    values.push(data.status);
  }
  
  updates.push(`last_updated = CURRENT_DATE`);
  values.push(id);

  await pool.query(
    `UPDATE items SET ${updates.join(', ')} WHERE id = $${paramCount}`,
    values
  );

  return await getItemById(id);
};

module.exports = { listItems, createItem, getItemById, updateItem };
