-- Minimal schema for users, roles, groups, and inventory items (PostgreSQL)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(128),
  email VARCHAR(128) UNIQUE,
  status VARCHAR(32) DEFAULT 'Active',
  last_login TIMESTAMPTZ,
  department_id INT,
  company_id INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(32) DEFAULT 'Active',
  permissions JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(32) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_groups (
  user_id INT NOT NULL,
  group_id INT NOT NULL,
  PRIMARY KEY (user_id, group_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS group_roles (
  group_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (group_id, role_id),
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  sku VARCHAR(64) NOT NULL UNIQUE,
  category_id INT,
  stock INT NOT NULL DEFAULT 0,
  reorder_point INT NOT NULL DEFAULT 0,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(32) DEFAULT 'In Stock',
  last_updated DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(32) DEFAULT 'Active'
);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  code VARCHAR(32) UNIQUE,
  name VARCHAR(128) NOT NULL,
  head VARCHAR(128),
  employees INT DEFAULT 0,
  location VARCHAR(128),
  budget VARCHAR(64),
  status VARCHAR(32) DEFAULT 'Active'
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  code VARCHAR(32) UNIQUE,
  name VARCHAR(128) NOT NULL,
  industry VARCHAR(128),
  employees INT DEFAULT 0,
  revenue VARCHAR(64),
  location VARCHAR(128),
  established INT,
  status VARCHAR(32) DEFAULT 'Active'
);

-- Foreign keys linking users to departments/companies
ALTER TABLE users
  ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- Seed example roles and groups
INSERT INTO roles (name)
SELECT name FROM (VALUES
  ('user.create'), ('user.read'), ('user.update'),
  ('group.create'), ('group.read'), ('group.update'),
  ('role.create'), ('role.read'), ('role.update'),
  ('department.create'), ('department.read'), ('department.update'),
  ('company.create'), ('company.read'), ('company.update'),
  ('category.create'), ('category.read'), ('category.update'),
  ('item.create'), ('item.read'), ('item.update')
) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM roles r WHERE r.name = v.name
);

INSERT INTO groups (name)
SELECT name FROM (VALUES ('admins'), ('managers'), ('employees'), ('guests')) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM groups g WHERE g.name = v.name
);

-- Seed categories
INSERT INTO categories (name, description, status)
SELECT * FROM (VALUES
  ('Electronics','Devices and accessories','Active'),
  ('Stationery','Office supplies','Active'),
  ('Furniture','Home and office furniture','Active'),
  ('Appliances','Kitchen and home appliances','Active')
) AS v(name, description, status)
ON CONFLICT (name) DO NOTHING;

-- Seed companies
INSERT INTO companies (code, name, industry, employees, revenue, location, established, status)
VALUES
  ('COM-001','Tech Corp','Technology',500,'$50M','New York',2010,'Active'),
  ('COM-002','Sales Partners Inc','Sales',150,'$15M','Chicago',2015,'Active'),
  ('COM-003','Global Solutions','Consulting',200,'$25M','Los Angeles',2012,'Active')
ON CONFLICT (code) DO NOTHING;

-- Seed departments
INSERT INTO departments (code, name, head, employees, location, budget, status)
VALUES
  ('DEP-001','Information Technology','John Doe',15,'Building A','$500,000','Active'),
  ('DEP-002','Sales','Jane Smith',25,'Building B','$1,200,000','Active'),
  ('DEP-003','Human Resources','Bob Johnson',8,'Building A','$300,000','Active'),
  ('DEP-004','Finance','Alice Brown',12,'Building C','$400,000','Active')
ON CONFLICT (code) DO NOTHING;

-- Seed items
INSERT INTO items (name, sku, category_id, stock, reorder_point, price, status)
SELECT 'Wireless Mouse','WM-001', c1.id, 145, 50, 29.99, 'In Stock' FROM categories c1 WHERE c1.name='Electronics'
ON CONFLICT (sku) DO NOTHING;
INSERT INTO items (name, sku, category_id, stock, reorder_point, price, status)
SELECT 'USB-C Cable','UC-002', c1.id, 42, 50, 12.99, 'Low Stock' FROM categories c1 WHERE c1.name='Electronics'
ON CONFLICT (sku) DO NOTHING;
INSERT INTO items (name, sku, category_id, stock, reorder_point, price, status)
SELECT 'Notebook A5','NB-003', c1.id, 0, 100, 8.99, 'Out of Stock' FROM categories c1 WHERE c1.name='Stationery'
ON CONFLICT (sku) DO NOTHING;

-- Admin user and memberships
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN
    INSERT INTO users (username, password_hash, name, email, status, created_at)
    VALUES (
      'admin',
      -- bcrypt hash for 'ChangeMe123!'
      '$2a$10$7dWc3aQ1I3WmBqkqfGgK2uUq3O4a5KJ0p7eT6YkD6J1u5y8fQvE1K',
      'Admin User','admin@example.com','Active', NOW()
    );
  END IF;
END $$;

-- assign admin to admins group and grant all roles to admins group
INSERT INTO user_groups (user_id, group_id)
SELECT u.id, g.id FROM users u CROSS JOIN groups g
WHERE u.username='admin' AND g.name='admins'
ON CONFLICT (user_id, group_id) DO NOTHING;

INSERT INTO group_roles (group_id, role_id)
SELECT g.id, r.id FROM groups g CROSS JOIN roles r
WHERE g.name='admins'
ON CONFLICT (group_id, role_id) DO NOTHING;

-- Additional sample users
DO $$
DECLARE it_id INT; sa_id INT; hr_id INT; fin_id INT; tc_id INT; sp_id INT; gs_id INT;
BEGIN
  SELECT id INTO it_id FROM departments WHERE code='DEP-001';
  SELECT id INTO sa_id FROM departments WHERE code='DEP-002';
  SELECT id INTO hr_id FROM departments WHERE code='DEP-003';
  SELECT id INTO fin_id FROM departments WHERE code='DEP-004';
  SELECT id INTO tc_id FROM companies WHERE code='COM-001';
  SELECT id INTO sp_id FROM companies WHERE code='COM-002';
  SELECT id INTO gs_id FROM companies WHERE code='COM-003';

  IF NOT EXISTS (SELECT 1 FROM users WHERE username='john') THEN
    INSERT INTO users (username, password_hash, name, email, status, last_login, department_id, company_id)
    VALUES ('john', '$2a$10$7dWc3aQ1I3WmBqkqfGgK2uUq3O4a5KJ0p7eT6YkD6J1u5y8fQvE1K', 'John Doe', 'john@example.com', 'Active', NOW() - INTERVAL '1 day', it_id, tc_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE username='jane') THEN
    INSERT INTO users (username, password_hash, name, email, status, last_login, department_id, company_id)
    VALUES ('jane', '$2a$10$7dWc3aQ1I3WmBqkqfGgK2uUq3O4a5KJ0p7eT6YkD6J1u5y8fQvE1K', 'Jane Smith', 'jane@example.com', 'Active', NOW() - INTERVAL '3 hours', sa_id, tc_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE username='bob') THEN
    INSERT INTO users (username, password_hash, name, email, status, last_login, department_id, company_id)
    VALUES ('bob', '$2a$10$7dWc3aQ1I3WmBqkqfGgK2uUq3O4a5KJ0p7eT6YkD6J1u5y8fQvE1K', 'Bob Johnson', 'bob@example.com', 'Inactive', NOW() - INTERVAL '2 days', hr_id, tc_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE username='alice') THEN
    INSERT INTO users (username, password_hash, name, email, status, last_login, department_id, company_id)
    VALUES ('alice', '$2a$10$7dWc3aQ1I3WmBqkqfGgK2uUq3O4a5KJ0p7eT6YkD6J1u5y8fQvE1K', 'Alice Brown', 'alice@example.com', 'Active', NOW() - INTERVAL '20 hours', fin_id, tc_id);
  END IF;
END $$;

-- Assign users to groups
INSERT INTO user_groups (user_id, group_id)
SELECT u.id, g.id FROM users u JOIN groups g ON g.name='managers' WHERE u.username IN ('jane','alice')
ON CONFLICT (user_id, group_id) DO NOTHING;
INSERT INTO user_groups (user_id, group_id)
SELECT u.id, g.id FROM users u JOIN groups g ON g.name='employees' WHERE u.username IN ('john','bob')
ON CONFLICT (user_id, group_id) DO NOTHING;

-- Grant permissions to groups (subset for non-admins)
INSERT INTO group_roles (group_id, role_id)
SELECT g.id, r.id FROM groups g JOIN roles r ON r.name IN ('item.read','item.update','category.read','user.read','department.read','company.read') WHERE g.name='managers'
ON CONFLICT (group_id, role_id) DO NOTHING;
INSERT INTO group_roles (group_id, role_id)
SELECT g.id, r.id FROM groups g JOIN roles r ON r.name IN ('item.read','category.read') WHERE g.name='employees'
ON CONFLICT (group_id, role_id) DO NOTHING;
INSERT INTO group_roles (group_id, role_id)
SELECT g.id, r.id FROM groups g JOIN roles r ON r.name IN ('item.read') WHERE g.name='guests'
ON CONFLICT (group_id, role_id) DO NOTHING;

-- Ensure roles.permissions field has at least itself for display purposes
UPDATE roles SET permissions = jsonb_build_array(name) WHERE (permissions IS NULL OR jsonb_array_length(permissions) = 0);
