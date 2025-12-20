export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeHexColor(value: string) {
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
