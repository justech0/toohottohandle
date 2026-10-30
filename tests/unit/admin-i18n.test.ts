import { describe, expect, it } from "vitest";
import { parseProductInput } from "@/lib/admin/productInput";
import { parseGroupInput, parseCategoryInput, parseExtraInput, parseSettingsInput } from "@/lib/admin/catalogInput";

describe("Product input EN and AR fields", () => {
  it("parses product input with optional EN and AR names/descriptions", () => {
    const raw = {
      name: "Filtre Kahve",
      nameEn: "Filter Coffee",
      nameAr: "قهوة مقطرة",
      categoryId: "1",
      sizes: "normal",
      price0: "120",
      descTr: "Günlük taze çekirdek.",
      descEn: "Daily fresh beans.",
      descAr: "حبوب طازجة يومياً.",
    };
    const res = parseProductInput(raw);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.name).toBe("Filtre Kahve");
    expect(res.value.nameEn).toBe("Filter Coffee");
    expect(res.value.nameAr).toBe("قهوة مقطرة");
    expect(res.value.descTr).toBe("Günlük taze çekirdek.");
    expect(res.value.descEn).toBe("Daily fresh beans.");
    expect(res.value.descAr).toBe("حبوب طازجة يومياً.");
  });

  it("handles null/empty EN and AR fields cleanly", () => {
    const raw = {
      name: "Espresso",
      nameEn: "  ",
      nameAr: "",
      categoryId: "1",
      sizes: "tek",
      price0: "90",
    };
    const res = parseProductInput(raw);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.nameEn).toBeNull();
    expect(res.value.nameAr).toBeNull();
    expect(res.value.descEn).toBeNull();
    expect(res.value.descAr).toBeNull();
  });
});

describe("Catalog input EN and AR fields", () => {
  it("parses group with EN and AR names", () => {
    const raw = {
      name: "Kahveler",
      nameEn: "Coffees",
      nameAr: "القهوة",
      color: "red",
      sortOrder: "0",
    };
    const res = parseGroupInput(raw);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.name).toBe("Kahveler");
    expect(res.value.nameEn).toBe("Coffees");
    expect(res.value.nameAr).toBe("القهوة");
  });

  it("parses category with EN and AR names", () => {
    const raw = {
      name: "Sıcak Kahveler",
      nameEn: "Hot Coffees",
      nameAr: "القهوة الساخنة",
      groupId: "1",
      sortOrder: "0",
    };
    const res = parseCategoryInput(raw);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.name).toBe("Sıcak Kahveler");
    expect(res.value.nameEn).toBe("Hot Coffees");
    expect(res.value.nameAr).toBe("القهوة الساخنة");
  });

  it("parses extra with EN and AR names", () => {
    const raw = {
      name: "Yulaf Sütü",
      nameEn: "Oat Milk",
      nameAr: "حليب الشوفان",
      price: "25",
      categoryIds: "1,2",
    };
    const res = parseExtraInput(raw);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.name).toBe("Yulaf Sütü");
    expect(res.value.nameEn).toBe("Oat Milk");
    expect(res.value.nameAr).toBe("حليب الشوفان");
  });

  it("parses settings with EN and AR wifi and footer notes", () => {
    const raw = {
      wifiSsid: "HOT | WIFI",
      wifiUsername: "guest",
      wifiPassword: "",
      wifiNoteTr: "Kasadan şifre isteyiniz.",
      wifiNoteEn: "Ask cashier for password.",
      wifiNoteAr: "اطلب كلمة المرور من الكاشير.",
      footerNoteTr: "Afiyet olsun.",
      footerNoteEn: "Enjoy your drink.",
      footerNoteAr: "بالعافية.",
      openingTime: "08:30",
    };
    const res = parseSettingsInput(raw);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.wifiNoteTr).toBe("Kasadan şifre isteyiniz.");
    expect(res.value.wifiNoteEn).toBe("Ask cashier for password.");
    expect(res.value.wifiNoteAr).toBe("اطلب كلمة المرور من الكاشير.");
    expect(res.value.footerNoteTr).toBe("Afiyet olsun.");
    expect(res.value.footerNoteEn).toBe("Enjoy your drink.");
    expect(res.value.footerNoteAr).toBe("بالعافية.");
  });
});
