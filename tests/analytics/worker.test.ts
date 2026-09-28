import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "../../worker/index";
import { EVENTS_PER_MINUTE, recordAnalytics } from "../../worker/ingestion";
import { testDatabase } from "./database";
import type { Env } from "../../worker/database";

const origin = "https://generativecharts.com";
const owner = { "oai-authenticated-user-id": "verified-site-user", "oai-authenticated-user-email": "owner@example.com" };
function event(payload: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  return new Request(`${origin}/api/analytics/events`, { method: "POST", headers: { "Content-Type": "application/json", Origin: origin, ...headers }, body: JSON.stringify({ event: "page_view", path: "/", visitorId: "a8888888-8888-4888-8888-888888888888", ...payload }) });
}
let data: ReturnType<typeof testDatabase>;
let env: Env;
beforeEach(() => {
  data = testDatabase();
  env = { DB: data.db, ANALYTICS_OWNER_EMAIL: "owner@example.com", ASSETS: { fetch: async () => new Response("Public gallery") } };
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ downloads: [{ day: "2026-09-27", downloads: 12 }] })));
});
afterEach(() => { data.sqlite.close(); vi.unstubAllGlobals(); });

describe("private analytics", () => {
  it("keeps the gallery public and redirects anonymous dashboard visits to sign-in", async () => {
    expect(await (await worker.fetch(new Request(origin), env)).text()).toBe("Public gallery");
    for (const path of ["/analytics", "/analytics/", "/analytics/index.html", "/analytics.txt", "/analytics.html"]) {
      const response = await worker.fetch(new Request(origin + path), env);
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("/signin-with-chatgpt?return_to=%2Fanalytics%2F");
      expect(response.headers.get("Cache-Control")).toContain("no-store");
    }
  });
  it("requires verified identity and the configured owner on every report request", async () => {
    for (const [headers, status] of [[{}, 401], [{ ...owner, "oai-authenticated-user-email": "other@example.com" }, 403], [{ "oai-authenticated-user-email": "owner@example.com" }, 401]] as const) {
      expect((await worker.fetch(new Request(`${origin}/api/analytics/report`, { headers }), env)).status).toBe(status);
    }
    expect((await worker.fetch(new Request(`${origin}/api/analytics/report`, { headers: owner }), { ...env, ANALYTICS_OWNER_EMAIL: "" })).status).toBe(403);
  });
  it("deduplicates daily visitors, aggregates actions and rejects unsupported report ranges", async () => {
    expect((await recordAnalytics(event(), data.db)).status).toBe(204);
    expect((await recordAnalytics(event(), data.db)).status).toBe(204);
    expect((await recordAnalytics(event({ event: "chart_select", value: "terrain" }), data.db)).status).toBe(204);
    const response = await worker.fetch(new Request(`${origin}/api/analytics/report?days=7`, { headers: owner }), env);
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    const report = await response.json();
    expect(report.daily).toHaveLength(7);
    expect(report.daily.at(-1)).toMatchObject({ views: 2, visitors: 1 });
    expect(report.charts).toEqual([{ name: "terrain", count: 1 }]);
    expect(report.downloads.total).toBe(12);
    expect(JSON.stringify(report)).not.toContain("a8888888");
    expect((await worker.fetch(new Request(`${origin}/api/analytics/report?days=365`, { headers: owner }), env)).status).toBe(400);
  });
  it("rejects bad events, arbitrary dimensions, cross-origin and oversized submissions before writing", async () => {
    for (const payload of [{ event: "purchase" }, { path: "/secret" }, { event: "theme_select", value: "bad" }, { event: "__proto__" }, { visitorId: "email@example.com" }]) expect((await recordAnalytics(event(payload), data.db)).status).toBe(400);
    expect((await recordAnalytics(event({}, { Origin: "https://other.example" }), data.db)).status).toBe(403);
    expect((await recordAnalytics(event({ campaign: "x".repeat(3000) }), data.db)).status).toBe(413);
    expect((await recordAnalytics(event({}, { "Content-Type": "text/plain" }), data.db)).status).toBe(415);
    expect(data.sqlite.prepare("SELECT COUNT(*) AS n FROM analytics_daily").get()?.n).toBe(0);
  });
  it("excludes privacy opt-outs, bots, and the signed-in owner", async () => {
    for (const headers of ([{ DNT: "1" }, { "Sec-GPC": "1" }, { "User-Agent": "Googlebot" }, owner] as Record<string, string>[])) expect((await worker.fetch(event({}, headers), env)).status).toBe(204);
    expect(data.sqlite.prepare("SELECT COUNT(*) AS n FROM analytics_daily").get()?.n).toBe(0);
  });
  it("cleans old rows and enforces a durable write budget", async () => {
    data.sqlite.exec("INSERT INTO analytics_visitors VALUES ('2020-01-01', 'expired')");
    await recordAnalytics(event(), data.db);
    expect(data.sqlite.prepare("SELECT COUNT(*) AS n FROM analytics_visitors WHERE day = '2020-01-01'").get()?.n).toBe(0);
    data.sqlite.prepare("UPDATE analytics_budget SET minute_count = ?").run(EVENTS_PER_MINUTE);
    expect((await recordAnalytics(event(), data.db)).status).toBe(429);
    expect(data.sqlite.prepare("SELECT SUM(count) AS n FROM analytics_daily").get()?.n).toBe(1);
  });
  it("reports a storage failure as unavailable and keeps npm failure separate", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await worker.fetch(new Request(`${origin}/api/analytics/report`, { headers: owner }), { ...env, DB: undefined })).status).toBe(503);
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    const response = await worker.fetch(new Request(`${origin}/api/analytics/report`, { headers: owner }), env);
    expect(response.status).toBe(200);
    expect((await response.json()).downloads).toBeNull();
  });
});
