const { getPool } = require("../config/db");
const bcrypt = require("bcryptjs");

// Ensure the users table has an avatar_url column (idempotent)
const ensureAvatarColumn = async () => {
  const pool = getPool();
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='avatar_url'
      ) THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
      END IF;
    END$$;
  `);
};

const getProfile = async (userId) => {
  const pool = getPool();
  await ensureAvatarColumn();
  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.name, u.email, u.phone, u.location,
            u.avatar_url,
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
    avatarUrl: user.avatar_url || '',
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
  if (newPassword || currentPassword) {
    // Both must be provided to change password
    if (!newPassword || !currentPassword) {
      throw new Error('Both current password and new password are required to change password');
    }
    
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

const setAvatarUrl = async (userId, avatarUrl) => {
  const pool = getPool();
  await ensureAvatarColumn();
  await pool.query(`UPDATE users SET avatar_url = $1 WHERE id = $2`, [avatarUrl, userId]);
  return await getProfile(userId);
};

module.exports = { getProfile, updateProfile, setAvatarUrl };
