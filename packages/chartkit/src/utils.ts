import type { ChartDatum, Series } from "./types.js";

export const WIDTH = 800;
export const MARGIN = { top: 28, right: 28, bottom: 44, left: 58 };

export function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function defaultFormat(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: Math.abs(value) >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

export function visibleSeries<T extends ChartDatum>(series: Series<T>[], hidden: Set<string>) {
  return series.filter((item) => !hidden.has(item.dataKey));
}

export function extent(values: Array<number | null>, includeZero = false): [number, number] {
  const clean = values.filter((value): value is number => value !== null && Number.isFinite(value));
  if (!clean.length) return [0, 1];
  let min = Math.min(...clean);
  let max = Math.max(...clean);
  if (includeZero) { min = Math.min(0, min); max = Math.max(0, max); }
  if (min === max) { const pad = Math.abs(min || 1) * .2; min -= pad; max += pad; }
  return [min, max];
}

export function hasUsableData<T extends ChartDatum>(data: T[], keys: string[]) {
  return data.length > 0 && keys.some((key) => data.some((row) => numberValue(row[key]) !== null));
}
