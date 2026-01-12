import type { CSSProperties } from "react";

export type FontPresetId =
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
export type TextAlign = "left" | "center" | "right";
export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type BlendMode =
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
export type ShapeKind = "rect" | "ellipse" | "triangle" | "diamond" | "hexagon" | "star";
export type ShapeFillMode = "solid" | "linear" | "radial" | "image";
export type ShapeImageFit = "cover" | "contain";
export type TemplateId = "none" | "parchment" | "letter" | "dossier";

export type ShadowEffect = {
  enabled: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
};

export type LayerEffects = {
  dropShadow: ShadowEffect;
  innerShadow: ShadowEffect;
  blur: number;
  brightness: number;
  contrast: number;
  saturate: number;
};

export type BaseLayer = {
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

export type ImageLayer = BaseLayer & {
  type: "image";
  src: string;
  keepAspectRatio: boolean;
};

export type TextLayer = BaseLayer & {
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

export type ShapeLayer = BaseLayer & {
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

export type Layer = ImageLayer | TextLayer | ShapeLayer;

export type HandoutCanvasDocV1 = {
  version: 1;
  pageWidth: number;
  pageHeight: number;
  zoom: number;
  paperColor: string;
  paperOpacity: number;
  template: TemplateId;
  templateId: string | null;
  layers: Layer[];
};

export type CSSVars = CSSProperties & Record<`--${string}`, string>;

export type ContextMenuState = {
  x: number;
  y: number;
  ids: string[];
  primaryId: string | null;
};

export type FillPreset = {
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

export type AssetItem = {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  premium?: boolean;
};

export type AssetGroup = {
  id: string;
  label: string;
  description: string;
  kind: "folder" | "group";
  items: AssetItem[];
  defaultCollapsed?: boolean;
};

export type HandoutTemplateEntry = {
  id: string;
  label: string;
  description: string;
  doc: HandoutCanvasDocV1;
};

export type SnapGuide = {
  axis: "x" | "y";
  value: number;
};
