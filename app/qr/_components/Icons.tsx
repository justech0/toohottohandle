const base = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const SearchIcon = () => (
  <svg {...base}><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /></svg>
);
export const WifiIcon = () => (
  <svg {...base}><path d="M2.5 8.5a14 14 0 0 1 19 0" /><path d="M5.8 12.2a9 9 0 0 1 12.4 0" /><path d="M9.1 15.8a4.2 4.2 0 0 1 5.8 0" /><circle cx="12" cy="19" r="1" fill="currentColor" /></svg>
);
export const CloseIcon = () => (
  <svg {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const PhotoIcon = () => (
  <svg {...base}><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="8" cy="9" r="1.5" /><path d="m3 16 5-4 4 3 4-5 5 6" /></svg>
);
