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

## Themes

Use `mono-editorial`, `neon-instruments`, or `airform`, then set `appearance` to `light` or `dark`. Import `createTheme` to create typed overrides for both modes.

## Accessibility

Chart marks expose keyboard tooltips and Enter/Space activation. SVG titles and descriptions remain stable during server rendering. Legends are real pressed-state buttons, empty data is announced, and animations respect reduced-motion preferences.

## Development

From the workspace root:

```bash
npm install
npm run dev
npm test
```

## License

MIT © Kasturi Khanke and Generative Charts contributors.
