"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { WIDTH } from "./utils.js";

const ChartWidth = createContext(WIDTH);
export type ChartLayoutMode = "compact" | "standard" | "wide";

export function chartLayoutMode(width: number): ChartLayoutMode {
  if (width < 480) return "compact";
  if (width < 760) return "standard";
  return "wide";
}

/** Measure the plot, preserving deterministic server and first client renders. */
export function ResponsiveChart({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(WIDTH);
  useEffect(() => {
    const plot = ref.current?.querySelector<HTMLElement>(".ck-plot");
    if (!plot || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(Math.max(1, Math.round(entry.contentRect.width)));
    });
    observer.observe(plot);
    return () => observer.disconnect();
  }, []);
  return <div className="ck-responsive" data-layout={chartLayoutMode(width)} ref={ref}><ChartWidth.Provider value={width}>{children}</ChartWidth.Provider></div>;
}

export function useChartWidth() { return useContext(ChartWidth); }
export function useChartLayout() { const width = useChartWidth(); return { width, mode: chartLayoutMode(width) }; }
