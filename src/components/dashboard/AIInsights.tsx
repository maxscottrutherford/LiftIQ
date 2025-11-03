'use client';

import { useState, useEffect } from 'react';
import { WorkoutSession } from '@/lib/types';
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
}

export function AIInsights({ sessions, className }: AIInsightsProps) {
  const [analysis, setAnalysis] = useState<EnhancedWorkoutAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [mlTraining, setMlTraining] = useState(false);
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<string>>(new Set());
  const [expandedPredictions, setExpandedPredictions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const performAnalysis = async () => {
      setLoading(true);
      try {
        // Check if we should retrain (every 10 sessions or first time)
        const shouldRetrain = sessions.length > 0 && (sessions.length % 10 === 0 || sessions.length < 10);
        
        if (shouldRetrain && sessions.length >= 3) {
          setMlTraining(true);
        }

        const result = await analyzeWorkoutsWithML(sessions, {
          useML: true,
          retrainModel: shouldRetrain && sessions.length >= 3,
          lookbackDays: 30,
          minSessions: 2, // Lower threshold to show predictions sooner
        });
        
        setAnalysis(result);
      } catch (error) {
        console.error('Error analyzing workouts:', error);
      } finally {
        setLoading(false);
        setMlTraining(false);
      }
    };

    if (sessions.length > 0) {
      performAnalysis();
    } else {
      setLoading(false);
    }
  }, [sessions]);

  const toggleRecommendation = (id: string) => {
    const newExpanded = new Set(expandedRecommendations);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRecommendations(newExpanded);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            {mlTraining ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center">
                  <p className="text-muted-foreground font-medium">Training ML model...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This may take a few seconds on first use
                  </p>
                </div>
              </>
            ) : (
              <>
                <Brain className="h-6 w-6 animate-pulse text-primary" />
                <p className="text-muted-foreground">Analyzing workouts...</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis || analysis.sessionsAnalyzed === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Workout Analysis
          </CardTitle>
          <CardDescription>
            Based on {analysis.sessionsAnalyzed} session{analysis.sessionsAnalyzed !== 1 ? 's' : ''} over the past{' '}
            {Math.ceil((analysis.timeRange.endDate.getTime() - analysis.timeRange.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
            {analysis.mlPredictions?.modelTrained && (
              <span className="ml-2 inline-flex items-center gap-1 text-primary">
                <Sparkles className="h-3 w-3" />
                ML Enhanced
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {getScoreIcon(analysis.overallScore)}
              <div>
                <p className="text-sm text-muted-foreground">Overall Fitness Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}/100
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-secondary/10 rounded-lg border-l-4 border-l-primary">
            <p className="text-sm font-medium mb-2">Summary</p>
            <p className="text-sm text-muted-foreground">{analysis.summary}</p>
          </div>

          {/* Progress Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Strength Progress</p>
              <p className={`text-lg font-bold ${analysis.progressMetrics.strengthProgress >= 0 ? 'text-success' : 'text-destructive'}`}>
                {analysis.progressMetrics.strengthProgress >= 0 ? '+' : ''}
                {analysis.progressMetrics.strengthProgress.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Volume Progress</p>
              <p className={`text-lg font-bold ${analysis.progressMetrics.volumeProgress >= 0 ? 'text-success' : 'text-destructive'}`}>
                {analysis.progressMetrics.volumeProgress >= 0 ? '+' : ''}
                {analysis.progressMetrics.volumeProgress.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Consistency</p>
              <p className={`text-lg font-bold ${getScoreColor(analysis.progressMetrics.consistencyScore)}`}>
                {analysis.progressMetrics.consistencyScore}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Recovery</p>
              <p className={`text-lg font-bold ${getScoreColor(analysis.progressMetrics.recoveryScore)}`}>
                {analysis.progressMetrics.recoveryScore}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ML Predictions */}
      {analysis.mlPredictions && analysis.mlPredictions.exercisePredictions.size > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              ML Predictions
            </CardTitle>
            <CardDescription>
              AI-powered predictions for your next workout sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from(analysis.mlPredictions.exercisePredictions.entries()).map(([exerciseId, prediction]) => {
                const pattern = analysis.exercisePatterns.find(p => p.exerciseId === exerciseId);
                const exerciseName = pattern?.exerciseName || 'Exercise';
                const isExpanded = expandedPredictions.has(exerciseId);
                
                return (
                  <div
                    key={exerciseId}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{exerciseName}</h4>
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
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Predicted Weight</p>
                            <p className="text-lg font-bold text-primary">
                              {prediction.predictedMaxWeight} lbs
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Predicted Volume</p>
                            <p className="text-lg font-bold text-accent">
                              {prediction.predictedVolume.toLocaleString()} lbs
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Predicted RPE</p>
                            <p className="text-lg font-bold text-secondary">
                              {prediction.predictedRPE}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Progression Ready</p>
                            <p className={`text-lg font-bold ${prediction.progressionReady ? 'text-success' : 'text-muted-foreground'}`}>
                              {prediction.progressionReady ? 'Yes' : 'Not yet'}
                            </p>
                          </div>
                        </div>

                        {prediction.progressionReady && (
                          <div className="p-2 bg-success/10 rounded-md mb-2">
                            <p className="text-xs font-medium text-success mb-1">
                              Ready to Progress!
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Suggested increase: +{prediction.progressionAmount} lbs
                            </p>
                          </div>
                        )}

                        {prediction.deloadProbability > 0.6 && (
                          <div className="p-2 bg-destructive/10 rounded-md mb-2">
                            <p className="text-xs font-medium text-destructive mb-1">
                              Deload Recommended ({Math.round(prediction.deloadProbability * 100)}% probability)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Optimal weight: {prediction.optimalWeight} lbs
                            </p>
                          </div>
                        )}

                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            <div>
                              <p className="text-xs font-medium mb-1">Optimal Recommendations:</p>
                              <ul className="space-y-1">
                                <li className="text-xs text-muted-foreground">
                                  • Optimal weight: {prediction.optimalWeight} lbs
                                </li>
                                <li className="text-xs text-muted-foreground">
                                  • Optimal volume: {prediction.optimalVolume.toLocaleString()} lbs
                                </li>
                                {prediction.progressionReady && (
                                  <li className="text-xs text-muted-foreground">
                                    • Increase weight by {prediction.progressionAmount} lbs
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
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
              })}
            </div>
          </CardContent>
        </Card>
      ) : analysis.mlPredictions && !analysis.mlPredictions.modelTrained && sessions.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              ML Predictions
            </CardTitle>
            <CardDescription>
              Complete more workouts to enable AI predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-centerbg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                ML predictions will appear once you have:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>At least 3 total workout sessions</li>
                <li>At least 2 sessions with the same exercise</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                Currently: {sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Patterns */}
      {analysis.exercisePatterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Exercise Patterns
            </CardTitle>
            <CardDescription>
              Performance patterns detected across your exercises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.exercisePatterns.map((pattern) => (
                <div
                  key={pattern.exerciseId}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{pattern.exerciseName}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
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
                          <span className="text-xs text-destructive">⚠ High Priority</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                    </div>
                    {pattern.trend === 'up' && <TrendingUp className="h-5 w-5 text-success flex-shrink-0 ml-2" />}
                    {pattern.trend === 'down' && <TrendingDown className="h-5 w-5 text-destructive flex-shrink-0 ml-2" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {(analysis.hybridRecommendations?.length || 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Recommendations
            </CardTitle>
            <CardDescription>
              AI-powered suggestions to optimize your training
              {analysis.mlPredictions?.modelTrained && (
                <span className="ml-2 text-xs">(Enhanced with ML predictions)</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* High Priority */}
            {(() => {
              const recs = analysis.hybridRecommendations || analysis.recommendations || [];
              const high = recs.filter(r => r.priority === 'high');
              const medium = recs.filter(r => r.priority === 'medium');
              const low = recs.filter(r => r.priority === 'low');
              
              return (
                <>
                  {high.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-destructive">High Priority</h3>
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
                      <h3 className="text-sm font-semibold text-accent">Medium Priority</h3>
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
                      <h3 className="text-sm font-semibold text-primary">Low Priority</h3>
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
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-0.5">
              {getIcon(recommendation.type)}
            </div>
            <div className="flex-1 min-w-0">
              {recommendation.exerciseName && (
                <p className="text-xs text-muted-foreground mb-1">
                  {recommendation.exerciseName}
                </p>
              )}
              <h4 className="font-semibold mb-1">{recommendation.title}</h4>
              <p className="text-sm text-muted-foreground">{recommendation.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0"
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
        <div className="px-4 pb-4 space-y-3 border-t bg-muted/30">
          <div className="pt-3">
            <p className="text-sm font-medium mb-2">Action Items:</p>
            <ul className="space-y-1">
              {recommendation.actionItems.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs font-medium mb-1">Why this matters:</p>
            <p className="text-xs text-muted-foreground">{recommendation.reasoning}</p>
          </div>
        </div>
      )}
    </div>
  );
}

