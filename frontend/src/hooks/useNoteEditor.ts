"use client";

import { useCallback, useRef, useState } from "react";
import type { Category, Note, NoteInput } from "@/lib/types";

const DEFAULT_COLOR = "#F0A875";

export type EditorMode = "write" | "preview";

export interface NoteEditor {
  current: Note | null;
  title: string;
  setTitle: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  categoryId: number | null;
  changeCategory: (id: number | null) => void;
  tags: string[];
  changeTags: (tags: string[]) => void;
  savedAt: string | null;
  error: string | null;
  mode: EditorMode;
  toggleMode: () => Promise<void>;
  color: string;
  /** Persist current values (used on blur and on close). No-op if unchanged. */
  persist: () => Promise<void>;
}

/**
 * Owns all state and persistence logic for editing a single note:
 * field state, autosave (skipping no-op and empty-title saves), the
 * write/preview mode, and the derived card colour. Keeping this here lets the
 * NoteView stay purely presentational and lets the logic be unit-tested.
 */
export function useNoteEditor(
  note: Note | null,
  categories: Category[],
  onSave: (data: NoteInput, id: number | null) => Promise<Note>
): NoteEditor {
  const [current, setCurrent] = useState<Note | null>(note);
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(
    note?.category ?? categories[0]?.id ?? null
  );
  const [tags, setTags] = useState<string[]>(note?.tags ?? []);
  const [savedAt, setSavedAt] = useState<string | null>(note?.updated_at ?? null);
  const [error, setError] = useState<string | null>(null);
  // Existing notes open in preview (rendered); new notes open in write mode.
  const [mode, setMode] = useState<EditorMode>(note ? "preview" : "write");

  // Snapshot of the last successfully-saved values, to skip no-op saves.
  const lastSaved = useRef({
    title: note?.title ?? "",
    content: note?.content ?? "",
    category: note?.category ?? null,
    tags: note?.tags ?? [] as string[],
  });

  const color =
    categories.find((c) => c.id === categoryId)?.color ?? DEFAULT_COLOR;

  const persist = useCallback(
    async (next?: { categoryId?: number | null; tags?: string[] }) => {
      const cat = next?.categoryId !== undefined ? next.categoryId : categoryId;
      const t = next?.tags !== undefined ? next.tags : tags;
      const data: NoteInput = { title: title.trim(), content, category: cat, tags: t };

      // Never create/keep an empty-title note.
      if (!data.title) {
        if (current) setError("Title is required.");
        return;
      }

      const unchanged =
        data.title === lastSaved.current.title &&
        data.content === lastSaved.current.content &&
        data.category === lastSaved.current.category &&
        JSON.stringify(data.tags) === JSON.stringify(lastSaved.current.tags);
      if (unchanged) return;

      try {
        const saved = await onSave(data, current?.id ?? null);
        setCurrent(saved);
        setSavedAt(saved.updated_at);
        lastSaved.current = {
          title: saved.title,
          content: saved.content,
          category: saved.category,
          tags: saved.tags,
        };
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save.");
      }
    },
    [title, content, categoryId, tags, current, onSave]
  );

  const changeCategory = useCallback(
    (id: number | null) => {
      setCategoryId(id);
      void persist({ categoryId: id });
    },
    [persist]
  );

  const changeTags = useCallback(
    (newTags: string[]) => {
      setTags(newTags);
      void persist({ tags: newTags });
    },
    [persist]
  );

  const toggleMode = useCallback(async () => {
    if (mode === "write") {
      await persist();
      setMode("preview");
    } else {
      setMode("write");
    }
  }, [mode, persist]);

  return {
    current,
    title,
    setTitle,
    content,
    setContent,
    categoryId,
    changeCategory,
    tags,
    changeTags,
    savedAt,
    error,
    mode,
    toggleMode,
    color,
    persist: () => persist(),
  };
}
