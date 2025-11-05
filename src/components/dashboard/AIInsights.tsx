'use client';

import { useState, useEffect, useMemo } from 'react';
import { WorkoutSession, ExerciseLog, SetLog } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { WorkoutRecommendation } from '@/lib/ai-analysis/types';
import { EnhancedWorkoutAnalysis } from '@/lib/ai-analysis/ml-integration';
import { analyzeWorkoutsWithML } from '@/lib/ai-analysis/ml-integration';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
  Activity,
  Info,
  Sparkles,
  Loader2
} from 'lucide-react';

interface AIInsightsProps {
  sessions: WorkoutSession[];
  className?: string;
  selectedExercise?: string;
  onExerciseChange?: (exercise: string) => void;
}

export function AIInsights({ sessions, className, selectedExercise: externalSelectedExercise, onExerciseChange }: AIInsightsProps) {
  const [analysis, setAnalysis] = useState<EnhancedWorkoutAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [internalSelectedExercise, setInternalSelectedExercise] = useState<string>('');
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<string>>(new Set());
  const [expandedPredictions, setExpandedPredictions] = useState<Set<string>>(new Set());

  // Use external selectedExercise if provided, otherwise use internal state
  const selectedExercise = externalSelectedExercise !== undefined ? externalSelectedExercise : internalSelectedExercise;
  const setSelectedExercise = (exercise: string) => {
    if (onExerciseChange) {
      onExerciseChange(exercise);
    } else {
      setInternalSelectedExercise(exercise);
    }
  };

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

  // Set the first exercise as default when exercises are loaded (only if using internal state)
  useEffect(() => {
    if (availableExercises.length > 0 && !selectedExercise && externalSelectedExercise === undefined) {
      setInternalSelectedExercise(availableExercises[0]);
    }
  }, [availableExercises, selectedExercise, externalSelectedExercise]);

  useEffect(() => {
    const performAnalysis = async () => {
      setLoading(true);
      try {
        const result = await analyzeWorkoutsWithML(sessions, {
          useML: true,
          lookbackDays: 30,
          minSessions: 2, // Lower threshold to show predictions sooner
        });
        
        setAnalysis(result);
      } catch (error) {
        console.error('Error analyzing workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessions.length > 0) {
      performAnalysis();
    } else {
      setLoading(false);
    }
  }, [sessions]);

  // Filter exercise-specific data by selected exercise - MUST be before any conditional returns
  const filteredExerciseData = useMemo(() => {
    if (!analysis || !selectedExercise) {
      return {
        predictions: null,
        patterns: [],
        recommendations: [],
      };
    }

    // Filter predictions by exercise name
    const filteredPredictions = analysis.weightPredictions ? (() => {
      const predictions = Array.from(analysis.weightPredictions.exercisePredictions.entries()).find(([exerciseId]) => {
        const pattern = analysis.exercisePatterns.find(p => p.exerciseId === exerciseId);
        return pattern?.exerciseName === selectedExercise;
      });
      return predictions ? { exerciseId: predictions[0], prediction: predictions[1] } : null;
    })() : null;

    // Filter exercise patterns
    const filteredPatterns = analysis.exercisePatterns.filter(
      pattern => pattern.exerciseName === selectedExercise
    );

    // Filter recommendations by exercise name
    const filteredRecommendations = analysis.recommendations.filter(
      rec => rec.exerciseName === selectedExercise
    );

    return {
      predictions: filteredPredictions,
      patterns: filteredPatterns,
      recommendations: filteredRecommendations,
    };
  }, [analysis, selectedExercise]);

  // Prepare chart data for selected exercise
  const chartData = useMemo(() => {
    if (!selectedExercise || sessions.length === 0) return [];

    interface ChartDataPoint {
      date: string;
      maxWeight: number;
      sessionDate: Date;
    }

    const dataPoints: ChartDataPoint[] = [];

    sessions.forEach((session: WorkoutSession) => {
      const exercise = session.exerciseLogs.find(
        (ex: ExerciseLog) => ex.exerciseName.trim() === selectedExercise
      );

      if (!exercise) return;

      const completedSets = exercise.sets.filter((set: SetLog) => set.completed && set.weight !== undefined);
      
      if (completedSets.length > 0) {
        const maxWeight = Math.max(...completedSets.map((set: SetLog) => set.weight!));
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

    return dataPoints.sort((a, b) => 
      a.sessionDate.getTime() - b.sessionDate.getTime()
    );
  }, [selectedExercise, sessions]);

  const toggleRecommendation = (id: string) => {
    const newExpanded = new Set(expandedRecommendations);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRecommendations(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-success';
    if (score >= 50) return 'text-accent';
    return 'text-destructive';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 75) return <CheckCircle2 className="h-5 w-5 text-success" />;
    if (score >= 50) return <AlertCircle className="h-5 w-5 text-accent" />;
    return <AlertCircle className="h-5 w-5 text-destructive" />;
  };

  const getRecommendationIcon = (type: WorkoutRecommendation['type']) => {
    switch (type) {
      case 'deload':
        return <TrendingDown className="h-4 w-4" />;
      case 'volume_increase':
      case 'volume_decrease':
        return <Activity className="h-4 w-4" />;
      case 'isometric':
        return <Target className="h-4 w-4" />;
      case 'rep_range_change':
        return <Zap className="h-4 w-4" />;
      case 'rest':
        return <Info className="h-4 w-4" />;
      case 'progression_ready':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: WorkoutRecommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-destructive';
      case 'medium':
        return 'border-l-accent';
      case 'low':
        return 'border-l-primary';
    }
  };

  // Now we can do conditional returns after all hooks are called
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Brain className="h-6 w-6 animate-pulse text-primary" />
            <p className="text-muted-foreground">Analyzing workouts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis || analysis.sessionsAnalyzed === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Workout Insights
          </CardTitle>
          <CardDescription>
            Complete at least 3 workout sessions to receive AI-powered insights and recommendations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Workout Analysis - Shows ALL workout data (unfiltered) */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Workout Analysis
            </CardTitle>
            <CardDescription className="text-center">
              Based on {analysis.sessionsAnalyzed} session{analysis.sessionsAnalyzed !== 1 ? 's' : ''} over the past{' '}
              {Math.ceil((analysis.timeRange.endDate.getTime() - analysis.timeRange.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 space-y-4">
            {/* Overall Score */}
            <div className="flex items-center justify-center sm:justify-between p-3 sm:p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                {getScoreIcon(analysis.overallScore)}
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Overall Fitness Score</p>
                  <p className={`text-2xl sm:text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}/100
                  </p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-3 sm:p-4 bg-secondary/10 rounded-lg border-l-4 border-l-primary">
              <p className="text-xs sm:text-sm font-medium mb-2">Summary</p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Progress Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Strength Progress</p>
                <p className={`text-base sm:text-lg font-bold ${analysis.progressMetrics.strengthProgress >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {analysis.progressMetrics.strengthProgress >= 0 ? '+' : ''}
                  {analysis.progressMetrics.strengthProgress.toFixed(1)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Volume Progress</p>
                <p className={`text-base sm:text-lg font-bold ${analysis.progressMetrics.volumeProgress >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {analysis.progressMetrics.volumeProgress >= 0 ? '+' : ''}
                  {analysis.progressMetrics.volumeProgress.toFixed(1)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Consistency</p>
                <p className={`text-base sm:text-lg font-bold ${getScoreColor(analysis.progressMetrics.consistencyScore)}`}>
                  {analysis.progressMetrics.consistencyScore}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Recovery</p>
                <p className={`text-base sm:text-lg font-bold ${getScoreColor(analysis.progressMetrics.recoveryScore)}`}>
                  {analysis.progressMetrics.recoveryScore}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Selection */}
      {availableExercises.length > 0 && (
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="space-y-2">
              <label htmlFor="exercise-select-ai" className="text-sm font-medium">
                Select Exercise to Analyze
              </label>
              <div className="relative">
                <select
                  id="exercise-select-ai"
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer touch-manipulation"
                >
                  {availableExercises.map(exercise => (
                    <option key={exercise} value={exercise}>
                      {exercise}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Patterns - FOR SELECTED EXERCISE */}
      {selectedExercise && filteredExerciseData.patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Exercise Patterns
            </CardTitle>
            <CardDescription>
              Performance patterns detected from your training data
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3">
              {filteredExerciseData.patterns.map((pattern) => (
                <div
                  key={pattern.exerciseId}
                  className="p-3 sm:p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm sm:text-base break-words">{pattern.exerciseName}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                          pattern.patternType === 'optimal' || pattern.patternType === 'progression'
                            ? 'bg-success/20 text-success'
                            : pattern.patternType === 'plateau'
                            ? 'bg-accent/20 text-accent'
                            : pattern.patternType === 'decline'
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {pattern.patternType}
                        </span>
                        {pattern.severity === 'high' && (
                          <span className="text-xs text-destructive whitespace-nowrap">⚠ High Priority</span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{pattern.description}</p>
                    </div>
                    {pattern.trend === 'up' && <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success flex-shrink-0" />}
                    {pattern.trend === 'down' && <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-destructive flex-shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weight Progression Predictions - FOR SELECTED EXERCISE */}
      {selectedExercise && filteredExerciseData.predictions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progression
            </CardTitle>
            <CardDescription>
              Suggested weights for your next workout based on your training trends
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3">
              {(() => {
                const { exerciseId, prediction } = filteredExerciseData.predictions;
                const isExpanded = expandedPredictions.has(exerciseId);
                
                return (
                  <div
                    key={exerciseId}
                    className="p-3 sm:p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            prediction.confidence >= 0.7
                              ? 'bg-success/20 text-success'
                              : prediction.confidence >= 0.5
                              ? 'bg-accent/20 text-accent'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {Math.round(prediction.confidence * 100)}% confidence
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Current Weight</p>
                            <p className="text-base sm:text-lg font-bold text-muted-foreground">
                              {prediction.currentWeight} lbs
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Suggested Next Weight</p>
                            <p className="text-base sm:text-lg font-bold text-primary">
                              {prediction.predictedNextWeight} lbs
                            </p>
                            {prediction.weightIncrease > 0 && (
                              <p className="text-xs text-success mt-1">
                                +{prediction.weightIncrease} lbs increase
                              </p>
                            )}
                            {prediction.weightIncrease < 0 && (
                              <p className="text-xs text-destructive mt-1">
                                {prediction.weightIncrease} lbs (deload suggested)
                              </p>
                            )}
                            {prediction.weightIncrease === 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Maintain current weight
                              </p>
                            )}
                          </div>
                        </div>

                        {prediction.weightIncrease > 0 && (
                          <div className="p-2 sm:p-3 bg-success/10 rounded-md mb-2">
                            <p className="text-xs font-medium text-success mb-1">
                              Ready to Progress!
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {prediction.reasoning}
                            </p>
                          </div>
                        )}

                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-medium mb-1">Prediction Details:</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {prediction.reasoning}
                            </p>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 min-w-[44px] min-h-[44px] touch-manipulation"
                        onClick={() => {
                          const newExpanded = new Set(expandedPredictions);
                          if (newExpanded.has(exerciseId)) {
                            newExpanded.delete(exerciseId);
                          } else {
                            newExpanded.add(exerciseId);
                          }
                          setExpandedPredictions(newExpanded);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations - FOR SELECTED EXERCISE */}
      {selectedExercise && filteredExerciseData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Recommendations
            </CardTitle>
            <CardDescription>
              AI-powered suggestions to optimize your training
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 space-y-4">
            {/* High Priority */}
            {(() => {
              const recs = filteredExerciseData.recommendations;
              const high = recs.filter(r => r.priority === 'high');
              const medium = recs.filter(r => r.priority === 'medium');
              const low = recs.filter(r => r.priority === 'low');
              
              return (
                <>
                  {high.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs sm:text-sm font-semibold text-destructive">High Priority</h3>
                      {high.map((rec) => (
                        <RecommendationCard
                          key={rec.id}
                          recommendation={rec}
                          isExpanded={expandedRecommendations.has(rec.id)}
                          onToggle={() => toggleRecommendation(rec.id)}
                          getIcon={getRecommendationIcon}
                          getPriorityColor={getPriorityColor}
                        />
                      ))}
                    </div>
                  )}
                  {medium.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs sm:text-sm font-semibold text-accent">Medium Priority</h3>
                      {medium.map((rec) => (
                        <RecommendationCard
                          key={rec.id}
                          recommendation={rec}
                          isExpanded={expandedRecommendations.has(rec.id)}
                          onToggle={() => toggleRecommendation(rec.id)}
                          getIcon={getRecommendationIcon}
                          getPriorityColor={getPriorityColor}
                        />
                      ))}
                    </div>
                  )}
                  {low.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs sm:text-sm font-semibold text-primary">Low Priority</h3>
                      {low.map((rec) => (
                        <RecommendationCard
                          key={rec.id}
                          recommendation={rec}
                          isExpanded={expandedRecommendations.has(rec.id)}
                          onToggle={() => toggleRecommendation(rec.id)}
                          getIcon={getRecommendationIcon}
                          getPriorityColor={getPriorityColor}
                        />
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Chart - FOR SELECTED EXERCISE */}
      {selectedExercise && chartData.length > 0 && (
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-center">Max Weight Over Time</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 space-y-6">
            <div className="w-full h-[250px] sm:h-[400px]">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface RecommendationCardProps {
  recommendation: WorkoutRecommendation;
  isExpanded: boolean;
  onToggle: () => void;
  getIcon: (type: WorkoutRecommendation['type']) => React.ReactNode;
  getPriorityColor: (priority: WorkoutRecommendation['priority']) => string;
}

function RecommendationCard({
  recommendation,
  isExpanded,
  onToggle,
  getIcon,
  getPriorityColor,
}: RecommendationCardProps) {
  return (
    <div className={`border-l-4 rounded-lg border bg-card ${getPriorityColor(recommendation.priority)}`}>
      <div
        className="p-3 sm:p-4 cursor-pointer hover:bg-muted/50 transition-colors touch-manipulation"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="mt-0.5 flex-shrink-0">
              {getIcon(recommendation.type)}
            </div>
            <div className="flex-1 min-w-0">
              {recommendation.exerciseName && (
                <p className="text-xs text-muted-foreground mb-1">
                  {recommendation.exerciseName}
                </p>
              )}
              <h4 className="font-semibold mb-1 text-sm sm:text-base break-words">{recommendation.title}</h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{recommendation.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 min-w-[44px] min-h-[44px] touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 border-t bg-muted/30">
          <div className="pt-3">
            <p className="text-xs sm:text-sm font-medium mb-2">Action Items:</p>
            <ul className="space-y-1">
              {recommendation.actionItems.map((item, index) => (
                <li key={index} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2 leading-relaxed">
                  <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs font-medium mb-1">Why this matters:</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{recommendation.reasoning}</p>
          </div>
        </div>
      )}
    </div>
  );
}

