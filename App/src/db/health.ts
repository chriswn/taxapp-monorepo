import { getDbPool } from "./pool";

export async function checkDbConnection(): Promise<void> {
  const pool = getDbPool();
  await pool.query("SELECT 1");
}
