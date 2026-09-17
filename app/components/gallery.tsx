"use client";

import { useEffect, useState, useSyncExternalStore, type MouseEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { Brand } from "./brand";
import { ThemeIcon } from "./theme-icon";
import { useSearchParams } from "next/navigation";
import {
  AreaChart,
  BarChart,
  BoxPlotChart,
  ChoroplethChart,
  CohortChart,
  ComboChart,
  FunnelChart,
  HeatmapChart,
  HistogramChart,
  LineChart,
  PieChart,
  RadarChart,
  RadialChart,
  SankeyChart,
  ScatterChart,
  TerrainChart,
  TreemapChart,
  WaterfallChart,
  themeList,
  type ChartAppearance,
  type ThemeId,
} from "generative-charts";
import { INSTALL_COMMAND, PACKAGE_NAME } from "../lib/package";

type Family = "bar" | "line" | "area" | "scatter" | "pie" | "radar" | "radial" | "heatmap" | "cohort" | "funnel" | "sankey" | "treemap" | "waterfall" | "combo" | "histogram" | "boxplot" | "choropleth" | "terrain";
type Variation = { id: string; name: string; use: string };
type CatalogItem = { id: Family; name: string };

const catalog: CatalogItem[] = [
  { id: "bar", name: "Bar" },
  { id: "line", name: "Line" },
  { id: "area", name: "Area" },
  { id: "scatter", name: "Scatter" },
  { id: "pie", name: "Pie" },
  { id: "radar", name: "Radar" },
  { id: "radial", name: "Radial" },
  { id: "heatmap", name: "Heatmap" },
  { id: "cohort", name: "Cohort" },
  { id: "funnel", name: "Funnel" },
  { id: "sankey", name: "Sankey" },
  { id: "treemap", name: "Treemap" },
  { id: "waterfall", name: "Waterfall" },
  { id: "combo", name: "Combo" },
  { id: "histogram", name: "Histogram" },
  { id: "boxplot", name: "Box plot" },
  { id: "choropleth", name: "Map" },
  { id: "terrain", name: "3D terrain" },
];

const variations: Record<Family, Variation[]> = {
  bar: [{ id: "horizontal", name: "Ranked", use: "Long labels and rankings" }, { id: "vertical", name: "Vertical", use: "Short category comparisons" }, { id: "grouped", name: "Grouped", use: "Side-by-side series" }, { id: "stacked", name: "Stacked", use: "Composition and totals" }, { id: "diverging", name: "Diverging", use: "Positive and negative change" }],
  line: [{ id: "smooth", name: "Smooth", use: "Continuous trends" }, { id: "linear", name: "Straight", use: "Discrete changes" }, { id: "multiple", name: "Multiple", use: "Related series" }, { id: "sparkline", name: "Sparkline", use: "Compact inline trend" }],
  area: [{ id: "single", name: "Single", use: "One weighted trend" }, { id: "multiple", name: "Multiple", use: "Layered trends" }, { id: "stacked", name: "Stacked", use: "Changing composition" }],
  scatter: [{ id: "single", name: "Scatter", use: "Correlation and outliers" }, { id: "multiple", name: "Multi-series", use: "Cohort comparison" }, { id: "sized", name: "Sized points", use: "Three measures" }],
  pie: [{ id: "donut", name: "Donut", use: "Part-to-whole" }, { id: "pie", name: "Pie", use: "Compact composition" }, { id: "extruded", name: "3D pie", use: "Dimensional composition" }],
  radar: [{ id: "single", name: "Single", use: "One profile" }, { id: "multiple", name: "Comparison", use: "Two profiles" }],
  radial: [{ id: "rings", name: "Progress rings", use: "Several goals" }, { id: "gauge", name: "Gauge", use: "One bounded score" }, { id: "half-gauge", name: "Half gauge", use: "Compact status" }],
  heatmap: [{ id: "activity", name: "Activity", use: "Patterns over time" }, { id: "intensity", name: "Intensity", use: "Dense matrices" }, { id: "contributions", name: "Contributions", use: "Calendar activity" }],
  cohort: [{ id: "retention", name: "Retention", use: "Return rate by entry cohort" }],
  funnel: [{ id: "tapered", name: "Tapered", use: "Conversion drop-off" }, { id: "stage-bars", name: "Stage bars", use: "Comparable pipeline stages" }],
  sankey: [{ id: "flow", name: "Flow", use: "Movement between stages" }],
  treemap: [{ id: "nested", name: "Treemap", use: "Hierarchical composition" }],
  waterfall: [{ id: "bridge", name: "Bridge", use: "Contributions to a total" }],
  combo: [{ id: "bar-line", name: "Bar + line", use: "Volume and trend" }],
  histogram: [{ id: "distribution", name: "Distribution", use: "Frequency across ranges" }],
  boxplot: [{ id: "distribution", name: "Box plot", use: "Median, range, and quartiles" }],
  choropleth: [{ id: "regions", name: "Regional map", use: "Geographic intensity" }],
  terrain: [{ id: "wireframe", name: "Wireframe", use: "Surface structure" }, { id: "points", name: "Point cloud", use: "Sample distribution" }],
};

const sampleData = [
  { label: "Jan", revenue: 42, target: 38, users: 28, size: 7 }, { label: "Feb", revenue: 58, target: 48, users: 34, size: 10 },
  { label: "Mar", revenue: 51, target: 55, users: 39, size: 8 }, { label: "Apr", revenue: 74, target: 62, users: 46, size: 13 },
  { label: "May", revenue: 82, target: 72, users: 52, size: 15 }, { label: "Jun", revenue: 96, target: 84, users: 61, size: 12 },
];
const divergingData = [
  { label: "New business", value: 48 }, { label: "Expansion", value: 31 }, { label: "Contraction", value: -18 }, { label: "Churn", value: -26 }, { label: "Win-back", value: 14 },
];
const composition = [{ name: "Assistly", value: 14, type: "AI-native" }, { name: "Atlas AI", value: 15, type: "AI-native" }, { name: "Nova Chat", value: 16, type: "AI-native" }, { name: "Draft Lab", value: 12, type: "AI-enhanced" }, { name: "Signal OS", value: 21, type: "AI-native" }, { name: "Other", value: 22, type: "AI-enhanced" }];
const rankedBarData = [{ name: "Nova Chat", signal: 94, type: "AI-native" }, { name: "Atlas AI", signal: 88, type: "AI-native" }, { name: "Assistly", signal: 83, type: "AI-native" }, { name: "InsightOS", signal: 78, type: "AI-native" }, { name: "CanvasPro", signal: 72, type: "AI-enhanced" }, { name: "SearchLab", signal: 69, type: "AI-native" }, { name: "Muse Studio", signal: 61, type: "AI-enhanced" }, { name: "Flowdesk", signal: 58, type: "AI-enhanced" }];
const radarData = [{ metric: "Speed", current: 84, previous: 65 }, { metric: "Clarity", current: 74, previous: 79 }, { metric: "Trust", current: 92, previous: 70 }, { metric: "Reach", current: 67, previous: 58 }, { metric: "Value", current: 88, previous: 76 }];
const heatData = ["Mon", "Tue", "Wed", "Thu", "Fri"].flatMap((day, y) => ["9", "12", "15", "18"].map((time, x) => ({ day, time, value: ((x + 2) * (y + 3) * 13) % 94 + 6 })));
const contributionData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].flatMap((day, dayIndex) => Array.from({ length: 8 }, (_, weekIndex) => ({ day, week: `W${weekIndex + 1}`, value: ((dayIndex + 3) * (weekIndex + 5) * 11) % 17 })));
const cohortData = [
  { cohort: "Jul 06", users: 842, values: [100, 68, 55, 48, 43, 40] },
  { cohort: "Jul 13", users: 791, values: [100, 71, 58, 51, 46] },
  { cohort: "Jul 20", users: 886, values: [100, 74, 61, 54] },
  { cohort: "Jul 27", users: 934, values: [100, 70, 57] },
  { cohort: "Aug 03", users: 1012, values: [100, 76] },
  { cohort: "Aug 10", users: 968, values: [100] },
].flatMap((entry) => entry.values.map((retained, period) => ({ cohort: entry.cohort, users: entry.users, period: `Week ${period}`, retained })));
const terrainData = Array.from({ length: 24 }, (_, index) => {
  const x = index % 6, z = Math.floor(index / 6);
  return { label: `P${index + 1}`, x, z, elevation: Math.round(18 + Math.sin(x * 1.2) * 22 + Math.cos(z * 1.5) * 14 + Math.exp(-((x - 3.8) ** 2 + (z - 1.2) ** 2) / 2.2) * 54) };
});
const funnelData = [{ stage: "Visited", value: 1180 }, { stage: "Signed up", value: 790 }, { stage: "Activated", value: 460 }, { stage: "Paid", value: 250 }];
const flowData = [{ source: "Visits", target: "Sign-up", value: 790 }, { source: "Visits", target: "Browse", value: 390 }, { source: "Sign-up", target: "Active", value: 460 }, { source: "Sign-up", target: "Dormant", value: 330 }, { source: "Active", target: "Pro", value: 250 }, { source: "Active", target: "Free", value: 210 }];
const waterfallData = [{ label: "Opening", value: 84 }, { label: "New", value: 34 }, { label: "Expansion", value: 18 }, { label: "Churn", value: -21 }, { label: "Closing", value: 115 }];
const distributionData = Array.from({ length: 48 }, (_, index) => ({ value: 38 + ((index * 17) % 53) + Math.sin(index * 1.7) * 12 }));
const boxData = ["Starter", "Growth", "Scale"].flatMap((plan, planIndex) => Array.from({ length: 12 }, (_, index) => ({ plan, value: 34 + planIndex * 24 + ((index * 13 + planIndex * 7) % 31) })));
const mapData = [{ region: "Northwest", value: 72 }, { region: "North", value: 88 }, { region: "Northeast", value: 64 }, { region: "Southwest", value: 45 }, { region: "South", value: 79 }, { region: "Southeast", value: 58 }];
const mapFeatures = [
  { name: "Northwest", points: [[-124, 42], [-110, 42], [-110, 50], [-124, 50], [-124, 42]] }, { name: "North", points: [[-110, 42], [-96, 42], [-96, 50], [-110, 50], [-110, 42]] }, { name: "Northeast", points: [[-96, 42], [-76, 42], [-72, 47], [-76, 50], [-96, 50], [-96, 42]] },
  { name: "Southwest", points: [[-124, 32], [-110, 32], [-110, 42], [-124, 42], [-124, 32]] }, { name: "South", points: [[-110, 30], [-96, 30], [-96, 42], [-110, 42], [-110, 30]] }, { name: "Southeast", points: [[-96, 30], [-80, 27], [-76, 42], [-96, 42], [-96, 30]] },
].map((item) => ({ type: "Feature" as const, properties: { name: item.name }, geometry: { type: "Polygon" as const, coordinates: [item.points as [number, number][]] } }));

function isFamily(value: string | null): value is Family {
  return catalog.some((item) => item.id === value);
}

function CopyButton({ value, label = "Copy", iconOnly = false, stopPropagation = false }: { value: string; label?: string; iconOnly?: boolean; stopPropagation?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy(event: MouseEvent<HTMLButtonElement>) {
    if (stopPropagation) event.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }
  return <button aria-label={copied ? "Copied" : label} className={`copy-button${iconOnly ? " copy-button-icon" : ""}`} onClick={copy} title={copied ? "Copied" : label} type="button">
    {iconOnly ? <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {copied ? <path d="m5 12 4 4L19 6" /> : <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4" /></>}
    </svg> : copied ? "Copied" : label}
  </button>;
}

function chartCode(family: Family, variation: string, theme: ThemeId, appearance: ChartAppearance) {
  const shared = `  theme="${theme}"\n  appearance="${appearance}"`;
  const snippets: Record<Family, string> = {
    bar: `<BarChart\n  data={data}\n  categoryKey="${variation === "horizontal" ? "name" : "label"}"\n  series={[{ dataKey: "${variation === "horizontal" ? "signal" : variation === "diverging" ? "value" : "revenue"}", label: "${variation === "horizontal" ? "Enterprise signal" : variation === "diverging" ? "MRR change" : "Revenue"}" }]}\n  variant="${variation === "horizontal" || variation === "diverging" ? "horizontal" : "vertical"}"\n  layout="${variation === "stacked" ? "stacked" : "grouped"}"\n${shared}\n/>`,
    line: `<LineChart\n  data={data}\n  xKey="label"\n  series={[{ dataKey: "revenue", label: "Revenue" }]}\n  curve="${variation === "linear" ? "linear" : "smooth"}"\n${variation === "sparkline" ? "  variant=\"sparkline\"\n" : ""}${shared}\n/>`,
    area: `<AreaChart\n  data={data}\n  xKey="label"\n  series={[{ dataKey: "revenue", label: "Revenue" }]}\n  stacked={${variation === "stacked"}}\n${shared}\n/>`,
    scatter: `<ScatterChart\n  data={data}\n  xKey="users"\n  series={[{ dataKey: "revenue", label: "Revenue" }]}\n${variation === "sized" ? "  sizeKey=\"size\"\n" : ""}${shared}\n/>`,
    pie: `<PieChart\n  data={data}\n  nameKey="name"\n  valueKey="value"\n  variant="${variation === "pie" ? "pie" : variation === "extruded" ? "extruded" : "donut"}"\n${shared}\n/>`,
    radar: `<RadarChart\n  data={data}\n  categoryKey="metric"\n  series={[{ dataKey: "current", label: "Current" }]}\n${shared}\n/>`,
    radial: `<RadialChart data={data} nameKey="name" valueKey="value" variant="${variation}"\n${shared}\n/>`,
    heatmap: `<HeatmapChart\n  data={data}\n  xKey="time"\n  yKey="day"\n  valueKey="value"\n${shared}\n/>`,
    cohort: `<CohortChart\n  data={data}\n  cohortKey="cohort"\n  periodKey="period"\n  valueKey="retained"\n  sizeKey="users"\n${shared}\n/>`,
    funnel: `<FunnelChart data={data} stageKey="stage" valueKey="value" variant="${variation}"\n${shared}\n/>`,
    sankey: `<SankeyChart data={links} sourceKey="source" targetKey="target" valueKey="value"\n${shared}\n/>`,
    treemap: `<TreemapChart data={data} nameKey="name" valueKey="value"\n${shared}\n/>`,
    waterfall: `<WaterfallChart data={data} categoryKey="label" valueKey="value" totalIndices={[0, 4]}\n${shared}\n/>`,
    combo: `<ComboChart data={data} xKey="label" series={series} lineKeys={["target"]}\n${shared}\n/>`,
    histogram: `<HistogramChart data={data} valueKey="value" bins={8}\n${shared}\n/>`,
    boxplot: `<BoxPlotChart data={data} categoryKey="plan" valueKey="value"\n${shared}\n/>`,
    choropleth: `<ChoroplethChart data={data} features={features} regionKey="region" valueKey="value"\n${shared}\n/>`,
    terrain: `<TerrainChart\n  data={data}\n  xKey="x"\n  zKey="z"\n  valueKey="elevation"\n  density="medium"\n${shared}\n/>`,
  };
  const component = family === "pie" ? "PieChart" : family === "boxplot" ? "BoxPlotChart" : family === "choropleth" ? "ChoroplethChart" : `${family[0].toUpperCase()}${family.slice(1)}Chart`;
  return `import { ${component} } from "${PACKAGE_NAME}";\nimport "${PACKAGE_NAME}/styles.css";\n\n${snippets[family]}`;
}

function ChartPreview({ family, variation, theme, appearance, height = 270, showLegend = false, showTooltip = true, animate = true }: { family: Family; variation: string; theme: ThemeId; appearance: ChartAppearance; height?: number; showLegend?: boolean; showTooltip?: boolean; animate?: boolean }) {
  const context: Record<Family, { title: string; description: string }> = {
    bar: { title: "Launch signal by segment", description: "Sample data styled through the Generative Charts theme system." },
    line: { title: "Revenue momentum", description: "Monthly recurring revenue continues to accelerate." },
    area: { title: "Revenue over time", description: "Cumulative growth across the first half of the year." },
    scatter: { title: "Growth efficiency", description: "Revenue performance relative to active users." },
    pie: { title: "Launch signal by segment", description: "Sample data styled through the Generative Charts theme system." },
    radar: { title: "Product profile", description: "A balanced view of five experience qualities." },
    radial: { title: "Goal completion", description: "Progress toward this period’s operating goals." },
    heatmap: { title: "Weekly activity", description: "Engagement intensity by weekday and hour." },
    cohort: { title: "Weekly activation cohorts", description: "The share of each signup cohort returning in subsequent weeks." },
    funnel: { title: "Sign-up funnel", description: "Conversion through the activation journey." },
    sankey: { title: "Visitor flow", description: "Movement from arrival through plan selection." },
    treemap: { title: "Portfolio mix", description: "Relative contribution across product segments." },
    waterfall: { title: "Revenue bridge", description: "Changes between opening and closing revenue." },
    combo: { title: "Revenue and target", description: "Monthly results alongside the operating target." },
    histogram: { title: "Session distribution", description: "Frequency of observed session values." },
    boxplot: { title: "Value by plan", description: "Spread and quartiles for each subscription tier." },
    choropleth: { title: "Regional adoption", description: "Adoption intensity across operating regions." },
    terrain: { title: "Signal terrain", description: "Peaks and valleys across a sampled field." },
  };
  const common = { ...context[family], figureLabel: "", theme, appearance, animate, height, showLegend, showTooltip, valueFormatter: (value: number) => `$${value}k` };
  if (family === "bar" && variation === "horizontal") return <BarChart {...common} data={rankedBarData} categoryKey="name" series={[{ dataKey: "signal", label: "Enterprise signal" }]} variant="horizontal" valueFormatter={(value) => `${value}`} />;
  if (family === "bar" && variation === "diverging") return <BarChart {...common} data={divergingData} categoryKey="label" description="Monthly recurring revenue gained and lost by motion." series={[{ dataKey: "value", label: "MRR change" }]} title="Revenue movement" valueFormatter={(value) => `${value < 0 ? "-" : value > 0 ? "+" : ""}$${Math.abs(value)}k`} variant="horizontal" />;
  if (family === "bar") return <BarChart {...common} data={sampleData} categoryKey="label" description="Revenue compared across the first half of the year." series={variation === "vertical" ? [{ dataKey: "revenue", label: "Revenue" }] : [{ dataKey: "revenue", label: "Revenue" }, { dataKey: "target", label: "Target" }]} title="Monthly revenue" variant="vertical" layout={variation === "stacked" ? "stacked" : "grouped"} />;
  if (family === "line") return <LineChart {...common} data={sampleData} xKey="label" series={variation === "multiple" ? [{ dataKey: "revenue", label: "Revenue" }, { dataKey: "target", label: "Target" }] : [{ dataKey: "revenue", label: "Revenue" }]} curve={variation === "linear" ? "linear" : "smooth"} showPoints={variation !== "sparkline"} variant={variation === "sparkline" ? "sparkline" : "standard"} />;
  if (family === "area") return <AreaChart {...common} data={sampleData} xKey="label" series={variation === "single" ? [{ dataKey: "revenue", label: "Revenue" }] : [{ dataKey: "revenue", label: "Revenue" }, { dataKey: "target", label: "Target" }]} stacked={variation === "stacked"} />;
  if (family === "scatter") return <ScatterChart {...common} data={sampleData.map((row, index) => ({ ...row, x: index * 14 + 12 }))} xKey="x" series={variation === "multiple" ? [{ dataKey: "revenue", label: "Revenue" }, { dataKey: "users", label: "Users" }] : [{ dataKey: "revenue", label: "Revenue" }]} sizeKey={variation === "sized" ? "size" : undefined} />;
  if (family === "pie") return <PieChart {...common} data={composition} nameKey="name" valueKey="value" variant={variation === "pie" ? "pie" : variation === "extruded" ? "extruded" : "donut"} centerLabel={variation === "donut" ? "100%" : undefined} valueFormatter={(value) => `${value}%`} />;
  if (family === "radar") return <RadarChart {...common} data={radarData} categoryKey="metric" series={variation === "multiple" ? [{ dataKey: "current", label: "Current" }, { dataKey: "previous", label: "Previous" }] : [{ dataKey: "current", label: "Current" }]} />;
  if (family === "radial") return <RadialChart {...common} centerLabel={variation === "rings" ? "84%" : undefined} data={radarData.map((row) => ({ name: row.metric, value: row.current }))} maxValue={100} nameKey="name" valueKey="value" valueFormatter={(value) => `${value}%`} variant={variation as "rings" | "gauge" | "half-gauge"} />;
  if (family === "funnel") return <FunnelChart {...common} data={funnelData} stageKey="stage" valueKey="value" valueFormatter={(value) => `${value}`} variant={variation as "tapered" | "stage-bars"} />;
  if (family === "sankey") return <SankeyChart {...common} data={flowData} sourceKey="source" targetKey="target" valueKey="value" valueFormatter={(value) => `${value}`} />;
  if (family === "treemap") return <TreemapChart {...common} data={composition} nameKey="name" valueKey="value" valueFormatter={(value) => `${value}%`} />;
  if (family === "waterfall") return <WaterfallChart {...common} data={waterfallData} categoryKey="label" totalIndices={[0, 4]} valueKey="value" />;
  if (family === "combo") return <ComboChart {...common} data={sampleData} lineKeys={["target"]} series={[{ dataKey: "revenue", label: "Revenue" }, { dataKey: "target", label: "Target" }]} xKey="label" />;
  if (family === "histogram") return <HistogramChart {...common} bins={8} data={distributionData} valueKey="value" />;
  if (family === "boxplot") return <BoxPlotChart {...common} categoryKey="plan" data={boxData} valueKey="value" />;
  if (family === "choropleth") return <ChoroplethChart {...common} data={mapData} featureKey="name" features={mapFeatures} regionKey="region" valueKey="value" />;
  if (family === "terrain") return <TerrainChart {...common} data={terrainData} xKey="x" zKey="z" valueKey="elevation" showPointCloud showWireframe={variation !== "points"} valueFormatter={(value) => `${value}m`} />;
  if (family === "cohort") return <CohortChart {...common} cohortKey="cohort" data={cohortData} periodKey="period" showValues sizeKey="users" valueFormatter={(value) => `${value}%`} valueKey="retained" />;
  return variation === "contributions" ? <HeatmapChart {...common} data={contributionData} xKey="week" yKey="day" valueKey="value" /> : <HeatmapChart {...common} data={heatData} xKey="time" yKey="day" valueKey="value" />;
}

const subscribeHydration = () => () => {};
const clientHydrated = () => true;
const serverHydrated = () => false;

export function Gallery() {
  const params = useSearchParams();
  const requestedTheme = params.get("theme") as ThemeId;
  const requestedAppearance = params.get("mode") as ChartAppearance;
  const requestedFamily = params.get("chart");
  const initialFamily = isFamily(requestedFamily) ? requestedFamily : "bar";
  const [selectedFamily, setSelectedFamily] = useState<Family>(initialFamily);
  const [theme, setTheme] = useState<ThemeId>(() => themeList.some((item) => item.id === requestedTheme) ? requestedTheme : "mono-editorial");
  const hydrated = useSyncExternalStore(subscribeHydration, clientHydrated, serverHydrated);
  const [appearanceChoice, setAppearance] = useState<ChartAppearance | null>(requestedAppearance === "light" || requestedAppearance === "dark" ? requestedAppearance : null);
  const appearance: ChartAppearance = appearanceChoice ?? (hydrated && document.documentElement.dataset.siteTheme === "dark" ? "dark" : "light");
  const selectedTheme = themeList.find((item) => item.id === theme) ?? themeList[0];
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.dataset.siteTheme = appearance;
    document.documentElement.style.colorScheme = appearance;
    try { localStorage.setItem("chartkit-site-theme", appearance); } catch { /* Storage can be disabled in private browsing. */ }
    const next = new URLSearchParams();
    next.set("theme", theme);
    next.set("mode", appearance);
    next.set("chart", selectedFamily);
    window.history.replaceState({}, "", `${window.location.pathname}?${next}`);
  }, [appearance, hydrated, selectedFamily, theme]);

  function selectChart(family: Family) {
    setSelectedFamily(family);
  }

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % catalog.length : event.key === "ArrowLeft" ? (index - 1 + catalog.length) % catalog.length : event.key === "Home" ? 0 : event.key === "End" ? catalog.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    selectChart(catalog[next].id);
    document.getElementById(`chart-tab-${catalog[next].id}`)?.focus();
  }

  return <main id="top">
    <nav className="site-nav shell">
      <Brand />
      <div className="nav-links"><a href="#charts">Charts</a><Link href="/docs">Docs</Link></div>
      <div className="nav-actions"><button aria-label={`Switch to ${appearance === "light" ? "dark" : "light"} mode`} className="theme-toggle" onClick={() => setAppearance(appearance === "light" ? "dark" : "light")} type="button"><ThemeIcon appearance={appearance} /></button><Link className="nav-install nav-docs-mobile" href="/docs">Docs <span>↗</span></Link></div>
    </nav>

    <header className="catalog-hero shell">
      <h1>Charts for React.</h1>
      <div className="install-pill"><code>{INSTALL_COMMAND}</code><CopyButton value={INSTALL_COMMAND} /></div>
    </header>

    <section aria-label="Chart playground" className="playground shell" id="charts">
      <div className="gallery-toolbar">
        <div className="family-navigation">
          <span className="control-label">Chart type</span>
          <div aria-label="Chart type" className="family-tabs" role="tablist">
            {catalog.map((item, index) => <button aria-controls="chart-preview" aria-selected={selectedFamily === item.id} id={`chart-tab-${item.id}`} tabIndex={selectedFamily === item.id ? 0 : -1} key={item.id} onClick={() => selectChart(item.id)} onKeyDown={(event) => navigateTabs(event, index)} role="tab" type="button">{item.name}</button>)}
          </div>
        </div>
        <div className="appearance-control">
          <label className="control-label" htmlFor="chart-theme">Theme</label>
          <div className="theme-select-shell">
            <span aria-hidden="true" className="theme-swatch" style={{ background: selectedTheme.modes[appearance].palette[0] }} />
            <select id="chart-theme" onChange={(event) => setTheme(event.target.value as ThemeId)} value={theme}>
              {themeList.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="gallery-heading">
        <h2>{catalog.find((item) => item.id === selectedFamily)?.name} variations</h2>
      </div>

      <div aria-labelledby={`chart-tab-${selectedFamily}`} className={`variation-grid${variations[selectedFamily].length === 1 ? " variation-grid-single" : ""}`} id="chart-preview" role="tabpanel">
        {variations[selectedFamily].map((item) => <article className="variation-example" key={`${selectedFamily}-${item.id}`}>
          <CopyButton iconOnly label="Copy code" value={chartCode(selectedFamily, item.id, theme, appearance)} />
          <ChartPreview appearance={appearance} family={selectedFamily} height={340} showLegend theme={theme} variation={item.id} />
        </article>)}
      </div>

      <div className="gallery-footer">
        <Link href={`/docs#${selectedFamily}`}>Docs →</Link>
      </div>

    </section>

    <footer className="footer-editorial">
      <div className="footer-editorial-inner shell">
        <div aria-label="Generative Charts" className="footer-wordmark"><span className="footer-wordmark-word">Generative</span><span className="footer-wordmark-word">Charts</span></div>
        <div className="footer-editorial-meta">
          <p>Created by Kasturi Khanke</p>
          <nav aria-label="Footer links"><Link href="/docs">Docs →</Link><a href="#top">Back to top ↑</a></nav>
        </div>
      </div>
    </footer>
  </main>;
}
