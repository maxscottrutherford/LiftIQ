# Supabase Database Integration - Quick Start

## Files Created

1. **`supabase_schema.sql`** - Complete SQL schema to run in Supabase
2. **`src/lib/supabase/workout-service.ts`** - Helper functions for database operations
3. **`DATABASE_SETUP.md`** - Detailed setup instructions
4. **This file** - Quick reference

## Quick Setup (3 Steps)

### Step 1: Run SQL Schema
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase_schema.sql`
3. Paste and run the SQL

### Step 2: Verify Setup
Run in SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('workout_splits', 'workout_sessions');
```

Should return 2 rows.

### Step 3: Test Database Connection
Your app already has the Supabase client configured. The database is ready to use!

## What Was Created

### Database Tables

**workout_splits**
- Stores workout programs with their days and exercises
- Automatically updates `updated_at` on changes
- Indexed for fast user lookups

**workout_sessions**
- Stores completed and active workout sessions
- Tracks exercise logs (sets, weight, reps, RPE/RIR)
- Tracks duration and session notes

### Security (RLS Policies)
- ✅ Users can only see their own data
- ✅ Users can only modify their own data
- ✅ Automatic user_id filtering

### Indexes
- ✅ Fast user lookups
- ✅ Fast date-based sorting
- ✅ Fast status filtering

## Using the Service Functions

```typescript
import {
  getWorkoutSplits,
  saveWorkoutSplit,
  updateWorkoutSplit,
  deleteWorkoutSplit,
  getWorkoutSessions,
  saveWorkoutSession,
  updateWorkoutSession,
  deleteWorkoutSession
} from '@/lib/supabase/workout-service'

// Get all splits
const splits = await getWorkoutSplits()

// Save a split
await saveWorkoutSplit(mySplit)

// Get all sessions
const sessions = await getWorkoutSessions()
```

## Data Structure

### Workout Split
```typescript
{
  id: string (UUID from Supabase)
  name: string
  description?: string
  days: WorkoutDay[] (stored as JSONB)
  createdAt: Date
  updatedAt: Date
}
```

### Workout Session
```typescript
{
  id: string (UUID from Supabase)
  splitId: string
  splitName: string
  dayId: string
  dayName: string
  startedAt: Date
  completedAt?: Date
  status: 'active' | 'completed' | 'paused'
  exerciseLogs: ExerciseLog[] (stored as JSONB)
  totalDuration?: number
  notes?: string
}
```

## Migration from localStorage

Currently your app uses localStorage. To migrate:

1. Export localStorage data
2. Transform to Supabase format
3. Use service functions to import

See `DATABASE_SETUP.md` for detailed migration guide.

## Ready to Use!

The database is set up and ready. The helper functions in `workout-service.ts` handle all the database operations with proper error handling.

**Next**: Update your components to use the database instead of localStorage!

