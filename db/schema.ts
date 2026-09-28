import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const analyticsDaily = sqliteTable("analytics_daily", {
  day: text("day").notNull(), event: text("event").notNull(), path: text("path").notNull(),
  value: text("value").notNull().default(""), source: text("source").notNull(),
  campaign: text("campaign").notNull(), referrer: text("referrer").notNull(),
  count: integer("count").notNull().default(0),
}, (t) => [primaryKey({ columns: [t.day, t.event, t.path, t.value, t.source, t.campaign, t.referrer] })]);
export const analyticsVisitors = sqliteTable("analytics_visitors", {
  day: text("day").notNull(), visitorId: text("visitor_id").notNull(),
}, (t) => [primaryKey({ columns: [t.day, t.visitorId] })]);
export const analyticsBudget = sqliteTable("analytics_budget", {
  id: integer("id").primaryKey(), minute: integer("minute").notNull(), minuteCount: integer("minute_count").notNull(),
  day: text("day").notNull(), dayCount: integer("day_count").notNull(),
});
