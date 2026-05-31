"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";

export default function UserMenu() {
  const { logOut } = useAuth();
  const router = useRouter();
  const { isDark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function handleLogOut() {
    logOut();
    router.push("/login");
  }

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        type="button"
        aria-label="Open user menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-11 z-50 w-52 rounded-xl border border-[var(--border)] bg-[var(--dropdown-bg)] py-1"
          style={{ boxShadow: "0 8px 24px var(--dropdown-shadow)" }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={toggle}
            className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
          >
            <span className="flex items-center gap-2.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {isDark ? (
                  <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>
                ) : (
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                )}
              </svg>
              {isDark ? "Light mode" : "Dark mode"}
            </span>
            <div className={`relative h-5 w-9 rounded-full transition-colors ${isDark ? "bg-[var(--accent)]" : "bg-black/20"}`}>
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isDark ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
          </button>

          <div className="mx-3 my-1 border-t border-[var(--border)]" />

          <button
            type="button"
            role="menuitem"
            onClick={handleLogOut}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
