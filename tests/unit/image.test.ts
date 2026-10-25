import { describe, it, expect, afterEach } from "vitest";
import { imageSrc, imageSrcSet } from "@/lib/menu/image";
import { getMenu } from "@/lib/menu/getMenu";

describe("image urls", () => {
  it("builds one size", () => {
    expect(imageSrc("ornek-cappuccino", 320)).toBe("/qr/img/ornek-cappuccino-320.webp");
  });
  it("builds the detail srcset", () => {
    expect(imageSrcSet("k")).toBe("/qr/img/k-720.webp 720w, /qr/img/k-1280.webp 1280w");
  });
});

describe("sample photos", () => {
  afterEach(() => {
    delete process.env.THTH_SAMPLE_PHOTOS;
  });
  const key = async (slug: string) => (await getMenu()).products.find((p) => p.slug === slug)!.imageKey;

  it("are off by default", async () => {
    expect(await key("cappuccino")).toBeNull();
  });
  it("attach to eleven products when THTH_SAMPLE_PHOTOS=1", async () => {
    process.env.THTH_SAMPLE_PHOTOS = "1";
    expect(await key("cappuccino")).toBe("ornek-cappuccino");
    expect(await key("cheesecake")).toBe("ornek-cheesecake");
    expect(await key("ube-latte")).toBe("ornek-ube-latte");
    expect(await key("morning-sando")).toBe("ornek-morning-sando");
    expect(await key("cortado")).toBeNull();
    expect((await getMenu()).products.filter((p) => p.imageKey).length).toBe(11);
  });
});
