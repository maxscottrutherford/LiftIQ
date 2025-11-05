import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ExercisePattern } from '@/lib/ai-analysis/types';
import { getPatternTypeBadgeClass } from '@/lib/ai-analysis/utils';

interface ExercisePatternCardProps {
  patterns: ExercisePattern[];
}

export function ExercisePatternCard({ patterns }: ExercisePatternCardProps) {
  if (patterns.length === 0) return null;

  return (
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
          {patterns.map((pattern) => (
            <div
              key={pattern.exerciseId}
              className="p-3 sm:p-4 rounded-lg border bg-card"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm sm:text-base break-words">{pattern.exerciseName}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${getPatternTypeBadgeClass(pattern.patternType)}`}>
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
  );
}

