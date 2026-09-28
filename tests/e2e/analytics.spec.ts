import { expect, test } from "@playwright/test";
import type { AnalyticsReport } from "../../app/lib/analytics-events";

const report: AnalyticsReport = {
  days: 30, daily: [{ day: "2026-09-28", views: 120, visitors: 80 }, { day: "2026-09-27", views: 60, visitors: 40 }],
  pages: [{ name: "/", count: 150 }, { name: "/docs", count: 30 }], referrers: [{ name: "github", count: 40 }], campaigns: [],
  actions: [{ name: "install_copy", count: 9 }, { name: "github_click", count: 12 }], charts: [{ name: "terrain", count: 20 }],
  themes: [{ name: "mono-editorial", count: 15 }], appearances: [{ name: "light", count: 10 }],
  downloads: { total: 162, start: "2026-08-29", end: "2026-09-27", daily: [] }, updatedAt: "2026-09-28T20:00:00Z",
};
for (const width of [1280, 375]) test(`analytics reports remain readable at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  let requests = 0;
  await page.route("**/api/analytics/report?*", async (route) => { requests++; await route.fulfill({ json: { ...report, days: Number(new URL(route.request().url()).searchParams.get("days")) } }); });
  await page.goto("/analytics/");
  await expect(page.getByRole("heading", { name: "Analytics", exact: true })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByText("180", { exact: true })).toBeVisible();
  await expect(page.getByText("GitHub clicks", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByLabel("Period").selectOption("7");
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  expect(requests).toBe(3);
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-site-theme", "light");
});
test("analytics offers sign-in instead of showing data to anonymous visitors", async ({ page }) => {
  await page.route("**/api/analytics/report?*", (route) => route.fulfill({ status: 401, json: { error: "Sign in" } }));
  await page.goto("/analytics/");
  await expect(page.getByRole("link", { name: "Sign in with ChatGPT" })).toHaveAttribute("href", "/signin-with-chatgpt?return_to=%2Fanalytics%2F");
  await expect(page.getByRole("table")).toHaveCount(0);
});
test("analytics can recover from unavailable storage", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/analytics/report?*", (route) => ++attempts === 1 ? route.fulfill({ status: 503, json: { error: "Unavailable" } }) : route.fulfill({ json: report }));
  await page.goto("/analytics/");
  await expect(page.getByRole("alert").filter({ hasText: "Could not load analytics" })).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("table")).toBeVisible();
});

test("gallery sends views and deliberate actions without copying content into events", async ({ browser, request, baseURL }) => {
  const context = await browser.newContext();
  const events: Record<string, unknown>[] = [];
  // Exercise the real production hostname gate entirely against local assets.
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== "generativecharts.com") { await route.abort(); return; }
    if (url.pathname === "/api/analytics/events") {
      events.push(JSON.parse(route.request().postData() ?? "{}"));
      await route.fulfill({ status: 204 }); return;
    }
    const response = await request.get(`${baseURL}${url.pathname}${url.search}`);
    await route.fulfill({ response });
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async () => {} }, configurable: true });
  });
  await page.goto("https://generativecharts.com/");
  await expect.poll(() => events.filter((event) => event.event === "page_view").length).toBe(1);
  await page.getByRole("tab", { name: "Line", exact: true }).click();
  await page.getByRole("button", { name: "Airform", exact: true }).click();
  await page.getByRole("button", { name: "Copy", exact: true }).click();
  await page.getByRole("button", { name: "Copy code", exact: true }).first().click();
  await page.getByRole("link", { name: "View Generative Charts on GitHub" }).click();
  await page.getByRole("link", { name: "Docs", exact: true }).first().click();
  await expect.poll(() => events.filter((event) => event.event === "page_view").length).toBe(2);
  expect(events.map((event) => event.event)).toEqual(expect.arrayContaining(["chart_select", "theme_select", "install_copy", "code_copy", "github_click"]));
  expect(events.find((event) => event.event === "code_copy")?.value).toBe("line");
  expect(events.at(-1)?.path).toBe("/docs");
  expect(JSON.stringify(events)).not.toContain("npm install");
  await context.close();
});
