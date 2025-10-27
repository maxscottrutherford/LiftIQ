-- ============================================
-- LiftIQ Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This creates all tables, policies, and indexes needed

-- ============================================
-- Enable UUID extension
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. WORKOUT SPLITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workout_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  days JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of WorkoutDay objects
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add created_at and updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workout_splits_updated_at 
  BEFORE UPDATE ON workout_splits 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. WORKOUT SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  split_id TEXT NOT NULL, -- Reference to workout split (stores the id string)
  split_name TEXT NOT NULL,
  day_id TEXT NOT NULL, -- Reference to workout day (stores the id string)
  day_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  exercise_logs JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of ExerciseLog objects
  total_duration INTEGER, -- in minutes
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_workout_sessions_updated_at 
  BEFORE UPDATE ON workout_sessions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. INDEXES for Performance
-- ============================================

-- Workout splits indexes
CREATE INDEX IF NOT EXISTS idx_workout_splits_user_id ON workout_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_splits_created_at ON workout_splits(created_at DESC);

-- Workout sessions indexes
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_split_id ON workout_sessions(split_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_status ON workout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_started_at ON workout_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_started_at_active ON workout_sessions(started_at DESC) WHERE status = 'active';

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on workout_splits
ALTER TABLE workout_splits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own workout splits
CREATE POLICY "Users can view own workout splits"
  ON workout_splits FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own workout splits
CREATE POLICY "Users can insert own workout splits"
  ON workout_splits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own workout splits
CREATE POLICY "Users can update own workout splits"
  ON workout_splits FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own workout splits
CREATE POLICY "Users can delete own workout splits"
  ON workout_splits FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on workout_sessions
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own workout sessions
CREATE POLICY "Users can view own workout sessions"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own workout sessions
CREATE POLICY "Users can insert own workout sessions"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own workout sessions
CREATE POLICY "Users can update own workout sessions"
  ON workout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own workout sessions
CREATE POLICY "Users can delete own workout sessions"
  ON workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to get user's workout splits
CREATE OR REPLACE FUNCTION get_user_workout_splits()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  description TEXT,
  days JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM workout_splits
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's workout sessions
CREATE OR REPLACE FUNCTION get_user_workout_sessions()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  split_id TEXT,
  split_name TEXT,
  day_id TEXT,
  day_name TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT,
  exercise_logs JSONB,
  total_duration INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM workout_sessions
  WHERE user_id = auth.uid()
  ORDER BY started_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active workout sessions
CREATE OR REPLACE FUNCTION get_user_active_sessions()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  split_id TEXT,
  split_name TEXT,
  day_id TEXT,
  day_name TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT,
  exercise_logs JSONB,
  total_duration INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM workout_sessions
  WHERE user_id = auth.uid() AND status = 'active'
  ORDER BY started_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. SAMPLE DATA (Optional - for testing)
-- ============================================
-- You can uncomment these to insert sample data
-- Replace 'YOUR_USER_ID_HERE' with an actual user ID from auth.users

/*
INSERT INTO workout_splits (user_id, name, description, days)
VALUES (
  'YOUR_USER_ID_HERE'::uuid,
  'Push/Pull/Legs',
  'A classic 3-day split focusing on muscle groups',
  '[
    {
      "id": "day1",
      "name": "Push Day",
      "exercises": [
        {
          "id": "ex1",
          "name": "Bench Press",
          "warmupSets": 2,
          "workingSets": 3,
          "repRange": {"min": 5, "max": 8},
          "intensityMetric": {"type": "rpe", "value": 8},
          "restTime": 3,
          "notes": "Focus on form"
        }
      ]
    }
  ]'::jsonb
);
*/

-- ============================================
-- DONE! 
-- ============================================
-- Your database is now set up with:
-- ✓ workout_splits table (stores user workout programs)
-- ✓ workout_sessions table (stores completed/active workout sessions)
-- ✓ Row Level Security policies (users can only access their own data)
-- ✓ Indexes for optimal query performance
-- ✓ Helper functions for common queries
-- ✓ Automatic updated_at timestamps
-- 
-- Next steps:
-- 1. Test the schema by querying the tables
-- 2. Update your app to use Supabase instead of localStorage
-- 3. Add any additional indexes as needed based on query patterns
-- ============================================

