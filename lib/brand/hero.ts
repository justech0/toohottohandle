import type { BrandIconName } from "@/app/qr/_components/BrandIcon";

export type HeroSlide = {
  key: "fast" | "free" | "shine";
  title: string;
  image: string;
  color: "red" | "blue" | "yellow";
  icon: Exclude<BrandIconName, "logo">;
};

/** Spec v3 3.1: vitrin sloganları, sırayla döner. */
export const HERO_SLIDES: readonly HeroSlide[] = [
  { key: "fast", title: "HOT & FAST", image: "/qr/hero/fast.webp", color: "red", icon: "rabbit" },
  { key: "free", title: "HOT & FREE", image: "/qr/hero/free.webp", color: "blue", icon: "lips" },
  { key: "shine", title: "HOT & SHINE", image: "/qr/hero/shine.webp", color: "yellow", icon: "star" },
];

export const HERO_INTERVAL_MS = 4000;
