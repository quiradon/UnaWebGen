import type {
  BlendMode,
  FontPresetId,
  FontWeight,
  ShapeFillMode,
  ShapeImageFit,
  ShapeKind,
} from "@/components/handoutbuilder/handoutCanvasTypes";

export const FONT_PRESETS: Record<FontPresetId, { label: string; stack: string }> = {
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

export const FONT_PRESET_IDS = Object.keys(FONT_PRESETS) as FontPresetId[];
export const DEFAULT_FONT_PRESET: FontPresetId = "serif";
export const FONT_WEIGHT_VALUES = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
export const FONT_WEIGHT_OPTIONS: ReadonlyArray<{ value: FontWeight; label: string }> = [
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
export const BLEND_MODE_OPTIONS: ReadonlyArray<{ value: BlendMode; label: string }> = [
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
export const BLEND_MODE_VALUES = BLEND_MODE_OPTIONS.map((option) => option.value) as BlendMode[];
export const SHAPE_KINDS = ["rect", "ellipse", "triangle", "diamond", "hexagon", "star"] as const;
export const SHAPE_KIND_VALUES = [...SHAPE_KINDS] as ShapeKind[];
export const SHAPE_KIND_LABELS: Record<ShapeKind, string> = {
  rect: "Retƒngulo",
  ellipse: "C¡rculo",
  triangle: "Triƒngulo",
  diamond: "Diamante",
  hexagon: "Hex gono",
  star: "Estrela",
};
export const SHAPE_FILL_MODES = ["solid", "linear", "radial", "image"] as const;
export const SHAPE_FILL_MODE_VALUES = [...SHAPE_FILL_MODES] as ShapeFillMode[];
export const SHAPE_FILL_MODE_LABELS: Record<ShapeFillMode, string> = {
  solid: "Cor s¢lida",
  linear: "Gradiente linear",
  radial: "Gradiente radial",
  image: "Imagem",
};
export const SHAPE_IMAGE_FITS = ["fill", "fit", "crop"] as const;
export const SHAPE_IMAGE_FIT_VALUES = [...SHAPE_IMAGE_FITS] as ShapeImageFit[];
export const SHAPE_IMAGE_FIT_LABELS: Record<ShapeImageFit, string> = {
  fill: "Preencher",
  fit: "Ajustar",
  crop: "Cortar",
};
export const TEMPLATE_IDS = ["none", "parchment", "letter", "dossier"] as const;
