import type { Pool, PoolConnection } from "mysql2/promise";

export async function inTransaction<T>(pool: Pool, work: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try { await conn.beginTransaction(); const value = await work(conn); await conn.commit(); return value; }
  catch (error) { await conn.rollback().catch(() => {}); throw error; }
  finally { conn.release(); }
}

/** Bu ekranların işlemleri geri alınamaz; geçmişte önce/sonra korunur. */
export async function auditChange(conn: PoolConnection, actor: number, entity: string, id: number | null, action: string, summary: string, before: unknown, after: unknown) {
  await conn.query("DELETE FROM audit_undo_secrets");
  await conn.query("INSERT INTO audit_log (admin_email, admin_id, entity, entity_id, action, summary, before_json, after_json) VALUES ((SELECT email FROM admins WHERE id = ?), ?, ?, ?, ?, ?, ?, ?)",
    [actor, actor, entity, id, action, summary, JSON.stringify(before), JSON.stringify(after)]);
}
