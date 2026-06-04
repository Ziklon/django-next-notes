export interface Category {
  id: number;
  name: string;
  color: string;
  note_count: number;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  note_count: number;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: number | null;
  category_detail: Category | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface NoteInput {
  title: string;
  content: string;
  category: number | null;
  tags: string[];
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
