# ScoutVision

> AI-powered sports scouting platform. Uload an athlete's video clip, get a structured performance report in seconds.

[![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-6B48FF?logo=anthropic&logoColor=white)](https://claude.ai/claude-code)

---

## What it does

Scouts and coaches upload short video clips of athletes. ScoutVision extracts frames using the browser's Canvas API, sends them to **OpenAI GPT-4o Vision**, and returns a structured scouting report covering:

- Overall rating (0–10)
- Strengths & weaknesses
- Technical skill scores (sport-specific)
- Physical attributes (speed, agility, strength)
- Coaching recommendations

Reports are saved to a Supabase database, searchable and filterable, and can be printed as PDFs from the browser.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vite + React 18 + TypeScript |
| Styling | Inline styles + Inter font |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI | OpenAI GPT-4o Vision |
| Data Fetching | TanStack React Query v5 |
| Charts | Recharts |
| Forms | React Hook Form |
| Testing | Vitest |
| Package Manager | bun |
| Deployment | Vercel |

---

## Features

- **Athlete Profiles** — create and manage athlete records (name, sport, position, age, team)
- **Video Upload** — drag-and-drop MP4/MOV/AVI (up to 100 MB) with upload progress bar
- **AI Analysis** — extracts 5 evenly-spaced frames via Canvas API, sends to GPT-4o Vision
- **Scouting Reports** — expandable cards with radar chart, strengths/weaknesses, recommendations
- **Filter & Search** — filter reports by athlete or sport
- **PDF Export** — print any report to PDF via `window.print()` with clean `@media print` styles
- **Protected Routes** — all dashboard routes require Supabase auth session

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/scout-vision.git
cd scout-vision
bun install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_OPENAI_API_KEY=sk-...
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor to create all tables and RLS policies
3. Create a Storage bucket named **`videos`** (public or with appropriate RLS)
4. Copy your project URL and anon key into `.env.local`

### 4. Run the dev server

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run typecheck` | TypeScript type checking |
| `bun run test` | Run Vitest test suite |
| `bun run format` | Format source files with Prettier |

---

## Project Structure

```
src/
├── components/        # Sidebar, ProtectedRoute, shared UI
├── contexts/          # AuthContext (Supabase session)
├── hooks/             # useAthletes, useReports, useDashboardStats
├── lib/               # supabase.ts client singleton
├── pages/             # Landing, Login, Signup, Dashboard, Athletes, VideoAnalysis, Reports
├── services/          # openai.ts (GPT-4o Vision fetch wrapper)
├── styles/            # typography.ts, colors
└── types/             # shared TypeScript types
supabase/
└── schema.sql         # Full PostgreSQL schema with RLS
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_OPENAI_API_KEY` | OpenAI API key (GPT-4o access required) |

> **Note:** The OpenAI API key is used client-side for the MVP. Move AI calls to a server-side function (Vercel Edge / Supabase Edge Functions) before shipping to production.

---

## Built with [Claude Code](https://claude.ai/claude-code)
