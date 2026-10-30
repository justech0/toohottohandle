import { beforeAll, afterAll, it, expect, describe } from "vitest";
import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";
import { migrate, seedIfEmpty } from "@/lib/db/setup";
import { createFirstAdmin, createSession, findSession } from "@/lib/auth/core";
import { createAdmin, deleteAdmin, changeTemporaryPassword } from "@/lib/admin/users";
import { listSlides, saveSlide, deleteSlide } from "@/lib/admin/hero";
import { cleanupHistory } from "@/lib/admin/history";
import { saveSuggestSettings } from "@/lib/admin/suggestions";
import { createBackupBundle } from "@/lib/admin/backups";
import { catalogData, saveSettings } from "@/lib/admin/catalog";
import { listHistory } from "@/lib/admin/snapshots";

describe.skipIf(!process.env.TEST_DATABASE_URL)("admin revize", () => {
  let pool: Pool, actor: number;
  beforeAll(async () => {
    pool = mysql.createPool({ uri: process.env.TEST_DATABASE_URL!, timezone: "Z" });
    await migrate(pool); await seedIfEmpty(pool);
    await pool.query("DELETE FROM audit_log"); await pool.query("DELETE FROM sessions"); await pool.query("DELETE FROM admins");
    actor = await createFirstAdmin(pool, "owner@test.kafe", "owner-test-password");
  });
  afterAll(async () => pool?.end());
  it("seeds three slides once and supports validated CRUD, visibility and order", async () => {
    expect((await listSlides(pool)).map(s => s.title)).toEqual(["HOT & FAST", "HOT & FREE", "HOT & SHINE"]);
    const id = await saveSlide(pool, actor, null, { title: "Yeni vitrin", imageKey: null, color: "pink", icon: "lips", sortOrder: 0, isVisible: false });
    expect(await listSlides(pool)).toContainEqual(expect.objectContaining({ id, color: "pink", isVisible: false }));
    await expect(saveSlide(pool, actor, id, { title: "", imageKey: "../../x", color: "invalid", icon: "x", sortOrder: -1, isVisible: true })).rejects.toThrow();
    await deleteSlide(pool, actor, id);
    expect((await listSlides(pool)).some(s => s.id === id)).toBe(false);
  });
  it("creates temporary accounts, rejects duplicates/self/last deletion and revokes sessions", async () => {
    await expect(deleteAdmin(pool, actor, actor)).rejects.toThrow();
    const id = await createAdmin(pool, actor, "New@Test.kafe", "temporary-password");
    await expect(deleteAdmin(pool, actor, actor)).rejects.toThrow("Kendi hesabını");
    const session = await createSession(pool, id);
    expect(await findSession(pool, session.token)).toMatchObject({ mustChangePassword: true });
    await expect(createAdmin(pool, actor, "new@test.kafe", "temporary-password")).rejects.toThrow();
    await expect(changeTemporaryPassword(pool, id, "temporary-password", "temporary-password")).rejects.toThrow();
    await changeTemporaryPassword(pool, id, "temporary-password", "new-permanent-password");
    expect(await findSession(pool, session.token)).toBeNull();
    await deleteAdmin(pool, actor, id);
    expect(await listHistory(pool)).toContainEqual(expect.objectContaining({ email: "new@test.kafe", action: "password" }));
    const [[safe]] = await pool.query<RowDataPacket[]>("SELECT GROUP_CONCAT(CONCAT(COALESCE(before_json, ''), COALESCE(after_json, ''))) AS data FROM audit_log WHERE entity='admin'");
    expect(safe.data).not.toContain("temporary-password");
    expect(safe.data).not.toContain("password_hash");
    expect(await listHistory(pool)).toContainEqual(expect.objectContaining({ email: "owner@test.kafe", entity: "admin" }));
  });
  it("retains the newest 25 old entries and all entries newer than 30 days", async () => {
    await pool.query("DELETE FROM menu_snapshots"); await pool.query("DELETE FROM audit_log");
    for (let i = 0; i < 30; i++) {
      await pool.query("INSERT INTO menu_snapshots (at, reason, data) VALUES ('2020-01-01', 'test', '{}')");
      await pool.query("INSERT INTO audit_log (admin_id, at, entity, action, summary) VALUES (?, '2020-01-01', 'test', 'update', 'test')", [actor]);
    }
    await cleanupHistory(pool);
    for (const table of ["menu_snapshots", "audit_log"]) {
      const [[row]] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM ${table}`); expect(Number(row.n)).toBe(25);
    }
    await pool.query("INSERT INTO menu_snapshots (reason, data) VALUES ('yeni', '{}')");
    await cleanupHistory(pool);
    const [[row]] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM menu_snapshots"); expect(Number(row.n)).toBe(25);
    for (let i=0;i<30;i++) await pool.query("INSERT INTO menu_snapshots (reason, data) VALUES ('recent', '{}')");
    await cleanupHistory(pool);
    const [[recent]] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM menu_snapshots WHERE reason='recent'"); expect(Number(recent.n)).toBe(30);
  });
  it("saves product choices atomically and rejects unknown products", async () => {
    await saveSuggestSettings(pool, actor, { mode: "selected", preferPhotos: false, productIds: [1, 2] });
    const [[s]] = await pool.query<RowDataPacket[]>("SELECT suggest_mode, suggest_prefer_photos FROM settings WHERE id=1");
    expect(s).toMatchObject({ suggest_mode: "selected", suggest_prefer_photos: 0 });
    await expect(saveSuggestSettings(pool, actor, { mode: "selected", preferPhotos: true, productIds: [9999999] })).rejects.toThrow();
    const [[unchanged]] = await pool.query<RowDataPacket[]>("SELECT suggest_prefer_photos FROM settings WHERE id=1"); expect(unchanged.suggest_prefer_photos).toBe(0);
  });
  it("exports hero and suggestion settings with menu data", async () => {
    const exported = await createBackupBundle(pool);
    expect(exported.backup.data).toHaveProperty("heroSlides");
    expect(exported.backup.data.settings[0]).toMatchObject({ suggest_mode: "selected", suggest_prefer_photos: 0 });
  });

  it("keeps concurrent WiFi and catalog edits separate", async () => {
    const stale = { ...(await catalogData(pool)).settings, wifiPassword: null };
    await saveSettings(pool, actor, { ...stale, wifiUsername: "updated-user" }, "wifi");
    await saveSettings(pool, actor, { ...stale, footerNoteTr: "Updated footer" }, "catalog");
    expect((await catalogData(pool)).settings).toMatchObject({ wifiUsername: "updated-user", footerNoteTr: "Updated footer" });
  });

});
