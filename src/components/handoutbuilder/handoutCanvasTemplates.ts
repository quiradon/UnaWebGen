import { DEFAULT_FONT_PRESET, FONT_PRESETS } from "@/components/handoutbuilder/handoutCanvasOptions";
import type { CSSVars, HandoutCanvasDocV1 } from "@/components/handoutbuilder/handoutCanvasTypes";
import { applyAlphaToColor } from "@/components/handoutbuilder/handoutCanvasEffects";

export function getTemplateVars(doc: HandoutCanvasDocV1): CSSVars {
  return {
    "--handout-paper": applyAlphaToColor(doc.paperColor, doc.paperOpacity),
    "--handout-font": FONT_PRESETS[DEFAULT_FONT_PRESET].stack,
    "--handout-preview-ratio": `${doc.pageWidth} / ${doc.pageHeight}`,
  };
}

export function getPreviewSize(width: number, height: number, maxSize: number) {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const scale = Math.min(maxSize / safeWidth, maxSize / safeHeight, 1);
  return {
    width: Math.max(1, Math.round(safeWidth * scale)),
    height: Math.max(1, Math.round(safeHeight * scale)),
  };
}

export function getTemplatePreviewStyle(doc: HandoutCanvasDocV1, maxSize: number): CSSVars {
  const size = getPreviewSize(doc.pageWidth, doc.pageHeight, maxSize);
  return {
    ...getTemplateVars(doc),
    width: `${size.width}px`,
    height: `${size.height}px`,
  };
}

export function getTemplatePreviewLines(doc: HandoutCanvasDocV1, maxLines = 3) {
  const lines: string[] = [];
  for (const layer of doc.layers) {
    if (layer.type !== "text") continue;
    const rawLines = layer.text.split("\n");
    for (const line of rawLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      lines.push(trimmed);
      if (lines.length >= maxLines) return lines;
    }
  }
  return lines;
}
