# Component Organization

This document describes the organization of components in the LiftIQ codebase.

## Structure

```
src/components/
├── common/          # Shared/common components
│   └── ThemeToggle.tsx
├── dashboard/       # Dashboard-related components
│   ├── HomeDashboard.tsx
│   ├── StatisticsDashboard.tsx
│   └── WorkoutSplitDashboard.tsx
├── workout/         # Workout-related components
│   ├── ExerciseCard.tsx
│   ├── ExerciseForm.tsx
│   ├── FreestyleWorkoutManager.tsx
│   ├── PastLifts.tsx
│   ├── WorkoutDayCard.tsx
│   ├── WorkoutSessionDetails.tsx
│   ├── WorkoutSessionManager.tsx
│   ├── WorkoutSplitCard.tsx
│   └── WorkoutSplitManager.tsx
└── ui/              # UI primitives (shadcn components)
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    ├── label.tsx
    ├── select.tsx
    └── textarea.tsx
```

## Organization Principles

1. **Common Components** (`common/`): Shared components used across multiple features
   - ThemeToggle: Theme switching component

2. **Dashboard Components** (`dashboard/`): High-level dashboard views
   - HomeDashboard: Main dashboard landing page
   - WorkoutSplitDashboard: Split workout management dashboard
   - StatisticsDashboard: Statistics and analytics view

3. **Workout Components** (`workout/`): All workout-related feature components
   - Exercise components: ExerciseCard, ExerciseForm
   - Split components: WorkoutSplitCard, WorkoutSplitManager, WorkoutDayCard
   - Session components: WorkoutSessionManager, WorkoutSessionDetails
   - Freestyle: FreestyleWorkoutManager
   - History: PastLifts

4. **UI Components** (`ui/`): Reusable UI primitives from shadcn/ui

## Import Paths

All imports use absolute paths with the `@/components` alias:

- Dashboard components: `@/components/dashboard/ComponentName`
- Workout components: `@/components/workout/ComponentName`
- Common components: `@/components/common/ComponentName`
- UI components: `@/components/ui/ComponentName`

