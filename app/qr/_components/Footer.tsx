import { formatDateTr } from "@/lib/format/date";
import type { MenuSettings } from "@/lib/menu/types";

export function Footer({ settings }: { settings: MenuSettings }) {
  return (
    <footer className="menu-footer" data-testid="menu-footer">
      {`${settings.footerNoteTr} · Fiyatlara KDV dahildir · Son güncelleme: ${formatDateTr(settings.menuUpdatedAt)}`}
    </footer>
  );
}
