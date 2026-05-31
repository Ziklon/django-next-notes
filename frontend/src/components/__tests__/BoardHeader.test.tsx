import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BoardHeader from "@/components/BoardHeader";
import { makeBoardState } from "@/test-utils";

const mockPush = jest.fn();
const mockLogOut = jest.fn();

jest.mock("@/contexts/BoardContext", () => ({ useBoardContext: jest.fn() }));
jest.mock("@/contexts/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

import { useBoardContext } from "@/contexts/BoardContext";
import { useAuth } from "@/contexts/AuthContext";

beforeEach(() => {
  jest.clearAllMocks();
  (useBoardContext as jest.Mock).mockReturnValue(makeBoardState());
  (useAuth as jest.Mock).mockReturnValue({ logOut: mockLogOut });
});

describe("BoardHeader", () => {
  it("calls openNew when the New Note button is clicked", async () => {
    const openNew = jest.fn();
    (useBoardContext as jest.Mock).mockReturnValue(makeBoardState({ openNew }));
    render(<BoardHeader />);
    await userEvent.click(screen.getByRole("button", { name: /new note/i }));
    expect(openNew).toHaveBeenCalled();
  });

  it("calls logOut and redirects to /login when Log out is clicked", async () => {
    render(<BoardHeader />);
    await userEvent.click(screen.getByRole("button", { name: /log out/i }));
    expect(mockLogOut).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("calls setSearchQuery after the debounce delay when typing", async () => {
    jest.useFakeTimers();
    const setSearchQuery = jest.fn();
    (useBoardContext as jest.Mock).mockReturnValue(makeBoardState({ setSearchQuery }));
    render(<BoardHeader />);
    await userEvent.type(screen.getByRole("searchbox"), "hi", { delay: null });
    jest.advanceTimersByTime(300);
    expect(setSearchQuery).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
