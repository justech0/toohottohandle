import type { Metadata, Viewport } from "next";
import "@fontsource/unbounded/800.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/menu.css";
import "./styles/feedback.css";

export const metadata: Metadata = {
  title: "Too Hot To Handle · Menü",
  description: "Too Hot To Handle, Petrol City AVM. Menü ve fiyatlar.",
};

export const viewport: Viewport = { themeColor: "#DC2524", width: "device-width", initialScale: 1, viewportFit: "cover" };

const INTRO_SEEN = `try{if(sessionStorage.getItem("thth-intro-seen"))document.documentElement.classList.add("intro-seen")}catch(e){}`;

export default function QrLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: INTRO_SEEN }} />
      {children}
    </>
  );
}
