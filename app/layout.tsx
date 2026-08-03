import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Attendance Checker",
  description: "Track daily attendance against a required hours target",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
