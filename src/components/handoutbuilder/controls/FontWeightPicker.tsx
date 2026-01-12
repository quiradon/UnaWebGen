import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FONT_WEIGHT_OPTIONS } from "@/components/handoutbuilder/handoutCanvasOptions";
import type { FontWeight } from "@/components/handoutbuilder/handoutCanvasTypes";

type FontWeightPickerProps = {
  value: FontWeight;
  onValueChange: (value: FontWeight) => void;
  fontFamily: string;
  options?: ReadonlyArray<{ value: FontWeight; label: string }>;
  disabled?: boolean;
  className?: string;
};

export function FontWeightPicker({
  value,
  onValueChange,
  fontFamily,
  options = FONT_WEIGHT_OPTIONS,
  disabled,
  className,
}: FontWeightPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0] ?? FONT_WEIGHT_OPTIONS[3];
  const triggerClassName = ["handout-toolbar-input", "handout-weight-trigger", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled} className={triggerClassName} aria-expanded={open}>
          <span className="handout-weight-preview" style={{ fontFamily, fontWeight: value }}>
            Aa
          </span>
          <span className="handout-weight-label" style={{ fontFamily, fontWeight: value }}>
            {selected.value} {selected.label}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="handout-weight-popover">
        <div className="handout-weight-panel">
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                className={`handout-weight-option ${isActive ? "is-active" : ""}`}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="handout-weight-label" style={{ fontFamily, fontWeight: option.value }}>
                  {option.value} {option.label}
                </span>
                <span className="handout-weight-preview" style={{ fontFamily, fontWeight: option.value }}>
                  Aa
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
