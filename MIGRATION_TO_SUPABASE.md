# Migration from localStorage to Supabase

## What Changed

The app now uses Supabase database instead of localStorage for storing workout data. This provides:
- ✅ Data persists across devices
- ✅ User-specific secure storage
- ✅ Automatic backups
- ✅ Better scalability

## Data Migration

### If you have existing data in localStorage:

You can migrate your existing data to Supabase. Here's how:

### Option 1: Manual Migration via Browser Console

1. Open your browser console (F12)
2. Navigate to your LiftIQ app in the same browser
3. Run this script to export your data:

```javascript
// Export localStorage data
const exportData = () => {
  const splits = localStorage.getItem('workoutSplits');
  const sessions = localStorage.getItem('workoutSessions');
  
  const data = {
    workoutSplits: splits ? JSON.parse(splits) : [],
    workoutSessions: sessions ? JSON.parse(sessions) : []
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `liftiq-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
};

exportData();
```

4. This downloads your data as a JSON file

### Option 2: Start Fresh

Since you're using authentication now, you can start with a clean slate. Your new workouts will be stored securely in Supabase.

### Option 3: Programmatic Migration (Future)

We can add a migration tool directly in the app if needed.

## How It Works Now

### Workout Splits
- Created in the app → Saved to Supabase `workout_splits` table
- Edited → Updated in Supabase
- Deleted → Removed from Supabase
- Loaded automatically when you sign in

### Workout Sessions
- Completed sessions → Saved to Supabase `workout_sessions` table
- Session history → Loaded from Supabase
- Deleted sessions → Removed from Supabase

## Authentication Required

You must be signed in to:
- Create workouts
- View your workouts
- Start workout sessions
- View session history

Sign up or sign in at `/signup` or `/signin` to get started.

## What About Theme Preferences?

Theme preferences (dark/light mode) are still stored in localStorage as they should be browser-specific.

## Testing

1. Sign up or sign in to your account
2. Create a new workout split
3. Start a workout session
4. Complete it
5. Check "Past Lifts" to see your history

## Troubleshooting

### "No data found"
- Make sure you're signed in
- Verify you have created workout splits
- Check Supabase dashboard to see if data exists

### "Loading forever"
- Check browser console for errors
- Verify `.env.local` has correct Supabase credentials
- Make sure you ran the SQL schema in Supabase

### "Permission denied"
- Check that you're signed in
- Verify Supabase RLS policies are set up correctly
- Make sure the database schema was created

## Need Help?

1. Check your Supabase dashboard for data
2. Verify authentication is working
3. Check browser console for errors
4. Ensure the database schema is set up correctly

