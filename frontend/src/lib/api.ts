import type { Category, Note, NoteInput, Paginated } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...init,
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      /* response had no JSON body */
    }
    throw new Error(detail);
  }

  // 204 No Content (e.g. DELETE) has no body to parse.
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const api = {
  listCategories: () =>
    request<Paginated<Category>>("/categories/").then((p) => p.results),

  listNotes: (categoryId?: number | null) => {
    const query =
      categoryId != null ? `?category=${categoryId}` : "";
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
};
