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

module.exports = { createGroup, listGroups, addRolesToGroup };
