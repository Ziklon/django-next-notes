"use client";

import { useRef, useState } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

/** Chip-based tag input. Press Enter or comma to add; Backspace on empty input removes the last tag. */
export default function TagInput({ tags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const name = raw.trim().toLowerCase();
    if (!name || tags.includes(name)) {
      setInputValue("");
      return;
    }
    onChange([...tags, name]);
    setInputValue("");
  }

  function removeTag(name: string) {
    onChange(tags.filter((t) => t !== name));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 rounded-lg px-2 py-1.5 hover:bg-[var(--surface)] cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-full bg-black/10 px-2 py-0.5 text-xs font-medium text-black/70"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove tag ${tag}`}
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="leading-none hover:text-red-500 transition-colors"
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (inputValue.trim()) addTag(inputValue); }}
        placeholder={tags.length === 0 ? "Add tags..." : ""}
        className="min-w-[80px] flex-1 bg-transparent text-xs text-black/70 placeholder-black/30 focus:outline-none"
      />
    </div>
  );
}
