import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotesGrid from "@/components/NotesGrid";
import type { Note } from "@/lib/types";
import { makeBoardState } from "@/test-utils";

const notes: Note[] = [
  {
    id: 1,
    title: "Grocery List",
    content: "- Milk",
    category: null,
    category_detail: null,
    tags: [],
    created_at: "2024-07-16T10:00:00Z",
    updated_at: "2024-07-16T10:00:00Z",
  },
];

const mockOpenNote = jest.fn();

jest.mock("@/contexts/BoardContext", () => ({
  useBoardContext: jest.fn(),
}));

import { useBoardContext } from "@/contexts/BoardContext";

beforeEach(() => {
  jest.clearAllMocks();
  (useBoardContext as jest.Mock).mockReturnValue(
    makeBoardState({ notes: [], loading: false, error: null, openNote: mockOpenNote })
  );
});

describe("NotesGrid", () => {
  it("shows skeleton cards during initial load", () => {
    (useBoardContext as jest.Mock).mockReturnValue(
      makeBoardState({ notes: [], loading: true })
    );
    const { container } = render(<NotesGrid />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows the empty state when there are no notes", () => {
    render(<NotesGrid />);
    expect(screen.getByText(/no notes yet/i)).toBeInTheDocument();
  });

  it("renders an error message", () => {
    (useBoardContext as jest.Mock).mockReturnValue(
      makeBoardState({ error: "Boom" })
    );
    render(<NotesGrid />);
    expect(screen.getByRole("alert")).toHaveTextContent("Boom");
  });

  it("renders cards and calls openNote on click", async () => {
    (useBoardContext as jest.Mock).mockReturnValue(
      makeBoardState({ notes, loading: false, openNote: mockOpenNote })
    );
    render(<NotesGrid />);
    await userEvent.click(screen.getByText("Grocery List"));
    expect(mockOpenNote).toHaveBeenCalledWith(notes[0]);
  });
});
