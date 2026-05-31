import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotesGrid from "@/components/NotesGrid";
import type { Note } from "@/lib/types";

const notes: Note[] = [
  {
    id: 1,
    title: "Grocery List",
    content: "- Milk",
    category: null,
    category_detail: null,
    created_at: "2024-07-16T10:00:00Z",
    updated_at: "2024-07-16T10:00:00Z",
  },
];

describe("NotesGrid", () => {
  it("shows the loading message only when empty", () => {
    render(<NotesGrid notes={[]} loading error={null} onOpen={() => {}} />);
    expect(screen.getByText("Loading notes...")).toBeInTheDocument();
  });

  it("shows the empty state when there are no notes", () => {
    render(<NotesGrid notes={[]} loading={false} error={null} onOpen={() => {}} />);
    expect(screen.getByText(/No notes yet/)).toBeInTheDocument();
  });

  it("renders an error message", () => {
    render(<NotesGrid notes={[]} loading={false} error="Boom" onOpen={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Boom");
  });

  it("renders cards and opens one on click", async () => {
    const onOpen = jest.fn();
    render(<NotesGrid notes={notes} loading={false} error={null} onOpen={onOpen} />);
    await userEvent.click(screen.getByText("Grocery List"));
    expect(onOpen).toHaveBeenCalledWith(notes[0]);
  });
});
