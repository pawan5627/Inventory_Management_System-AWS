const { getPool, getReadPool } = require("../config/db");

const listDepartments = async () => {
  const pool = getReadPool();
  const { rows } = await pool.query(
    `SELECT id, code, name, head, employees, location, budget, status FROM departments ORDER BY id DESC`
  );
  return rows.map(r => ({
    id: r.id,
    code: r.code,
    name: r.name,
    head: r.head,
    employees: r.employees,
    location: r.location,
    budget: r.budget,
    status: r.status
  }));
};

const createDepartment = async (data) => {
  const pool = getPool();
  const { code, name, head = null, employees = 0, location = null, budget = null, status = 'Active' } = data;
  const { rows } = await pool.query(
    `INSERT INTO departments (code, name, head, employees, location, budget, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, head=EXCLUDED.head, employees=EXCLUDED.employees, location=EXCLUDED.location, budget=EXCLUDED.budget, status=EXCLUDED.status
     RETURNING id, code, name, head, employees, location, budget, status`,
    [code, name, head, employees, location, budget, status]
  );
  return rows[0];
};

const updateDepartment = async (id, data) => {
  const pool = getPool();
  const { code = null, name = null, head = null, employees = null, location = null, budget = null, status = null } = data;
  const { rows } = await pool.query(
    `UPDATE departments SET
       code = COALESCE($2, code),
       name = COALESCE($3, name),
       head = COALESCE($4, head),
       employees = COALESCE($5, employees),
       location = COALESCE($6, location),
       budget = COALESCE($7, budget),
       status = COALESCE($8, status)
     WHERE id = $1
     RETURNING id, code, name, head, employees, location, budget, status`,
    [id, code, name, head, employees, location, budget, status]
  );
  return rows[0] || null;
};

module.exports = { listDepartments, createDepartment, updateDepartment };
