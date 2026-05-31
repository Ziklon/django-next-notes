import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BoardHeader from "@/components/BoardHeader";

const mockOpenNew = jest.fn();
const mockLogOut = jest.fn();
const mockPush = jest.fn();

jest.mock("@/contexts/BoardContext", () => ({
  useBoardContext: () => ({ openNew: mockOpenNew }),
}));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ logOut: mockLogOut }),
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("BoardHeader", () => {
  it("calls openNew when the New Note button is clicked", async () => {
    render(<BoardHeader />);
    await userEvent.click(screen.getByRole("button", { name: /new note/i }));
    expect(mockOpenNew).toHaveBeenCalled();
  });

  it("calls logOut and redirects to /login when Log out is clicked", async () => {
    render(<BoardHeader />);
    await userEvent.click(screen.getByRole("button", { name: /log out/i }));
    expect(mockLogOut).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
