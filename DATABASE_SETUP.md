# Database Setup Guide for LiftIQ

## Step 1: Run the SQL Schema in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `supabase_schema.sql` and paste it into the editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see a success message

## What the Schema Creates

### Tables

1. **workout_splits** - Stores your workout programs/splits
   - `id` - UUID primary key
   - `user_id` - Links to auth.users
   - `name` - Split name (e.g., "Push/Pull/Legs")
   - `description` - Optional description
   - `days` - JSONB array of WorkoutDay objects
   - `created_at` - Timestamp
   - `updated_at` - Auto-updated timestamp

2. **workout_sessions** - Stores completed/active workout sessions
   - `id` - UUID primary key
   - `user_id` - Links to auth.users
   - `split_id` - Reference to workout split
   - `split_name` - Name of the split
   - `day_id` - Reference to workout day
   - `day_name` - Name of the day
   - `started_at` - Session start time
   - `completed_at` - Session completion time
   - `status` - 'active', 'completed', or 'paused'
   - `exercise_logs` - JSONB array of ExerciseLog objects
   - `total_duration` - Duration in minutes
   - `notes` - Optional notes
   - `created_at` - Timestamp
   - `updated_at` - Auto-updated timestamp

### Security

- **Row Level Security (RLS)** is enabled on all tables
- Users can only:
  - View their own data
  - Insert their own data
  - Update their own data
  - Delete their own data

### Performance

Indexes are created for:
- User lookups
- Split lookups by user
- Session status filtering
- Date-based sorting

## Step 2: Test the Schema

Run these queries in the SQL Editor to verify everything is set up correctly:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('workout_splits', 'workout_sessions');

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('workout_splits', 'workout_sessions');

-- Check if policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('workout_splits', 'workout_sessions');
```

## Step 3: Update Your App (Optional)

The `workout-service.ts` file provides functions to interact with your Supabase database. You can start using these functions instead of localStorage.

### Available Functions

**Workout Splits:**
- `getWorkoutSplits()` - Get all user's workout splits
- `saveWorkoutSplit(split)` - Save a new workout split
- `updateWorkoutSplit(split)` - Update an existing split
- `deleteWorkoutSplit(id)` - Delete a workout split

**Workout Sessions:**
- `getWorkoutSessions()` - Get all user's sessions
- `getActiveWorkoutSessions()` - Get only active sessions
- `saveWorkoutSession(session)` - Save a new session
- `updateWorkoutSession(session)` - Update an existing session
- `deleteWorkoutSession(id)` - Delete a session

**Utility:**
- `clearAllUserData()` - Delete all user's data (for testing)

### Example Usage

```typescript
import { 
  getWorkoutSplits, 
  saveWorkoutSplit 
} from '@/lib/supabase/workout-service'

// Get all splits
const splits = await getWorkoutSplits()

// Save a new split
const newSplit = {
  name: "Push/Pull/Legs",
  description: "Classic 3-day split",
  days: [...],
  createdAt: new Date(),
  updatedAt: new Date()
}
await saveWorkoutSplit(newSplit)
```

## Step 4: Migration Strategy

If you have existing data in localStorage that you want to migrate:

1. **Export from localStorage** (manual or script)
2. **Transform to Supabase format**
3. **Import using the service functions**

Example migration script (run in browser console):

```javascript
// Get data from localStorage
const splitsData = localStorage.getItem('workout_splits')
const sessionsData = localStorage.getItem('workout_sessions')

// Parse and save to Supabase using the service functions
// (Run this in your app context with access to the functions)
```

## Database Structure Reference

### WorkoutDay JSON Structure
```json
{
  "id": "string",
  "name": "string",
  "exercises": [
    {
      "id": "string",
      "name": "string",
      "warmupSets": 0,
      "workingSets": 0,
      "repRange": {
        "min": 0,
        "max": 0
      },
      "intensityMetric": {
        "type": "rpe" | "rir" | "",
        "value": 0
      },
      "restTime": 0.0,
      "notes": "string"
    }
  ]
}
```

### ExerciseLog JSON Structure
```json
{
  "id": "string",
  "exerciseId": "string",
  "exerciseName": "string",
  "sets": [
    {
      "id": "string",
      "setNumber": 0,
      "type": "warmup" | "working",
      "weight": 0.0,
      "reps": 0,
      "rpe": 0,
      "rir": 0,
      "completed": false,
      "completedAt": "ISO date string",
      "restTime": 0.0
    }
  ],
  "completedAt": "ISO date string",
  "notes": "string"
}
```

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the SQL schema successfully
- Check that you're querying the correct schema

### "permission denied" error
- Verify RLS policies are created
- Check that the user is authenticated
- Ensure user_id matches auth.uid()

### Data not persisting
- Check browser console for errors
- Verify environment variables are set correctly
- Ensure you're using the correct Supabase project

## Next Steps

1. ✅ Set up Supabase database (you've done this!)
2. 🔄 Update app to use Supabase instead of localStorage
3. 🎨 Add data migration from localStorage (if needed)
4. 🧪 Test all functionality
5. 🚀 Deploy and enjoy!

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL JSONB Guide](https://www.postgresql.org/docs/current/datatype-json.html)

