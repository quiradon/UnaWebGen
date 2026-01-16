import type {
  LayerEffects,
  ShadowEffect,
  ShapeImageFit,
  ShapeLayer,
  TextLayer,
} from "@/components/handoutbuilder/handoutCanvasTypes";
import { DEFAULT_SHAPE_FILL_COLOR, DEFAULT_SHAPE_FILL_COLOR_2, DEFAULT_TEXT_FILL_COLOR } from "@/components/handoutbuilder/handoutCanvasDefaults";
import { clamp } from "@/components/handoutbuilder/handoutCanvasUtils";

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

export function applyAlphaToColor(color: string, opacity: number) {
  const clamped = clamp(opacity, 0, 1);
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamped})`;
}

export function toSvgColor(color: string) {
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

export function getTextEffectStyle(effects: LayerEffects) {
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

export function getLayerEffectStyle(effects: LayerEffects) {
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
  if (fit === "fit") return "xMidYMid meet";
  if (fit === "fill" || fit === "crop") return "xMidYMid slice";
  return "xMidYMid meet";
}

function getSortedStops(stop1: number, stop2: number) {
  const first = clamp(stop1, 0, 100);
  const second = clamp(stop2, 0, 100);
  return first <= second ? [first, second] : [second, first];
}

export function getShapeFill(layer: ShapeLayer, idBase: string) {
  const primary = layer.fillColor || DEFAULT_SHAPE_FILL_COLOR;
  const secondary = layer.fillColor2 || primary;
  const [stop1, stop2] = getSortedStops(layer.fillStop1, layer.fillStop2);
  const baseWidth = Math.max(1, layer.width);
  const baseHeight = Math.max(1, layer.height);
  const centerX = baseWidth / 2;
  const centerY = baseHeight / 2;
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
        x2={baseWidth}
        y2="0"
        gradientUnits="userSpaceOnUse"
        gradientTransform={`rotate(${layer.gradientAngle} ${centerX} ${centerY})`}
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
      <radialGradient id={gradientId} cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
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
  const preserveAspectRatio = getImagePreserveAspectRatio(layer.imageFit);
  const defs = (
    <pattern id={patternId} patternUnits="userSpaceOnUse" width={baseWidth} height={baseHeight}>
      <image
        href={layer.imageSrc}
        x="0"
        y="0"
        width={baseWidth}
        height={baseHeight}
        preserveAspectRatio={preserveAspectRatio}
      />
    </pattern>
  );
  return { fill: `url(#${patternId})`, defs };
}

export function getTextFillStyle(layer: TextLayer) {
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
    const backgroundSize =
      layer.imageFit === "fill" || layer.imageFit === "crop"
        ? "cover"
        : layer.imageFit === "fit"
          ? "contain"
          : "auto";
    return {
      ...baseStyle,
      backgroundImage: `url(${layer.imageSrc})`,
      backgroundSize,
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
