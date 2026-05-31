import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "@/components/SearchBar";
import { makeBoardState } from "@/test-utils";

jest.mock("@/contexts/BoardContext", () => ({ useBoardContext: jest.fn() }));
import { useBoardContext } from "@/contexts/BoardContext";

beforeEach(() => {
  (useBoardContext as jest.Mock).mockReturnValue(makeBoardState());
});

describe("SearchBar", () => {
  it("renders the search input", () => {
    render(<SearchBar />);
    expect(screen.getByRole("searchbox", { name: /search notes/i })).toBeInTheDocument();
  });

  it("reflects an external searchQuery change", () => {
    (useBoardContext as jest.Mock).mockReturnValue(makeBoardState({ searchQuery: "hello" }));
    render(<SearchBar />);
    expect(screen.getByRole("searchbox")).toHaveValue("hello");
  });

  it("debounces setSearchQuery by 300 ms", async () => {
    jest.useFakeTimers();
    const setSearchQuery = jest.fn();
    (useBoardContext as jest.Mock).mockReturnValue(makeBoardState({ setSearchQuery }));
    render(<SearchBar />);
    await userEvent.type(screen.getByRole("searchbox"), "abc", { delay: null });
    expect(setSearchQuery).not.toHaveBeenCalledWith("abc");
    jest.advanceTimersByTime(500);
    expect(setSearchQuery).toHaveBeenCalledWith("abc");
    jest.useRealTimers();
  });
});
