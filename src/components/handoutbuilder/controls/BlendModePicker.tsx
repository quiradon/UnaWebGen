import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BLEND_MODE_OPTIONS } from "@/components/handoutbuilder/handoutCanvasOptions";
import type { BlendMode } from "@/components/handoutbuilder/handoutCanvasTypes";

type BlendModePickerProps = {
  value: BlendMode;
  onValueChange: (value: BlendMode) => void;
  disabled?: boolean;
  className?: string;
};

export function BlendModePicker({ value, onValueChange, disabled, className }: BlendModePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = BLEND_MODE_OPTIONS.find((option) => option.value === value) ?? BLEND_MODE_OPTIONS[0];
  const triggerClassName = ["handout-toolbar-input", "handout-blend-trigger", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled} className={triggerClassName} aria-expanded={open}>
          <span className="handout-blend-label">{selected.label}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="handout-blend-popover">
        <div className="handout-blend-panel">
          {BLEND_MODE_OPTIONS.map((option) => {
            const isActive = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                className={`handout-blend-option ${isActive ? "is-active" : ""}`}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="handout-blend-label">{option.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
