"use client";

import type { Note } from "@/lib/types";
import NoteCard from "./NoteCard";

interface NotesGridProps {
  notes: Note[];
  loading: boolean;
  error: string | null;
  onOpen: (note: Note) => void;
}

/** The notes board area: loading / error / empty states and the card grid. */
export default function NotesGrid({ notes, loading, error, onOpen }: NotesGridProps) {
  return (
    <section className="flex-1">
      {loading && notes.length === 0 && (
        <p className="text-[var(--muted)]">Loading notes...</p>
      )}

      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && notes.length === 0 && (
        <p className="text-[var(--muted)]">
          No notes yet. Click &ldquo;New Note&rdquo; to create one.
        </p>
      )}

      {!loading && !error && notes.length > 0 && (
        <div className="notes-masonry">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onClick={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}
