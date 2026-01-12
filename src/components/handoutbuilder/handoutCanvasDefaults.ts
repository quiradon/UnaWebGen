import { DEFAULT_FONT_PRESET } from "@/components/handoutbuilder/handoutCanvasOptions";
import type { HandoutCanvasDocV1, LayerEffects, ShadowEffect } from "@/components/handoutbuilder/handoutCanvasTypes";
import { DEFAULT_PAGE_HEIGHT, DEFAULT_PAGE_WIDTH } from "@/components/handoutbuilder/handoutCanvasConfig";

export const GRADIENT_PRESETS = [
  { id: "sunset", label: "Sunset", angle: 45, color1: "#f97316", color2: "#f43f5e" },
  { id: "ocean", label: "Ocean", angle: 90, color1: "#0ea5e9", color2: "#22d3ee" },
  { id: "forest", label: "Forest", angle: 135, color1: "#22c55e", color2: "#16a34a" },
  { id: "night", label: "Night", angle: 120, color1: "#312e81", color2: "#0f172a" },
] as const;

export const DEFAULT_DROP_SHADOW: ShadowEffect = {
  enabled: false,
  x: 0,
  y: 18,
  blur: 30,
  spread: 0,
  color: "#000000",
  opacity: 0.35,
};

export const DEFAULT_INNER_SHADOW: ShadowEffect = {
  enabled: false,
  x: 0,
  y: 4,
  blur: 12,
  spread: 0,
  color: "#000000",
  opacity: 0.35,
};

export const DEFAULT_SHAPE_FILL_COLOR = "#f97316";
export const DEFAULT_SHAPE_FILL_COLOR_2 = "#fde68a";
export const DEFAULT_FILL_STOP_1 = 0;
export const DEFAULT_FILL_STOP_2 = 100;
export const DEFAULT_TEXT_FILL_COLOR = "#2b1b0e";
export const DEFAULT_TEXT_STROKE_COLOR = "#000000";

export function createDefaultEffects(): LayerEffects {
  return {
    dropShadow: { ...DEFAULT_DROP_SHADOW },
    innerShadow: { ...DEFAULT_INNER_SHADOW },
    blur: 0,
    brightness: 100,
    contrast: 100,
    saturate: 100,
  };
}

export const DEFAULT_DOC: HandoutCanvasDocV1 = {
  version: 1,
  pageWidth: DEFAULT_PAGE_WIDTH,
  pageHeight: DEFAULT_PAGE_HEIGHT,
  zoom: 0.9,
  paperColor: "#f6f0de",
  paperOpacity: 1,
  template: "none",
  templateId: null,
  layers: [
    {
      id: "txt_title",
      type: "text",
      name: "TÇðtulo",
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
      imageFit: "fill",
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
        "Funciona como um mini-Canva:\\n\\n- Adicione imagens em retangulos\\n- Crie vÇ­rios textos\\n- Arraste e redimensione\\n- Reordene as camadas no painel",
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
      imageFit: "fill",
      letterSpacing: 0,
      lineHeight: 1.2,
      strokeColor: DEFAULT_TEXT_STROKE_COLOR,
      strokeWidth: 0,
    },
  ],
};
