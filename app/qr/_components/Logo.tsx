import { HOT_PATH, HOT_VIEWBOX, LOCKUP_LETTERS, LOCKUP_VIEWBOX } from "@/lib/brand/lockup";

type Props = { variant?: "lockup" | "hot"; className?: string; title?: string };

/** Resmi logo. Yeniden çizilmez; yollar lib/brand/lockup.ts içindedir. */
export function Logo({ variant = "lockup", className, title = "Too Hot To Handle" }: Props) {
  if (variant === "hot") {
    return (
      <svg viewBox={HOT_VIEWBOX} className={className} role="img" aria-label={title} fill="currentColor">
        <path d={HOT_PATH.d} />
      </svg>
    );
  }
  return (
    <svg viewBox={LOCKUP_VIEWBOX} className={className} role="img" aria-label={title} fill="currentColor" fillRule="evenodd">
      {LOCKUP_LETTERS.map((l, i) => (
        <path key={i} transform={l.transform} d={l.d} />
      ))}
      <path transform={HOT_PATH.transform} d={HOT_PATH.d} />
    </svg>
  );
}
