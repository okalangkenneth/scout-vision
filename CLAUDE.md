# Project Rules – ScoutVision

## Memory Architecture (3-Layer System)

| Layer | Location | Purpose | Auto-Loaded |
|-------|----------|---------|-------------|
| **CLAUDE.md** | Project root | Rules, workflow, conventions | ✅ Always |
| **MEMORY.md** | `~/.claude/projects/<project>/memory/` | Session learnings | ✅ First 200 lines |
| **claude-mem** | `~/.claude-mem/` | Deep searchable history | ✅ Via MCP injection |

---

## Build Progress (KEEP UPDATED)

### ✅ COMPLETED
- Project scaffold: Vite + React 18 + TypeScript
- Routing: react-router-dom with ProtectedRoute
- Auth context: Supabase auth skeleton
- Directory structure: pages, components, hooks, services, types, lib
- Supabase schema: `supabase/schema.sql` (profiles, athletes, videos, analysis_reports, subscriptions)
- Landing page UI (src/pages/Landing.tsx)
- Auth pages: Login + Signup (src/pages/Login.tsx, src/pages/Signup.tsx)
- Dashboard page with stats cards + sidebar layout
- Athletes CRUD: card grid, Add/Edit modal, optimistic delete
- Video Analysis: drag-and-drop upload → Supabase Storage → Canvas frame extraction → OpenAI GPT-4o vision → report saved
- Reports page: filter by athlete/sport, expandable cards, Recharts radar chart, delete report, @media print PDF export
- Supabase Storage RLS policies (4 policies on storage.objects for videos bucket)
- OpenAI prompt updated with explicit JSON schema for reliable field names
- PDF export wired up (window.print + print CSS) on both VideoAnalysis and Reports pages
- Deployed to Vercel with CI/CD via GitHub (master branch auto-deploys)
- Live at: https://scout-vision.vercel.app

### 🔨 IN PROGRESS
<!-- nothing currently in progress -->

### ❌ REMAINING
- Stripe subscription gating
- Admin panel
- v2: Player tagging + bounding box tracking (see AI Limitation section)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vite + React 18 + TypeScript |
| Styling | Inline styles + Inter typography |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Storage | Supabase Storage (video/image uploads) |
| AI | OpenAI API (GPT-4o vision for video analysis) |
| Payments | Stripe |
| Data fetching | TanStack React Query |
| Charts | Recharts |
| Forms | React Hook Form |
| Testing | Vitest |
| Package Manager | bun |
| Deployment | Vercel |

---

## Project Overview

ScoutVision is an AI-powered sports scouting platform.

Scouts and coaches upload sport clips → AI analyses the video → structured scouting report generated per athlete.

### Core Features
1. **Athlete Profiles** – name, sport, position, age, team
2. **Video Upload** – upload clips to Supabase Storage
3. **AI Analysis** – send video frames to OpenAI GPT-4o vision, extract performance metrics
4. **Scouting Reports** – structured breakdown: strengths, weaknesses, key metrics, recommendations
5. **Dashboard** – overview of athletes analysed, reports generated, subscription status
6. **Stripe Subscriptions** – Starter / Pro / Unlimited plans

### AI Analysis Pipeline
```
Upload video → Extract frames (ffmpeg/canvas) → Send to OpenAI GPT-4o vision
→ Parse structured JSON response → Save report to Supabase → Display to scout
```

---

## ⚠️ AI Limitation — Player Identification

### Current Behaviour
GPT-4o receives 5 still frames from the uploaded video plus the athlete's name,
sport, and position. It analyses **what it sees in the frames generally** — it
does NOT track or isolate a specific individual. It has no way of knowing which
player in a team game is the target athlete.

### Disclaimer (show to users)
> **For best results, upload a solo drill clip or footage where the athlete is
> the primary subject of the video.** In team game footage, the AI analyses
> general play visible in the frames and cannot reliably identify a specific
> player among others.

### Analysis Quality by Video Type
| Scenario | Quality |
|---|---|
| Solo drill (only the athlete) | ✅ Accurate |
| 1-on-1 or small group | ⚠️ Partial |
| Full team game footage | ❌ Unreliable |

---

## 🚀 Future Enhancement — v2 Player Tracking

To make the analysis production-grade, add a **"tag your player"** step:

1. After upload, show the scout frame 1 of the video
2. Scout clicks on the target athlete to place a bounding box
3. App tracks that bounding box across all 5 extracted frames using a
   computer vision model (e.g. YOLO or OpenCV)
4. Only the cropped region around the tagged player is sent to GPT-4o vision

This would allow accurate per-player analysis in full team game footage.

**Effort estimate:** Medium — requires a server-side processing step (Python/
FastAPI with OpenCV) since bounding box tracking cannot run in the browser.
Could be implemented as a Supabase Edge Function or a separate FastAPI service.

---

## Workflow

```
1. Make changes
2. Typecheck: bun run typecheck
3. Test: bun run test
4. Format: bun run format
5. Verify in browser
6. Commit: conventional commits
```

## Git Conventions
- **Branching**: main = production. Feature: git checkout -b feat/name
- **Commits**: feat:, fix:, chore:, docs:, refactor:, test:
- **Before commit**: bun run typecheck && bun run test
- **Never commit**: .env.local, API keys, secrets

---

## Critical Rules

### Code Quality
- NO placeholders (YOUR_API_KEY, TODO, FIXME)
- TypeScript strict mode — no `any` types
- Environment variables for all secrets
- Remove unused imports
- Add logging for all API calls (OpenAI, Supabase, Stripe)

### Before Every Change
- Only modify what was explicitly requested
- Ask if <90% confident
- Offer 2-3 options for significant decisions

### Money Handling (NON-NEGOTIABLE)
- ALL money as INTEGER cents
- NEVER parseFloat() for financial values

---

## Supabase Schema (planned)

```sql
-- profiles: extends auth.users
-- athletes: id, scout_id, name, sport, position, age, team, created_at
-- videos: id, athlete_id, url, duration, uploaded_at
-- analysis_reports: id, video_id, athlete_id, report_json, created_at
-- subscriptions: id, user_id, stripe_customer_id, plan, status
```

---

## Corrections Log

| Date | Mistake | Rule |
|------|---------|------|
| | | |
