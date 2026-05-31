/**
 * Integration test for the Sign Up page.
 * Mocks fetch and the Next.js router; the real AuthContext runs end-to-end.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUpPage from "@/app/(auth)/signup/page";
import { AuthProvider } from "@/contexts/AuthContext";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
}));

const fetchMock = jest.fn();
// @ts-expect-error – assigning mock to global fetch
global.fetch = fetchMock;

function renderSignUp() {
  return render(
    <AuthProvider>
      <SignUpPage />
    </AuthProvider>
  );
}

beforeEach(() => {
  fetchMock.mockReset();
  mockReplace.mockReset();
});

describe("Sign Up page", () => {
  it("renders email, password fields and a submit button", () => {
    renderSignUp();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("shows a link to the login page", () => {
    renderSignUp();
    expect(screen.getByRole("link", { name: /already friends/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("calls the register endpoint and redirects on success", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ access: "access-token", refresh: "refresh-token" }),
    });

    renderSignUp();
    await userEvent.type(screen.getByPlaceholderText(/email address/i), "new@example.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/auth/register/"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "new@example.com", password: "secret123" }),
        })
      );
    });
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/"));
  });

  it("shows an error message when email is already taken", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ email: ["An account with this email already exists."] }),
    });

    renderSignUp();
    await userEvent.type(screen.getByPlaceholderText(/email address/i), "taken@example.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "pass1234");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("disables the button while submitting", async () => {
    fetchMock.mockImplementation(() => new Promise(() => {})); // never resolves
    renderSignUp();
    await userEvent.type(screen.getByPlaceholderText(/email address/i), "u@example.com");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "pass1234");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(screen.getByRole("button", { name: /signing up/i })).toBeDisabled();
  });

  it("toggles password visibility", async () => {
    renderSignUp();
    const input = screen.getByPlaceholderText(/password/i);
    expect(input).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByLabelText(/show password/i));
    expect(input).toHaveAttribute("type", "text");
    await userEvent.click(screen.getByLabelText(/hide password/i));
    expect(input).toHaveAttribute("type", "password");
  });
});
