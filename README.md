# Doshi's Dashboard

A personal dashboard web app (desktop-first, single-user). Built with Next.js (App Router), TypeScript, TailwindCSS, and shadcn-style UI. **Data is stored in a local SQLite database** so changes persist when you stop and restart the app.

## Run locally (Windows)

1. Open **Command Prompt** or **PowerShell** and go to the project folder (use quotes if the path has spaces or an apostrophe):
   ```cmd
   cd "C:\Users\14084\Desktop\Doshi's Dashboard"
   ```
2. Install dependencies and start the dev server:
   ```cmd
   npm install
   npm run dev
   ```
3. In your browser, open **http://localhost:3000**.

If `npm` is not recognized, install [Node.js](https://nodejs.org) (LTS) first, then run the commands again.

## Build

```cmd
npm run build
npm start
```

## Where data is stored

- **Database:** A **SQLite** file at `data/dashboard.sqlite` in the project folder. The `data` folder is created automatically the first time you run the app.
- **Persistence:** All tasks, vision tiles/goals, books, reviews, purchases, fragrances, and packages are saved in this database. When you stop the dashboard and start it again, your data is still there.
- **First run:** If the database is empty, the app seeds it with demo data so you can try the UI immediately.

## Export / import data

- **Export JSON:** In **Settings** (/settings), click **Export JSON** to download a backup of all data.
- **Import JSON:** Click **Import JSON** and choose a previously exported file. This **replaces** all data in the database with the file contents.
- **Reset to demo data:** Replaces everything in the database with the built-in demo set.
- **Clear all data:** Deletes all records in the database (empty dashboard).

## Tech stack

- Next.js 14 (App Router), TypeScript, TailwindCSS
- **SQLite** (better-sqlite3) for local database storage
- Zustand for client state (loaded from and saved to the API/database)
- Radix UI primitives + Vaul for drawers
- Lucide icons

## Routes

- `/` — Dashboard (widgets + Daily Review)
- `/todo` — To-Do
- `/vision` — Vision board (tiles + goals)
- `/reading` — Reading list + reviews
- `/purchases` — Monthly + wishlist (with images)
- `/fragrances` — Fragrances (with images)
- `/packages` — Incoming packages (with images)
- `/settings` — Export, import, reset, clear
