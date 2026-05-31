import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotesBoard from "@/components/NotesBoard";
import type { Category, Note } from "@/lib/types";

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
    created_at: "2024-07-16T10:00:00Z",
    updated_at: "2024-07-16T10:00:00Z",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockApi.listCategories.mockResolvedValue(cats);
  mockApi.listNotes.mockResolvedValue(notes);
});

describe("NotesBoard", () => {
  it("renders the header, sidebar category and a note card", async () => {
    render(<NotesBoard />);
    expect(
      screen.getByRole("button", { name: /new note/i })
    ).toBeInTheDocument();
    expect(await screen.findByText("Meeting")).toBeInTheDocument();
    // "School" appears in both the sidebar and the note card.
    expect(screen.getAllByText("School").length).toBeGreaterThan(0);
  });

  it("opens the create overlay (write mode) on New Note", async () => {
    render(<NotesBoard />);
    await screen.findByText("Meeting");
    await userEvent.click(screen.getByRole("button", { name: /new note/i }));
    expect(screen.getByLabelText("Note title")).toBeInTheDocument();
  });

  it("opens an existing note in preview mode when its card is clicked", async () => {
    render(<NotesBoard />);
    await userEvent.click(await screen.findByText("Meeting"));
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Note content")).not.toBeInTheDocument();
  });
});
