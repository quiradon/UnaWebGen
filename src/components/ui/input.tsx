import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showCharCount?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, showCharCount, maxLength, value, ...props }, ref) => {
    const currentLength = String(value || '').length;
    const isNearLimit = maxLength && currentLength > maxLength * 0.8;
    const isOverLimit = maxLength && currentLength > maxLength;
    
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            isOverLimit && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          ref={ref}
          maxLength={maxLength}
          value={value}
          {...props}
        />
        {showCharCount && maxLength && (
          <div className={cn(
            "text-xs mt-1 text-right",
            isOverLimit ? "text-red-500" : isNearLimit ? "text-yellow-600" : "text-muted-foreground"
          )}>
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }