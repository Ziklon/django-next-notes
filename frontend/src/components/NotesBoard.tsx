"use client";

import { useNotesBoard } from "@/hooks/useNotesBoard";
import Sidebar from "./Sidebar";
import BoardHeader from "./BoardHeader";
import NotesGrid from "./NotesGrid";
import NoteView from "./NoteView";

/**
 * Notes board page. Composition only: data/interactions live in useNotesBoard;
 * the header, sidebar, grid and note overlay are separate components.
 */
export default function NotesBoard() {
  const board = useNotesBoard();

  return (
    <main className="min-h-screen px-6 py-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <BoardHeader onNewNote={board.openNew} />

        <div className="flex flex-col gap-8 lg:flex-row">
          <Sidebar
            categories={board.categories}
            selectedCategoryId={board.selectedCategoryId}
            onSelect={board.setSelectedCategoryId}
          />
          <NotesGrid
            notes={board.notes}
            loading={board.loading}
            error={board.error}
            onOpen={board.openNote}
          />
        </div>
      </div>

      {board.editing !== undefined && (
        <NoteView
          note={board.editing}
          categories={board.categories}
          onClose={board.closeAndRefresh}
          onSave={board.saveNote}
          onDelete={board.deleteNote}
        />
      )}
    </main>
  );
}
