import { useRef } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clamp } from "@/components/handoutbuilder/handoutCanvasUtils";

type GradientStopEditorProps = {
  stop1: number;
  stop2: number;
  color1: string;
  color2: string;
  angle: number;
  onStop1Change: (value: number) => void;
  onStop2Change: (value: number) => void;
  onAngleChange?: (value: number) => void;
  mode: "linear" | "radial";
};

export function GradientStopEditor({
  stop1,
  stop2,
  color1,
  color2,
  angle,
  onStop1Change,
  onStop2Change,
  onAngleChange,
  mode,
}: GradientStopEditorProps) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const gradient =
    mode === "linear"
      ? `linear-gradient(${angle}deg, ${color1} ${stop1}%, ${color2} ${stop2}%)`
      : `radial-gradient(circle at center, ${color1} ${stop1}%, ${color2} ${stop2}%)`;

  const updateStop = (which: "start" | "end", clientX: number) => {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    if (!rect.width) return;
    const pct = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const value = Math.round(pct);
    if (which === "start") onStop1Change(value);
    else onStop2Change(value);
  };

  const startDrag = (which: "start" | "end") => (event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    updateStop(which, event.clientX);
    const handleMove = (ev: PointerEvent) => updateStop(which, ev.clientX);
    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
  };

  const handleBarPointerDown = (event: React.PointerEvent) => {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    const pick = Math.abs(pct - stop1) <= Math.abs(pct - stop2) ? "start" : "end";
    updateStop(pick, event.clientX);
    startDrag(pick)(event);
  };

  return (
    <div className="handout-gradient-editor">
      <div
        ref={barRef}
        className="handout-gradient-bar"
        style={{ backgroundImage: gradient }}
        onPointerDown={handleBarPointerDown}
      >
        <button
          type="button"
          className="handout-gradient-handle is-start"
          style={{ left: `${stop1}%`, backgroundColor: color1 }}
          onPointerDown={startDrag("start")}
          aria-label="Stop 1"
        />
        <button
          type="button"
          className="handout-gradient-handle is-end"
          style={{ left: `${stop2}%`, backgroundColor: color2 }}
          onPointerDown={startDrag("end")}
          aria-label="Stop 2"
        />
      </div>
      {mode === "linear" && onAngleChange ? (
        <div className="grid gap-2">
          <Label>Angulo</Label>
          <Input
            type="number"
            min={0}
            max={360}
            value={angle}
            onChange={(event) => {
              const value = clamp(Number(event.target.value), 0, 360);
              onAngleChange(value);
            }}
          />
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Stop 1 (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={stop1}
            onChange={(event) => {
              const value = clamp(Number(event.target.value), 0, 100);
              onStop1Change(value);
            }}
          />
        </div>
        <div className="grid gap-2">
          <Label>Stop 2 (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={stop2}
            onChange={(event) => {
              const value = clamp(Number(event.target.value), 0, 100);
              onStop2Change(value);
            }}
          />
        </div>
      </div>
    </div>
  );
}
