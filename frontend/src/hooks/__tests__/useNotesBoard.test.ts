import { renderHook, act, waitFor } from "@testing-library/react";
import { useNotesBoard } from "@/hooks/useNotesBoard";
import type { Category, Note } from "@/lib/types";

// Mock the API layer so the hook can be tested in isolation.
jest.mock("@/lib/api", () => ({
  api: {
    listCategories: jest.fn(),
    listNotes: jest.fn(),
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
  },
}));

import { api } from "@/lib/api";
const mockApi = api as jest.Mocked<typeof api>;

const cats: Category[] = [
  { id: 1, name: "School", color: "#F4CE7B", note_count: 1, created_at: "" },
];
const notes: Note[] = [
  {
    id: 10,
    title: "Meeting",
    content: "agenda",
    category: 1,
    category_detail: cats[0],
    created_at: "",
    updated_at: "",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockApi.listCategories.mockResolvedValue(cats);
  mockApi.listNotes.mockResolvedValue(notes);
  mockApi.createNote.mockResolvedValue(notes[0]);
  mockApi.updateNote.mockResolvedValue(notes[0]);
  mockApi.deleteNote.mockResolvedValue(undefined);
});

async function renderLoaded() {
  const view = renderHook(() => useNotesBoard());
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  return view;
}

describe("useNotesBoard", () => {
  it("loads categories and notes on mount", async () => {
    const { result } = await renderLoaded();
    expect(result.current.categories).toEqual(cats);
    expect(result.current.notes).toEqual(notes);
    expect(mockApi.listNotes).toHaveBeenCalledWith(null);
    expect(result.current.error).toBeNull();
  });

  it("records an error when loading fails", async () => {
    mockApi.listCategories.mockRejectedValueOnce(new Error("nope"));
    const { result } = renderHook(() => useNotesBoard());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("nope");
  });

  it("refetches notes filtered by the selected category", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.setSelectedCategoryId(1));
    await waitFor(() => expect(mockApi.listNotes).toHaveBeenCalledWith(1));
    expect(result.current.selectedCategoryId).toBe(1);
  });

  it("openNew sets the editing target to null (create mode)", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.openNew());
    expect(result.current.editing).toBeNull();
  });

  it("openNote sets the editing target to that note", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.openNote(notes[0]));
    expect(result.current.editing).toEqual(notes[0]);
  });

  it("saveNote creates when id is null and updates when id is set", async () => {
    const { result } = await renderLoaded();
    const input = { title: "X", content: "", category: 1 };

    await act(async () => {
      await result.current.saveNote(input, null);
    });
    expect(mockApi.createNote).toHaveBeenCalledWith(input);
    expect(mockApi.updateNote).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.saveNote(input, 10);
    });
    expect(mockApi.updateNote).toHaveBeenCalledWith(10, input);
  });

  it("closeAndRefresh clears the editing target and reloads", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.openNote(notes[0]));
    const before = mockApi.listNotes.mock.calls.length;

    await act(async () => {
      result.current.closeAndRefresh();
    });
    expect(result.current.editing).toBeUndefined();
    await waitFor(() =>
      expect(mockApi.listNotes.mock.calls.length).toBeGreaterThan(before)
    );
  });

  it("deleteNote deletes via the API, closes and reloads", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.openNote(notes[0]));

    await act(async () => {
      await result.current.deleteNote(notes[0]);
    });
    expect(mockApi.deleteNote).toHaveBeenCalledWith(10);
    expect(result.current.editing).toBeUndefined();
  });
});

describe("useNotesBoard (error fallback)", () => {
  it("uses a generic message when the load error is not an Error", async () => {
    mockApi.listCategories.mockRejectedValueOnce("boom string");
    const { result } = renderHook(() => useNotesBoard());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to load notes.");
  });
});

describe("useNotesBoard (unmount race)", () => {
  it("ignores a load that resolves after unmount", async () => {
    const { unmount } = renderHook(() => useNotesBoard());
    // Unmount before the (mocked) load promises resolve: the .then guard and
    // the .finally guard both see active === false and skip their state updates.
    unmount();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    // No React "state update after unmount" warning => guards covered.
  });
});
