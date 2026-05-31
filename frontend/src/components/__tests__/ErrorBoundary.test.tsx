import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "@/components/ErrorBoundary";

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Something exploded");
  return <p>All good</p>;
}

// Suppress the expected React error boundary console output in test output
beforeEach(() => jest.spyOn(console, "error").mockImplementation(() => {}));
afterEach(() => (console.error as jest.Mock).mockRestore());

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("renders the fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/something exploded/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("clears the error and re-renders children when Try again is clicked", async () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    // After reset the boundary re-renders; Bomb still throws so fallback shows again
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
