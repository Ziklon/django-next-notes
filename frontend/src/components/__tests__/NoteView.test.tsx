import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteView from "@/components/NoteView";
import type { Category, Note } from "@/lib/types";
import { makeBoardState } from "@/test-utils";

jest.mock("@/contexts/BoardContext", () => ({
  useBoardContext: jest.fn(),
}));

import { useBoardContext } from "@/contexts/BoardContext";

const categories: Category[] = [
  { id: 1, name: "Random Thoughts", color: "#F0A875", note_count: 1, created_at: "" },
  { id: 2, name: "School", color: "#F4CE7B", note_count: 0, created_at: "" },
];

const note: Note = {
  id: 7,
  title: "Reflection",
  content: "Life has been a whirlwind.",
  category: 1,
  category_detail: categories[0],
  tags: [],
  created_at: "2024-07-21T20:35:00Z",
  updated_at: "2024-07-21T20:35:00Z",
};

function setup(editingNote: Note | null, overrides = {}) {
  const saveNote = jest.fn().mockResolvedValue(editingNote ?? note);
  const closeAndRefresh = jest.fn();
  const deleteNote = jest.fn().mockResolvedValue(undefined);
  (useBoardContext as jest.Mock).mockReturnValue(
    makeBoardState({ editing: editingNote, categories, saveNote, closeAndRefresh, deleteNote, ...overrides })
  );
  return { saveNote, closeAndRefresh, deleteNote };
}

describe("NoteView (existing note opens in preview)", () => {
  it("renders title, content and category in preview by default", () => {
    setup(note);
    render(<NoteView />);
    expect(screen.queryByLabelText("Note content")).not.toBeInTheDocument();
    expect(screen.getByText("Reflection")).toBeInTheDocument();
    expect(screen.getByText(/whirlwind/)).toBeInTheDocument();
    expect(screen.getByText("Random Thoughts")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("enters edit mode and autosaves on blur", async () => {
    const { saveNote } = setup(note);
    render(<NoteView />);
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    await userEvent.type(screen.getByLabelText("Note title"), "!");
    await userEvent.click(screen.getByLabelText("Note content")); // blur title
    await waitFor(() =>
      expect(saveNote).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Reflection!" }),
        7
      )
    );
  });

  it("saves and then closes when the close button is clicked", async () => {
    const { saveNote, closeAndRefresh } = setup(note);
    render(<NoteView />);
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    await userEvent.clear(screen.getByLabelText("Note content"));
    await userEvent.type(screen.getByLabelText("Note content"), "Updated body");
    await userEvent.click(screen.getByLabelText("Close"));
    await waitFor(() => expect(closeAndRefresh).toHaveBeenCalled());
    expect(saveNote).toHaveBeenCalledWith(
      expect.objectContaining({ content: "Updated body" }),
      7
    );
  });

  it("changes category through the dropdown and saves", async () => {
    const { saveNote } = setup({ ...note, category: 1 });
    render(<NoteView />);
    await userEvent.click(screen.getByRole("button", { expanded: false }));
    await userEvent.click(within(screen.getByRole("listbox")).getByRole("button", { name: "School" }));
    await waitFor(() =>
      expect(saveNote).toHaveBeenCalledWith(
        expect.objectContaining({ category: 2 }),
        7
      )
    );
  });

  it("toggles between preview and edit modes", async () => {
    setup({ ...note, content: "- Milk\n- Eggs" });
    render(<NoteView />);
    expect(screen.queryByLabelText("Note content")).not.toBeInTheDocument();
    expect(screen.getByText(/Milk/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText("Note content")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(screen.queryByLabelText("Note content")).not.toBeInTheDocument();
  });
});

describe("NoteView (create mode)", () => {
  it("opens a new note in write mode", () => {
    setup(null);
    render(<NoteView />);
    expect(screen.getByLabelText("Note content")).toBeInTheDocument();
  });

  it("does not save an empty-title note, but still closes", async () => {
    const { saveNote, closeAndRefresh } = setup(null);
    render(<NoteView />);
    await userEvent.click(screen.getByLabelText("Close"));
    await waitFor(() => expect(closeAndRefresh).toHaveBeenCalled());
    expect(saveNote).not.toHaveBeenCalled();
  });

  it("creates a note (id null) when a title is provided", async () => {
    const { saveNote } = setup(null);
    render(<NoteView />);
    await userEvent.type(screen.getByLabelText("Note title"), "Brand new");
    await userEvent.click(screen.getByLabelText("Close"));
    await waitFor(() =>
      expect(saveNote).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Brand new" }),
        null
      )
    );
  });
});

describe("NoteView (close + delete paths)", () => {
  it("closes on the Escape key", async () => {
    const { closeAndRefresh } = setup(note);
    render(<NoteView />);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(closeAndRefresh).toHaveBeenCalled());
  });

  it("calls deleteNote with the current note", async () => {
    const { deleteNote } = setup(note);
    render(<NoteView />);
    await userEvent.click(screen.getByLabelText("Delete note"));
    expect(deleteNote).toHaveBeenCalledWith(note);
  });
});
