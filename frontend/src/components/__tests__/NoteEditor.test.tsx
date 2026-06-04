import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteEditor from "@/components/NoteEditor";

function setup(overrides = {}) {
  const props = {
    title: "My Note",
    content: "Some content",
    error: null,
    onTitleChange: jest.fn(),
    onContentChange: jest.fn(),
    onBlur: jest.fn(),
    ...overrides,
  };
  render(<NoteEditor {...props} />);
  return props;
}

describe("NoteEditor", () => {
  it("renders title and content textareas", () => {
    setup();
    expect(screen.getByLabelText("Note title")).toBeInTheDocument();
    expect(screen.getByLabelText("Note content")).toBeInTheDocument();
  });

  it("calls onTitleChange when title is edited", async () => {
    const onTitleChange = jest.fn();
    setup({ title: "", onTitleChange });
    await userEvent.type(screen.getByLabelText("Note title"), "H");
    expect(onTitleChange).toHaveBeenCalled();
  });

  it("calls onContentChange when content is edited", async () => {
    const onContentChange = jest.fn();
    setup({ content: "", onContentChange });
    await userEvent.type(screen.getByLabelText("Note content"), "x");
    expect(onContentChange).toHaveBeenCalled();
  });

  it("pressing Enter in the title moves focus to content instead of inserting a newline", async () => {
    const onTitleChange = jest.fn();
    setup({ onTitleChange });
    const title = screen.getByLabelText("Note title");
    const content = screen.getByLabelText("Note content");
    await userEvent.click(title);
    await userEvent.keyboard("{Enter}");
    expect(document.activeElement).toBe(content);
    expect(onTitleChange).not.toHaveBeenCalledWith(expect.stringContaining("\n"));
  });

  it("shows the error message when error is set", () => {
    setup({ error: "Title is required." });
    expect(screen.getByRole("alert")).toHaveTextContent("Title is required.");
  });

  it("calls onBlur when the title loses focus", async () => {
    const onBlur = jest.fn();
    setup({ onBlur });
    await userEvent.click(screen.getByLabelText("Note title"));
    await userEvent.tab();
    expect(onBlur).toHaveBeenCalled();
  });
});
