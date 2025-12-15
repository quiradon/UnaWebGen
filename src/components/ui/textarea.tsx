import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCharCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showCharCount, maxLength, value, ...props }, ref) => {
    const currentLength = String(value || '').length;
    const isNearLimit = maxLength && currentLength > maxLength * 0.8;
    const isOverLimit = maxLength && currentLength > maxLength;
    
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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
Textarea.displayName = "Textarea"

export { Textarea }