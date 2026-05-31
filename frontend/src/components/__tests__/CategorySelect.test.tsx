import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategorySelect from "@/components/CategorySelect";
import type { Category } from "@/lib/types";

const categories: Category[] = [
  { id: 1, name: "School", color: "#F4CE7B", note_count: 0, created_at: "" },
  { id: 2, name: "Personal", color: "#9CB7AE", note_count: 0, created_at: "" },
];

describe("CategorySelect", () => {
  it("shows the selected category name", () => {
    render(<CategorySelect categories={categories} value={1} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "School" })).toBeInTheDocument();
  });

  it("shows 'No category' when value is null", () => {
    render(<CategorySelect categories={categories} value={null} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "No category" })).toBeInTheDocument();
  });

  it("opens and selects a category", async () => {
    const onChange = jest.fn();
    render(<CategorySelect categories={categories} value={1} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "School" }));
    const list = screen.getByRole("listbox");
    await userEvent.click(within(list).getByRole("button", { name: "Personal" }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("can choose the 'No category' option", async () => {
    const onChange = jest.fn();
    render(<CategorySelect categories={categories} value={1} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "School" }));
    const list = screen.getByRole("listbox");
    await userEvent.click(within(list).getByRole("button", { name: "No category" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("closes the popover when clicking outside", async () => {
    render(<CategorySelect categories={categories} value={1} onChange={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "School" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
