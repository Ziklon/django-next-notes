import { render, screen } from "@testing-library/react";
import NotePreview from "@/components/NotePreview";

describe("NotePreview", () => {
  it("renders the title and content", () => {
    render(<NotePreview title="My title" content="some body" />);
    expect(screen.getByRole("heading", { name: "My title" })).toBeInTheDocument();
    expect(screen.getByText(/some body/)).toBeInTheDocument();
  });

  it("falls back to 'Untitled' when the title is empty", () => {
    render(<NotePreview title="" content="x" />);
    expect(screen.getByRole("heading", { name: "Untitled" })).toBeInTheDocument();
  });
});
