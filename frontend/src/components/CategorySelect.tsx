"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/types";

interface CategorySelectProps {
  categories: Category[];
  value: number | null;
  onChange: (categoryId: number | null) => void;
}

/**
 * Pill-style category dropdown shown at the top-left of the note view:
 * a coloured dot + the category name + a chevron, with a popover list.
 */
export default function CategorySelect({
  categories,
  value,
  onChange,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = categories.find((c) => c.id === value) ?? null;

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const choose = (id: number | null) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-56 items-center justify-between gap-2 rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm shadow-sm hover:bg-white"
      >
        <span className="flex items-center gap-2 truncate">
          <span
            className="inline-block h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: selected?.color ?? "#cccccc" }}
            aria-hidden
          />
          {selected ? selected.name : "No category"}
        </span>
        <span aria-hidden className="text-black/40">
          ▾
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-10 mt-1 w-56 overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg"
        >
          <li role="option" aria-selected={value === null}>
            <button
              type="button"
              onClick={() => choose(null)}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-black/5"
            >
              <span className="inline-block h-3 w-3 rounded-full bg-gray-300" />
              No category
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id} role="option" aria-selected={c.id === value}>
              <button
                type="button"
                onClick={() => choose(c.id)}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-black/5"
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
