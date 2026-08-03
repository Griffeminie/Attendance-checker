import type { AttendanceRecord, DayStatus } from "./types";

// A "full" day is treated as >= 8 actual hours, "partial" is anything logged
// below that. Tweak FULL_DAY_HOURS if your policy differs.
const FULL_DAY_HOURS = 8;

export function recordsByDate(
  records: AttendanceRecord[]
): Map<string, AttendanceRecord> {
  const map = new Map<string, AttendanceRecord>();
  for (const r of records) map.set(r.date, r);
  return map;
}

export function statusForRecord(record: AttendanceRecord | undefined): DayStatus {
  if (!record) return "none";
  return record.actualHours >= FULL_DAY_HOURS ? "full" : "partial";
}

export function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function formatHours(hours: number): string {
  return `${hours.toFixed(2)}h`;
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// Returns a 6x7 grid of Date objects covering the full weeks that contain
// the given month, so the calendar table always renders complete rows.
export function buildCalendarGrid(year: number, monthIndexZeroBased: number): Date[] {
  const firstOfMonth = new Date(year, monthIndexZeroBased, 1);
  const startDay = firstOfMonth.getDay(); // 0 = Sunday
  const gridStart = new Date(year, monthIndexZeroBased, 1 - startDay);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
