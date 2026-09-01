import type { CSSProperties } from "react";

export type ChartDatum = Record<string, unknown>;
export type ThemeId = "mono-editorial" | "neon-instruments" | "airform";
export type ChartAppearance = "light" | "dark";

export type ChartThemeTokens = {
  background: string;
  plotBackground: string;
  surface: string;
  text: string;
  textMuted: string;
  grid: string;
  axis: string;
  border: string;
  borderStrong: string;
  zeroLine: string;
  palette: readonly string[];
  positive: string;
  negative: string;
  lineUnderlay: string;
  areaStart: string;
  areaEnd: string;
  pointFill: string;
  pointStroke: string;
  pointHalo: string;
  markHighlight: string;
  markShadow: string;
  tooltipBackground: string;
  tooltipText: string;
  tooltipBorder: string;
  focusRing: string;
  fontFamily: string;
  radius: number;
  markRadius: number;
  shadow: string;
  motionDuration: number;
  motionEasing: string;
};

export type ChartTheme = {
  id: string;
  name: string;
  description: string;
  modes: Record<ChartAppearance, ChartThemeTokens>;
};

export type ResolvedChartTheme = {
  id: string;
  familyId: string;
  name: string;
  description: string;
  appearance: ChartAppearance;
  tokens: ChartThemeTokens;
};

export type Series<TDatum extends ChartDatum = ChartDatum> = {
  dataKey: keyof TDatum & string;
  label: string;
  color?: string;
};

export type ValueFormatter = (value: number) => string;

export type CommonChartProps<TDatum extends ChartDatum = ChartDatum> = {
  data: TDatum[];
  figureLabel?: string;
  title?: string;
  description?: string;
  source?: string;
  theme?: ThemeId | ChartTheme;
  appearance?: ChartAppearance;
  height?: number;
  className?: string;
  style?: CSSProperties;
  animate?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  valueFormatter?: ValueFormatter;
  ariaLabel?: string;
  getDatumLabel?: (datum: TDatum, seriesLabel: string, value: number) => string;
  onDatumClick?: (datum: TDatum, series: Series<TDatum>) => void;
};

export type CartesianChartProps<TDatum extends ChartDatum = ChartDatum> =
  CommonChartProps<TDatum> & {
    xKey: keyof TDatum & string;
    series: Series<TDatum>[];
  };

export type BarChartProps<TDatum extends ChartDatum = ChartDatum> =
  CommonChartProps<TDatum> & {
    categoryKey: keyof TDatum & string;
    series: Series<TDatum>[];
    variant?: "vertical" | "horizontal";
    layout?: "grouped" | "stacked";
  };

export type LineChartProps<TDatum extends ChartDatum = ChartDatum> =
  CartesianChartProps<TDatum> & {
    curve?: "smooth" | "linear";
    showPoints?: boolean;
    variant?: "standard" | "sparkline";
  };

export type AreaChartProps<TDatum extends ChartDatum = ChartDatum> =
  CartesianChartProps<TDatum> & {
    curve?: "smooth" | "linear";
    stacked?: boolean;
  };

export type ScatterChartProps<TDatum extends ChartDatum = ChartDatum> =
  CartesianChartProps<TDatum> & {
    size?: number;
    sizeKey?: keyof TDatum & string;
  };

export type PieChartProps<TDatum extends ChartDatum = ChartDatum> =
  CommonChartProps<TDatum> & {
    nameKey: keyof TDatum & string;
    valueKey: keyof TDatum & string;
    variant?: "pie" | "donut" | "extruded";
    centerLabel?: string;
  };

export type RadarChartProps<TDatum extends ChartDatum = ChartDatum> =
  CommonChartProps<TDatum> & {
    categoryKey: keyof TDatum & string;
    series: Series<TDatum>[];
  };

export type HeatmapChartProps<TDatum extends ChartDatum = ChartDatum> =
  CommonChartProps<TDatum> & {
    xKey: keyof TDatum & string;
    yKey: keyof TDatum & string;
    valueKey: keyof TDatum & string;
    lowColor?: string;
    highColor?: string;
  };

export type CohortChartProps<TDatum extends ChartDatum = ChartDatum> =
  CommonChartProps<TDatum> & {
    cohortKey: keyof TDatum & string;
    periodKey: keyof TDatum & string;
    valueKey: keyof TDatum & string;
    sizeKey?: keyof TDatum & string;
    maxValue?: number;
    showValues?: boolean;
  };

export type TerrainChartProps<TDatum extends ChartDatum = ChartDatum> =
  CommonChartProps<TDatum> & {
    xKey: keyof TDatum & string;
    zKey: keyof TDatum & string;
    valueKey: keyof TDatum & string;
    density?: "low" | "medium" | "high";
    smoothing?: "low" | "medium" | "high";
    showWireframe?: boolean;
    showPointCloud?: boolean;
  };

export type RadialChartProps<TDatum extends ChartDatum = ChartDatum> = CommonChartProps<TDatum> & {
  nameKey: keyof TDatum & string;
  valueKey: keyof TDatum & string;
  variant?: "rings" | "gauge" | "half-gauge";
  maxValue?: number;
  centerLabel?: string;
};

export type FunnelChartProps<TDatum extends ChartDatum = ChartDatum> = CommonChartProps<TDatum> & {
  stageKey: keyof TDatum & string;
  valueKey: keyof TDatum & string;
  variant?: "tapered" | "stage-bars";
};

export type SankeyChartProps<TDatum extends ChartDatum = ChartDatum> = CommonChartProps<TDatum> & {
  sourceKey: keyof TDatum & string;
  targetKey: keyof TDatum & string;
  valueKey: keyof TDatum & string;
};

export type TreemapChartProps<TDatum extends ChartDatum = ChartDatum> = CommonChartProps<TDatum> & {
  nameKey: keyof TDatum & string;
  valueKey: keyof TDatum & string;
};

export type WaterfallChartProps<TDatum extends ChartDatum = ChartDatum> = CommonChartProps<TDatum> & {
  categoryKey: keyof TDatum & string;
  valueKey: keyof TDatum & string;
  totalIndices?: number[];
};

export type ComboChartProps<TDatum extends ChartDatum = ChartDatum> = CartesianChartProps<TDatum> & {
  lineKeys?: Array<keyof TDatum & string>;
};

export type HistogramChartProps<TDatum extends ChartDatum = ChartDatum> = CommonChartProps<TDatum> & {
  valueKey: keyof TDatum & string;
  bins?: number;
};

export type BoxPlotChartProps<TDatum extends ChartDatum = ChartDatum> = CommonChartProps<TDatum> & {
  categoryKey: keyof TDatum & string;
  valueKey: keyof TDatum & string;
};

export type GeoPosition = [number, number];
export type GeoGeometry =
  | { type: "Polygon"; coordinates: GeoPosition[][] }
  | { type: "MultiPolygon"; coordinates: GeoPosition[][][] };
export type GeoFeature = { type: "Feature"; properties: Record<string, unknown>; geometry: GeoGeometry };

export type ChoroplethChartProps<TDatum extends ChartDatum = ChartDatum> = CommonChartProps<TDatum> & {
  regionKey: keyof TDatum & string;
  valueKey: keyof TDatum & string;
  features: GeoFeature[];
  featureKey?: string;
  lowColor?: string;
  highColor?: string;
};
