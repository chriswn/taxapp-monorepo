import { Pool } from "pg";

interface DbConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

function buildDbConfig(): DbConfig | null {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    return { connectionString };
  }

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const database = process.env.DB_NAME;

  if (!host || !user || !database) {
    return null;
  }

  const portValue = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
  if (Number.isNaN(portValue)) {
    throw new Error("Invalid DB_PORT value");
  }

  return {
    host,
    port: portValue,
    user,
    password: process.env.DB_PASSWORD,
    database
  };
}

const dbConfig = buildDbConfig();
let pool: Pool | null = null;

export function isDbConfigured(): boolean {
  return dbConfig !== null;
}

export function getDbPool(): Pool {
  if (!dbConfig) {
    throw new Error("Database not configured");
  }

  if (!pool) {
    pool = new Pool(dbConfig);
  }

  return pool;
}
