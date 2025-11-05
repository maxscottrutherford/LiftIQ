# Component Organization

This document describes the organization of components, hooks, and utilities in the LiftIQ codebase.

## Structure

```
src/
├── components/
│   ├── common/              # Shared/common components
│   │   ├── CongratulationsModal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ScrollToTop.tsx
│   │   └── ThemeToggle.tsx
│   ├── dashboard/           # Dashboard-related components
│   │   ├── shared/         # Shared dashboard components
│   │   │   ├── ActiveWorkoutNotice.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── NavigationCard.tsx
│   │   │   ├── StatsOverview.tsx
│   │   │   └── index.ts
│   │   ├── AIInsights.tsx
│   │   ├── HomeDashboard.tsx
│   │   ├── StatisticsDashboard.tsx
│   │   └── WorkoutSplitDashboard.tsx
│   ├── ui/                  # UI primitives (shadcn components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── textarea.tsx
│   └── workout/              # Workout-related components
│       ├── ExerciseCard.tsx
│       ├── ExerciseForm.tsx
│       ├── FreestyleWorkoutManager.tsx
│       ├── PastLifts.tsx
│       ├── WorkoutDayCard.tsx
│       ├── WorkoutSessionDetails.tsx
│       ├── WorkoutSessionManager.tsx
│       ├── WorkoutSplitCard.tsx
│       └── WorkoutSplitManager.tsx
├── hooks/
│   ├── workout/              # Workout-related hooks
│   │   ├── useActiveSession.ts
│   │   ├── useWorkoutData.ts
│   │   └── index.ts
│   └── useWorkoutCompletion.ts
└── lib/
    ├── workout/              # Workout utilities
    │   ├── utils.ts
    │   └── index.ts
    ├── ai-analysis/          # AI analysis utilities
    ├── supabase/             # Supabase client and services
    ├── auth-context.tsx
    ├── navigation-utils.ts
    ├── theme-context.tsx
    ├── types.ts
    └── utils.ts
```

## Organization Principles

### Components

1. **Common Components** (`components/common/`): Shared components used across multiple features
   - `CongratulationsModal`: Celebration modal after workout completion
   - `LoadingSpinner`: Reusable loading component
   - `ScrollToTop`: Scroll-to-top functionality
   - `ThemeToggle`: Theme switching component

2. **Dashboard Components** (`components/dashboard/`): High-level dashboard views
   - **Main Dashboards:**
     - `HomeDashboard`: Main dashboard landing page
     - `WorkoutSplitDashboard`: Split workout management dashboard
     - `StatisticsDashboard`: Statistics and analytics view
     - `AIInsights`: AI-powered workout insights
   - **Shared Components** (`dashboard/shared/`): Reusable dashboard components
     - `DashboardHeader`: Header component with optional back button
     - `ActiveWorkoutNotice`: Notice for active workout sessions
     - `EmptyState`: Reusable empty state component
     - `NavigationCard`: Navigation card component
     - `StatsOverview`: Collapsible statistics overview

3. **Workout Components** (`components/workout/`): All workout-related feature components
   - Exercise components: `ExerciseCard`, `ExerciseForm`
   - Split components: `WorkoutSplitCard`, `WorkoutSplitManager`, `WorkoutDayCard`
   - Session components: `WorkoutSessionManager`, `WorkoutSessionDetails`
   - Freestyle: `FreestyleWorkoutManager`
   - History: `PastLifts`

4. **UI Components** (`components/ui/`): Reusable UI primitives from shadcn/ui

### Hooks

1. **Workout Hooks** (`hooks/workout/`): Workout-specific hooks
   - `useWorkoutData`: Loads and manages workout splits and sessions with retry logic
   - `useActiveSession`: Checks for active workout sessions in the database

2. **General Hooks** (`hooks/`): General-purpose hooks
   - `useWorkoutCompletion`: Manages workout completion state and celebration

### Utilities

1. **Workout Utilities** (`lib/workout/`): All workout-related utilities
   - `utils.ts`: Workout session utilities, formatting functions, validation, etc.

2. **Other Utilities** (`lib/`): General utilities
   - `navigation-utils.ts`: Navigation helper functions
   - `utils.ts`: General utility functions (cn, etc.)
   - `types.ts`: TypeScript type definitions
   - `auth-context.tsx`: Authentication context
   - `theme-context.tsx`: Theme context

## Import Paths

All imports use absolute paths with the `@/` alias:

### Components
- Dashboard main: `@/components/dashboard/ComponentName`
- Dashboard shared: `@/components/dashboard/shared/ComponentName`
- Workout components: `@/components/workout/ComponentName`
- Common components: `@/components/common/ComponentName`
- UI components: `@/components/ui/ComponentName`

### Hooks
- Workout hooks: `@/hooks/workout/hookName`
- General hooks: `@/hooks/hookName`

### Utilities
- Workout utilities: `@/lib/workout/utils`
- General utilities: `@/lib/utilityName`

## Benefits of This Organization

1. **Feature-based grouping**: Related code is grouped together (workout hooks, workout utils, etc.)
2. **Clear separation**: Main dashboards vs shared dashboard components
3. **Scalability**: Easy to add new features without cluttering root directories
4. **Maintainability**: Clear structure makes it easy to find and modify code
5. **Reusability**: Shared components are clearly separated and can be easily reused
