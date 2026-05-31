"use client";

import { Suspense } from "react";
import { useNotesBoard } from "@/hooks/useNotesBoard";
import { BoardProvider, useBoardContext } from "@/contexts/BoardContext";
import ErrorBoundary from "./ErrorBoundary";
import NoteCardSkeleton from "./NoteCardSkeleton";
import Sidebar from "./Sidebar";
import BoardHeader from "./BoardHeader";
import NotesGrid from "./NotesGrid";
import NoteView from "./NoteView";

export default function NotesBoard() {
  return (
    // useSearchParams (inside useNotesBoard) requires a Suspense boundary in
    // Next.js App Router so the rest of the page doesn't opt into dynamic rendering.
    <Suspense fallback={<BoardSkeleton />}>
      <NotesBoardInner />
    </Suspense>
  );
}

function NotesBoardInner() {
  const board = useNotesBoard();
  return (
    <BoardProvider value={board}>
      <BoardContent />
    </BoardProvider>
  );
}

function BoardContent() {
  const { editing } = useBoardContext();
  return (
    <ErrorBoundary>
      <main className="min-h-screen px-6 py-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <BoardHeader />
          <div className="flex flex-col gap-8 lg:flex-row">
            <Sidebar />
            <NotesGrid />
          </div>
        </div>
        {editing !== undefined && <NoteView />}
      </main>
    </ErrorBoundary>
  );
}

function BoardSkeleton() {
  return (
    <main className="min-h-screen px-6 py-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 h-10 w-full animate-pulse rounded-full bg-black/[0.07]" />
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full space-y-3 lg:w-56">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-md bg-black/[0.07]" />
            ))}
          </aside>
          <section className="notes-masonry flex-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <NoteCardSkeleton key={i} />
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
