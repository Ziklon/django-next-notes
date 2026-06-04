import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./auth";
import type { Category, Note, NoteInput, Paginated, Tag } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };

  let res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers.Authorization = `Bearer ${getAccessToken()}`;
      res = await fetch(`${API_URL}${path}`, { ...init, headers, cache: "no-store" });
    } else {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      /* response had no JSON body */
    }
    throw new Error(detail);
  }

  return (res.status === 204 ? undefined : await res.json()) as T;
}

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const { access } = await res.json();
    setTokens(access, refresh);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  listCategories: () =>
    request<Paginated<Category>>("/categories/").then((p) => p.results),

  listNotes: (categoryId?: number | null, search?: string, tag?: string | null) => {
    const params = new URLSearchParams();
    if (categoryId != null) params.set("category", String(categoryId));
    if (search) params.set("search", search);
    if (tag) params.set("tag", tag);
    const query = params.toString() ? `?${params}` : "";
    return request<Paginated<Note>>(`/notes/${query}`).then((p) => p.results);
  },

  createNote: (data: NoteInput) =>
    request<Note>("/notes/", { method: "POST", body: JSON.stringify(data) }),

  updateNote: (id: number, data: NoteInput) =>
    request<Note>(`/notes/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteNote: (id: number) =>
    request<void>(`/notes/${id}/`, { method: "DELETE" }),

  listTags: () =>
    request<Paginated<Tag>>("/tags/").then((p) => p.results),
};
