const { Pool } = require("pg");

let pool = null;

async function initializePostgresPool() {
  pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/anl",
  });

  pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL pool error:", err);
  });

  // Verify the connection works
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL successfully.");
    client.release();
  } catch (err) {
    console.error("Error during PostgreSQL initialization:", err);
    throw err;
  }

  return pool;
}

function getPool() {
  if (!pool) {
    throw new Error(
      "PostgreSQL pool not initialized. Call initializePostgresPool first."
    );
  }
  return pool;
}

module.exports = {
  initializePostgresPool,
  getPool,
};
