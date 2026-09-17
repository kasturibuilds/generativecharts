"use client";

import { useId, useMemo, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { scaleBand, scaleLinear, scalePoint } from "d3-scale";
import { area, arc, curveLinear, curveMonotoneX, line, pie } from "d3-shape";
import { ticks } from "d3-array";
import { ChartTooltip } from "./tooltip.js";
import { ResponsiveChart, useChartWidth } from "./responsive.js";
import { resolveTheme, themeStyle } from "./themes.js";
import { defaultFormat, extent, hasUsableData, MARGIN, numberValue, visibleSeries } from "./utils.js";
import type {
  AreaChartProps, BarChartProps, ChartAppearance, ChartDatum, CohortChartProps, CommonChartProps, HeatmapChartProps,
  LineChartProps, PieChartProps, RadarChartProps, ResolvedChartTheme, ScatterChartProps, Series, TerrainChartProps,
} from "./types.js";

type ChartFamily = "bar" | "line" | "area" | "scatter" | "pie" | "radar" | "heatmap" | "cohort" | "terrain" | "chart";
type TooltipState = { label: string; x: number; y: number; color?: string } | null;
type LegendItem = { key: string; label: string; color: string };

function useSeriesState<T extends ChartDatum>(series: Series<T>[]) {
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const hidden = useMemo(() => new Set(hiddenKeys), [hiddenKeys]);
  const toggle = (key: string) => setHiddenKeys((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  return { hidden, toggle, active: visibleSeries(series, hidden) };
}

function ChartFrame<T extends ChartDatum>({
  figureLabel, title, description, source, theme, appearance = "light", className = "", style, animate = true,
  showLegend = true, legend = [], hidden = new Set(), onLegendToggle, tooltip, children, family = "chart",
}: Pick<CommonChartProps<T>, "figureLabel" | "title" | "description" | "source" | "theme" | "appearance" | "height" | "className" | "style" | "animate" | "showLegend"> & {
  legend?: LegendItem[]; hidden?: Set<string>; onLegendToggle?: (key: string) => void; tooltip?: TooltipState; children: ReactNode; family?: ChartFamily;
}) {
  const resolved = resolveTheme(theme, appearance);
  return (
    <figure className={`ck-chart ck-${family}${animate ? " ck-animate" : ""} ${className}`.trim()} style={{ ...themeStyle(resolved), ...style }} data-family={family} data-theme={resolved.id}>
      {(title || description) && <figcaption className="ck-header">{figureLabel !== "" && <span className="ck-figure-label">{figureLabel ?? `Figure / ${family}`}</span>}{title && <h3 className="ck-title">{title}</h3>}{description && <p className="ck-description">{description}</p>}</figcaption>}
      <ChartTooltip tip={tooltip ?? null} />
      <div className="ck-plot">{children}</div>
      {showLegend && legend.length > 1 && <div className="ck-legend" aria-label="Chart series">
        {legend.map((item) => onLegendToggle ? <button aria-pressed={!hidden.has(item.key)} key={item.key} onClick={() => onLegendToggle(item.key)} type="button"><span className="ck-swatch" style={{ background: item.color }} />{item.label}</button> : <span className="ck-legend-item" key={item.key}><span className="ck-swatch" style={{ background: item.color }} />{item.label}</span>)}
      </div>}
      {source && <p className="ck-source"><span>Source · {source}</span><span className="ck-signature">Generative Charts</span></p>}
    </figure>
  );
}

function EmptyChart<T extends ChartDatum>(props: CommonChartProps<T>) {
  return <ChartFrame {...props}><div className="ck-empty" role="status"><strong>No chart data</strong><span>Add at least one finite numeric value to render this chart.</span></div></ChartFrame>;
}

function paletteFor<T extends ChartDatum>(theme: ResolvedChartTheme, series: Series<T>[]) {
  return series.map((item, index) => item.color ?? theme.tokens.palette[index % theme.tokens.palette.length]);
}

function legendFor<T extends ChartDatum>(series: Series<T>[], colors: string[]): LegendItem[] {
  return series.map((item, index) => ({ key: item.dataKey, label: item.label, color: colors[index] }));
}

function markEvents<T extends ChartDatum>(
  datum: T, series: Series<T>, value: number, label: string,
  setTooltip: (tooltip: TooltipState) => void, props: CommonChartProps<T>, color?: string,
) {
  const formatted = props.valueFormatter?.(value) ?? defaultFormat(value);
  const text = props.getDatumLabel?.(datum, series.label, value) ?? `${label} · ${series.label}: ${formatted}`;
  const show = (event: MouseEvent<SVGElement> | FocusEvent<SVGElement>) => {
    if (props.showTooltip === false) return;
    const mark = event.currentTarget;
    const frame = mark.closest(".ck-chart")?.getBoundingClientRect();
    const bounds = mark.getBoundingClientRect();
    setTooltip({ label: text, color, x: frame ? bounds.left - frame.left + bounds.width / 2 : 0, y: frame ? bounds.top - frame.top - 10 : 0 });
  };
  const activate = () => props.onDatumClick?.(datum, series);
  return {
    tabIndex: 0, role: "button", "aria-label": text,
    onMouseEnter: show, onMouseLeave: () => setTooltip(null), onFocus: show, onBlur: () => setTooltip(null), onClick: (event: MouseEvent<SVGElement>) => { show(event); activate(); },
    onKeyDown: (event: KeyboardEvent<SVGElement>) => { if (event.key === "Escape") setTooltip(null); if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } },
  };
}

function SvgCanvas({ id, height, label, description, children }: { id: string; height: number; label: string; description?: string; children: ReactNode }) {
  const WIDTH = useChartWidth();
  return <svg aria-describedby={`${id}-desc`} aria-label={label} className="ck-svg" role="img" viewBox={`0 0 ${WIDTH} ${height}`}>
    <desc id={`${id}-desc`}>{description ?? `${label} rendered with Generative Charts.`}</desc>{children}
  </svg>;
}

function GridY({ domain, y, plotRight, format }: { domain: [number, number]; y: (value: number) => number; plotRight: number; format: (value: number) => string }) {
  return <>{ticks(domain[0], domain[1], 4).map((tick) => <g key={tick}><line className={`ck-grid${tick === 0 ? " ck-zero-grid" : ""}`} x1={MARGIN.left} x2={plotRight} y1={y(tick)} y2={y(tick)} /><text className="ck-axis-text" x={MARGIN.left - 12} y={y(tick) + 4} textAnchor="end">{format(tick)}</text></g>)}</>;
}

type RadialItem<T extends ChartDatum> = { row: T; name: string; value: number };

function radialEllipsePoint(angle: number, radius: number, originX: number, originY: number, scaleY: number) {
  return { x: originX + Math.sin(angle) * radius, y: originY - Math.cos(angle) * radius * scaleY };
}

function radialWallPath(startAngle: number, endAngle: number, radius: number, originX: number, originY: number, scaleY: number, depthY: number) {
  if (Math.abs(endAngle - startAngle) <= .001) return null;
  const start = radialEllipsePoint(startAngle, radius, originX, originY, scaleY); const end = radialEllipsePoint(endAngle, radius, originX, originY, scaleY);
  const clockwise = endAngle > startAngle; const largeArcFlag = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0; const sweepFlag = clockwise ? 1 : 0; const reverseSweepFlag = clockwise ? 0 : 1; const ry = radius * scaleY;
  return [`M ${start.x} ${start.y}`, `A ${radius} ${ry} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`, `L ${end.x} ${end.y + depthY}`, `A ${radius} ${ry} 0 ${largeArcFlag} ${reverseSweepFlag} ${start.x} ${start.y + depthY}`, "Z"].join(" ");
}

function radialAngleSegments(startAngle: number, endAngle: number, visibleRanges: Array<[number, number]>) {
  const clockwise = endAngle > startAngle;
  return visibleRanges.map(([rangeStart, rangeEnd]) => { const low = Math.max(Math.min(startAngle, endAngle), rangeStart); const high = Math.min(Math.max(startAngle, endAngle), rangeEnd); if (high - low <= .001) return null; return clockwise ? { startAngle: low, endAngle: high } : { startAngle: high, endAngle: low }; }).filter((segment): segment is { startAngle: number; endAngle: number } => segment !== null);
}

function monoRadialColors(appearance: ChartAppearance) {
  return appearance === "dark" ? {
    tops: ["#4a4943", "#393832", "#44433d", "#30302b", "#505048", "#3f3e38"],
    sides: ["#2e2d28", "#25241f", "#30302a", "#20201c", "#393832", "#2a2924"],
    inner: ["#383731", "#2d2c27", "#373630", "#292823", "#403f38", "#33322c"],
    edge: "#94928b", wallEdge: "#53514b", leader: "#d7d3ca", muted: "#807e78", text: "#f2eee5", background: "#11100d",
  } : {
    tops: ["#f7f7f4", "#f2f2ee", "#ecece7", "#f8f8f5", "#e6e6df", "#f0f0ea"],
    sides: ["#d6d6cd", "#cfcfc5", "#d9d9d1", "#c8c8be", "#deded6", "#d2d2c8"],
    inner: ["#eeeeea", "#e8e8e2", "#f3f3ef", "#e1e1da", "#f6f6f2", "#e5e5de"],
    edge: "#555550", wallEdge: "#a8a8a0", leader: "#383834", muted: "#777771", text: "#11110f", background: "#f7f7f2",
  };
}

function rowTypeCode(row: ChartDatum) {
  const value = row.type ?? row.Type ?? row.categoryType ?? row.segmentType;
  if (typeof value !== "string") return "";
  const normalized = value.toLowerCase();
  return normalized.includes("enh") ? "ENH" : normalized.includes("nat") ? "NAT" : value.slice(0, 3).toUpperCase();
}

function MonoTypeLegend({ stroke }: { stroke: string }) {
  const WIDTH = useChartWidth();
  return <g className="ck-mono-type-legend" transform={`translate(${WIDTH - 410} 28)`}>
    <rect fill="none" height="20" stroke={stroke} width="34" />
    <text x="48" y="15">AI-NATIVE</text>
    <rect fill="none" height="20" stroke={stroke} strokeDasharray="6 4" width="34" x="210" />
    <text x="258" y="15">AI-ENHANCED</text>
  </g>;
}

function BarChartContent<T extends ChartDatum>({ variant = "vertical", layout = "grouped", ...props }: BarChartProps<T>) {
  const WIDTH = useChartWidth();
  const { data, categoryKey, series, height = 380 } = props;
  const id = useId().replace(/:/g, ""); const theme = resolveTheme(props.theme, props.appearance); const colors = theme.familyId === "mono-editorial" ? series.map((_, index) => index === 0 ? theme.tokens.text : theme.tokens.axis) : paletteFor(theme, series);
  const { hidden, toggle, active } = useSeriesState(series); const [tooltip, setTooltip] = useState<TooltipState>(null);
  if (!hasUsableData(data, series.map((item) => item.dataKey))) return <EmptyChart {...props} />;
  const labels = data.map((row) => String(row[categoryKey] ?? "")); const values = data.flatMap((row) => active.map((item) => numberValue(row[item.dataKey]))); const monoRanked = theme.familyId === "mono-editorial" && variant === "horizontal" && layout === "grouped" && active.length === 1 && values.every((value) => value === null || value >= 0); const top = monoRanked ? 44 : 18; const bottom = monoRanked ? 60 : 42; const left = variant === "horizontal" ? (monoRanked ? Math.min(230, WIDTH * .5) : Math.min(112, WIDTH * .36)) : MARGIN.left; const right = monoRanked ? 38 : 28;
  const plotW = WIDTH - left - right; const plotH = height - top - bottom;
  const stackExtents = data.flatMap((row) => { let positive = 0; let negative = 0; active.forEach((item) => { const value = numberValue(row[item.dataKey]) ?? 0; if (value >= 0) positive += value; else negative += value; }); return [negative, positive]; });
  const domain = extent(layout === "stacked" ? stackExtents : values, true); const format = props.valueFormatter ?? defaultFormat;
  const xCategory = scaleBand<string>().domain(labels).range([left, left + plotW]).padding(.2); const yCategory = scaleBand<string>().domain(labels).range([top, top + plotH]).padding(.2);
  const yValue = scaleLinear().domain(domain).nice().range([top + plotH, top]); const xValue = scaleLinear().domain(domain).nice().range([left, left + plotW]);
  return <ChartFrame {...props} family="bar" height={height} legend={legendFor(series, colors)} hidden={hidden} onLegendToggle={toggle} tooltip={tooltip}>
    <SvgCanvas id={id} height={height} label={props.ariaLabel ?? props.title ?? "Bar chart"} description={props.description}>
      {theme.familyId !== "mono-editorial" && <defs>{series.map((item, index) => <linearGradient id={`${id}-bar-${index}`} key={item.dataKey} x1="0" x2={variant === "horizontal" ? "1" : "0"} y1="0" y2={variant === "horizontal" ? "0" : "1"}>{theme.familyId === "neon-instruments" ? <><stop offset="0%" stopColor={colors[index]} /><stop offset="100%" stopColor={colors[index]} stopOpacity=".78" /></> : <><stop offset="0%" stopColor={colors[index]} /><stop offset="100%" stopColor={colors[index]} stopOpacity=".88" /></>}</linearGradient>)}<linearGradient id={`${id}-bar-negative`} x1="0" x2={variant === "horizontal" ? "1" : "0"} y1="0" y2={variant === "horizontal" ? "0" : "1"}><stop offset="0%" stopColor="var(--ck-negative)" /><stop offset="100%" stopColor="var(--ck-negative)" stopOpacity={theme.familyId === "neon-instruments" ? ".78" : ".88"} /></linearGradient></defs>}
      {variant === "vertical" ? <>
        <GridY domain={yValue.domain() as [number, number]} y={yValue} plotRight={left + plotW} format={format} />
        {data.flatMap((row, rowIndex) => { let positive = 0; let negative = 0; return active.map((item) => { const originalIndex = series.indexOf(item); const value = numberValue(row[item.dataKey]) ?? 0; const start = layout === "stacked" ? (value >= 0 ? positive : negative) : 0; const end = start + value; if (layout === "stacked") { if (value >= 0) positive = end; else negative = end; } const band = xCategory(labels[rowIndex]) ?? left; const groupW = xCategory.bandwidth(); const width = layout === "stacked" ? groupW : groupW / Math.max(active.length, 1); const x = band + (layout === "stacked" ? 0 : active.indexOf(item) * width); const y0 = yValue(start); const y1 = yValue(end); const markColor = value < 0 ? theme.tokens.negative : colors[originalIndex]; return <rect {...markEvents(row, item, value, labels[rowIndex], setTooltip, props, markColor)} className={`ck-mark ck-bar-mark ck-bar-vertical${value < 0 ? " ck-negative-mark" : ""}${theme.familyId === "mono-editorial" ? ` ck-mono-bar ck-mono-bar-${originalIndex % 2 === 0 ? "primary" : "secondary"}` : ""}`} data-sign={value < 0 ? "negative" : "positive"} key={`${rowIndex}-${item.dataKey}`} x={x} y={Math.min(y0, y1)} width={Math.max(width - 2, 1)} height={Math.abs(y1 - y0)} rx={theme.tokens.markRadius} fill={theme.familyId === "mono-editorial" ? "transparent" : `url(#${id}-bar-${value < 0 ? "negative" : originalIndex})`} stroke={theme.familyId === "mono-editorial" ? markColor : "var(--ck-mark-highlight)"} strokeOpacity={theme.familyId === "mono-editorial" ? 1 : .34} style={{ "--ck-index": rowIndex + originalIndex } as CSSProperties} />; }); })}
        {labels.map((label) => <text className="ck-axis-text" key={label} x={(xCategory(label) ?? 0) + xCategory.bandwidth() / 2} y={height - 14} textAnchor="middle">{label}</text>)}
      </> : monoRanked ? <>
        {ticks(domain[0], domain[1], 5).filter((tick) => tick >= 0).map((tick) => <g key={tick}><line className={`ck-grid ck-ranked-grid${tick === 0 ? " ck-zero-grid" : ""}`} x1={xValue(tick)} x2={xValue(tick)} y1={top} y2={top + plotH} /><text className="ck-axis-text" x={xValue(tick)} y={height - 28} textAnchor="middle">{format(tick)}</text></g>)}
        <text className="ck-ranked-header" x="12" y="24">#</text><text className="ck-ranked-header" x="48" y="24">PRODUCT</text><text className="ck-ranked-header" textAnchor="end" x={WIDTH - 20} y="24">{active[0]?.label.toUpperCase()}</text>
        {data.map((row, rowIndex) => { const item = active[0]; const value = Math.max(0, numberValue(row[item.dataKey]) ?? 0); const y = (yCategory(labels[rowIndex]) ?? top) + yCategory.bandwidth() / 2; const barHeight = Math.min(24, yCategory.bandwidth() * .78); const enhanced = rowTypeCode(row) === "ENH"; const rankedProps = { ...props, showTooltip: props.showTooltip === true }; return <g key={`${rowIndex}-${item.dataKey}`}><line className="ck-ranked-row" x1="24" x2={WIDTH - 20} y1={y + yCategory.bandwidth() / 2 + 5} y2={y + yCategory.bandwidth() / 2 + 5} /><text className={`ck-ranked-rank${rowIndex === 0 ? " ck-ranked-lead" : ""}`} x="24" y={y + 4}>{String(rowIndex + 1).padStart(2, "0")}</text><text className="ck-ranked-product" x="48" y={y + 4}>{labels[rowIndex]}</text><rect {...markEvents(row, item, value, labels[rowIndex], setTooltip, rankedProps, "var(--ck-text)")} className="ck-mark ck-bar-mark ck-bar-horizontal ck-ranked-bar" fill={rowIndex === 0 ? "var(--ck-surface)" : "transparent"} height={barHeight} rx="1" stroke={rowIndex === 0 ? "var(--ck-text)" : "var(--ck-axis)"} strokeDasharray={enhanced ? "6 4" : undefined} style={{ "--ck-index": rowIndex } as CSSProperties} width={Math.max(xValue(value) - left, 4)} x={left} y={y - barHeight / 2} /><text className={`ck-ranked-value${rowIndex === 0 ? " ck-ranked-lead" : ""}`} textAnchor="end" x={WIDTH - 20} y={y + 4}>{format(value)}</text></g>; })}
        <line className="ck-axis" x1={left} x2={left + plotW} y1={top + plotH} y2={top + plotH} />
        <text className="ck-ranked-axis-title" textAnchor="middle" x={left + plotW / 2} y={height - 7}>{active[0]?.label.toUpperCase()}</text>
      </> : <>
        {ticks(domain[0], domain[1], 4).map((tick) => <g key={tick}><line className={`ck-grid${tick === 0 ? " ck-zero-grid" : ""}`} x1={xValue(tick)} x2={xValue(tick)} y1={top} y2={top + plotH} /><text className="ck-axis-text" x={xValue(tick)} y={height - 14} textAnchor="middle">{format(tick)}</text></g>)}
        {data.flatMap((row, rowIndex) => { let positive = 0; let negative = 0; return active.map((item) => { const originalIndex = series.indexOf(item); const value = numberValue(row[item.dataKey]) ?? 0; const start = layout === "stacked" ? (value >= 0 ? positive : negative) : 0; const end = start + value; if (layout === "stacked") { if (value >= 0) positive = end; else negative = end; } const band = yCategory(labels[rowIndex]) ?? top; const groupH = yCategory.bandwidth(); const barH = layout === "stacked" ? groupH : groupH / Math.max(active.length, 1); const y = band + (layout === "stacked" ? 0 : active.indexOf(item) * barH); const x0 = xValue(start); const x1 = xValue(end); const markColor = value < 0 ? theme.tokens.negative : colors[originalIndex]; return <rect {...markEvents(row, item, value, labels[rowIndex], setTooltip, props, markColor)} className={`ck-mark ck-bar-mark ck-bar-horizontal${value < 0 ? " ck-negative-mark" : ""}${theme.familyId === "mono-editorial" ? ` ck-mono-bar ck-mono-bar-${originalIndex % 2 === 0 ? "primary" : "secondary"}` : ""}`} data-sign={value < 0 ? "negative" : "positive"} key={`${rowIndex}-${item.dataKey}`} x={Math.min(x0, x1)} y={y} width={Math.abs(x1 - x0)} height={Math.max(barH - 2, 1)} rx={theme.tokens.markRadius} fill={theme.familyId === "mono-editorial" ? "transparent" : `url(#${id}-bar-${value < 0 ? "negative" : originalIndex})`} stroke={theme.familyId === "mono-editorial" ? markColor : "var(--ck-mark-highlight)"} strokeOpacity={theme.familyId === "mono-editorial" ? 1 : .34} style={{ "--ck-index": rowIndex + originalIndex } as CSSProperties} />; }); })}
        {labels.map((label) => <text className="ck-axis-text" key={label} x={left - 12} y={(yCategory(label) ?? 0) + yCategory.bandwidth() / 2 + 4} textAnchor="end">{label}</text>)}
      </>}
    </SvgCanvas>
  </ChartFrame>;
}

function CartesianBase<T extends ChartDatum>({ kind, props, stacked = false }: { kind: "line" | "area"; props: LineChartProps<T> | AreaChartProps<T>; stacked?: boolean }) {
  const WIDTH = useChartWidth();
  const { data, xKey, series, height = 380 } = props; const id = useId().replace(/:/g, ""); const theme = resolveTheme(props.theme, props.appearance); const colors = paletteFor(theme, series);
  const { hidden, toggle, active } = useSeriesState(series); const [tooltip, setTooltip] = useState<TooltipState>(null);
  if (!hasUsableData(data, series.map((item) => item.dataKey))) return <EmptyChart {...props} />;
  const compact = kind === "line" && (props as LineChartProps<T>).variant === "sparkline";
  const labels = data.map((row) => String(row[xKey] ?? "")); const plotRight = WIDTH - (compact ? 18 : MARGIN.right); const plotBottom = height - (compact ? 18 : MARGIN.bottom);
  const rowTotals = data.map((row) => active.reduce((sum, item) => sum + Math.max(0, numberValue(row[item.dataKey]) ?? 0), 0));
  const domain = extent(stacked ? rowTotals : data.flatMap((row) => active.map((item) => numberValue(row[item.dataKey]))), kind === "area");
  const x = scalePoint<string>().domain(labels).range([compact ? 18 : MARGIN.left, plotRight]).padding(.25); const y = scaleLinear().domain(domain).nice().range([plotBottom, compact ? 18 : MARGIN.top]);
  const smooth = props.curve !== "linear"; const curve = smooth ? curveMonotoneX : curveLinear; const format = props.valueFormatter ?? defaultFormat;
  const cumulative = data.map(() => 0);
  return <ChartFrame {...props} family={kind} height={height} legend={legendFor(series, colors)} hidden={hidden} onLegendToggle={toggle} tooltip={tooltip}>
    <SvgCanvas id={id} height={height} label={props.ariaLabel ?? props.title ?? `${kind} chart`} description={props.description}>
      {kind === "area" && <defs>{active.map((item) => { const originalIndex = series.indexOf(item); const materialId = `${id}-${kind}-material-${originalIndex}`; return theme.familyId === "mono-editorial" ? <pattern height="6" id={materialId} key={materialId} patternUnits="userSpaceOnUse" width="6"><rect fill="var(--ck-area-end)" height="6" width="6" /><path d="M 0 0 L 6 0 M 0 3 L 6 3 M 0 6 L 6 6 M 0 0 L 0 6 M 3 0 L 3 6 M 6 0 L 6 6" fill="none" stroke="var(--ck-axis)" strokeWidth=".65" /></pattern> : <linearGradient id={materialId} key={materialId} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--ck-area-start)" /><stop offset="62%" stopColor={colors[originalIndex]} stopOpacity=".2" /><stop offset="100%" stopColor="var(--ck-area-end)" stopOpacity=".16" /></linearGradient>; })}</defs>}
      {!compact && <><text className="ck-axis-title" x={MARGIN.left} y={MARGIN.top - 8}>{active[0]?.label.toUpperCase()}</text><GridY domain={y.domain() as [number, number]} y={y} plotRight={plotRight} format={format} /></>}
      {active.map((item) => {
        const originalIndex = series.indexOf(item); const lower = [...cumulative];
        const monoSecondary = theme.familyId === "mono-editorial" && originalIndex > 0;
        const traceColor = theme.familyId === "mono-editorial" ? "var(--ck-text)" : colors[originalIndex];
        const points = data.map((row, index) => { const value = numberValue(row[item.dataKey]) ?? 0; const total = stacked ? cumulative[index] + value : value; if (stacked) cumulative[index] = total; return { x: x(labels[index]) ?? 0, y: y(total), y0: y(stacked ? lower[index] : Math.min(0, domain[0])), value, row, label: labels[index] }; });
        const linePath = line<typeof points[number]>().x((p) => p.x).y((p) => p.y).curve(curve)(points) ?? "";
        const areaPath = area<typeof points[number]>().x((p) => p.x).y0((p) => p.y0).y1((p) => p.y).curve(curve)(points) ?? "";
        const last = points[points.length - 1]; const labelX = Math.min(last.x + 14, plotRight - 160); const labelY = Math.max(MARGIN.top + 4, last.y - 34);
        return <g key={item.dataKey}>
          {kind === "area" && <path className="ck-area-material ck-mark" d={areaPath} fill={`url(#${id}-${kind}-material-${originalIndex})`} stroke="none" style={{ "--ck-index": originalIndex } as CSSProperties} />}
          {kind === "line" && <defs><mask id={`${id}-draw-${originalIndex}`} maskUnits="userSpaceOnUse" x="0" y="0" width={WIDTH} height={height}><path className="ck-line-draw" d={linePath} fill="none" pathLength="1" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24" style={{ "--ck-index": originalIndex } as CSSProperties} /></mask></defs>}
          <g mask={kind === "line" ? `url(#${id}-draw-${originalIndex})` : undefined}>
            {theme.familyId !== "mono-editorial" && <path className={`ck-line-underlay${kind === "area" ? " ck-line-reveal" : ""}`} d={linePath} fill="none" stroke="var(--ck-line-underlay)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={kind === "line" ? 9 : 7} />}
            <path className={`ck-line-trace${kind === "area" ? " ck-mark" : ""}${monoSecondary ? " ck-line-secondary" : ""}`} d={linePath} fill="none" stroke={traceColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth={kind === "line" ? 3 : 2.5} style={{ "--ck-index": originalIndex } as CSSProperties} />
          </g>
          {(kind === "area" || (props as LineChartProps<T>).showPoints !== false) && points.map((point, index) => <g key={index}>{(index === 0 || index === points.length - 1) && <circle className="ck-point-halo" cx={point.x} cy={point.y} fill="var(--ck-point-halo)" r="9" />}<circle {...markEvents(point.row, item, point.value, point.label, setTooltip, props, traceColor)} className="ck-mark ck-point" cx={point.x} cy={point.y} r={index === 0 || index === points.length - 1 ? 4.5 : 3.5} fill="var(--ck-point-fill)" stroke={traceColor} strokeWidth="2" style={{ "--ck-index": index } as CSSProperties} /></g>)}
          {!compact && WIDTH >= 520 && originalIndex === 0 && active.length === 1 && <g className="ck-end-label" transform={`translate(${labelX} ${labelY})`}><line x1={last.x - labelX} x2="0" y1={last.y - labelY} y2="29" /><rect height="60" rx="5" width="156" /><text className="ck-end-label-kicker" x="13" y="22">LATEST · {last.label}</text><text x="13" y="48">{format(last.value)}</text></g>}
        </g>;
      })}
      {!compact && labels.filter((_, index) => index % Math.max(1, Math.ceil(labels.length / Math.max(2, Math.min(6, Math.floor(WIDTH / 65))))) === 0).map((label) => <text className="ck-axis-text" key={label} x={x(label)} y={height - 14} textAnchor="middle">{label}</text>)}
    </SvgCanvas>
  </ChartFrame>;
}

function LineChartContent<T extends ChartDatum>(props: LineChartProps<T>) {
  return <CartesianBase kind="line" props={props} />; }
function AreaChartContent<T extends ChartDatum>(props: AreaChartProps<T>) {
  return <CartesianBase kind="area" props={props} stacked={props.stacked} />; }

function ScatterChartContent<T extends ChartDatum>(props: ScatterChartProps<T>) {
  const WIDTH = useChartWidth();
  const { data, xKey, series, height = 380, size = 6, sizeKey } = props; const id = useId().replace(/:/g, ""); const theme = resolveTheme(props.theme, props.appearance); const colors = paletteFor(theme, series);
  const { hidden, toggle, active } = useSeriesState(series); const [tooltip, setTooltip] = useState<TooltipState>(null);
  if (!hasUsableData(data, [xKey, ...series.map((item) => item.dataKey)])) return <EmptyChart {...props} />;
  const rawXDomain = extent(data.map((row) => numberValue(row[xKey]))); const rawYDomain = extent(data.flatMap((row) => active.map((item) => numberValue(row[item.dataKey]))));
  const pad = (domain: [number, number]) => { const amount = Math.max((domain[1] - domain[0]) * .08, 1); return [domain[0] - amount, domain[1] + amount] as [number, number]; };
  const xDomain = pad(rawXDomain), yDomain = pad(rawYDomain); const maxSize = Math.max(1, ...data.map((row) => numberValue(row[sizeKey ?? xKey]) ?? 1));
  const x = scaleLinear().domain(xDomain).nice().range([MARGIN.left, WIDTH - MARGIN.right]); const y = scaleLinear().domain(yDomain).nice().range([height - MARGIN.bottom, MARGIN.top]); const format = props.valueFormatter ?? defaultFormat;
  return <ChartFrame {...props} family="scatter" height={height} legend={legendFor(series, colors)} hidden={hidden} onLegendToggle={toggle} tooltip={tooltip}><SvgCanvas id={id} height={height} label={props.ariaLabel ?? props.title ?? "Scatter chart"} description={props.description}>
    <text className="ck-axis-title" x={MARGIN.left} y={MARGIN.top - 8}>{active[0]?.label.toUpperCase()}</text>
    <GridY domain={y.domain() as [number, number]} y={y} plotRight={WIDTH - MARGIN.right} format={format} />
    {ticks(xDomain[0], xDomain[1], 5).map((tick) => <text className="ck-axis-text" key={tick} x={x(tick)} y={height - 26} textAnchor="middle">{format(tick)}</text>)}
    {data.flatMap((row, rowIndex) => active.map((item) => { const originalIndex = series.indexOf(item); const xv = numberValue(row[xKey]); const value = numberValue(row[item.dataKey]); if (xv === null || value === null) return null; const rawSize = numberValue(row[sizeKey ?? xKey]) ?? size; const radius = sizeKey ? Math.max(4, Math.min(16, Math.sqrt(Math.max(0, rawSize) / maxSize) * 16)) : size; return <g key={`${rowIndex}-${item.dataKey}`}><circle className="ck-point-halo" cx={x(xv)} cy={y(value)} fill="var(--ck-point-halo)" r={radius + 6} /><circle {...markEvents(row, item, value, `${String(row[xKey])}`, setTooltip, props, colors[originalIndex])} className="ck-mark ck-point" cx={x(xv)} cy={y(value)} r={radius} fill={colors[originalIndex]} fillOpacity=".78" stroke="var(--ck-point-stroke)" strokeWidth="2" style={{ "--ck-index": rowIndex } as CSSProperties} /></g>; }))}
    <text className="ck-axis-title" textAnchor="end" x={WIDTH - MARGIN.right} y={height - 6}>{String(xKey).toUpperCase()}</text>
  </SvgCanvas></ChartFrame>;
}

function ExtrudedPie<T extends ChartDatum>({ items, id, height, theme, props, setTooltip }: { items: RadialItem<T>[]; id: string; height: number; theme: ResolvedChartTheme; props: PieChartProps<T>; setTooltip: (tooltip: TooltipState) => void }) {
  const WIDTH = useChartWidth();
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  const slices = pie<RadialItem<T>>().sort(null).padAngle(.012).value((item) => item.value)(items);
  const narrow = WIDTH < 560; const compact = height < 280;
  const radius = narrow ? Math.min(120, WIDTH * .36) : compact ? Math.max(112, Math.min(132, height * .58)) : Math.max(112, Math.min(154, height * .42)), scaleY = .56, depth = Math.min(44, height * .12);
  const originX = narrow ? WIDTH / 2 : WIDTH * .44, originY = narrow ? height * .35 : height * (compact ? .51 : .54);
  const arcPath = arc<(typeof slices)[number]>().innerRadius(0).outerRadius(radius).cornerRadius(theme.tokens.markRadius * .2);
  const mono = monoRadialColors(theme.appearance);
  const colors = items.map((_, index) => theme.tokens.palette[index % theme.tokens.palette.length]);
  const leadIndex = items.reduce((best, item, index) => item.value > items[best].value ? index : best, 0);
  const walls = slices.flatMap((slice, index) => radialAngleSegments(slice.startAngle, slice.endAngle, [[Math.PI / 2, Math.PI * 1.5]]).map((segment) => ({ index, d: radialWallPath(segment.startAngle, segment.endAngle, radius, originX, originY, scaleY, depth) })).filter((wall): wall is { index: number; d: string } => Boolean(wall.d)));
  const labelIndexes = new Set(items.map((item, index) => ({ index, value: item.value })).sort((a, b) => b.value - a.value).slice(0, compact ? 2 : 3).map((item) => item.index));
  const labelPoints = slices.map((slice, index) => { const angle = (slice.startAngle + slice.endAngle) / 2; const marker = radialEllipsePoint(angle, radius * .62, originX, originY, scaleY); return { index, marker, side: marker.x < originX ? "left" as const : "right" as const, share: Math.round(items[index].value / total * 100) }; }).filter((item) => labelIndexes.has(item.index));
  const labels = (["left", "right"] as const).flatMap((side) => {
    const sideItems = labelPoints.filter((item) => item.side === side).sort((a, b) => a.marker.y - b.marker.y);
    const gap = compact ? 38 : 56;
    const start = height / 2 - (sideItems.length - 1) * gap / 2 - (compact ? 18 : 24);
    return sideItems.map((item, slot) => ({ ...item, textY: Math.max(compact ? 42 : 54, Math.min(height - (compact ? 36 : 58), start + slot * gap)), elbowX: item.marker.x + (side === "left" ? -42 : 42), textX: side === "left" ? 112 : WIDTH - 112 }));
  });
  const synthetic: Series<T> = { dataKey: props.valueKey, label: "Value" };
  const hasTypes = items.some((item) => rowTypeCode(item.row));
  return <SvgCanvas id={id} height={height} label={props.ariaLabel ?? props.title ?? "Extruded pie chart"} description={props.description}>
    {theme.familyId !== "mono-editorial" && <defs>{items.map((item, index) => <linearGradient id={`${id}-extruded-${index}`} key={item.name} x1="0" x2="0" y1="0" y2="1">{theme.familyId === "neon-instruments" ? <><stop offset="0%" stopColor={colors[index]} /><stop offset="100%" stopColor={colors[index]} stopOpacity=".76" /></> : <><stop offset="0%" stopColor="var(--ck-mark-highlight)" stopOpacity=".42" /><stop offset="12%" stopColor={colors[index]} /><stop offset="100%" stopColor={colors[index]} stopOpacity=".82" /></>}</linearGradient>)}</defs>}
    {hasTypes && !narrow && <MonoTypeLegend stroke="var(--ck-text)" />}
    <ellipse className="ck-extruded-shadow" cx={originX} cy={originY + depth + radius * scaleY * .48} rx={radius * .82} ry={radius * scaleY * .38} />
    {walls.map((wall, index) => <path className="ck-extruded-wall" d={wall.d} fill={theme.familyId === "mono-editorial" ? mono.sides[wall.index % mono.sides.length] : colors[wall.index]} key={`wall-${index}`} stroke={theme.familyId === "mono-editorial" ? mono.wallEdge : "var(--ck-border-strong)"} strokeDasharray={rowTypeCode(items[wall.index].row) === "ENH" ? "6 4" : undefined} />)}
    <g transform={`translate(${originX} ${originY}) scale(1 ${scaleY})`}>{slices.map((slice, index) => <path {...markEvents(items[index].row, synthetic, items[index].value, items[index].name, setTooltip, props, colors[index])} className="ck-mark ck-extruded-slice" d={arcPath(slice) ?? ""} fill={theme.familyId === "mono-editorial" ? mono.tops[index % mono.tops.length] : `url(#${id}-extruded-${index})`} key={items[index].name} stroke={index === leadIndex ? "var(--ck-text)" : "var(--ck-border-strong)"} strokeDasharray={rowTypeCode(items[index].row) === "ENH" ? "6 4" : undefined} strokeWidth={index === leadIndex ? 1.6 : 1.1} style={{ "--ck-index": index } as CSSProperties} />)}</g>
    {labels.map((original, index) => { const item = narrow ? { ...original, textX: 24, textY: height - 72 + index * 28 } : original; const align = narrow ? "start" : item.side === "left" ? "end" : "start"; const endX = item.side === "left" ? item.textX + 12 : item.textX - 12; return <g className="ck-extruded-label" key={`label-${item.index}`}>{!narrow && <polyline points={`${item.marker.x},${item.marker.y} ${item.elbowX},${item.marker.y} ${endX},${item.textY}`} />}<circle cx={item.marker.x} cy={item.marker.y} r={item.index === leadIndex ? 2.6 : 2} /><text textAnchor={align} x={item.textX} y={item.textY + 4}><tspan className="ck-extruded-share">{item.share}%</tspan><tspan dx={compact ? 7 : 9}>{items[item.index].name.toUpperCase()}</tspan></text></g>; })}
  </SvgCanvas>;
}

function MonoEditorialPie<T extends ChartDatum>({ items, id, height: requestedHeight, props, setTooltip, variant = "pie" }: { items: RadialItem<T>[]; id: string; height: number; props: PieChartProps<T>; setTooltip: (tooltip: TooltipState) => void; variant?: "pie" | "donut" }) {
  const WIDTH = useChartWidth();
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  const slices = pie<RadialItem<T>>().sort(null).padAngle(.008).value((item) => item.value)(items);
  const narrow = WIDTH < 560; const height = narrow ? Math.max(requestedHeight, 600) : requestedHeight;
  const compact = height < 320; const radius = Math.min(compact ? 104 : 124, height / 2 - 26); const cx = narrow ? WIDTH / 2 : WIDTH * .26; const cy = narrow ? 132 : height / 2 - 2;
  const arcPath = arc<(typeof slices)[number]>().innerRadius(variant === "donut" ? radius * .56 : 0).outerRadius(radius);
  const leadIndex = items.reduce((best, item, index) => item.value > items[best].value ? index : best, 0);
  const synthetic: Series<T> = { dataKey: props.valueKey, label: "Value" }; const format = props.valueFormatter ?? defaultFormat;
  const ledgerTop = narrow ? 340 : 46; const ledgerLeft = narrow ? 16 : WIDTH * .52; const ledgerRight = WIDTH - 24; const rowGap = Math.min(43, (height - ledgerTop - 22) / Math.max(items.length, 1));
  return <SvgCanvas id={id} height={height} label={props.ariaLabel ?? props.title ?? "Pie chart"} description={props.description}>
    <defs>{items.map((item, index) => <pattern height="8" id={`${id}-mono-pie-${index}`} key={item.name} patternUnits="userSpaceOnUse" width="8">
      <rect fill={index % 6 === 4 ? "var(--ck-text)" : "var(--ck-background)"} height="8" width="8" />
      {index % 6 === 0 && <path d="M-2 2L2-2M0 8L8 0M6 10L10 6" stroke="var(--ck-text)" strokeWidth="1" />}
      {index % 6 === 1 && <path d="M0 2H8M0 6H8" stroke="var(--ck-text)" strokeWidth=".85" />}
      {index % 6 === 2 && <path d="M2 0V8M6 0V8" stroke="var(--ck-text)" strokeWidth=".85" />}
      {index % 6 === 3 && <><circle cx="2" cy="2" fill="var(--ck-text)" r=".9" /><circle cx="6" cy="6" fill="var(--ck-text)" r=".9" /></>}
      {index % 6 === 4 && <path d="M-2 2L2-2M0 8L8 0M6 10L10 6" stroke="var(--ck-background)" strokeWidth="1" />}
    </pattern>)}</defs>
    <g className="ck-mono-pie-guides"><line x1={cx - radius - 16} x2={cx + radius + 16} y1={cy} y2={cy} /><line x1={cx} x2={cx} y1={cy - radius - 16} y2={cy + radius + 16} /><circle cx={cx} cy={cy} fill="none" r={radius + 8} /></g>
    <g transform={`translate(${cx} ${cy})`}>{slices.map((slice, index) => <path {...markEvents(items[index].row, synthetic, items[index].value, items[index].name, setTooltip, props, "var(--ck-text)")} className="ck-mark ck-mono-pie-slice" d={arcPath(slice) ?? ""} fill={`url(#${id}-mono-pie-${index})`} key={items[index].name} stroke="var(--ck-text)" strokeDasharray={rowTypeCode(items[index].row) === "ENH" ? "6 4" : undefined} strokeWidth={index === leadIndex ? 1.8 : 1.15} style={{ "--ck-index": index } as CSSProperties} />)}{variant === "donut" && <><text className="ck-donut-kicker" fill="var(--ck-text-muted)" fontSize="9" fontWeight="750" letterSpacing="1.2" textAnchor="middle" y="-8">TOTAL</text><text fill="var(--ck-text)" fontSize="20" fontWeight="760" textAnchor="middle" y="16">{props.centerLabel ?? format(total)}</text></>}</g>
    <text className="ck-mono-pie-caption" textAnchor="middle" x={cx} y={narrow ? 278 : height - 10}>SEGMENT DISTRIBUTION · {format(total)}</text>
    <text className="ck-mono-pie-ledger-header" x={ledgerLeft} y={ledgerTop - 24}>SEGMENT</text><text className="ck-mono-pie-ledger-header" textAnchor="end" x={ledgerRight} y={ledgerTop - 24}>SHARE</text>
    {items.map((item, index) => { const y = ledgerTop + index * rowGap; const share = Math.round(item.value / total * 100); return <g className="ck-mono-pie-ledger" key={item.name}>
      <text className="ck-mono-pie-rank" x={ledgerLeft} y={y}>{String(index + 1).padStart(2, "0")}</text><rect fill={`url(#${id}-mono-pie-${index})`} height="12" stroke="var(--ck-text)" strokeDasharray={rowTypeCode(item.row) === "ENH" ? "4 3" : undefined} width="18" x={ledgerLeft + 28} y={y - 10} /><text className="ck-mono-pie-name" x={ledgerLeft + 58} y={y}>{item.name.toUpperCase()}</text><text className="ck-mono-pie-share" textAnchor="end" x={ledgerRight} y={y}>{share}%</text>
      {rowTypeCode(item.row) && <text className="ck-mono-pie-type" x={ledgerLeft + 58} y={y + 12}>{rowTypeCode(item.row) === "ENH" ? "AI-ENHANCED" : "AI-NATIVE"}</text>}<line className="ck-mono-pie-rule" x1={ledgerLeft} x2={ledgerRight} y1={y + Math.min(18, rowGap * .44)} y2={y + Math.min(18, rowGap * .44)} />
    </g>; })}
  </SvgCanvas>;
}

function PieChartContent<T extends ChartDatum>(props: PieChartProps<T>) {
  const WIDTH = useChartWidth();
  const { data, nameKey, valueKey, variant = "donut", centerLabel, height = 380 } = props; const id = useId().replace(/:/g, ""); const theme = resolveTheme(props.theme, props.appearance); const [tooltip, setTooltip] = useState<TooltipState>(null);
  const clean = data.map((row) => ({ row, name: String(row[nameKey] ?? ""), value: Math.max(0, numberValue(row[valueKey]) ?? 0) })).filter((item) => item.value > 0);
  if (!clean.length) return <EmptyChart {...props} />;
  if (variant === "extruded") return <ChartFrame {...props} className={[props.className, "ck-extruded"].filter(Boolean).join(" ")} family="pie" height={height} showLegend={false} tooltip={tooltip}><ExtrudedPie height={height} id={id} items={clean} props={props} setTooltip={setTooltip} theme={theme} /></ChartFrame>;
  if (theme.familyId === "mono-editorial" && variant === "donut") return <ChartFrame {...props} family="pie" height={height} showLegend={false} tooltip={tooltip}><MonoEditorialPie height={height} id={id} items={clean} props={props} setTooltip={setTooltip} variant="donut" /></ChartFrame>;
  if (theme.familyId === "mono-editorial" && variant === "pie") return <ChartFrame {...props} family="pie" height={height} showLegend={false} tooltip={tooltip}><MonoEditorialPie height={height} id={id} items={clean} props={props} setTooltip={setTooltip} /></ChartFrame>;
  const pieSeries = pie<typeof clean[number]>().sort(null).value((item) => item.value)(clean); const radius = Math.min(128, height / 2 - 44); const arcPath = arc<typeof pieSeries[number]>().innerRadius(variant === "donut" ? radius * .58 : 0).outerRadius(radius).padAngle(.018).cornerRadius(theme.tokens.markRadius); const synthetic: Series<T> = { dataKey: valueKey, label: "Value" }; const format = props.valueFormatter ?? defaultFormat; const total = clean.reduce((sum, item) => sum + item.value, 0);
  const legend = clean.map((item, index) => ({ key: item.name, label: item.name, color: theme.tokens.palette[index % theme.tokens.palette.length] }));
  const airform = theme.familyId === "airform";
  return <ChartFrame {...props} family="pie" height={height} legend={legend} tooltip={tooltip}><SvgCanvas id={id} height={height} label={props.ariaLabel ?? props.title ?? `${variant} chart`} description={props.description}>
    {theme.familyId !== "mono-editorial" && <defs>
      {airform && <filter colorInterpolationFilters="sRGB" height="170%" id={`${id}-pie-shadow`} width="170%" x="-35%" y="-35%"><feGaussianBlur stdDeviation="9" /></filter>}
      {clean.map((item, index) => { const color = theme.tokens.palette[index % theme.tokens.palette.length]; return airform
        ? <linearGradient gradientUnits="userSpaceOnUse" id={`${id}-pie-${index}`} key={item.name} x1={-radius * .72} x2={radius * .78} y1={-radius} y2={radius}>
          <stop offset="0%" stopColor={mixHex(color, "#ffffff", theme.appearance === "dark" ? .18 : .22)} />
          <stop offset="34%" stopColor={color} />
          <stop offset="76%" stopColor={mixHex(color, "#061b3f", theme.appearance === "dark" ? .14 : .1)} />
          <stop offset="100%" stopColor={mixHex(color, "#061b3f", theme.appearance === "dark" ? .24 : .17)} />
        </linearGradient>
        : <radialGradient cx="32%" cy="25%" id={`${id}-pie-${index}`} key={item.name} r="78%"><stop offset="0%" stopColor={color} /><stop offset="100%" stopColor={color} stopOpacity=".84" /></radialGradient>; })}
    </defs>}
    {airform && <g className="ck-pie-contact-shadow" filter={`url(#${id}-pie-shadow)`} transform={`translate(${WIDTH / 2} ${height / 2 + 9})`}>{pieSeries.map((slice) => <path d={arcPath(slice) ?? ""} key={slice.data.name} />)}</g>}
    <g className={airform ? "ck-airform-pie-material" : undefined} transform={`translate(${WIDTH / 2} ${height / 2})`}>{variant === "donut" && <circle fill="none" r={radius * .79} stroke="var(--ck-surface)" strokeWidth={radius * .42} />}{pieSeries.map((slice, index) => <path {...markEvents(slice.data.row, synthetic, slice.data.value, slice.data.name, setTooltip, props, theme.tokens.palette[index % theme.tokens.palette.length])} className={`ck-mark${airform ? " ck-airform-pie-slice" : ""}`} key={slice.data.name} d={arcPath(slice) ?? ""} fill={theme.familyId === "mono-editorial" ? theme.tokens.palette[index % theme.tokens.palette.length] : `url(#${id}-pie-${index})`} stroke="var(--ck-border-strong)" strokeWidth={airform ? 1.5 : 2} style={{ "--ck-index": index } as CSSProperties} />)}{variant === "donut" && <><text className="ck-donut-kicker" fill="var(--ck-text-muted)" fontSize="9" fontWeight="750" letterSpacing="1.2" textAnchor="middle" y="-8">TOTAL</text><text fill="var(--ck-text)" fontSize="20" fontWeight="760" textAnchor="middle" y="16">{centerLabel ?? format(total)}</text></>}</g>
    <text className="ck-axis-text" x={WIDTH / 2} y={height - 14} textAnchor="middle">{clean.length} segments · {format(total)}</text>
  </SvgCanvas></ChartFrame>;
}

function RadarChartContent<T extends ChartDatum>(props: RadarChartProps<T>) {
  const WIDTH = useChartWidth();
  const { data, categoryKey, series, height = 420 } = props; const id = useId().replace(/:/g, ""); const theme = resolveTheme(props.theme, props.appearance); const colors = theme.familyId === "mono-editorial" ? series.map(() => theme.tokens.text) : paletteFor(theme, series); const { hidden, toggle, active } = useSeriesState(series); const [tooltip, setTooltip] = useState<TooltipState>(null);
  if (!hasUsableData(data, series.map((item) => item.dataKey)) || data.length < 3) return <EmptyChart {...props} />;
  const cx = WIDTH / 2, cy = height / 2, radius = Math.min(145, height / 2 - 55, (WIDTH - 140) / 2); const max = Math.max(1, ...data.flatMap((row) => active.map((item) => numberValue(row[item.dataKey]) ?? 0))); const angle = (index: number) => -Math.PI / 2 + index * Math.PI * 2 / data.length; const point = (index: number, value: number) => [cx + Math.cos(angle(index)) * radius * value / max, cy + Math.sin(angle(index)) * radius * value / max] as const;
  return <ChartFrame {...props} family="radar" height={height} legend={legendFor(series, colors)} hidden={hidden} onLegendToggle={toggle} tooltip={tooltip}><SvgCanvas id={id} height={height} label={props.ariaLabel ?? props.title ?? "Radar chart"} description={props.description}>
    {theme.familyId !== "mono-editorial" && <defs>{active.map((item) => { const originalIndex = series.indexOf(item); return <radialGradient id={`${id}-radar-${originalIndex}`} key={item.dataKey}><stop offset="0%" stopColor={colors[originalIndex]} stopOpacity=".28" /><stop offset="100%" stopColor={colors[originalIndex]} stopOpacity=".08" /></radialGradient>; })}</defs>}
    {[.25,.5,.75,1].map((step) => <polygon className="ck-grid" fill="none" key={step} points={data.map((_, index) => { const [x,y] = point(index, max * step); return `${x},${y}`; }).join(" ")} />)}
    {data.map((row, index) => { const [x,y] = point(index, max); return <g key={index}><line className="ck-grid" x1={cx} y1={cy} x2={x} y2={y} /><text className="ck-axis-text" x={x} y={y + (y > cy ? 18 : -8)} textAnchor={x < cx - 8 ? "end" : x > cx + 8 ? "start" : "middle"}>{String(row[categoryKey] ?? "")}</text></g>; })}
    {active.map((item) => { const originalIndex = series.indexOf(item); const points = data.map((row, index) => point(index, numberValue(row[item.dataKey]) ?? 0)); const monoSecondary = theme.familyId === "mono-editorial" && originalIndex > 0; return <g key={item.dataKey}><polygon className={`ck-mark ck-radar-shape${monoSecondary ? " ck-radar-secondary" : ""}`} points={points.map(([x,y]) => `${x},${y}`).join(" ")} fill={theme.familyId === "mono-editorial" ? "transparent" : `url(#${id}-radar-${originalIndex})`} stroke={colors[originalIndex]} strokeWidth="2.5" />{points.map(([x,y], index) => { const value = numberValue(data[index][item.dataKey]) ?? 0; return <g key={index}><circle className="ck-point-halo" cx={x} cy={y} fill="var(--ck-point-halo)" r="9" /><circle {...markEvents(data[index], item, value, String(data[index][categoryKey] ?? ""), setTooltip, props, colors[originalIndex])} className={`ck-mark ck-point${monoSecondary ? " ck-radar-secondary-point" : ""}`} cx={x} cy={y} r="4" fill="var(--ck-point-fill)" stroke={colors[originalIndex]} strokeWidth="2" style={{ "--ck-index": index } as CSSProperties} /></g>; })}</g>; })}
  </SvgCanvas></ChartFrame>;
}

function mixHex(a: string, b: string, amount: number) {
  if (!/^#[0-9a-f]{6}$/i.test(a) || !/^#[0-9a-f]{6}$/i.test(b)) return amount > .5 ? b : a;
  const parse = (color: string) => color.replace("#", "").match(/.{2}/g)!.map((value) => parseInt(value, 16)); const aa = parse(a), bb = parse(b); return `rgb(${aa.map((value, index) => Math.round(value + (bb[index] - value) * amount)).join(",")})`;
}

function HeatmapChartContent<T extends ChartDatum>(props: HeatmapChartProps<T>) {
  const WIDTH = useChartWidth();
  const { data, xKey, yKey, valueKey, height = 380, lowColor, highColor } = props; const id = useId().replace(/:/g, ""); const theme = resolveTheme(props.theme, props.appearance); const [tooltip, setTooltip] = useState<TooltipState>(null); const synthetic: Series<T> = { dataKey: valueKey, label: "Value" };
  const xLabels = [...new Set(data.map((row) => String(row[xKey] ?? "")))]; const yLabels = [...new Set(data.map((row) => String(row[yKey] ?? "")))]; const values = data.map((row) => numberValue(row[valueKey]));
  if (!hasUsableData(data, [valueKey]) || !xLabels.length || !yLabels.length) return <EmptyChart {...props} />;
  const domain = extent(values); const x = scaleBand<string>().domain(xLabels).range([60, WIDTH - MARGIN.right]).padding(.1); const y = scaleBand<string>().domain(yLabels).range([MARGIN.top, height - MARGIN.bottom - 28]).padding(.1); const start = lowColor ?? (theme.familyId === "mono-editorial" ? (theme.appearance === "dark" ? "#000000" : "#ffffff") : theme.id.includes("dark") ? "#20252d" : "#e8edf2"); const end = highColor ?? theme.tokens.palette[0];
  return <ChartFrame {...props} family="heatmap" height={height} tooltip={tooltip}><SvgCanvas id={id} height={height} label={props.ariaLabel ?? props.title ?? "Heatmap chart"} description={props.description}>
    {theme.familyId === "mono-editorial" ? <defs>{[0, 1, 2, 3, 4].map((band) => <pattern height="8" id={`${id}-heat-${band}`} key={band} patternUnits="userSpaceOnUse" width="8">
      <rect fill={band === 4 ? "var(--ck-text)" : "var(--ck-background)"} height="8" width="8" />
      {band === 1 && <><circle cx="2" cy="2" fill="var(--ck-text)" r=".8" /><circle cx="6" cy="6" fill="var(--ck-text)" r=".8" /></>}
      {band === 2 && <path d="M-2 2L2-2M0 8L8 0M6 10L10 6" stroke="var(--ck-text)" strokeWidth=".9" />}
      {band === 3 && <path d="M-2 2L2-2M0 8L8 0M6 10L10 6M6-2L10 2M0 0L8 8M-2 6L2 10" stroke="var(--ck-text)" strokeWidth=".8" />}
    </pattern>)}</defs> : <defs><linearGradient id={`${id}-heat-legend`}><stop offset="0%" stopColor={start} /><stop offset="100%" stopColor={end} /></linearGradient></defs>}
    {data.map((row, index) => { const value = numberValue(row[valueKey]); if (value === null) return null; const amount = (value - domain[0]) / Math.max(domain[1] - domain[0], 1); const band = Math.min(4, Math.floor(amount * 5)); const xLabel = String(row[xKey] ?? ""), yLabel = String(row[yKey] ?? ""), color = mixHex(start, end, amount); const mono = theme.familyId === "mono-editorial"; return <rect {...markEvents(row, synthetic, value, `${xLabel} · ${yLabel}`, setTooltip, props, mono ? theme.tokens.text : color)} className={`ck-mark ck-heat-cell${mono ? ` ck-mono-heat-cell ck-heat-band-${band}` : ""}`} key={index} x={x(xLabel)} y={y(yLabel)} width={x.bandwidth()} height={y.bandwidth()} rx={theme.tokens.markRadius} fill={mono ? `url(#${id}-heat-${band})` : color} stroke={mono ? "var(--ck-border-strong)" : "var(--ck-mark-highlight)"} strokeOpacity={mono ? 1 : .24} style={{ "--ck-index": index } as CSSProperties} />; })}
    {xLabels.map((label) => <text className="ck-axis-text" key={label} x={(x(label) ?? 0) + x.bandwidth()/2} y={height - 43} textAnchor="middle">{label}</text>)}
    {yLabels.map((label) => <text className="ck-axis-text" key={label} x={48} y={(y(label) ?? 0) + y.bandwidth()/2 + 4} textAnchor="end">{label}</text>)}
    <g className="ck-heat-legend" transform={`translate(${WIDTH - MARGIN.right - 170} ${height - 25})`}><text x="-38" y="7">LOW</text>{theme.familyId === "mono-editorial" ? <>{[0, 1, 2, 3, 4].map((band) => <rect fill={`url(#${id}-heat-${band})`} height="8" key={band} stroke="var(--ck-border-strong)" strokeWidth=".6" width="22" x={band * 24} />)}</> : <rect fill={`url(#${id}-heat-legend)`} height="8" rx="4" width="120" />}<text x="128" y="7">HIGH</text></g>
  </SvgCanvas></ChartFrame>;
}

function CohortChartContent<T extends ChartDatum>(props: CohortChartProps<T>) {
  const WIDTH = useChartWidth();
  const { data, cohortKey, periodKey, valueKey, sizeKey, maxValue = 100, showValues = true, height = 420 } = props;
  const id = useId().replace(/:/g, ""); const theme = resolveTheme(props.theme, props.appearance); const [tooltip, setTooltip] = useState<TooltipState>(null); const synthetic: Series<T> = { dataKey: valueKey, label: "Retention" };
  const cohorts = [...new Set(data.map((row) => String(row[cohortKey] ?? "")))]; const periods = [...new Set(data.map((row) => String(row[periodKey] ?? "")))];
  if (!hasUsableData(data, [valueKey]) || !cohorts.length || !periods.length || maxValue <= 0) return <EmptyChart {...props} />;
  const left = WIDTH < 480 ? 82 : sizeKey ? 176 : 132, right = 24, top = 52, bottom = 28; const x = scaleBand<string>().domain(periods).range([left, WIDTH - right]).padding(.14); const y = scaleBand<string>().domain(cohorts).range([top, height - bottom]).padding(.18);
  const lookup = new Map(data.map((row) => [`${String(row[cohortKey] ?? "")}\u0000${String(row[periodKey] ?? "")}`, row]));
  const start = theme.familyId === "mono-editorial" ? (theme.appearance === "dark" ? "#11100d" : "#f7f7f2") : theme.appearance === "dark" ? "#20252d" : "#eef1f4"; const end = theme.tokens.palette[0];
  const format = props.valueFormatter ?? ((value: number) => `${defaultFormat(value)}%`);
  return <ChartFrame {...props} family="cohort" height={height} tooltip={tooltip}><SvgCanvas id={id} height={height} label={props.ariaLabel ?? props.title ?? "Cohort retention chart"} description={props.description ?? "Retention by entry cohort and elapsed period. Unavailable recent periods are shown as pending."}>
    {theme.familyId === "mono-editorial" && <defs>{[0, 1, 2, 3, 4].map((band) => <pattern height="8" id={`${id}-cohort-${band}`} key={band} patternUnits="userSpaceOnUse" width="8"><rect fill={band === 4 ? "var(--ck-text)" : "var(--ck-background)"} height="8" width="8" />{band === 1 && <circle cx="4" cy="4" fill="var(--ck-text)" r="1" />}{band === 2 && <path d="M-2 2L2-2M0 8L8 0M6 10L10 6" stroke="var(--ck-text)" strokeWidth=".9" />}{band === 3 && <path d="M-2 2L2-2M0 8L8 0M6 10L10 6M0 0L8 8" stroke="var(--ck-text)" strokeWidth=".8" />}</pattern>)}</defs>}
    <text className="ck-cohort-corner" x={left - 12} y={24} textAnchor="end">COHORT</text>
    {periods.map((period) => <text className="ck-cohort-period" key={period} textAnchor="middle" x={(x(period) ?? 0) + x.bandwidth() / 2} y={24}>{WIDTH < 480 ? period.replace(/^Week /, "W") : period}</text>)}
    {cohorts.map((cohort, cohortIndex) => { const cohortRows = data.filter((row) => String(row[cohortKey] ?? "") === cohort); const cohortSize = sizeKey ? cohortRows.map((row) => numberValue(row[sizeKey])).find((value) => value !== null) ?? null : null; return <g key={cohort}>
      <text className="ck-cohort-label" textAnchor="end" x={left - 12} y={(y(cohort) ?? 0) + y.bandwidth() / 2 - (cohortSize !== null && WIDTH >= 480 ? 3 : -4)}>{cohort}</text>
      {cohortSize !== null && WIDTH >= 480 && <text className="ck-cohort-size" textAnchor="end" x={left - 12} y={(y(cohort) ?? 0) + y.bandwidth() / 2 + 14}>{defaultFormat(cohortSize)} users</text>}
      {periods.map((period, periodIndex) => { const row = lookup.get(`${cohort}\u0000${period}`); const bx = x(period) ?? 0, by = y(cohort) ?? 0; if (!row) return <rect aria-hidden="true" className="ck-cohort-pending" fill="var(--ck-surface)" height={y.bandwidth()} key={period} rx={Math.min(theme.tokens.markRadius, 5)} stroke="var(--ck-border)" width={x.bandwidth()} x={bx} y={by} />; const value = numberValue(row[valueKey]); if (value === null) return null; const amount = Math.max(0, Math.min(1, value / maxValue)); const band = Math.min(4, Math.floor(amount * 5)); const mono = theme.familyId === "mono-editorial"; const color = mono ? theme.tokens.text : mixHex(start, end, amount); const cellProps = { ...props, getDatumLabel: props.getDatumLabel ?? (() => `${cohort} · ${period}: ${format(value)}${cohortSize !== null ? ` · ${defaultFormat(cohortSize)} users` : ""}`) }; const textColor = mono ? (band === 4 ? "var(--ck-background)" : "var(--ck-text)") : amount > .58 ? (theme.appearance === "dark" ? "#07101d" : "#ffffff") : "var(--ck-text)"; return <g key={period}>
        <rect {...markEvents(row, synthetic, value, `${cohort} · ${period}`, setTooltip, cellProps, color)} className={`ck-mark ck-cohort-cell${mono ? ` ck-mono-cohort-cell ck-cohort-band-${band}` : ""}`} fill={mono ? `url(#${id}-cohort-${band})` : color} height={y.bandwidth()} rx={Math.min(theme.tokens.markRadius, 5)} stroke={mono ? "var(--ck-border-strong)" : "var(--ck-mark-highlight)"} strokeOpacity={mono ? 1 : .24} style={{ "--ck-index": cohortIndex + periodIndex } as CSSProperties} width={x.bandwidth()} x={bx} y={by} />
        {showValues && <text aria-hidden="true" className="ck-cohort-value" fill={textColor} pointerEvents="none" textAnchor="middle" x={bx + x.bandwidth() / 2} y={by + y.bandwidth() / 2 + 4}>{format(value)}</text>}
      </g>; })}
    </g>; })}
  </SvgCanvas></ChartFrame>;
}

type TerrainPoint<T extends ChartDatum> = { row: T; x: number; z: number; value: number; height: number; label: string };

function terrainProject(x: number, z: number, pointHeight: number, height: number, width: number) {
  const originY = height * .78;
  return {
    x: width / 2 + ((x - .5) * 530 + (z - .5) * 210) * (width - 40) / 760,
    y: originY + (z - .5) * 104 - pointHeight * Math.min(190, height * .46) - (x - .5) * 18,
  };
}

function TerrainChartContent<T extends ChartDatum>(props: TerrainChartProps<T>) {
  const WIDTH = useChartWidth();
  const {
    data, xKey, zKey, valueKey, height = 420, density = "medium", smoothing = "medium",
    showWireframe = true, showPointCloud = true,
  } = props;
  const id = useId().replace(/:/g, "");
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const clean = data.map((row, index) => ({
    row,
    x: numberValue(row[xKey]),
    z: numberValue(row[zKey]),
    value: numberValue(row[valueKey]),
    label: String(row.label ?? row.name ?? `Point ${index + 1}`),
  })).filter((point): point is { row: T; x: number; z: number; value: number; label: string } => point.x !== null && point.z !== null && point.value !== null);
  if (clean.length < 3) return <EmptyChart {...props} />;

  const xDomain = extent(clean.map((point) => point.x));
  const zDomain = extent(clean.map((point) => point.z));
  const valueDomain = extent(clean.map((point) => point.value));
  const normalize = (value: number, domain: [number, number]) => (value - domain[0]) / Math.max(domain[1] - domain[0], 1e-9);
  const controls: TerrainPoint<T>[] = clean.map((point) => ({ ...point, x: normalize(point.x, xDomain), z: normalize(point.z, zDomain), height: normalize(point.value, valueDomain) }));
  const gridSize = density === "high" ? 28 : density === "low" ? 14 : 20;
  const radius = smoothing === "high" ? .25 : smoothing === "low" ? .11 : .17;
  const rows = Array.from({ length: gridSize }, (_, zIndex) => Array.from({ length: gridSize }, (_, xIndex) => {
    const x = xIndex / Math.max(gridSize - 1, 1), z = zIndex / Math.max(gridSize - 1, 1);
    let weighted = 0, total = 0;
    controls.forEach((point) => { const dx = x - point.x, dz = z - point.z; const weight = Math.exp(-(dx * dx + dz * dz) / (radius * radius)); weighted += point.height * weight; total += weight; });
    const edge = Math.sin(Math.PI * x) * Math.sin(Math.PI * z);
    const terrainHeight = Math.max(0, Math.min(1, (total ? weighted / total : 0) * (.58 + edge * .54)));
    return { x, z, height: terrainHeight, screen: terrainProject(x, z, terrainHeight, height, WIDTH) };
  }));
  const projected = rows.flat().sort((a, b) => a.z - b.z);
  const nearest = (point: TerrainPoint<T>) => projected.reduce((best, candidate) => ((candidate.x - point.x) ** 2 + (candidate.z - point.z) ** 2 < (best.x - point.x) ** 2 + (best.z - point.z) ** 2 ? candidate : best));
  const peak = controls.reduce((best, point) => point.value > best.value ? point : best);
  const low = controls.reduce((best, point) => point.value < best.value ? point : best);
  const peakScreen = nearest(peak).screen, lowScreen = nearest(low).screen;
  const synthetic: Series<T> = { dataKey: valueKey, label: String(valueKey) };
  const format = props.valueFormatter ?? defaultFormat;
  const callout = (kind: "PEAK" | "LOW", point: TerrainPoint<T>, screen: { x: number; y: number }) => {
    const right = screen.x < WIDTH * .64;
    const textX = right ? Math.min(screen.x + 78, WIDTH - 112) : Math.max(screen.x - 78, 112);
    const lineY = Math.max(36, screen.y - 48);
    return <g className="ck-terrain-callout"><circle cx={screen.x} cy={screen.y} fill="var(--ck-background)" r="5" stroke="var(--ck-text)" strokeWidth="1.5" /><polyline fill="none" points={`${screen.x},${screen.y} ${screen.x},${lineY} ${textX},${lineY}`} stroke="var(--ck-text-muted)" /><text className="ck-terrain-callout-title" textAnchor={right ? "start" : "end"} x={textX} y={lineY - 8}>{kind}</text><text className="ck-terrain-callout-value" textAnchor={right ? "start" : "end"} x={textX} y={lineY + 10}>{point.label} · {format(point.value)}</text></g>;
  };

  return <ChartFrame {...props} family="terrain" height={height} showLegend={false} tooltip={tooltip}><SvgCanvas id={id} height={height} label={props.ariaLabel ?? props.title ?? "3D terrain chart"} description={props.description ?? `A projected terrain surface with a peak at ${peak.label} and a low point at ${low.label}.`}>
    <defs><radialGradient id={`${id}-terrain-glow`}><stop offset="0%" stopColor="var(--ck-point-halo)" stopOpacity=".9" /><stop offset="100%" stopColor="var(--ck-point-halo)" stopOpacity="0" /></radialGradient></defs>
    <ellipse className="ck-terrain-glow" cx={WIDTH / 2} cy={height * .65} fill={`url(#${id}-terrain-glow)`} rx="310" ry="150" />
    {[.2,.4,.6,.8].map((step) => { const a = terrainProject(0, step, 0, height, WIDTH), b = terrainProject(1, step, 0, height, WIDTH), c = terrainProject(step, 0, 0, height, WIDTH), d = terrainProject(step, 1, 0, height, WIDTH); return <g key={step}><line className="ck-terrain-floor" x1={a.x} x2={b.x} y1={a.y} y2={b.y} /><line className="ck-terrain-floor" x1={c.x} x2={d.x} y1={c.y} y2={d.y} /></g>; })}
    {showWireframe && <g className="ck-terrain-wire">{rows.map((row, index) => index % 2 === 0 || index === rows.length - 1 ? <polyline key={`row-${index}`} points={row.map((point) => `${point.screen.x},${point.screen.y}`).join(" ")} /> : null)}{Array.from({ length: gridSize }, (_, index) => index % 3 === 0 || index === gridSize - 1 ? <polyline key={`column-${index}`} points={rows.map((row) => `${row[index].screen.x},${row[index].screen.y}`).join(" ")} /> : null)}</g>}
    {showPointCloud && <g>{projected.map((point, index) => <circle className="ck-terrain-point" cx={point.screen.x} cy={point.screen.y} fill={point.height > .72 ? "var(--ck-point-stroke)" : "var(--ck-text-muted)"} key={index} opacity={.24 + point.height * .66} r={1.1 + point.height * 1.25} />)}</g>}
    <g>{controls.map((point, index) => { const screen = nearest(point).screen; return <circle {...markEvents(point.row, synthetic, point.value, point.label, setTooltip, props, "var(--ck-point-stroke)")} className="ck-mark ck-terrain-control" cx={screen.x} cy={screen.y} fill="var(--ck-background)" key={index} r="4" stroke="var(--ck-point-stroke)" strokeWidth="1.5" style={{ "--ck-index": index } as CSSProperties} />; })}</g>
    {callout("PEAK", peak, peakScreen)}
    {callout("LOW", low, lowScreen)}
    <text className="ck-terrain-axis" x="24" y={height - 18}>X {String(xKey)} · Y {String(valueKey)} · Z {String(zKey)}</text>
  </SvgCanvas></ChartFrame>;
}

export function BarChart<T extends ChartDatum>(props: BarChartProps<T>) {
  return <ResponsiveChart><BarChartContent {...props} /></ResponsiveChart>;
}

export function LineChart<T extends ChartDatum>(props: LineChartProps<T>) {
  return <ResponsiveChart><LineChartContent {...props} /></ResponsiveChart>;
}

export function AreaChart<T extends ChartDatum>(props: AreaChartProps<T>) {
  return <ResponsiveChart><AreaChartContent {...props} /></ResponsiveChart>;
}

export function ScatterChart<T extends ChartDatum>(props: ScatterChartProps<T>) {
  return <ResponsiveChart><ScatterChartContent {...props} /></ResponsiveChart>;
}

export function PieChart<T extends ChartDatum>(props: PieChartProps<T>) {
  return <ResponsiveChart><PieChartContent {...props} /></ResponsiveChart>;
}

export function RadarChart<T extends ChartDatum>(props: RadarChartProps<T>) {
  return <ResponsiveChart><RadarChartContent {...props} /></ResponsiveChart>;
}

export function HeatmapChart<T extends ChartDatum>(props: HeatmapChartProps<T>) {
  return <ResponsiveChart><HeatmapChartContent {...props} /></ResponsiveChart>;
}

export function CohortChart<T extends ChartDatum>(props: CohortChartProps<T>) {
  return <ResponsiveChart><CohortChartContent {...props} /></ResponsiveChart>;
}

export function TerrainChart<T extends ChartDatum>(props: TerrainChartProps<T>) {
  return <ResponsiveChart><TerrainChartContent {...props} /></ResponsiveChart>;
}
