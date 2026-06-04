import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TagInput from "@/components/TagInput";

function setup(tags: string[] = [], onChange = jest.fn()) {
  render(<TagInput tags={tags} onChange={onChange} />);
  return { onChange, input: screen.getByRole("textbox") };
}

describe("TagInput", () => {
  it("shows placeholder when there are no tags", () => {
    setup();
    expect(screen.getByPlaceholderText("Add tags...")).toBeInTheDocument();
  });

  it("hides placeholder when tags are present", () => {
    setup(["python"]);
    expect(screen.queryByPlaceholderText("Add tags...")).not.toBeInTheDocument();
  });

  it("renders existing tags as chips", () => {
    setup(["python", "work"]);
    expect(screen.getByText("python")).toBeInTheDocument();
    expect(screen.getByText("work")).toBeInTheDocument();
  });

  it("adds a tag on Enter and clears the input", async () => {
    const onChange = jest.fn();
    const { input } = setup([], onChange);
    await userEvent.type(input, "react{Enter}");
    expect(onChange).toHaveBeenCalledWith(["react"]);
  });

  it("adds a tag on comma", async () => {
    const onChange = jest.fn();
    const { input } = setup([], onChange);
    await userEvent.type(input, "react,");
    expect(onChange).toHaveBeenCalledWith(["react"]);
  });

  it("normalises tag name to lowercase on add", async () => {
    const onChange = jest.fn();
    const { input } = setup([], onChange);
    await userEvent.type(input, "Python{Enter}");
    expect(onChange).toHaveBeenCalledWith(["python"]);
  });

  it("ignores a blank tag name", async () => {
    const onChange = jest.fn();
    const { input } = setup([], onChange);
    await userEvent.type(input, "   {Enter}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ignores a duplicate tag", async () => {
    const onChange = jest.fn();
    const { input } = setup(["python"], onChange);
    await userEvent.type(input, "python{Enter}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("removes a tag when the × button is clicked", async () => {
    const onChange = jest.fn();
    setup(["python", "work"], onChange);
    await userEvent.click(screen.getByLabelText("Remove tag python"));
    expect(onChange).toHaveBeenCalledWith(["work"]);
  });

  it("removes the last tag on Backspace when the input is empty", async () => {
    const onChange = jest.fn();
    const { input } = setup(["python", "work"], onChange);
    await userEvent.click(input);
    await userEvent.keyboard("{Backspace}");
    expect(onChange).toHaveBeenCalledWith(["python"]);
  });

  it("does not remove a tag on Backspace when the input has text", async () => {
    const onChange = jest.fn();
    const { input } = setup(["python"], onChange);
    await userEvent.type(input, "w");
    await userEvent.keyboard("{Backspace}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("adds a tag on blur when the input has text", async () => {
    const onChange = jest.fn();
    const { input } = setup([], onChange);
    await userEvent.type(input, "react");
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith(["react"]);
  });

  it("does not call onChange on blur when the input is empty", async () => {
    const onChange = jest.fn();
    const { input } = setup([], onChange);
    await userEvent.click(input);
    await userEvent.tab();
    expect(onChange).not.toHaveBeenCalled();
  });
});
