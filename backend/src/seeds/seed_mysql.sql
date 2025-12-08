-- Minimal schema for users, roles, groups, and inventory items

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
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
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  sku VARCHAR(64) NOT NULL UNIQUE,
  quantity INT NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed example data
INSERT IGNORE INTO roles (name) VALUES
  ('user.create'), ('user.read'), ('user.update'),
  ('group.create'), ('group.read'), ('group.update'),
  ('role.create'), ('role.read');

INSERT IGNORE INTO groups (name) VALUES ('admins');

-- Note: create admin user and link to admins group after hashing password in service layer.
