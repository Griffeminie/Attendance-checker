"use client";

import { useMemo, useState } from "react";
import attendanceData from "@/data/attendance.json";
import type { AttendanceData } from "@/lib/types";
import { recordsByDate } from "@/lib/attendance";
import AttendanceList from "@/components/AttendanceList";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import SummaryBar from "@/components/SummaryBar";

const data = attendanceData as AttendanceData;

export default function Home() {
  const byDate = useMemo(() => recordsByDate(data.records), []);

  // Start the calendar on the month of the most recent record.
  const latest = data.records[data.records.length - 1]?.date ?? "2026-08-01";
  const [year, setYear] = useState(Number(latest.slice(0, 4)));
  const [monthIndex, setMonthIndex] = useState(Number(latest.slice(5, 7)) - 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(latest);

  function goPrevMonth() {
    if (monthIndex === 0) {
      setYear((y) => y - 1);
      setMonthIndex(11);
    } else {
      setMonthIndex((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (monthIndex === 11) {
      setYear((y) => y + 1);
      setMonthIndex(0);
    } else {
      setMonthIndex((m) => m + 1);
    }
  }

  function selectDate(date: string) {
    setSelectedDate(date);
    setYear(Number(date.slice(0, 4)));
    setMonthIndex(Number(date.slice(5, 7)) - 1);
  }

  return (
    <main className="flex h-screen w-screen overflow-hidden">
      <div className="w-80 shrink-0">
        <AttendanceList
          records={data.records}
          selectedDate={selectedDate}
          onSelectDate={selectDate}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <SummaryBar data={data} />
        <div className="flex-1 overflow-hidden">
          <AttendanceCalendar
            year={year}
            monthIndex={monthIndex}
            recordsByDate={byDate}
            selectedDate={selectedDate}
            onSelectDate={selectDate}
            onPrevMonth={goPrevMonth}
            onNextMonth={goNextMonth}
          />
        </div>
      </div>
    </main>
  );
}
