import type { PDFForm } from "pdf-lib";
import type { AttendanceRecord } from "./types";

export const DEFAULT_STUDENT_NAME = "Griffin Gil De Leon";
export const DEFAULT_HOST_COMPANY =
  "California Clothing Inc. - Purchasing Department";

const TEMPLATE_URL = "/dtr-template.pdf";

function fmtTime(t: string): string {
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mStr} ${period}`;
}

function fmtHours(h: number): string {
  return h.toFixed(2);
}

function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function groupByMonth(
  records: AttendanceRecord[]
): Map<string, Map<number, AttendanceRecord>> {
  const byMonth = new Map<string, Map<number, AttendanceRecord>>();
  for (const r of records) {
    const monthKey = r.date.slice(0, 7);
    const day = Number(r.date.slice(8, 10));
    if (!byMonth.has(monthKey)) byMonth.set(monthKey, new Map());
    byMonth.get(monthKey)!.set(day, r);
  }
  return byMonth;
}

function fillSide(
  form: PDFForm,
  suffix: string,
  nameField: string,
  nameValue: string,
  monthField: string,
  monthValue: string,
  dayRecords: Map<number, AttendanceRecord> | undefined
) {
  form.getTextField(nameField).setText(nameValue);
  form.getTextField(monthField).setText(monthValue);
  for (let day = 1; day <= 31; day++) {
    const rec = dayRecords?.get(day);
    if (!rec) continue;
    form.getTextField(`TIMEIN${day}${suffix}`).setText(fmtTime(rec.timeIn));
    form.getTextField(`TIMEOUT${day}${suffix}`).setText(fmtTime(rec.timeOut));
    form
      .getTextField(`TOTAL HOURS${day}${suffix}`)
      .setText(fmtHours(rec.actualHours));
  }
}

// Builds the DTR PDF, pairing two months per page (left/right), the same
// layout as the official form. Handles any number of months, growing as
// more entries get logged — an odd month out just gets a page to itself
// with the right-side table left blank.
export async function exportDtrPdf(
  records: AttendanceRecord[],
  studentName: string = DEFAULT_STUDENT_NAME,
  hostCompany: string = DEFAULT_HOST_COMPANY
): Promise<Uint8Array> {
  if (records.length === 0) {
    throw new Error("No attendance records to export yet.");
  }

  const { PDFDocument } = await import("pdf-lib");

  const byMonth = groupByMonth(records);
  const monthKeys = Array.from(byMonth.keys()).sort();

  const templateBytes = await fetch(TEMPLATE_URL).then((res) => {
    if (!res.ok) throw new Error("Could not load the DTR template.");
    return res.arrayBuffer();
  });

  const outputDoc = await PDFDocument.create();

  for (let i = 0; i < monthKeys.length; i += 2) {
    const leftMonth = monthKeys[i];
    const rightMonth = monthKeys[i + 1];

    const pageDoc = await PDFDocument.load(templateBytes);
    const form = pageDoc.getForm();

    fillSide(
      form,
      "",
      "DAILY TIME RECORD",
      studentName,
      "undefined_2",
      monthLabel(leftMonth),
      byMonth.get(leftMonth)
    );

    if (rightMonth) {
      fillSide(
        form,
        "_2",
        "undefined",
        hostCompany,
        "undefined_3",
        monthLabel(rightMonth),
        byMonth.get(rightMonth)
      );
    } else {
      // Odd month out: still show the company name, leave the table blank.
      form.getTextField("undefined").setText(hostCompany);
    }

    form.flatten();

    const [copiedPage] = await outputDoc.copyPages(pageDoc, [0]);
    outputDoc.addPage(copiedPage);
  }

  return outputDoc.save();
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}