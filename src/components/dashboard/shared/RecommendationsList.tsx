import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { WorkoutRecommendation } from '@/lib/ai-analysis/types';
import { RecommendationCard } from './RecommendationCard';
import { getRecommendationIcon, getPriorityColor } from '@/lib/ai-analysis/utils';

interface RecommendationsListProps {
  recommendations: WorkoutRecommendation[];
  expandedRecommendations: Set<string>;
  onToggleRecommendation: (id: string) => void;
}

export function RecommendationsList({
  recommendations,
  expandedRecommendations,
  onToggleRecommendation,
}: RecommendationsListProps) {
  if (recommendations.length === 0) return null;

  const high = recommendations.filter(r => r.priority === 'high');
  const medium = recommendations.filter(r => r.priority === 'medium');
  const low = recommendations.filter(r => r.priority === 'low');

  return (
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
        {high.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-semibold text-destructive">High Priority</h3>
            {high.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                isExpanded={expandedRecommendations.has(rec.id)}
                onToggle={() => onToggleRecommendation(rec.id)}
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
                onToggle={() => onToggleRecommendation(rec.id)}
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
                onToggle={() => onToggleRecommendation(rec.id)}
                getIcon={getRecommendationIcon}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

