import { FONT_PRESETS } from "@/components/handoutbuilder/handoutCanvasOptions";
import type { Layer, ShapeLayer, TextLayer } from "@/components/handoutbuilder/handoutCanvasTypes";
import { clamp } from "@/components/handoutbuilder/handoutCanvasUtils";

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

export function getClipMaskStyle(layer: Layer, maskLayer: ShapeLayer | TextLayer) {
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
