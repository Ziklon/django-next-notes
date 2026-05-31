/**
 * Shared test utilities.
 *
 * makeBoardState  – builds a full NotesBoardState with safe jest.fn() defaults.
 * All exported symbols from @testing-library/react are re-exported so tests
 * can import everything from a single place.
 */
import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { BoardProvider } from "@/contexts/BoardContext";
import type { NotesBoardState } from "@/hooks/useNotesBoard";

export function makeBoardState(
  overrides: Partial<NotesBoardState> = {}
): NotesBoardState {
  return {
    categories: [],
    notes: [],
    selectedCategoryId: null,
    setSelectedCategoryId: jest.fn(),
    loading: false,
    error: null,
    editing: undefined,
    openNew: jest.fn(),
    openNote: jest.fn(),
    closeAndRefresh: jest.fn(),
    saveNote: jest.fn(),
    deleteNote: jest.fn(),
    ...overrides,
  };
}

export function renderWithBoardContext(
  ui: React.ReactElement,
  boardOverrides: Partial<NotesBoardState> = {},
  options?: RenderOptions
) {
  return render(
    <BoardProvider value={makeBoardState(boardOverrides)}>{ui}</BoardProvider>,
    options
  );
}

export * from "@testing-library/react";
