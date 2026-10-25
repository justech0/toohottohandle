export type BrandIconName = "lips" | "rabbit" | "star" | "logo";

/**
 * Resmi logo/ikon PNG'leri alfa maskesi olarak kullanılır; renk currentColor'dan gelir.
 * Çizimler yeniden yapılmaz (spec 2.3).
 */
export function BrandIcon({ name, className = "", label }: { name: BrandIconName; className?: string; label?: string }) {
  const url = `url(/qr/brand/${name}.png)`;
  return (
    <span
      className={`brand-icon brand-icon--${name} ${className}`.trim()}
      style={{ maskImage: url, WebkitMaskImage: url }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
