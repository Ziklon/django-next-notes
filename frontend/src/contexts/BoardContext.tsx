"use client";

import { createContext, useContext } from "react";
import type { NotesBoardState } from "@/hooks/useNotesBoard";

const BoardContext = createContext<NotesBoardState | null>(null);

export const BoardProvider = BoardContext.Provider;

export function useBoardContext(): NotesBoardState {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error("useBoardContext must be used inside <BoardProvider>");
  return ctx;
}
