/**
 * Integration test for the Login page.
 * Mocks the network layer (fetch) and Next.js router; lets the real
 * AuthContext and form logic run end-to-end.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/(auth)/login/page";
import { AuthProvider } from "@/contexts/AuthContext";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
}));

const fetchMock = jest.fn();
// @ts-expect-error – assigning mock to global fetch
global.fetch = fetchMock;

function renderLogin() {
  return render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}

beforeEach(() => {
  fetchMock.mockReset();
  mockReplace.mockReset();
});

describe("Login page", () => {
  it("renders email, password fields and a submit button", () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("shows a link to the signup page", () => {
    renderLogin();
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
      "href",
      "/signup"
    );
  });

  it("calls the login endpoint and redirects on success", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ access: "access-token", refresh: "refresh-token" }),
    });

    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(/email address/i), "user@example.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/auth/login/"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "user@example.com", password: "secret123" }),
        })
      );
    });
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/"));
  });

  it("shows an error message on invalid credentials", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Invalid email or password." }),
    });

    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(/email address/i), "user@example.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("disables the button while submitting", async () => {
    fetchMock.mockImplementation(() => new Promise(() => {})); // never resolves
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(/email address/i), "u@example.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "pass1234");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();
  });
});
