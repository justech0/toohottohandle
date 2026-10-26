import type { GroupColor } from "@/lib/menu/types";

export const COLORS = {
  red: "#DC2524",
  yellow: "#F0EE40",
  pink: "#DDBBD1",
  blue: "#335DB2",
  green: "#35A97C",
  gray: "#DBDAD4",
  paper: "#F3ECE6",
  ink: "#2A1514",
  "ink-soft": "#6B5550",
  "red-text": "#B5191C",
  "green-text": "#1F6B4D",
  line: "#E2D6CE",
  white: "#FFFFFF",
} as const;

/** Spec 2.1: beyaz yazı yalnızca kırmızı ve mavi zeminde. */
export function textOn(color: GroupColor): "white" | "ink" {
  return color === "red" || color === "blue" ? "white" : "ink";
}
