"use client";

interface BoardHeaderProps {
  onNewNote: () => void;
}

/** Board header containing the "New Note" action. */
export default function BoardHeader({ onNewNote }: BoardHeaderProps) {
  return (
    <header className="mb-8 flex items-center justify-end">
      <button
        type="button"
        onClick={onNewNote}
        className="flex items-center gap-2 rounded-full border border-[var(--accent)] px-5 py-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-white"
      >
        <span className="text-lg leading-none">+</span> New Note
      </button>
    </header>
  );
}
