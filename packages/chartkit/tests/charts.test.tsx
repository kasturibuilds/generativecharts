import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AreaChart, BarChart, BoxPlotChart, chartLayoutMode, ChoroplethChart, CohortChart, ComboChart, createTheme, FunnelChart, HeatmapChart, HistogramChart, LineChart, PieChart, RadarChart, RadialChart, SankeyChart, ScatterChart, TerrainChart, TreemapChart, WaterfallChart } from "../src/index";

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

  it("keeps zero progress visible and inspectable in radial gauges and rings", () => {
    const onDatumClick = vi.fn();
    const data = [{ name: "Started", value: 0 }, { name: "Complete", value: 40 }];
    const gauge = render(<RadialChart data={data.slice(0, 1)} maxValue={100} nameKey="name" onDatumClick={onDatumClick} valueFormatter={(value) => `${value}%`} valueKey="value" variant="gauge" />);

    expect(gauge.container.querySelector(".ck-empty")).toBeNull();
    expect(gauge.container.querySelector(".ck-radial-center")).toHaveTextContent("0");
    expect(gauge.container.querySelectorAll(".ck-radial-value")).toHaveLength(0);
    const zeroTrack = screen.getByRole("button", { name: "Started · Value: 0%" });
    expect(zeroTrack).toHaveClass("ck-radial-track");
    fireEvent.focus(zeroTrack);
    expect(screen.getByRole("status")).toHaveTextContent("Started · Value: 0%");
    fireEvent.keyDown(zeroTrack, { key: "Enter" });
    expect(onDatumClick).toHaveBeenCalledWith(data[0], { dataKey: "value", label: "Value" });

    gauge.unmount();
    const rings = render(<RadialChart data={data} maxValue={100} nameKey="name" valueKey="value" variant="rings" />);
    expect(rings.container.querySelectorAll(".ck-radial-track")).toHaveLength(2);
    expect(rings.container.querySelectorAll(".ck-radial-value")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Started · Value: 0" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Complete · Value: 40" })).toBeInTheDocument();
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

  it("renders equal-weight treemap peers without recursive partition failure", () => {
    const data = ["Alpha", "Beta", "Gamma", "Delta"].map((name) => ({ name, value: 25 }));
    const { container } = render(<TreemapChart animate={false} data={data} nameKey="name" valueKey="value" />);
    const tiles = [...container.querySelectorAll(".ck-treemap-tile")];

    expect(tiles).toHaveLength(data.length);
    expect(tiles.every((tile) => Number(tile.getAttribute("width")) > 0)).toBe(true);
    expect(tiles.every((tile) => Number(tile.getAttribute("height")) > 0)).toBe(true);
    expect(screen.getByRole("button", { name: "Alpha · Value: 25" })).toBeInTheDocument();
  });

  it.each([
    [3.8, 3],
    [0, 3],
    [24.8, 24],
    [Number.NaN, 8],
    [Number.POSITIVE_INFINITY, 8],
  ])("normalizes histogram bin count %s to %i", (requested, expected) => {
    const data = [{ value: 0 }, { value: 12 }, { value: 24 }];
    const { container } = render(<HistogramChart bins={requested} data={data} valueKey="value" />);
    const bars = [...container.querySelectorAll(".ck-histogram-bar")];

    expect(bars).toHaveLength(expected);
    expect(bars.every((bar) => bar.hasAttribute("x") && Number.isFinite(Number(bar.getAttribute("x"))))).toBe(true);
    expect(bars.reduce((sum, bar) => sum + Number(bar.getAttribute("aria-label")?.match(/Frequency: (\d+)$/)?.[1] ?? 0), 0)).toBe(data.length);
  });

  it("does not fabricate datum interaction for empty histogram bins", () => {
    const onDatumClick = vi.fn();
    const data = [{ value: 0 }, { value: 100 }];
    const { container } = render(<HistogramChart bins={3} data={data} onDatumClick={onDatumClick} valueKey="value" />);
    const bars = [...container.querySelectorAll<SVGRectElement>(".ck-histogram-bar")];

    expect(bars[1]).toHaveAttribute("aria-hidden", "true");
    expect(bars[1]).not.toHaveAttribute("tabindex");
    fireEvent.click(bars[1]);
    expect(onDatumClick).not.toHaveBeenCalled();
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
    expect(marks.every((mark) => mark.getAttribute("fill") === "transparent")).toBe(true);
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

  it("keeps missing values out of marks unless zero is explicitly requested", () => {
    const data = [{ label: "A", one: 8 }, { label: "B", one: null }, { label: "C", one: 12 }];
    const omitted = render(<BarChart data={data} categoryKey="label" series={[series[0]]} />);
    expect(omitted.container.querySelectorAll(".ck-bar-mark")).toHaveLength(2);
    omitted.unmount();
    const zeroed = render(<BarChart data={data} categoryKey="label" missingValueStrategy="zero" series={[series[0]]} />);
    expect(zeroed.container.querySelectorAll(".ck-bar-mark")).toHaveLength(3);
  });

  it("renders missing line values as gaps and can deliberately connect them", () => {
    const data = [{ label: "A", one: 8 }, { label: "B", one: null }, { label: "C", one: 12 }];
    const gapped = render(<LineChart data={data} curve="linear" xKey="label" series={[series[0]]} />);
    const gapPath = gapped.container.querySelector(".ck-line-trace")?.getAttribute("d") ?? "";
    expect((gapPath.match(/M/g) ?? [])).toHaveLength(2);
    expect(gapped.container.querySelectorAll(".ck-point")).toHaveLength(2);
    gapped.unmount();
    const connected = render(<LineChart data={data} curve="linear" missingValueStrategy="connect" xKey="label" series={[series[0]]} />);
    const connectedPath = connected.container.querySelector(".ck-line-trace")?.getAttribute("d") ?? "";
    expect((connectedPath.match(/M/g) ?? [])).toHaveLength(1);
  });

  it("preserves irregular numeric x spacing", () => {
    const data = [{ x: 0, one: 8 }, { x: 1, one: 10 }, { x: 10, one: 12 }];
    const { container } = render(<LineChart data={data} xKey="x" xScale={{ type: "linear" }} series={[series[0]]} />);
    const positions = [...container.querySelectorAll(".ck-point")].map((point) => Number(point.getAttribute("cx")));
    expect(positions[1] - positions[0]).toBeLessThan((positions[2] - positions[1]) / 4);
  });

  it("formats temporal x-axis ticks deterministically", () => {
    const data = [{ when: "2026-01-01", one: 8 }, { when: "2026-03-01", one: 12 }];
    const { container } = render(<LineChart data={data} xKey="when" xScale={{ type: "time", tickCount: 3, timeZone: "UTC" }} series={[series[0]]} />);
    expect(container.textContent).toMatch(/Jan|Feb|Mar/);
  });

  it("exposes a shared comparison tooltip with roving keyboard focus", () => {
    const onActiveIndexChange = vi.fn();
    const { container } = render(<LineChart data={rows} onActiveIndexChange={onActiveIndexChange} xKey="label" series={[...series]} />);
    const targets = [...container.querySelectorAll<SVGRectElement>(".ck-comparison-target")];
    expect(targets.map((target) => target.tabIndex)).toEqual([0, -1, -1]);
    expect(targets.every((target) => Number(target.getAttribute("width")) >= 24)).toBe(true);
    fireEvent.focus(targets[0]);
    expect(screen.getByRole("status")).toHaveTextContent("One");
    expect(screen.getByRole("status")).toHaveTextContent("Two");
    fireEvent.keyDown(targets[0], { key: "ArrowRight" });
    expect(onActiveIndexChange).toHaveBeenLastCalledWith(1);
  });

  it("ignores pointer inspection when Cartesian positions are all invalid", () => {
    const invalid = [{ x: "bad", one: 8, two: 5 }, { x: null, one: 12, two: 9 }];
    const line = render(<LineChart data={invalid} xKey="x" xScale={{ type: "linear" }} series={[series[0]]} />);
    expect(() => fireEvent.pointerMove(line.container.querySelector(".ck-svg")!, { clientX: 100, pointerType: "mouse" })).not.toThrow();
    line.unmount();

    const combo = render(<ComboChart data={invalid} xKey="x" xScale={{ type: "linear" }} series={[...series]} />);
    expect(() => fireEvent.pointerMove(combo.container.querySelector(".ck-svg")!, { clientX: 100, pointerType: "mouse" })).not.toThrow();
  });

  it("keeps dense combo comparison targets at least 24px wide", () => {
    const data = Array.from({ length: 50 }, (_, x) => ({ x, one: x, two: x + 1 }));
    const { container } = render(<ComboChart data={data} xKey="x" xScale={{ type: "linear" }} series={[...series]} />);
    const targets = [...container.querySelectorAll<SVGRectElement>(".ck-comparison-target")];

    expect(targets).toHaveLength(data.length);
    expect(targets.every((target) => Number(target.getAttribute("width")) >= 24)).toBe(true);
  });

  it("reports structured diagnostics for invalid values and x positions", async () => {
    const onDiagnostic = vi.fn(); const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<LineChart data={[{ x: 0, one: 8 }, { x: "bad", one: Number.NaN }, { x: 2, one: null }]} onDiagnostic={onDiagnostic} xKey="x" xScale={{ type: "linear" }} series={[series[0]]} />);
    await waitFor(() => expect(onDiagnostic).toHaveBeenCalled());
    expect(onDiagnostic.mock.calls.map(([diagnostic]) => diagnostic.code)).toEqual(expect.arrayContaining(["invalid-number", "missing-number", "invalid-x"]));
    warning.mockRestore();
  });

  it("uses container-width layout modes and high-contrast dark tokens", () => {
    expect([chartLayoutMode(320), chartLayoutMode(600), chartLayoutMode(900)]).toEqual(["compact", "standard", "wide"]);
    const { container } = render(<LineChart appearance="dark" data={rows} theme="mono-editorial" xKey="label" series={[series[0]]} />);
    const chart = container.querySelector<HTMLElement>(".ck-chart");
    expect(chart?.style.getPropertyValue("--ck-background")).toBe("#000000");
    expect(chart?.style.getPropertyValue("--ck-text")).toBe("#ffffff");
  });
});
