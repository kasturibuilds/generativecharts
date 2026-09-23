import { expect, test } from "@playwright/test";

for (const width of [390, 1280]) {
  test(`theme previews select charts by keyboard at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const picker = page.getByRole("group", { name: "Chart theme" });
    await expect(picker.getByRole("button")).toHaveCount(3);
    for (const [name, id] of [["Mono Editorial", "mono-editorial"], ["Neon Instruments", "neon-instruments"], ["Airform", "airform"]]) {
      const option = picker.getByRole("button", { name, exact: true });
      await option.focus();
      await option.press("Enter");
      await expect(option).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".variation-example .ck-chart").first()).toHaveAttribute("data-theme", `${id}-light`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    await page.screenshot({ path: testInfo.outputPath(`themes-light-${width}.png`), fullPage: true });
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect(picker.locator('[data-preview-theme$="-dark"]')).toHaveCount(3);
    await page.screenshot({ path: testInfo.outputPath(`themes-dark-${width}.png`), fullPage: true });
  });
}

test("catalog, themes, variations, code, and docs work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Charts for React." })).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(18);
  await page.getByRole("button", { name: "Neon Instruments", exact: true }).click();
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
  await page.getByRole("navigation", { name: "Footer links" }).getByRole("link", { name: "Docs →" }).click();
  await expect(page.getByRole("heading", { name: "Install Generative Charts", exact: true })).toBeVisible();
});

test("shareable chart and theme state restores from the URL", async ({ page }) => {
  await page.goto("/?chart=radial&theme=airform&mode=dark");
  await expect(page.getByRole("tab", { name: "Radial" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("button", { name: "Airform", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".variation-example .ck-chart").first()).toHaveAttribute("data-theme", "airform-dark");
  await expect(page.locator(".variation-example")).toHaveCount(3);
});

test("standalone chart variations use a bounded preview width", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/?chart=treemap&theme=mono-editorial&mode=light");

  const gridWidth = await page.locator(".variation-grid").evaluate((element) => element.getBoundingClientRect().width);
  const chartWidth = await page.locator(".variation-example").evaluate((element) => element.getBoundingClientRect().width);

  expect(chartWidth).toBeLessThan(gridWidth * 0.85);
  expect(chartWidth).toBeLessThanOrEqual(960);

  await page.getByRole("tab", { name: "Pie", exact: true }).click();
  const multiChartWidth = await page.locator(".variation-example").first().evaluate((element) => element.getBoundingClientRect().width);

  expect(multiChartWidth).toBeLessThan(chartWidth);
});
