import { setTokens, getAccessToken, getRefreshToken, clearTokens } from "@/lib/auth";

beforeEach(() => {
  // Clear all cookies before each test
  document.cookie.split(";").forEach((c) => {
    document.cookie = c.trim().split("=")[0] + "=; max-age=0; path=/";
  });
});

describe("auth token storage", () => {
  it("setTokens stores access and refresh tokens in cookies", () => {
    setTokens("acc123", "ref456");
    expect(getAccessToken()).toBe("acc123");
    expect(getRefreshToken()).toBe("ref456");
  });

  it("getAccessToken returns null when no cookie is set", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("getRefreshToken returns null when no cookie is set", () => {
    expect(getRefreshToken()).toBeNull();
  });

  it("clearTokens removes both cookies", () => {
    setTokens("a", "b");
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});
