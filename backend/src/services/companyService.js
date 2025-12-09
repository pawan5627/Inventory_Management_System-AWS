const { getPool, getReadPool } = require("../config/db");

const listCompanies = async () => {
  const pool = getReadPool();
  const { rows } = await pool.query(
    `SELECT id, code, name, industry, employees, revenue, location, established, status
       FROM companies
       ORDER BY id DESC`
  );
  return rows.map(r => ({
    id: r.id,
    code: r.code,
    name: r.name,
    industry: r.industry,
    employees: r.employees,
    revenue: r.revenue,
    location: r.location,
    established: r.established,
    status: r.status
  }));
};

const createCompany = async (data) => {
  const pool = getPool();
  const { code, name, industry = null, employees = 0, revenue = null, location = null, established = null, status = 'Active' } = data;
  const { rows } = await pool.query(
    `INSERT INTO companies (code, name, industry, employees, revenue, location, established, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, industry=EXCLUDED.industry, employees=EXCLUDED.employees, revenue=EXCLUDED.revenue, location=EXCLUDED.location, established=EXCLUDED.established, status=EXCLUDED.status
     RETURNING id, code, name, industry, employees, revenue, location, established, status`,
    [code, name, industry, employees, revenue, location, established, status]
  );
  return rows[0];
};

const updateCompany = async (id, data) => {
  const pool = getPool();
  const { code = null, name = null, industry = null, employees = null, revenue = null, location = null, established = null, status = null } = data;
  const { rows } = await pool.query(
    `UPDATE companies SET
       code = COALESCE($2, code),
       name = COALESCE($3, name),
       industry = COALESCE($4, industry),
       employees = COALESCE($5, employees),
       revenue = COALESCE($6, revenue),
       location = COALESCE($7, location),
       established = COALESCE($8, established),
       status = COALESCE($9, status)
     WHERE id = $1
     RETURNING id, code, name, industry, employees, revenue, location, established, status`,
    [id, code, name, industry, employees, revenue, location, established, status]
  );
  return rows[0] || null;
};

module.exports = { listCompanies, createCompany, updateCompany };
