const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export function setTokens(access: string, refresh: string): void {
  const sevenDays = 7 * 24 * 60 * 60;
  document.cookie = `${ACCESS_KEY}=${access}; path=/; max-age=${sevenDays}; SameSite=Strict`;
  document.cookie = `${REFRESH_KEY}=${refresh}; path=/; max-age=${sevenDays}; SameSite=Strict`;
}

export function getAccessToken(): string | null {
  return readCookie(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return readCookie(REFRESH_KEY);
}

export function clearTokens(): void {
  document.cookie = `${ACCESS_KEY}=; path=/; max-age=0`;
  document.cookie = `${REFRESH_KEY}=; path=/; max-age=0`;
}

function readCookie(name: string): string | null {
  /* istanbul ignore next — SSR guard, document is always defined in jsdom */
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
