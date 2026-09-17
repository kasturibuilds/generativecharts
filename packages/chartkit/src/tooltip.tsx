"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export type ChartTip = { label: string; x: number; y: number; color?: string } | null;

export function ChartTooltip({ tip }: { tip: ChartTip }) {
  const ref = useRef<HTMLDivElement>(null);
  useBrowserLayoutEffect(() => {
    const element = ref.current;
    const frame = element?.closest(".ck-chart");
    if (!element || !frame || !tip) return;
    const bounds = frame.getBoundingClientRect();
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const left = Math.max(8, Math.min(tip.x - width / 2, bounds.width - width - 8));
    const top = tip.y - height < 8 ? Math.min(tip.y + 24, bounds.height - height - 8) : tip.y - height;
    element.style.left = `${left}px`;
    element.style.top = `${Math.max(8, top)}px`;
  }, [tip]);
  if (!tip) return null;
  return <div className="ck-tooltip" ref={ref} role="status" style={{ left: tip.x, top: tip.y }}>
    {tip.color && <span className="ck-tooltip-dot" style={{ background: tip.color }} />}{tip.label}
  </div>;
}
