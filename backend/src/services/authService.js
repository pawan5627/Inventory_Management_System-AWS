const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { getPool } = require("../config/db");

const login = async (identifier, password) => {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.email, u.password_hash
       FROM users u
      WHERE LOWER(u.username) = LOWER($1) OR LOWER(u.email) = LOWER($1)
      LIMIT 1`,
    [identifier]
  );
  const user = rows[0];
  if (!user) throw new Error("Invalid credentials");
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error("Invalid credentials");

  // derive roles (flatten)
  const roleNames = new Set();
  const ro = await pool.query(
    `SELECT r.name FROM roles r
       INNER JOIN group_roles gr ON gr.role_id = r.id
       INNER JOIN user_groups ug ON ug.group_id = gr.group_id
      WHERE ug.user_id = $1`,
    [user.id]
  );
  ro.rows.forEach(r => roleNames.add(r.name));

  const payload = {
    sub: String(user.id),
    username: user.username,
    roles: Array.from(roleNames),
    companyId: null
  };

  const secret = process.env.JWT_SECRET || 'dev-secret';
  const token = jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
  return { token, user: { id: user.id, username: user.username, email: user.email, roles: payload.roles } };
};

const signup = async ({ username, email, password, firstName, lastName, employeeId, departmentCode, companyCode, groupId }) => {
  const pool = getPool();
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
  const hashed = await bcrypt.hash(password, saltRounds);

  // Check if username or email already exists
  const existingUser = await pool.query(
    `SELECT id FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2)`,
    [username, email]
  );
  if (existingUser.rows.length > 0) {
    throw new Error("Username or email already exists");
  }

  // Find department/company IDs by code if provided
  let departmentId = null;
  let companyId = null;
  if (departmentCode) {
    const dep = await pool.query(`SELECT id FROM departments WHERE code = $1`, [departmentCode]);
    departmentId = dep.rows[0]?.id || null;
  }
  if (companyCode) {
    const comp = await pool.query(`SELECT id FROM companies WHERE code = $1`, [companyCode]);
    companyId = comp.rows[0]?.id || null;
  }

  // Generate username from email if not provided
  const finalUsername = username || email.split('@')[0];
  const name = firstName ? `${firstName}${lastName ? ' ' + lastName : ''}` : null;

  // Create user
  const { rows } = await pool.query(
    `INSERT INTO users (username, password_hash, name, email, status, department_id, company_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING id, username, name, email, status`,
    [finalUsername, hashed, name, email, 'Active', departmentId, companyId]
  );
  const user = rows[0];

  // Add user to group if groupId provided
  if (groupId) {
    await pool.query(
      `INSERT INTO user_groups (user_id, group_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, group_id) DO NOTHING`,
      [user.id, groupId]
    );
  }

  return { id: user.id, username: user.username, email: user.email, name: user.name };
};

const forgotPassword = async (email) => {
  const pool = getPool();
  
  // Find user by email
  const { rows } = await pool.query(
    `SELECT id, username, email FROM users WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  
  if (rows.length === 0) {
    // Don't reveal if email exists for security
    return { message: "If an account with that email exists, a password reset link has been sent." };
  }

  const user = rows[0];
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Token expires in 1 hour
  const expiresAt = new Date(Date.now() + 3600000);
  
  // Store hashed token in database
  await pool.query(
    `UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3`,
    [hashedToken, expiresAt, user.id]
  );
  
  // Return plain token (to be sent in email link)
  // In production, this should trigger an email service
  return { 
    resetToken, 
    userId: user.id,
    message: "If an account with that email exists, a password reset link has been sent."
  };
};

const resetPassword = async (token, newPassword) => {
  const pool = getPool();
  
  // Hash the token to compare with database
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  // Find user with valid token
  const { rows } = await pool.query(
    `SELECT id, username, email FROM users 
     WHERE reset_token = $1 AND reset_token_expires > NOW()`,
    [hashedToken]
  );
  
  if (rows.length === 0) {
    throw new Error("Invalid or expired reset token");
  }
  
  const user = rows[0];
  
  // Hash new password
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  
  // Update password and clear reset token
  await pool.query(
    `UPDATE users 
     SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL 
     WHERE id = $2`,
    [hashedPassword, user.id]
  );
  
  return { message: "Password reset successful" };
};

module.exports = { login, signup, forgotPassword, resetPassword };
