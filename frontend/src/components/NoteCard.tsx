"use client";

import type { Note } from "@/lib/types";
import { formatNoteDate } from "@/lib/date";
import Markdown from "./Markdown";

interface NoteCardProps {
  note: Note;
  onClick: (note: Note) => void;
}

const DEFAULT_COLOR = "#F4CE7B";

export default function NoteCard({ note, onClick }: NoteCardProps) {
  const color = note.category_detail?.color ?? DEFAULT_COLOR;

  return (
    <button
      type="button"
      onClick={() => onClick(note)}
      style={{ backgroundColor: color }}
      className="block w-full rounded-2xl p-5 text-left shadow-sm ring-1 ring-[var(--card-border)] transition-transform hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black/30"
    >
      <div className="mb-2 flex items-center gap-2 text-xs text-black/70">
        <span className="font-semibold">{formatNoteDate(note.updated_at)}</span>
        {note.category_detail && <span>{note.category_detail.name}</span>}
      </div>
      <h3 className="font-serif-title mb-2 text-2xl leading-tight text-black">
        {note.title}
      </h3>
      <div className="max-h-72 overflow-hidden text-black/80">
        <Markdown>{note.content}</Markdown>
      </div>
    </button>
  );
}
