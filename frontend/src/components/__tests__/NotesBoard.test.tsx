import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotesBoard from "@/components/NotesBoard";
import type { Category, Note } from "@/lib/types";

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
jest.mock("@/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({ logOut: jest.fn(), isAuthenticated: true, isLoading: false }),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

import { api } from "@/lib/api";
import { useSearchParams } from "next/navigation";
const mockApi = api as jest.Mocked<typeof api>;
const mockUseSearchParams = useSearchParams as jest.Mock;

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
    tags: [],
    created_at: "2024-07-16T10:00:00Z",
    updated_at: "2024-07-16T10:00:00Z",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockApi.listCategories.mockResolvedValue(cats);
  mockApi.listTags.mockResolvedValue([]);
  mockApi.listNotes.mockResolvedValue(notes);
});

describe("NotesBoard", () => {
  it("renders the header, sidebar category and a note card", async () => {
    render(<NotesBoard />);
    expect(screen.getByRole("button", { name: /new note/i })).toBeInTheDocument();
    expect(await screen.findByText("Meeting")).toBeInTheDocument();
    expect(screen.getAllByText("School").length).toBeGreaterThan(0);
  });

  it("opens the create overlay on New Note click", async () => {
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

  it("renders the BoardSkeleton fallback while suspended", () => {
    mockUseSearchParams.mockImplementationOnce(() => {
      throw new Promise(() => {}); // triggers Suspense → BoardSkeleton
    });
    const { container } = render(<NotesBoard />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
