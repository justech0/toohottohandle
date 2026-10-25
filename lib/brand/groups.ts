import type { BrandIconName } from "@/app/qr/_components/BrandIcon";

export type GroupStyle = { image: string | null; icon: Exclude<BrandIconName, "logo"> };

/** Spec v3 3.3: grup afişi görselleri ve ikonları (A2'de admin'den seçilecek). */
export const GROUP_STYLE: Record<string, GroupStyle> = {
  kahve: { image: "/qr/groups/kahve.webp", icon: "star" },
  spesiyal: { image: "/qr/groups/spesiyal.webp", icon: "lips" },
  yiyecek: { image: "/qr/groups/yiyecek.webp", icon: "rabbit" },
  tatli: { image: "/qr/groups/tatli.webp", icon: "lips" },
  paket: { image: "/qr/groups/paket.webp", icon: "star" },
};

export const groupStyle = (slug: string): GroupStyle => GROUP_STYLE[slug] ?? { image: null, icon: "star" };
