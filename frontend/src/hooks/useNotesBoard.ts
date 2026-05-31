"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category, Note, NoteInput } from "@/lib/types";
import { api } from "@/lib/api";

/** Editing target: undefined = closed, null = creating, Note = editing. */
export type EditingTarget = Note | null | undefined;

export interface NotesBoardState {
  categories: Category[];
  notes: Note[];
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  loading: boolean;
  error: string | null;
  editing: EditingTarget;
  openNew: () => void;
  openNote: (note: Note) => void;
  closeAndRefresh: () => void;
  saveNote: (data: NoteInput, id: number | null) => Promise<Note>;
  deleteNote: (note: Note) => Promise<void>;
}

/**
 * Owns the board's data and interactions: loading categories/notes,
 * the category filter, the editing overlay target, and create/update/delete.
 * Presentational components receive only the values and callbacks they need.
 */
export function useNotesBoard(): NotesBoardState {
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingTarget>(undefined);

  const loadCategories = useCallback(async () => {
    setCategories(await api.listCategories());
  }, []);

  const loadNotes = useCallback(async () => {
    setNotes(await api.listNotes(selectedCategoryId));
  }, [selectedCategoryId]);

  useEffect(() => {
    let active = true;
    // Stale-while-revalidate: keep the current notes on screen while refetching
    // so the grid never blanks out and flickers. "Loading..." shows only on the
    // very first load, before any notes exist.
    Promise.all([api.listCategories(), api.listNotes(selectedCategoryId)])
      .then(([cats, ns]) => {
        if (!active) return;
        setCategories(cats);
        setNotes(ns);
        setError(null);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load notes.")
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [selectedCategoryId]);

  // Persist without touching board state — avoids re-rendering the board under
  // the overlay on every autosave. The board refreshes once on close.
  const saveNote = useCallback(
    (data: NoteInput, id: number | null): Promise<Note> =>
      id ? api.updateNote(id, data) : api.createNote(data),
    []
  );

  const closeAndRefresh = useCallback(() => {
    setEditing(undefined);
    void Promise.all([loadNotes(), loadCategories()]);
  }, [loadNotes, loadCategories]);

  const deleteNote = useCallback(
    async (note: Note) => {
      await api.deleteNote(note.id);
      setEditing(undefined);
      await Promise.all([loadNotes(), loadCategories()]);
    },
    [loadNotes, loadCategories]
  );

  return {
    categories,
    notes,
    selectedCategoryId,
    setSelectedCategoryId,
    loading,
    error,
    editing,
    openNew: () => setEditing(null),
    openNote: (note: Note) => setEditing(note),
    closeAndRefresh,
    saveNote,
    deleteNote,
  };
}
