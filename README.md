# Attendance Checker

Next.js (App Router) + TypeScript + Tailwind app with:

- **Left panel** — scrollable list of every attendance record (date, time in/out, hours, full/partial badge). Click an entry to jump the calendar to it.
- **Center** — a month calendar table. Each day cell shows logged hours and is color-coded (green = full day, amber = partial, white = no record). Prev/Next buttons move between months.
- **Top bar** — total hours logged vs. the 486-hour requirement, with a progress bar.

## Setup

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Push to GitHub

**Option A — using the `gh` CLI (fastest):**

```bash
gh repo create attendance-checker --private --source=. --remote=origin --push
```

This creates the repo under your account and pushes in one step. Drop `--private` if you want it public.

**Option B — manual:**

1. Create a new empty repo on GitHub (no README/license, so it stays empty): https://github.com/new
2. In the project folder:

```bash
git init
git add .
git commit -m "Initial commit: attendance checker"
git branch -M main
git remote add origin https://github.com/<your-username>/attendance-checker.git
git push -u origin main
```

A GitHub Actions workflow (`.github/workflows/ci.yml`) is already included — it installs dependencies and runs `npm run build` on every push/PR to `main`, so you'll get a ✅/❌ check automatically once it's on GitHub.

### Deploying it

Once it's on GitHub, the easiest live deploy is [Vercel](https://vercel.com/new) (made by the Next.js team) — import the repo and it deploys with zero config. GitHub Pages doesn't support Next.js's server features out of the box, so Vercel, Netlify, or a Docker/Node host are better fits than Pages.

## Project structure

```
app/
  layout.tsx        root layout
  page.tsx           wires the list + calendar together, holds selected date/month state
  globals.css         Tailwind entry
components/
  AttendanceList.tsx     left sidebar
  AttendanceCalendar.tsx center calendar table
  SummaryBar.tsx          top hours-progress bar
lib/
  types.ts            shared TS types
  attendance.ts        date/status helper functions
data/
  attendance.json     your attendance records (seeded from your data)
```

## Swapping in your own data

Replace `data/attendance.json`, keeping the same shape:

```json
{
  "meta": { "requiredHours": 486, "lunchBreak": {...}, ... },
  "records": [
    { "date": "2026-08-03", "timeIn": "08:30", "timeOut": "17:30", "rawHours": 9, "actualHours": 8, "lunchDeducted": true }
  ],
  "summary": { "totalDaysLogged": 43, "totalActualHours": 317.97, "requiredHours": 486, "remainingHours": 168.03, ... }
}
```

Later on, this JSON file could be swapped for a database/API call inside `app/page.tsx` without touching the components.

## What to build next (suggestions)

- An "Add / Edit entry" form that writes back to `data/attendance.json` (needs an API route since it's a static import right now).
- A "days remaining to hit 486h" projection based on average daily hours.
- Filtering the list by month or by full/partial status.
- Persisting data in a real database (e.g. SQLite via Prisma) instead of a static JSON file.
