"use client";

import type { AttendanceData } from "@/lib/types";
import type { CompletionEstimate } from "@/lib/attendance";
import { formatDateShort } from "@/lib/attendance";

export default function SummaryBar({
  summary,
  estimate,
  onExport,
  exporting,
  onImport,
  importing,
  studentName,
  onStudentNameChange,
}: {
  summary: AttendanceData["summary"];
  estimate: CompletionEstimate | null;
  onExport: () => void;
  exporting: boolean;
  onImport: (file: File) => void;
  importing: boolean;
  studentName: string;
  onStudentNameChange: (name: string) => void;
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
      <input
        type="text"
        value={studentName}
        onChange={(e) => onStudentNameChange(e.target.value)}
        placeholder="Your name"
        className="w-40 shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
      <button
        onClick={onExport}
        disabled={exporting}
        className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
      >
        {exporting ? "Exporting…" : "Export DTR"}
      </button>
      <label className="shrink-0 cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 has-[:disabled]:cursor-wait has-[:disabled]:opacity-50">
        {importing ? "Importing…" : "Import DTR"}
        <input
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          disabled={importing}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImport(file);
            e.currentTarget.value = "";
          }}
        />
      </label>
    </div>
  );
}
