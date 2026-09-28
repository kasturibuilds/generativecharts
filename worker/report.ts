import type { AnalyticsReport, NamedCount } from "../app/lib/analytics-events";
import type { Database } from "./database";

async function downloads(days: number): Promise<AnalyticsReport["downloads"]> {
  // npm's latest complete UTC day avoids presenting a partial day as a decline.
  const end = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const start = new Date(Date.parse(end) - (days - 1) * 86400000).toISOString().slice(0, 10);
  try {
    const response = await fetch(`https://api.npmjs.org/downloads/range/${start}:${end}/generative-charts`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const payload = await response.json() as { downloads?: { day: string; downloads: number }[] };
    if (!Array.isArray(payload.downloads) || !payload.downloads.every((d) => typeof d.day === "string" && Number.isFinite(d.downloads) && d.downloads >= 0)) return null;
    return { start, end, total: payload.downloads.reduce((sum, d) => sum + d.downloads, 0), daily: payload.downloads };
  } catch { return null; }
}

export async function report(db: Database, days: number): Promise<AnalyticsReport> {
  const cutoff = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
  const query = async <T>(sql: string) => {
    const result = await db.prepare(sql).bind(cutoff).all<T>();
    if (!result.success) throw new Error("Analytics query failed");
    return result.results;
  };
  // Dimensions below are fixed source strings, never interpolated user input.
  const ranking = (dimension: string, event: string) => query<NamedCount>(`SELECT ${dimension} AS name, SUM(count) AS count FROM analytics_daily WHERE day >= ? AND event = '${event}' GROUP BY ${dimension} ORDER BY count DESC LIMIT 20`);
  const [views, visitors, pages, referrers, campaigns, actions, charts, themes, appearances, npm] = await Promise.all([
    query<{ day: string; count: number }>("SELECT day, SUM(count) AS count FROM analytics_daily WHERE day >= ? AND event = 'page_view' GROUP BY day ORDER BY day"),
    query<{ day: string; count: number }>("SELECT day, COUNT(*) AS count FROM analytics_visitors WHERE day >= ? GROUP BY day ORDER BY day"),
    ranking("path", "page_view"), ranking("referrer", "page_view"),
    query<NamedCount>("SELECT source || ' / ' || campaign AS name, SUM(count) AS count FROM analytics_daily WHERE day >= ? AND event = 'page_view' AND campaign != 'untagged' GROUP BY source, campaign ORDER BY count DESC LIMIT 20"),
    query<NamedCount>("SELECT event AS name, SUM(count) AS count FROM analytics_daily WHERE day >= ? AND event != 'page_view' GROUP BY event ORDER BY count DESC"),
    ranking("value", "chart_select"), ranking("value", "theme_select"), ranking("value", "appearance_select"), downloads(days),
  ]);
  const viewMap = new Map(views.map((row) => [row.day, Number(row.count)]));
  const visitorMap = new Map(visitors.map((row) => [row.day, Number(row.count)]));
  const daily = Array.from({ length: days }, (_, index) => {
    const day = new Date(Date.parse(cutoff) + index * 86400000).toISOString().slice(0, 10);
    return { day, views: viewMap.get(day) ?? 0, visitors: visitorMap.get(day) ?? 0 };
  });
  return { days, daily, pages, referrers, campaigns, actions, charts, themes, appearances, downloads: npm, updatedAt: new Date().toISOString() };
}
