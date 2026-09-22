# Generative Charts

Polished, accessible React charts with eighteen useful chart families, three themes, and universal light and dark modes.

## Install

```bash
npm install generative-charts
```

```tsx
import { BarChart } from "generative-charts";
import "generative-charts/styles.css";

const data = [
  { month: "Jan", revenue: 42 },
  { month: "Feb", revenue: 58 },
];

<BarChart
  data={data}
  categoryKey="month"
  series={[{ dataKey: "revenue", label: "Revenue" }]}
  theme="mono-editorial"
  appearance="light"
/>;
```

## Compatibility

- React 18 and React 19, with React supplied by your application.
- ESM imports with TypeScript declarations and a separate stylesheet export.
- Tested with TypeScript 5.9 in both NodeNext and Bundler resolution modes.
- Node.js 20 or newer for server rendering and tooling.
- Client component directives are preserved for React Server Component frameworks.
- Original TypeScript sources are included for source maps and editor navigation.

Import the stylesheet once at the application root. The package does not inject global styles or bundle React. CommonJS `require()` is not a supported entry point.

## Components

- `BarChart`: vertical, horizontal, grouped, and stacked.
- `LineChart`: single or multiple smooth/linear series.
- `AreaChart`: single, multiple, and stacked.
- `ScatterChart`: multiple series and optional size encoding.
- `PieChart`: pie, donut, and extruded 3D composition.
- `RadarChart`: single and comparison profiles.
- `HeatmapChart`: categorical intensity matrices.
- `CohortChart`: retention matrices with cohort sizes and pending periods.
- `TerrainChart`: projected 3D surfaces with wireframe and point-cloud treatments.
- `RadialChart`: progress rings and gauges.
- `FunnelChart`: tapered and stage-bar conversion views.
- `SankeyChart`: weighted multi-stage flows.
- `TreemapChart`: space-filling composition.
- `WaterfallChart`: positive and negative contribution bridges.
- `ComboChart`: bars and lines in one categorical plot.
- `HistogramChart`: numeric frequency distributions.
- `BoxPlotChart`: quartiles, medians, and ranges.
- `ChoroplethChart`: GeoJSON-style regional intensity maps.

Bar charts accept signed values in grouped and stacked layouts. Positive and negative stacks accumulate independently from the zero baseline.

## Missing values and diagnostics

ChartKit never turns a missing measurement into zero unless you explicitly ask it to. Bars omit missing marks, line and area charts break their paths, radar charts leave incomplete profiles open, and matrix charts render a distinct missing cell.

Use `missingValueStrategy="connect"` to bridge line/area gaps or `missingValueStrategy="zero"` to make zero imputation explicit. Development builds warn about missing, malformed, and non-finite numeric values. Use `onDiagnostic` when you also need structured observability:

```tsx
<LineChart
  data={data}
  xKey="timestamp"
  series={series}
  onDiagnostic={(diagnostic) => reportChartIssue(diagnostic)}
/>
```

## Cartesian scales

Line, area, scatter, and combo charts support categorical, linear, and temporal x-axes. Numbers are inferred as linear and `Date` objects as temporal; strings remain categorical unless a time scale is explicit.

```tsx
<LineChart
  data={data}
  xKey="timestamp"
  series={series}
  xScale={{
    type: "time",
    timeZone: "UTC",
    tickCount: 5,
    tickFormatter: (value) => value instanceof Date ? value.toISOString().slice(0, 10) : String(value),
  }}
/>
```

Set `domain` for a stable numeric or temporal comparison range. Time ticks default to UTC formatting so server and client output agree.

## Comparison interaction

Line, area, and combo charts compare every visible series at one x position. Pointer and touch tracking choose the nearest position. Keyboard users enter through one roving tab stop, move with Left/Right, switch the active series with Up/Down, and activate it with Enter or Space. `activeIndex`, `defaultActiveIndex`, and `onActiveIndexChange` support controlled coordination across charts.

## Themes

Use `mono-editorial`, `neon-instruments`, or `airform`, then set `appearance` to `light` or `dark`. Import `createTheme` to create typed overrides for both modes.

Dark modes use independently reviewed text, grid, focus, tooltip, and sequential-scale tokens; they are not automatic inversions of the light palettes.

## Accessibility

Chart marks expose keyboard tooltips and Enter/Space activation. Shared Cartesian comparisons use roving focus instead of adding every point to the page tab order. SVG titles and descriptions remain stable during server rendering. Legends are real pressed-state buttons, empty data is announced, and animations respect reduced-motion preferences.

Every chart measures its plot container. Compact, standard, and wide layout modes adjust tick density, label wrapping, figure spacing, legends, and source treatment without relying on viewport media queries.

## Development

From the workspace root:

```bash
npm install
npm run dev
npm test
```

## License

MIT © Kasturi Khanke and Generative Charts contributors.
