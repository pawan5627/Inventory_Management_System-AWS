const { Pool } = require("pg");

let pool;

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

    pool = new Pool({
      host: RDS_HOST,
      port: Number(RDS_PORT || 5432),
      user: RDS_USER,
      password: RDS_PASSWORD,
      database: RDS_DATABASE,
      ssl: RDS_SSL_MODE === "require" ? { rejectUnauthorized: true } : false,
      max: 10
    });

    // quick ping
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("Connected to AWS RDS (PostgreSQL)");
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

module.exports = connectDB;
module.exports.getPool = getPool;
