import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { normalizeHexColor } from "@/components/handoutbuilder/handoutCanvasUtils";

type ColorPickerProps = {
  value: string;
  onValueChange: (value: string) => void;
  suggestions?: readonly string[];
  history?: readonly string[];
  triggerLabel?: string;
  ariaLabel?: string;
  className?: string;
};

export function ColorPicker({
  value,
  onValueChange,
  suggestions = [],
  history = [],
  triggerLabel,
  ariaLabel = "Selecionar cor",
  className,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const normalizedValue = normalizeHexColor(value) ?? "#000000";
  const [hexInput, setHexInput] = useState(normalizedValue.toUpperCase());

  useEffect(() => {
    const next = normalizeHexColor(value);
    setHexInput((next ?? value).toUpperCase());
  }, [value]);

  const handleHexChange = (next: string) => {
    setHexInput(next.toUpperCase());
    const normalized = normalizeHexColor(next);
    if (normalized) onValueChange(normalized);
  };

  const handleSwatchClick = (next: string) => {
    const normalized = normalizeHexColor(next) ?? next;
    onValueChange(normalized);
  };

  const normalizedValueLower = normalizedValue.toLowerCase();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={["handout-toolbar-color", className].filter(Boolean).join(" ")}
          aria-label={ariaLabel}
          title={ariaLabel}
        >
          {triggerLabel && <span className="handout-toolbar-color-label">{triggerLabel}</span>}
          <span className="handout-toolbar-color-swatch" style={{ backgroundColor: value }} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="handout-color-popover">
        <div className="handout-color-panel">
          <div className="handout-color-row">
            <input
              type="color"
              value={normalizedValue}
              onChange={(e) => handleSwatchClick(e.target.value)}
              className="handout-color-native"
              aria-label="Selecionar cor"
            />
            <Input
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              className="handout-color-hex"
              placeholder="#FFFFFF"
            />
          </div>

          <div className="handout-color-section">
            <div className="handout-color-section-title">Sugestoes</div>
            <div className="handout-color-swatches">
              {suggestions.map((color) => {
                const normalized = (normalizeHexColor(color) ?? color).toLowerCase();
                const isActive = normalized === normalizedValueLower;
                return (
                  <button
                    key={color}
                    type="button"
                    className={`handout-color-swatch ${isActive ? "is-active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleSwatchClick(color)}
                    aria-label={`Cor ${color}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="handout-color-section">
            <div className="handout-color-section-title">Historico</div>
            {history.length === 0 ? (
              <div className="handout-color-empty">Sem historico</div>
            ) : (
              <div className="handout-color-swatches">
                {history.map((color) => {
                  const normalized = (normalizeHexColor(color) ?? color).toLowerCase();
                  const isActive = normalized === normalizedValueLower;
                  return (
                    <button
                      key={color}
                      type="button"
                      className={`handout-color-swatch ${isActive ? "is-active" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleSwatchClick(color)}
                      aria-label={`Cor ${color}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
