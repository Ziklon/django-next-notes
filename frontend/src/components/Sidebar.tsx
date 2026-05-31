"use client";

import type { Category } from "@/lib/types";

interface SidebarProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelect: (categoryId: number | null) => void;
}

export default function Sidebar({
  categories,
  selectedCategoryId,
  onSelect,
}: SidebarProps) {
  return (
    <aside className="w-full lg:w-56 shrink-0">
      <h2 className="font-semibold text-sm mb-4">All Categories</h2>
      <ul className="space-y-3">
        {categories.map((cat) => {
          const active = cat.id === selectedCategoryId;
          return (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => onSelect(active ? null : cat.id)}
                aria-pressed={active}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-sm transition-colors ${
                  active ? "bg-black/5 font-medium" : "hover:bg-black/5"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                    aria-hidden
                  />
                  {cat.name}
                </span>
                <span className="text-[var(--muted)]">{cat.note_count}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
