import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  description: string;
  onBack?: () => void;
}

export function DashboardHeader({ title, description, onBack }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

