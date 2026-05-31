"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] p-8 text-center">
          <p className="text-4xl">😿</p>
          <h2 className="font-serif-title text-xl font-bold text-[var(--foreground)]">
            Something went wrong
          </h2>
          <p className="max-w-sm text-sm text-[var(--muted)]">
            {this.state.error.message}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-2 rounded-full border border-[var(--accent)] px-5 py-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-white"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
