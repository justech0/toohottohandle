import mysql, { type Pool } from "mysql2/promise";

let pool: Pool | null = null;

/** DATABASE_URL yoksa veritabanı kapalıdır; menü seed dosyasından gelir. */
export const hasDb = (): boolean => Boolean(process.env.DATABASE_URL);

/** Tek süreçte tek havuz. Saatler UTC okunur ve yazılır. */
export function getPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL tanımlı değil");
  pool ??= mysql.createPool({ uri: url, connectionLimit: 5, timezone: "Z", dateStrings: false, charset: "utf8mb4" });
  return pool;
}
