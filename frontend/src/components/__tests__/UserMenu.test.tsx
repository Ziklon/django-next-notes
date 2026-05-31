import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserMenu from "@/components/UserMenu";

const mockPush = jest.fn();
const mockLogOut = jest.fn();
const mockToggle = jest.fn();

jest.mock("@/contexts/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock("@/hooks/useTheme", () => ({ useTheme: jest.fn() }));

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";

beforeEach(() => {
  jest.clearAllMocks();
  (useAuth as jest.Mock).mockReturnValue({ logOut: mockLogOut });
  (useTheme as jest.Mock).mockReturnValue({ isDark: false, toggle: mockToggle });
});

describe("UserMenu", () => {
  it("is closed by default", () => {
    render(<UserMenu />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens the menu when the avatar button is clicked", async () => {
    render(<UserMenu />);
    await userEvent.click(screen.getByRole("button", { name: /open user menu/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("closes when clicking outside", async () => {
    render(<UserMenu />);
    await userEvent.click(screen.getByRole("button", { name: /open user menu/i }));
    await userEvent.click(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("calls toggle when the dark mode item is clicked", async () => {
    render(<UserMenu />);
    await userEvent.click(screen.getByRole("button", { name: /open user menu/i }));
    await userEvent.click(screen.getByRole("menuitem", { name: /dark mode/i }));
    expect(mockToggle).toHaveBeenCalled();
  });

  it("shows Light mode label when isDark is true", async () => {
    (useTheme as jest.Mock).mockReturnValue({ isDark: true, toggle: mockToggle });
    render(<UserMenu />);
    await userEvent.click(screen.getByRole("button", { name: /open user menu/i }));
    expect(screen.getByRole("menuitem", { name: /light mode/i })).toBeInTheDocument();
  });

  it("calls logOut and redirects to /login", async () => {
    render(<UserMenu />);
    await userEvent.click(screen.getByRole("button", { name: /open user menu/i }));
    await userEvent.click(screen.getByRole("menuitem", { name: /log out/i }));
    expect(mockLogOut).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
