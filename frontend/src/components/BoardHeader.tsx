"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBoardContext } from "@/contexts/BoardContext";

export default function BoardHeader() {
  const { openNew } = useBoardContext();
  const { logOut } = useAuth();
  const router = useRouter();

  function handleLogOut() {
    logOut();
    router.push("/login");
  }

  return (
    <header className="mb-8 flex items-center justify-between">
      <button
        type="button"
        onClick={handleLogOut}
        className="text-sm text-[var(--muted)] underline underline-offset-2 hover:text-[var(--foreground)] transition-colors"
      >
        Log out
      </button>
      <button
        type="button"
        onClick={openNew}
        className="flex items-center gap-2 rounded-full border border-[var(--accent)] px-5 py-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-white"
      >
        <span className="text-lg leading-none">+</span> New Note
      </button>
    </header>
  );
}
