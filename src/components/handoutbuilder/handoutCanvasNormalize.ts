import {
  BLEND_MODE_VALUES,
  DEFAULT_FONT_PRESET,
  FONT_PRESET_IDS,
  SHAPE_FILL_MODE_VALUES,
  SHAPE_IMAGE_FIT_VALUES,
  SHAPE_KIND_VALUES,
  TEMPLATE_IDS,
} from "@/components/handoutbuilder/handoutCanvasOptions";
import type {
  BaseLayer,
  FillPreset,
  HandoutCanvasDocV1,
  HandoutTemplateEntry,
  ImageLayer,
  Layer,
  LayerEffects,
  ShadowEffect,
  ShapeLayer,
  TextLayer,
} from "@/components/handoutbuilder/handoutCanvasTypes";
import {
  DEFAULT_DOC,
  DEFAULT_FILL_STOP_1,
  DEFAULT_FILL_STOP_2,
  DEFAULT_SHAPE_FILL_COLOR,
  DEFAULT_SHAPE_FILL_COLOR_2,
  DEFAULT_TEXT_FILL_COLOR,
  DEFAULT_TEXT_STROKE_COLOR,
  createDefaultEffects,
} from "@/components/handoutbuilder/handoutCanvasDefaults";
import {
  EFFECT_BLUR_MAX,
  EFFECT_BLUR_MIN,
  EFFECT_FILTER_MAX,
  EFFECT_FILTER_MIN,
  EFFECT_SHADOW_BLUR_MAX,
  EFFECT_SHADOW_BLUR_MIN,
  EFFECT_SHADOW_OFFSET_MAX,
  EFFECT_SHADOW_OFFSET_MIN,
  EFFECT_SHADOW_SPREAD_MAX,
  EFFECT_SHADOW_SPREAD_MIN,
  LEGACY_ORIENTATIONS,
  LEGACY_PAGE_SIZE_IDS,
  LEGACY_PAGE_SIZES,
  PAGE_SIZE_MAX,
  PAGE_SIZE_MIN,
  ZOOM_MAX,
  ZOOM_MIN,
} from "@/components/handoutbuilder/handoutCanvasConfig";
import { normalizeFontWeight } from "@/components/handoutbuilder/handoutCanvasFontUtils";
import { clamp } from "@/components/handoutbuilder/handoutCanvasUtils";

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function safeEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T) {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function safeNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function safeString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

export function safeBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function safeArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
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

export function normalizeDocV1(raw: unknown): HandoutCanvasDocV1 | null {
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
  const template = safeEnum(raw.template, TEMPLATE_IDS, DEFAULT_DOC.template);
  const templateId = safeString(raw.templateId, "") || null;

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
    template,
    templateId,
    layers: layers.length ? layers : DEFAULT_DOC.layers,
  };
}

export function normalizeTemplateEntry(raw: unknown): HandoutTemplateEntry | null {
  if (!isObject(raw)) return null;
  const id = safeString(raw.id, "");
  if (!id) return null;
  const doc = normalizeDocV1(raw.doc);
  if (!doc) return null;
  return {
    id,
    label: safeString(raw.label, "Template"),
    description: safeString(raw.description, ""),
    doc,
  };
}

export function normalizeTemplateLibrary(raw: unknown) {
  const entries = safeArray(raw)
    .map(normalizeTemplateEntry)
    .filter((item): item is HandoutTemplateEntry => Boolean(item));
  if (entries.length) return entries;
  return [
    {
      id: "default",
      label: "Base",
      description: "Modelo simples e neutro.",
      doc: DEFAULT_DOC,
    },
  ];
}

export function normalizeFillPreset(raw: unknown): FillPreset | null {
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
