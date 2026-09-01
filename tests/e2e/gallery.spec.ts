import { expect, test } from "@playwright/test";

test("catalog, themes, variations, code, and docs work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Charts for React." })).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(18);
  await page.locator("#chart-theme").selectOption("neon-instruments");
  await expect(page).toHaveURL(/theme=neon-instruments/);
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page).toHaveURL(/mode=dark/);
  await page.getByRole("tab", { name: "Cohort", exact: true }).click();
  await expect(page.locator(".variation-example")).toHaveCount(1);
  await expect(page.locator(".ck-cohort-cell")).toHaveCount(21);
  await expect(page.locator(".ck-cohort-pending")).toHaveCount(15);
  await page.getByRole("tab", { name: "Pie", exact: true }).click();
  await expect(page).toHaveURL(/chart=pie/);
  await expect(page.locator(".variation-example")).toHaveCount(3);
  await page.getByRole("button", { name: "Copy code" }).first().click();
  await expect(page.getByRole("button", { name: "Copied" }).first()).toBeVisible();
  await page.locator(".gallery-footer").getByRole("link", { name: "Docs →" }).click();
  await expect(page.getByRole("heading", { name: /Make the data/ })).toBeVisible();
});

test("shareable chart and theme state restores from the URL", async ({ page }) => {
  await page.goto("/?chart=radial&theme=airform&mode=dark");
  await expect(page.getByRole("tab", { name: "Radial" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#chart-theme")).toHaveValue("airform");
  await expect(page.locator(".variation-example .ck-chart").first()).toHaveAttribute("data-theme", "airform-dark");
  await expect(page.locator(".variation-example")).toHaveCount(3);
});

test("only standalone chart variations use the full playground width", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/?chart=treemap&theme=mono-editorial&mode=light");

  const gridWidth = await page.locator(".variation-grid").evaluate((element) => element.getBoundingClientRect().width);
  const chartWidth = await page.locator(".variation-example").evaluate((element) => element.getBoundingClientRect().width);

  expect(chartWidth).toBeGreaterThan(gridWidth * 0.98);

  await page.getByRole("tab", { name: "Pie", exact: true }).click();
  const multiChartWidth = await page.locator(".variation-example").first().evaluate((element) => element.getBoundingClientRect().width);

  expect(multiChartWidth).toBeLessThan(gridWidth * 0.55);
});
