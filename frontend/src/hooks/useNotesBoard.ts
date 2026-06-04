"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Category, Note, NoteInput, Tag } from "@/lib/types";
import { api } from "@/lib/api";

/** Editing target: undefined = closed, null = creating, Note = editing. */
export type EditingTarget = Note | null | undefined;

export interface NotesBoardState {
  categories: Category[];
  tags: Tag[];
  notes: Note[];
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
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
 * Owns the board's data and interactions.
 *
 * Filter state (category, search) lives in the URL so the board is
 * bookmarkable and the browser back/forward buttons work as expected.
 * The URL is the single source of truth; React state is only used for
 * data fetched from the API and for the note-editor overlay.
 */
export function useNotesBoard(): NotesBoardState {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive filter state from URL — no local state needed for these.
  const selectedCategoryId = searchParams.get("category")
    ? Number(searchParams.get("category"))
    : null;
  const selectedTag = searchParams.get("tag") ?? null;
  const searchQuery = searchParams.get("search") ?? "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingTarget>(undefined);
  // Increment to force a re-fetch after note close / delete without changing the URL.
  const [reloadKey, setReloadKey] = useState(0);

  function setSelectedCategoryId(id: number | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id != null) params.set("category", String(id));
    else params.delete("category");
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/");
  }

  function setSelectedTag(tag: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (tag != null) params.set("tag", tag);
    else params.delete("tag");
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/");
  }

  function setSearchQuery(q: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("search", q);
    else params.delete("search");
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/");
  }

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      api.listCategories(),
      api.listTags(),
      api.listNotes(selectedCategoryId, searchQuery, selectedTag),
    ])
      .then(([cats, ts, ns]) => {
        if (!active) return;
        setCategories(cats);
        setTags(ts);
        setNotes(ns);
        setError(null);
      })
      .catch((e) =>
        active && setError(e instanceof Error ? e.message : "Failed to load notes.")
      )
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [selectedCategoryId, selectedTag, searchQuery, reloadKey]);

  const saveNote = useCallback(
    (data: NoteInput, id: number | null): Promise<Note> =>
      id ? api.updateNote(id, data) : api.createNote(data),
    []
  );

  const closeAndRefresh = useCallback(() => {
    setEditing(undefined);
    setReloadKey((k) => k + 1);
  }, []);

  const deleteNote = useCallback(async (note: Note) => {
    await api.deleteNote(note.id);
    setEditing(undefined);
    setReloadKey((k) => k + 1);
  }, []);

  return {
    categories,
    tags,
    notes,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedTag,
    setSelectedTag,
    searchQuery,
    setSearchQuery,
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
