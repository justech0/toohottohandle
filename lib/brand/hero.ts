export type HeroSlide = {
  key: string;
  title: string;
  focusX?: number; focusY?: number;
  image: string;
  color: "red" | "blue" | "yellow" | "pink" | "green" | "gray";
};

export const HERO_INTERVAL_MS = 4000;
