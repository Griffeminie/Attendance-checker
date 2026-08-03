"use client";

import type { AttendanceData } from "@/lib/types";

export default function SummaryBar({ data }: { data: AttendanceData }) {
  const { summary } = data;
  const pct = Math.min(
    100,
    Math.round((summary.totalActualHours / summary.requiredHours) * 100)
  );

  return (
    <div className="flex items-center gap-6 border-b border-slate-200 bg-white px-6 py-3">
      <div>
        <p className="text-xs text-slate-400">Logged</p>
        <p className="text-sm font-semibold text-slate-800">
          {summary.totalActualHours.toFixed(2)}h
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-400">Required</p>
        <p className="text-sm font-semibold text-slate-800">
          {summary.requiredHours}h
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-400">Remaining</p>
        <p className="text-sm font-semibold text-slate-800">
          {summary.remainingHours.toFixed(2)}h
        </p>
      </div>
      <div className="ml-2 flex-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-xs font-medium text-slate-500">{pct}%</span>
    </div>
  );
}
