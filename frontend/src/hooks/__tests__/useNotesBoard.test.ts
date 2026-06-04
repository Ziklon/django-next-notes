import { renderHook, act, waitFor } from "@testing-library/react";
import { useNotesBoard } from "@/hooks/useNotesBoard";
import type { Category, Note, Tag } from "@/lib/types";

jest.mock("@/lib/api", () => ({
  api: {
    listCategories: jest.fn(),
    listTags: jest.fn(),
    listNotes: jest.fn(),
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
  },
}));

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

import { api } from "@/lib/api";
import { useSearchParams } from "next/navigation";
const mockApi = api as jest.Mocked<typeof api>;

const cats: Category[] = [
  { id: 1, name: "School", color: "#F4CE7B", note_count: 1, created_at: "" },
];
const tags: Tag[] = [{ id: 1, name: "work", note_count: 1 }];
const notes: Note[] = [
  {
    id: 10,
    title: "Meeting",
    content: "agenda",
    category: 1,
    category_detail: cats[0],
    tags: [],
    created_at: "",
    updated_at: "",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockApi.listCategories.mockResolvedValue(cats);
  mockApi.listTags.mockResolvedValue(tags);
  mockApi.listNotes.mockResolvedValue(notes);
  mockApi.createNote.mockResolvedValue(notes[0]);
  mockApi.updateNote.mockResolvedValue(notes[0]);
  mockApi.deleteNote.mockResolvedValue(undefined);
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
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
    expect(mockApi.listNotes).toHaveBeenCalledWith(null, "", null);
    expect(result.current.error).toBeNull();
  });

  it("reads selectedCategoryId and searchQuery from URL params", async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("category=2&search=hello")
    );
    const { result } = await renderLoaded();
    expect(result.current.selectedCategoryId).toBe(2);
    expect(result.current.searchQuery).toBe("hello");
    expect(mockApi.listNotes).toHaveBeenCalledWith(2, "hello", null);
  });

  it("setSelectedCategoryId updates the URL with the category param", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.setSelectedCategoryId(1));
    expect(mockReplace).toHaveBeenCalledWith("/?category=1");
  });

  it("setSelectedCategoryId(null) removes the category param from the URL", async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("category=1")
    );
    const { result } = await renderLoaded();
    act(() => result.current.setSelectedCategoryId(null));
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("setSelectedTag updates the URL with the tag param", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.setSelectedTag("python"));
    expect(mockReplace).toHaveBeenCalledWith("/?tag=python");
  });

  it("setSelectedTag(null) removes the tag param from the URL", async () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams("tag=python"));
    const { result } = await renderLoaded();
    act(() => result.current.setSelectedTag(null));
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("setSearchQuery updates the URL with the search param", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.setSearchQuery("agenda"));
    expect(mockReplace).toHaveBeenCalledWith("/?search=agenda");
  });

  it("setSearchQuery with empty string removes the search param", async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("search=old")
    );
    const { result } = await renderLoaded();
    act(() => result.current.setSearchQuery(""));
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("records the error message when loading fails with an Error", async () => {
    mockApi.listCategories.mockRejectedValueOnce(new Error("nope"));
    const { result } = renderHook(() => useNotesBoard());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("nope");
  });

  it("records a fallback message when loading fails with a non-Error", async () => {
    mockApi.listCategories.mockRejectedValueOnce("plain string error");
    const { result } = renderHook(() => useNotesBoard());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to load notes.");
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

    await act(async () => { await result.current.saveNote(input, null); });
    expect(mockApi.createNote).toHaveBeenCalledWith(input);

    await act(async () => { await result.current.saveNote(input, 10); });
    expect(mockApi.updateNote).toHaveBeenCalledWith(10, input);
  });

  it("closeAndRefresh clears the editing target and triggers a reload", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.openNote(notes[0]));
    const callsBefore = mockApi.listNotes.mock.calls.length;

    await act(async () => { result.current.closeAndRefresh(); });

    expect(result.current.editing).toBeUndefined();
    await waitFor(() =>
      expect(mockApi.listNotes.mock.calls.length).toBeGreaterThan(callsBefore)
    );
  });

  it("deleteNote deletes via the API, closes and triggers a reload", async () => {
    const { result } = await renderLoaded();
    act(() => result.current.openNote(notes[0]));

    await act(async () => { await result.current.deleteNote(notes[0]); });

    expect(mockApi.deleteNote).toHaveBeenCalledWith(10);
    expect(result.current.editing).toBeUndefined();
  });
});

describe("useNotesBoard (unmount race)", () => {
  it("ignores a load that resolves after unmount", async () => {
    const { unmount } = renderHook(() => useNotesBoard());
    unmount();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  });
});
