"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { searchProducts } from "@/lib/menu/search";
import type { ClientProduct } from "./clientTypes";
import { ClientRow } from "./ClientRow";
import { CloseIcon, SearchIcon } from "./Icons";

export function SearchOverlay({ products, onClose }: { products: ClientProduct[]; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => (query.trim() ? searchProducts(products, query) : []), [products, query]);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="search" data-testid="search-panel" role="dialog" aria-modal="true" aria-label="Arama">
      <div className="search__bar">
        <span className="search__icon" aria-hidden="true"><SearchIcon /></span>
        <input
          ref={inputRef}
          type="search"
          className="search__input"
          aria-label="Ürün ara"
          placeholder="Ürün ara"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          enterKeyHint="search"
        />
        <button type="button" className="icon-btn" aria-label="Kapat" onClick={onClose}><CloseIcon /></button>
      </div>
      <div className="search__body">
        {query.trim() && results.length === 0 ? (
          <div className="search__empty">
            <p data-testid="search-empty">Aradığını bulamadık. Ekibimiz sana yardımcı olabilir.</p>
            <button type="button" className="btn-ghost" onClick={() => { setQuery(""); inputRef.current?.focus(); }}>
              Aramayı temizle
            </button>
          </div>
        ) : (
          <ul className="cat__list search__list">
            {results.map((p) => <ClientRow key={p.slug} product={p} />)}
          </ul>
        )}
      </div>
    </div>
  );
}
