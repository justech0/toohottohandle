"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { searchProducts } from "@/lib/menu/search";
import type { CardProduct } from "./clientTypes";
import { ProductCard } from "./ProductCard";
import { CloseIcon, SearchIcon } from "./Icons";
import { useLanguage } from "@/lib/i18n/context";

export function SearchOverlay({ products, onClose, paused = false }: { products: CardProduct[]; onClose: () => void; paused?: boolean }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const { t } = useLanguage();
  const results = useMemo(() => (query.trim() ? searchProducts(products, query) : []), [products, query]);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pausedRef.current) onClose();
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
    <div className="search" data-testid="search-panel" role="dialog" aria-modal="true" aria-label={t.search.dialogLabel}>
      <div className="search__bar">
        <span className="search__icon" aria-hidden="true"><SearchIcon /></span>
        <input
          ref={inputRef}
          type="search"
          className="search__input"
          aria-label={t.search.placeholder}
          placeholder={t.search.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          enterKeyHint="search"
        />
        <button type="button" className="icon-btn" aria-label={t.nav.close} onClick={onClose}><CloseIcon /></button>
      </div>
      <div className="search__body">
        {query.trim() && results.length === 0 ? (
          <div className="search__empty">
            <p data-testid="search-empty">{t.search.empty}</p>
            <button type="button" className="btn-ghost" onClick={() => { setQuery(""); inputRef.current?.focus(); }}>
              {t.search.clear}
            </button>
          </div>
        ) : (
          <ul className="cards search__list">
            {results.map((p) => <ProductCard key={p.slug} p={p} />)}
          </ul>
        )}
      </div>
    </div>
  );
}
