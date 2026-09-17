"use client";

import { useId, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { arc, line, curveMonotoneX } from "d3-shape";
import { scaleBand, scaleLinear } from "d3-scale";
import { ticks } from "d3-array";
import { ChartTooltip } from "./tooltip.js";
import { ResponsiveChart, useChartWidth } from "./responsive.js";
import { resolveTheme, themeStyle } from "./themes.js";
import { defaultFormat, extent, numberValue } from "./utils.js";
import type { BoxPlotChartProps, ChartDatum, ChoroplethChartProps, ComboChartProps, CommonChartProps, FunnelChartProps, HistogramChartProps, RadialChartProps, SankeyChartProps, Series, TreemapChartProps, WaterfallChartProps } from "./types.js";

type Tip = { label: string; x: number; y: number; color?: string } | null;
type Family = "radial" | "funnel" | "sankey" | "treemap" | "waterfall" | "combo" | "histogram" | "box-plot" | "choropleth";

function Frame<T extends ChartDatum>({ props, family, tip, children, legend = [] }: { props: CommonChartProps<T>; family: Family; height: number; tip: Tip; children: ReactNode; legend?: Array<{ label: string; color: string }> }) {
  const theme = resolveTheme(props.theme, props.appearance);
  return <figure className={`ck-chart ck-${family}${props.animate === false ? "" : " ck-animate"} ${props.className ?? ""}`.trim()} data-family={family} data-theme={theme.id} style={{ ...themeStyle(theme), ...props.style }}>
    {(props.title || props.description) && <figcaption className="ck-header">{props.figureLabel !== "" && <span className="ck-figure-label">{props.figureLabel ?? `Figure / ${family}`}</span>}{props.title && <h3 className="ck-title">{props.title}</h3>}{props.description && <p className="ck-description">{props.description}</p>}</figcaption>}
    <ChartTooltip tip={tip} />
    <div className="ck-plot">{children}</div>
    {props.showLegend !== false && legend.length > 1 && <div className="ck-legend">{legend.map((item, index) => <span className={`ck-legend-item${index === 0 ? " ck-legend-lead" : ""}`} key={item.label}><span className="ck-swatch" style={{ background: item.color }} />{item.label}</span>)}</div>}
    {props.source && <p className="ck-source"><span>Source · {props.source}</span><span className="ck-signature">Generative Charts</span></p>}
  </figure>;
}

function Canvas({ id, height, label, children }: { id: string; height: number; label: string; children: ReactNode }) {
  const WIDTH = useChartWidth();
  return <svg aria-describedby={`${id}-desc`} aria-label={label} className="ck-svg" role="img" viewBox={`0 0 ${WIDTH} ${height}`}><desc id={`${id}-desc`}>{label} rendered with Generative Charts.</desc>{children}</svg>;
}

function Empty<T extends ChartDatum>({ props, family, height }: { props: CommonChartProps<T>; family: Family; height: number }) {
  return <Frame family={family} height={height} props={props} tip={null}><div className="ck-empty" role="status"><strong>No chart data</strong><span>Add at least one finite numeric value to render this chart.</span></div></Frame>;
}

function events<T extends ChartDatum>(row: T, series: Series<T>, value: number, label: string, props: CommonChartProps<T>, setTip: (tip: Tip) => void, color?: string) {
  const formatted = props.valueFormatter?.(value) ?? defaultFormat(value); const text = props.getDatumLabel?.(row, series.label, value) ?? `${label} · ${series.label}: ${formatted}`;
  const show = (event: MouseEvent<SVGElement> | FocusEvent<SVGElement>) => { if (props.showTooltip === false) return; const mark = event.currentTarget, frame = mark.closest(".ck-chart")?.getBoundingClientRect(), box = mark.getBoundingClientRect(); setTip({ label: text, color, x: frame ? box.left - frame.left + box.width / 2 : 0, y: frame ? box.top - frame.top - 8 : 0 }); };
  const activate = () => props.onDatumClick?.(row, series);
  return { tabIndex: 0, role: "button", "aria-label": text, onMouseEnter: show, onMouseLeave: () => setTip(null), onFocus: show, onBlur: () => setTip(null), onClick: (event: MouseEvent<SVGElement>) => { show(event); activate(); }, onKeyDown: (event: KeyboardEvent<SVGElement>) => { if (event.key === "Escape") setTip(null); if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } } };
}

function mix(a: string, b: string, amount: number) {
  if (!/^#[0-9a-f]{6}$/i.test(a) || !/^#[0-9a-f]{6}$/i.test(b)) return amount > .5 ? b : a;
  const parse = (v: string) => v.slice(1).match(/../g)!.map((x) => parseInt(x, 16)); const aa = parse(a), bb = parse(b); return `rgb(${aa.map((v, i) => Math.round(v + (bb[i] - v) * amount)).join(",")})`;
}

function chartColor(theme: ReturnType<typeof resolveTheme>, index: number) {
  return theme.familyId === "mono-editorial" ? (index === 0 ? theme.tokens.text : theme.tokens.axis) : theme.tokens.palette[index % theme.tokens.palette.length];
}

function roundedPolygonPath(points: Array<[number, number]>, radius: number) {
  const corner = (point: [number, number], neighbor: [number, number]) => {
    const dx = neighbor[0] - point[0], dy = neighbor[1] - point[1], distance = Math.hypot(dx, dy), offset = Math.min(radius, distance / 2);
    if (!distance) return point;
    return [point[0] + dx / distance * offset, point[1] + dy / distance * offset] as const;
  };
  const corners = points.map((point, index) => ({ before: corner(point, points[(index - 1 + points.length) % points.length]), point, after: corner(point, points[(index + 1) % points.length]) }));
  return `${corners.map(({ before, point, after }, index) => `${index ? "L" : "M"}${before[0]},${before[1]} Q${point[0]},${point[1]} ${after[0]},${after[1]}`).join(" ")} Z`;
}

function RadialChartContent<T extends ChartDatum>(props: RadialChartProps<T>) {
  const WIDTH = useChartWidth();
  const { data, nameKey, valueKey, variant = "rings", height = 380 } = props; const id = useId().replace(/:/g, ""); const theme = resolveTheme(props.theme, props.appearance); const [tip, setTip] = useState<Tip>(null); const items = data.map((row) => ({ row, name: String(row[nameKey] ?? ""), value: Math.max(0, numberValue(row[valueKey]) ?? 0) })).filter((x) => x.value > 0); if (!items.length) return <Empty family="radial" height={height} props={props} />;
  const max = Math.max(props.maxValue ?? 0, ...items.map((x) => x.value), 1), colors = items.map((_, i) => chartColor(theme, i)), synthetic: Series<T> = { dataKey: valueKey, label: "Value" }; const cx = WIDTH / 2, cy = height / 2, outer = Math.min(142, height / 2 - 30, WIDTH / 2 - 24);
  const rings = variant === "rings" ? items : [items[0]]; const start = variant === "half-gauge" ? -Math.PI / 2 : -Math.PI / 2; const span = variant === "half-gauge" ? Math.PI : Math.PI * 2;
  return <Frame family="radial" height={height} legend={(variant === "rings" ? items : items.slice(0, 1)).map((x, i) => ({ label: x.name, color: colors[i] }))} props={props} tip={tip}><Canvas height={height} id={id} label={props.ariaLabel ?? props.title ?? "Radial chart"}>
    {rings.map((item, index) => { const radius = variant === "rings" ? outer - index * ((outer - 52) / Math.max(items.length - 1, 1)) : outer, thickness = variant === "rings" ? 16 : 28; const path = arc().innerRadius(radius - thickness).outerRadius(radius).cornerRadius(theme.tokens.markRadius).startAngle(start).endAngle(start + span * Math.min(item.value / max, 1))({} as never); const track = arc().innerRadius(radius - thickness).outerRadius(radius).cornerRadius(theme.tokens.markRadius).startAngle(start).endAngle(start + span)({} as never); const monoRings = theme.familyId === "mono-editorial" && variant === "rings"; const lead = monoRings && index === 0; return <g key={item.name} transform={`translate(${cx} ${variant === "half-gauge" ? cy + 60 : cy})`}><defs><mask id={`${id}-radial-draw-${index}`} maskUnits="userSpaceOnUse" x={-radius - 8} y={-radius - 8} width={(radius + 8) * 2} height={(radius + 8) * 2}><circle className="ck-radial-draw" cx="0" cy="0" r={radius - thickness / 2} fill="none" pathLength="1" stroke="white" strokeWidth={thickness + 8} transform="rotate(180)" style={{ "--ck-radial-offset": 1 - Math.min(1, (span * Math.min(item.value / max, 1) + 4 / (radius - thickness / 2)) / (Math.PI * 2)) } as CSSProperties} /></mask></defs><path className="ck-radial-track" d={track ?? ""} /><path mask={`url(#${id}-radial-draw-${index})`} {...events(item.row, synthetic, item.value, item.name, props, setTip, colors[index])} className={`ck-mark ck-radial-value${lead ? " ck-radial-value-lead" : monoRings ? " ck-radial-value-support" : ""}`} d={path ?? ""} fill={lead ? "var(--ck-text)" : theme.familyId === "mono-editorial" ? "transparent" : colors[index]} stroke={lead ? "var(--ck-text)" : colors[index]} strokeDasharray={monoRings && index > 0 ? "5 4" : undefined} strokeWidth={theme.familyId === "mono-editorial" ? lead ? 1.5 : 1.25 : 1} style={{ "--ck-index": index } as CSSProperties} /></g>; })}
    {variant === "rings" && <text className="ck-radial-center-kicker" textAnchor="middle" x={cx} y={cy - 8}>{items[0].name}</text>}
    <text className="ck-radial-center" textAnchor="middle" x={cx} y={variant === "half-gauge" ? cy + 54 : variant === "rings" ? cy + 18 : cy + 6}>{props.centerLabel ?? defaultFormat(items[0].value)}</text>
  </Canvas></Frame>;
}

function FunnelChartContent<T extends ChartDatum>(props: FunnelChartProps<T>) {
  const WIDTH = useChartWidth();
  const { data, stageKey, valueKey, variant = "tapered", height = 400 } = props; const id = useId().replace(/:/g, ""); const theme = resolveTheme(props.theme, props.appearance); const [tip, setTip] = useState<Tip>(null); const items = data.map((row) => ({ row, name: String(row[stageKey] ?? ""), value: Math.max(0, numberValue(row[valueKey]) ?? 0) })).filter((x) => x.value > 0); if (!items.length) return <Empty family="funnel" height={height} props={props} />; const max = Math.max(...items.map((x) => x.value)), colors = items.map((_, i) => chartColor(theme, i)), synthetic: Series<T> = { dataKey: valueKey, label: "Value" }; const top = 24, rowH = (height - 48) / items.length;
  const mono = theme.familyId === "mono-editorial", radius = Math.max(8, theme.tokens.markRadius);
  return <Frame family="funnel" height={height} props={props} tip={tip}><Canvas height={height} id={id} label={props.ariaLabel ?? props.title ?? "Funnel chart"}>
    {mono && <defs>{[1, 2, 3, 4].map((band) => <pattern height="8" id={`${id}-funnel-${band}`} key={band} patternUnits="userSpaceOnUse" width="8">
      <rect fill={band === 4 ? "var(--ck-text)" : "var(--ck-background)"} height="8" width="8" />
      {band === 1 && <><circle cx="2" cy="2" fill="var(--ck-text)" r=".8" /><circle cx="6" cy="6" fill="var(--ck-text)" r=".8" /></>}
      {band === 2 && <path d="M-2 2L2-2M0 8L8 0M6 10L10 6" stroke="var(--ck-text)" strokeWidth=".9" />}
      {band === 3 && <path d="M-2 2L2-2M0 8L8 0M6 10L10 6M6-2L10 2M0 0L8 8M-2 6L2 10" stroke="var(--ck-text)" strokeWidth=".8" />}
    </pattern>)}</defs>}
    {items.map((item, index) => { const available = Math.max(40, WIDTH - (variant === "stage-bars" ? 200 : 40)), current = available * item.value / max, next = available * (items[index + 1]?.value ?? item.value * .76) / max, y = top + index * rowH, color = colors[index], band = Math.min(4, Math.max(1, Math.round((index + 1) / items.length * 4))), fill = mono ? `url(#${id}-funnel-${band})` : color, markClass = `ck-mark ck-funnel-stage${mono ? ` ck-mono-funnel-stage ck-funnel-band-${band}` : ""}`; if (variant === "stage-bars") return <g key={item.name}><rect {...events(item.row, synthetic, item.value, item.name, props, setTip, color)} className={markClass} fill={mono ? "none" : fill} height={Math.max(20, rowH - 12)} rx={radius} stroke={mono ? "var(--ck-text)" : color} style={{ "--ck-index": index } as CSSProperties} width={current} x={130} y={y + 4} /><text className="ck-flow-label" x="28" y={y + rowH / 2 + 4}>{item.name}</text><text className={`ck-flow-value${mono ? " ck-mono-funnel-label" : ""}${mono && band === 4 ? " ck-funnel-label-invert" : ""}`} textAnchor="end" x={WIDTH - 10} y={y + rowH / 2 + 4}>{defaultFormat(item.value)}</text></g>; const path = roundedPolygonPath([[WIDTH / 2-current/2, y], [WIDTH/2+current/2, y], [WIDTH/2+next/2, y+rowH-5], [WIDTH/2-next/2, y+rowH-5]], radius); return <g key={item.name}><path {...events(item.row, synthetic, item.value, item.name, props, setTip, color)} className={markClass} d={path} fill={fill} stroke={mono ? "var(--ck-text)" : color} style={{ "--ck-index": index } as CSSProperties} /><text className={`ck-flow-label${mono ? " ck-mono-funnel-label" : ""}${mono && band === 4 ? " ck-funnel-label-invert" : ""}`} textAnchor="middle" x={WIDTH/2} y={y + rowH/2 - (WIDTH < 480 ? 6 : 0)}>{WIDTH < 480 ? <>{item.name}<tspan x={WIDTH/2} dy="18">{defaultFormat(item.value)}</tspan></> : <>{item.name} · {defaultFormat(item.value)}</>}</text></g>; })}
  </Canvas></Frame>;
}

function SankeyChartContent<T extends ChartDatum>(props: SankeyChartProps<T>) {
  const WIDTH = useChartWidth();
  const { data, sourceKey, targetKey, valueKey, height = 420 } = props; const id = useId().replace(/:/g, ""); const theme = resolveTheme(props.theme, props.appearance); const [tip, setTip] = useState<Tip>(null);
  const links = data.map((row) => ({ row, source: String(row[sourceKey] ?? ""), target: String(row[targetKey] ?? ""), value: Math.max(0, numberValue(row[valueKey]) ?? 0) })).filter((x) => x.source && x.target && x.value > 0); if (!links.length) return <Empty family="sankey" height={height} props={props} />;
  const names = [...new Set(links.flatMap((x) => [x.source, x.target]))], incoming = new Set(links.map((x) => x.target)); const layer = new Map(names.map((name) => [name, incoming.has(name) ? 1 : 0]));
  for (let pass = 0; pass < names.length; pass++) links.forEach((link) => layer.set(link.target, Math.max(layer.get(link.target) ?? 0, (layer.get(link.source) ?? 0) + 1)));
  const maxLayer = Math.max(...layer.values(), 1), byLayer = Array.from({ length: maxLayer + 1 }, (_, index) => names.filter((name) => layer.get(name) === index));
  const positions = new Map<string, { x: number; y: number }>(); byLayer.forEach((group, layerIndex) => group.forEach((name, nodeIndex) => positions.set(name, { x: 48 + layerIndex * (WIDTH - 96) / maxLayer, y: 48 + (nodeIndex + .5) * (height - 96) / group.length })));
  const nodeValues = new Map(names.map((name) => { const incomingValue = links.filter((link) => link.target === name).reduce((sum, link) => sum + link.value, 0), outgoingValue = links.filter((link) => link.source === name).reduce((sum, link) => sum + link.value, 0); return [name, Math.max(incomingValue, outgoingValue)] as const; }));
  const maxLinkValue = Math.max(...links.map((link) => link.value)), maxNodeValue = Math.max(...nodeValues.values()), synthetic: Series<T> = { dataKey: valueKey, label: "Flow" }, format = props.valueFormatter ?? defaultFormat, mono = theme.familyId === "mono-editorial";
  return <Frame family="sankey" height={height} props={props} tip={tip}><Canvas height={height} id={id} label={props.ariaLabel ?? props.title ?? "Sankey chart"}>
    {links.map((link, index) => { const source = positions.get(link.source)!, target = positions.get(link.target)!, color = chartColor(theme, layer.get(link.source) ?? 0), width = Math.max(8, link.value / maxLinkValue * 34), d = `M ${source.x + 7} ${source.y} C ${(source.x + target.x) / 2} ${source.y}, ${(source.x + target.x) / 2} ${target.y}, ${target.x - 7} ${target.y}`; return <g key={`${link.source}-${link.target}-${index}`}><path className="ck-sankey-link-underlay" d={d} fill="none" strokeWidth={width + 6} /><path {...events(link.row, synthetic, link.value, `${link.source} → ${link.target}`, props, setTip, color)} className="ck-mark ck-sankey-link" d={d} fill="none" stroke={color} strokeOpacity={mono ? 1 : .62} strokeWidth={width} style={{ "--ck-index": index } as CSSProperties} /></g>; })}
    {names.map((name) => { const position = positions.get(name)!, value = nodeValues.get(name) ?? 0, nodeHeight = Math.max(28, Math.min(54, value / Math.max(maxNodeValue, 1) * 54)); return <g className="ck-sankey-node-group" key={name}><rect className="ck-sankey-node" height={nodeHeight} rx={mono ? 1 : 4} width="14" x={position.x - 7} y={position.y - nodeHeight / 2} /><text className="ck-sankey-label" textAnchor="middle" x={position.x} y={position.y - nodeHeight / 2 - 12}>{name.toUpperCase()}</text><text className="ck-sankey-node-value" textAnchor="middle" x={position.x} y={position.y + nodeHeight / 2 + 18}>{format(value)}</text></g>; })}
  </Canvas></Frame>;
}

type Tile<T>={row:T;name:string;value:number;x:number;y:number;w:number;h:number};
function tile<T>(items:Array<{row:T;name:string;value:number}>,x:number,y:number,w:number,h:number):Tile<T>[] { if(items.length===1)return[{...items[0],x,y,w,h}]; const total=items.reduce((s,i)=>s+i.value,0),half=total/2; let sum=0,cut=1; for(;cut<items.length;cut++){if(sum+items[cut-1].value>half)break;sum+=items[cut-1].value;} const a=items.slice(0,cut),b=items.slice(cut),ratio=a.reduce((s,i)=>s+i.value,0)/total; return w>h?[...tile(a,x,y,w*ratio,h),...tile(b,x+w*ratio,y,w*(1-ratio),h)]:[...tile(a,x,y,w,h*ratio),...tile(b,x,y+h*ratio,w,h*(1-ratio))]; }
function TreemapChartContent<T extends ChartDatum>(props:TreemapChartProps<T>){
  const WIDTH = useChartWidth();const{data,nameKey,valueKey,height=400}=props,id=useId().replace(/:/g,""),theme=resolveTheme(props.theme,props.appearance),[tip,setTip]=useState<Tip>(null);const clean=data.map(row=>({row,name:String(row[nameKey]??""),value:Math.max(0,numberValue(row[valueKey])??0)})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value);if(!clean.length)return <Empty family="treemap" height={height} props={props}/>;const tiles=tile(clean,20,20,WIDTH-40,height-40),synthetic:Series<T>={dataKey:valueKey,label:"Value"};return <Frame family="treemap" height={height} props={props} tip={tip}><Canvas height={height} id={id} label={props.ariaLabel??props.title??"Treemap chart"}>{tiles.map((item,index)=>{const color=chartColor(theme,index);return <g key={item.name}><rect {...events(item.row,synthetic,item.value,item.name,props,setTip,color)} className="ck-mark ck-treemap-tile" fill={theme.familyId==="mono-editorial"?"transparent":color} height={Math.max(0,item.h-4)} rx={theme.tokens.markRadius} stroke={color} style={{"--ck-index":index} as CSSProperties} width={Math.max(0,item.w-4)} x={item.x+2} y={item.y+2}/>{item.w>60&&item.h>64&&<><text className="ck-tile-label" x={item.x+10} y={item.y+23}>{item.name.length * 8 > item.w - 20 ? item.name.split(" ").map((word, wi) => <tspan key={wi} x={item.x+10} dy={wi ? 15 : 0}>{word}</tspan>) : item.name}</text><text className="ck-tile-value" x={item.x+10} y={item.y+(item.name.length * 8 > item.w - 20 ? 57 : 42)}>{defaultFormat(item.value)}</text></>}</g>})}</Canvas></Frame>}

function WaterfallChartContent<T extends ChartDatum>(props:WaterfallChartProps<T>){
  const WIDTH = useChartWidth();const{data,categoryKey,valueKey,height=380}=props,id=useId().replace(/:/g,""),theme=resolveTheme(props.theme,props.appearance),[tip,setTip]=useState<Tip>(null);const clean=data.map((row,index)=>({row,index,name:String(row[categoryKey]??""),value:numberValue(row[valueKey])})).filter((x):x is typeof x&{value:number}=>x.value!==null);if(!clean.length)return <Empty family="waterfall" height={height} props={props}/>;const totalSet=new Set(props.totalIndices??[]),steps=clean.reduce<Array<typeof clean[number]&{start:number;end:number;total:boolean}>>((result,item)=>{const previous=result.at(-1),running=previous?.end??0,total=totalSet.has(item.index),start=total?0:running,end=total?item.value:running+item.value;result.push({...item,start,end,total});return result},[]),domain=extent(steps.flatMap(x=>[x.start,x.end]),true),x=scaleBand<string>().domain(steps.map(x=>x.name)).range([62,WIDTH-24]).padding(.28),y=scaleLinear().domain(domain).nice().range([height-54,22]),synthetic:Series<T>={dataKey:valueKey,label:"Change"};return <Frame family="waterfall" height={height} props={props} tip={tip}><Canvas height={height} id={id} label={props.ariaLabel??props.title??"Waterfall chart"}>{ticks(domain[0],domain[1],4).map(t=><g key={t}><line className="ck-grid" x1="62" x2={WIDTH-24} y1={y(t)} y2={y(t)}/><text className="ck-axis-text" textAnchor="end" x="52" y={y(t)+4}>{defaultFormat(t)}</text></g>)}{steps.map((s,i)=>{const positive=s.end>=s.start,color=s.total?theme.tokens.palette[0]:positive?theme.tokens.positive:theme.tokens.negative,bx=x(s.name)??0,top=Math.min(y(s.start),y(s.end));return <g key={s.name}>{i>0&&!s.total&&<line className="ck-waterfall-connector" x1={(x(steps[i-1].name)??0)+x.bandwidth()} x2={bx} y1={y(s.start)} y2={y(s.start)}/>}<rect {...events(s.row,synthetic,s.value,s.name,props,setTip,color)} className="ck-mark ck-waterfall-bar" fill={theme.familyId==="mono-editorial"?"transparent":color} height={Math.max(2,Math.abs(y(s.start)-y(s.end)))} rx={Math.min(theme.tokens.markRadius,x.bandwidth()/2,Math.max(2,Math.abs(y(s.start)-y(s.end)))/2)} stroke={color} style={{"--ck-index":i} as CSSProperties} width={x.bandwidth()} x={bx} y={top}/><text className="ck-axis-text" textAnchor="middle" x={bx+x.bandwidth()/2} y={height - (WIDTH < 480 && i % 2 ? 10 : 30)}>{s.name}</text></g>})}</Canvas></Frame>}

function ComboChartContent<T extends ChartDatum>(props:ComboChartProps<T>){
  const WIDTH = useChartWidth();const{data,xKey,series,height=380}=props,id=useId().replace(/:/g,""),theme=resolveTheme(props.theme,props.appearance),[tip,setTip]=useState<Tip>(null);const labels=data.map(r=>String(r[xKey]??"")),lineSet=new Set(props.lineKeys??[series[series.length-1]?.dataKey]),barSeries=series.filter(s=>!lineSet.has(s.dataKey)),lineSeries=series.filter(s=>lineSet.has(s.dataKey)),values=data.flatMap(r=>series.map(s=>numberValue(r[s.dataKey]))),domain=extent(values,true);if(!data.length||!values.some(v=>v!==null))return <Empty family="combo" height={height} props={props}/>;const x=scaleBand<string>().domain(labels).range([62,WIDTH-28]).padding(.22),y=scaleLinear().domain(domain).nice().range([height-50,22]),colors=series.map((_,i)=>chartColor(theme,i));return <Frame family="combo" height={height} legend={series.map((s,i)=>({label:s.label,color:colors[i]}))} props={props} tip={tip}><Canvas height={height} id={id} label={props.ariaLabel??props.title??"Combo chart"}>{ticks(domain[0],domain[1],4).map(t=><line className="ck-grid" key={t} x1="62" x2={WIDTH-28} y1={y(t)} y2={y(t)}/>)}{data.flatMap((row,ri)=>barSeries.map((s,si)=>{const v=numberValue(row[s.dataKey])??0,bw=x.bandwidth()/Math.max(barSeries.length,1),color=colors[series.indexOf(s)],bx=(x(labels[ri])??0)+si*bw;return <rect {...events(row,s,v,labels[ri],props,setTip,color)} className="ck-mark ck-combo-bar" fill={theme.familyId==="mono-editorial"?"transparent":color} height={Math.abs(y(v)-y(0))} key={`${ri}-${s.dataKey}`} rx={Math.min(theme.tokens.markRadius,Math.max(1,bw-2)/2,Math.abs(y(v)-y(0))/2)} stroke={color} width={Math.max(1,bw-2)} x={bx} y={Math.min(y(v),y(0))}/>}))}{lineSeries.map(s=>{const color=colors[series.indexOf(s)],points=data.map((row,i)=>({row,value:numberValue(row[s.dataKey])??0,x:(x(labels[i])??0)+x.bandwidth()/2})),d=line<{x:number;value:number}>().x(p=>p.x).y(p=>y(p.value)).curve(curveMonotoneX)(points);return <g key={s.dataKey}><path className="ck-combo-line" d={d??""} fill="none" stroke={color}/>{points.map((p,i)=><circle {...events(p.row,s,p.value,labels[i],props,setTip,color)} className="ck-mark ck-point" cx={p.x} cy={y(p.value)} fill="var(--ck-background)" key={i} r="4" stroke={color} strokeWidth="2"/>)}</g>})}{labels.map(label=><text className="ck-axis-text" key={label} textAnchor="middle" x={(x(label)??0)+x.bandwidth()/2} y={height-28}>{label}</text>)}</Canvas></Frame>}

function HistogramChartContent<T extends ChartDatum>(props:HistogramChartProps<T>){
  const WIDTH = useChartWidth();const{data,valueKey,height=380}=props,id=useId().replace(/:/g,""),theme=resolveTheme(props.theme,props.appearance),[tip,setTip]=useState<Tip>(null),values=data.map((row,index)=>({row,index,value:numberValue(row[valueKey])})).filter((x):x is typeof x&{value:number}=>x.value!==null);if(!values.length)return <Empty family="histogram" height={height} props={props}/>;const domain=extent(values.map(x=>x.value)),count=Math.max(3,Math.min(props.bins??8,24)),step=(domain[1]-domain[0])/count,bins=Array.from({length:count},(_,i)=>({start:domain[0]+i*step,end:domain[0]+(i+1)*step,rows:[] as typeof values}));values.forEach(x=>bins[Math.min(count-1,Math.floor((x.value-domain[0])/Math.max(step,1e-9)))].rows.push(x));const x=scaleBand<number>().domain(bins.map((_,i)=>i)).range([62,WIDTH-28]).padding(.04),y=scaleLinear().domain([0,Math.max(...bins.map(b=>b.rows.length),1)]).nice().range([height-54,24]),synthetic:Series<T>={dataKey:valueKey,label:"Frequency"},color=theme.tokens.palette[0];return <Frame family="histogram" height={height} props={props} tip={tip}><Canvas height={height} id={id} label={props.ariaLabel??props.title??"Histogram chart"}>{bins.map((bin,i)=>{const proxy=(bin.rows[0]?.row??data[0]),label=`${defaultFormat(bin.start)}–${defaultFormat(bin.end)}`;return <g key={i}><rect {...events(proxy,synthetic,bin.rows.length,label,props,setTip,color)} className="ck-mark ck-histogram-bar" fill={theme.familyId==="mono-editorial"?"transparent":color} height={y(0)-y(bin.rows.length)} rx={Math.min(theme.tokens.markRadius,x.bandwidth()/2,(y(0)-y(bin.rows.length))/2)} stroke={color} width={x.bandwidth()} x={x(i)} y={y(bin.rows.length)}/>{i%2===0&&<text className="ck-axis-text" textAnchor="middle" x={(x(i)??0)+x.bandwidth()/2} y={height-30}>{defaultFormat(bin.start)}</text>}</g>})}</Canvas></Frame>}

function quantile(values:number[],p:number){const sorted=[...values].sort((a,b)=>a-b),i=(sorted.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return sorted[lo]+(sorted[hi]-sorted[lo])*(i-lo)}
function BoxPlotChartContent<T extends ChartDatum>(props:BoxPlotChartProps<T>){
  const WIDTH = useChartWidth();const{data,categoryKey,valueKey,height=400}=props,id=useId().replace(/:/g,""),theme=resolveTheme(props.theme,props.appearance),[tip,setTip]=useState<Tip>(null),categories=[...new Set(data.map(r=>String(r[categoryKey]??"")))],groups=categories.map(name=>({name,rows:data.filter(r=>String(r[categoryKey]??"")===name),values:data.filter(r=>String(r[categoryKey]??"")===name).map(r=>numberValue(r[valueKey])).filter((v):v is number=>v!==null)})).filter(g=>g.values.length);if(!groups.length)return <Empty family="box-plot" height={height} props={props}/>;const domain=extent(groups.flatMap(g=>g.values)),x=scaleBand<string>().domain(groups.map(g=>g.name)).range([76,WIDTH-30]).padding(.38),y=scaleLinear().domain(domain).nice().range([height-54,24]),synthetic:Series<T>={dataKey:valueKey,label:"Distribution"};return <Frame family="box-plot" height={height} props={props} tip={tip}><Canvas height={height} id={id} label={props.ariaLabel??props.title??"Box plot chart"}>{ticks(domain[0],domain[1],4).map(t=><line className="ck-grid" key={t} x1="62" x2={WIDTH-28} y1={y(t)} y2={y(t)}/>)}{groups.map((g,i)=>{const min=Math.min(...g.values),max=Math.max(...g.values),q1=quantile(g.values,.25),med=quantile(g.values,.5),q3=quantile(g.values,.75),cx=(x(g.name)??0)+x.bandwidth()/2,color=chartColor(theme,i);return <g {...events(g.rows[0],synthetic,med,g.name,props,setTip,color)} className="ck-mark ck-box-group" key={g.name}><line className="ck-box-whisker" x1={cx} x2={cx} y1={y(min)} y2={y(max)}/><line className="ck-box-whisker" x1={cx-12} x2={cx+12} y1={y(min)} y2={y(min)}/><line className="ck-box-whisker" x1={cx-12} x2={cx+12} y1={y(max)} y2={y(max)}/><rect className="ck-box" fill={theme.familyId==="mono-editorial"?"transparent":color} height={Math.abs(y(q1)-y(q3))} rx={Math.min(theme.tokens.markRadius,x.bandwidth()/2,Math.abs(y(q1)-y(q3))/2)} stroke={color} width={x.bandwidth()} x={x(g.name)} y={y(q3)}/><line className="ck-box-median" x1={x(g.name)} x2={(x(g.name)??0)+x.bandwidth()} y1={y(med)} y2={y(med)}/><text className="ck-axis-text" textAnchor="middle" x={cx} y={height-30}>{g.name}</text></g>})}</Canvas></Frame>}

function geoPath(coords:number[][][],project:(p:[number,number])=>[number,number]){return coords.map(ring=>ring.map((p,i)=>{const[x,y]=project(p as [number,number]);return`${i?"L":"M"}${x},${y}`}).join(" ")+" Z").join(" ")}
function ChoroplethChartContent<T extends ChartDatum>(props:ChoroplethChartProps<T>){
  const WIDTH = useChartWidth();const{data,regionKey,valueKey,features,height=420}=props,id=useId().replace(/:/g,""),theme=resolveTheme(props.theme,props.appearance),[tip,setTip]=useState<Tip>(null),lookup=new Map(data.map(row=>[String(row[regionKey]??""),row])),points=features.flatMap(f=>f.geometry.type==="Polygon"?f.geometry.coordinates.flat():f.geometry.coordinates.flat(2)),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);if(!features.length||!data.some(r=>numberValue(r[valueKey])!==null))return <Empty family="choropleth" height={height} props={props}/>;const xDomain=extent(xs),yDomain=extent(ys),pad=24,scale=Math.min((WIDTH-pad*2)/Math.max(xDomain[1]-xDomain[0],1e-9),(height-pad*2)/Math.max(yDomain[1]-yDomain[0],1e-9)),project=([lon,lat]:[number,number])=>[pad+(lon-xDomain[0])*scale,height-pad-(lat-yDomain[0])*scale] as [number,number],values=data.map(r=>numberValue(r[valueKey])),domain=extent(values),start=props.lowColor??(theme.appearance==="dark"?"#252521":"#ecebe6"),end=props.highColor??theme.tokens.palette[0],synthetic:Series<T>={dataKey:valueKey,label:"Value"},featureKey=props.featureKey??"name";return <Frame family="choropleth" height={height} props={props} tip={tip}><Canvas height={height} id={id} label={props.ariaLabel??props.title??"Choropleth map"}>{features.map((feature,i)=>{const name=String(feature.properties[featureKey]??""),row=lookup.get(name),value=row?numberValue(row[valueKey]):null,amount=value===null?0:(value-domain[0])/Math.max(domain[1]-domain[0],1),color=value===null?"var(--ck-surface)":mix(start,end,amount),coordinates=feature.geometry.type==="Polygon"?feature.geometry.coordinates:feature.geometry.coordinates.flat();const common=row&&value!==null?events(row,synthetic,value,name,props,setTip,color):{};return <path {...common} className="ck-mark ck-map-region" d={geoPath(coordinates,project)} fill={color} key={`${name}-${i}`} stroke="var(--ck-background)" strokeWidth="2"/>})}</Canvas></Frame>}

export function RadialChart<T extends ChartDatum>(props: RadialChartProps<T>) {
  return <ResponsiveChart><RadialChartContent {...props} /></ResponsiveChart>;
}

export function FunnelChart<T extends ChartDatum>(props: FunnelChartProps<T>) {
  return <ResponsiveChart><FunnelChartContent {...props} /></ResponsiveChart>;
}

export function SankeyChart<T extends ChartDatum>(props: SankeyChartProps<T>) {
  return <ResponsiveChart><SankeyChartContent {...props} /></ResponsiveChart>;
}

export function TreemapChart<T extends ChartDatum>(props: TreemapChartProps<T>) {
  return <ResponsiveChart><TreemapChartContent {...props} /></ResponsiveChart>;
}

export function WaterfallChart<T extends ChartDatum>(props: WaterfallChartProps<T>) {
  return <ResponsiveChart><WaterfallChartContent {...props} /></ResponsiveChart>;
}

export function ComboChart<T extends ChartDatum>(props: ComboChartProps<T>) {
  return <ResponsiveChart><ComboChartContent {...props} /></ResponsiveChart>;
}

export function HistogramChart<T extends ChartDatum>(props: HistogramChartProps<T>) {
  return <ResponsiveChart><HistogramChartContent {...props} /></ResponsiveChart>;
}

export function BoxPlotChart<T extends ChartDatum>(props: BoxPlotChartProps<T>) {
  return <ResponsiveChart><BoxPlotChartContent {...props} /></ResponsiveChart>;
}

export function ChoroplethChart<T extends ChartDatum>(props: ChoroplethChartProps<T>) {
  return <ResponsiveChart><ChoroplethChartContent {...props} /></ResponsiveChart>;
}
