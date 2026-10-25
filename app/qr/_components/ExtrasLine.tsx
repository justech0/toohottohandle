import { formatPrice } from "@/lib/format/price";
import type { MenuExtra } from "@/lib/menu/types";

export function ExtrasLine({ extras }: { extras: MenuExtra[] }) {
  if (extras.length === 0) return null;
  return (
    <p className="extras" data-testid="extras">
      {extras.map((e) => `${e.nameTr} +${formatPrice(e.priceKurus)}`).join(" · ")}
    </p>
  );
}
