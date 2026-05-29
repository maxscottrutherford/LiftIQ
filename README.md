# LiftIQ

A modern workout tracking app built with Next.js, React, TypeScript, and Shadcn UI. Create workout programs, log sessions in real time, review history and progress, and get AI-assisted planning and analysis—all synced to your account via Supabase.

## Features

- **Workout split management** — Create programs with multiple days and exercises (sets, rep ranges, RPE/RIR, rest times, notes)
- **Live session tracking** — Log warmup and working sets with weight, reps, and intensity; rest timer; resume active sessions across visits
- **Freestyle workouts** — Log a workout without a predefined split
- **Workout history** — Browse and inspect past sessions
- **Statistics & progress** — Charts and insights per exercise, powered by session history
- **AI workout planner** — Generate personalized programs from preferences (OpenAI)
- **AI workout analysis** — Rule-based pattern detection and recommendations, with optional ML weight progression predictions (TensorFlow.js)
- **Authentication** — Sign up and sign in with Supabase; data scoped per user
- **Dark / light theme** — System-aware theme with manual toggle
- **PWA-ready** — Web app manifest for add-to-home-screen on mobile

## Tech Stack

| Layer | Technology |
|--------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Shadcn UI, Radix primitives, Tailwind CSS |
| Language | TypeScript |
| Backend / auth | Supabase (`@supabase/ssr`) |
| Charts | Recharts |
| AI planning | OpenAI API (`gpt-4o-mini`) |
| On-device ML | TensorFlow.js (weight progression predictions) |
| Icons | Lucide React |
| Fonts | Geist Sans & Geist Mono |

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm (or yarn)
- A [Supabase](https://supabase.com) project with `workout_splits` and workout session tables configured
- (Optional) An [OpenAI](https://platform.openai.com) API key for the AI Workout Planner

### Installation

1. Clone the repository:

```bash
git clone https://github.com/maxscottrutherford/LiftIQ.git
cd LiftIQ
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

`OPENAI_API_KEY` is only required for `/dashboard/ai-planner`. Supabase variables are required for auth and data persistence.

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## How to Use

### Sign up and dashboard

1. Create an account from the landing page or sign in at `/signin`.
2. After login you land on `/dashboard` with navigation to all features.

### Workout splits

1. Open **Workout Splits** from the dashboard (`/dashboard?view=splits`).
2. **Create Split** — name your program and add days (e.g. Push, Pull, Legs).
3. For each day, add exercises with warmup/working sets, rep range, RPE or RIR, rest time, and optional notes.
4. Start a workout from a split card to enter the live session logger.

### Logging a workout

- **From a split** — Start a day’s workout; sets save to Supabase after the first completed set; you can resume an active session later.
- **Freestyle** — Use **Log a Workout** (`/dashboard?view=freestyle`) to record exercises without a program.

### History and statistics

- **Past Lifts** — View completed sessions (`/dashboard?view=history`).
- **Statistics** — Analyze progress with charts and AI insights (`/dashboard?view=statistics`).

### AI workout planner

1. Go to **AI Workout Planner** (`/dashboard/ai-planner`).
2. Set preferences (split format, days per week, duration, goals, equipment, etc.).
3. Review the generated plan and import it into your splits when ready.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── page.tsx            # Landing page
│   ├── signin/ signup/
│   ├── dashboard/          # Main app (view query params)
│   └── api/ai/workout-plan/  # OpenAI workout plan endpoint
├── components/
│   ├── common/             # Shared UI (modals, theme, loading)
│   ├── dashboard/          # Home, splits hub, statistics, AI UI
│   ├── workout/            # Splits, sessions, exercises, history
│   └── ui/                 # Shadcn primitives
├── hooks/                  # useWorkoutData, useActiveSession, etc.
└── lib/
    ├── types.ts            # Core TypeScript types
    ├── supabase/           # Client, middleware, workout-service
    ├── workout/            # Session helpers and formatting
    ├── ai-analysis/        # Patterns, recommendations, ML predictions
    └── ai-coaching/        # OpenAI prompts and plan parsing
```

For a detailed breakdown of components, hooks, and import conventions, see [COMPONENT_ORGANIZATION.md](./COMPONENT_ORGANIZATION.md). For AI analysis usage, see [src/lib/ai-analysis/README.md](./src/lib/ai-analysis/README.md).

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Data Storage

Workout splits and sessions are stored in **Supabase** (PostgreSQL), tied to the authenticated user. This enables:

- Persistence across devices when signed in
- Active session recovery
- History and analytics from completed sessions

Session completion celebrations use short-lived `sessionStorage` flags on the client only; they are not a substitute for database storage.

## Roadmap

- [x] Personal record detection and celebration modal during live logging
- [ ] Data export / import
- [ ] Expanded exercise library and templates
- [ ] Deeper ML integration (deload timing, volume optimization)
- [ ] Native mobile app

## Contributing

This is a personal project, but suggestions and feedback are welcome.

## License

This project is for personal use.
