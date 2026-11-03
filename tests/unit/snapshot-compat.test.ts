import { describe, it, expect } from "vitest";
import { parseSnapshotData } from "@/lib/admin/snapshots";

const product = {
  id: 1, slug: "espresso", category_id: 1, name: "Espresso", name_en: null, name_ar: null, desc_tr: null, desc_en: null, desc_ar: null,
  ingredients_tr: null, ingredients_en: null, ingredients_ar: null, kcal: null, allergens: "", allergens_entered: 0, temp: "hot", in_suggest: null,
  image_key: null, image_focus_x: 0.5, image_focus_y: 0.5, is_new: 0, is_featured: 0, is_visible: 1, sold_out_until: null, sort_order: 0, updated_at: "2026-10-29T10:00:00.000Z",
};
const settings = { id: 1, opening_time: "08:00", footer_note_tr: "", footer_note_en: null, footer_note_ar: null, stats_enabled: 1 };
const hero = { id: 1, slide_key: "fast", title: "HOT & FAST", default_image: "/qr/hero/fast.webp", image_key: null, color: "red", icon: "rabbit", sort_order: 0, is_visible: 1, image_focus_x: 0.5, image_focus_y: 0.5 };
const old = { groups: [], categories: [], products: [product], variants: [], extras: [], extraCategories: [], tags: [], productTags: [], settings: [settings], heroSlides: [hero] };

describe("eski menü kopyaları", () => {
  it("vitrin ikonlu ve ağırlıksız kopyayı açar, ağırlığı Normal sayar", () => {
    const data = parseSnapshotData(JSON.stringify(old));
    expect(data.products[0].suggest_weight).toBe(1);
    expect(data.heroSlides[0].title).toBe("HOT & FAST");
  });
});
