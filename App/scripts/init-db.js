const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

function buildDbConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const database = process.env.DB_NAME;

  if (!host || !user || !database) {
    throw new Error("Set DATABASE_URL or DB_HOST/DB_USER/DB_NAME environment variables.");
  }

  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
  if (Number.isNaN(port)) {
    throw new Error("Invalid DB_PORT value");
  }

  return {
    host,
    port,
    user,
    password: process.env.DB_PASSWORD,
    database
  };
}

async function applySchema() {
  const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  const pool = new Pool(buildDbConfig());

  try {
    await pool.query(schemaSql);
    console.log("Database schema applied.");
  } finally {
    await pool.end();
  }
}

applySchema().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Failed to apply schema:", message || "(no error message)");
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
