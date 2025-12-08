-- Minimal schema for users, roles, groups, and inventory items (PostgreSQL)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE
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
  quantity INT NOT NULL DEFAULT 0,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed example roles and groups
INSERT INTO roles (name)
SELECT name FROM (VALUES
  ('user.create'), ('user.read'), ('user.update'),
  ('group.create'), ('group.read'), ('group.update'),
  ('role.create'), ('role.read')
) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM roles r WHERE r.name = v.name
);

INSERT INTO groups (name)
SELECT name FROM (VALUES ('admins')) AS v(name)
WHERE NOT EXISTS (
  SELECT 1 FROM groups g WHERE g.name = v.name
);
