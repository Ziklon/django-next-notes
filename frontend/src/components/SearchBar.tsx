"use client";

import { useEffect, useState } from "react";
import { useBoardContext } from "@/contexts/BoardContext";

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useBoardContext();
  const [inputValue, setInputValue] = useState(searchQuery);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(inputValue), 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  return (
    <div className="relative w-full max-w-sm">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
        width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        aria-label="Search notes"
        placeholder="Search notes…"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full rounded-full border border-[var(--border)] bg-transparent py-1.5 pl-8 pr-3 text-sm placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
      />
    </div>
  );
}
