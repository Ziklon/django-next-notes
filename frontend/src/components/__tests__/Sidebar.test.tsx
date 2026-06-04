import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sidebar from "@/components/Sidebar";
import type { Category, Tag } from "@/lib/types";
import { makeBoardState } from "@/test-utils";

const categories: Category[] = [
  { id: 1, name: "Random Thoughts", color: "#F0A875", note_count: 3, created_at: "" },
  { id: 2, name: "School", color: "#F4CE7B", note_count: 3, created_at: "" },
  { id: 3, name: "Personal", color: "#9CB7AE", note_count: 1, created_at: "" },
];

const tags: Tag[] = [
  { id: 1, name: "python", note_count: 2 },
  { id: 2, name: "work", note_count: 1 },
];

const mockSetSelected = jest.fn();
const mockSetSelectedTag = jest.fn();

jest.mock("@/contexts/BoardContext", () => ({
  useBoardContext: jest.fn(),
}));

import { useBoardContext } from "@/contexts/BoardContext";

beforeEach(() => {
  jest.clearAllMocks();
  (useBoardContext as jest.Mock).mockReturnValue(
    makeBoardState({
      categories,
      selectedCategoryId: null,
      setSelectedCategoryId: mockSetSelected,
      tags,
      selectedTag: null,
      setSelectedTag: mockSetSelectedTag,
    })
  );
});

describe("Sidebar", () => {
  it("lists categories with their note counts", () => {
    render(<Sidebar />);
    expect(screen.getByText("All Categories")).toBeInTheDocument();
    expect(screen.getByText("School")).toBeInTheDocument();
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
  });

  it("shows skeleton items while loading with no categories", () => {
    (useBoardContext as jest.Mock).mockReturnValue(
      makeBoardState({ categories: [], loading: true })
    );
    const { container } = render(<Sidebar />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("selects a category on click", async () => {
    render(<Sidebar />);
    await userEvent.click(screen.getByText("School"));
    expect(mockSetSelected).toHaveBeenCalledWith(2);
  });

  it("deselects when the active category is clicked again", async () => {
    (useBoardContext as jest.Mock).mockReturnValue(
      makeBoardState({ categories, selectedCategoryId: 2, setSelectedCategoryId: mockSetSelected, tags, setSelectedTag: mockSetSelectedTag })
    );
    render(<Sidebar />);
    await userEvent.click(screen.getByText("School"));
    expect(mockSetSelected).toHaveBeenCalledWith(null);
  });

  it("renders tags section with note counts", () => {
    render(<Sidebar />);
    expect(screen.getByText("Tags")).toBeInTheDocument();
    expect(screen.getByText("python")).toBeInTheDocument();
    expect(screen.getByText("work")).toBeInTheDocument();
  });

  it("selects a tag on click", async () => {
    render(<Sidebar />);
    await userEvent.click(screen.getByText("python"));
    expect(mockSetSelectedTag).toHaveBeenCalledWith("python");
  });

  it("deselects when the active tag is clicked again", async () => {
    (useBoardContext as jest.Mock).mockReturnValue(
      makeBoardState({ categories, tags, selectedTag: "python", setSelectedTag: mockSetSelectedTag, setSelectedCategoryId: mockSetSelected })
    );
    render(<Sidebar />);
    await userEvent.click(screen.getByText("python"));
    expect(mockSetSelectedTag).toHaveBeenCalledWith(null);
  });
});
