"use client";

import { useEffect, useState } from "react";
import type { AttendanceRecord } from "@/lib/types";
import { formatDateLong } from "@/lib/attendance";

const CLOSE_ANIMATION_MS = 180;

export default function EditEntryModal({
  date,
  record,
  onClose,
  onSave,
  onDelete,
}: {
  date: string;
  record: AttendanceRecord | undefined;
  onClose: () => void;
  onSave: (date: string, timeIn: string, timeOut: string) => void;
  onDelete: (date: string) => void;
}) {
  const [timeIn, setTimeIn] = useState(record?.timeIn ?? "08:30");
  const [timeOut, setTimeOut] = useState(record?.timeOut ?? "17:30");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setTimeIn(record?.timeIn ?? "08:30");
    setTimeOut(record?.timeOut ?? "17:30");
    setIsClosing(false);
  }, [date, record]);

  // Runs the exit animation first, then fires the real state-changing
  // action once it's finished (React can't animate an unmount by itself).
  function requestClose(action: () => void) {
    setIsClosing(true);
    setTimeout(action, CLOSE_ANIMATION_MS);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 ${
        isClosing ? "modal-backdrop-exit" : "modal-backdrop-enter"
      }`}
      onClick={() => requestClose(onClose)}
    >
      <div
        className={`w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ${
          isClosing ? "modal-panel-exit" : "modal-panel-enter"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {record ? "Edit entry" : "Add entry"}
        </h3>
        <p className="mt-1 text-lg font-semibold text-slate-800">
          {formatDateLong(date)}
        </p>

        <div className="mt-5 flex gap-4">
          <label className="flex-1 text-sm text-slate-600">
            Time in
            <input
              type="time"
              value={timeIn}
              onChange={(e) => setTimeIn(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex-1 text-sm text-slate-600">
            Time out
            <input
              type="time"
              value={timeOut}
              onChange={(e) => setTimeOut(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          {record ? (
            <button
              onClick={() => requestClose(() => onDelete(date))}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <button
              onClick={() => requestClose(onClose)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => requestClose(() => onSave(date, timeIn, timeOut))}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}