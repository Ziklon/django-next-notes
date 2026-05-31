"use client";

import Markdown from "./Markdown";

interface NotePreviewProps {
  title: string;
  content: string;
}

/** Preview mode: rendered title + markdown body. */
export default function NotePreview({ title, content }: NotePreviewProps) {
  return (
    <div className="text-black/90">
      <h1 className="font-serif-title mb-4 text-3xl font-bold leading-tight text-black lg:text-4xl">
        {title || "Untitled"}
      </h1>
      <Markdown className="text-base">{content}</Markdown>
    </div>
  );
}
