const { Pool } = require("pg");

let pool;
let readPool;

const connectDB = async () => {
  try {
    const {
      RDS_HOST,
      RDS_PORT,
      RDS_USER,
      RDS_PASSWORD,
      RDS_DATABASE,
      RDS_READER_HOST,
      RDS_SSL_MODE
    } = process.env;

    if (!RDS_HOST || !RDS_USER || !RDS_PASSWORD || !RDS_DATABASE) {
      throw new Error("Missing RDS env vars (RDS_HOST, RDS_USER, RDS_PASSWORD, RDS_DATABASE)");
    }

    const rejectUnauthorized = process.env.RDS_SSL_REJECT_UNAUTHORIZED === "false" ? false : true;
    const sslServername = process.env.RDS_SSL_SERVERNAME || RDS_HOST;
    let ssl = false;
    if (RDS_SSL_MODE === "require") {
      const caPath = process.env.RDS_SSL_CA_PATH;
      if (caPath) {
        try {
          const fs = require('fs');
          const path = require('path');
          const resolved = caPath.startsWith('~')
            ? path.join(process.env.HOME || process.env.USERPROFILE || '', caPath.slice(1))
            : path.resolve(caPath);
          const ca = fs.readFileSync(resolved, 'utf8');
          ssl = { ca, rejectUnauthorized, servername: sslServername };
        } catch (e) {
          console.warn('Could not read CA file at', caPath, '- proceeding without CA');
          ssl = { rejectUnauthorized, servername: sslServername };
        }
      } else {
        ssl = { rejectUnauthorized, servername: sslServername };
      }
    }
    pool = new Pool({
      host: RDS_HOST,
      port: Number(RDS_PORT || 5432),
      user: RDS_USER,
      password: RDS_PASSWORD,
      database: RDS_DATABASE,
      ssl,
      max: 10
    });

    // quick ping
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("Connected to AWS RDS (PostgreSQL)");

    // optional read-only pool via reader endpoint
    if (RDS_READER_HOST) {
      readPool = new Pool({
        host: RDS_READER_HOST,
        port: Number(RDS_PORT || 5432),
        user: RDS_USER,
        password: RDS_PASSWORD,
        database: RDS_DATABASE,
        ssl,
        max: 10
      });
      const rclient = await readPool.connect();
      await rclient.query("SELECT 1");
      rclient.release();
      console.log("Connected to AWS RDS Reader endpoint");
    }
    return pool;
  } catch (err) {
    console.error("DB connection error:", err.message);
    process.exit(1);
  }
};

const getPool = () => {
  if (!pool) throw new Error("DB Pool not initialized. Call connectDB() first.");
  return pool;
};

const getReadPool = () => {
  // fall back to writer when reader not configured
  return readPool || getPool();
};

module.exports = connectDB;
module.exports.getPool = getPool;
module.exports.getReadPool = getReadPool;
