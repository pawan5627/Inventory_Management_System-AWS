const { getPool } = require("../config/db");
const bcrypt = require("bcryptjs");

const getProfile = async (userId) => {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.name, u.email, u.phone, u.location,
            d.name AS department, c.name AS company
     FROM users u
     LEFT JOIN departments d ON d.id = u.department_id
     LEFT JOIN companies c ON c.id = u.company_id
     WHERE u.id = $1`,
    [userId]
  );
  
  if (!rows[0]) return null;
  
  const user = rows[0];
  // Split name into firstName and lastName
  const nameParts = (user.name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return {
    id: user.id,
    username: user.username,
    firstName,
    lastName,
    email: user.email,
    phone: user.phone || '',
    location: user.location || '',
    department: user.department || '',
    company: user.company || ''
  };
};

const updateProfile = async (userId, { firstName, lastName, phone, location, currentPassword, newPassword }) => {
  const pool = getPool();
  
  // Check if user exists
  const userCheck = await pool.query(`SELECT id, password_hash FROM users WHERE id = $1`, [userId]);
  if (!userCheck.rowCount) throw new Error("User not found");

  const updates = [];
  const values = [];
  let paramCount = 1;

  // Update name if provided
  if (firstName !== undefined || lastName !== undefined) {
    const name = `${firstName || ''} ${lastName || ''}`.trim();
    updates.push(`name = $${paramCount++}`);
    values.push(name);
  }

  // Update phone if provided
  if (phone !== undefined) {
    updates.push(`phone = $${paramCount++}`);
    values.push(phone);
  }

  // Update location if provided
  if (location !== undefined) {
    updates.push(`location = $${paramCount++}`);
    values.push(location);
  }

  // Handle password change
  if (newPassword && currentPassword) {
    const currentHash = userCheck.rows[0].password_hash;
    const isValid = await bcrypt.compare(currentPassword, currentHash);
    
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }
    
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
    const newHash = await bcrypt.hash(newPassword, saltRounds);
    updates.push(`password_hash = $${paramCount++}`);
    values.push(newHash);
  }

  if (updates.length > 0) {
    values.push(userId);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    );
  }

  return await getProfile(userId);
};

module.exports = { getProfile, updateProfile };
