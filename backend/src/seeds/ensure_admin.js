require('dotenv').config({ path: __dirname + '/../.env' });
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function ensureAdmin() {
  const { RDS_HOST, RDS_PORT = 5432, RDS_USER, RDS_PASSWORD, RDS_DATABASE, RDS_SSL_MODE, RDS_SSL_REJECT_UNAUTHORIZED, RDS_SSL_CA_PATH } = process.env;
  const rejectUnauthorized = RDS_SSL_REJECT_UNAUTHORIZED === 'false' ? false : true;
  let ssl = false;
  if (RDS_SSL_MODE === 'require') {
    const caPath = process.env.RDS_SSL_CA_PATH;
    if (caPath) {
      try {
        const path = require('path');
        const fs = require('fs');
        const resolved = caPath.startsWith('~')
          ? path.join(process.env.HOME || process.env.USERPROFILE || '', caPath.slice(1))
          : path.resolve(caPath);
        const ca = fs.readFileSync(resolved, 'utf8');
        ssl = { ca, rejectUnauthorized };
      } catch (e) {
        console.warn('Could not read CA file at', caPath, '- proceeding without CA');
        ssl = { rejectUnauthorized };
      }
    } else {
      ssl = { rejectUnauthorized };
    }
  }

  const client = new Client({ host: RDS_HOST, port: Number(RDS_PORT), user: RDS_USER, password: RDS_PASSWORD, database: RDS_DATABASE, ssl });
  const username = 'admin';
  const password = 'ChangeMe123!';
  const name = 'Admin User';
  const email = 'admin@example.com';

  try {
    await client.connect();
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const hash = await bcrypt.hash(password, saltRounds);

    // Upsert admin user
    const ures = await client.query(
      `INSERT INTO users (username, password_hash, name, email, status, created_at)
       VALUES ($1, $2, $3, $4, 'Active', NOW())
       ON CONFLICT (username) DO UPDATE SET password_hash=EXCLUDED.password_hash, name=EXCLUDED.name, email=EXCLUDED.email, status='Active'
       RETURNING id`,
      [username, hash, name, email]
    );
    const userId = ures.rows[0].id;

    // Ensure admins group exists
    const gres = await client.query(`INSERT INTO groups (name) VALUES ('admins') ON CONFLICT (name) DO NOTHING RETURNING id`);
    const gfetch = await client.query(`SELECT id FROM groups WHERE name='admins' LIMIT 1`);
    const groupId = gfetch.rows[0].id;

    // Assign user to admins group
    await client.query(`INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2) ON CONFLICT (user_id, group_id) DO NOTHING`, [userId, groupId]);

    // Grant all roles to admins
    await client.query(`INSERT INTO group_roles (group_id, role_id) SELECT $1, r.id FROM roles r ON CONFLICT (group_id, role_id) DO NOTHING`, [groupId]);

    console.log('Admin user ensured. You can login with admin / ChangeMe123!');
    process.exit(0);
  } catch (err) {
    console.error('Ensure admin failed:', err.message);
    process.exit(2);
  } finally {
    await client.end();
  }
}

ensureAdmin();
