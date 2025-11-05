import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import { EnhancedWorkoutAnalysis } from '@/lib/ai-analysis/ml-integration';
import { getScoreColor, getScoreIcon } from '@/lib/ai-analysis/utils';

interface AIWorkoutAnalysisCardProps {
  analysis: EnhancedWorkoutAnalysis;
}

export function AIWorkoutAnalysisCard({ analysis }: AIWorkoutAnalysisCardProps) {
  const daysAnalyzed = Math.ceil(
    (analysis.timeRange.endDate.getTime() - analysis.timeRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Workout Analysis
        </CardTitle>
        <CardDescription className="text-center">
          Based on {analysis.sessionsAnalyzed} session{analysis.sessionsAnalyzed !== 1 ? 's' : ''} over the past{' '}
          {daysAnalyzed} days
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
  );
}

