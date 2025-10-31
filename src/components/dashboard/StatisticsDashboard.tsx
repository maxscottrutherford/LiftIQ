'use client';

import { useState, useEffect, useMemo } from 'react';
import { WorkoutSession } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { getWorkoutSessions } from '@/lib/supabase/workout-service';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  maxWeight: number;
  sessionDate: Date;
}

export function StatisticsDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      try {
        const loadedSessions = await getWorkoutSessions();
        setSessions(loadedSessions);
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  // Extract all unique exercise names from all sessions
  const availableExercises = useMemo(() => {
    const exerciseNames = new Set<string>();
    sessions.forEach(session => {
      session.exerciseLogs.forEach(exercise => {
        if (exercise.exerciseName && exercise.exerciseName.trim()) {
          exerciseNames.add(exercise.exerciseName.trim());
        }
      });
    });
    return Array.from(exerciseNames).sort();
  }, [sessions]);

  // Set the first exercise as default when exercises are loaded
  useEffect(() => {
    if (availableExercises.length > 0 && !selectedExercise) {
      setSelectedExercise(availableExercises[0]);
    }
  }, [availableExercises, selectedExercise]);

  // Prepare chart data for selected exercise
  const chartData = useMemo(() => {
    if (!selectedExercise || sessions.length === 0) return [];

    const dataPoints: ChartDataPoint[] = [];

    // Filter sessions that contain the selected exercise
    sessions
      .filter(session => {
        return session.exerciseLogs.some(
          exercise => exercise.exerciseName.trim() === selectedExercise
        );
      })
      .forEach(session => {
        // Find the exercise in this session
        const exercise = session.exerciseLogs.find(
          ex => ex.exerciseName.trim() === selectedExercise
        );

        if (!exercise) return;

        // Find max weight among completed sets
        const completedSets = exercise.sets.filter(set => set.completed && set.weight !== undefined);
        
        if (completedSets.length > 0) {
          const maxWeight = Math.max(...completedSets.map(set => set.weight!));
          const sessionDate = session.completedAt || session.startedAt;
          
          dataPoints.push({
            date: sessionDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }),
            maxWeight,
            sessionDate,
          });
        }
      });

    // Sort by date (ascending)
    return dataPoints.sort((a, b) => 
      a.sessionDate.getTime() - b.sessionDate.getTime()
    );
  }, [selectedExercise, sessions]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 py-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <BarChart3 className="h-8 w-8 animate-pulse text-primary" />
            <p className="text-muted-foreground">Loading statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Statistics</h1>
            <p className="text-muted-foreground mt-1">
              Track your progress and analyze your gains
            </p>
          </div>
        </div>
      </div>

      {/* Exercise Selection */}
      {availableExercises.length > 0 ? (
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Max Weight Over Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="exercise-select">Select Exercise</Label>
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger id="exercise-select" className="w-full">
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {availableExercises.map(exercise => (
                    <SelectItem key={exercise} value={exercise}>
                      {exercise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {chartData.length > 0 ? (
              <div className="w-full min-h-[400px]" style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis 
                      label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft' }}
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="maxWeight" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                      name="Max Weight (lbs)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No weight data available for {selectedExercise}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete workouts with this exercise to see progress over time.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Workout Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No workout data available yet
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Complete your first workout to see statistics and charts.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <ThemeToggle />
    </div>
  );
}

