import { getPool, hasDb } from "./db/client";
import { migrate, seedIfEmpty } from "./db/setup";
import { prepareStorage } from "./storage/disk";

export async function boot(): Promise<void> {
  if (hasDb()) {
    try {
      const pool = getPool();
      const ran = await migrate(pool);
      const seeded = await seedIfEmpty(pool);
      console.log(`[boot] şema: ${ran.length ? ran.join(", ") : "güncel"}; seed: ${seeded ? "yüklendi" : "gerek yok"}`);
    } catch (e) {
      // Sunucu yine açılır; menü okunamazsa hata ekranı (spec 3.11) devreye girer.
      console.error("[boot] veritabanı hazırlanamadı:", (e as Error).message);
    }
  }
  await prepareStorage().catch((e) => console.error("[boot] foto klasörü hazırlanamadı:", (e as Error).message));
}
