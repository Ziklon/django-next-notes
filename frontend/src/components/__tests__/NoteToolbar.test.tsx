import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteToolbar from "@/components/NoteToolbar";
import type { Category } from "@/lib/types";

const categories: Category[] = [
  { id: 1, name: "School", color: "#F4CE7B", note_count: 0, created_at: "" },
];

const defaultProps = {
  categories,
  categoryId: 1,
  onChangeCategory: jest.fn(),
  tags: [] as string[],
  onChangeTags: jest.fn(),
  mode: "write" as const,
  onToggleMode: jest.fn(),
  canDelete: true,
  onDelete: jest.fn(),
  onClose: jest.fn(),
};

function setup(overrides = {}) {
  const props = { ...defaultProps, ...overrides };
  render(<NoteToolbar {...props} />);
  return props;
}

describe("NoteToolbar", () => {
  it("labels the toggle 'Preview' in write mode and 'Edit' in preview mode", () => {
    const { unmount } = render(<NoteToolbar {...defaultProps} mode="write" />);
    expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
    unmount();
    render(<NoteToolbar {...defaultProps} mode="preview" />);
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("hides the delete button when canDelete is false", () => {
    setup({ canDelete: false });
    expect(screen.queryByLabelText("Delete note")).not.toBeInTheDocument();
  });

  it("fires close and delete handlers", async () => {
    const props = setup();
    await userEvent.click(screen.getByLabelText("Delete note"));
    await userEvent.click(screen.getByLabelText("Close"));
    expect(props.onDelete).toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalled();
  });

  it("renders existing tags as chips", () => {
    setup({ tags: ["python", "work"] });
    expect(screen.getByText("python")).toBeInTheDocument();
    expect(screen.getByText("work")).toBeInTheDocument();
  });

  it("calls onChangeTags when a tag chip is removed", async () => {
    const onChangeTags = jest.fn();
    setup({ tags: ["python"], onChangeTags });
    await userEvent.click(screen.getByLabelText("Remove tag python"));
    expect(onChangeTags).toHaveBeenCalledWith([]);
  });
});
