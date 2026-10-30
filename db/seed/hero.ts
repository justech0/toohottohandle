import type { HeroSlide } from "@/lib/brand/hero";

/** Spec v3 3.1: vitrin sloganları, sırayla döner. */
export const HERO_SLIDES: readonly HeroSlide[] = [
  { key: "fast", title: "HOT & FAST", image: "/qr/hero/fast.webp", color: "red", icon: "rabbit" },
  { key: "free", title: "HOT & FREE", image: "/qr/hero/free.webp", color: "blue", icon: "lips" },
  { key: "shine", title: "HOT & SHINE", image: "/qr/hero/shine.webp", color: "yellow", icon: "star" },
];
