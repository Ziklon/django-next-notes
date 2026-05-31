"use client";

import { useNotesBoard } from "@/hooks/useNotesBoard";
import { BoardProvider, useBoardContext } from "@/contexts/BoardContext";
import Sidebar from "./Sidebar";
import BoardHeader from "./BoardHeader";
import NotesGrid from "./NotesGrid";
import NoteView from "./NoteView";

export default function NotesBoard() {
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
  );
}
