import { render, screen } from "@testing-library/react";
import Markdown from "@/components/Markdown";

// NOTE: react-markdown is mocked in tests (it is ESM-only and its markdown ->
// HTML conversion is covered upstream and by the production build). These tests
// verify our wrapper: it wraps content in .md-body and passes the text through.
describe("Markdown", () => {
  it("wraps content in the .md-body container", () => {
    const { container } = render(<Markdown>{"hello"}</Markdown>);
    expect(container.querySelector(".md-body")).toBeInTheDocument();
  });

  it("passes the markdown source through to the renderer", () => {
    render(<Markdown>{"# Title\n\n- one\n- two"}</Markdown>);
    expect(screen.getByTestId("markdown")).toHaveTextContent("Title");
    expect(screen.getByTestId("markdown")).toHaveTextContent("one");
  });
});
