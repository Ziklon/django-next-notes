"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBoardContext } from "@/contexts/BoardContext";

export default function BoardHeader() {
  const { openNew, searchQuery, setSearchQuery } = useBoardContext();
  const { logOut } = useAuth();
  const router = useRouter();

  // Local state drives the input immediately; URL is updated after a short delay
  // so the address bar doesn't change on every keystroke.
  const [inputValue, setInputValue] = useState(searchQuery);

  // Sync input when the URL changes externally (e.g. browser back button).
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Debounce: write to URL 300 ms after the user stops typing.
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(inputValue), 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  function handleLogOut() {
    logOut();
    router.push("/login");
  }

  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 flex-1">
        <button
          type="button"
          onClick={handleLogOut}
          className="text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--foreground)] transition-colors shrink-0"
        >
          Log out
        </button>

        <div className="relative flex-1 max-w-sm">
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
            className="w-full rounded-full border border-black/15 bg-transparent py-1.5 pl-8 pr-8 text-center text-sm placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={openNew}
        className="flex items-center gap-2 rounded-full border border-[var(--accent)] px-5 py-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-white shrink-0"
      >
        <span className="text-lg leading-none">+</span> New Note
      </button>
    </header>
  );
}
