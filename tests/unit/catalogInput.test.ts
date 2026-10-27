import { describe, expect, it } from "vitest";
import {
  parseCategoryInput,
  parseExtraInput,
  parseGroupInput,
  parseSettingsInput,
  parseTagInput,
} from "@/lib/admin/catalogInput";

describe("catalog input", () => {
  it("accepts only the six group colors", () => {
    expect(parseGroupInput({ name: "Kahve", color: "red", sortOrder: "2" })).toEqual({
      ok: true,
      value: { name: "Kahve", nameEn: null, nameAr: null, color: "red", sortOrder: 2 },
    });
    expect(parseGroupInput({ name: "Kahve", color: "purple", sortOrder: "2" })).toEqual({
      ok: false,
      error: "Grup rengi geçersiz.",
    });
  });

  it("reads category defaults", () => {
    expect(parseCategoryInput({ name: "Yaz", groupId: "3", sortOrder: "4", isVisible: "on", defaultInSuggest: "on", defaultTemp: "cold" })).toEqual({
      ok: true,
      value: { name: "Yaz", nameEn: null, nameAr: null, groupId: 3, sortOrder: 4, isVisible: true, defaultInSuggest: true, defaultTemp: "cold" },
    });
  });

  it("reads extra price in lira and unique category ids", () => {
    expect(parseExtraInput({ name: "Shot", price: "75,50", categoryIds: ["2", "2", "4"] })).toEqual({
      ok: true,
      value: { name: "Shot", nameEn: null, nameAr: null, priceKurus: 7550, categoryIds: [2, 4] },
    });
  });

  it("normalizes a new tag and rejects empty names", () => {
    expect(parseTagInput({ name: "  BİTKİSEL   SÜT  " })).toEqual({ ok: true, value: { name: "BİTKİSEL SÜT" } });
    expect(parseTagInput({ name: " " })).toEqual({ ok: false, error: "Etiket adını yaz." });
  });

  it("validates settings and treats an empty password as unchanged", () => {
    expect(parseSettingsInput({
      wifiSsid: "Cafe", wifiUsername: "guest", wifiPassword: "", wifiNoteTr: "Bağlanın.",
      openingTime: "08:30", footerNoteTr: "Self servis", statsEnabled: "on",
    })).toEqual({
      ok: true,
      value: {
        wifiSsid: "Cafe", wifiUsername: "guest", wifiPassword: null,
        wifiNoteTr: "Bağlanın.", wifiNoteEn: null, wifiNoteAr: null,
        openingTime: "08:30",
        footerNoteTr: "Self servis", footerNoteEn: null, footerNoteAr: null,
        statsEnabled: true,
      },
    });
    expect(parseSettingsInput({ wifiSsid: "x", wifiUsername: "x", wifiNoteTr: "x", footerNoteTr: "x", openingTime: "25:00" })).toEqual({
      ok: false,
      error: "Açılış saati geçersiz.",
    });
  });
});
