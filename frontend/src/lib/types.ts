export interface Category {
  id: number;
  name: string;
  color: string;
  note_count: number;
  created_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: number | null;
  category_detail: Category | null;
  created_at: string;
  updated_at: string;
}

export interface NoteInput {
  title: string;
  content: string;
  category: number | null;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
