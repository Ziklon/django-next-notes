"use client";

import { useCallback, useEffect } from "react";
import type { Category, Note, NoteInput } from "@/lib/types";
import { formatLastEdited } from "@/lib/date";
import { useNoteEditor } from "@/hooks/useNoteEditor";
import NoteToolbar from "./NoteToolbar";
import NoteEditor from "./NoteEditor";
import NotePreview from "./NotePreview";

interface NoteViewProps {
  note: Note | null; // null => create mode
  categories: Category[];
  onClose: () => void;
  /** Persist the note. `id` is null when creating. Returns the saved note. */
  onSave: (data: NoteInput, id: number | null) => Promise<Note>;
  onDelete?: (note: Note) => Promise<void>;
}

/**
 * Full-screen note overlay. Composition only: state and persistence live in
 * useNoteEditor; the toolbar, editor and preview are separate components.
 */
export default function NoteView({
  note,
  categories,
  onClose,
  onSave,
  onDelete,
}: NoteViewProps) {
  const editor = useNoteEditor(note, categories, onSave);

  const handleClose = useCallback(async () => {
    await editor.persist();
    onClose();
  }, [editor, onClose]);

  // Close on Escape (persists first).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--background)] p-5 lg:p-8">
      <NoteToolbar
        categories={categories}
        categoryId={editor.categoryId}
        onChangeCategory={editor.changeCategory}
        mode={editor.mode}
        onToggleMode={editor.toggleMode}
        canDelete={Boolean(editor.current && onDelete)}
        onDelete={() => {
          if (editor.current && onDelete) onDelete(editor.current);
        }}
        onClose={handleClose}
      />

      <div
        className="flex flex-1 flex-col overflow-y-auto rounded-3xl p-7 ring-1 ring-[var(--card-border)] transition-colors duration-300 lg:p-10"
        style={{ backgroundColor: editor.color }}
      >
        <p className="mb-4 text-right text-sm text-black/60">
          {editor.savedAt
            ? `Last Edited: ${formatLastEdited(editor.savedAt)}`
            : "New note - unsaved"}
        </p>

        {editor.mode === "write" ? (
          <NoteEditor
            title={editor.title}
            content={editor.content}
            error={editor.error}
            onTitleChange={editor.setTitle}
            onContentChange={editor.setContent}
            onBlur={editor.persist}
          />
        ) : (
          <NotePreview title={editor.title} content={editor.content} />
        )}
      </div>
    </div>
  );
}
