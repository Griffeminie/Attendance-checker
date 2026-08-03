export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  timeIn: string; // HH:mm
  timeOut: string; // HH:mm
  rawHours: number;
  actualHours: number;
  lunchDeducted: boolean;
}

export interface AttendanceData {
  meta: {
    requiredHours: number;
    lunchBreak: { start: string; end: string; note: string };
    generatedFrom: string;
    lastUpdated: string;
  };
  records: AttendanceRecord[];
  summary: {
    totalDaysLogged: number;
    totalRawHours: number;
    totalActualHours: number;
    requiredHours: number;
    remainingHours: number;
  };
}

export type DayStatus = "full" | "partial" | "none";
