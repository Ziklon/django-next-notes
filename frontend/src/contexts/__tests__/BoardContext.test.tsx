import { renderHook } from "@testing-library/react";
import { useBoardContext } from "@/contexts/BoardContext";

describe("useBoardContext", () => {
  it("throws when used outside a BoardProvider", () => {
    // Suppress the React error boundary console output
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useBoardContext())).toThrow(
      "useBoardContext must be used inside <BoardProvider>"
    );
    (console.error as jest.Mock).mockRestore();
  });
});
