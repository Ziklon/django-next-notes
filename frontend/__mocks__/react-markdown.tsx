// Jest mock: react-markdown is ESM-only and its rendering is covered upstream
// + by the production build. In unit tests we render children as-is so we can
// assert our own integration (content passthrough, preview toggle).
import React from "react";

export default function ReactMarkdown({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <div data-testid="markdown">{children}</div>;
}
