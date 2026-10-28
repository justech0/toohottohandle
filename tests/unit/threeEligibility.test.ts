import { describe, expect, it } from "vitest";
import { shouldLoadThree } from "@/lib/three/eligibility";

const capable = {
  webgl2: true,
  reducedMotion: false,
  saveData: false,
  effectiveType: "4g",
  hardwareConcurrency: 8,
  sessionDisabled: false,
};

describe("shouldLoadThree", () => {
  it("accepts a capable device", () => {
    expect(shouldLoadThree(capable)).toBe(true);
  });

  it.each([
    ["WebGL2 yok", { webgl2: false }],
    ["hareket azaltma açık", { reducedMotion: true }],
    ["veri tasarrufu açık", { saveData: true }],
    ["2G bağlantı", { effectiveType: "2g" }],
    ["3G bağlantı", { effectiveType: "3g" }],
    ["dört çekirdekten az", { hardwareConcurrency: 2 }],
    ["oturumda yavaş bulundu", { sessionDisabled: true }],
  ])("rejects when %s", (_label, change) => {
    expect(shouldLoadThree({ ...capable, ...change })).toBe(false);
  });

  it("does not reject Safari-style unknown connection and core hints", () => {
    expect(shouldLoadThree({ ...capable, effectiveType: undefined, hardwareConcurrency: undefined })).toBe(true);
  });
});
