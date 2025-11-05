import * as React from "react"

import { cn } from "@/lib/utils"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, step, inputMode, ...props }, ref) => {
    // Auto-detect inputMode for better mobile keyboard experience
    const getInputMode = (): string | undefined => {
      // If inputMode is explicitly provided, use it
      if (inputMode) return inputMode;
      
      if (type === 'number') return 'decimal';
      if (type === 'tel') return 'numeric';
      if (type === 'email') return 'email';
      if (type === 'url') return 'url';
      return undefined;
    };

    return (
      <input
        type={type}
        step={step}
        inputMode={getInputMode()}
        className={cn(
          "flex h-11 min-h-[44px] w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
