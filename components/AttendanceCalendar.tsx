"use client";

import type { AttendanceRecord } from "@/lib/types";
import {
  buildCalendarGrid,
  formatHours,
  monthLabel,
  statusForRecord,
  toDateKey,
} from "@/lib/attendance";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const cellStatusStyles: Record<string, string> = {
  full: "bg-green-50 border-green-200",
  partial: "bg-amber-50 border-amber-200",
  none: "bg-white border-slate-100",
};

export default function AttendanceCalendar({
  year,
  monthIndex, // 0-based
  recordsByDate,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: {
  year: number;
  monthIndex: number;
  recordsByDate: Map<string, AttendanceRecord>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const grid = buildCalendarGrid(year, monthIndex);
  const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const todayKey = toDateKey(new Date());

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6">
        <button
          onClick={onPrevMonth}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          ← Prev
        </button>
        <h1 className="text-xl font-semibold text-slate-800">{monthLabel(key)}</h1>
        <button
          onClick={onNextMonth}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 bg-white px-6 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {WEEKDAYS.map((w) => (
          <div key={w} className="px-2 py-2 text-center">
            {w}
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 grid-rows-6 gap-2 px-6 pb-6 pt-2">
        {grid.map((d) => {
          const dateKey = toDateKey(d);
          const record = recordsByDate.get(dateKey);
          const status = statusForRecord(record);
          const inCurrentMonth = d.getMonth() === monthIndex;
          const isSelected = dateKey === selectedDate;
          const isToday = dateKey === todayKey;

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              className={`flex flex-col items-start justify-between rounded-xl border p-3 text-left transition hover:bg-blue-50 ${
                cellStatusStyles[status]
              } ${inCurrentMonth ? "" : "opacity-40"} ${
                isSelected ? "ring-2 ring-blue-500 ring-inset" : ""
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  isToday
                    ? "flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white"
                    : "text-slate-600"
                }`}
              >
                {d.getDate()}
              </span>
              {record && (
                <span className="mt-2 w-full truncate font-mono text-[11px] text-slate-500">
                  {formatHours(record.actualHours)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-6 border-t border-slate-200 px-8 py-4 text-xs text-slate-500">
        <LegendDot color="bg-green-200" label="Full day" />
        <LegendDot color="bg-amber-200" label="Partial day" />
        <LegendDot color="bg-white border border-slate-200" label="No record" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
