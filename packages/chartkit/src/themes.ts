import type { CSSProperties } from "react";
import type { ChartAppearance, ChartTheme, ChartThemeTokens, ResolvedChartTheme, ThemeId } from "./types.js";

const font = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

type BaseMode = Omit<ChartThemeTokens, "fontFamily" | "plotBackground" | "border" | "borderStrong" | "zeroLine" | "lineUnderlay" | "areaStart" | "areaEnd" | "pointFill" | "pointStroke" | "pointHalo" | "markHighlight" | "markShadow" | "tooltipBorder" | "markRadius" | "motionDuration" | "motionEasing"> & Partial<Pick<ChartThemeTokens, "plotBackground" | "border" | "borderStrong" | "zeroLine" | "lineUnderlay" | "areaStart" | "areaEnd" | "pointFill" | "pointStroke" | "pointHalo" | "markHighlight" | "markShadow" | "tooltipBorder" | "markRadius" | "motionDuration" | "motionEasing">>;

function mode(tokens: BaseMode): ChartThemeTokens {
  return {
    ...tokens,
    plotBackground: tokens.plotBackground ?? tokens.surface,
    border: tokens.border ?? tokens.grid,
    borderStrong: tokens.borderStrong ?? tokens.axis,
    zeroLine: tokens.zeroLine ?? tokens.axis,
    lineUnderlay: tokens.lineUnderlay ?? tokens.surface,
    areaStart: tokens.areaStart ?? tokens.palette[0],
    areaEnd: tokens.areaEnd ?? tokens.background,
    pointFill: tokens.pointFill ?? tokens.background,
    pointStroke: tokens.pointStroke ?? tokens.palette[0],
    pointHalo: tokens.pointHalo ?? tokens.surface,
    markHighlight: tokens.markHighlight ?? "rgba(255,255,255,.46)",
    markShadow: tokens.markShadow ?? "0 0 0 transparent",
    tooltipBorder: tokens.tooltipBorder ?? tokens.axis,
    markRadius: tokens.markRadius ?? 4,
    motionDuration: tokens.motionDuration ?? 580,
    motionEasing: tokens.motionEasing ?? "cubic-bezier(.2,.8,.2,1)",
    fontFamily: font,
  };
}

export const monoEditorial: ChartTheme = {
  id: "mono-editorial",
  name: "Mono Editorial",
  description: "Restrained publication charts with precise monochrome linework.",
  modes: {
    light: mode({ background: "#f7f7f2", plotBackground: "#f7f7f2", surface: "#f7f7f2", text: "#11110f", textMuted: "#777771", grid: "#dfdfd8", axis: "#696963", border: "#d0d0c9", borderStrong: "#11110f", zeroLine: "#11110f", palette: ["#11110f", "#f7f7f2", "#11110f", "#f7f7f2", "#11110f", "#f7f7f2"], positive: "#11110f", negative: "#11110f", lineUnderlay: "#f7f7f2", areaStart: "#11110f", areaEnd: "#f7f7f2", pointFill: "#f7f7f2", pointStroke: "#11110f", pointHalo: "#f7f7f2", markHighlight: "#f7f7f2", markShadow: "0 0 0 #f7f7f2", tooltipBackground: "#f7f7f2", tooltipText: "#11110f", tooltipBorder: "#696963", focusRing: "#11110f", radius: 14, markRadius: 0, shadow: "none", motionDuration: 520, motionEasing: "cubic-bezier(.22,.72,.24,1)" }),
    dark: mode({ background: "#000000", plotBackground: "#000000", surface: "#000000", text: "#ffffff", textMuted: "#b6b6b0", grid: "#3b3b38", axis: "#a3a39c", border: "#454541", borderStrong: "#ffffff", zeroLine: "#ffffff", palette: ["#ffffff", "#000000", "#ffffff", "#000000", "#ffffff", "#000000"], positive: "#ffffff", negative: "#ffffff", lineUnderlay: "#000000", areaStart: "#ffffff", areaEnd: "#000000", pointFill: "#000000", pointStroke: "#ffffff", pointHalo: "#000000", markHighlight: "#ffffff", markShadow: "0 0 0 #000000", tooltipBackground: "#000000", tooltipText: "#ffffff", tooltipBorder: "#a3a39c", focusRing: "#ffffff", radius: 14, markRadius: 0, shadow: "none", motionDuration: 520, motionEasing: "cubic-bezier(.22,.72,.24,1)" }),
  },
};

export const neonInstruments: ChartTheme = {
  id: "neon-instruments",
  name: "Neon Instruments",
  description: "Health-inspired charts with calm surfaces and focused activity colors.",
  modes: {
    light: mode({ background: "#ffffff", plotBackground: "#ffffff", surface: "#f2f2f7", text: "#1c1c1e", textMuted: "rgba(60,60,67,.62)", grid: "rgba(60,60,67,.12)", axis: "rgba(60,60,67,.26)", border: "rgba(60,60,67,.14)", borderStrong: "rgba(60,60,67,.34)", zeroLine: "rgba(60,60,67,.34)", palette: ["#ff2d55", "#34c759", "#32ade6", "#ff9500", "#af52de", "#007aff"], positive: "#34c759", negative: "#ff2d55", lineUnderlay: "rgba(255,45,85,.12)", areaStart: "rgba(255,45,85,.32)", areaEnd: "rgba(255,45,85,.01)", pointFill: "#ffffff", pointStroke: "#ff2d55", pointHalo: "rgba(255,45,85,.14)", markHighlight: "rgba(255,255,255,.18)", markShadow: "0 4px 12px rgba(28,28,30,.14)", tooltipBackground: "#1c1c1e", tooltipText: "#ffffff", tooltipBorder: "rgba(255,255,255,.08)", focusRing: "#ff2d55", radius: 20, markRadius: 7, shadow: "0 8px 28px rgba(28,28,30,.08)", motionDuration: 560, motionEasing: "cubic-bezier(.2,.8,.2,1)" }),
    dark: mode({ background: "#171719", plotBackground: "#171719", surface: "#2d2d32", text: "#f7f7fa", textMuted: "#b7b7c2", grid: "rgba(235,235,245,.14)", axis: "#777781", border: "#3f3f46", borderStrong: "#8f8f99", zeroLine: "#8f8f99", palette: ["#ff4569", "#32d760", "#70d7ff", "#ffa51f", "#c66bfa", "#2f95ff"], positive: "#32d760", negative: "#ff4569", lineUnderlay: "rgba(255,69,105,.18)", areaStart: "rgba(255,69,105,.42)", areaEnd: "rgba(255,69,105,.02)", pointFill: "#171719", pointStroke: "#ff4569", pointHalo: "rgba(255,69,105,.22)", markHighlight: "rgba(255,255,255,.2)", markShadow: "0 5px 16px rgba(0,0,0,.34)", tooltipBackground: "#f7f7fa", tooltipText: "#171719", tooltipBorder: "#c7c7d0", focusRing: "#ffd60a", radius: 20, markRadius: 7, shadow: "0 12px 36px rgba(0,0,0,.32)", motionDuration: 580, motionEasing: "cubic-bezier(.2,.8,.2,1)" }),
  },
};

export const airform: ChartTheme = {
  id: "airform",
  name: "Airform",
  description: "Cobalt and sky-blue data objects on an airy glass surface.",
  modes: {
    light: mode({ background: "linear-gradient(180deg,#e7f7ff 0%,#b8e1ff 52%,#f4fbff 100%)", plotBackground: "rgba(242,250,255,.32)", surface: "rgba(255,255,255,.38)", text: "#061b3f", textMuted: "rgba(6,27,63,.58)", grid: "rgba(6,27,63,.09)", axis: "rgba(6,27,63,.24)", border: "rgba(255,255,255,.68)", borderStrong: "rgba(255,255,255,.92)", palette: ["#176cff", "#4089e5", "#58a0de", "#6db3df", "#84c2e2", "#9ccfe7"], positive: "#2f83d7", negative: "#315f9f", lineUnderlay: "rgba(255,255,255,.72)", areaStart: "rgba(23,108,255,.34)", areaEnd: "rgba(88,160,222,.06)", pointFill: "#f8fcff", pointStroke: "#176cff", pointHalo: "rgba(23,108,255,.22)", markHighlight: "rgba(255,255,255,.76)", markShadow: "0 12px 26px rgba(36,82,140,.22)", tooltipBackground: "#061b3f", tooltipText: "#f4fbff", tooltipBorder: "rgba(255,255,255,.7)", focusRing: "#176cff", radius: 26, markRadius: 10, shadow: "0 28px 80px rgba(36,82,140,.20)", motionDuration: 700, motionEasing: "cubic-bezier(.16,.78,.22,1)" }),
    dark: mode({ background: "linear-gradient(180deg,#050d18 0%,#0b2440 52%,#020810 100%)", plotBackground: "rgba(2,8,16,.28)", surface: "rgba(227,244,255,.13)", text: "#f6fbff", textMuted: "#b9cee2", grid: "rgba(211,239,255,.16)", axis: "#7e9fbe", border: "rgba(183,219,247,.3)", borderStrong: "#9ec4e5", zeroLine: "#9ec4e5", palette: ["#6f9cff", "#78b4ff", "#8ac8f7", "#9fd6f5", "#b6e1f7", "#d0eefb"], positive: "#78b4ff", negative: "#a0b3ca", lineUnderlay: "rgba(151,202,255,.34)", areaStart: "rgba(111,156,255,.48)", areaEnd: "rgba(138,200,247,.05)", pointFill: "#f8fcff", pointStroke: "#78b4ff", pointHalo: "rgba(111,156,255,.36)", markHighlight: "rgba(255,255,255,.9)", markShadow: "0 14px 30px rgba(0,0,0,.42)", tooltipBackground: "#f6fbff", tooltipText: "#061426", tooltipBorder: "#9ec4e5", focusRing: "#ffffff", radius: 26, markRadius: 10, shadow: "0 34px 100px rgba(0,0,0,.5),0 0 52px rgba(94,168,255,.14)", motionDuration: 700, motionEasing: "cubic-bezier(.16,.78,.22,1)" }),
  },
};

export const themes = { monoEditorial, neonInstruments, airform } as const;
export const themeList = Object.values(themes);
const themesById = Object.fromEntries(themeList.map((theme) => [theme.id, theme])) as Record<ThemeId, ChartTheme>;

export function resolveTheme(theme: ThemeId | ChartTheme = "mono-editorial", appearance: ChartAppearance = "light"): ResolvedChartTheme {
  const family = typeof theme === "string" ? themesById[theme] : theme;
  return { id: `${family.id}-${appearance}`, familyId: family.id, name: family.name, description: family.description, appearance, tokens: family.modes[appearance] };
}

export function sequentialFloor(theme: ResolvedChartTheme): string {
  if (theme.familyId === "mono-editorial") return theme.appearance === "dark" ? "#000000" : "#ffffff";
  if (theme.familyId === "neon-instruments") return theme.appearance === "dark" ? "#2d2d32" : "#f2f2f7";
  if (theme.familyId === "airform") return theme.appearance === "dark" ? "#10243a" : "#e8f6ff";
  return theme.appearance === "dark" ? "#20252d" : "#eef1f4";
}

export function createTheme(base: ThemeId | ChartTheme, overrides: { id?: string; name?: string; description?: string; light?: Partial<ChartThemeTokens>; dark?: Partial<ChartThemeTokens> } = {}): ChartTheme {
  const source = typeof base === "string" ? themesById[base] : base;
  return { id: overrides.id ?? `${source.id}-custom`, name: overrides.name ?? `${source.name} Custom`, description: overrides.description ?? source.description, modes: { light: { ...source.modes.light, ...overrides.light }, dark: { ...source.modes.dark, ...overrides.dark } } };
}

export function themeStyle(theme: ResolvedChartTheme): CSSProperties {
  const t = theme.tokens;
  const resolvedFont = theme.familyId === "mono-editorial" ? "'IBM Plex Mono', 'Space Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" : t.fontFamily;
  return { "--ck-background": t.background, "--ck-plot-background": t.plotBackground, "--ck-surface": t.surface, "--ck-text": t.text, "--ck-text-muted": t.textMuted, "--ck-grid": t.grid, "--ck-axis": t.axis, "--ck-border": t.border, "--ck-border-strong": t.borderStrong, "--ck-zero": t.zeroLine, "--ck-positive": t.positive, "--ck-negative": t.negative, "--ck-line-underlay": t.lineUnderlay, "--ck-area-start": t.areaStart, "--ck-area-end": t.areaEnd, "--ck-point-fill": t.pointFill, "--ck-point-stroke": t.pointStroke, "--ck-point-halo": t.pointHalo, "--ck-mark-highlight": t.markHighlight, "--ck-mark-shadow": t.markShadow, "--ck-tooltip-bg": t.tooltipBackground, "--ck-tooltip-text": t.tooltipText, "--ck-tooltip-border": t.tooltipBorder, "--ck-focus": t.focusRing, "--ck-font": resolvedFont, "--ck-radius": `${t.radius}px`, "--ck-mark-radius": `${t.markRadius}px`, "--ck-shadow": t.shadow, "--ck-motion-duration": `${t.motionDuration}ms`, "--ck-motion-easing": t.motionEasing } as CSSProperties;
}
