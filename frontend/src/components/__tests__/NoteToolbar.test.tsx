import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteToolbar from "@/components/NoteToolbar";
import type { Category } from "@/lib/types";

const categories: Category[] = [
  { id: 1, name: "School", color: "#F4CE7B", note_count: 0, created_at: "" },
];

function setup(overrides = {}) {
  const props = {
    categories,
    categoryId: 1,
    onChangeCategory: jest.fn(),
    mode: "write" as const,
    onToggleMode: jest.fn(),
    canDelete: true,
    onDelete: jest.fn(),
    onClose: jest.fn(),
    ...overrides,
  };
  render(<NoteToolbar {...props} />);
  return props;
}

describe("NoteToolbar", () => {
  it("labels the toggle 'Preview' in write mode and 'Edit' in preview mode", () => {
    const { unmount } = render(
      <NoteToolbar
        categories={categories}
        categoryId={1}
        onChangeCategory={() => {}}
        mode="write"
        onToggleMode={() => {}}
        canDelete={false}
        onDelete={() => {}}
        onClose={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
    unmount();
    render(
      <NoteToolbar
        categories={categories}
        categoryId={1}
        onChangeCategory={() => {}}
        mode="preview"
        onToggleMode={() => {}}
        canDelete={false}
        onDelete={() => {}}
        onClose={() => {}}
      />
    );
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
});
