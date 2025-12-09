const { getPool } = require("../config/db");

const createRole = async (data) => {
  const pool = getPool();
  const name = data.name;
  const description = data.description || null;
  const status = data.status || 'Active';
  const permissions = Array.isArray(data.permissions) ? data.permissions : [];
  const { rows } = await pool.query(
    `INSERT INTO roles (name, description, status, permissions)
     VALUES ($1, $2, $3, $4::jsonb)
     RETURNING id, name, description, status, permissions`,
    [name, description, status, JSON.stringify(permissions)]
  );
  const r = rows[0];
  return { id: r.id, name: r.name, description: r.description, status: r.status, permissions: r.permissions || [] };
};

const listRoles = async () => {
  const pool = getPool();
  const { rows } = await pool.query(`SELECT id, name, description, status, permissions FROM roles ORDER BY id DESC`);
  return rows.map(r => ({ id: r.id, name: r.name, description: r.description, status: r.status, permissions: r.permissions || [] }));
};

const getRoleById = async (id) => {
  const pool = getPool();
  const { rows } = await pool.query(`SELECT id, name, description, status, permissions FROM roles WHERE id = $1`, [id]);
  const r = rows[0];
  return r ? { id: r.id, name: r.name, description: r.description, status: r.status, permissions: r.permissions || [] } : null;
};

const updateRole = async (id, data) => {
  const pool = getPool();
  const name = data.name;
  const description = data.description || null;
  const status = data.status || 'Active';
  const permissions = Array.isArray(data.permissions) ? data.permissions : [];
  const { rows } = await pool.query(
    `UPDATE roles
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           status = COALESCE($4, status),
           permissions = COALESCE($5::jsonb, permissions)
     WHERE id = $1
     RETURNING id, name, description, status, permissions`,
    [id, name || null, description, status, JSON.stringify(permissions)]
  );
  const r = rows[0];
  return r ? { id: r.id, name: r.name, description: r.description, status: r.status, permissions: r.permissions || [] } : null;
};

module.exports = { createRole, listRoles, getRoleById, updateRole };
