import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { backupAge, parseBackupFile } from "@/lib/admin/backupSchema";
import { createStoredBackupZip, readStoredBackupZip } from "@/lib/admin/backupZip";

const photo = new TextEncoder().encode("test-webp");
const key = createHash("sha256").update(photo).digest("hex");

const valid = () => ({
  version: 1,
  createdAt: "2026-10-27T12:00:00.000Z",
  data: {
    groups: [{ id: 1, slug: "kahve", name_tr: "Kahve", name_en: null, name_ar: null, color: "red", sort_order: 0, image_key: null, image_focus_x: 0.5, image_focus_y: 0.5 }],
    categories: [{ id: 1, slug: "sicak", group_id: 1, name_tr: "Sıcak", name_en: null, name_ar: null, sort_order: 0, is_visible: 1, default_in_suggest: 1, default_temp: "hot", image_key: null, image_focus_x: 0.5, image_focus_y: 0.5 }],
    products: [{ id: 1, slug: "espresso", category_id: 1, name: "Espresso", name_en: null, name_ar: null, desc_tr: null, desc_en: null, desc_ar: null, ingredients_tr: null, ingredients_en: null, ingredients_ar: null, kcal: null, allergens: "", allergens_entered: 0, temp: "hot", in_suggest: 1, image_key: key, image_focus_x: 0.5, image_focus_y: 0.5, is_new: 0, is_featured: 0, is_visible: 1, sold_out_until: null, sort_order: 0, updated_at: "2026-10-27T12:00:00.000Z" }],
    variants: [{ id: 1, product_id: 1, label_key: null, price_kurus: 11_000, sort_order: 0 }],
    extras: [], extraCategories: [], tags: [], productTags: [],
    settings: [{ id: 1, opening_time: "08:00", footer_note_tr: "Not", footer_note_en: null, footer_note_ar: null, stats_enabled: 1, menu_updated_at: "2026-10-27T12:00:00.000Z" }],
  },
  images: [{ key, path: `photos/${key}-1280.webp`, size: photo.length }],
});

describe("yedek şeması", () => {
  it("sürümü, ilişkileri ve her fotoğrafın ZIP kaydını doğrular", () => {
    expect(parseBackupFile(valid()).images).toHaveLength(1);
    expect(() => parseBackupFile({ ...valid(), version: 2 })).toThrow("Yedek sürümü desteklenmiyor.");
    expect(() => parseBackupFile({ ...valid(), images: [] })).toThrow("Yedekte bir fotoğraf eksik.");
    const bad = valid();
    bad.data.settings[0] = { ...bad.data.settings[0], wifi_password: "secret" } as typeof bad.data.settings[0];
    expect(() => parseBackupFile(bad)).toThrow("Yedekte WiFi bilgisi bulunamaz.");
  });

  it("son yedek yaşını hesaplar ve 30 günü geçince uyarır", () => {
    const now = new Date("2026-10-27T12:00:00.000Z");
    expect(backupAge("2026-10-27T08:00:00.000Z", now)).toEqual({ days: 0, label: "Son yedek: 0 gün önce", stale: false });
    expect(backupAge("2026-09-26T11:59:59.000Z", now)).toEqual({ days: 31, label: "Son yedek: 31 gün önce", stale: true });
    expect(backupAge(null, now)).toEqual({ days: null, label: "Henüz yedek alınmadı", stale: true });
  });

  it("STORE ZIP üretir, okur ve izin verilmeyen yolu reddeder", async () => {
    const progress: string[] = [];
    const blob = await createStoredBackupZip(valid(), async () => photo, (done, total) => progress.push(`${done}/${total}`));
    const parsed = await readStoredBackupZip(new Uint8Array(await blob.arrayBuffer()));
    expect(parsed.backup.version).toBe(1);
    expect(parsed.photos.get(key)).toEqual(photo);
    expect(progress).toEqual(["0/1", "1/1"]);

    const zipBytes = new Uint8Array(await blob.arrayBuffer());
    const view = new DataView(zipBytes.buffer, zipBytes.byteOffset, zipBytes.byteLength);
    const methods: number[] = [];
    for (let offset = 0; offset <= zipBytes.length - 12; offset++) {
      if (view.getUint32(offset, true) === 0x02014b50) methods.push(view.getUint16(offset + 10, true));
    }
    expect(methods).toHaveLength(2);
    expect(methods).toEqual([0, 0]);

    const { zipSync, strToU8 } = await import("fflate");
    const unsafe = zipSync({ "menu.json": strToU8(JSON.stringify(valid())), "../secret.txt": strToU8("x") }, { level: 0 });
    await expect(readStoredBackupZip(unsafe)).rejects.toThrow("ZIP içinde izin verilmeyen dosya var.");
    const compressed = zipSync({ "menu.json": strToU8(JSON.stringify(valid())), [`photos/${key}-1280.webp`]: photo }, { level: 6 });
    await expect(readStoredBackupZip(compressed)).rejects.toThrow("ZIP içinde izin verilmeyen dosya var.");
  });

  it("hazırlanan yedeği iptal eder", async () => {
    const controller = new AbortController();
    await expect(createStoredBackupZip(valid(), async () => photo, (done) => {
      if (done === 0) controller.abort();
    }, controller.signal)).rejects.toMatchObject({ name: "AbortError" });
  });
});
