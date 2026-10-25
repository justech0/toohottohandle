import type { Metadata, Viewport } from "next";
import "@fontsource/unbounded/800.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/menu.css";

export const metadata: Metadata = {
  title: "Too Hot To Handle · Menü",
  description: "Too Hot To Handle, Petrol City AVM. Menü ve fiyatlar.",
};

export const viewport: Viewport = { themeColor: "#DC2524", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function QrLayout({ children }: { children: React.ReactNode }) {
  return children;
}
