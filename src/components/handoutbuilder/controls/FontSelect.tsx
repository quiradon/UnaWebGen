import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FONT_PRESETS } from "@/components/handoutbuilder/handoutCanvasOptions";
import type { FontPresetId } from "@/components/handoutbuilder/handoutCanvasTypes";

type FontSelectProps = {
  value: FontPresetId;
  onValueChange: (value: FontPresetId) => void;
  disabled?: boolean;
  className?: string;
};

export function FontSelect({ value, onValueChange, disabled, className }: FontSelectProps) {
  const selected = FONT_PRESETS[value] ?? FONT_PRESETS.serif;
  const triggerClassName = [className].filter(Boolean).join(" ");

  return (
    <Select value={value} onValueChange={(next) => onValueChange(next as FontPresetId)} disabled={disabled}>
      <SelectTrigger className={triggerClassName} style={{ fontFamily: selected.stack }}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start" position="popper" className="handout-font-select-content">
        {Object.entries(FONT_PRESETS).map(([id, preset]) => (
          <SelectItem key={id} value={id} className="cursor-pointer">
            <span className="truncate" style={{ fontFamily: preset.stack }}>
              {preset.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
