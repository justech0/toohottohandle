import mysql, { type Pool } from "mysql2/promise";

let pool: Pool | null = null;

/** DATABASE_URL yoksa veritabanı kapalıdır; menü seed dosyasından gelir. */
export const hasDb = (): boolean => Boolean(process.env.DATABASE_URL);

/** Hostinger bağlantıyı "localhost" ile yazar; Node bunu ::1'e çözebilir, kullanıcı izni IPv4'tedir. */
export function dbUri(url: string): string {
  const u = new URL(url);
  if (u.hostname === "localhost") u.hostname = "127.0.0.1";
  return u.toString();
}

/** Tek süreçte tek havuz. Saatler UTC okunur ve yazılır. */
export function getPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL tanımlı değil");
  pool ??= mysql.createPool({ uri: dbUri(url), connectionLimit: 5, timezone: "Z", dateStrings: false, charset: "utf8mb4" });
  return pool;
}
