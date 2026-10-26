import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mysql, { type Pool } from "mysql2/promise";
import { migrate } from "@/lib/db/setup";
import {
  attemptLogin, countAdmins, createFirstAdmin, createSession, deleteAllSessions, findSession, resetOnlyAdminPassword,
} from "@/lib/auth/core";

const url = process.env.TEST_DATABASE_URL;
const PW = "dogru-sifre-123";

describe.skipIf(!url)("giriş (MariaDB)", () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = mysql.createPool({ uri: url!, connectionLimit: 5, timezone: "Z" });
    await migrate(pool);
    await pool.query("DELETE FROM sessions");
    await pool.query("DELETE FROM login_attempts");
    await pool.query("DELETE FROM admins");
    await createFirstAdmin(pool, "Admin@Kafe.com", PW);
  });
  afterAll(async () => pool?.end());
  beforeEach(async () => pool.query("DELETE FROM login_attempts"));

  it("allows only one admin to be created", async () => {
    expect(await countAdmins(pool)).toBe(1);
    await expect(createFirstAdmin(pool, "ikinci@kafe.com", PW)).rejects.toThrow();
  });

  it("logs in with the right password, email case ignored", async () => {
    const r = await attemptLogin(pool, { ip: "1.1.1.1", email: " admin@kafe.com ", password: PW });
    expect(r.ok).toBe(true);
  });

  it("locks the pair after 5 wrong tries, before checking the password", async () => {
    for (let i = 0; i < 5; i++) expect((await attemptLogin(pool, { ip: "2.2.2.2", email: "admin@kafe.com", password: "yanlis" })).ok).toBe(false);
    const r = await attemptLogin(pool, { ip: "2.2.2.2", email: "admin@kafe.com", password: PW });
    expect(r).toEqual({ ok: false, reason: "locked", minutes: 1 });
  });

  it("does not lock the real admin out from another IP", async () => {
    for (let i = 0; i < 6; i++) await attemptLogin(pool, { ip: "3.3.3.3", email: "admin@kafe.com", password: "yanlis" });
    expect((await attemptLogin(pool, { ip: "4.4.4.4", email: "admin@kafe.com", password: PW })).ok).toBe(true);
  });

  it("checks the password at most 5 times when 100 wrong tries arrive at once", async () => {
    let checks = 0;
    const slowCheck = async () => {
      checks++;
      await new Promise((r) => setTimeout(r, 2));
      return false;
    };
    await Promise.all(Array.from({ length: 100 }, () => attemptLogin(pool, { ip: "5.5.5.5", email: "admin@kafe.com", password: "x" }, slowCheck)));
    expect(checks).toBe(5);
  });

  it("opens one try after the lock ends, then locks for 2 minutes", async () => {
    const t0 = new Date("2026-10-26T10:00:00Z");
    for (let i = 0; i < 5; i++) await attemptLogin(pool, { ip: "6.6.6.6", email: "admin@kafe.com", password: "y", now: t0 });
    const later = new Date(t0.getTime() + 61_000);
    expect((await attemptLogin(pool, { ip: "6.6.6.6", email: "admin@kafe.com", password: "y", now: later })).ok).toBe(false);
    expect(await attemptLogin(pool, { ip: "6.6.6.6", email: "admin@kafe.com", password: PW, now: later })).toEqual({ ok: false, reason: "locked", minutes: 2 });
  });

  it("finds a live session, not an expired or closed one", async () => {
    const [[a]] = (await pool.query("SELECT id FROM admins LIMIT 1")) as unknown as [[{ id: number }]];
    const s = await createSession(pool, a.id);
    expect((await findSession(pool, s.token))?.email).toBe("admin@kafe.com");
    expect(await findSession(pool, s.token, new Date(Date.now() + 31 * 86400000))).toBeNull();
    expect(await findSession(pool, "baska-bir-token")).toBeNull();
    await deleteAllSessions(pool, a.id);
    expect(await findSession(pool, s.token)).toBeNull();
  });

  it("password reset closes every session", async () => {
    const [[a]] = (await pool.query("SELECT id FROM admins LIMIT 1")) as unknown as [[{ id: number }]];
    const s = await createSession(pool, a.id);
    await resetOnlyAdminPassword(pool, "yeni-sifre-456");
    expect(await findSession(pool, s.token)).toBeNull();
    expect((await attemptLogin(pool, { ip: "7.7.7.7", email: "admin@kafe.com", password: "yeni-sifre-456" })).ok).toBe(true);
  });
});
