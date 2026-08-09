"use client";

import type { AttendanceData } from "@/lib/types";
import type { CompletionEstimate } from "@/lib/attendance";
import { formatDateShort } from "@/lib/attendance";

export default function SummaryBar({
  summary,
  estimate,
}: {
  summary: AttendanceData["summary"];
  estimate: CompletionEstimate | null;
}) {
  const pct = Math.min(
    100,
    Math.round((summary.totalActualHours / summary.requiredHours) * 100)
  );

  return (
    <div className="flex items-center gap-10 bg-white px-8 py-5">
      <div>
        <p className="text-xs text-slate-400">Logged</p>
        <p className="mt-1 text-base font-semibold text-slate-800">
          {summary.totalActualHours.toFixed(2)}h
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-400">Required</p>
        <p className="mt-1 text-base font-semibold text-slate-800">
          {summary.requiredHours}h
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-400">Remaining</p>
        <p className="mt-1 text-base font-semibold text-slate-800">
          {summary.remainingHours.toFixed(2)}h
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-400">Est. Finish</p>
        <p className="mt-1 text-base font-semibold text-slate-800">
          {estimate ? formatDateShort(estimate.projectedDate) : "—"}
        </p>
        {estimate && (
          <p className="text-[11px] text-slate-400">
            ~{estimate.avgHoursPerDay.toFixed(1)}h/day avg
          </p>
        )}
      </div>
      <div className="ml-2 flex-1">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-sm font-medium text-slate-500">{pct}%</span>
    </div>
  );
}