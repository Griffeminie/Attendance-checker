import type { AttendanceRecord } from "./types";
import { computeHoursFromTimes } from "./attendance";

type TextItem = {
  str: string;
  transform: number[];
};

type Table = {
  month: number;
  year: number;
  dateX: number;
  timeInRange: [number, number];
  timeOutRange: [number, number];
};

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const TIME_RE = /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i;

function xOf(item: TextItem) {
  return item.transform[4];
}

function yOf(item: TextItem) {
  return item.transform[5];
}

function sameRow(a: TextItem, b: TextItem) {
  return Math.abs(yOf(a) - yOf(b)) < 1.5;
}

function parseMonth(items: TextItem[], originX: number): { month: number; year: number } | null {
  const combinedMonthItem = items.find((item) => {
    const match = item.str.trim().match(/^([A-Za-z]+)\s+(20\d{2})$/);
    return Boolean(
      match &&
        MONTHS.includes(match[1].toLowerCase()) &&
        xOf(item) > originX + 100 &&
        xOf(item) < originX + 300
    );
  });
  if (combinedMonthItem) {
    const match = combinedMonthItem.str.trim().match(/^([A-Za-z]+)\s+(20\d{2})$/)!;
    return {
      month: MONTHS.indexOf(match[1].toLowerCase()) + 1,
      year: Number(match[2]),
    };
  }

  const monthItem = items.find((item) => {
    const value = item.str.trim().toLowerCase();
    return (
      MONTHS.includes(value) &&
      xOf(item) > originX + 100 &&
      xOf(item) < originX + 300
    );
  });
  if (!monthItem) return null;

  const yearItem = items.find(
    (item) =>
      /^20\d{2}$/.test(item.str.trim()) &&
      sameRow(item, monthItem) &&
      xOf(item) > xOf(monthItem)
  );
  if (!yearItem) return null;

  return {
    month: MONTHS.indexOf(monthItem.str.trim().toLowerCase()) + 1,
    year: Number(yearItem.str.trim()),
  };
}

function parseClock(items: TextItem[], range: [number, number], row: TextItem): string | null {
  const timeItem = items.find((item) => {
    if (!sameRow(item, row)) return false;
    if (xOf(item) < range[0] || xOf(item) > range[1]) return false;
    return TIME_RE.test(item.str.trim());
  });
  if (!timeItem) return null;

  const match = timeItem.str.trim().match(TIME_RE);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = match[2];
  let period = match[3]?.toUpperCase();

  if (!period) {
    const periodItem = items.find(
      (item) =>
        sameRow(item, timeItem) &&
        /^(AM|PM)$/i.test(item.str.trim()) &&
        xOf(item) > xOf(timeItem) &&
        xOf(item) < xOf(timeItem) + 55
    );
    if (periodItem) period = periodItem.str.trim().toUpperCase();
  }

  if (!period || hour < 1 || hour > 12) return null;
  if (period === "AM" && hour === 12) hour = 0;
  if (period === "PM" && hour !== 12) hour += 12;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function parseTable(items: TextItem[], table: Table): AttendanceRecord[] {
  const days = items.filter((item) => {
    const value = Number(item.str.trim());
    return (
      Number.isInteger(value) &&
      value >= 1 &&
      value <= 31 &&
      Math.abs(xOf(item) - table.dateX) < 18 &&
      yOf(item) > 40
    );
  });

  const records: AttendanceRecord[] = [];
  for (const dayItem of days) {
    const day = Number(dayItem.str.trim());
    const timeIn = parseClock(items, table.timeInRange, dayItem);
    const timeOut = parseClock(items, table.timeOutRange, dayItem);
    if (!timeIn || !timeOut) continue;

    const calculated = computeHoursFromTimes(timeIn, timeOut);
    records.push({
      date: `${table.year}-${String(table.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      timeIn,
      timeOut,
      ...calculated,
    });
  }
  return records;
}

export async function importDtrPdf(file: File): Promise<AttendanceRecord[]> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Please choose a PDF DTR file.");
  }

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const records: AttendanceRecord[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = content.items
      .filter((item) => "str" in item && "transform" in item)
      .map((item) => {
        const textItem = item as unknown as TextItem;
        return { str: textItem.str, transform: textItem.transform };
      });

    const tables = [
      {
        details: parseMonth(items, 0),
        table: {
          dateX: 54,
          timeInRange: [90, 160] as [number, number],
          timeOutRange: [165, 230] as [number, number],
        },
      },
      {
        details: parseMonth(items, 380),
        table: {
          dateX: 432,
          timeInRange: [470, 540] as [number, number],
          timeOutRange: [545, 615] as [number, number],
        },
      },
    ];

    for (const { details, table } of tables) {
      if (!details) continue;
      records.push(...parseTable(items, { ...details, ...table }));
    }
  }

  const unique = new Map(records.map((record) => [record.date, record]));
  const imported = Array.from(unique.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  if (imported.length === 0) {
    throw new Error("No attendance rows with both time-in and time-out were found.");
  }
  return imported;
}
