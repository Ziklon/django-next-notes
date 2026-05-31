import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sidebar from "@/components/Sidebar";
import type { Category } from "@/lib/types";

const categories: Category[] = [
  { id: 1, name: "Random Thoughts", color: "#F0A875", note_count: 3, created_at: "" },
  { id: 2, name: "School", color: "#F4CE7B", note_count: 3, created_at: "" },
  { id: 3, name: "Personal", color: "#9CB7AE", note_count: 1, created_at: "" },
];

describe("Sidebar", () => {
  it("lists categories with their note counts", () => {
    render(
      <Sidebar categories={categories} selectedCategoryId={null} onSelect={() => {}} />
    );
    expect(screen.getByText("All Categories")).toBeInTheDocument();
    expect(screen.getByText("School")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("selects a category on click", async () => {
    const onSelect = jest.fn();
    render(
      <Sidebar categories={categories} selectedCategoryId={null} onSelect={onSelect} />
    );
    await userEvent.click(screen.getByText("School"));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it("deselects when the active category is clicked again", async () => {
    const onSelect = jest.fn();
    render(
      <Sidebar categories={categories} selectedCategoryId={2} onSelect={onSelect} />
    );
    await userEvent.click(screen.getByText("School"));
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
