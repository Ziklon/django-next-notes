"use client";

import { useCallback, useEffect } from "react";
import { formatLastEdited } from "@/lib/date";
import { useBoardContext } from "@/contexts/BoardContext";
import { useNoteEditor } from "@/hooks/useNoteEditor";
import NoteToolbar from "./NoteToolbar";
import NoteEditor from "./NoteEditor";
import NotePreview from "./NotePreview";

export default function NoteView() {
  const { editing, categories, closeAndRefresh, saveNote, deleteNote } =
    useBoardContext();

  // editing is Note | null here (undefined means NoteView isn't rendered)
  const note = editing ?? null;
  const editor = useNoteEditor(note, categories, saveNote);

  const handleClose = useCallback(async () => {
    await editor.persist();
    closeAndRefresh();
  }, [editor, closeAndRefresh]);

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
        tags={editor.tags}
        onChangeTags={editor.changeTags}
        mode={editor.mode}
        onToggleMode={editor.toggleMode}
        canDelete={Boolean(editor.current)}
        onDelete={() => {
          if (editor.current) deleteNote(editor.current);
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
