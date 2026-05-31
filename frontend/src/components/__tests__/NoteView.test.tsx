import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteView from "@/components/NoteView";
import type { Category, Note } from "@/lib/types";

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
  created_at: "2024-07-21T20:35:00Z",
  updated_at: "2024-07-21T20:35:00Z",
};

describe("NoteView (existing note opens in preview)", () => {
  it("renders title, content and category in preview by default", () => {
    render(
      <NoteView note={note} categories={categories} onClose={() => {}} onSave={jest.fn()} />
    );
    // No editing textarea by default — it opens rendered.
    expect(screen.queryByLabelText("Note content")).not.toBeInTheDocument();
    expect(screen.getByText("Reflection")).toBeInTheDocument();
    expect(screen.getByText(/whirlwind/)).toBeInTheDocument();
    expect(screen.getByText("Random Thoughts")).toBeInTheDocument();
    // Toggle offers "Edit" since we're in preview.
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("enters edit mode and autosaves on blur", async () => {
    const onSave = jest.fn().mockResolvedValue({ ...note, title: "Reflection!" });
    render(
      <NoteView note={note} categories={categories} onClose={() => {}} onSave={onSave} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    await userEvent.type(screen.getByLabelText("Note title"), "!");
    await userEvent.click(screen.getByLabelText("Note content")); // blur title
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Reflection!" }),
        7
      )
    );
  });

  it("saves and then closes when the close button is clicked", async () => {
    const onSave = jest.fn().mockResolvedValue(note);
    const onClose = jest.fn();
    render(
      <NoteView note={note} categories={categories} onClose={onClose} onSave={onSave} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    await userEvent.clear(screen.getByLabelText("Note content"));
    await userEvent.type(screen.getByLabelText("Note content"), "Updated body");
    await userEvent.click(screen.getByLabelText("Close"));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ content: "Updated body" }),
      7
    );
  });

  it("changes category through the dropdown and saves", async () => {
    const onSave = jest.fn().mockResolvedValue({ ...note, category: 2 });
    render(
      <NoteView note={note} categories={categories} onClose={() => {}} onSave={onSave} />
    );
    await userEvent.click(screen.getByRole("button", { expanded: false }));
    await userEvent.click(screen.getByRole("button", { name: "School" }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ category: 2 }),
        7
      )
    );
  });

  it("toggles between preview and edit", async () => {
    render(
      <NoteView
        note={{ ...note, content: "- Milk\n- Eggs" }}
        categories={categories}
        onClose={() => {}}
        onSave={jest.fn()}
      />
    );
    // preview by default
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
    render(
      <NoteView note={null} categories={categories} onClose={() => {}} onSave={jest.fn()} />
    );
    expect(screen.getByLabelText("Note content")).toBeInTheDocument();
  });

  it("does not save an empty-title note, but still closes", async () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    render(
      <NoteView note={null} categories={categories} onClose={onClose} onSave={onSave} />
    );
    await userEvent.click(screen.getByLabelText("Close"));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSave).not.toHaveBeenCalled();
  });

  it("creates a note (id null) when a title is provided", async () => {
    const onSave = jest
      .fn()
      .mockResolvedValue({ ...note, id: 99, title: "Brand new" });
    render(
      <NoteView note={null} categories={categories} onClose={() => {}} onSave={onSave} />
    );
    await userEvent.type(screen.getByLabelText("Note title"), "Brand new");
    await userEvent.click(screen.getByLabelText("Close"));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Brand new" }),
        null
      )
    );
  });
});

describe("NoteView (close + delete paths)", () => {
  it("closes on the Escape key", async () => {
    const onClose = jest.fn();
    render(
      <NoteView
        note={note}
        categories={categories}
        onClose={onClose}
        onSave={jest.fn().mockResolvedValue(note)}
      />
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("calls onDelete with the current note", async () => {
    const onDelete = jest.fn().mockResolvedValue(undefined);
    render(
      <NoteView
        note={note}
        categories={categories}
        onClose={() => {}}
        onSave={jest.fn()}
        onDelete={onDelete}
      />
    );
    await userEvent.click(screen.getByLabelText("Delete note"));
    expect(onDelete).toHaveBeenCalledWith(note);
  });
});
