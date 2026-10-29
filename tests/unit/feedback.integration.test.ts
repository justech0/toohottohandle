import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mysql, { type Pool } from "mysql2/promise";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { migrate, seedIfEmpty } from "@/lib/db/setup";
import { createBackupBundle } from "@/lib/admin/backups";
import { createFeedback, listFeedback, feedbackSummary, markFeedbackRead, deleteFeedback } from "@/lib/feedback/store";
import { feedbackImagePath, storeFeedbackImage } from "@/lib/feedback/images";

describe.skipIf(!process.env.TEST_DATABASE_URL)("özel geri bildirim", () => {
  let pool: Pool;
  let dir: string;
  let key: string;
  let id: number;
  const previous = process.env.THTH_UPLOAD_DIR;
  beforeAll(async () => {
    pool = mysql.createPool(process.env.TEST_DATABASE_URL!);
    await migrate(pool);
    await seedIfEmpty(pool);
    await pool.query("DELETE FROM feedbacks");
    dir = await mkdtemp(path.join(os.tmpdir(), "thth-feedback-"));
    process.env.THTH_UPLOAD_DIR = dir;
  });
  afterAll(async () => {
    if (previous === undefined) delete process.env.THTH_UPLOAD_DIR; else process.env.THTH_UPLOAD_DIR = previous;
    await pool?.end();
    if (dir) await rm(dir, { recursive: true, force: true });
  });
  it("stores re-encoded photos only in the private directory and rejects unsafe paths", async () => {
    key = await storeFeedbackImage(await sharp({ create: { width: 20, height: 20, channels: 3, background: "red" } }).png().toBuffer());
    expect(feedbackImagePath(key)).toContain(`${path.sep}feedback${path.sep}`);
    expect((await readFile(feedbackImagePath(key))).length).toBeGreaterThan(0);
    expect(() => feedbackImagePath("../test")).toThrow();
    await expect(storeFeedbackImage(Buffer.from("<svg/>"))).rejects.toThrow();
  });
  it("saves, filters, marks read and permanently deletes the private image", async () => {
    id = await createFeedback(pool, { topic: "taste", rating: 5, message: "Harika kahve", name: null, contact: null, lang: "tr" }, key);
    expect((await listFeedback(pool, { unread: true })).items[0]).toMatchObject({ id, message: "Harika kahve", is_read: 0 });
    expect((await listFeedback(pool, { topic: "hygiene" })).items).toHaveLength(0);
    expect((await listFeedback(pool, { rating: 1 })).items).toHaveLength(0);
    expect(await feedbackSummary(pool)).toMatchObject({ unread: 1, average: 5 });
    const backup = JSON.stringify(await createBackupBundle(pool));
    expect(backup).not.toContain("Harika kahve");
    expect(backup).not.toContain(key);
    await markFeedbackRead(pool, id);
    expect((await listFeedback(pool, { unread: true })).items).toHaveLength(0);
    await deleteFeedback(pool, id);
    expect((await listFeedback(pool, {})).items).toHaveLength(0);
    await expect(readFile(feedbackImagePath(key))).rejects.toThrow();
  });
});
