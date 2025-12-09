require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  const {
    RDS_HOST,
    RDS_PORT = 5432,
    RDS_USER,
    RDS_PASSWORD,
    RDS_DATABASE,
    RDS_SSL_MODE
  } = process.env;

  if (!RDS_HOST || !RDS_USER || !RDS_PASSWORD || !RDS_DATABASE) {
    console.error('Missing RDS env vars. Please set RDS_HOST, RDS_USER, RDS_PASSWORD, RDS_DATABASE');
    process.exit(1);
  }

  // Allow overriding certificate verification for environments without CA bundle
  const rejectUnauthorized = process.env.RDS_SSL_REJECT_UNAUTHORIZED === 'false' ? false : true;
  let ssl = false;
  if (RDS_SSL_MODE === 'require') {
    const caPath = process.env.RDS_SSL_CA_PATH;
    if (caPath) {
      try {
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
  const client = new Client({
    host: RDS_HOST,
    port: Number(RDS_PORT),
    user: RDS_USER,
    password: RDS_PASSWORD,
    database: RDS_DATABASE,
    ssl
  });

  const sqlPath = path.resolve(__dirname, 'seed_postgres.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await client.connect();
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Postgres seed completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    await client.query('ROLLBACK').catch(() => {});
    process.exit(2);
  } finally {
    await client.end();
  }
}

run();
