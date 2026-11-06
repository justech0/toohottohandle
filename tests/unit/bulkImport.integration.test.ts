import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";
import { migrate, seedIfEmpty } from "@/lib/db/setup";
import { importProductsFromContent } from "@/lib/admin/bulkImport";
import { listMenuSnapshots } from "@/lib/admin/snapshots";
import { undoLast } from "@/lib/admin/products";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("toplu ürün yükleme (MariaDB)", () => {
  let pool: Pool;
  let adminId: number;

  beforeAll(async () => {
    pool = mysql.createPool({ uri: url!, connectionLimit: 3, timezone: "Z" });
    for (const table of [
      "feedbacks", "stats_product", "stats_hourly", "stats_daily",
      "audit_undo_secrets", "storage_objects", "product_tags", "tags", "audit_log", "sessions", "login_attempts", "admins",
      "hero_slides", "menu_snapshots", "extra_categories", "extras", "product_variants", "products", "categories", "menu_groups", "settings", "schema_migrations",
    ]) await pool.query(`DROP TABLE IF EXISTS ${table}`);
    await migrate(pool);
    await seedIfEmpty(pool);
    const [result] = await pool.query("INSERT INTO admins (email, password_hash) VALUES ('import@test.local', 'x')");
    adminId = (result as { insertId: number }).insertId;
  });

  afterAll(async () => pool?.end());

  it("CSV ile mevcut ve yeni kategorilere ürün ekler, bozuk satırı atlar, kopya alır ve geri alır", async () => {
    const csv = [
      "category_name,product_name,description,price,image_url,sort_order",
      "Sıcak Kahveler,Özel Harman Espresso,Çikolata notalı,145,,",
      "Yeni Özel Kategori,İmza İçecek,Ev yapımı şuruplu,225,,1",
      ",Eksik Satır,Açıklama,100,,",
      "Sıcak Kahveler,Fiyatsız Ürün,Açıklama,abc,,",
    ].join("\n");

    const report = await importProductsFromContent(pool, adminId, {
      fileName: "toplu.csv",
      content: csv,
      groupId: 1,
    });

    expect(report).toEqual({
      read: 4,
      inserted: 2,
      createdCategories: ["Yeni Özel Kategori"],
      skipped: [
        "Satır 3: kategori veya ürün adı eksik.",
        "Satır 4: fiyat sayısal değil.",
      ],
    });

    const [createdProds] = await pool.query<RowDataPacket[]>(
      "SELECT p.id, p.name, p.desc_tr, c.name_tr AS category_name, v.price_kurus FROM products p JOIN categories c ON c.id = p.category_id JOIN product_variants v ON v.product_id = p.id WHERE p.name IN ('Özel Harman Espresso', 'İmza İçecek') ORDER BY p.id",
    );
    expect(createdProds).toHaveLength(2);
    expect(createdProds[0]).toMatchObject({ name: "Özel Harman Espresso", category_name: "Sıcak Kahveler", price_kurus: 14_500 });
    expect(createdProds[1]).toMatchObject({ name: "İmza İçecek", category_name: "Yeni Özel Kategori", price_kurus: 22_500 });

    const snapshots = await listMenuSnapshots(pool);
    expect(snapshots[0]?.reason).toBe("toplu ürün yükleme öncesi");

    const [[audit]] = await pool.query<RowDataPacket[]>("SELECT entity, action, summary FROM audit_log ORDER BY id DESC LIMIT 1");
    expect(audit).toMatchObject({ entity: "bulk_import", action: "create", summary: "2 ürün toplu yüklendi (1 yeni kategori)" });

    await undoLast(pool, adminId);

    const [afterUndo] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM products WHERE name IN ('Özel Harman Espresso', 'İmza İçecek')",
    );
    expect(afterUndo).toHaveLength(0);

    const [afterUndoCat] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM categories WHERE name_tr = 'Yeni Özel Kategori'",
    );
    expect(afterUndoCat).toHaveLength(0);
  });
});
