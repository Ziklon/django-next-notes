"use client";

import { useBoardContext } from "@/contexts/BoardContext";
import NoteCard from "./NoteCard";
import NoteCardSkeleton from "./NoteCardSkeleton";

const SKELETON_COUNT = 6;

export default function NotesGrid() {
  const { notes, loading, error, openNote } = useBoardContext();
  const initialLoad = loading && notes.length === 0;

  return (
    <section className="flex-1">
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}

      {!error && initialLoad && (
        <div className="notes-masonry">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!error && !initialLoad && notes.length === 0 && (
        <p className="text-[var(--muted)]">
          No notes yet. Click &ldquo;New Note&rdquo; to create one.
        </p>
      )}

      {!error && !initialLoad && notes.length > 0 && (
        <div className={`notes-masonry ${loading ? "opacity-60 transition-opacity" : ""}`}>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onClick={openNote} />
          ))}
        </div>
      )}
    </section>
  );
}
