"use client";

import { formatPrice } from "@/lib/format/price";
import type { MenuExtra } from "@/lib/menu/types";
import { useLanguage } from "@/lib/i18n/context";
import { resolveText } from "@/lib/i18n/resolve";

export function ExtrasLine({ extras }: { extras: MenuExtra[] }) {
  const { lang } = useLanguage();
  if (extras.length === 0) return null;
  return (
    <p className="extras" data-testid="extras">
      {extras.map((e) => `${resolveText(lang, e.nameAr, e.nameEn, e.nameTr)} +${formatPrice(e.priceKurus)}`).join(" · ")}
    </p>
  );
}
