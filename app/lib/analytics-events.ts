export const chartFamilies = ["bar", "line", "area", "combo", "waterfall", "heatmap", "cohort", "scatter", "pie", "radial", "radar", "funnel", "sankey", "treemap", "histogram", "boxplot", "choropleth", "terrain"] as const;
export const chartThemes = ["mono-editorial", "neon-instruments", "airform"] as const;
export const eventValues = {
  page_view: [""], install_copy: [""], github_click: [""], npm_click: [""],
  code_copy: chartFamilies, chart_select: chartFamilies, theme_select: chartThemes,
  appearance_select: ["light", "dark"],
} as const;
export type AnalyticsEvent = keyof typeof eventValues;
export type NamedCount = { name: string; count: number };
export type AnalyticsReport = {
  days: number;
  daily: { day: string; views: number; visitors: number }[];
  pages: NamedCount[]; referrers: NamedCount[]; campaigns: NamedCount[];
  actions: NamedCount[]; charts: NamedCount[]; themes: NamedCount[]; appearances: NamedCount[];
  downloads: { total: number; start: string; end: string; daily: { day: string; downloads: number }[] } | null;
  updatedAt: string;
};
