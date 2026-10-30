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

const PRE_HYDRATE_CHECK = `try{var l=localStorage.getItem("thth-lang");if(l==="ar"){document.documentElement.dir="rtl";document.documentElement.lang="ar"}else if(l==="en"){document.documentElement.dir="ltr";document.documentElement.lang="en"}else{document.documentElement.dir="ltr";document.documentElement.lang="tr"}if(sessionStorage.getItem("thth-intro-seen"))document.documentElement.classList.add("intro-seen");if(window.scrollY>80)document.documentElement.dataset.heroVisible="false";window.addEventListener("scroll",function s(){if(window.scrollY>80){document.documentElement.dataset.heroVisible="false"}else if(window.scrollY<=20){document.documentElement.dataset.heroVisible="true"}},{passive:true})}catch(e){}`;

export default function QrLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PRE_HYDRATE_CHECK }} />
      {children}
    </>
  );
}
