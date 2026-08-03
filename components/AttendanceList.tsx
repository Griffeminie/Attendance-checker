"use client";

import type { AttendanceRecord } from "@/lib/types";
import { formatDateLong, formatHours, statusForRecord } from "@/lib/attendance";

const statusStyles: Record<string, string> = {
  full: "bg-green-100 text-green-700 border-green-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function AttendanceList({
  records,
  selectedDate,
  onSelectDate,
}: {
  records: AttendanceRecord[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}) {
  // Most recent first
  const sorted = [...records].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <aside className="flex h-full w-full flex-col bg-white">
      <div className="border-b border-slate-200 px-6 py-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Attendance Log
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">{records.length} entries</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="flex flex-col gap-2">
          {sorted.map((r) => {
            const status = statusForRecord(r);
            const isSelected = r.date === selectedDate;
            return (
              <li key={r.date}>
                <button
                  onClick={() => onSelectDate(r.date)}
                  className={`flex w-full flex-col gap-2 rounded-xl border px-4 py-4 text-left transition hover:bg-slate-50 ${
                    isSelected
                      ? "border-blue-200 bg-blue-50"
                      : "border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-800">
                      {formatDateLong(r.date)}
                    </span>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusStyles[status]}`}
                    >
                      {status === "full" ? "Full" : "Partial"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {r.timeIn} – {r.timeOut}
                    </span>
                    <span className="font-mono">{formatHours(r.actualHours)}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
