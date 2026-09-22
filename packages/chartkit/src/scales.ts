import { scaleLinear, scalePoint, scaleTime } from "d3-scale";
import { defaultFormat, extent } from "./utils.js";
import type { CartesianScaleOptions, CartesianScaleType, CartesianScaleValue, ChartDatum } from "./types.js";

type Tick = { key: string; value: CartesianScaleValue; label: string; x: number };

function timeValue(value: unknown): Date | null {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  if (typeof value === "number" && Number.isFinite(value)) return new Date(value);
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
  }
  return null;
}

export function inferCartesianScale(values: unknown[], requested: CartesianScaleType = "auto"): Exclude<CartesianScaleType, "auto"> {
  if (requested !== "auto") return requested;
  const present = values.filter((value) => value !== null && value !== undefined && value !== "");
  if (present.length && present.every((value) => typeof value === "number" && Number.isFinite(value))) return "linear";
  if (present.length && present.every((value) => value instanceof Date && Number.isFinite(value.getTime()))) return "time";
  return "category";
}

export function createCartesianXScale<T extends ChartDatum>(data: T[], xKey: keyof T & string, range: [number, number], options: CartesianScaleOptions = {}) {
  const raw = data.map((row) => row[xKey]);
  const type = inferCartesianScale(raw, options.type);
  const tickCount = Math.max(2, options.tickCount ?? 6);
  if (type === "category") {
    const scale = scalePoint<number>().domain(data.map((_, index) => index)).range(range).padding(.25);
    const maxTicks = Math.min(tickCount, data.length);
    const indexes = data.length <= maxTicks ? data.map((_, index) => index) : Array.from({ length: maxTicks }, (_, index) => Math.round(index * (data.length - 1) / Math.max(maxTicks - 1, 1)));
    const ticks: Tick[] = [...new Set(indexes)].map((index) => {
      const value = String(raw[index] ?? "");
      return { key: `category-${index}`, value, label: options.tickFormatter?.(value) ?? value, x: scale(index) ?? range[0] };
    });
    return { type, position: (index: number) => scale(index) ?? null, value: (index: number) => String(raw[index] ?? "") as CartesianScaleValue, ticks, bandwidth: Math.max(8, Math.abs((scale(1) ?? range[1]) - (scale(0) ?? range[0])) * .72) };
  }
  if (type === "time") {
    const parsed = raw.map(timeValue);
    const clean = parsed.filter((value): value is Date => value !== null);
    const inferred: [Date, Date] = clean.length ? [new Date(Math.min(...clean.map((value) => value.getTime()))), new Date(Math.max(...clean.map((value) => value.getTime())))] : [new Date(0), new Date(86_400_000)];
    const requested = options.domain ? options.domain.map((value) => new Date(value instanceof Date ? value.getTime() : value)) as [Date, Date] : inferred;
    if (requested[0].getTime() === requested[1].getTime()) requested[1] = new Date(requested[1].getTime() + 86_400_000);
    const scale = scaleTime().domain(requested).range(range);
    if (!options.domain) scale.nice(tickCount);
    const formatter = new Intl.DateTimeFormat(options.locale ?? "en-US", { month: "short", day: "numeric", year: requested[1].getUTCFullYear() !== requested[0].getUTCFullYear() ? "numeric" : undefined, timeZone: options.timeZone ?? "UTC" });
    const tickValues = scale.ticks(tickCount);
    const ticks: Tick[] = tickValues.map((value) => ({ key: `time-${value.getTime()}`, value, label: options.tickFormatter?.(value) ?? formatter.format(value), x: scale(value) }));
    const positions = parsed.map((value) => value ? scale(value) : null).filter((value): value is number => value !== null).sort((a, b) => a - b);
    const spacing = positions.slice(1).reduce((minimum, value, index) => Math.min(minimum, value - positions[index]), Number.POSITIVE_INFINITY);
    return { type, position: (index: number) => parsed[index] ? scale(parsed[index]!) : null, value: (index: number) => parsed[index] as CartesianScaleValue | null, ticks, bandwidth: Number.isFinite(spacing) ? Math.max(8, spacing * .72) : 24 };
  }
  const parsed = raw.map((value) => typeof value === "number" && Number.isFinite(value) ? value : null);
  const inferred = extent(parsed);
  const requested = options.domain ? [Number(options.domain[0]), Number(options.domain[1])] as [number, number] : inferred;
  const scale = scaleLinear().domain(requested).range(range);
  if (!options.domain) scale.nice(tickCount);
  const tickValues = scale.ticks(tickCount);
  const ticks: Tick[] = tickValues.map((value) => ({ key: `linear-${value}`, value, label: options.tickFormatter?.(value) ?? defaultFormat(value), x: scale(value) }));
  const positions = parsed.map((value) => value === null ? null : scale(value)).filter((value): value is number => value !== null).sort((a, b) => a - b);
  const spacing = positions.slice(1).reduce((minimum, value, index) => Math.min(minimum, value - positions[index]), Number.POSITIVE_INFINITY);
  return { type, position: (index: number) => parsed[index] === null ? null : scale(parsed[index]!), value: (index: number) => parsed[index] as CartesianScaleValue | null, ticks, bandwidth: Number.isFinite(spacing) ? Math.max(8, spacing * .72) : 24 };
}
