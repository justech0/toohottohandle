"use client";

import { Children, isValidElement, useEffect, useId, useRef, useState, type ReactNode, type KeyboardEvent } from "react";

type Props = { name: string; children: ReactNode; value?: string | number; defaultValue?: string | number; onChange?: (value: string) => void; disabled?: boolean; "aria-label"?: string };
type Option = { value: string; label: ReactNode; text: string; disabled: boolean };
const LABELS: Record<string, string> = { color: "Renk", icon: "İkon", categoryId: "Kategori", groupId: "Grup", sizes: "Boy", temp: "Sıcak / soğuk", defaultTemp: "Varsayılan sıcak / soğuk", inSuggest: "Ne içsem'e dahil", konu: "Konu", puan: "Puan", suggestMode: "Mod" };
const contentText = (node: ReactNode): string => Children.toArray(node).map(n => isValidElement<{children?: ReactNode}>(n) ? contentText(n.props.children) : String(n)).join("");
function optionsOf(children: ReactNode): Option[] {
  return Children.toArray(children).flatMap(child => {
    if (!isValidElement<{ value?: string | number; children?: ReactNode; disabled?: boolean }>(child)) return [];
    if (child.type !== "option") return optionsOf(child.props.children);
    return [{ value: String(child.props.value ?? contentText(child.props.children)), label: child.props.children, text: contentText(child.props.children), disabled: Boolean(child.props.disabled) }];
  });
}

export function BrandSelect(props: Props) {
  const options = optionsOf(props.children);
  const [local, setLocal] = useState(String(props.defaultValue ?? options[0]?.value ?? ""));
  const value = String(props.value ?? local);
  const selected = Math.max(0, options.findIndex(o => o.value === value));
  const [open, setOpen] = useState(false), [active, setActive] = useState(selected);
  const root = useRef<HTMLDivElement>(null), button = useRef<HTMLButtonElement>(null), list = useRef<HTMLDivElement>(null);
  const id = useId(), label = props["aria-label"] ?? LABELS[props.name] ?? props.name;
  const close = (focus = true) => { setOpen(false); if (focus) button.current?.focus(); };
  const choose = (index: number) => {
    const option = options[index]; if (!option || option.disabled) return;
    setLocal(option.value); props.onChange?.(option.value);
    // Üst formun kaydedilmemiş değişiklik kontrolü de haberdar olur.
    root.current?.dispatchEvent(new Event("change", { bubbles: true }));
    close();
  };
  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) close(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  useEffect(() => { if (open) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: "nearest" }); }, [open, active, id]);
  const keydown = (event: KeyboardEvent) => {
    const key = event.key;
    if (["ArrowDown", "ArrowUp", "Home", "End", "Enter", " ", "Escape"].includes(key)) event.preventDefault();
    if (key === "Escape") { close(); return; }
    if (key === "Tab") { close(false); return; }
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(key)) { setActive(selected); setOpen(true); return; }
    if ((key === "Enter" || key === " ") && open) { choose(active); return; }
    if (key === "Home") setActive(0);
    if (key === "End") setActive(options.length - 1);
    if (key === "ArrowDown" || key === "ArrowUp") {
      const step = key === "ArrowDown" ? 1 : -1;
      for (let i = 1; i <= options.length; i++) { const next = (active + step * i + options.length) % options.length; if (!options[next].disabled) { setActive(next); break; } }
    } else if (key.length === 1 && key !== " ") {
      const match = options.findIndex(o => !o.disabled && o.text.toLocaleLowerCase("tr").startsWith(key.toLocaleLowerCase("tr")));
      if (match >= 0) setActive(match);
    }
  };
  return <div ref={root} className="adm-select" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <input type="hidden" name={props.name} value={value} disabled={props.disabled} />
    <button ref={button} type="button" className="adm-select__trigger" role="combobox" aria-label={label} aria-expanded={open} aria-controls={`${id}-list`} aria-haspopup="listbox" disabled={props.disabled} data-brand-select={props.name} onKeyDown={keydown} onClick={() => { setActive(selected); setOpen(!open); }}>
      <span>{options[selected]?.label ?? "Seç"}</span><span aria-hidden="true">▾</span>
    </button>
    {open ? <div ref={list} id={`${id}-list`} className="adm-select__list" role="listbox" aria-label={label} tabIndex={-1} aria-activedescendant={`${id}-${active}`} onKeyDown={keydown}>
      {options.map((option, index) => <div id={`${id}-${index}`} key={option.value} role="option" data-value={option.value} aria-selected={option.value === value} aria-disabled={option.disabled || undefined} className="adm-select__option" data-active={index === active} onPointerMove={() => setActive(index)} onClick={event => { event.preventDefault(); event.stopPropagation(); choose(index); }}>{option.label}</div>)}
    </div> : null}
  </div>;
}
