import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

export function EmptyState({ title, description, buttonText, onButtonClick }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        <Button onClick={onButtonClick} className="flex items-center space-x-2 mx-auto">
          <Plus className="h-4 w-4" />
          <span>{buttonText}</span>
        </Button>
      </CardContent>
    </Card>
  );
}

