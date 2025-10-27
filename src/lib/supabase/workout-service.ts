'use client'

import { WorkoutSplit, WorkoutSession } from '@/lib/types'
import { createClient } from './client'

const supabase = createClient()

interface DatabaseWorkoutSplit {
  id: string
  user_id: string
  name: string
  description: string | null
  days: unknown
  created_at: string
  updated_at: string
}

interface DatabaseWorkoutSession {
  id: string
  user_id: string
  split_id: string
  split_name: string
  day_id: string
  day_name: string
  started_at: string
  completed_at: string | null
  status: string
  exercise_logs: unknown
  total_duration: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ============================================
// WORKOUT SPLITS
// ============================================

export async function getWorkoutSplits(): Promise<WorkoutSplit[]> {
  try {
    const { data, error } = await supabase
      .from('workout_splits')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Convert database format to app format
    return (data || []).map((item: DatabaseWorkoutSplit) => ({
      id: item.id,
      name: item.name,
      description: item.description || undefined,
      days: (item.days || []) as unknown as WorkoutSplit['days'],
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }))
  } catch (error) {
    console.error('Error fetching workout splits:', error)
    return []
  }
}

export async function saveWorkoutSplit(split: WorkoutSplit): Promise<WorkoutSplit | null> {
  try {
    const { data, error } = await supabase
      .from('workout_splits')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        name: split.name,
        description: split.description || null,
        days: split.days,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      days: data.days,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  } catch (error) {
    console.error('Error saving workout split:', error)
    return null
  }
}

export async function updateWorkoutSplit(split: WorkoutSplit): Promise<WorkoutSplit | null> {
  try {
    const { data, error } = await supabase
      .from('workout_splits')
      .update({
        name: split.name,
        description: split.description || null,
        days: split.days,
      })
      .eq('id', split.id)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      days: data.days,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  } catch (error) {
    console.error('Error updating workout split:', error)
    return null
  }
}

export async function deleteWorkoutSplit(splitId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('workout_splits')
      .delete()
      .eq('id', splitId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting workout split:', error)
    return false
  }
}

// ============================================
// WORKOUT SESSIONS
// ============================================

export async function getWorkoutSessions(): Promise<WorkoutSession[]> {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .order('started_at', { ascending: false })

    if (error) throw error

    // Convert database format to app format
    return (data || []).map((item: DatabaseWorkoutSession) => ({
      id: item.id,
      splitId: item.split_id,
      splitName: item.split_name,
      dayId: item.day_id,
      dayName: item.day_name,
      startedAt: new Date(item.started_at),
      completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
      status: item.status as 'active' | 'completed' | 'paused',
      exerciseLogs: (item.exercise_logs || []) as unknown as WorkoutSession['exerciseLogs'],
      totalDuration: item.total_duration ?? undefined,
      notes: item.notes ?? undefined,
    }))
  } catch (error) {
    console.error('Error fetching workout sessions:', error)
    return []
  }
}

export async function getActiveWorkoutSessions(): Promise<WorkoutSession[]> {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('status', 'active')
      .order('started_at', { ascending: false })

    if (error) throw error

    // Convert database format to app format
    return (data || []).map((item: DatabaseWorkoutSession) => ({
      id: item.id,
      splitId: item.split_id,
      splitName: item.split_name,
      dayId: item.day_id,
      dayName: item.day_name,
      startedAt: new Date(item.started_at),
      completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
      status: item.status as 'active' | 'completed' | 'paused',
      exerciseLogs: (item.exercise_logs || []) as unknown as WorkoutSession['exerciseLogs'],
      totalDuration: item.total_duration ?? undefined,
      notes: item.notes ?? undefined,
    }))
  } catch (error) {
    console.error('Error fetching active workout sessions:', error)
    return []
  }
}

export async function saveWorkoutSession(session: WorkoutSession): Promise<WorkoutSession | null> {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        split_id: session.splitId,
        split_name: session.splitName,
        day_id: session.dayId,
        day_name: session.dayName,
        started_at: session.startedAt.toISOString(),
        completed_at: session.completedAt?.toISOString() || null,
        status: session.status,
        exercise_logs: session.exerciseLogs,
        total_duration: session.totalDuration || null,
        notes: session.notes || null,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      splitId: data.split_id,
      splitName: data.split_name,
      dayId: data.day_id,
      dayName: data.day_name,
      startedAt: new Date(data.started_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      status: data.status,
      exerciseLogs: data.exercise_logs,
      totalDuration: data.total_duration,
      notes: data.notes || undefined,
    }
  } catch (error) {
    console.error('Error saving workout session:', error)
    return null
  }
}

export async function updateWorkoutSession(session: WorkoutSession): Promise<WorkoutSession | null> {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .update({
        split_id: session.splitId,
        split_name: session.splitName,
        day_id: session.dayId,
        day_name: session.dayName,
        started_at: session.startedAt.toISOString(),
        completed_at: session.completedAt?.toISOString() || null,
        status: session.status,
        exercise_logs: session.exerciseLogs,
        total_duration: session.totalDuration || null,
        notes: session.notes || null,
      })
      .eq('id', session.id)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      splitId: data.split_id,
      splitName: data.split_name,
      dayId: data.day_id,
      dayName: data.day_name,
      startedAt: new Date(data.started_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      status: data.status,
      exerciseLogs: data.exercise_logs,
      totalDuration: data.total_duration,
      notes: data.notes || undefined,
    }
  } catch (error) {
    console.error('Error updating workout session:', error)
    return null
  }
}

export async function deleteWorkoutSession(sessionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', sessionId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting workout session:', error)
    return false
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export async function clearAllUserData(): Promise<boolean> {
  try {
    // Delete all sessions
    const { error: sessionsError } = await supabase
      .from('workout_sessions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all (this condition is always true)

    if (sessionsError) throw sessionsError

    // Delete all splits
    const { error: splitsError } = await supabase
      .from('workout_splits')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (splitsError) throw splitsError

    return true
  } catch (error) {
    console.error('Error clearing all user data:', error)
    return false
  }
}

