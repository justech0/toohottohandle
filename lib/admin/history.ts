import type { Pool } from "mysql2/promise";

export async function cleanupHistory(pool: Pool, now = new Date()) {
  const cutoff = new Date(now.getTime() - 30 * 86400000);
  for (const table of ["menu_snapshots", "audit_log"] as const) {
    await pool.query(`DELETE FROM ${table} WHERE at < ? AND id NOT IN (SELECT id FROM (SELECT id FROM ${table} ORDER BY id DESC LIMIT 25) AS kept)`, [cutoff]);
  }
}
