import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NavigationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBgColor: string;
  iconColor?: string;
  onClick: () => void;
}

export function NavigationCard({
  icon: Icon,
  title,
  description,
  iconBgColor,
  iconColor = 'text-primary',
  onClick,
}: NavigationCardProps) {
  return (
    <Card className="cursor-pointer border-2 hover:bg-muted/50 transition-colors">
      <CardContent className="pt-4 md:pt-6">
        <Button
          variant="ghost"
          className="w-full h-full p-4 md:p-8 flex flex-col items-center justify-center space-y-2 md:space-y-4 hover:bg-transparent hover:text-foreground"
          onClick={onClick}
        >
          <div className={`p-2 md:p-4 rounded-full ${iconBgColor}`}>
            <Icon className={`h-8 w-8 md:h-12 md:w-12 ${iconColor}`} />
          </div>
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-semibold mb-1 md:mb-2">
              {title}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}

