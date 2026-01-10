import type { TextAlign } from "@/components/handoutbuilder/handoutCanvasTypes";

export const STORAGE_KEY = "kraken.handoutCanvas.v1";

export const DEFAULT_PAGE_WIDTH = 1000;
export const DEFAULT_PAGE_HEIGHT = 1000;
export const PAGE_SIZE_MIN = 200;
export const PAGE_SIZE_MAX = 5000;
export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 1.25;
export const ZOOM_STEP = 0.05;
export const ZOOM_STEP_LARGE = 0.15;
export const ZOOM_BUTTON_STEP = 0.1;
export const EFFECT_SHADOW_OFFSET_MIN = -200;
export const EFFECT_SHADOW_OFFSET_MAX = 200;
export const EFFECT_SHADOW_BLUR_MIN = 0;
export const EFFECT_SHADOW_BLUR_MAX = 200;
export const EFFECT_SHADOW_SPREAD_MIN = -100;
export const EFFECT_SHADOW_SPREAD_MAX = 100;
export const EFFECT_BLUR_MIN = 0;
export const EFFECT_BLUR_MAX = 40;
export const EFFECT_FILTER_MIN = 0;
export const EFFECT_FILTER_MAX = 200;

export const LEGACY_PAGE_SIZES = {
  a4: { width: 794, height: 1123 },
  letter: { width: 816, height: 1056 },
  note: { width: 1024, height: 768 },
} as const;

export const LEGACY_PAGE_SIZE_IDS = ["a4", "letter", "note"] as const;
export const LEGACY_ORIENTATIONS = ["portrait", "landscape"] as const;

export const TEMPLATE_PREVIEW_MAX = 140;
export const TEMPLATE_PREVIEW_LARGE_MAX = 280;
export const TEXT_ALIGN_LABELS: Record<TextAlign, string> = {
  left: "Esquerda",
  center: "Centro",
  right: "Direita",
};
export const COLOR_HISTORY_KEY = "kraken.handoutColorHistory";
export const COLOR_HISTORY_LIMIT = 12;
export const FILL_PRESET_KEY = "kraken.handoutFillPresets";
export const SNAP_PREF_KEY = "kraken.handoutSnapPrefs";
export const COLOR_SUGGESTIONS = [
  "#111111",
  "#2b1b0e",
  "#ffffff",
  "#f6f0de",
  "#f97316",
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#3b82f6",
  "#8b5cf6",
] as const;
