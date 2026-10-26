import { countAdmins } from "./auth/core";
import { issueCode } from "./auth/oneTimeCode";
import { resetRequested } from "./auth/resetFlag";
import { getPool, hasDb } from "./db/client";
import { migrate, seedIfEmpty } from "./db/setup";
import { prepareStorage } from "./storage/disk";

export async function boot(): Promise<void> {
  await prepareStorage().catch((e) => console.error("[boot] foto klasörü hazırlanamadı:", (e as Error).message));
  if (!hasDb()) return;
  try {
    const pool = getPool();
    const ran = await migrate(pool);
    const seeded = await seedIfEmpty(pool);
    console.log(`[boot] şema: ${ran.length ? ran.join(", ") : "güncel"}; seed: ${seeded ? "yüklendi" : "gerek yok"}`);
    // Kodlar yalnızca sunucu kaydına yazılır; sayfada ya da yanıtta hiç görünmez.
    if ((await countAdmins(pool)) === 0) console.log(`[admin] Kurulum kodu: ${issueCode("setup")} (/qr/admin/kurulum)`);
    else if (await resetRequested()) console.log(`[admin] Şifre sıfırlama kodu: ${issueCode("reset")} (/qr/admin/sifirla)`);
  } catch (e) {
    // Sunucu yine açılır; menü okunamazsa hata ekranı (spec 3.11) devreye girer.
    console.error("[boot] veritabanı hazırlanamadı:", (e as Error).message);
  }
}
