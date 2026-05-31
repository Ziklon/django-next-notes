import { formatNoteDate } from "@/lib/date";

describe("formatNoteDate", () => {
  const now = new Date("2026-07-16T12:00:00Z");

  it("returns 'today' for the same day", () => {
    expect(formatNoteDate("2026-07-16T08:00:00Z", now)).toBe("today");
  });

  it("returns 'yesterday' for the previous day", () => {
    expect(formatNoteDate("2026-07-15T23:00:00Z", now)).toBe("yesterday");
  });

  it("returns a 'Month Day' label for older dates", () => {
    expect(formatNoteDate("2026-07-10T10:00:00Z", now)).toBe("July 10");
  });
});

import { formatLastEdited } from "@/lib/date";

describe("formatLastEdited", () => {
  it("formats a timestamp as 'Month D, YYYY at h:mmam/pm'", () => {
    // Build a local-time date to avoid timezone flakiness.
    const d = new Date(2024, 6, 21, 20, 35); // July 21, 2024, 8:35pm local
    expect(formatLastEdited(d.toISOString())).toBe("July 21, 2024 at 8:35pm");
  });

  it("uses 12-hour clock with am for morning", () => {
    const d = new Date(2024, 0, 5, 9, 5); // Jan 5, 2024, 9:05am
    expect(formatLastEdited(d.toISOString())).toBe("January 5, 2024 at 9:05am");
  });
});

describe("formatNoteDate (default now)", () => {
  it("returns 'today' for the current time without an explicit now", () => {
    expect(formatNoteDate(new Date().toISOString())).toBe("today");
  });
});

describe("formatLastEdited (12-hour edge cases)", () => {
  it("shows 12pm at noon", () => {
    const d = new Date(2024, 0, 1, 12, 0); // Jan 1, 2024, 12:00 noon
    expect(formatLastEdited(d.toISOString())).toBe("January 1, 2024 at 12:00pm");
  });

  it("shows 12am at midnight", () => {
    const d = new Date(2024, 0, 1, 0, 15); // Jan 1, 2024, 00:15 (midnight hour)
    expect(formatLastEdited(d.toISOString())).toBe("January 1, 2024 at 12:15am");
  });
});
