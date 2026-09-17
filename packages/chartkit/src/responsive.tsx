"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { WIDTH } from "./utils.js";

const ChartWidth = createContext(WIDTH);

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
  return <div className="ck-responsive" ref={ref}><ChartWidth.Provider value={width}>{children}</ChartWidth.Provider></div>;
}

export function useChartWidth() { return useContext(ChartWidth); }
