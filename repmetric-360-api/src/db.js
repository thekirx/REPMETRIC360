import pg from "pg";
const { Pool } = pg;

// Database connection pool para sa PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "repmetric_360",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  // Max 20 connections, idle for 30s bago i-close
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection pag nag-start
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Helper function para sa queries
export const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log("Executed query", { text: text.substring(0, 50), duration, rows: result.rowCount });
  return result;
};

// Get client for transactions
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export default pool;
