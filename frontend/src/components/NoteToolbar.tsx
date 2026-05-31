"use client";

import type { Category } from "@/lib/types";
import type { EditorMode } from "@/hooks/useNoteEditor";
import CategorySelect from "./CategorySelect";

interface NoteToolbarProps {
  categories: Category[];
  categoryId: number | null;
  onChangeCategory: (id: number | null) => void;
  mode: EditorMode;
  onToggleMode: () => void;
  canDelete: boolean;
  onDelete: () => void;
  onClose: () => void;
}

/** Top bar of the note view: category picker, preview toggle, delete, close. */
export default function NoteToolbar({
  categories,
  categoryId,
  onChangeCategory,
  mode,
  onToggleMode,
  canDelete,
  onDelete,
  onClose,
}: NoteToolbarProps) {
  return (
    <div className="mb-5 flex items-start justify-between">
      <CategorySelect
        categories={categories}
        value={categoryId}
        onChange={onChangeCategory}
      />
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleMode}
          className="rounded-full px-3 py-2 text-sm text-black/60 hover:bg-black/5"
        >
          {mode === "write" ? "Preview" : "Edit"}
        </button>
        {canDelete && (
          <button
            type="button"
            aria-label="Delete note"
            onClick={onDelete}
            className="rounded-full p-2 text-black/50 hover:bg-black/5 hover:text-red-600"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v14a1 1 0 01-1 1H7a1 1 0 01-1-1V6" />
            </svg>
          </button>
        )}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="rounded-full p-2 text-black/60 hover:bg-black/5"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
