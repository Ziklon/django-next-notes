"use client";

import { useEffect, useRef } from "react";

interface NoteEditorProps {
  title: string;
  content: string;
  error: string | null;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onBlur: () => void;
}

/** Write mode: editable title + content textareas (raw markdown source). */
export default function NoteEditor({
  title,
  content,
  error,
  onTitleChange,
  onContentChange,
  onBlur,
}: NoteEditorProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the title textarea to fit its content.
  useEffect(() => {
    const el = titleRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [title]);

  return (
    <>
      <textarea
        ref={titleRef}
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        onBlur={onBlur}
        rows={1}
        aria-label="Note title"
        placeholder="Note title"
        className="font-serif-title w-full resize-none border-none bg-transparent text-3xl font-bold leading-tight text-black placeholder-black/30 focus:outline-none lg:text-4xl"
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        onBlur={onBlur}
        aria-label="Note content"
        placeholder="Write your note... (markdown supported)"
        className="mt-4 w-full flex-1 resize-none border-none bg-transparent text-base leading-relaxed text-black/90 placeholder-black/30 focus:outline-none"
      />
    </>
  );
}
