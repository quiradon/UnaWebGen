import { FONT_WEIGHT_VALUES } from "@/components/handoutbuilder/handoutCanvasOptions";
import type { FontWeight } from "@/components/handoutbuilder/handoutCanvasTypes";

export function normalizeFontWeight(value: unknown, fallback: FontWeight) {
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

export function getClosestWeight(weights: readonly FontWeight[], target: FontWeight) {
  if (!weights.length) return target;
  return weights.reduce((closest, weight) => {
    const currentDiff = Math.abs(weight - target);
    const closestDiff = Math.abs(closest - target);
    if (currentDiff < closestDiff) return weight;
    if (currentDiff === closestDiff && weight > closest) return weight;
    return closest;
  }, weights[0]);
}

export function getRegularWeight(weights: readonly FontWeight[]) {
  if (weights.includes(400)) return 400;
  return getClosestWeight(weights, 400);
}

export function getBoldWeight(weights: readonly FontWeight[]) {
  const bolds = weights.filter((weight) => weight >= 600);
  if (bolds.length) return bolds.includes(700) ? 700 : bolds[bolds.length - 1];
  return getClosestWeight(weights, 700);
}
