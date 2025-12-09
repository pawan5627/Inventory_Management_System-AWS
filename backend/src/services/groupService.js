const { getPool } = require("../config/db");

const createGroup = async (data) => {
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO groups (name) VALUES ($1) RETURNING id, name`,
    [data.name]
  );
  return rows[0];
};

const listGroups = async () => {
  const pool = getPool();
  const { rows } = await pool.query(`SELECT id, name FROM groups ORDER BY id DESC`);
  return rows;
};

const addRolesToGroup = async (groupId, roleIds) => {
  const pool = getPool();
  const groupCheck = await pool.query(`SELECT id FROM groups WHERE id = $1`, [groupId]);
  if (!groupCheck.rowCount) throw new Error("Group not found");
  for (const rid of roleIds) {
    await pool.query(
      `INSERT INTO group_roles (group_id, role_id)
       VALUES ($1, $2)
       ON CONFLICT (group_id, role_id) DO NOTHING`,
      [groupId, rid]
    );
  }
  return { id: groupId, rolesAdded: roleIds };
};

const updateGroup = async (id, data) => {
  const pool = getPool();
  
  // Build dynamic update query
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.status !== undefined) {
    updates.push(`status = $${paramCount++}`);
    values.push(data.status);
  }
  if (data.description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(data.description);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(id);
  await pool.query(
    `UPDATE groups SET ${updates.join(', ')} WHERE id = $${paramCount}`,
    values
  );

  // Return updated group
  const { rows } = await pool.query(
    `SELECT id, name, status, description FROM groups WHERE id = $1`,
    [id]
  );

  return rows[0] || null;
};

module.exports = { createGroup, listGroups, addRolesToGroup, updateGroup };
