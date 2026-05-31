/**
 * Format a timestamp the way the board shows it:
 *  - same day  -> "today"
 *  - yesterday -> "yesterday"
 *  - otherwise -> "July 16"
 */
export function formatNoteDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((startOf(now) - startOf(date)) / dayMs);

  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";

  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

/**
 * Long "Last Edited" label used in the single-note view,
 * e.g. "July 21, 2024 at 8:35pm".
 */
export function formatLastEdited(iso: string): string {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const meridiem = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${datePart} at ${hours}:${minutes}${meridiem}`;
}
