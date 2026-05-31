import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BoardHeader from "@/components/BoardHeader";

describe("BoardHeader", () => {
  it("calls onNewNote when the button is clicked", async () => {
    const onNewNote = jest.fn();
    render(<BoardHeader onNewNote={onNewNote} />);
    await userEvent.click(screen.getByRole("button", { name: /new note/i }));
    expect(onNewNote).toHaveBeenCalled();
  });
});
