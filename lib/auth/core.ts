import { createHash, randomBytes } from "node:crypto";
import type { Pool, RowDataPacket } from "mysql2/promise";
import { hash, verify } from "@node-rs/argon2";
import { lockMinutes } from "./lockout";
import { serial } from "./serial";

/** argon2id, OWASP önerisi: 19 MiB, 2 tur, 1 iş parçacığı. */
const ARGON = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;
export const SESSION_DAYS = 30;
export const MIN_PASSWORD = 10;

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const attemptKey = (ip: string, email: string) => sha256(`${ip}\n${email.trim().toLowerCase()}`);

export const hashPassword = (pw: string) => hash(pw, ARGON);

/** Zamanlama farkı olmasın diye bilinmeyen e-postada da bir argon2 kontrolü yapılır. */
let dummyHash: Promise<string> | null = null;
const dummy = () => (dummyHash ??= hash(randomBytes(16).toString("hex"), ARGON));

export type LoginResult = { ok: true; adminId: number } | { ok: false; reason: "locked"; minutes: number } | { ok: false; reason: "invalid" };

export async function countAdmins(pool: Pool): Promise<number> {
  const [[r]] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM admins");
  return Number(r.n);
}

/** İlk admin. Tabloda admin varsa reddeder (spec 4.1: kayıt sayfası yok). */
export async function createFirstAdmin(pool: Pool, email: string, password: string): Promise<number> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[r]] = await conn.query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM admins FOR UPDATE");
    if (Number(r.n) > 0) throw new Error("admin zaten var");
    const [res] = await conn.query("INSERT INTO admins (email, password_hash) VALUES (?, ?)", [email.trim().toLowerCase(), await hashPassword(password)]);
    await conn.commit();
    return (res as { insertId: number }).insertId;
  } catch (e) {
    await conn.rollback().catch(() => {});
    throw e;
  } finally {
    conn.release();
  }
}

/** Tek admin: şifresini değiştirir ve bütün oturumlarını kapatır. */
export async function resetOnlyAdminPassword(pool: Pool, password: string): Promise<void> {
  const h = await hashPassword(password);
  await pool.query("UPDATE admins SET password_hash = ? ORDER BY id LIMIT 1", [h]);
  await pool.query("DELETE FROM sessions");
}

/**
 * Giriş denemesi (spec 4.1). Kilit kontrolü, şifre kontrolü ve sayaç aynı sıralı bölümde yapılır:
 * aynı anda gelen 100 yanlış istekten yalnızca 5'i şifre kontrolüne ulaşır.
 */
export function attemptLogin(
  pool: Pool,
  input: { ip: string; email: string; password: string; now?: Date },
  check: (hash: string, pw: string) => Promise<boolean> = (h, pw) => verify(h, pw),
): Promise<LoginResult> {
  return serial(async () => {
    const now = input.now ?? new Date();
    const key = attemptKey(input.ip, input.email);
    const [[row]] = await pool.query<RowDataPacket[]>("SELECT locked_until FROM login_attempts WHERE key_hash = ?", [key]);
    if (row?.locked_until && new Date(row.locked_until) > now) {
      return { ok: false, reason: "locked", minutes: Math.ceil((new Date(row.locked_until).getTime() - now.getTime()) / 60000) };
    }
    const [[admin]] = await pool.query<RowDataPacket[]>("SELECT id, password_hash FROM admins WHERE email = ?", [input.email.trim().toLowerCase()]);
    const good = admin ? await check(admin.password_hash, input.password) : (await check(await dummy(), input.password), false);
    if (good) {
      await pool.query("DELETE FROM login_attempts WHERE key_hash = ?", [key]);
      await pool.query("UPDATE admins SET last_login_at = ? WHERE id = ?", [now, admin.id]);
      return { ok: true, adminId: admin.id as number };
    }
    await pool.query(
      "INSERT INTO login_attempts (key_hash, fail_count, window_started_at) VALUES (?, 1, ?) ON DUPLICATE KEY UPDATE fail_count = fail_count + 1",
      [key, now],
    );
    const [[after]] = await pool.query<RowDataPacket[]>("SELECT fail_count FROM login_attempts WHERE key_hash = ?", [key]);
    const minutes = lockMinutes(Number(after.fail_count));
    if (minutes) await pool.query("UPDATE login_attempts SET locked_until = ? WHERE key_hash = ?", [new Date(now.getTime() + minutes * 60000), key]);
    return { ok: false, reason: "invalid" };
  });
}

export async function createSession(pool: Pool, adminId: number, now = new Date()): Promise<{ token: string; expires: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(now.getTime() + SESSION_DAYS * 86400000);
  await pool.query("INSERT INTO sessions (id_hash, admin_id, expires_at) VALUES (?, ?, ?)", [sha256(token), adminId, expires]);
  return { token, expires };
}

export async function findSession(pool: Pool, token: string, now = new Date()): Promise<{ adminId: number; email: string } | null> {
  const [[r]] = await pool.query<RowDataPacket[]>(
    "SELECT a.id, a.email FROM sessions s JOIN admins a ON a.id = s.admin_id WHERE s.id_hash = ? AND s.expires_at > ?",
    [sha256(token), now],
  );
  return r ? { adminId: r.id as number, email: r.email as string } : null;
}

export async function deleteSession(pool: Pool, token: string): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE id_hash = ?", [sha256(token)]);
}

export async function deleteAllSessions(pool: Pool, adminId: number): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE admin_id = ?", [adminId]);
}
