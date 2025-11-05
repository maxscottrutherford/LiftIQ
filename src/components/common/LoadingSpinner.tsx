import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({ message = 'Loading...', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`max-w-6xl mx-auto space-y-8 ${className}`}>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}

