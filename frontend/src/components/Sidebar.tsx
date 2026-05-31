"use client";

import { useBoardContext } from "@/contexts/BoardContext";

export default function Sidebar() {
  const { categories, selectedCategoryId, loading, setSelectedCategoryId } =
    useBoardContext();

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <h2 className="font-semibold text-sm mb-4">All Categories</h2>

      {loading && categories.length === 0 && (
        <ul className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-8 animate-pulse rounded-md bg-black/[0.07]" />
          ))}
        </ul>
      )}

      <ul className="space-y-3">
        {categories.map((cat) => {
          const active = cat.id === selectedCategoryId;
          return (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => setSelectedCategoryId(active ? null : cat.id)}
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
