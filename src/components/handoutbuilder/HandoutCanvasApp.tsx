import { useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Circle,
  Copy,
  Download,
  Eye,
  EyeOff,
  Image as ImageIcon,
  FlipHorizontal2,
  FlipVertical2,
  Blend,
  Bold,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Italic,
  Layers,
  LayoutGrid,
  Lock,
  Minus,
  Plus,
  RotateCcw,
  Square,
  Sparkles,
  Star,
  SlidersHorizontal,
  Trash2,
  Type,
  Triangle,
  Underline,
  Unlock,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { toPng } from "html-to-image";

import { PortalContainerProvider } from "@/components/ui/portal-context";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type FontPresetId =
  | "serif"
  | "sans"
  | "mono"
  | "inter"
  | "roboto"
  | "montserrat"
  | "merriweather"
  | "playfair-display"
  | "cinzel"
  | "im-fell-english"
  | "jetbrains-mono";
type TextAlign = "left" | "center" | "right";
type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity";
type ShapeKind = "rect" | "ellipse" | "triangle" | "diamond" | "hexagon" | "star";
type ShapeFillMode = "solid" | "linear" | "radial" | "image";
type ShapeImageFit = "cover" | "contain";

type ShadowEffect = {
  enabled: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
};

type LayerEffects = {
  dropShadow: ShadowEffect;
  innerShadow: ShadowEffect;
  blur: number;
  brightness: number;
  contrast: number;
  saturate: number;
};

type BaseLayer = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  locked: boolean;
  visible: boolean;
  groupId: string | null;
  clipToId: string | null;
  blendMode: BlendMode;
  effects: LayerEffects;
};

type ImageLayer = BaseLayer & {
  type: "image";
  src: string;
  keepAspectRatio: boolean;
};

type TextLayer = BaseLayer & {
  type: "text";
  text: string;
  fontSize: number;
  color: string;
  align: TextAlign;
  fontPreset: FontPresetId;
  fontWeight: FontWeight;
  italic: boolean;
  underline: boolean;
  backgroundColor: string;
  padding: number;
  fillMode: ShapeFillMode;
  fillColor: string;
  fillColor2: string;
  fillStop1: number;
  fillStop2: number;
  gradientAngle: number;
  imageSrc: string;
  imageFit: ShapeImageFit;
  letterSpacing: number;
  lineHeight: number;
  strokeColor: string;
  strokeWidth: number;
};

type ShapeLayer = BaseLayer & {
  type: "shape";
  shape: ShapeKind;
  cornerRadius: number;
  fillMode: ShapeFillMode;
  fillColor: string;
  fillColor2: string;
  fillStop1: number;
  fillStop2: number;
  gradientAngle: number;
  imageSrc: string;
  imageFit: ShapeImageFit;
};

type Layer = ImageLayer | TextLayer | ShapeLayer;

type HandoutCanvasDocV1 = {
  version: 1;
  pageWidth: number;
  pageHeight: number;
  zoom: number;
  paperColor: string;
  paperOpacity: number;
  layers: Layer[];
};

type CSSVars = React.CSSProperties & Record<`--${string}`, string>;

type FillPreset = {
  id: string;
  label: string;
  mode: ShapeFillMode;
  color1: string;
  color2: string;
  stop1: number;
  stop2: number;
  angle: number;
  imageSrc: string;
  imageFit: ShapeImageFit;
};

type AssetItem = {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
};

type SnapGuide = {
  axis: "x" | "y";
  value: number;
};

const STORAGE_KEY = "kraken.handoutCanvas.v1";

const DEFAULT_PAGE_WIDTH = 1000;
const DEFAULT_PAGE_HEIGHT = 1000;
const PAGE_SIZE_MIN = 200;
const PAGE_SIZE_MAX = 5000;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.25;
const ZOOM_STEP = 0.05;
const ZOOM_STEP_LARGE = 0.15;
const ZOOM_BUTTON_STEP = 0.1;
const EFFECT_SHADOW_OFFSET_MIN = -200;
const EFFECT_SHADOW_OFFSET_MAX = 200;
const EFFECT_SHADOW_BLUR_MIN = 0;
const EFFECT_SHADOW_BLUR_MAX = 200;
const EFFECT_SHADOW_SPREAD_MIN = -100;
const EFFECT_SHADOW_SPREAD_MAX = 100;
const EFFECT_BLUR_MIN = 0;
const EFFECT_BLUR_MAX = 40;
const EFFECT_FILTER_MIN = 0;
const EFFECT_FILTER_MAX = 200;

const LEGACY_PAGE_SIZES = {
  a4: { width: 794, height: 1123 },
  letter: { width: 816, height: 1056 },
  note: { width: 1024, height: 768 },
} as const;

const LEGACY_PAGE_SIZE_IDS = ["a4", "letter", "note"] as const;
const LEGACY_ORIENTATIONS = ["portrait", "landscape"] as const;

const FONT_PRESETS: Record<FontPresetId, { label: string; stack: string }> = {
  serif: { label: "Serif (Sistema)", stack: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' },
  sans: {
    label: "Sans (Sistema)",
    stack: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  },
  mono: {
    label: "Mono (Sistema)",
    stack:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  inter: { label: "Inter", stack: 'Inter, ui-sans-serif, system-ui, "Segoe UI", Roboto, Arial, sans-serif' },
  roboto: { label: "Roboto", stack: 'Roboto, ui-sans-serif, system-ui, "Segoe UI", Arial, sans-serif' },
  montserrat: {
    label: "Montserrat",
    stack: 'Montserrat, ui-sans-serif, system-ui, "Segoe UI", Roboto, Arial, sans-serif',
  },
  merriweather: {
    label: "Merriweather",
    stack: 'Merriweather, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  "playfair-display": {
    label: "Playfair Display",
    stack: 'Playfair Display, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  cinzel: { label: "Cinzel", stack: 'Cinzel, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' },
  "im-fell-english": {
    label: "IM Fell English",
    stack: 'IM Fell English, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  "jetbrains-mono": {
    label: "JetBrains Mono",
    stack:
      'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
};

const FONT_PRESET_IDS = Object.keys(FONT_PRESETS) as FontPresetId[];
const DEFAULT_FONT_PRESET: FontPresetId = "serif";
const FONT_WEIGHT_VALUES = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const FONT_WEIGHT_OPTIONS: ReadonlyArray<{ value: FontWeight; label: string }> = [
  { value: 100, label: "Thin" },
  { value: 200, label: "Extra Light" },
  { value: 300, label: "Light" },
  { value: 400, label: "Regular" },
  { value: 500, label: "Medium" },
  { value: 600, label: "Semi Bold" },
  { value: 700, label: "Bold" },
  { value: 800, label: "Extra Bold" },
  { value: 900, label: "Black" },
] as const;
const BLEND_MODE_OPTIONS: ReadonlyArray<{ value: BlendMode; label: string }> = [
  { value: "normal", label: "Normal" },
  { value: "multiply", label: "Multiply" },
  { value: "screen", label: "Screen" },
  { value: "overlay", label: "Overlay" },
  { value: "darken", label: "Darken" },
  { value: "lighten", label: "Lighten" },
  { value: "color-dodge", label: "Color Dodge" },
  { value: "color-burn", label: "Color Burn" },
  { value: "hard-light", label: "Hard Light" },
  { value: "soft-light", label: "Soft Light" },
  { value: "difference", label: "Difference" },
  { value: "exclusion", label: "Exclusion" },
  { value: "hue", label: "Hue" },
  { value: "saturation", label: "Saturation" },
  { value: "color", label: "Color" },
  { value: "luminosity", label: "Luminosity" },
] as const;
const BLEND_MODE_VALUES = BLEND_MODE_OPTIONS.map((option) => option.value) as BlendMode[];
const SHAPE_KINDS = ["rect", "ellipse", "triangle", "diamond", "hexagon", "star"] as const;
const SHAPE_KIND_VALUES = [...SHAPE_KINDS] as ShapeKind[];
const SHAPE_KIND_LABELS: Record<ShapeKind, string> = {
  rect: "Retângulo",
  ellipse: "Círculo",
  triangle: "Triângulo",
  diamond: "Diamante",
  hexagon: "Hexágono",
  star: "Estrela",
};
const SHAPE_FILL_MODES = ["solid", "linear", "radial", "image"] as const;
const SHAPE_FILL_MODE_VALUES = [...SHAPE_FILL_MODES] as ShapeFillMode[];
const SHAPE_FILL_MODE_LABELS: Record<ShapeFillMode, string> = {
  solid: "Cor sólida",
  linear: "Gradiente linear",
  radial: "Gradiente radial",
  image: "Imagem",
};
const SHAPE_IMAGE_FITS = ["cover", "contain"] as const;
const SHAPE_IMAGE_FIT_VALUES = [...SHAPE_IMAGE_FITS] as ShapeImageFit[];
const SHAPE_IMAGE_FIT_LABELS: Record<ShapeImageFit, string> = {
  cover: "Cobrir",
  contain: "Conter",
};
const TEXT_ALIGN_LABELS: Record<TextAlign, string> = {
  left: "Esquerda",
  center: "Centro",
  right: "Direita",
};
const COLOR_HISTORY_KEY = "kraken.handoutColorHistory";
const COLOR_HISTORY_LIMIT = 12;
const FILL_PRESET_KEY = "kraken.handoutFillPresets";
const ASSET_LIBRARY_KEY = "kraken.handoutAssetLibrary";
const SNAP_PREF_KEY = "kraken.handoutSnapPrefs";
const COLOR_SUGGESTIONS = [
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

const GRADIENT_PRESETS = [
  { id: "sunset", label: "Sunset", angle: 45, color1: "#f97316", color2: "#f43f5e" },
  { id: "ocean", label: "Ocean", angle: 90, color1: "#0ea5e9", color2: "#22d3ee" },
  { id: "forest", label: "Forest", angle: 135, color1: "#22c55e", color2: "#16a34a" },
  { id: "night", label: "Night", angle: 120, color1: "#312e81", color2: "#0f172a" },
] as const;

const DEFAULT_DROP_SHADOW: ShadowEffect = {
  enabled: false,
  x: 0,
  y: 18,
  blur: 30,
  spread: 0,
  color: "#000000",
  opacity: 0.35,
};

const DEFAULT_INNER_SHADOW: ShadowEffect = {
  enabled: false,
  x: 0,
  y: 4,
  blur: 12,
  spread: 0,
  color: "#000000",
  opacity: 0.35,
};
const DEFAULT_SHAPE_FILL_COLOR = "#f97316";
const DEFAULT_SHAPE_FILL_COLOR_2 = "#fde68a";
const DEFAULT_FILL_STOP_1 = 0;
const DEFAULT_FILL_STOP_2 = 100;
const DEFAULT_TEXT_FILL_COLOR = "#2b1b0e";
const DEFAULT_TEXT_STROKE_COLOR = "#000000";

function createDefaultEffects(): LayerEffects {
  return {
    dropShadow: { ...DEFAULT_DROP_SHADOW },
    innerShadow: { ...DEFAULT_INNER_SHADOW },
    blur: 0,
    brightness: 100,
    contrast: 100,
    saturate: 100,
  };
}

const DEFAULT_DOC: HandoutCanvasDocV1 = {
  version: 1,
  pageWidth: DEFAULT_PAGE_WIDTH,
  pageHeight: DEFAULT_PAGE_HEIGHT,
  zoom: 0.9,
  paperColor: "#f6f0de",
  paperOpacity: 1,
  layers: [
    {
      id: "txt_title",
      type: "text",
      name: "Título",
      x: 72,
      y: 72,
      width: 650,
      height: 120,
      opacity: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      locked: false,
      visible: true,
      groupId: null,
      clipToId: null,
      blendMode: "normal",
      effects: createDefaultEffects(),
      text: "Handout",
      fontSize: 54,
      color: "#2b1b0e",
      align: "left",
      fontPreset: DEFAULT_FONT_PRESET,
      fontWeight: 800,
      italic: false,
      underline: false,
      backgroundColor: "transparent",
      padding: 0,
      fillMode: "solid",
      fillColor: "#2b1b0e",
      fillColor2: DEFAULT_SHAPE_FILL_COLOR_2,
      fillStop1: DEFAULT_FILL_STOP_1,
      fillStop2: DEFAULT_FILL_STOP_2,
      gradientAngle: 45,
      imageSrc: "",
      imageFit: "cover",
      letterSpacing: 0,
      lineHeight: 1.2,
      strokeColor: DEFAULT_TEXT_STROKE_COLOR,
      strokeWidth: 0,
    },
    {
      id: "txt_body",
      type: "text",
      name: "Texto",
      x: 72,
      y: 220,
      width: 650,
      height: 320,
      opacity: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      locked: false,
      visible: true,
      groupId: null,
      clipToId: null,
      blendMode: "normal",
      effects: createDefaultEffects(),
      text:
        "Funciona como um mini-Canva:\\n\\n- Adicione imagens em camadas\\n- Crie vários textos\\n- Arraste e redimensione\\n- Reordene as camadas no painel",
      fontSize: 18,
      color: "#2b1b0e",
      align: "left",
      fontPreset: DEFAULT_FONT_PRESET,
      fontWeight: 400,
      italic: false,
      underline: false,
      backgroundColor: "transparent",
      padding: 0,
      fillMode: "solid",
      fillColor: "#2b1b0e",
      fillColor2: DEFAULT_SHAPE_FILL_COLOR_2,
      fillStop1: DEFAULT_FILL_STOP_1,
      fillStop2: DEFAULT_FILL_STOP_2,
      gradientAngle: 45,
      imageSrc: "",
      imageFit: "cover",
      letterSpacing: 0,
      lineHeight: 1.2,
      strokeColor: DEFAULT_TEXT_STROKE_COLOR,
      strokeWidth: 0,
    },
  ],
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T) {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function safeNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function safeString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function safeBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function safeArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeFontWeight(value: unknown, fallback: FontWeight) {
  if (typeof value === "number" && (FONT_WEIGHT_VALUES as readonly number[]).includes(value)) {
    return value as FontWeight;
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && (FONT_WEIGHT_VALUES as readonly number[]).includes(parsed)) {
      return parsed as FontWeight;
    }
  }
  return fallback;
}

function getClosestWeight(weights: readonly FontWeight[], target: FontWeight) {
  if (!weights.length) return target;
  return weights.reduce((closest, weight) => {
    const currentDiff = Math.abs(weight - target);
    const closestDiff = Math.abs(closest - target);
    if (currentDiff < closestDiff) return weight;
    if (currentDiff === closestDiff && weight > closest) return weight;
    return closest;
  }, weights[0]);
}

function getRegularWeight(weights: readonly FontWeight[]) {
  if (weights.includes(400)) return 400;
  return getClosestWeight(weights, 400);
}

function getBoldWeight(weights: readonly FontWeight[]) {
  const bolds = weights.filter((weight) => weight >= 600);
  if (bolds.length) return bolds.includes(700) ? 700 : bolds[bolds.length - 1];
  return getClosestWeight(weights, 700);
}

function normalizeHexColor(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  const raw = withHash.slice(1);
  const isShort = /^[0-9a-f]{3}$/.test(raw);
  const isFull = /^[0-9a-f]{6}$/.test(raw);
  if (!isShort && !isFull) return null;
  const full = isShort
    ? raw
        .split("")
        .map((c) => c + c)
        .join("")
    : raw;
  return `#${full}`;
}

function hexToRgb(value: string) {
  const hex = value.trim();
  if (!hex.startsWith("#")) return null;
  const raw = hex.slice(1);
  const normalized =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  if (normalized.length !== 6) return null;
  const int = Number.parseInt(normalized, 16);
  if (Number.isNaN(int)) return null;
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function applyAlphaToColor(color: string, opacity: number) {
  const clamped = clamp(opacity, 0, 1);
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamped})`;
}

function toSvgColor(color: string) {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function buildShadowValue(shadow: ShadowEffect, inset: boolean) {
  if (!shadow.enabled) return null;
  const color = applyAlphaToColor(shadow.color, shadow.opacity);
  const prefix = inset ? "inset " : "";
  return `${prefix}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${color}`;
}

function buildDropShadowFilter(shadow: ShadowEffect) {
  if (!shadow.enabled) return null;
  const color = applyAlphaToColor(shadow.color, shadow.opacity);
  const blur = Math.max(0, shadow.blur + shadow.spread);
  return `drop-shadow(${shadow.x}px ${shadow.y}px ${blur}px ${color})`;
}

function getImageEffectStyle(effects: LayerEffects) {
  const filters: string[] = [];
  const dropShadow = buildDropShadowFilter(effects.dropShadow);
  if (dropShadow) filters.push(dropShadow);
  if (effects.blur > 0) filters.push(`blur(${effects.blur}px)`);
  if (effects.brightness !== 100) filters.push(`brightness(${effects.brightness}%)`);
  if (effects.contrast !== 100) filters.push(`contrast(${effects.contrast}%)`);
  if (effects.saturate !== 100) filters.push(`saturate(${effects.saturate}%)`);
  const filter = filters.length ? filters.join(" ") : "none";

  return { filter };
}

function getTextEffectStyle(effects: LayerEffects) {
  const filters: string[] = [];
  const dropShadow = buildDropShadowFilter(effects.dropShadow);
  if (dropShadow) filters.push(dropShadow);
  if (effects.blur > 0) filters.push(`blur(${effects.blur}px)`);
  if (effects.brightness !== 100) filters.push(`brightness(${effects.brightness}%)`);
  if (effects.contrast !== 100) filters.push(`contrast(${effects.contrast}%)`);
  if (effects.saturate !== 100) filters.push(`saturate(${effects.saturate}%)`);
  const filter = filters.length ? filters.join(" ") : "none";

  return { filter };
}

function getLayerEffectStyle(effects: LayerEffects) {
  const shadows = [
    buildShadowValue(effects.dropShadow, false),
    buildShadowValue(effects.innerShadow, true),
  ].filter((value): value is string => Boolean(value));
  const boxShadow = shadows.length ? shadows.join(", ") : "none";

  const filters: string[] = [];
  if (effects.blur > 0) filters.push(`blur(${effects.blur}px)`);
  if (effects.brightness !== 100) filters.push(`brightness(${effects.brightness}%)`);
  if (effects.contrast !== 100) filters.push(`contrast(${effects.contrast}%)`);
  if (effects.saturate !== 100) filters.push(`saturate(${effects.saturate}%)`);
  const filter = filters.length ? filters.join(" ") : "none";

  return { boxShadow, filter };
}

function getImagePreserveAspectRatio(fit: ShapeImageFit) {
  return fit === "cover" ? "xMidYMid slice" : "xMidYMid meet";
}

function getSortedStops(stop1: number, stop2: number) {
  const first = clamp(stop1, 0, 100);
  const second = clamp(stop2, 0, 100);
  return first <= second ? [first, second] : [second, first];
}

function getShapeFill(layer: ShapeLayer, idBase: string) {
  const primary = layer.fillColor || DEFAULT_SHAPE_FILL_COLOR;
  const secondary = layer.fillColor2 || primary;
  const [stop1, stop2] = getSortedStops(layer.fillStop1, layer.fillStop2);
  if (layer.fillMode === "solid") {
    return { fill: primary, defs: null };
  }
  if (layer.fillMode === "linear") {
    const gradientId = `${idBase}-linear`;
    const defs = (
      <linearGradient
        id={gradientId}
        x1="0"
        y1="0"
        x2="100"
        y2="0"
        gradientUnits="userSpaceOnUse"
        gradientTransform={`rotate(${layer.gradientAngle} 50 50)`}
      >
        <stop offset={`${stop1}%`} stopColor={primary} />
        <stop offset={`${stop2}%`} stopColor={secondary} />
      </linearGradient>
    );
    return { fill: `url(#${gradientId})`, defs };
  }
  if (layer.fillMode === "radial") {
    const gradientId = `${idBase}-radial`;
    const defs = (
      <radialGradient id={gradientId} cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
        <stop offset={`${stop1}%`} stopColor={primary} />
        <stop offset={`${stop2}%`} stopColor={secondary} />
      </radialGradient>
    );
    return { fill: `url(#${gradientId})`, defs };
  }

  if (!layer.imageSrc) {
    return { fill: primary, defs: null };
  }

  const patternId = `${idBase}-pattern`;
  const defs = (
    <pattern id={patternId} patternUnits="userSpaceOnUse" width="100" height="100">
      <image
        href={layer.imageSrc}
        x="0"
        y="0"
        width="100"
        height="100"
        preserveAspectRatio={getImagePreserveAspectRatio(layer.imageFit)}
      />
    </pattern>
  );
  return { fill: `url(#${patternId})`, defs };
}

function getTextFillStyle(layer: TextLayer) {
  const primary = layer.fillColor || layer.color || DEFAULT_TEXT_FILL_COLOR;
  const secondary = layer.fillColor2 || primary;
  const [stop1, stop2] = getSortedStops(layer.fillStop1, layer.fillStop2);
  const baseStyle: React.CSSProperties = {
    color: primary,
    WebkitTextStroke: layer.strokeWidth > 0 ? `${layer.strokeWidth}px ${layer.strokeColor}` : undefined,
  };

  if (layer.fillMode === "solid") {
    return baseStyle;
  }

  if (layer.fillMode === "image") {
    if (!layer.imageSrc) return baseStyle;
    return {
      ...baseStyle,
      backgroundImage: `url(${layer.imageSrc})`,
      backgroundSize: layer.imageFit === "cover" ? "cover" : "contain",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
    };
  }

  const gradient =
    layer.fillMode === "linear"
      ? `linear-gradient(${layer.gradientAngle}deg, ${primary} ${stop1}%, ${secondary} ${stop2}%)`
      : `radial-gradient(circle at center, ${primary} ${stop1}%, ${secondary} ${stop2}%)`;

  return {
    ...baseStyle,
    backgroundImage: gradient,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildShapeMaskSvg(layer: ShapeLayer) {
  const radius = clamp(layer.cornerRadius, 0, 50);
  let shapeMarkup = "";
  switch (layer.shape) {
    case "rect":
      shapeMarkup = `<rect x=\"0\" y=\"0\" width=\"100\" height=\"100\" rx=\"${radius}\" ry=\"${radius}\" fill=\"white\" />`;
      break;
    case "ellipse":
      shapeMarkup = `<ellipse cx=\"50\" cy=\"50\" rx=\"50\" ry=\"50\" fill=\"white\" />`;
      break;
    case "triangle":
      shapeMarkup = `<path d=\"M50 6 L96 94 L4 94 Z\" fill=\"white\" />`;
      break;
    case "diamond":
      shapeMarkup = `<path d=\"M50 4 L96 50 L50 96 L4 50 Z\" fill=\"white\" />`;
      break;
    case "hexagon":
      shapeMarkup = `<path d=\"M24 6 L76 6 L96 50 L76 94 L24 94 L4 50 Z\" fill=\"white\" />`;
      break;
    case "star":
      shapeMarkup = `<path d=\"M50 6 L62 38 L96 38 L68 58 L78 92 L50 72 L22 92 L32 58 L4 38 L38 38 Z\" fill=\"white\" />`;
      break;
    default:
      shapeMarkup = `<rect x=\"0\" y=\"0\" width=\"100\" height=\"100\" fill=\"white\" />`;
  }
  return `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${layer.width}\" height=\"${layer.height}\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"none\">${shapeMarkup}</svg>`;
}

function buildTextMaskSvg(layer: TextLayer) {
  const fontFamily = FONT_PRESETS[layer.fontPreset].stack;
  const fontStyle = layer.italic ? "italic" : "normal";
  const fontWeight = layer.fontWeight;
  const lineHeight = layer.lineHeight || 1.2;
  const lines = layer.text.split("\\n");
  const padding = layer.padding || 0;
  const innerWidth = Math.max(1, layer.width - padding * 2);
  const anchor = layer.align === "center" ? "middle" : layer.align === "right" ? "end" : "start";
  const x =
    layer.align === "center"
      ? padding + innerWidth / 2
      : layer.align === "right"
        ? padding + innerWidth
        : padding;
  const startY = padding + layer.fontSize;
  const lineGap = layer.fontSize * lineHeight;
  const tspans = lines
    .map((line, index) => {
      const y = startY + index * lineGap;
      return `<tspan x=\"${x}\" y=\"${y}\">${escapeSvgText(line || " ")}</tspan>`;
    })
    .join("");
  return `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${layer.width}\" height=\"${layer.height}\" viewBox=\"0 0 ${layer.width} ${layer.height}\"><text fill=\"white\" font-family=\"${escapeSvgText(
    fontFamily,
  )}\" font-size=\"${layer.fontSize}\" font-weight=\"${fontWeight}\" font-style=\"${fontStyle}\" text-anchor=\"${anchor}\" letter-spacing=\"${layer.letterSpacing}\">${tspans}</text></svg>`;
}

function buildMaskDataUrl(layer: ShapeLayer | TextLayer) {
  const svg = layer.type === "shape" ? buildShapeMaskSvg(layer) : buildTextMaskSvg(layer);
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml;utf8,${encoded}`;
}

function getClipMaskStyle(layer: Layer, maskLayer: ShapeLayer | TextLayer) {
  const maskUrl = buildMaskDataUrl(maskLayer);
  const offsetX = maskLayer.x - layer.x;
  const offsetY = maskLayer.y - layer.y;
  const size = `${maskLayer.width}px ${maskLayer.height}px`;
  return {
    WebkitMaskImage: `url(\"${maskUrl}\")`,
    maskImage: `url(\"${maskUrl}\")`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: size,
    maskSize: size,
    WebkitMaskPosition: `${offsetX}px ${offsetY}px`,
    maskPosition: `${offsetX}px ${offsetY}px`,
  } as React.CSSProperties;
}

function renderShapeElement(
  kind: ShapeKind,
  cornerRadius: number,
  props: { className?: string; fill?: string; filterId?: string | null; style?: React.CSSProperties },
) {
  const radius = clamp(cornerRadius, 0, 50);
  const { className, fill = "currentColor", filterId, style } = props;
  const filter = filterId ? `url(#${filterId})` : undefined;

  switch (kind) {
    case "rect":
      return (
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          rx={radius}
          ry={radius}
          className={className}
          fill={fill}
          style={style}
          filter={filter}
        />
      );
    case "ellipse":
      return (
        <ellipse
          cx="50"
          cy="50"
          rx="50"
          ry="50"
          className={className}
          fill={fill}
          style={style}
          filter={filter}
        />
      );
    case "triangle":
      return (
        <path
          d="M50 6 L96 94 L4 94 Z"
          className={className}
          fill={fill}
          style={style}
          filter={filter}
        />
      );
    case "diamond":
      return (
        <path
          d="M50 4 L96 50 L50 96 L4 50 Z"
          className={className}
          fill={fill}
          style={style}
          filter={filter}
        />
      );
    case "hexagon":
      return (
        <path
          d="M24 6 L76 6 L96 50 L76 94 L24 94 L4 50 Z"
          className={className}
          fill={fill}
          style={style}
          filter={filter}
        />
      );
    case "star":
      return (
        <path
          d="M50 6 L62 38 L96 38 L68 58 L78 92 L50 72 L22 92 L32 58 L4 38 L38 38 Z"
          className={className}
          fill={fill}
          style={style}
          filter={filter}
        />
      );
    default:
      return null;
  }
}

function renderInnerShadowFilter(id: string, shadow: ShadowEffect) {
  if (!shadow.enabled || shadow.opacity <= 0) return null;
  const spreadRadius = Math.max(0, Math.abs(shadow.spread));
  const spreadOperator = shadow.spread >= 0 ? "dilate" : "erode";
  const blur = Math.max(0, shadow.blur);
  const color = toSvgColor(shadow.color);
  const opacity = clamp(shadow.opacity, 0, 1);

  return (
    <svg className="handout-layer-filter" aria-hidden="true" focusable="false">
      <filter
        id={id}
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
        filterUnits="objectBoundingBox"
        primitiveUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feMorphology in="SourceAlpha" operator={spreadOperator} radius={spreadRadius} result="spread" />
        <feOffset in="spread" dx={shadow.x} dy={shadow.y} result="offset" />
        <feGaussianBlur in="offset" stdDeviation={blur} result="blur" />
        <feComposite in="blur" in2="spread" operator="arithmetic" k2="-1" k3="1" result="innerShadow" />
        <feFlood floodColor={color} floodOpacity={opacity} result="shadowColor" />
        <feComposite in="shadowColor" in2="innerShadow" operator="in" result="shadow" />
      </filter>
    </svg>
  );
}

function normalizeShadowEffect(raw: unknown, fallback: ShadowEffect): ShadowEffect {
  if (!isObject(raw)) return { ...fallback };
  return {
    enabled: safeBoolean(raw.enabled, fallback.enabled),
    x: clamp(safeNumber(raw.x, fallback.x), EFFECT_SHADOW_OFFSET_MIN, EFFECT_SHADOW_OFFSET_MAX),
    y: clamp(safeNumber(raw.y, fallback.y), EFFECT_SHADOW_OFFSET_MIN, EFFECT_SHADOW_OFFSET_MAX),
    blur: clamp(safeNumber(raw.blur, fallback.blur), EFFECT_SHADOW_BLUR_MIN, EFFECT_SHADOW_BLUR_MAX),
    spread: clamp(safeNumber(raw.spread, fallback.spread), EFFECT_SHADOW_SPREAD_MIN, EFFECT_SHADOW_SPREAD_MAX),
    color: safeString(raw.color, fallback.color),
    opacity: clamp(safeNumber(raw.opacity, fallback.opacity), 0, 1),
  };
}

function normalizeEffects(raw: unknown): LayerEffects {
  const fallback = createDefaultEffects();
  if (!isObject(raw)) return fallback;
  return {
    dropShadow: normalizeShadowEffect(raw.dropShadow, fallback.dropShadow),
    innerShadow: normalizeShadowEffect(raw.innerShadow, fallback.innerShadow),
    blur: clamp(safeNumber(raw.blur, fallback.blur), EFFECT_BLUR_MIN, EFFECT_BLUR_MAX),
    brightness: clamp(safeNumber(raw.brightness, fallback.brightness), EFFECT_FILTER_MIN, EFFECT_FILTER_MAX),
    contrast: clamp(safeNumber(raw.contrast, fallback.contrast), EFFECT_FILTER_MIN, EFFECT_FILTER_MAX),
    saturate: clamp(safeNumber(raw.saturate, fallback.saturate), EFFECT_FILTER_MIN, EFFECT_FILTER_MAX),
  };
}

type FontPickerProps = {
  value: FontPresetId;
  onValueChange: (value: FontPresetId) => void;
  disabled?: boolean;
  className?: string;
};

function FontPicker({ value, onValueChange, disabled, className }: FontPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = FONT_PRESETS[value] ?? FONT_PRESETS.serif;
  const triggerClassName = ["w-full justify-between gap-2", className].filter(Boolean).join(" ");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={triggerClassName}
        >
          <span className="truncate" style={{ fontFamily: selected.stack }}>
            {selected.label}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[320px] p-0">
        <Command>
          <CommandInput placeholder="Buscar fonte..." />
          <CommandList>
            <CommandEmpty>Nenhuma fonte encontrada.</CommandEmpty>
            <CommandGroup>
              {Object.entries(FONT_PRESETS).map(([id, preset]) => (
                <CommandItem
                  key={id}
                  value={`${preset.label} ${id}`}
                  className="cursor-pointer"
                  onMouseDown={(e) => {
                    if (e.button !== 0) return;
                    e.preventDefault();
                    onValueChange(id as FontPresetId);
                    setOpen(false);
                  }}
                  onSelect={() => {
                    onValueChange(id as FontPresetId);
                    setOpen(false);
                  }}
                >
                  <Check className={`mr-2 h-4 w-4 ${value === id ? "opacity-100" : "opacity-0"}`} />
                  <span className="truncate" style={{ fontFamily: preset.stack }}>
                    {preset.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

type FontWeightPickerProps = {
  value: FontWeight;
  onValueChange: (value: FontWeight) => void;
  fontFamily: string;
  options?: ReadonlyArray<{ value: FontWeight; label: string }>;
  disabled?: boolean;
  className?: string;
};

function FontWeightPicker({
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

type BlendModePickerProps = {
  value: BlendMode;
  onValueChange: (value: BlendMode) => void;
  disabled?: boolean;
  className?: string;
};

function BlendModePicker({ value, onValueChange, disabled, className }: BlendModePickerProps) {
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

type ColorPickerProps = {
  value: string;
  onValueChange: (value: string) => void;
  suggestions?: readonly string[];
  history?: readonly string[];
  triggerLabel?: string;
  ariaLabel?: string;
  className?: string;
};

function ColorPicker({
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

function GradientStopEditor({
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

function normalizeLayer(raw: unknown): Layer | null {
  if (!isObject(raw)) return null;
  const type = raw.type;
  if (type !== "image" && type !== "text" && type !== "shape") return null;

  const base: BaseLayer = {
    id: safeString(raw.id, ""),
    name: safeString(raw.name, "Camada"),
    x: safeNumber(raw.x, 0),
    y: safeNumber(raw.y, 0),
    width: Math.max(20, safeNumber(raw.width, 200)),
    height: Math.max(20, safeNumber(raw.height, 120)),
    opacity: clamp(safeNumber(raw.opacity, 1), 0, 1),
    rotation: clamp(safeNumber(raw.rotation, 0), -360, 360),
    flipX: safeBoolean(raw.flipX, false),
    flipY: safeBoolean(raw.flipY, false),
    locked: safeBoolean(raw.locked, false),
    visible: safeBoolean(raw.visible, true),
    groupId: safeString(raw.groupId, "") || null,
    clipToId: safeString(raw.clipToId, "") || null,
    blendMode: safeEnum(raw.blendMode, BLEND_MODE_VALUES, "normal"),
    effects: normalizeEffects(raw.effects),
  };

  if (!base.id) return null;

  if (type === "image") {
    const src = safeString(raw.src, "");
    if (!src) return null;

    const keepAspectRatio = safeBoolean(raw.keepAspectRatio, true);
    const layer: ImageLayer = {
      ...base,
      type: "image",
      src,
      keepAspectRatio,
    };
    return layer;
  }

  if (type === "shape") {
    const layer: ShapeLayer = {
      ...base,
      type: "shape",
      shape: safeEnum(raw.shape, SHAPE_KIND_VALUES, "rect"),
      cornerRadius: clamp(safeNumber(raw.cornerRadius, 12), 0, 50),
      fillMode: safeEnum(raw.fillMode, SHAPE_FILL_MODE_VALUES, "solid"),
      fillColor: safeString(raw.fillColor, DEFAULT_SHAPE_FILL_COLOR),
      fillColor2: safeString(raw.fillColor2, DEFAULT_SHAPE_FILL_COLOR_2),
      fillStop1: clamp(safeNumber(raw.fillStop1, DEFAULT_FILL_STOP_1), 0, 100),
      fillStop2: clamp(safeNumber(raw.fillStop2, DEFAULT_FILL_STOP_2), 0, 100),
      gradientAngle: clamp(safeNumber(raw.gradientAngle, 45), 0, 360),
      imageSrc: safeString(raw.imageSrc, ""),
      imageFit: safeEnum(raw.imageFit, SHAPE_IMAGE_FIT_VALUES, "cover"),
    };
    return layer;
  }

  const textColor = safeString(raw.color, DEFAULT_TEXT_FILL_COLOR);
  const textFillColor = safeString(raw.fillColor, textColor);
  const textFillColor2 = safeString(raw.fillColor2, textFillColor);
  const layer: TextLayer = {
    ...base,
    type: "text",
    text: safeString(raw.text, ""),
    fontSize: clamp(safeNumber(raw.fontSize, 18), 8, 180),
    color: textFillColor,
    align: safeEnum(raw.align, ["left", "center", "right"] as const, "left"),
    fontPreset: safeEnum(raw.fontPreset, FONT_PRESET_IDS, DEFAULT_FONT_PRESET),
    fontWeight: normalizeFontWeight(raw.fontWeight, 400),
    italic: safeBoolean(raw.italic, false),
    underline: safeBoolean(raw.underline, false),
    backgroundColor: safeString(raw.backgroundColor, "transparent"),
    padding: clamp(safeNumber(raw.padding, 0), 0, 64),
    fillMode: safeEnum(raw.fillMode, SHAPE_FILL_MODE_VALUES, "solid"),
    fillColor: textFillColor,
    fillColor2: textFillColor2,
    fillStop1: clamp(safeNumber(raw.fillStop1, DEFAULT_FILL_STOP_1), 0, 100),
    fillStop2: clamp(safeNumber(raw.fillStop2, DEFAULT_FILL_STOP_2), 0, 100),
    gradientAngle: clamp(safeNumber(raw.gradientAngle, 45), 0, 360),
    imageSrc: safeString(raw.imageSrc, ""),
    imageFit: safeEnum(raw.imageFit, SHAPE_IMAGE_FIT_VALUES, "cover"),
    letterSpacing: clamp(safeNumber(raw.letterSpacing, 0), -5, 20),
    lineHeight: clamp(safeNumber(raw.lineHeight, 1.2), 0.6, 3),
    strokeColor: safeString(raw.strokeColor, DEFAULT_TEXT_STROKE_COLOR),
    strokeWidth: clamp(safeNumber(raw.strokeWidth, 0), 0, 12),
  };
  return layer;
}

function normalizeDocV1(raw: unknown): HandoutCanvasDocV1 | null {
  if (!isObject(raw)) return null;
  if (raw.version !== 1) return null;

  const legacyPageSize = safeEnum(raw.pageSize, LEGACY_PAGE_SIZE_IDS, "a4");
  const legacyOrientation = safeEnum(raw.orientation, LEGACY_ORIENTATIONS, "portrait");
  const legacyPreset = LEGACY_PAGE_SIZES[legacyPageSize];
  const legacyWidth = legacyOrientation === "portrait" ? legacyPreset.width : legacyPreset.height;
  const legacyHeight = legacyOrientation === "portrait" ? legacyPreset.height : legacyPreset.width;
  const pageWidth = clamp(safeNumber(raw.pageWidth, legacyWidth), PAGE_SIZE_MIN, PAGE_SIZE_MAX);
  const pageHeight = clamp(safeNumber(raw.pageHeight, legacyHeight), PAGE_SIZE_MIN, PAGE_SIZE_MAX);
  const zoom = clamp(safeNumber(raw.zoom, DEFAULT_DOC.zoom), ZOOM_MIN, ZOOM_MAX);
  const paperColor = safeString(raw.paperColor, DEFAULT_DOC.paperColor);
  const paperOpacity = clamp(safeNumber(raw.paperOpacity, DEFAULT_DOC.paperOpacity), 0, 1);

  const layers = safeArray(raw.layers)
    .map(normalizeLayer)
    .filter((l): l is Layer => Boolean(l));

  return {
    version: 1,
    pageWidth,
    pageHeight,
    zoom,
    paperColor,
    paperOpacity,
    layers: layers.length ? layers : DEFAULT_DOC.layers,
  };
}

function normalizeFillPreset(raw: unknown): FillPreset | null {
  if (!isObject(raw)) return null;
  const id = safeString(raw.id, "");
  if (!id) return null;
  const mode = safeEnum(raw.mode, SHAPE_FILL_MODE_VALUES, "solid");
  return {
    id,
    label: safeString(raw.label, "Preset"),
    mode,
    color1: safeString(raw.color1, DEFAULT_SHAPE_FILL_COLOR),
    color2: safeString(raw.color2, DEFAULT_SHAPE_FILL_COLOR_2),
    stop1: clamp(safeNumber(raw.stop1, DEFAULT_FILL_STOP_1), 0, 100),
    stop2: clamp(safeNumber(raw.stop2, DEFAULT_FILL_STOP_2), 0, 100),
    angle: clamp(safeNumber(raw.angle, 45), 0, 360),
    imageSrc: safeString(raw.imageSrc, ""),
    imageFit: safeEnum(raw.imageFit, SHAPE_IMAGE_FIT_VALUES, "cover"),
  };
}

function normalizeAssetItem(raw: unknown): AssetItem | null {
  if (!isObject(raw)) return null;
  const id = safeString(raw.id, "");
  const src = safeString(raw.src, "");
  if (!id || !src) return null;
  return {
    id,
    name: safeString(raw.name, "Asset"),
    src,
    width: Math.max(1, safeNumber(raw.width, 0)),
    height: Math.max(1, safeNumber(raw.height, 0)),
  };
}

function createId(prefix: string) {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${rand}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function sanitizeFilename(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "layer";
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler arquivo."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

async function getImageNaturalSize(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    img.onerror = () => reject(new Error("Falha ao carregar imagem."));
    img.src = src;
  });
}

  function HandoutCanvasBuilder() {
    type SidebarTab = "text" | "assets" | "shapes" | "layers" | "page" | "props" | "effects" | "export";
    const [sidebarTab, setSidebarTab] = useState<SidebarTab>("text");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [doc, setDoc] = useState<HandoutCanvasDocV1>(DEFAULT_DOC);
  const [topbarPulse, setTopbarPulse] = useState(false);
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [manipulatingId, setManipulatingId] = useState<string | null>(null);
  const [fillPresets, setFillPresets] = useState<FillPreset[]>([]);
  const [assetLibrary, setAssetLibrary] = useState<AssetItem[]>([]);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapTolerance, setSnapTolerance] = useState(6);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [fontWeightSupport, setFontWeightSupport] = useState<Partial<Record<FontPresetId, FontWeight[]>>>({});
  const [hasLoaded, setHasLoaded] = useState(false);

  const pageRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const topbarRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const jsonFileRef = useRef<HTMLInputElement | null>(null);
  const imageFileRef = useRef<HTMLInputElement | null>(null);
  const assetFileRef = useRef<HTMLInputElement | null>(null);
  const shapeImageFileRef = useRef<HTMLInputElement | null>(null);
  const textImageFileRef = useRef<HTMLInputElement | null>(null);
  const textEditorRef = useRef<HTMLTextAreaElement | null>(null);
  const editingSnapshotRef = useRef<string>("");
  const snapFrameRef = useRef<number | null>(null);
  const snapPendingRef = useRef<SnapGuide[] | null>(null);
  const groupDragRef = useRef<{
    ids: string[];
    startBounds: { x: number; y: number; width: number; height: number };
    startLayers: Record<string, { x: number; y: number; width: number; height: number }>;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHasLoaded(true);
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      const normalized = normalizeDocV1(parsed);
      if (normalized) setDoc(normalized);
      setHasLoaded(true);
    } catch {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COLOR_HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const cleaned = parsed
        .map((item) => (typeof item === "string" ? normalizeHexColor(item) : null))
        .filter((item): item is string => Boolean(item));
      if (!cleaned.length) return;
      const seen = new Set<string>();
      const deduped = cleaned.filter((color) => {
        const key = color.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setColorHistory(deduped.slice(0, COLOR_HISTORY_LIMIT));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILL_PRESET_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const cleaned = parsed
        .map(normalizeFillPreset)
        .filter((item): item is FillPreset => Boolean(item));
      setFillPresets(cleaned);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ASSET_LIBRARY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const cleaned = parsed
        .map(normalizeAssetItem)
        .filter((item): item is AssetItem => Boolean(item));
      setAssetLibrary(cleaned);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const snapRaw = localStorage.getItem(SNAP_PREF_KEY);
      if (!snapRaw) return;
      const parsed = JSON.parse(snapRaw);
      if (!isObject(parsed)) return;
      setSnapEnabled(safeBoolean(parsed.enabled, true));
      setSnapTolerance(clamp(safeNumber(parsed.tolerance, 6), 2, 30));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {
      // ignore
    }
  }, [doc, hasLoaded]);

  useEffect(() => {
    try {
      localStorage.setItem(FILL_PRESET_KEY, JSON.stringify(fillPresets));
    } catch {
      // ignore
    }
  }, [fillPresets]);

  useEffect(() => {
    try {
      localStorage.setItem(ASSET_LIBRARY_KEY, JSON.stringify(assetLibrary));
    } catch {
      // ignore
    }
  }, [assetLibrary]);

  useEffect(() => {
    try {
      localStorage.setItem(
        SNAP_PREF_KEY,
        JSON.stringify({ enabled: snapEnabled, tolerance: snapTolerance }),
      );
    } catch {
      // ignore
    }
  }, [snapEnabled, snapTolerance]);

  useEffect(() => {
    if (typeof document === "undefined" || !("fonts" in document)) return;
    let active = true;
    const fonts = document.fonts;
    const checkWeights = () => {
      const results: Partial<Record<FontPresetId, FontWeight[]>> = {};
      for (const id of FONT_PRESET_IDS) {
        const stack = FONT_PRESETS[id].stack;
        const supported = FONT_WEIGHT_VALUES.filter((weight) =>
          fonts.check(`normal ${weight} 16px ${stack}`, "Aa"),
        );
        results[id] = supported.length ? supported : [400];
      }
      if (active) setFontWeightSupport(results);
    };

    checkWeights();
    fonts.ready.then(checkWeights).catch(() => {});

    if (typeof fonts.addEventListener === "function") {
      fonts.addEventListener("loadingdone", checkWeights);
      fonts.addEventListener("loadingerror", checkWeights);
      return () => {
        active = false;
        fonts.removeEventListener("loadingdone", checkWeights);
        fonts.removeEventListener("loadingerror", checkWeights);
      };
    }

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(COLOR_HISTORY_KEY, JSON.stringify(colorHistory));
    } catch {
      // ignore
    }
  }, [colorHistory]);

  useEffect(() => {
    if (!editingId) return;
    const raf = requestAnimationFrame(() => {
      const editor = textEditorRef.current;
      if (!editor) return;
      editor.focus();
      const len = editor.value.length;
      editor.setSelectionRange(len, len);
    });
    return () => cancelAnimationFrame(raf);
  }, [editingId]);

  useEffect(() => {
    if (!snapEnabled) clearSnapGuides();
  }, [snapEnabled]);

  const derivedPage = useMemo(() => {
    const width = clamp(doc.pageWidth, PAGE_SIZE_MIN, PAGE_SIZE_MAX);
    const height = clamp(doc.pageHeight, PAGE_SIZE_MIN, PAGE_SIZE_MAX);
    const paperFill = applyAlphaToColor(doc.paperColor, doc.paperOpacity);

    const vars: CSSVars = {
      "--handout-paper": paperFill,
      "--handout-font": FONT_PRESETS[DEFAULT_FONT_PRESET].stack,
    };

    return { width, height, vars };
  }, [doc.pageWidth, doc.pageHeight, doc.paperColor, doc.paperOpacity]);

  const layersForList = useMemo(() => [...doc.layers].reverse(), [doc.layers]);
  const selectedLayer = useMemo(
    () => doc.layers.find((l) => l.id === selectedId) ?? null,
    [doc.layers, selectedId],
  );
  const selectedLayers = useMemo(
    () => doc.layers.filter((layer) => selectedIds.includes(layer.id)),
    [doc.layers, selectedIds],
  );
  const selectionBounds = useMemo(() => {
    if (selectedLayers.length < 2) return null;
    const minX = Math.min(...selectedLayers.map((layer) => layer.x));
    const minY = Math.min(...selectedLayers.map((layer) => layer.y));
    const maxX = Math.max(...selectedLayers.map((layer) => layer.x + layer.width));
    const maxY = Math.max(...selectedLayers.map((layer) => layer.y + layer.height));
    return {
      x: minX,
      y: minY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY),
    };
  }, [selectedLayers]);
  const isGroupSelection = Boolean(selectionBounds);
  const isGroupLocked = isGroupSelection ? selectedLayers.some((layer) => layer.locked) : false;
  const textLayer = selectedLayer?.type === "text" ? selectedLayer : null;
  const textLayerWeights = useMemo(() => {
    if (!textLayer) return FONT_WEIGHT_VALUES;
    const supported = fontWeightSupport[textLayer.fontPreset];
    return supported && supported.length ? supported : FONT_WEIGHT_VALUES;
  }, [textLayer?.fontPreset, fontWeightSupport]);
  const textWeightOptions = useMemo(() => {
    const supported = new Set(textLayerWeights);
    const filtered = FONT_WEIGHT_OPTIONS.filter((option) => supported.has(option.value));
    return filtered.length ? filtered : FONT_WEIGHT_OPTIONS;
  }, [textLayerWeights]);
  const regularWeight = useMemo(() => getRegularWeight(textLayerWeights), [textLayerWeights]);
  const boldWeight = useMemo(() => getBoldWeight(textLayerWeights), [textLayerWeights]);

  useEffect(() => {
    if (!textLayer) return;
    if (textLayerWeights.includes(textLayer.fontWeight)) return;
    const nextWeight = getClosestWeight(textLayerWeights, textLayer.fontWeight);
    if (nextWeight === textLayer.fontWeight) return;
    updateLayer(textLayer.id, (p) => (p.type === "text" ? { ...p, fontWeight: nextWeight } : p));
  }, [textLayer?.id, textLayer?.fontWeight, textLayerWeights]);
  const opacityPercent = selectedLayer ? Math.round(selectedLayer.opacity * 100) : 100;
  const dropShadowOpacityPercent = selectedLayer ? Math.round(selectedLayer.effects.dropShadow.opacity * 100) : 0;
  const innerShadowOpacityPercent = selectedLayer ? Math.round(selectedLayer.effects.innerShadow.opacity * 100) : 0;
  const paperOpacityPercent = Math.round(doc.paperOpacity * 100);

  function adjustZoom(delta: number) {
    setDoc((prev) => ({ ...prev, zoom: clamp(prev.zoom + delta, ZOOM_MIN, ZOOM_MAX) }));
  }

  function recordColor(value: string) {
    const normalized = normalizeHexColor(value);
    if (!normalized) return;
    setColorHistory((prev) => {
      const next = [normalized, ...prev.filter((color) => color.toLowerCase() !== normalized.toLowerCase())];
      return next.slice(0, COLOR_HISTORY_LIMIT);
    });
  }

  function setSelection(ids: string[], primaryId: string | null) {
    setSelectedIds(ids);
    setSelectedId(primaryId);
  }

  function clearSelection() {
    setSelectedIds([]);
    setSelectedId(null);
  }

  function selectLayerId(id: string, additive: boolean) {
    if (!additive) {
      setSelection([id], id);
      return;
    }
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSelectedId(id);
  }

  function getGroupLayerIds(groupId: string | null) {
    if (!groupId) return [];
    return doc.layers.filter((layer) => layer.groupId === groupId).map((layer) => layer.id);
  }

  function selectGroupById(groupId: string | null) {
    const ids = getGroupLayerIds(groupId);
    if (!ids.length) return;
    const primary = ids.includes(selectedId ?? "") ? selectedId : ids[0];
    setSelection(ids, primary ?? ids[0]);
  }

  function selectLayerFromPointer(layer: Layer, additive: boolean) {
    const groupIds = getGroupLayerIds(layer.groupId);
    if (!additive) {
      const nextIds = groupIds.length ? groupIds : [layer.id];
      setSelection(nextIds, layer.id);
      return;
    }
    const additional = groupIds.length ? groupIds : [layer.id];
    setSelectedIds((prev) => Array.from(new Set([...prev, ...additional])));
    setSelectedId(layer.id);
  }

  function scheduleSnapGuides(guides: SnapGuide[]) {
    if (!snapEnabled) return;
    snapPendingRef.current = guides;
    if (snapFrameRef.current !== null) return;
    snapFrameRef.current = window.requestAnimationFrame(() => {
      snapFrameRef.current = null;
      if (!snapPendingRef.current) return;
      setSnapGuides(snapPendingRef.current);
      snapPendingRef.current = null;
    });
  }

  function clearSnapGuides() {
    snapPendingRef.current = null;
    setSnapGuides([]);
  }

  function getSnapTargets(excludeIds: string[]) {
    const vertical = [0, derivedPage.width / 2, derivedPage.width];
    const horizontal = [0, derivedPage.height / 2, derivedPage.height];
    doc.layers.forEach((layer) => {
      if (excludeIds.includes(layer.id) || !layer.visible) return;
      vertical.push(layer.x, layer.x + layer.width / 2, layer.x + layer.width);
      horizontal.push(layer.y, layer.y + layer.height / 2, layer.y + layer.height);
    });
    return { vertical, horizontal };
  }

  function computeSnapResult(rect: { x: number; y: number; width: number; height: number }, excludeIds: string[]) {
    if (!snapEnabled) return { x: rect.x, y: rect.y, guides: [] as SnapGuide[] };
    const { vertical, horizontal } = getSnapTargets(excludeIds);
    const candidatesX = [rect.x, rect.x + rect.width / 2, rect.x + rect.width];
    const candidatesY = [rect.y, rect.y + rect.height / 2, rect.y + rect.height];
    let snappedX = rect.x;
    let snappedY = rect.y;
    let bestXDiff = snapTolerance + 1;
    let bestYDiff = snapTolerance + 1;
    let bestXTarget = 0;
    let bestYTarget = 0;
    const guides: SnapGuide[] = [];

    candidatesX.forEach((candidate) => {
      vertical.forEach((target) => {
        const diff = target - candidate;
        if (Math.abs(diff) < Math.abs(bestXDiff) && Math.abs(diff) <= snapTolerance) {
          bestXDiff = diff;
          bestXTarget = target;
        }
      });
    });

    if (Math.abs(bestXDiff) <= snapTolerance) {
      snappedX = rect.x + bestXDiff;
      guides.push({ axis: "x", value: bestXTarget });
    }

    candidatesY.forEach((candidate) => {
      horizontal.forEach((target) => {
        const diff = target - candidate;
        if (Math.abs(diff) < Math.abs(bestYDiff) && Math.abs(diff) <= snapTolerance) {
          bestYDiff = diff;
          bestYTarget = target;
        }
      });
    });

    if (Math.abs(bestYDiff) <= snapTolerance) {
      snappedY = rect.y + bestYDiff;
      guides.push({ axis: "y", value: bestYTarget });
    }

    return { x: snappedX, y: snappedY, guides };
  }

function updateLayer(id: string, updater: (prev: Layer) => Layer) {
  setDoc((prev) => ({
    ...prev,
    layers: prev.layers.map((l) => (l.id === id ? updater(l) : l)),
  }));
}

function updateLayers(ids: string[], updater: (prev: Layer) => Layer) {
  if (!ids.length) return;
  const idSet = new Set(ids);
  setDoc((prev) => ({
    ...prev,
    layers: prev.layers.map((layer) => (idSet.has(layer.id) ? updater(layer) : layer)),
  }));
}

function updateLayerEffects(id: string, updater: (prev: LayerEffects) => LayerEffects) {
  updateLayer(id, (prev) => ({ ...prev, effects: updater(prev.effects) }));
}

function updateShadowEffect(
  id: string,
  key: "dropShadow" | "innerShadow",
  updater: (prev: ShadowEffect) => ShadowEffect,
) {
  updateLayerEffects(id, (prev) => ({ ...prev, [key]: updater(prev[key]) }));
}

  function startTextEditing(layer: TextLayer) {
    editingSnapshotRef.current = layer.text;
    setSelection([layer.id], layer.id);
    setEditingId(layer.id);
  }

  function finishTextEditing() {
    setEditingId(null);
    editingSnapshotRef.current = "";
  }

  function cancelTextEditing() {
    if (!editingId) return;
    updateLayer(editingId, (p) => (p.type === "text" ? { ...p, text: editingSnapshotRef.current } : p));
    setEditingId(null);
    editingSnapshotRef.current = "";
  }

  function moveLayerOneStep(id: string, direction: -1 | 1) {
    setDoc((prev) => {
      const idx = prev.layers.findIndex((l) => l.id === id);
      if (idx < 0) return prev;
      const nextIdx = idx + direction;
      if (nextIdx < 0 || nextIdx >= prev.layers.length) return prev;
      const layers = [...prev.layers];
      const [item] = layers.splice(idx, 1);
      layers.splice(nextIdx, 0, item);
      return { ...prev, layers };
    });
  }

  function moveLayersBy(ids: string[], dx: number, dy: number) {
    if (!ids.length) return;
    updateLayers(ids, (layer) => (layer.locked ? layer : { ...layer, x: layer.x + dx, y: layer.y + dy }));
  }

  function duplicateLayers(ids: string[]) {
    if (!ids.length) return;
    const sourceLayers = doc.layers.filter((layer) => ids.includes(layer.id));
    if (!sourceLayers.length) return;
    const duplicates = sourceLayers.map((layer) => {
      const nextId = createId(layer.type === "image" ? "img" : layer.type === "shape" ? "shape" : "txt");
      return {
        ...layer,
        id: nextId,
        name: `${layer.name || "Camada"} copia`,
        x: layer.x + 12,
        y: layer.y + 12,
        groupId: layer.groupId,
      };
    });
    setDoc((prev) => ({ ...prev, layers: [...prev.layers, ...duplicates] }));
    setSelection(
      duplicates.map((layer) => layer.id),
      duplicates[0]?.id ?? null,
    );
  }

  function groupSelectedLayers(ids: string[]) {
    if (ids.length < 2) return;
    const groupId = createId("group");
    updateLayers(ids, (layer) => ({ ...layer, groupId }));
  }

  function ungroupSelectedLayers(ids: string[]) {
    if (!ids.length) return;
    updateLayers(ids, (layer) => ({ ...layer, groupId: null }));
  }

  function toggleLockSelected(ids: string[]) {
    if (!ids.length) return;
    const layers = doc.layers.filter((layer) => ids.includes(layer.id));
    const shouldLock = layers.some((layer) => !layer.locked);
    updateLayers(ids, (layer) => ({ ...layer, locked: shouldLock }));
  }

  function startRotation(e: React.PointerEvent, layer: Layer) {
    if (layer.locked) return;
    const pageRect = pageRef.current?.getBoundingClientRect();
    if (!pageRect) return;

    e.preventDefault();
    e.stopPropagation();
    setManipulatingId(layer.id);

    const centerX = pageRect.left + (layer.x + layer.width / 2) * doc.zoom;
    const centerY = pageRect.top + (layer.y + layer.height / 2) * doc.zoom;
    const startAngle = (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;
    const startRotation = layer.rotation;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    const handleMove = (ev: PointerEvent) => {
      const angle = (Math.atan2(ev.clientY - centerY, ev.clientX - centerX) * 180) / Math.PI;
      const nextRotation = clamp(startRotation + (angle - startAngle), -360, 360);
      updateLayer(layer.id, (p) => ({ ...p, rotation: nextRotation }));
    };

    const handleUp = () => {
      document.body.style.userSelect = prevUserSelect;
      setManipulatingId(null);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
  }

  function deleteLayers(ids: string[]) {
    if (!ids.length) return;
    const idSet = new Set(ids);
    setDoc((prev) => {
      const remaining = prev.layers.filter((l) => !idSet.has(l.id));
      const cleaned = remaining.map((layer) =>
        layer.clipToId && idSet.has(layer.clipToId) ? { ...layer, clipToId: null } : layer,
      );
      return { ...prev, layers: cleaned };
    });
    setSelectedIds((prev) => {
      const next = prev.filter((id) => !idSet.has(id));
      setSelectedId((current) => {
        if (!current || !idSet.has(current)) return current;
        return next.length ? next[0] : null;
      });
      return next;
    });
    setEditingId((current) => (current && idSet.has(current) ? null : current));
  }

  function deleteLayer(id: string) {
    deleteLayers([id]);
  }

  function addText() {
    const id = createId("txt");
    const number = doc.layers.filter((l) => l.type === "text").length + 1;

    const layer: TextLayer = {
      id,
      type: "text",
      name: `Texto ${number}`,
      x: 72,
      y: 560,
      width: 520,
      height: 140,
      opacity: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      locked: false,
      visible: true,
      groupId: null,
      clipToId: null,
      blendMode: "normal",
      effects: createDefaultEffects(),
      text: "Novo texto",
      fontSize: 32,
      color: "#2b1b0e",
      align: "left",
      fontPreset: DEFAULT_FONT_PRESET,
      fontWeight: 800,
      italic: false,
      underline: false,
      backgroundColor: "transparent",
      padding: 0,
      fillMode: "solid",
      fillColor: "#2b1b0e",
      fillColor2: DEFAULT_SHAPE_FILL_COLOR_2,
      fillStop1: DEFAULT_FILL_STOP_1,
      fillStop2: DEFAULT_FILL_STOP_2,
      gradientAngle: 45,
      imageSrc: "",
      imageFit: "cover",
      letterSpacing: 0,
      lineHeight: 1.2,
      strokeColor: DEFAULT_TEXT_STROKE_COLOR,
      strokeWidth: 0,
    };

    setDoc((prev) => ({ ...prev, layers: [...prev.layers, layer] }));
    setSelection([id], id);
    setSidebarTab("props");
  }

  function addShape(kind: ShapeKind) {
    const id = createId("shape");
    const number = doc.layers.filter((l) => l.type === "shape").length + 1;
    const base = Math.round(Math.min(derivedPage.width, derivedPage.height) * 0.28);
    const isRect = kind === "rect";
    const width = isRect ? Math.round(base * 1.4) : base;
    const height = isRect ? Math.round(base * 0.9) : base;
    const x = Math.max(0, Math.round((derivedPage.width - width) / 2));
    const y = Math.max(0, Math.round((derivedPage.height - height) / 2));

    const layer: ShapeLayer = {
      id,
      type: "shape",
      name: `Forma ${number}`,
      x,
      y,
      width,
      height,
      opacity: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      locked: false,
      visible: true,
      groupId: null,
      clipToId: null,
      blendMode: "normal",
      effects: createDefaultEffects(),
      shape: kind,
      cornerRadius: isRect ? 12 : 0,
      fillMode: "solid",
      fillColor: DEFAULT_SHAPE_FILL_COLOR,
      fillColor2: DEFAULT_SHAPE_FILL_COLOR_2,
      fillStop1: DEFAULT_FILL_STOP_1,
      fillStop2: DEFAULT_FILL_STOP_2,
      gradientAngle: 45,
      imageSrc: "",
      imageFit: "cover",
    };

    setDoc((prev) => ({ ...prev, layers: [...prev.layers, layer] }));
    setSelection([id], id);
    setSidebarTab("props");
  }

  async function addImages(files: FileList) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;

    toast.message(`Carregando ${list.length} imagem(ns)...`);
    const created: ImageLayer[] = [];

    for (const file of list) {
      try {
        const src = await fileToDataUrl(file);
        const layer = await createImageLayerFromSrc(src, file.name);
        if (layer) created.push(layer);
      } catch (error) {
        console.error(error);
        toast.error(`Falha ao carregar: ${file.name}`);
      }
    }

    if (!created.length) return;
    setDoc((prev) => ({ ...prev, layers: [...prev.layers, ...created] }));
    setSelection([created[created.length - 1].id], created[created.length - 1].id);
    setSidebarTab("layers");
    toast.success("Imagem(ns) adicionada(s).");
  }

  async function createImageLayerFromSrc(src: string, name: string) {
    const natural = await getImageNaturalSize(src);
    const maxW = derivedPage.width * 0.85;
    const maxH = derivedPage.height * 0.6;
    const scale = Math.min(maxW / natural.width, maxH / natural.height, 1);
    const width = Math.max(64, Math.round(natural.width * scale));
    const height = Math.max(64, Math.round(natural.height * scale));
    const x = Math.max(0, Math.round((derivedPage.width - width) / 2));
    const y = Math.max(0, Math.round((derivedPage.height - height) / 2));

    const layer: ImageLayer = {
      id: createId("img"),
      type: "image",
      name,
      x,
      y,
      width,
      height,
      opacity: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      locked: false,
      visible: true,
      groupId: null,
      clipToId: null,
      blendMode: "normal",
      effects: createDefaultEffects(),
      src,
      keepAspectRatio: true,
    };
    return layer;
  }

  async function addAssets(files: FileList) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    const created: AssetItem[] = [];

    for (const file of list) {
      try {
        const src = await fileToDataUrl(file);
        const natural = await getImageNaturalSize(src);
        created.push({
          id: createId("asset"),
          name: file.name,
          src,
          width: natural.width,
          height: natural.height,
        });
      } catch (error) {
        console.error(error);
        toast.error(`Falha ao carregar: ${file.name}`);
      }
    }

    if (!created.length) return;
    setAssetLibrary((prev) => [...created, ...prev]);
    toast.success("Assets adicionados.");
  }

  async function addAssetToCanvas(asset: AssetItem) {
    try {
      const layer = await createImageLayerFromSrc(asset.src, asset.name);
      if (!layer) return;
      setDoc((prev) => ({ ...prev, layers: [...prev.layers, layer] }));
      setSelection([layer.id], layer.id);
      setSidebarTab("layers");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao inserir asset.");
    }
  }

  function removeAsset(id: string) {
    setAssetLibrary((prev) => prev.filter((asset) => asset.id !== id));
  }

  async function setShapeFillImage(layerId: string, file: File) {
    try {
      const src = await fileToDataUrl(file);
      updateLayer(layerId, (p) =>
        p.type === "shape" ? { ...p, imageSrc: src, fillMode: "image" } : p,
      );
      toast.success("Imagem aplicada.");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao carregar imagem.");
    }
  }

  async function setTextFillImage(layerId: string, file: File) {
    try {
      const src = await fileToDataUrl(file);
      updateLayer(layerId, (p) =>
        p.type === "text"
          ? {
              ...p,
              imageSrc: src,
              fillMode: "image",
            }
          : p,
      );
      toast.success("Imagem aplicada.");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao carregar imagem.");
    }
  }

  function buildFillPreset(layer: TextLayer | ShapeLayer): FillPreset {
    return {
      id: createId("preset"),
      label: layer.name || "Preset",
      mode: layer.fillMode,
      color1: layer.fillColor || DEFAULT_SHAPE_FILL_COLOR,
      color2: layer.fillColor2 || DEFAULT_SHAPE_FILL_COLOR_2,
      stop1: layer.fillStop1 ?? DEFAULT_FILL_STOP_1,
      stop2: layer.fillStop2 ?? DEFAULT_FILL_STOP_2,
      angle: layer.gradientAngle ?? 45,
      imageSrc: layer.imageSrc || "",
      imageFit: layer.imageFit || "cover",
    };
  }

  function saveFillPreset(layer: TextLayer | ShapeLayer) {
    const preset = buildFillPreset(layer);
    setFillPresets((prev) => [preset, ...prev]);
    toast.success("Preset salvo.");
  }

  function applyFillPreset(layerId: string, preset: FillPreset) {
    updateLayer(layerId, (layer) => {
      if (layer.type !== "shape" && layer.type !== "text") return layer;
      const fillMode = preset.mode === "image" && !preset.imageSrc ? "solid" : preset.mode;
      if (layer.type === "text") {
        return {
          ...layer,
          fillMode,
          fillColor: preset.color1,
          fillColor2: preset.color2,
          fillStop1: preset.stop1,
          fillStop2: preset.stop2,
          gradientAngle: preset.angle,
          imageSrc: preset.imageSrc,
          imageFit: preset.imageFit,
          color: preset.color1,
        };
      }
      return {
        ...layer,
        fillMode,
        fillColor: preset.color1,
        fillColor2: preset.color2,
        fillStop1: preset.stop1,
        fillStop2: preset.stop2,
        gradientAngle: preset.angle,
        imageSrc: preset.imageSrc,
        imageFit: preset.imageFit,
      };
    });
  }

  function removeFillPreset(id: string) {
    setFillPresets((prev) => prev.filter((preset) => preset.id !== id));
  }

  function getPresetPreviewStyle(preset: FillPreset): React.CSSProperties {
    if (preset.mode === "solid") {
      return { background: preset.color1 };
    }
    if (preset.mode === "linear") {
      return {
        backgroundImage: `linear-gradient(${preset.angle}deg, ${preset.color1} ${preset.stop1}%, ${preset.color2} ${preset.stop2}%)`,
      };
    }
    if (preset.mode === "radial") {
      return {
        backgroundImage: `radial-gradient(circle at center, ${preset.color1} ${preset.stop1}%, ${preset.color2} ${preset.stop2}%)`,
      };
    }
    if (preset.imageSrc) {
      return {
        backgroundImage: `url(${preset.imageSrc})`,
        backgroundSize: preset.imageFit === "cover" ? "cover" : "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }
    return { background: preset.color1 };
  }

  function resetAll() {
    setDoc(DEFAULT_DOC);
    clearSelection();
    setEditingId(null);
    editingSnapshotRef.current = "";
    setColorHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COLOR_HISTORY_KEY);
    } catch {
      // ignore
    }
    toast.message("Resetado.");
  }

  async function exportPng() {
    const node = pageRef.current;
    if (!node) return;

    const prevSelected = selectedId;
    const prevSelectedIds = selectedIds;
    clearSelection();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    try {
      toast.message("Gerando PNG…");
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "handout.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("PNG exportado.");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao exportar PNG.");
    } finally {
      setSelection(prevSelectedIds, prevSelected);
    }
  }

  async function exportLayersPng() {
    const page = pageRef.current;
    if (!page) return;

    const prevSelected = selectedId;
    const prevSelectedIds = selectedIds;
    clearSelection();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    try {
      const layers = doc.layers.filter((layer) => layer.visible);
      if (!layers.length) {
        toast.message("Sem camadas para exportar.");
        return;
      }
      toast.message("Exportando camadas...");
      for (const layer of layers) {
        const node = page.querySelector(`[data-layer-id=\"${layer.id}\"]`) as HTMLElement | null;
        if (!node) continue;
        const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
        const filename = `${sanitizeFilename(layer.name || layer.id)}.png`;
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      toast.success("Camadas exportadas.");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao exportar camadas.");
    } finally {
      setSelection(prevSelectedIds, prevSelected);
    }
  }

  function exportJson() {
    try {
      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
      downloadBlob(blob, "handout.json");
      toast.success("JSON exportado.");
    } catch {
      toast.error("Falha ao exportar JSON.");
    }
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(doc, null, 2));
      toast.success("JSON copiado.");
    } catch {
      toast.error("Falha ao copiar JSON.");
    }
  }

  async function importJsonFile(file: File) {
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as unknown;
      const normalized = normalizeDocV1(parsed);
      if (!normalized) {
        toast.error("Arquivo inválido.");
        return;
      }
      setDoc(normalized);
      clearSelection();
      toast.success("Importado.");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao importar.");
    }
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || target?.isContentEditable) return;

      const isModifier = e.ctrlKey || e.metaKey;
      if (isModifier) {
        const isZoomInKey = e.key === "=" || e.key === "+" || e.code === "NumpadAdd";
        const isZoomOutKey = e.key === "-" || e.key === "_" || e.code === "NumpadSubtract";
        const isZoomResetKey = e.key === "0" || e.code === "Numpad0";

        if (isZoomInKey) {
          e.preventDefault();
          adjustZoom(ZOOM_BUTTON_STEP);
          return;
        }
        if (isZoomOutKey) {
          e.preventDefault();
          adjustZoom(-ZOOM_BUTTON_STEP);
          return;
        }
        if (isZoomResetKey) {
          e.preventDefault();
          setDoc((p) => ({ ...p, zoom: clamp(1, ZOOM_MIN, ZOOM_MAX) }));
          return;
        }
      }

      const activeIds = selectedIds.length ? selectedIds : selectedId ? [selectedId] : [];
      if (!activeIds.length) return;

      if (isModifier && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateLayers(activeIds);
        return;
      }
      if (isModifier && e.key.toLowerCase() === "g") {
        e.preventDefault();
        if (e.shiftKey) {
          ungroupSelectedLayers(activeIds);
        } else {
          groupSelectedLayers(activeIds);
        }
        return;
      }
      if (isModifier && e.key.toLowerCase() === "l") {
        e.preventDefault();
        toggleLockSelected(activeIds);
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteLayers(activeIds);
        return;
      }

      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveLayersBy(activeIds, 0, -step);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveLayersBy(activeIds, 0, step);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveLayersBy(activeIds, -step, 0);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        moveLayersBy(activeIds, step, 0);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, selectedIds, doc.layers]);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      const direction = Math.sign(e.deltaY);
      if (direction === 0) return;
      e.preventDefault();
      const step = e.shiftKey ? ZOOM_STEP_LARGE : ZOOM_STEP;
      adjustZoom(-direction * step);
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const topbar = topbarRef.current;
    const preview = previewRef.current;
    if (!topbar || !preview) return;

    const updateOffset = () => {
      const height = Math.ceil(topbar.getBoundingClientRect().height);
      preview.style.setProperty("--handout-topbar-offset", `${height}px`);
    };

    updateOffset();

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateOffset) : null;
    observer?.observe(topbar);
    window.addEventListener("resize", updateOffset);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateOffset);
    };
  }, []);

  useEffect(() => {
    setTopbarPulse(true);
    const timeout = window.setTimeout(() => setTopbarPulse(false), 260);
    return () => window.clearTimeout(timeout);
  }, [selectedLayer?.id, selectedLayer?.type]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (sidebarCollapsed) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (sidebarRef.current?.contains(target)) return;
      if (topbarRef.current?.contains(target)) return;
      const portalRoot = document.getElementById("handout-builder-portal-root");
      if (portalRoot?.contains(target)) return;
      setSidebarCollapsed(true);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [sidebarCollapsed]);

  return (
    <div className="handout-builder-app">
      <div className="handout-builder-layout">
        <section ref={previewRef} className="handout-builder-preview">
          <div ref={topbarRef} className={`handout-topbar ${topbarPulse ? "is-sizing" : ""}`}>
            <div className="handout-topbar-inner">
              <div className="handout-topbar-right">
              {!selectedLayer && (
                <div className="handout-background-toolbar" role="group" aria-label="Fundo do canvas">
                  <span className="handout-topbar-chip">Fundo</span>
                  <ColorPicker
                    value={doc.paperColor}
                    onValueChange={(value) => {
                      setDoc((p) => ({ ...p, paperColor: value }));
                      recordColor(value);
                    }}
                    suggestions={COLOR_SUGGESTIONS}
                    history={colorHistory}
                    triggerLabel="BG"
                    ariaLabel="Cor do fundo"
                  />
                  <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="handout-toolbar-button"
                          aria-label="Transparencia do fundo"
                          title="Transparencia do fundo"
                        >
                          <Blend className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                    <PopoverContent align="end" className="handout-opacity-popover">
                      <div className="handout-opacity-panel">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={paperOpacityPercent}
                          onChange={(e) => {
                            const value = clamp(Number(e.target.value), 0, 100);
                            setDoc((p) => ({ ...p, paperOpacity: value / 100 }));
                          }}
                          className="handout-opacity-range"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {selectedLayer && (
                <div className="handout-topbar-actions" role="group" aria-label="Acoes da camada">
                  <button
                    type="button"
                    className={`handout-toolbar-button ${selectedLayer.visible ? "is-active" : ""}`}
                    aria-label={selectedLayer.visible ? "Ocultar" : "Mostrar"}
                    aria-pressed={selectedLayer.visible}
                    title={selectedLayer.visible ? "Ocultar" : "Mostrar"}
                    onClick={() =>
                      updateLayer(selectedLayer.id, (p) => ({ ...p, visible: !p.visible }))
                    }
                  >
                    {selectedLayer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="handout-toolbar-button"
                          aria-label="Transparencia"
                          title="Transparencia"
                        >
                          <Blend className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                    <PopoverContent align="end" className="handout-opacity-popover">
                      <div className="handout-opacity-panel">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={opacityPercent}
                          onChange={(e) => {
                            const value = clamp(Number(e.target.value), 0, 100);
                            updateLayer(selectedLayer.id, (p) => ({ ...p, opacity: value / 100 }));
                          }}
                          className="handout-opacity-range"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <BlendModePicker
                    value={selectedLayer.blendMode}
                    onValueChange={(value) =>
                      updateLayer(selectedLayer.id, (p) => ({ ...p, blendMode: value }))
                    }
                  />
                    <button
                      type="button"
                      className={`handout-toolbar-button ${selectedLayer.flipX ? "is-active" : ""}`}
                      aria-label="Flip horizontal"
                      aria-pressed={selectedLayer.flipX}
                      title="Flip horizontal"
                      onClick={() =>
                        updateLayer(selectedLayer.id, (p) => ({ ...p, flipX: !p.flipX }))
                      }
                    >
                      <FlipHorizontal2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className={`handout-toolbar-button ${selectedLayer.flipY ? "is-active" : ""}`}
                      aria-label="Flip vertical"
                      aria-pressed={selectedLayer.flipY}
                      title="Flip vertical"
                      onClick={() =>
                        updateLayer(selectedLayer.id, (p) => ({ ...p, flipY: !p.flipY }))
                      }
                    >
                      <FlipVertical2 className="h-4 w-4" />
                    </button>
                  <button
                    type="button"
                    className={`handout-toolbar-button ${selectedLayer.locked ? "is-active" : ""}`}
                    aria-label={selectedLayer.locked ? "Desbloquear" : "Bloquear"}
                    aria-pressed={selectedLayer.locked}
                    title={selectedLayer.locked ? "Desbloquear" : "Bloquear"}
                    onClick={() =>
                      updateLayer(selectedLayer.id, (p) => ({ ...p, locked: !p.locked }))
                    }
                  >
                    {selectedLayer.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </button>
                </div>
              )}

              {textLayer && (
                <div className="handout-text-toolbar" role="toolbar" aria-label="Editor de texto">
                  <div className="handout-toolbar-group handout-toolbar-font">
                    <FontPicker
                      value={textLayer.fontPreset}
                      onValueChange={(v) =>
                        updateLayer(textLayer.id, (p) =>
                          p.type === "text" ? { ...p, fontPreset: v } : p,
                        )
                      }
                      className="handout-toolbar-input handout-toolbar-font-input"
                    />
                  </div>

                  <div className="handout-toolbar-divider" aria-hidden="true" />

                  <div className="handout-toolbar-group">
                    <FontWeightPicker
                      value={textLayer.fontWeight}
                      onValueChange={(value) =>
                        updateLayer(textLayer.id, (p) =>
                          p.type === "text" ? { ...p, fontWeight: value } : p,
                        )
                      }
                      fontFamily={FONT_PRESETS[textLayer.fontPreset].stack}
                      options={textWeightOptions}
                    />
                  </div>

                  <div className="handout-toolbar-divider" aria-hidden="true" />

                  <div className="handout-toolbar-group handout-toolbar-size">
                    <button
                      type="button"
                      className="handout-toolbar-button"
                      aria-label="Diminuir tamanho"
                      onClick={() =>
                        updateLayer(textLayer.id, (p) =>
                          p.type === "text" ? { ...p, fontSize: clamp(p.fontSize - 2, 8, 180) } : p,
                        )
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <Input
                      type="number"
                      min={8}
                      max={180}
                      value={textLayer.fontSize}
                      onChange={(e) =>
                        updateLayer(textLayer.id, (p) =>
                          p.type === "text" ? { ...p, fontSize: clamp(Number(e.target.value), 8, 180) } : p,
                        )
                      }
                      className="handout-toolbar-input handout-toolbar-size-input"
                    />
                    <button
                      type="button"
                      className="handout-toolbar-button"
                      aria-label="Aumentar tamanho"
                      onClick={() =>
                        updateLayer(textLayer.id, (p) =>
                          p.type === "text" ? { ...p, fontSize: clamp(p.fontSize + 2, 8, 180) } : p,
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="handout-toolbar-divider" aria-hidden="true" />

                  <div className="handout-toolbar-group">
                    <ColorPicker
                      value={textLayer.fillColor || textLayer.color}
                      onValueChange={(value) => {
                        updateLayer(textLayer.id, (p) =>
                          p.type === "text" ? { ...p, color: value, fillColor: value } : p,
                        );
                        recordColor(value);
                      }}
                      suggestions={COLOR_SUGGESTIONS}
                      history={colorHistory}
                      triggerLabel="A"
                      ariaLabel="Cor do texto"
                    />
                    <button
                      type="button"
                      className={`handout-toolbar-button ${
                        textLayer.fontWeight !== regularWeight && textLayer.fontWeight >= boldWeight ? "is-active" : ""
                      }`}
                      aria-label="Negrito"
                      aria-pressed={textLayer.fontWeight !== regularWeight && textLayer.fontWeight >= boldWeight}
                      onClick={() => {
                        const isBold =
                          textLayer.fontWeight !== regularWeight && textLayer.fontWeight >= boldWeight;
                        const nextWeight = isBold ? regularWeight : boldWeight;
                        updateLayer(textLayer.id, (p) =>
                          p.type === "text" ? { ...p, fontWeight: nextWeight } : p,
                        );
                      }}
                    >
                      <Bold className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className={`handout-toolbar-button ${textLayer.italic ? "is-active" : ""}`}
                      aria-label="Italico"
                      aria-pressed={textLayer.italic}
                      onClick={() =>
                        updateLayer(textLayer.id, (p) => (p.type === "text" ? { ...p, italic: !p.italic } : p))
                      }
                    >
                      <Italic className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className={`handout-toolbar-button ${textLayer.underline ? "is-active" : ""}`}
                      aria-label="Sublinhado"
                      aria-pressed={textLayer.underline}
                      onClick={() =>
                        updateLayer(textLayer.id, (p) =>
                          p.type === "text" ? { ...p, underline: !p.underline } : p,
                        )
                      }
                    >
                      <Underline className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="handout-toolbar-divider" aria-hidden="true" />

                  <div className="handout-toolbar-group">
                    <button
                      type="button"
                      className="handout-toolbar-button"
                      aria-label={`Alinhamento: ${TEXT_ALIGN_LABELS[textLayer.align]}`}
                      title={`Alinhamento: ${TEXT_ALIGN_LABELS[textLayer.align]}`}
                      onClick={() => {
                        const order: TextAlign[] = ["left", "center", "right"];
                        const idx = order.indexOf(textLayer.align);
                        const next = order[(idx + 1) % order.length];
                        updateLayer(textLayer.id, (p) => (p.type === "text" ? { ...p, align: next } : p));
                      }}
                    >
                      {textLayer.align === "left" ? (
                        <AlignLeft className="h-4 w-4" />
                      ) : textLayer.align === "center" ? (
                        <AlignCenter className="h-4 w-4" />
                      ) : (
                        <AlignRight className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {selectedLayer && selectedLayer.type === "image" && (
                <div className="handout-topbar-selection">
                </div>
              )}
            </div>
            </div>
          </div>

          <div className={`handout-canvas-shell ${sidebarCollapsed ? "is-collapsed" : ""}`}>
            <aside
              ref={sidebarRef}
              className={`handout-builder-sidebar handout-canvas-sidebar ${sidebarCollapsed ? "is-collapsed" : ""}`}
            >
              <div className="handout-sidebar-actions">
                <button
                  type="button"
                  className={`handout-sidebar-action ${sidebarTab === "text" ? "is-active" : ""}`}
                  onClick={() => { setSidebarTab("text"); setSidebarCollapsed(false); }}
                  aria-pressed={sidebarTab === "text"}
                >
                  <Type className="h-5 w-5" />
                  <span>Texto</span>
                </button>
                <button
                  type="button"
                  className={`handout-sidebar-action ${sidebarTab === "assets" ? "is-active" : ""}`}
                  onClick={() => { setSidebarTab("assets"); setSidebarCollapsed(false); }}
                  aria-pressed={sidebarTab === "assets"}
                >
                  <ImageIcon className="h-5 w-5" />
                  <span>Assets</span>
                </button>
                <button
                  type="button"
                  className={`handout-sidebar-action ${sidebarTab === "shapes" ? "is-active" : ""}`}
                  onClick={() => { setSidebarTab("shapes"); setSidebarCollapsed(false); }}
                  aria-pressed={sidebarTab === "shapes"}
                >
                  <Square className="h-5 w-5" />
                  <span>Formas</span>
                </button>
                <button
                  type="button"
                  className={`handout-sidebar-action ${sidebarTab === "layers" ? "is-active" : ""}`}
                  onClick={() => { setSidebarTab("layers"); setSidebarCollapsed(false); }}
                  aria-pressed={sidebarTab === "layers"}
                >
                  <Layers className="h-5 w-5" />
                  <span>Camadas</span>
                </button>
                <button
                  type="button"
                  className={`handout-sidebar-action ${sidebarTab === "page" ? "is-active" : ""}`}
                  onClick={() => { setSidebarTab("page"); setSidebarCollapsed(false); }}
                  aria-pressed={sidebarTab === "page"}
                >
                  <LayoutGrid className="h-5 w-5" />
                  <span>Pagina</span>
                </button>
                  <button
                    type="button"
                    className={`handout-sidebar-action ${sidebarTab === "props" ? "is-active" : ""}`}
                    onClick={() => { setSidebarTab("props"); setSidebarCollapsed(false); }}
                    aria-pressed={sidebarTab === "props"}
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                    <span>Props</span>
                  </button>
                  <button
                    type="button"
                    className={`handout-sidebar-action ${sidebarTab === "effects" ? "is-active" : ""}`}
                    onClick={() => { setSidebarTab("effects"); setSidebarCollapsed(false); }}
                    aria-pressed={sidebarTab === "effects"}
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>Efeitos</span>
                  </button>
                  <button
                    type="button"
                    className={`handout-sidebar-action ${sidebarTab === "export" ? "is-active" : ""}`}
                    onClick={() => { setSidebarTab("export"); setSidebarCollapsed(false); }}
                    aria-pressed={sidebarTab === "export"}
                >
                  <Download className="h-5 w-5" />
                  <span>Exportar</span>
                </button>
              </div>

              {!sidebarCollapsed && (
                <div className="handout-sidebar-panel">
                {sidebarTab === "text" && (
                  <div className="handout-panel-section">
                    <div className="handout-panel-title">Texto</div>
                    <Button type="button" onClick={addText} className="w-full gap-2">
                      <Type className="h-4 w-4" />
                      Adicionar texto
                    </Button>
                    <div className="handout-panel-hint">
                      Crie caixas de texto e ajuste fonte/tamanho na barra superior.
                    </div>
                  </div>
                )}

                {sidebarTab === "assets" && (
                  <div className="handout-panel-section">
                    <div className="handout-panel-title">Assets</div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => imageFileRef.current?.click()}
                      className="w-full gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload de imagens
                    </Button>
                    <input
                      ref={imageFileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length) void addImages(files);
                        e.currentTarget.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => assetFileRef.current?.click()}
                      className="w-full gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Salvar na biblioteca
                    </Button>
                    <input
                      ref={assetFileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length) void addAssets(files);
                        e.currentTarget.value = "";
                      }}
                    />
                    <div className="handout-panel-hint">
                      Arraste imagens direto para o canvas ou use o botao acima.
                    </div>
                    {assetLibrary.length > 0 ? (
                      <div className="handout-asset-grid">
                        {assetLibrary.map((asset) => (
                          <div key={asset.id} className="handout-asset-card">
                            <button
                              type="button"
                              className="handout-asset-preview"
                              onClick={() => void addAssetToCanvas(asset)}
                              title="Adicionar ao canvas"
                            >
                              <img src={asset.src} alt={asset.name} />
                            </button>
                            <div className="handout-asset-meta">
                              <span className="handout-asset-name" title={asset.name}>
                                {asset.name}
                              </span>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                aria-label="Remover asset"
                                onClick={() => removeAsset(asset.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="handout-panel-hint">Sem assets salvos.</div>
                    )}
                  </div>
                )}

                {sidebarTab === "shapes" && (
                  <div className="handout-panel-section">
                    <div className="handout-panel-title">Formas</div>
                    <div className="handout-shape-grid">
                      <Button
                        type="button"
                        variant="outline"
                        className="handout-shape-button"
                        onClick={() => addShape("rect")}
                      >
                        <Square className="h-4 w-4" />
                        Retângulo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="handout-shape-button"
                        onClick={() => addShape("ellipse")}
                      >
                        <Circle className="h-4 w-4" />
                        Círculo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="handout-shape-button"
                        onClick={() => addShape("triangle")}
                      >
                        <Triangle className="h-4 w-4" />
                        Triângulo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="handout-shape-button"
                        onClick={() => addShape("diamond")}
                      >
                        <Square className="h-4 w-4 rotate-45" />
                        Diamante
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="handout-shape-button"
                        onClick={() => addShape("hexagon")}
                      >
                        <Square className="h-4 w-4" />
                        Hexágono
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="handout-shape-button"
                        onClick={() => addShape("star")}
                      >
                        <Star className="h-4 w-4" />
                        Estrela
                      </Button>
                    </div>
                    <div className="handout-panel-hint">
                      Escolha uma forma e personalize o preenchimento nas propriedades.
                    </div>
                  </div>
                )}

                {sidebarTab === "page" && (
                  <div className="handout-panel-section">
                    <div className="handout-panel-title">Pagina</div>
                    <div className="handout-panel-card">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="page-width">Largura (px)</Label>
                        <Input
                          id="page-width"
                          type="number"
                          min={PAGE_SIZE_MIN}
                          max={PAGE_SIZE_MAX}
                          step={1}
                          value={doc.pageWidth}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (!Number.isFinite(value)) return;
                            setDoc((p) => ({
                              ...p,
                              pageWidth: clamp(value, PAGE_SIZE_MIN, PAGE_SIZE_MAX),
                            }));
                          }}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="page-height">Altura (px)</Label>
                        <Input
                          id="page-height"
                          type="number"
                          min={PAGE_SIZE_MIN}
                          max={PAGE_SIZE_MAX}
                          step={1}
                          value={doc.pageHeight}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (!Number.isFinite(value)) return;
                            setDoc((p) => ({
                              ...p,
                              pageHeight: clamp(value, PAGE_SIZE_MIN, PAGE_SIZE_MAX),
                            }));
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="canvas-zoom">Zoom ({Math.round(doc.zoom * 100)}%)</Label>
                      <input
                        id="canvas-zoom"
                        type="range"
                        min={ZOOM_MIN}
                        max={ZOOM_MAX}
                        step={0.05}
                        value={doc.zoom}
                        onChange={(e) =>
                          setDoc((p) => ({ ...p, zoom: clamp(Number(e.target.value), ZOOM_MIN, ZOOM_MAX) }))
                        }
                        className="handout-range"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Cor do papel</Label>
                      <ColorPicker
                        value={doc.paperColor}
                        onValueChange={(value) => {
                          setDoc((p) => ({ ...p, paperColor: value }));
                          recordColor(value);
                        }}
                        suggestions={COLOR_SUGGESTIONS}
                        history={colorHistory}
                        ariaLabel="Cor do papel"
                        className="handout-color-inline"
                      />
                    </div>
                    </div>
                  <div className="handout-panel-card">
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="grid gap-0.5">
                          <div className="text-sm font-medium">Snapping</div>
                          <div className="text-xs text-muted-foreground">Guias de alinhamento</div>
                        </div>
                        <Switch checked={snapEnabled} onCheckedChange={(checked) => setSnapEnabled(checked)} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Tolerancia (px)</Label>
                        <Input
                          type="number"
                          min={2}
                          max={30}
                          value={snapTolerance}
                          onChange={(event) =>
                            setSnapTolerance(clamp(Number(event.target.value), 2, 30))
                          }
                          disabled={!snapEnabled}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

                {sidebarTab === "layers" && (
                  <div className="handout-panel-section">
                    <div className="handout-panel-title">Camadas</div>
                    <div className="grid gap-3">
                      {layersForList.length === 0 && (
                        <div className="text-sm text-muted-foreground">Sem camadas. Adicione um texto ou imagem.</div>
                      )}

                      {layersForList.map((layer, idxFromTop) => {
                        const realIdx = doc.layers.length - 1 - idxFromTop;
                        const isSelected = selectedIds.includes(layer.id);
                        const canMoveForward = realIdx < doc.layers.length - 1;
                        const canMoveBackward = realIdx > 0;

                        return (
                          <div key={layer.id} className={`handout-layer-row ${isSelected ? "is-selected" : ""}`}>
                            <button
                              type="button"
                              className="handout-layer-main"
                              onClick={(event) => {
                                selectLayerFromPointer(layer, event.shiftKey);
                                setSidebarTab("props");
                              }}
                            >
                              <span className="handout-layer-icon">
                                {layer.type === "image" ? (
                                  <ImageIcon className="h-4 w-4" />
                                ) : layer.type === "shape" ? (
                                  <Square className="h-4 w-4" />
                                ) : (
                                  <Type className="h-4 w-4" />
                                )}
                              </span>
                              <span className="handout-layer-name" title={layer.name}>
                                {layer.name || layer.id}
                              </span>
                            </button>

                            <div className="handout-layer-actions">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={!canMoveForward}
                                onClick={() => moveLayerOneStep(layer.id, 1)}
                                aria-label="Trazer para frente"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={!canMoveBackward}
                                onClick={() => moveLayerOneStep(layer.id, -1)}
                                aria-label="Enviar para trás"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => updateLayer(layer.id, (prev) => ({ ...prev, visible: !prev.visible }))}
                                aria-label={layer.visible ? "Ocultar" : "Mostrar"}
                              >
                                {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => updateLayer(layer.id, (prev) => ({ ...prev, locked: !prev.locked }))}
                                aria-label={layer.locked ? "Desbloquear" : "Bloquear"}
                              >
                                {layer.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteLayer(layer.id)}
                                aria-label="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                  {sidebarTab === "props" && (
                    <div className="handout-panel-section">
                      <div className="handout-panel-title">Propriedades</div>
                      <div className="grid gap-4">
                        {!selectedLayer && (
                        <div className="text-sm text-muted-foreground">Selecione uma camada para editar.</div>
                      )}

                      {selectedLayer && (
                        <>
                          {selectedIds.length > 1 && (
                            <div className="grid gap-3 rounded-md border border-input p-3">
                              <div className="text-sm font-medium">Selecao</div>
                              <div className="text-xs text-muted-foreground">
                                {selectedIds.length} camadas selecionadas
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => groupSelectedLayers(selectedIds)}
                                >
                                  Agrupar
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => ungroupSelectedLayers(selectedIds)}
                                >
                                  Desagrupar
                                </Button>
                              </div>
                            </div>
                          )}

                          {selectedIds.length === 1 && selectedLayer.groupId && (
                            <div className="grid gap-3 rounded-md border border-input p-3">
                              <div className="text-sm font-medium">Grupo</div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => selectGroupById(selectedLayer.groupId)}
                                >
                                  Selecionar grupo
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => ungroupSelectedLayers([selectedLayer.id])}
                                >
                                  Desagrupar
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="grid gap-3 rounded-md border border-input p-3">
                            <div className="text-sm font-medium">Clipping</div>
                            <div className="grid gap-2">
                              <Label>Usar mascara</Label>
                              <Select
                                value={selectedLayer.clipToId ?? "none"}
                                onValueChange={(value) =>
                                  updateLayer(selectedLayer.id, (p) => ({
                                    ...p,
                                    clipToId: value === "none" ? null : value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Sem mascara</SelectItem>
                                  {doc.layers
                                    .filter(
                                      (layer) =>
                                        layer.id !== selectedLayer.id &&
                                        (layer.type === "shape" || layer.type === "text"),
                                    )
                                    .map((layer) => (
                                      <SelectItem key={layer.id} value={layer.id}>
                                        {layer.name || layer.id}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {selectedLayer.type === "image" && (
                            <div className="grid gap-3 rounded-md border border-input p-3">
                              <div className="text-sm font-medium">Imagem</div>

                              <div className="flex items-center justify-between gap-3 rounded-md border border-input px-3 py-2">
                                <div className="grid gap-0.5">
                                  <div className="text-sm font-medium">Manter proporção</div>
                                  <div className="text-xs text-muted-foreground">Ao redimensionar</div>
                                </div>
                                <Switch
                                  checked={selectedLayer.keepAspectRatio}
                                  onCheckedChange={(checked) =>
                                    updateLayer(selectedLayer.id, (p) =>
                                      p.type === "image" ? { ...p, keepAspectRatio: checked } : p,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          )}

                          {selectedLayer.type === "shape" && (
                            <>
                              <div className="grid gap-3 rounded-md border border-input p-3">
                                <div className="text-sm font-medium">Forma</div>
                                <div className="grid gap-2">
                                  <Label>Tipo</Label>
                                  <Select
                                    value={selectedLayer.shape}
                                    onValueChange={(value) => {
                                      updateLayer(selectedLayer.id, (p) =>
                                        p.type === "shape"
                                          ? {
                                              ...p,
                                              shape: value as ShapeKind,
                                              cornerRadius: value === "rect" ? p.cornerRadius : 0,
                                            }
                                          : p,
                                      );
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {SHAPE_KIND_VALUES.map((kind) => (
                                        <SelectItem key={kind} value={kind}>
                                          {SHAPE_KIND_LABELS[kind]}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {selectedLayer.shape === "rect" && (
                                  <div className="grid gap-2">
                                    <Label>Raio da borda</Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={50}
                                      value={selectedLayer.cornerRadius}
                                      onChange={(e) => {
                                        const value = clamp(Number(e.target.value), 0, 50);
                                        updateLayer(selectedLayer.id, (p) =>
                                          p.type === "shape" ? { ...p, cornerRadius: value } : p,
                                        );
                                      }}
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="grid gap-3 rounded-md border border-input p-3">
                                <div className="text-sm font-medium">Preenchimento</div>
                                <div className="grid gap-2">
                                  <Label>Modo</Label>
                                  <Select
                                    value={selectedLayer.fillMode}
                                    onValueChange={(value) => {
                                      updateLayer(selectedLayer.id, (p) =>
                                        p.type === "shape"
                                          ? { ...p, fillMode: value as ShapeFillMode }
                                          : p,
                                      );
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {SHAPE_FILL_MODE_VALUES.map((mode) => (
                                        <SelectItem key={mode} value={mode}>
                                          {SHAPE_FILL_MODE_LABELS[mode]}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {selectedLayer.fillMode !== "image" && (
                                  <div
                                    className={`grid gap-3 ${
                                      selectedLayer.fillMode === "solid" ? "" : "grid-cols-2"
                                    }`}
                                  >
                                    <div className="grid gap-2">
                                      <Label>{selectedLayer.fillMode === "solid" ? "Cor" : "Cor 1"}</Label>
                                      <ColorPicker
                                        value={selectedLayer.fillColor}
                                        onValueChange={(value) => {
                                          updateLayer(selectedLayer.id, (p) =>
                                            p.type === "shape" ? { ...p, fillColor: value } : p,
                                          );
                                          recordColor(value);
                                        }}
                                        suggestions={COLOR_SUGGESTIONS}
                                        history={colorHistory}
                                        ariaLabel="Cor primaria"
                                        className="handout-color-inline"
                                      />
                                    </div>

                                    {selectedLayer.fillMode !== "solid" && (
                                      <div className="grid gap-2">
                                        <Label>Cor 2</Label>
                                        <ColorPicker
                                          value={selectedLayer.fillColor2}
                                          onValueChange={(value) => {
                                            updateLayer(selectedLayer.id, (p) =>
                                              p.type === "shape" ? { ...p, fillColor2: value } : p,
                                            );
                                            recordColor(value);
                                          }}
                                          suggestions={COLOR_SUGGESTIONS}
                                          history={colorHistory}
                                          ariaLabel="Cor secundaria"
                                          className="handout-color-inline"
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}

                                {(selectedLayer.fillMode === "linear" || selectedLayer.fillMode === "radial") && (
                                  <GradientStopEditor
                                    stop1={selectedLayer.fillStop1}
                                    stop2={selectedLayer.fillStop2}
                                    color1={selectedLayer.fillColor}
                                    color2={selectedLayer.fillColor2}
                                    angle={selectedLayer.gradientAngle}
                                    mode={selectedLayer.fillMode}
                                    onStop1Change={(value) =>
                                      updateLayer(selectedLayer.id, (p) =>
                                        p.type === "shape" ? { ...p, fillStop1: value } : p,
                                      )
                                    }
                                    onStop2Change={(value) =>
                                      updateLayer(selectedLayer.id, (p) =>
                                        p.type === "shape" ? { ...p, fillStop2: value } : p,
                                      )
                                    }
                                    onAngleChange={(value) =>
                                      updateLayer(selectedLayer.id, (p) =>
                                        p.type === "shape" ? { ...p, gradientAngle: value } : p,
                                      )
                                    }
                                  />
                                )}

                                {selectedLayer.fillMode === "image" && (
                                  <div className="grid gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => shapeImageFileRef.current?.click()}
                                    >
                                      <Upload className="h-4 w-4" />
                                      <span>Selecionar imagem</span>
                                    </Button>
                                    <input
                                      ref={shapeImageFileRef}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) void setShapeFillImage(selectedLayer.id, file);
                                        e.currentTarget.value = "";
                                      }}
                                    />
                                    {!selectedLayer.imageSrc && (
                                      <div className="text-xs text-muted-foreground">
                                        Nenhuma imagem selecionada.
                                      </div>
                                    )}
                                    <div className="grid gap-2">
                                      <Label>Ajuste</Label>
                                      <Select
                                        value={selectedLayer.imageFit}
                                        onValueChange={(value) => {
                                          updateLayer(selectedLayer.id, (p) =>
                                            p.type === "shape"
                                              ? { ...p, imageFit: value as ShapeImageFit }
                                              : p,
                                          );
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {SHAPE_IMAGE_FIT_VALUES.map((mode) => (
                                            <SelectItem key={mode} value={mode}>
                                              {SHAPE_IMAGE_FIT_LABELS[mode]}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                              </div>

                            </>
                          )}

                          {selectedLayer.type === "text" && (
                            <>
                              <div className="grid gap-3 rounded-md border border-input p-3">
                                <div className="text-sm font-medium">Preenchimento do texto</div>
                                <div className="grid gap-2">
                                  <Label>Modo</Label>
                                  <Select
                                    value={selectedLayer.fillMode}
                                    onValueChange={(value) =>
                                      updateLayer(selectedLayer.id, (p) =>
                                        p.type === "text" ? { ...p, fillMode: value as ShapeFillMode } : p,
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {SHAPE_FILL_MODE_VALUES.map((mode) => (
                                        <SelectItem key={mode} value={mode}>
                                          {SHAPE_FILL_MODE_LABELS[mode]}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {selectedLayer.fillMode !== "image" && (
                                  <div
                                    className={`grid gap-3 ${
                                      selectedLayer.fillMode === "solid" ? "" : "grid-cols-2"
                                    }`}
                                  >
                                    <div className="grid gap-2">
                                      <Label>{selectedLayer.fillMode === "solid" ? "Cor" : "Cor 1"}</Label>
                                      <ColorPicker
                                        value={selectedLayer.fillColor}
                                        onValueChange={(value) => {
                                          updateLayer(selectedLayer.id, (p) =>
                                            p.type === "text" ? { ...p, fillColor: value, color: value } : p,
                                          );
                                          recordColor(value);
                                        }}
                                        suggestions={COLOR_SUGGESTIONS}
                                        history={colorHistory}
                                        ariaLabel="Cor primaria"
                                        className="handout-color-inline"
                                      />
                                    </div>

                                    {selectedLayer.fillMode !== "solid" && (
                                      <div className="grid gap-2">
                                        <Label>Cor 2</Label>
                                        <ColorPicker
                                          value={selectedLayer.fillColor2}
                                          onValueChange={(value) => {
                                            updateLayer(selectedLayer.id, (p) =>
                                              p.type === "text" ? { ...p, fillColor2: value } : p,
                                            );
                                            recordColor(value);
                                          }}
                                          suggestions={COLOR_SUGGESTIONS}
                                          history={colorHistory}
                                          ariaLabel="Cor secundaria"
                                          className="handout-color-inline"
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}

                                {(selectedLayer.fillMode === "linear" || selectedLayer.fillMode === "radial") && (
                                  <GradientStopEditor
                                    stop1={selectedLayer.fillStop1}
                                    stop2={selectedLayer.fillStop2}
                                    color1={selectedLayer.fillColor}
                                    color2={selectedLayer.fillColor2}
                                    angle={selectedLayer.gradientAngle}
                                    mode={selectedLayer.fillMode}
                                    onStop1Change={(value) =>
                                      updateLayer(selectedLayer.id, (p) =>
                                        p.type === "text" ? { ...p, fillStop1: value } : p,
                                      )
                                    }
                                    onStop2Change={(value) =>
                                      updateLayer(selectedLayer.id, (p) =>
                                        p.type === "text" ? { ...p, fillStop2: value } : p,
                                      )
                                    }
                                    onAngleChange={(value) =>
                                      updateLayer(selectedLayer.id, (p) =>
                                        p.type === "text" ? { ...p, gradientAngle: value } : p,
                                      )
                                    }
                                  />
                                )}

                                {selectedLayer.fillMode === "image" && (
                                  <div className="grid gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => textImageFileRef.current?.click()}
                                    >
                                      <Upload className="h-4 w-4" />
                                      <span>Selecionar imagem</span>
                                    </Button>
                                    <input
                                      ref={textImageFileRef}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) void setTextFillImage(selectedLayer.id, file);
                                        e.currentTarget.value = "";
                                      }}
                                    />
                                    {!selectedLayer.imageSrc && (
                                      <div className="text-xs text-muted-foreground">
                                        Nenhuma imagem selecionada.
                                      </div>
                                    )}
                                    <div className="grid gap-2">
                                      <Label>Ajuste</Label>
                                      <Select
                                        value={selectedLayer.imageFit}
                                        onValueChange={(value) => {
                                          updateLayer(selectedLayer.id, (p) =>
                                            p.type === "text" ? { ...p, imageFit: value as ShapeImageFit } : p,
                                          );
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {SHAPE_IMAGE_FIT_VALUES.map((mode) => (
                                            <SelectItem key={mode} value={mode}>
                                              {SHAPE_IMAGE_FIT_LABELS[mode]}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="grid gap-3 rounded-md border border-input p-3">
                                <div className="text-sm font-medium">Texto avancado</div>
                                <div className="grid gap-2">
                                  <Label>Espacamento (px)</Label>
                                  <Input
                                    type="number"
                                    min={-5}
                                    max={20}
                                    value={selectedLayer.letterSpacing}
                                    onChange={(e) => {
                                      const value = clamp(Number(e.target.value), -5, 20);
                                      updateLayer(selectedLayer.id, (p) =>
                                        p.type === "text" ? { ...p, letterSpacing: value } : p,
                                      );
                                    }}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Altura da linha</Label>
                                  <Input
                                    type="number"
                                    min={0.6}
                                    max={3}
                                    step={0.1}
                                    value={selectedLayer.lineHeight}
                                    onChange={(e) => {
                                      const value = clamp(Number(e.target.value), 0.6, 3);
                                      updateLayer(selectedLayer.id, (p) =>
                                        p.type === "text" ? { ...p, lineHeight: value } : p,
                                      );
                                    }}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="grid gap-2">
                                    <Label>Contorno (px)</Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={12}
                                      value={selectedLayer.strokeWidth}
                                      onChange={(e) => {
                                        const value = clamp(Number(e.target.value), 0, 12);
                                        updateLayer(selectedLayer.id, (p) =>
                                          p.type === "text" ? { ...p, strokeWidth: value } : p,
                                        );
                                      }}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label>Cor do contorno</Label>
                                    <ColorPicker
                                      value={selectedLayer.strokeColor}
                                      onValueChange={(value) => {
                                        updateLayer(selectedLayer.id, (p) =>
                                          p.type === "text" ? { ...p, strokeColor: value } : p,
                                        );
                                        recordColor(value);
                                      }}
                                      suggestions={COLOR_SUGGESTIONS}
                                      history={colorHistory}
                                      ariaLabel="Cor do contorno"
                                      className="handout-color-inline"
                                    />
                                  </div>
                                </div>
                              </div>

                            </>
                          )}
                        </>
                        )}
                      </div>
                    </div>
                  )}

                  {sidebarTab === "effects" && (
                    <div className="handout-panel-section">
                      <div className="handout-panel-title">Efeitos</div>
                      <div className="handout-effects-panel grid gap-4">
                        {!selectedLayer && (
                          <div className="text-sm text-muted-foreground">Selecione uma camada para editar.</div>
                        )}

                        {selectedLayer && (
                          <>
                            <div
                              className="handout-effects-card grid gap-3 rounded-md border border-input p-3"
                              data-active={selectedLayer.effects.dropShadow.enabled ? "true" : "false"}
                            >
                              <div className="handout-effects-card-head flex items-center justify-between gap-3">
                                <div className="grid gap-0.5">
                                  <div className="handout-effects-card-title text-sm font-medium">Sombra externa</div>
                                  <div className="handout-effects-card-subtitle text-xs text-muted-foreground">
                                    Drop shadow
                                  </div>
                                </div>
                                <Switch
                                  checked={selectedLayer.effects.dropShadow.enabled}
                                  onCheckedChange={(checked) =>
                                    updateShadowEffect(selectedLayer.id, "dropShadow", (p) => ({ ...p, enabled: checked }))
                                  }
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                  <Label>Offset X</Label>
                                  <Input
                                    type="number"
                                    min={EFFECT_SHADOW_OFFSET_MIN}
                                    max={EFFECT_SHADOW_OFFSET_MAX}
                                    value={selectedLayer.effects.dropShadow.x}
                                    onChange={(e) => {
                                      const value = clamp(
                                        Number(e.target.value),
                                        EFFECT_SHADOW_OFFSET_MIN,
                                        EFFECT_SHADOW_OFFSET_MAX,
                                      );
                                      updateShadowEffect(selectedLayer.id, "dropShadow", (p) => ({ ...p, x: value }));
                                    }}
                                  />
                                </div>

                                <div className="grid gap-2">
                                  <Label>Offset Y</Label>
                                  <Input
                                    type="number"
                                    min={EFFECT_SHADOW_OFFSET_MIN}
                                    max={EFFECT_SHADOW_OFFSET_MAX}
                                    value={selectedLayer.effects.dropShadow.y}
                                    onChange={(e) => {
                                      const value = clamp(
                                        Number(e.target.value),
                                        EFFECT_SHADOW_OFFSET_MIN,
                                        EFFECT_SHADOW_OFFSET_MAX,
                                      );
                                      updateShadowEffect(selectedLayer.id, "dropShadow", (p) => ({ ...p, y: value }));
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                  <Label>Blur</Label>
                                  <Input
                                    type="number"
                                    min={EFFECT_SHADOW_BLUR_MIN}
                                    max={EFFECT_SHADOW_BLUR_MAX}
                                    value={selectedLayer.effects.dropShadow.blur}
                                    onChange={(e) => {
                                      const value = clamp(
                                        Number(e.target.value),
                                        EFFECT_SHADOW_BLUR_MIN,
                                        EFFECT_SHADOW_BLUR_MAX,
                                      );
                                      updateShadowEffect(selectedLayer.id, "dropShadow", (p) => ({ ...p, blur: value }));
                                    }}
                                  />
                                </div>

                                <div className="grid gap-2">
                                  <Label>Spread</Label>
                                  <Input
                                    type="number"
                                    min={EFFECT_SHADOW_SPREAD_MIN}
                                    max={EFFECT_SHADOW_SPREAD_MAX}
                                    value={selectedLayer.effects.dropShadow.spread}
                                    onChange={(e) => {
                                      const value = clamp(
                                        Number(e.target.value),
                                        EFFECT_SHADOW_SPREAD_MIN,
                                        EFFECT_SHADOW_SPREAD_MAX,
                                      );
                                      updateShadowEffect(selectedLayer.id, "dropShadow", (p) => ({ ...p, spread: value }));
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                  <Label>Cor</Label>
                                  <ColorPicker
                                    value={selectedLayer.effects.dropShadow.color}
                                    onValueChange={(value) => {
                                      updateShadowEffect(selectedLayer.id, "dropShadow", (p) => ({ ...p, color: value }));
                                      recordColor(value);
                                    }}
                                    suggestions={COLOR_SUGGESTIONS}
                                    history={colorHistory}
                                    ariaLabel="Cor da sombra externa"
                                    className="handout-color-inline"
                                  />
                                </div>

                                <div className="grid gap-2">
                                  <Label>Opacidade</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={dropShadowOpacityPercent}
                                    onChange={(e) => {
                                      const value = clamp(Number(e.target.value), 0, 100);
                                      updateShadowEffect(selectedLayer.id, "dropShadow", (p) => ({
                                        ...p,
                                        opacity: value / 100,
                                      }));
                                    }}
                                    className="handout-opacity-input"
                                  />
                                </div>
                              </div>
                            </div>

                            <div
                              className="handout-effects-card grid gap-3 rounded-md border border-input p-3"
                              data-active={selectedLayer.effects.innerShadow.enabled ? "true" : "false"}
                            >
                              <div className="handout-effects-card-head flex items-center justify-between gap-3">
                                <div className="grid gap-0.5">
                                  <div className="handout-effects-card-title text-sm font-medium">Sombra interna</div>
                                  <div className="handout-effects-card-subtitle text-xs text-muted-foreground">
                                    Inner shadow
                                  </div>
                                </div>
                                <Switch
                                  checked={selectedLayer.effects.innerShadow.enabled}
                                  onCheckedChange={(checked) =>
                                    updateShadowEffect(selectedLayer.id, "innerShadow", (p) => ({ ...p, enabled: checked }))
                                  }
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                  <Label>Offset X</Label>
                                  <Input
                                    type="number"
                                    min={EFFECT_SHADOW_OFFSET_MIN}
                                    max={EFFECT_SHADOW_OFFSET_MAX}
                                    value={selectedLayer.effects.innerShadow.x}
                                    onChange={(e) => {
                                      const value = clamp(
                                        Number(e.target.value),
                                        EFFECT_SHADOW_OFFSET_MIN,
                                        EFFECT_SHADOW_OFFSET_MAX,
                                      );
                                      updateShadowEffect(selectedLayer.id, "innerShadow", (p) => ({ ...p, x: value }));
                                    }}
                                  />
                                </div>

                                <div className="grid gap-2">
                                  <Label>Offset Y</Label>
                                  <Input
                                    type="number"
                                    min={EFFECT_SHADOW_OFFSET_MIN}
                                    max={EFFECT_SHADOW_OFFSET_MAX}
                                    value={selectedLayer.effects.innerShadow.y}
                                    onChange={(e) => {
                                      const value = clamp(
                                        Number(e.target.value),
                                        EFFECT_SHADOW_OFFSET_MIN,
                                        EFFECT_SHADOW_OFFSET_MAX,
                                      );
                                      updateShadowEffect(selectedLayer.id, "innerShadow", (p) => ({ ...p, y: value }));
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                  <Label>Blur</Label>
                                  <Input
                                    type="number"
                                    min={EFFECT_SHADOW_BLUR_MIN}
                                    max={EFFECT_SHADOW_BLUR_MAX}
                                    value={selectedLayer.effects.innerShadow.blur}
                                    onChange={(e) => {
                                      const value = clamp(
                                        Number(e.target.value),
                                        EFFECT_SHADOW_BLUR_MIN,
                                        EFFECT_SHADOW_BLUR_MAX,
                                      );
                                      updateShadowEffect(selectedLayer.id, "innerShadow", (p) => ({ ...p, blur: value }));
                                    }}
                                  />
                                </div>

                                <div className="grid gap-2">
                                  <Label>Spread</Label>
                                  <Input
                                    type="number"
                                    min={EFFECT_SHADOW_SPREAD_MIN}
                                    max={EFFECT_SHADOW_SPREAD_MAX}
                                    value={selectedLayer.effects.innerShadow.spread}
                                    onChange={(e) => {
                                      const value = clamp(
                                        Number(e.target.value),
                                        EFFECT_SHADOW_SPREAD_MIN,
                                        EFFECT_SHADOW_SPREAD_MAX,
                                      );
                                      updateShadowEffect(selectedLayer.id, "innerShadow", (p) => ({ ...p, spread: value }));
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                  <Label>Cor</Label>
                                  <ColorPicker
                                    value={selectedLayer.effects.innerShadow.color}
                                    onValueChange={(value) => {
                                      updateShadowEffect(selectedLayer.id, "innerShadow", (p) => ({ ...p, color: value }));
                                      recordColor(value);
                                    }}
                                    suggestions={COLOR_SUGGESTIONS}
                                    history={colorHistory}
                                    ariaLabel="Cor da sombra interna"
                                    className="handout-color-inline"
                                  />
                                </div>

                                <div className="grid gap-2">
                                  <Label>Opacidade</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={innerShadowOpacityPercent}
                                    onChange={(e) => {
                                      const value = clamp(Number(e.target.value), 0, 100);
                                      updateShadowEffect(selectedLayer.id, "innerShadow", (p) => ({
                                        ...p,
                                        opacity: value / 100,
                                      }));
                                    }}
                                    className="handout-opacity-input"
                                  />
                                </div>
                              </div>
                            </div>

                            <div
                              className="handout-effects-card grid gap-3 rounded-md border border-input p-3"
                              data-active={selectedLayer.effects.blur > 0 ? "true" : "false"}
                            >
                              <div className="handout-effects-card-title text-sm font-medium">Desfoque</div>
                              <div className="grid gap-2">
                                <Label>Intensidade (px)</Label>
                                <Input
                                  type="number"
                                  min={EFFECT_BLUR_MIN}
                                  max={EFFECT_BLUR_MAX}
                                  value={selectedLayer.effects.blur}
                                  onChange={(e) => {
                                    const value = clamp(Number(e.target.value), EFFECT_BLUR_MIN, EFFECT_BLUR_MAX);
                                    updateLayerEffects(selectedLayer.id, (p) => ({ ...p, blur: value }));
                                  }}
                                  className="handout-opacity-input"
                                />
                              </div>
                            </div>

                            <div
                              className="handout-effects-card grid gap-3 rounded-md border border-input p-3"
                              data-active={
                                selectedLayer.effects.brightness !== 100 ||
                                selectedLayer.effects.contrast !== 100 ||
                                selectedLayer.effects.saturate !== 100
                                  ? "true"
                                  : "false"
                              }
                            >
                              <div className="handout-effects-card-title text-sm font-medium">Filtros</div>

                              <div className="grid gap-2">
                                <Label>Brilho (%)</Label>
                                <Input
                                  type="number"
                                  min={EFFECT_FILTER_MIN}
                                  max={EFFECT_FILTER_MAX}
                                  value={selectedLayer.effects.brightness}
                                  onChange={(e) => {
                                    const value = clamp(
                                      Number(e.target.value),
                                      EFFECT_FILTER_MIN,
                                      EFFECT_FILTER_MAX,
                                    );
                                    updateLayerEffects(selectedLayer.id, (p) => ({ ...p, brightness: value }));
                                  }}
                                  className="handout-opacity-input"
                                />
                              </div>

                              <div className="grid gap-2">
                                <Label>Contraste (%)</Label>
                                <Input
                                  type="number"
                                  min={EFFECT_FILTER_MIN}
                                  max={EFFECT_FILTER_MAX}
                                  value={selectedLayer.effects.contrast}
                                  onChange={(e) => {
                                    const value = clamp(
                                      Number(e.target.value),
                                      EFFECT_FILTER_MIN,
                                      EFFECT_FILTER_MAX,
                                    );
                                    updateLayerEffects(selectedLayer.id, (p) => ({ ...p, contrast: value }));
                                  }}
                                  className="handout-opacity-input"
                                />
                              </div>

                              <div className="grid gap-2">
                                <Label>Saturacao (%)</Label>
                                <Input
                                  type="number"
                                  min={EFFECT_FILTER_MIN}
                                  max={EFFECT_FILTER_MAX}
                                  value={selectedLayer.effects.saturate}
                                  onChange={(e) => {
                                    const value = clamp(
                                      Number(e.target.value),
                                      EFFECT_FILTER_MIN,
                                      EFFECT_FILTER_MAX,
                                    );
                                    updateLayerEffects(selectedLayer.id, (p) => ({ ...p, saturate: value }));
                                  }}
                                  className="handout-opacity-input"
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {sidebarTab === "export" && (
                    <div className="handout-panel-section">
                      <div className="handout-panel-title">Exportar</div>
                    <div className="grid gap-3">
                      <Button type="button" onClick={() => void exportPng()} className="gap-2">
                        <Download className="h-4 w-4" />
                        Baixar PNG
                      </Button>
                      <Button type="button" variant="outline" onClick={() => void exportLayersPng()} className="gap-2">
                        <Download className="h-4 w-4" />
                        PNG por camada
                      </Button>

                      <div className="grid grid-cols-2 gap-2">
                        <Button type="button" variant="outline" onClick={exportJson} className="gap-2">
                          <Download className="h-4 w-4" />
                          JSON
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => jsonFileRef.current?.click()}
                          className="gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Importar
                        </Button>
                        <input
                          ref={jsonFileRef}
                          type="file"
                          accept="application/json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void importJsonFile(file);
                            e.currentTarget.value = "";
                          }}
                        />
                      </div>

                      <Button type="button" variant="outline" onClick={() => void copyJson()} className="gap-2">
                        <Copy className="h-4 w-4" />
                        Copiar JSON
                      </Button>

                      <Button type="button" variant="outline" onClick={resetAll} className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Resetar
                      </Button>
                    </div>
                  </div>
                )}
                </div>
              )}
            </aside>

          <div
            ref={stageRef}
            className="handout-preview-stage handout-canvas-stage"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const files = e.dataTransfer.files;
              if (files && files.length) void addImages(files);
            }}
          >
            <div
              className="handout-canvas-zoom"
              style={{ transform: `scale(${doc.zoom})`, transformOrigin: "top center" }}
            >
              <div
                ref={pageRef}
                className="handout-page handout-print-target handout-canvas-page"
                style={{
                  ...derivedPage.vars,
                  width: `${derivedPage.width}px`,
                  height: `${derivedPage.height}px`,
                }}
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget) {
                    clearSelection();
                    finishTextEditing();
                  }
                }}
              >
                {snapGuides.length > 0 && (
                  <div className="handout-snap-guides">
                    {snapGuides.map((guide, idx) => (
                      <div
                        key={`${guide.axis}-${guide.value}-${idx}`}
                        className={`handout-snap-guide ${guide.axis === "x" ? "is-vertical" : "is-horizontal"}`}
                        style={
                          guide.axis === "x"
                            ? { left: `${guide.value}px` }
                            : { top: `${guide.value}px` }
                        }
                      />
                    ))}
                  </div>
                )}

                {doc.layers.map((layer) => {
                  const isSelected = selectedIds.includes(layer.id);
                  const isPrimarySelected = layer.id === selectedId;
                  const isEditing = editingId === layer.id;
                  const isRotated = Math.abs(layer.rotation) > 0.01;
                  if (!layer.visible) return null;

                  const layerTransform = `rotate(${layer.rotation}deg) scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`;
                  const isImageLayer = layer.type === "image";
                  const isTextLayer = layer.type === "text";
                  const isShapeLayer = layer.type === "shape";
                  const shapeLayer = isShapeLayer ? (layer as ShapeLayer) : null;
                  const isManipulatingLayer =
                    manipulatingId === layer.id || (manipulatingId === "group" && isSelected);
                  const suppressEffects = isManipulatingLayer && !isEditing;
                  const layerBlendMode = suppressEffects ? "normal" : layer.blendMode;
                  const layerEffectStyle =
                    isImageLayer || isTextLayer || isShapeLayer ? undefined : getLayerEffectStyle(layer.effects);
                  const innerShadowEnabled =
                    layer.effects.innerShadow.enabled && layer.effects.innerShadow.opacity > 0;
                  const innerShadowId = innerShadowEnabled ? `handout-inner-shadow-${layer.id}` : null;
                  const imageEffectStyle = isImageLayer ? getImageEffectStyle(layer.effects) : null;
                  const textEffectStyle = !suppressEffects && isTextLayer ? getTextEffectStyle(layer.effects) : null;
                  const shapeEffectStyle = !suppressEffects && isShapeLayer ? getTextEffectStyle(layer.effects) : null;
                  const shapeFill = shapeLayer ? getShapeFill(shapeLayer, shapeLayer.id) : null;
                  const showInnerShadow = Boolean(isImageLayer && innerShadowId && !suppressEffects);
                  const showTextInnerShadow = Boolean(isTextLayer && innerShadowId && !suppressEffects);
                  const showShapeInnerShadow = Boolean(isShapeLayer && innerShadowId && !suppressEffects);
                  const imageFilterStyle = isImageLayer
                    ? ({
                        filter: suppressEffects ? "none" : imageEffectStyle?.filter ?? "none",
                      } as React.CSSProperties)
                    : undefined;
                  const innerShadowFilterStyle = showInnerShadow
                    ? ({ filter: `url(#${innerShadowId})` } as React.CSSProperties)
                    : undefined;
                  const shapeFilterStyle = shapeEffectStyle
                    ? ({ filter: shapeEffectStyle.filter } as React.CSSProperties)
                    : undefined;
                  const effectNeedsOverflow = layer.effects.dropShadow.enabled || layer.effects.blur > 0;
                  const clipLayer =
                    layer.clipToId && layer.clipToId !== layer.id
                      ? doc.layers.find((item) => item.id === layer.clipToId)
                      : null;
                  const clipMaskStyle =
                    clipLayer && clipLayer.visible && (clipLayer.type === "shape" || clipLayer.type === "text")
                      ? getClipMaskStyle(layer, clipLayer)
                      : null;
                  const layerInnerStyle = {
                    opacity: layer.opacity,
                    overflow: effectNeedsOverflow ? "visible" : undefined,
                    ...(clipMaskStyle ?? {}),
                  } as const;
                  const labelIsBottom = layer.y < 40;
                  const labelIsRight = layer.x + 240 > derivedPage.width;
                  const boundsLabelClassName = [
                    "handout-layer-bounds-label",
                    labelIsBottom ? "is-bottom" : "",
                    labelIsRight ? "is-right" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  const handleStyle = {
                    width: "12px",
                    height: "12px",
                    background: "var(--handout-accent, hsl(var(--primary)))",
                    borderRadius: "999px",
                    border: "2px solid rgba(255,255,255,0.85)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  } as const;
                  const canResize = isPrimarySelected && !layer.locked && !isEditing && !isGroupSelection;
                  const resizeHandleStyles =
                    canResize
                      ? {
                          topLeft: handleStyle,
                          topRight: handleStyle,
                          bottomLeft: handleStyle,
                          bottomRight: handleStyle,
                        }
                      : undefined;

                  return (
                    <Rnd
                      key={layer.id}
                      bounds="parent"
                      size={{ width: layer.width, height: layer.height }}
                      position={{ x: layer.x, y: layer.y }}
                      scale={doc.zoom}
                      data-layer-id={layer.id}
                      disableDragging={layer.locked || isEditing || (isGroupSelection && isSelected)}
                      enableResizing={canResize}
                      resizeHandleStyles={resizeHandleStyles}
                      lockAspectRatio={layer.type === "image" ? layer.keepAspectRatio : false}
                      onDragStart={() => setManipulatingId(layer.id)}
                      onDrag={(_, data) => {
                        if (!snapEnabled) return;
                        const result = computeSnapResult(
                          { x: data.x, y: data.y, width: layer.width, height: layer.height },
                          [layer.id],
                        );
                        scheduleSnapGuides(result.guides);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        if (editingId && editingId !== layer.id) finishTextEditing();
                        selectLayerFromPointer(layer, e.shiftKey);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (layer.type === "text") {
                          startTextEditing(layer);
                          return;
                        }
                        setSidebarTab("props");
                      }}
                      onDragStop={(_, data) => {
                        const result = computeSnapResult(
                          { x: data.x, y: data.y, width: layer.width, height: layer.height },
                          [layer.id],
                        );
                        updateLayer(layer.id, (p) => ({ ...p, x: result.x, y: result.y }));
                        clearSnapGuides();
                        setManipulatingId(null);
                      }}
                      onResizeStart={() => setManipulatingId(layer.id)}
                      onResize={(_, __, ref, ___, position) => {
                        if (!snapEnabled) return;
                        const nextWidth = Number(ref.style.width.replace("px", ""));
                        const nextHeight = Number(ref.style.height.replace("px", ""));
                        const result = computeSnapResult(
                          { x: position.x, y: position.y, width: nextWidth, height: nextHeight },
                          [layer.id],
                        );
                        scheduleSnapGuides(result.guides);
                      }}
                      onResizeStop={(_, __, ref, ___, position) => {
                        const nextWidth = Number(ref.style.width.replace("px", ""));
                        const nextHeight = Number(ref.style.height.replace("px", ""));
                        const result = computeSnapResult(
                          { x: position.x, y: position.y, width: nextWidth, height: nextHeight },
                          [layer.id],
                        );
                        updateLayer(layer.id, (p) => ({
                          ...p,
                          width: Math.max(20, nextWidth),
                          height: Math.max(20, nextHeight),
                          x: result.x,
                          y: result.y,
                        }));
                        clearSnapGuides();
                        setManipulatingId(null);
                      }}
                      style={{ mixBlendMode: layerBlendMode }}
                      className={`handout-layer ${layer.type === "image" ? "is-image" : layer.type === "shape" ? "is-shape" : "is-text"} ${isSelected ? "is-selected" : ""} ${layer.locked ? "is-locked" : ""} ${isRotated ? "is-rotated" : ""} ${isManipulatingLayer ? "is-manipulating" : ""}`}
                    >
                      {isPrimarySelected && !isEditing && (
                        <div className="handout-layer-bounds">
                          <div className={boundsLabelClassName} aria-hidden="true">
                            {Math.round(layer.width)}x{Math.round(layer.height)} · x:{Math.round(layer.x)} y:{Math.round(layer.y)}
                          </div>
                          <button
                            type="button"
                            className={`handout-rotate-handle ${layer.locked ? "is-disabled" : ""}`}
                            aria-label="Rotacionar"
                            disabled={layer.locked}
                            onPointerDown={(e) => startRotation(e, layer)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}

                      <div className="handout-layer-inner" style={layerInnerStyle}>
                        <div
                          className="handout-layer-transform"
                          style={{ transform: layerTransform, transformOrigin: "center center", ...layerEffectStyle }}
                        >
                          {layer.type === "image" ? (
                            <div className="handout-layer-image-wrap">
                              {showInnerShadow && innerShadowId
                                ? renderInnerShadowFilter(innerShadowId, layer.effects.innerShadow)
                                : null}
                              <img
                                src={layer.src}
                                alt=""
                                draggable={false}
                                className="handout-layer-image"
                                style={imageFilterStyle}
                              />
                              {showInnerShadow && innerShadowFilterStyle ? (
                                <img
                                  src={layer.src}
                                  alt=""
                                  draggable={false}
                                  className="handout-layer-image handout-layer-image-shadow"
                                  style={innerShadowFilterStyle}
                                />
                              ) : null}
                            </div>
                          ) : layer.type === "shape" && shapeLayer ? (
                            <>
                              {showShapeInnerShadow && innerShadowId
                                ? renderInnerShadowFilter(innerShadowId, layer.effects.innerShadow)
                                : null}
                              <svg
                                className="handout-layer-shape"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                                style={shapeFilterStyle}
                                aria-hidden="true"
                              >
                                {shapeFill?.defs ? <defs>{shapeFill.defs}</defs> : null}
                                {renderShapeElement(shapeLayer.shape, shapeLayer.cornerRadius, {
                                  fill: shapeFill?.fill ?? DEFAULT_SHAPE_FILL_COLOR,
                                })}
                                {showShapeInnerShadow && innerShadowId
                                  ? renderShapeElement(shapeLayer.shape, shapeLayer.cornerRadius, {
                                      className: "handout-layer-shape-shadow",
                                      fill: "#000000",
                                      filterId: innerShadowId,
                                    })
                                  : null}
                              </svg>
                            </>
                          ) : (
                            (() => {
                              const textStyle = {
                                fontSize: `${layer.fontSize}px`,
                                color: layer.fillColor || layer.color,
                                textAlign: layer.align,
                                fontFamily: FONT_PRESETS[layer.fontPreset].stack,
                                fontWeight: layer.fontWeight,
                                fontStyle: layer.italic ? "italic" : "normal",
                                textDecoration: layer.underline ? "underline" : "none",
                                backgroundColor: layer.backgroundColor,
                                padding: `${layer.padding}px`,
                                lineHeight: layer.lineHeight,
                                letterSpacing: `${layer.letterSpacing}px`,
                                whiteSpace: "pre-wrap",
                              } as React.CSSProperties;
                              const textFillStyle = getTextFillStyle(layer);
                              const textDisplayStyle = textEffectStyle
                                ? ({ ...textStyle, ...textEffectStyle } as React.CSSProperties)
                                : textStyle;

                              if (isEditing) {
                                return (
                                  <textarea
                                    ref={textEditorRef}
                                    value={layer.text}
                                    onChange={(e) =>
                                      updateLayer(layer.id, (p) =>
                                        p.type === "text" ? { ...p, text: e.target.value } : p,
                                      )
                                    }
                                    onBlur={finishTextEditing}
                                    onKeyDown={(e) => {
                                      if (e.key === "Escape") {
                                        e.preventDefault();
                                        cancelTextEditing();
                                      }
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className="handout-layer-text-editor"
                                    style={textStyle}
                                  />
                                );
                              }

                              return (
                                <>
                                  {showTextInnerShadow && innerShadowId
                                    ? renderInnerShadowFilter(innerShadowId, layer.effects.innerShadow)
                                    : null}
                                  <div className="handout-layer-text-wrap">
                                    <div className="handout-layer-text" style={textDisplayStyle}>
                                      <span className="handout-layer-text-fill" style={textFillStyle}>
                                        {layer.text}
                                      </span>
                                    </div>
                                    {showTextInnerShadow && innerShadowId ? (
                                      <div
                                        className="handout-layer-text handout-layer-text-shadow"
                                        style={{
                                          ...textStyle,
                                          backgroundColor: "transparent",
                                          filter: `url(#${innerShadowId})`,
                                        }}
                                      >
                                        <span className="handout-layer-text-fill" style={textFillStyle}>
                                          {layer.text}
                                        </span>
                                      </div>
                                    ) : null}
                                  </div>
                                </>
                              );
                            })()
                          )}
                        </div>
                      </div>
                    </Rnd>
                  );
                })}

                {selectionBounds && (
                  <Rnd
                    bounds="parent"
                    size={{ width: selectionBounds.width, height: selectionBounds.height }}
                    position={{ x: selectionBounds.x, y: selectionBounds.y }}
                    scale={doc.zoom}
                    disableDragging={isGroupLocked}
                    enableResizing={!isGroupLocked}
                    onDragStart={() => {
                      if (!selectionBounds) return;
                      groupDragRef.current = {
                        ids: selectedLayers.map((layer) => layer.id),
                        startBounds: { ...selectionBounds },
                        startLayers: selectedLayers.reduce(
                          (acc, layer) => {
                            acc[layer.id] = {
                              x: layer.x,
                              y: layer.y,
                              width: layer.width,
                              height: layer.height,
                            };
                            return acc;
                          },
                          {} as Record<string, { x: number; y: number; width: number; height: number }>,
                        ),
                      };
                      setManipulatingId("group");
                    }}
                    onDrag={(_, data) => {
                      const refData = groupDragRef.current;
                      if (!refData) return;
                      const snap = computeSnapResult(
                        {
                          x: data.x,
                          y: data.y,
                          width: refData.startBounds.width,
                          height: refData.startBounds.height,
                        },
                        refData.ids,
                      );
                      scheduleSnapGuides(snap.guides);
                      const dx = snap.x - refData.startBounds.x;
                      const dy = snap.y - refData.startBounds.y;
                      const idSet = new Set(refData.ids);
                      setDoc((prev) => ({
                        ...prev,
                        layers: prev.layers.map((layer) => {
                          if (!idSet.has(layer.id)) return layer;
                          const start = refData.startLayers[layer.id];
                          return {
                            ...layer,
                            x: start.x + dx,
                            y: start.y + dy,
                          };
                        }),
                      }));
                    }}
                    onDragStop={() => {
                      clearSnapGuides();
                      setManipulatingId(null);
                      groupDragRef.current = null;
                    }}
                    onResizeStart={() => {
                      if (!selectionBounds) return;
                      groupDragRef.current = {
                        ids: selectedLayers.map((layer) => layer.id),
                        startBounds: { ...selectionBounds },
                        startLayers: selectedLayers.reduce(
                          (acc, layer) => {
                            acc[layer.id] = {
                              x: layer.x,
                              y: layer.y,
                              width: layer.width,
                              height: layer.height,
                            };
                            return acc;
                          },
                          {} as Record<string, { x: number; y: number; width: number; height: number }>,
                        ),
                      };
                      setManipulatingId("group");
                    }}
                    onResize={(_, __, ref, ___, position) => {
                      const refData = groupDragRef.current;
                      if (!refData) return;
                      const nextWidth = Math.max(1, Number(ref.style.width.replace("px", "")));
                      const nextHeight = Math.max(1, Number(ref.style.height.replace("px", "")));
                      const scaleX = nextWidth / refData.startBounds.width;
                      const scaleY = nextHeight / refData.startBounds.height;
                      const idSet = new Set(refData.ids);
                      setDoc((prev) => ({
                        ...prev,
                        layers: prev.layers.map((layer) => {
                          if (!idSet.has(layer.id)) return layer;
                          const start = refData.startLayers[layer.id];
                          const relX = start.x - refData.startBounds.x;
                          const relY = start.y - refData.startBounds.y;
                          return {
                            ...layer,
                            x: position.x + relX * scaleX,
                            y: position.y + relY * scaleY,
                            width: Math.max(20, start.width * scaleX),
                            height: Math.max(20, start.height * scaleY),
                          };
                        }),
                      }));
                    }}
                    onResizeStop={() => {
                      clearSnapGuides();
                      setManipulatingId(null);
                      groupDragRef.current = null;
                    }}
                    className="handout-group-bounds"
                  >
                    <div className="handout-group-inner" />
                  </Rnd>
                )}
              </div>
            </div>
          </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function HandoutCanvasApp() {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(() => {
    if (typeof document === "undefined") return null;
    return document.getElementById("handout-builder-portal-root");
  });

  useEffect(() => {
    const updatePortalContainer = () => {
      setPortalContainer(document.getElementById("handout-builder-portal-root"));
    };

    updatePortalContainer();
    document.addEventListener("astro:after-swap", updatePortalContainer);

    return () => {
      document.removeEventListener("astro:after-swap", updatePortalContainer);
    };
  }, []);

  return (
    <PortalContainerProvider container={portalContainer}>
      <HandoutCanvasBuilder />
      <Toaster />
    </PortalContainerProvider>
  );
}





