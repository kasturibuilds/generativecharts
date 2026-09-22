"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export type ChartTipItem = { label: string; value: string; color: string; active?: boolean };
export type ChartTip = ({ label: string; x: number; y: number; color?: string } | { label: string; x: number; top: number; bottom: number; items: ChartTipItem[] }) | null;

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
    const anchorTop = "y" in tip ? tip.y : tip.top;
    const anchorBottom = "y" in tip ? tip.y : tip.bottom;
    const top = anchorTop - height < 8 ? Math.min(anchorBottom + 16, bounds.height - height - 8) : anchorTop - height;
    element.style.left = `${left}px`;
    element.style.top = `${Math.max(8, top)}px`;
  }, [tip]);
  if (!tip) return null;
  return <div className={`ck-tooltip${"items" in tip ? " ck-comparison-tooltip" : ""}`} ref={ref} role="status" style={{ left: tip.x, top: "y" in tip ? tip.y : tip.top }}>
    {"items" in tip ? <><strong className="ck-tooltip-heading">{tip.label}</strong>{tip.items.map((item) => <span className={`ck-tooltip-row${item.active ? " ck-tooltip-row-active" : ""}`} data-active={item.active || undefined} key={item.label}><span className="ck-tooltip-dot" style={{ background: item.color }} /><span>{item.label}</span><b>{item.value}</b></span>)}</> : <>{tip.color && <span className="ck-tooltip-dot" style={{ background: tip.color }} />}{tip.label}</>}
  </div>;
}
