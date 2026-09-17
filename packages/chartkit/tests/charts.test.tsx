import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AreaChart, BarChart, BoxPlotChart, ChoroplethChart, CohortChart, ComboChart, createTheme, FunnelChart, HeatmapChart, HistogramChart, LineChart, PieChart, RadarChart, RadialChart, SankeyChart, ScatterChart, TerrainChart, TreemapChart, WaterfallChart } from "../src/index";

const rows = [{ label: "A", one: 12, two: 8, x: 1 }, { label: "B", one: 20, two: 14, x: 2 }, { label: "C", one: 16, two: 18, x: 3 }];
const series = [{ dataKey: "one", label: "One" }, { dataKey: "two", label: "Two" }] as const;

describe("Generative Charts", () => {
  it("renders all eighteen chart families", () => {
    const links = [{ source: "A", target: "B", value: 12 }, { source: "B", target: "C", value: 8 }];
    const features = [{ type: "Feature" as const, properties: { name: "A" }, geometry: { type: "Polygon" as const, coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] as [number, number][][] } }];
    const cohortRows = [{ cohort: "Jan", period: "W0", retained: 100 }, { cohort: "Jan", period: "W1", retained: 62 }];
    const { container } = render(<><BarChart data={rows} categoryKey="label" series={[...series]} /><LineChart data={rows} xKey="label" series={[...series]} /><AreaChart data={rows} xKey="label" series={[...series]} /><ScatterChart data={rows} xKey="x" series={[...series]} /><PieChart data={rows} nameKey="label" valueKey="one" /><RadarChart data={rows} categoryKey="label" series={[...series]} /><RadialChart data={rows} nameKey="label" valueKey="one" /><HeatmapChart data={rows.map((row) => ({ ...row, y: "Week" }))} xKey="label" yKey="y" valueKey="one" /><CohortChart cohortKey="cohort" data={cohortRows} periodKey="period" valueKey="retained" /><FunnelChart data={rows} stageKey="label" valueKey="one" /><SankeyChart data={links} sourceKey="source" targetKey="target" valueKey="value" /><TreemapChart data={rows} nameKey="label" valueKey="one" /><WaterfallChart data={rows} categoryKey="label" valueKey="one" /><ComboChart data={rows} xKey="label" series={[...series]} /><HistogramChart data={rows} valueKey="one" /><BoxPlotChart data={rows} categoryKey="label" valueKey="one" /><ChoroplethChart data={[{ region: "A", value: 12 }]} features={features} regionKey="region" valueKey="value" /><TerrainChart data={rows} xKey="x" zKey="two" valueKey="one" /></>);
    expect(container.querySelectorAll("svg")).toHaveLength(18);
  });

  it("shows an accessible empty state", () => {
    render(<LineChart data={[]} xKey="label" series={[...series]} />);
    expect(screen.getByRole("status")).toHaveTextContent("No chart data");
  });

  it("renders an accessible extruded pie with depth and outside labels", () => {
    const { container } = render(<PieChart data={rows} nameKey="label" valueKey="one" variant="extruded" />);
    expect(container.querySelectorAll(".ck-extruded-wall").length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".ck-extruded-label")).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: /Value/ })).toHaveLength(3);
  });

  it("uses directional material lighting and one contact shadow for Airform pies", () => {
    const { container } = render(<PieChart data={rows} nameKey="label" valueKey="one" variant="pie" theme="airform" />);
    expect(container.querySelectorAll("linearGradient")).toHaveLength(3);
    expect(container.querySelectorAll("radialGradient")).toHaveLength(0);
    expect(container.querySelectorAll(".ck-pie-contact-shadow")).toHaveLength(1);
    expect(container.querySelectorAll(".ck-airform-pie-slice")).toHaveLength(3);
  });

  it("uses the dedicated editorial plate for a mono pie", () => {
    const { container } = render(<PieChart data={rows} nameKey="label" valueKey="one" variant="pie" theme="mono-editorial" />);
    expect(container.querySelectorAll(".ck-mono-pie-slice")).toHaveLength(3);
    expect(container.querySelectorAll(".ck-mono-pie-ledger")).toHaveLength(3);
    expect(container.querySelector(".ck-legend")).toBeNull();
  });

  it("gives mono radial rings a single lead metric", () => {
    const { container } = render(<RadialChart centerLabel="12" data={rows} nameKey="label" valueKey="one" variant="rings" theme="mono-editorial" />);
    const values = [...container.querySelectorAll(".ck-radial-value")];
    expect(values[0]).toHaveClass("ck-radial-value-lead");
    expect(values[0]).toHaveAttribute("fill", "var(--ck-text)");
    expect(values.slice(1).every((value) => value.getAttribute("fill") === "transparent")).toBe(true);
    expect(container.querySelector(".ck-radial-center-kicker")).toHaveTextContent("A");
  });

  it("uses ink-density patterns for a mono heatmap", () => {
    const data = rows.map((row) => ({ ...row, day: "Week" }));
    const { container } = render(<HeatmapChart data={data} xKey="label" yKey="day" valueKey="one" theme="mono-editorial" />);
    const cells = [...container.querySelectorAll(".ck-mono-heat-cell")];
    expect(cells).toHaveLength(3);
    expect(cells.every((cell) => cell.getAttribute("fill")?.startsWith("url(#"))).toBe(true);
    expect(container.querySelectorAll(".ck-heat-legend rect")).toHaveLength(5);
  });

  it("renders accessible cohort values and distinct pending periods", () => {
    const data = [
      { cohort: "Jul 06", period: "Week 0", retained: 100, users: 842 },
      { cohort: "Jul 06", period: "Week 1", retained: 68, users: 842 },
      { cohort: "Jul 13", period: "Week 0", retained: 100, users: 791 },
    ];
    const { container } = render(<CohortChart cohortKey="cohort" data={data} periodKey="period" sizeKey="users" theme="mono-editorial" valueKey="retained" />);
    expect(container.querySelectorAll(".ck-cohort-cell")).toHaveLength(3);
    expect(container.querySelectorAll(".ck-cohort-pending")).toHaveLength(1);
    expect(container.querySelectorAll(".ck-cohort-value")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Jul 06 · Week 1: 68% · 842 users" })).toBeInTheDocument();
    expect(container.querySelectorAll(".ck-mono-cohort-cell")).toHaveLength(3);
  });

  it("fills mono funnel stages with progressive ink patterns", () => {
    const { container } = render(<FunnelChart data={rows} stageKey="label" valueKey="one" theme="mono-editorial" variant="tapered" />);
    const stages = [...container.querySelectorAll(".ck-mono-funnel-stage")];
    expect(stages).toHaveLength(3);
    expect(stages.every((stage) => stage.getAttribute("fill")?.startsWith("url(#"))).toBe(true);
    expect(stages.at(-1)).toHaveClass("ck-funnel-band-4");
    expect(container.querySelector(".ck-funnel-label-invert")).not.toBeNull();
  });

  it("rounds the corners of both funnel variants", () => {
    const tapered = render(<FunnelChart data={rows} stageKey="label" valueKey="one" variant="tapered" />);
    const taperedStages = [...tapered.container.querySelectorAll(".ck-funnel-stage")];
    expect(taperedStages).toHaveLength(3);
    expect(taperedStages.every((stage) => stage.tagName.toLowerCase() === "path" && stage.getAttribute("d")?.includes("Q"))).toBe(true);

    const bars = render(<FunnelChart data={rows} stageKey="label" valueKey="one" theme="mono-editorial" variant="stage-bars" />);
    expect([...bars.container.querySelectorAll(".ck-funnel-stage")].every((stage) => Number(stage.getAttribute("rx")) >= 8)).toBe(true);
  });

  it("keeps mono sankey flows substantial and labels off the ribbons", () => {
    const links = [{ source: "Visits", target: "Sign-up", value: 12 }, { source: "Visits", target: "Browse", value: 3 }, { source: "Sign-up", target: "Active", value: 8 }];
    const { container } = render(<SankeyChart data={links} sourceKey="source" targetKey="target" valueKey="value" theme="mono-editorial" />);
    const ribbons = [...container.querySelectorAll(".ck-sankey-link")];
    expect(ribbons).toHaveLength(3);
    expect(ribbons.every((ribbon) => Number(ribbon.getAttribute("stroke-width")) >= 8)).toBe(true);
    expect(container.querySelectorAll(".ck-sankey-link-underlay")).toHaveLength(3);
    expect(container.querySelectorAll(".ck-sankey-label")).toHaveLength(4);
    expect(container.querySelectorAll(".ck-sankey-node-value")).toHaveLength(4);
  });

  it("supports keyboard tooltips and activation", () => {
    const onDatumClick = vi.fn();
    render(<BarChart data={rows} categoryKey="label" series={[{ dataKey: "one", label: "One" }]} onDatumClick={onDatumClick} />);
    const mark = screen.getAllByRole("button", { name: /One/ })[0];
    fireEvent.focus(mark); expect(screen.getByRole("status")).toHaveTextContent("One");
    fireEvent.keyDown(mark, { key: "Enter" }); expect(onDatumClick).toHaveBeenCalledTimes(1);
  });

  it("toggles a series from the legend", () => {
    render(<LineChart data={rows} xKey="label" series={[...series]} />);
    const legend = screen.getByRole("button", { name: "Two" });
    expect(legend).toHaveAttribute("aria-pressed", "true"); fireEvent.click(legend); expect(legend).toHaveAttribute("aria-pressed", "false");
  });

  it.each(["light", "dark"] as const)("keeps every mono-editorial line visible in %s mode", (appearance) => {
    const { container } = render(<LineChart appearance={appearance} data={rows} xKey="label" series={[...series]} theme="mono-editorial" />);
    const traces = [...container.querySelectorAll(".ck-line-trace")];
    expect(traces).toHaveLength(2);
    expect(traces.every((trace) => trace.getAttribute("stroke") === "var(--ck-text)")).toBe(true);
    expect(traces[1]).toHaveClass("ck-line-secondary");
    expect(container.querySelector(".ck-line-underlay")).toBeNull();
  });

  it("gives the latest-value callout enough room for readable type", () => {
    const { container } = render(<LineChart data={rows} xKey="label" series={[series[0]]} theme="mono-editorial" />);
    expect(container.querySelector(".ck-end-label rect")).toHaveAttribute("width", "156");
    expect(container.querySelector(".ck-end-label rect")).toHaveAttribute("height", "60");
  });

  it("keeps mono-editorial radar comparisons transparent and visible", () => {
    const { container } = render(<RadarChart data={rows} categoryKey="label" series={[...series]} theme="mono-editorial" />);
    const shapes = [...container.querySelectorAll(".ck-radar-shape")];
    expect(shapes).toHaveLength(2);
    expect(shapes.every((shape) => shape.getAttribute("fill") === "transparent")).toBe(true);
    expect(shapes.every((shape) => shape.getAttribute("stroke") === "#11110f")).toBe(true);
    expect(shapes[1]).toHaveClass("ck-radar-secondary");
  });

  it("creates typed theme overrides without mutating the preset", () => {
    const custom = createTheme("mono-editorial", { name: "Brand", light: { palette: ["#123456"] } });
    expect(custom.name).toBe("Brand"); expect(custom.modes.light.palette[0]).toBe("#123456");
  });

  it("applies one universal appearance across theme families", () => {
    const { container } = render(<BarChart data={rows} categoryKey="label" series={[...series]} theme="airform" appearance="dark" />);
    expect(container.querySelector(".ck-chart")).toHaveAttribute("data-theme", "airform-dark");
  });

  it.each([
    ["vertical", "grouped"],
    ["vertical", "stacked"],
    ["horizontal", "stacked"],
  ] as const)("keeps mono-editorial %s %s bars unfilled", (variant, layout) => {
    const { container } = render(<BarChart data={rows} categoryKey="label" series={[...series]} theme="mono-editorial" variant={variant} layout={layout} />);
    const marks = [...container.querySelectorAll(".ck-bar-mark")];
    expect(marks.length).toBeGreaterThan(0);
    expect(marks.every((mark) => mark.getAttribute("fill") === "transparent")).toBe(true);
    expect(new Set(marks.map((mark) => mark.getAttribute("stroke"))).size).toBe(2);
  });

  it("renders grouped positive and negative bars from the zero baseline", () => {
    const data = [{ label: "Actual", one: 18 }, { label: "Forecast", one: -12 }];
    const { container } = render(<BarChart data={data} categoryKey="label" series={[series[0]]} theme="neon-instruments" />);
    const zero = Number(container.querySelector(".ck-zero-grid")?.getAttribute("y1"));
    const positive = container.querySelector('[data-sign="positive"]');
    const negative = container.querySelector('[data-sign="negative"]');
    expect(positive).not.toBeNull(); expect(negative).not.toBeNull();
    expect(Number(positive?.getAttribute("y")) + Number(positive?.getAttribute("height"))).toBeCloseTo(zero);
    expect(Number(negative?.getAttribute("y"))).toBeCloseTo(zero);
    expect(Number(negative?.getAttribute("height"))).toBeGreaterThan(0);
    expect(negative?.getAttribute("fill")).toContain("bar-negative");
  });

  it("stacks positive and negative values independently in horizontal bars", () => {
    const data = [{ label: "Net", one: 18, two: -12 }];
    const { container } = render(<BarChart data={data} categoryKey="label" layout="stacked" series={[...series]} variant="horizontal" />);
    const zero = Number(container.querySelector(".ck-zero-grid")?.getAttribute("x1"));
    const positive = container.querySelector('[data-sign="positive"]');
    const negative = container.querySelector('[data-sign="negative"]');
    expect(Number(positive?.getAttribute("x"))).toBeCloseTo(zero);
    expect(Number(negative?.getAttribute("x")) + Number(negative?.getAttribute("width"))).toBeCloseTo(zero);
    expect(Number(negative?.getAttribute("width"))).toBeGreaterThan(0);
  });

  it("gives ranked mono-editorial bars a substantial row weight", () => {
    const { container } = render(<BarChart data={rows} categoryKey="label" series={[series[0]]} theme="mono-editorial" variant="horizontal" />);
    const marks = [...container.querySelectorAll(".ck-ranked-bar")];
    expect(marks.length).toBe(rows.length);
    expect(marks.every((mark) => mark.getAttribute("height") === "24")).toBe(true);
  });

  it("adds directional motion hooks and honors the animation opt-out", () => {
    const vertical = render(<BarChart data={rows} categoryKey="label" series={[series[0]]} />);
    expect(vertical.container.querySelector(".ck-chart")).toHaveClass("ck-animate");
    expect(vertical.container.querySelectorAll(".ck-bar-vertical")).toHaveLength(rows.length);

    const horizontal = render(<BarChart animate={false} data={rows} categoryKey="label" series={[series[0]]} variant="horizontal" />);
    expect(horizontal.container.querySelector(".ck-chart")).not.toHaveClass("ck-animate");
    expect(horizontal.container.querySelectorAll(".ck-bar-horizontal")).toHaveLength(rows.length);
  });

  it("renders stable server markup", () => {
    const html = renderToString(<BarChart data={rows} categoryKey="label" series={[...series]} animate={false} />);
    expect(html).toContain("role=\"img\""); expect(html).toContain("ck-chart");
  });
});
