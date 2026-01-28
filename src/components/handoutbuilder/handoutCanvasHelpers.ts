export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler arquivo."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

export async function getImageNaturalSize(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
    };
    img.onerror = () => reject(new Error("Falha ao carregar imagem."));
    img.src = src;
  });
}

export async function readFileText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler arquivo."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsText(file);
  });
}

export function isSvgFile(file: File) {
  return file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
}

type SvgColorOptions = {
  fillEnabled?: boolean;
  fill?: string;
  strokeEnabled?: boolean;
  stroke?: string;
};

function shouldReplaceSvgPaint(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "none") return false;
  if (normalized.startsWith("url(")) return false;
  return true;
}

function updateSvgStyle(style: string, options: SvgColorOptions) {
  const entries = style
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const idx = item.indexOf(":");
      if (idx === -1) return null;
      const key = item.slice(0, idx).trim();
      const value = item.slice(idx + 1).trim();
      return { key, lowerKey: key.toLowerCase(), value };
    })
    .filter((item): item is { key: string; lowerKey: string; value: string } => Boolean(item));

  if (options.fillEnabled && options.fill) {
    for (const entry of entries) {
      if (entry.lowerKey !== "fill") continue;
      if (shouldReplaceSvgPaint(entry.value)) entry.value = options.fill;
    }
  }

  if (options.strokeEnabled && options.stroke) {
    for (const entry of entries) {
      if (entry.lowerKey !== "stroke") continue;
      if (shouldReplaceSvgPaint(entry.value)) entry.value = options.stroke;
    }
  }

  return entries.map((entry) => `${entry.key}: ${entry.value}`).join("; ");
}

export function applySvgColors(svgText: string, options: SvgColorOptions) {
  const { fillEnabled, fill, strokeEnabled, stroke } = options;
  if (!fillEnabled && !strokeEnabled) return svgText;
  if (typeof DOMParser === "undefined" || typeof XMLSerializer === "undefined") return svgText;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  if (doc.querySelector("parsererror")) return svgText;
  const svg = doc.querySelector("svg");
  if (!svg) return svgText;

  if (!svg.getAttribute("xmlns")) {
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }

  if (fillEnabled && fill) svg.setAttribute("fill", fill);
  if (strokeEnabled && stroke) svg.setAttribute("stroke", stroke);

  const nodes = [svg, ...Array.from(svg.querySelectorAll("*"))];
  nodes.forEach((node) => {
    if (fillEnabled && fill) {
      const fillAttr = node.getAttribute("fill");
      if (fillAttr && shouldReplaceSvgPaint(fillAttr)) {
        node.setAttribute("fill", fill);
      }
    }

    if (strokeEnabled && stroke) {
      const strokeAttr = node.getAttribute("stroke");
      if (strokeAttr && shouldReplaceSvgPaint(strokeAttr)) {
        node.setAttribute("stroke", stroke);
      }
    }

    const style = node.getAttribute("style");
    if (style) {
      const nextStyle = updateSvgStyle(style, options);
      if (nextStyle !== style) node.setAttribute("style", nextStyle);
    }
  });

  return new XMLSerializer().serializeToString(svg);
}

export function buildSvgDataUrl(svgText: string) {
  const encoded = btoa(unescape(encodeURIComponent(svgText)));
  return `data:image/svg+xml;base64,${encoded}`;
}

export function buildSvgImageSrc(svgText: string, options: SvgColorOptions) {
  const nextSvg = applySvgColors(svgText, options);
  return buildSvgDataUrl(nextSvg);
}
