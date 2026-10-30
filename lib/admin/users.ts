import type { Pool, RowDataPacket } from "mysql2/promise";
import { verify } from "@node-rs/argon2";
import { hashPassword, MIN_PASSWORD } from "@/lib/auth/core";
import { auditChange, inTransaction } from "./write";

export function validatePassword(password: string) {
  if (password.length < MIN_PASSWORD || password.length > 200) throw new Error(`Şifre ${MIN_PASSWORD}–200 karakter olmalı.`);
}
export async function listAdmins(pool: Pool) {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT id, email, must_change_password FROM admins ORDER BY id");
  return rows.map(row => ({ id: Number(row.id), email: String(row.email), mustChangePassword: Boolean(row.must_change_password) }));
}
export async function createAdmin(pool: Pool, actor: number, rawEmail: string, password: string): Promise<number> {
  const email = rawEmail.trim().toLowerCase();
  if (email.length > 190 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Geçerli bir e-posta yaz.");
  validatePassword(password);
  const passwordHash = await hashPassword(password);
  return inTransaction(pool, async conn => {
    let id: number;
    try {
      const [result] = await conn.query("INSERT INTO admins (email, password_hash, must_change_password) VALUES (?, ?, 1)", [email, passwordHash]);
      id = (result as { insertId: number }).insertId;
    } catch (error) {
      if ((error as { code: string }).code === "ER_DUP_ENTRY") throw new Error("Bu e-posta zaten kayıtlı.");
      throw error;
    }
    await auditChange(conn, actor, "admin", id, "create", `${email}: admin oluşturuldu`, null, { email, mustChangePassword: true });
    return id;
  });
}
export async function deleteAdmin(pool: Pool, actor: number, id: number) {
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Kullanıcı bulunamadı.");
  return inTransaction(pool, async conn => {
    const [admins] = await conn.query<RowDataPacket[]>("SELECT id, email FROM admins ORDER BY id FOR UPDATE");
    if (admins.length <= 1) throw new Error("Son admin silinemez.");
    if (actor === id) throw new Error("Kendi hesabını silemezsin.");
    const target = admins.find(row => row.id === id);
    if (!target) throw new Error("Kullanıcı bulunamadı.");
    await conn.query("DELETE FROM admins WHERE id = ?", [id]);
    await auditChange(conn, actor, "admin", id, "delete", `${target.email}: admin silindi`, { email: target.email }, null);
  });
}
export async function changeTemporaryPassword(pool: Pool, actor: number, current: string, password: string) {
  validatePassword(password);
  if (current === password) throw new Error("Yeni şifre geçici şifreden farklı olmalı.");
  if (current.length > 200) throw new Error("Mevcut şifre yanlış.");
  return inTransaction(pool, async conn => {
    const [[admin]] = await conn.query<RowDataPacket[]>("SELECT password_hash, must_change_password FROM admins WHERE id = ? FOR UPDATE", [actor]);
    if (!admin || !await verify(admin.password_hash, current)) throw new Error("Mevcut şifre yanlış.");
    await conn.query("UPDATE admins SET password_hash = ?, must_change_password = 0 WHERE id = ?", [await hashPassword(password), actor]);
    await conn.query("DELETE FROM sessions WHERE admin_id = ?", [actor]);
    await auditChange(conn, actor, "admin", actor, "password", "Geçici şifre değiştirildi", { mustChangePassword: Boolean(admin.must_change_password) }, { mustChangePassword: false });
  });
}
