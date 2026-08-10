"use client";

import { useEffect, useMemo, useState } from "react";
import attendanceData from "@/data/attendance.json";
import type { AttendanceData, AttendanceRecord } from "@/lib/types";
import {
  computeHoursFromTimes,
  computeSummary,
  estimateCompletion,
  recordsByDate,
} from "@/lib/attendance";
import AttendanceList from "@/components/AttendanceList";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import SummaryBar from "@/components/SummaryBar";
import EditEntryModal from "@/components/EditEntryModal";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { downloadPdf, exportDtrPdf } from "@/lib/dtr";

const data = attendanceData as AttendanceData;
const STORAGE_KEY = "attendance-checker-records-v1";

export default function Home() {
  const [records, setRecords] = useState<AttendanceRecord[]>(data.records);
  const [hydrated, setHydrated] = useState(false);

  // Load anything saved in this browser once, on first mount. This has to
  // happen in an effect (not the useState initializer) so the server-
  // rendered HTML and the client's first render match — loading from
  // localStorage during render would cause a hydration mismatch.
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch {
        // ignore corrupt/old data, fall back to the seed data already set
      }
    }
    setHydrated(true);
  }, []);

  // Persist on every change, but only after the initial load above has run
  // — otherwise this would immediately overwrite saved data with the seed
  // data during the brief window before localStorage has been read.
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records, hydrated]);

  const byDate = useMemo(() => recordsByDate(records), [records]);
  const summary = useMemo(
    () => computeSummary(records, data.meta.requiredHours),
    [records]
  );
  const estimate = useMemo(
    () => estimateCompletion(records, data.meta.requiredHours),
    [records]
  );
  const goalMet = summary.remainingHours <= 0 && records.length > 0;
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);

  useEffect(() => {
    if (!goalMet) setCelebrationDismissed(false);
  }, [goalMet]);

  // Start the calendar on the month of the most recent record.
  const latest = data.records[data.records.length - 1]?.date ?? "2026-08-01";
  const [year, setYear] = useState(Number(latest.slice(0, 4)));
  const [monthIndex, setMonthIndex] = useState(Number(latest.slice(5, 7)) - 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(latest);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [direction, setDirection] = useState<"left" | "right">("right");

  function goPrevMonth() {
    setDirection("left");
    if (monthIndex === 0) {
      setYear((y) => y - 1);
      setMonthIndex(11);
    } else {
      setMonthIndex((m) => m - 1);
    }
  }

  function goNextMonth() {
    setDirection("right");
    if (monthIndex === 11) {
      setYear((y) => y + 1);
      setMonthIndex(0);
    } else {
      setMonthIndex((m) => m + 1);
    }
  }

  function selectDate(date: string) {
    const targetMonth = `${date.slice(0, 4)}-${date.slice(5, 7)}`;
    const currentMonth = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    if (targetMonth !== currentMonth) {
      setDirection(targetMonth > currentMonth ? "right" : "left");
    }
    setSelectedDate(date);
    setYear(Number(date.slice(0, 4)));
    setMonthIndex(Number(date.slice(5, 7)) - 1);
  }

  function openEditor(date: string) {
    selectDate(date);
    setEditingDate(date);
  }

  function closeEditor() {
    setEditingDate(null);
  }

  function saveEntry(date: string, timeIn: string, timeOut: string) {
    const { rawHours, actualHours, lunchDeducted } = computeHoursFromTimes(
      timeIn,
      timeOut
    );
    setRecords((prev) => {
      const next = prev.filter((r) => r.date !== date);
      next.push({ date, timeIn, timeOut, rawHours, actualHours, lunchDeducted });
      return next;
    });
    closeEditor();
  }

  function deleteEntry(date: string) {
    setRecords((prev) => prev.filter((r) => r.date !== date));
    closeEditor();
  }

  const [exporting, setExporting] = useState(false);

  async function handleExportDtr() {
    setExporting(true);
    try {
      const bytes = await exportDtrPdf(records);
      downloadPdf(bytes, "DTR.pdf");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to export DTR.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="flex h-screen w-screen gap-6 overflow-hidden bg-slate-100 p-6">
      <div className="w-96 shrink-0 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <AttendanceList
          records={records}
          selectedDate={selectedDate}
          onSelectDate={openEditor}
        />
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-hidden">
        <div className="shrink-0 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <SummaryBar
            summary={summary}
            estimate={estimate}
            onExport={handleExportDtr}
            exporting={exporting}
          />
        </div>
        <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <AttendanceCalendar
            year={year}
            monthIndex={monthIndex}
            recordsByDate={byDate}
            selectedDate={selectedDate}
            onSelectDate={openEditor}
            onPrevMonth={goPrevMonth}
            onNextMonth={goNextMonth}
            direction={direction}
          />
        </div>
      </div>

      {editingDate && (
        <EditEntryModal
          date={editingDate}
          record={byDate.get(editingDate)}
          onClose={closeEditor}
          onSave={saveEntry}
          onDelete={deleteEntry}
        />
      )}

      {goalMet && !celebrationDismissed && (
        <CelebrationOverlay onDismiss={() => setCelebrationDismissed(true)} />
      )}
    </main>
  );
}
