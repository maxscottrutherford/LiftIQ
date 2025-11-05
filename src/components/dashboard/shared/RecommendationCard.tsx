import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WorkoutRecommendation } from '@/lib/ai-analysis/types';

interface RecommendationCardProps {
  recommendation: WorkoutRecommendation;
  isExpanded: boolean;
  onToggle: () => void;
  getIcon: (type: WorkoutRecommendation['type']) => React.ReactNode;
  getPriorityColor: (priority: WorkoutRecommendation['priority']) => string;
}

export function RecommendationCard({
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

