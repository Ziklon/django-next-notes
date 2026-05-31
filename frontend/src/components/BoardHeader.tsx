"use client";

import { useBoardContext } from "@/contexts/BoardContext";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";

export default function BoardHeader() {
  const { openNew } = useBoardContext();

  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex-1" />

      <SearchBar />

      <div className="flex-1 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-2 rounded-full border border-[var(--accent)] px-5 py-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-white"
        >
          <span className="text-lg leading-none">+</span> New Note
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
