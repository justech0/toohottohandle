import { describe, expect, it } from "vitest";
import { parseImportFile, validateImportRows } from "@/lib/admin/bulkImport";

describe("toplu ürün yükleme ayrıştırma ve doğrulama", () => {
  it("başlık satırını ve boş satırları atlayarak CSV satırlarını ayrıştırır", () => {
    const csv = [
      "category_name,product_name,description,price,image_url,sort_order",
      "Espresso Bar,Cortado Özel,\"Kısa, yoğun kahve\",165,,2",
      "",
      "Tatlılar,Limonlu Tart,Taze limon kremalı,\"195,50\",,",
    ].join("\r\n");

    const rows = parseImportFile("urunler.csv", "Categories,Products,Desc,Price\n" + csv.split("\r\n").slice(1).join("\r\n"));
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      categoryName: "Espresso Bar",
      productName: "Cortado Özel",
      description: "Kısa, yoğun kahve",
      price: "165",
      sortOrder: "2",
    });

    const withHeader = parseImportFile("urunler.csv", csv);
    expect(withHeader).toHaveLength(2);
  });

  it("JSON dizisini ayrıştırır ve geçersiz dosya türünü reddeder", () => {
    const json = JSON.stringify([
      {
        category_name: "Soğuk Kahveler",
        product_name: "Cold Brew Tonic",
        description: "Narenciye notalı",
        price: 210,
        image_url: "",
        sort_order: 3,
      },
    ]);
    const rows = parseImportFile("menu.json", json);
    expect(rows).toEqual([
      {
        categoryName: "Soğuk Kahveler",
        productName: "Cold Brew Tonic",
        description: "Narenciye notalı",
        price: "210",
        imageUrl: "",
        sortOrder: "3",
      },
    ]);

    expect(() => parseImportFile("menu.txt", json)).toThrow("Yalnızca CSV veya JSON yükleyebilirsiniz.");
    expect(() => parseImportFile("menu.json", "{bozuk")).toThrow("Geçersiz JSON dosyası.");
  });

  it("bozuk satırları satır numarasıyla raporlar ve geçerli satırları hazırlar", () => {
    const rawRows = [
      { categoryName: "", productName: "Adsız Kategori", description: "", price: "120", imageUrl: "", sortOrder: "" },
      { categoryName: "Kahveler", productName: "", description: "", price: "120", imageUrl: "", sortOrder: "" },
      { categoryName: "Kahveler", productName: "Bozuk Fiyat", description: "", price: "abc", imageUrl: "", sortOrder: "" },
      { categoryName: "Kahveler", productName: "Bozuk Sıra", description: "", price: "140", imageUrl: "", sortOrder: "ikinci" },
      { categoryName: "Kahveler", productName: "Geçerli Kahve", description: "Açıklama", price: "176,50", imageUrl: "", sortOrder: "4" },
    ];

    const result = validateImportRows(rawRows);
    expect(result.read).toBe(5);
    expect(result.skipped).toEqual([
      "Satır 1: kategori veya ürün adı eksik.",
      "Satır 2: kategori veya ürün adı eksik.",
      "Satır 3: fiyat sayısal değil.",
      "Satır 4: sıra sayısal değil.",
    ]);
    expect(result.valid).toEqual([
      {
        categoryName: "Kahveler",
        productName: "Geçerli Kahve",
        description: "Açıklama",
        priceKurus: 17_650,
        imageKey: null,
        sortOrder: 4,
      },
    ]);
  });
});
