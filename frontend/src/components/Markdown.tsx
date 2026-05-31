"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkEmoji from "remark-emoji";

interface MarkdownProps {
  children: string;
  className?: string;
}

/**
 * Renders note content as GitHub-flavored markdown (lists, bold, headings,
 * links, code, etc.). Styling lives in the `.md-body` class in globals.css.
 */
export default function Markdown({ children, className = "" }: MarkdownProps) {
  return (
    <div className={`md-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkEmoji]}
        components={{
          // Open links safely in a new tab.
          /* istanbul ignore next -- rendered by react-markdown, which is mocked in unit tests */
          a: ({ ...props }) => (
            <a target="_blank" rel="noopener noreferrer" {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
