import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const fetchMock = jest.fn();
// @ts-expect-error – global fetch override for tests
global.fetch = fetchMock;

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

beforeEach(() => fetchMock.mockReset());

describe("AuthContext", () => {
  it("logOut sets isAuthenticated to false", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.logOut());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("signUp throws extracting the first array error value from the server", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ email: ["Email already taken."] }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(
      act(() => result.current.signUp("x@x.com", "pass12345"))
    ).rejects.toThrow("Email already taken.");
  });

  it("signUp throws extracting a plain string error value from the server", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ non_field_errors: "Generic error." }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(
      act(() => result.current.signUp("x@x.com", "pass12345"))
    ).rejects.toThrow("Generic error.");
  });

  it("signUp falls back to a generic message when the error body is unrecognised", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(
      act(() => result.current.signUp("x@x.com", "pass12345"))
    ).rejects.toThrow("Something went wrong. Please try again.");
  });

  it("logIn sets isAuthenticated to true on success", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access: "acc", refresh: "ref" }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(() => result.current.logIn("x@x.com", "pass12345"));
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("logIn throws the server error message on failure", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Invalid credentials." }),
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(
      act(() => result.current.logIn("x@x.com", "wrongpass"))
    ).rejects.toThrow("Invalid credentials.");
  });
});
