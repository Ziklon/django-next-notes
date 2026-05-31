import { renderHook, act, waitFor } from "@testing-library/react";
import { useNoteEditor } from "@/hooks/useNoteEditor";
import type { Category, Note } from "@/lib/types";

const categories: Category[] = [
  { id: 1, name: "Random Thoughts", color: "#F0A875", note_count: 0, created_at: "" },
  { id: 2, name: "School", color: "#F4CE7B", note_count: 0, created_at: "" },
];

const note: Note = {
  id: 7,
  title: "Reflection",
  content: "body",
  category: 1,
  category_detail: categories[0],
  created_at: "",
  updated_at: "2024-07-21T20:35:00Z",
};

describe("useNoteEditor", () => {
  it("opens existing notes in preview and new notes in write mode", () => {
    const { result: existing } = renderHook(() =>
      useNoteEditor(note, categories, jest.fn())
    );
    expect(existing.current.mode).toBe("preview");

    const { result: created } = renderHook(() =>
      useNoteEditor(null, categories, jest.fn())
    );
    expect(created.current.mode).toBe("write");
  });

  it("derives the card colour from the selected category", () => {
    const { result } = renderHook(() => useNoteEditor(note, categories, jest.fn()));
    expect(result.current.color).toBe("#F0A875");
  });

  it("does not save a new note with an empty title", async () => {
    const onSave = jest.fn();
    const { result } = renderHook(() => useNoteEditor(null, categories, onSave));
    await act(async () => {
      await result.current.persist();
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  it("creates a note (id null) once a title is set", async () => {
    const onSave = jest.fn().mockResolvedValue({ ...note, id: 99, title: "Hi" });
    const { result } = renderHook(() => useNoteEditor(null, categories, onSave));
    act(() => result.current.setTitle("Hi"));
    await act(async () => {
      await result.current.persist();
    });
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Hi" }),
      null
    );
  });

  it("skips a no-op save when nothing changed", async () => {
    const onSave = jest.fn().mockResolvedValue(note);
    const { result } = renderHook(() => useNoteEditor(note, categories, onSave));
    await act(async () => {
      await result.current.persist();
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  it("saves with the new category id when category changes", async () => {
    const onSave = jest.fn().mockResolvedValue({ ...note, category: 2 });
    const { result } = renderHook(() => useNoteEditor(note, categories, onSave));
    act(() => result.current.changeCategory(2));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ category: 2 }),
        7
      )
    );
  });

  it("toggleMode switches preview <-> write", async () => {
    const { result } = renderHook(() =>
      useNoteEditor(note, categories, jest.fn().mockResolvedValue(note))
    );
    expect(result.current.mode).toBe("preview");
    await act(async () => {
      await result.current.toggleMode();
    });
    expect(result.current.mode).toBe("write");
  });

  it("surfaces an error if saving fails", async () => {
    const onSave = jest.fn().mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useNoteEditor(note, categories, onSave));
    act(() => result.current.setContent("changed"));
    await act(async () => {
      await result.current.persist();
    });
    expect(result.current.error).toBe("boom");
  });
});

describe("useNoteEditor (edge branches)", () => {
  it("flags a required title when clearing an existing note", async () => {
    const onSave = jest.fn();
    const { result } = renderHook(() => useNoteEditor(note, categories, onSave));
    act(() => result.current.setTitle("   "));
    await act(async () => {
      await result.current.persist();
    });
    expect(onSave).not.toHaveBeenCalled();
    expect(result.current.error).toBe("Title is required.");
  });

  it("toggleMode write -> preview persists then switches", async () => {
    const onSave = jest.fn().mockResolvedValue({ ...note, id: 99, title: "X" });
    const { result } = renderHook(() => useNoteEditor(null, categories, onSave));
    expect(result.current.mode).toBe("write");
    act(() => result.current.setTitle("X"));
    await act(async () => {
      await result.current.toggleMode();
    });
    expect(result.current.mode).toBe("preview");
    expect(onSave).toHaveBeenCalled();
  });

  it("falls back to the default colour when the category is missing", () => {
    const { result } = renderHook(() =>
      useNoteEditor({ ...note, category: 999 }, categories, jest.fn())
    );
    expect(result.current.color).toBe("#F0A875");
  });

  it("uses a generic message when the save error is not an Error", async () => {
    const onSave = jest.fn().mockRejectedValue("plain string");
    const { result } = renderHook(() => useNoteEditor(note, categories, onSave));
    act(() => result.current.setContent("changed"));
    await act(async () => {
      await result.current.persist();
    });
    expect(result.current.error).toBe("Failed to save.");
  });
});
