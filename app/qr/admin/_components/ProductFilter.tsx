"use client";

import { useEffect, useState } from "react";

/** Liste sunucuda üretilir; arama yalnızca satırları gizler (Türkçe küçük harf). */
export function ProductFilter() {
  const [q, setQ] = useState("");
  useEffect(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    for (const sec of document.querySelectorAll<HTMLElement>("[data-cat]")) {
      let shown = 0;
      for (const li of sec.querySelectorAll<HTMLElement>("[data-name]")) {
        const hit = !needle || (li.dataset.name ?? "").includes(needle);
        li.hidden = !hit;
        if (hit) shown++;
      }
      sec.hidden = shown === 0;
    }
  }, [q]);
  return (
    <label className="adm-field adm-search">
      <span className="sr-only">Ürün ara</span>
      <input type="search" placeholder="Ürün ara" value={q} onChange={(e) => setQ(e.target.value)} />
    </label>
  );
}
