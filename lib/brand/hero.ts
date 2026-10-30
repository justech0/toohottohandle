import type { BrandIconName } from "./icons";

export type HeroSlide = {
  key: string;
  title: string;
  focusX?: number; focusY?: number;
  image: string;
  color: "red" | "blue" | "yellow" | "pink" | "green" | "gray";
  icon: Exclude<BrandIconName, "logo">;
};

export const HERO_INTERVAL_MS = 4000;
