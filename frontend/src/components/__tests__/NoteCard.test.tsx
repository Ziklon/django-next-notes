import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteCard from "@/components/NoteCard";
import type { Note } from "@/lib/types";

const note: Note = {
  id: 1,
  title: "Grocery List",
  content: "- Milk\n- Eggs",
  category: 2,
  category_detail: {
    id: 2,
    name: "Random Thoughts",
    color: "#F0A875",
    note_count: 3,
    created_at: "2026-01-01T00:00:00Z",
  },
  tags: [],
  created_at: "2026-07-16T10:00:00Z",
  updated_at: "2026-07-16T10:00:00Z",
};

describe("NoteCard", () => {
  it("renders the title, category and content", () => {
    render(<NoteCard note={note} onClick={() => {}} />);
    expect(screen.getByText("Grocery List")).toBeInTheDocument();
    expect(screen.getByText("Random Thoughts")).toBeInTheDocument();
    expect(screen.getByText(/Milk/)).toBeInTheDocument();
  });

  it("uses the category colour as its background", () => {
    render(<NoteCard note={note} onClick={() => {}} />);
    const card = screen.getByRole("button");
    expect(card).toHaveStyle({ backgroundColor: "#F0A875" });
  });

  it("calls onClick with the note when clicked", async () => {
    const onClick = jest.fn();
    render(<NoteCard note={note} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith(note);
  });

  it("renders tag chips when tags are present", () => {
    render(<NoteCard note={{ ...note, tags: ["python", "work"] }} onClick={() => {}} />);
    expect(screen.getByText("python")).toBeInTheDocument();
    expect(screen.getByText("work")).toBeInTheDocument();
  });

  it("renders no tag chips when tags are empty", () => {
    const { container } = render(<NoteCard note={note} onClick={() => {}} />);
    expect(container.querySelectorAll(".rounded-full").length).toBe(0);
  });
});
