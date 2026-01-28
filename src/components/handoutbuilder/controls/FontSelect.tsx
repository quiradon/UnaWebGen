import { useEffect, useMemo, useRef, useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FONT_PRESET_LIST, FONT_PRESETS } from "@/components/handoutbuilder/handoutCanvasOptions";
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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    const raf = requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const filteredPresets = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return FONT_PRESET_LIST;
    return FONT_PRESET_LIST.filter((preset) => {
      const haystack = `${preset.label} ${preset.id}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [search]);

  return (
    <Select
      value={value}
      onValueChange={(next) => onValueChange(next as FontPresetId)}
      disabled={disabled}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger className={triggerClassName} style={{ fontFamily: selected.stack }}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start" position="popper" className="handout-font-select-content">
        <div
          className="handout-font-select-search"
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <Input
            ref={searchRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") return;
              event.stopPropagation();
            }}
            placeholder="Buscar fonte"
            className="handout-font-select-input"
          />
        </div>

        {filteredPresets.length ? (
          filteredPresets.map((preset) => (
            <SelectItem key={preset.id} value={preset.id} className="cursor-pointer">
              <span className="truncate" style={{ fontFamily: preset.stack }}>
                {preset.label}
              </span>
            </SelectItem>
          ))
        ) : (
          <div className="handout-font-select-empty">Nenhuma fonte encontrada.</div>
        )}
      </SelectContent>
    </Select>
  );
}
