/** Sunucu açılışında bir kez: şemayı güncelle, boşsa seed'i yükle, foto klasörünü hazırla. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { boot } = await import("./lib/boot");
  await boot();
}
