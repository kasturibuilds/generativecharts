import { expect, test } from "@playwright/test";

const families = ["bar", "line", "area", "scatter", "pie", "radar", "radial", "heatmap", "cohort", "funnel", "sankey", "treemap", "waterfall", "combo", "histogram", "boxplot", "choropleth", "terrain"];
const themes = ["mono-editorial", "neon-instruments", "airform"];

for (const width of [390, 1280]) {
  for (const family of families) {
    test(`${family} is readable and contained at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      for (const theme of themes) {
        for (const mode of ["light", "dark"]) {
          await page.goto(`/?chart=${family}&theme=${theme}&mode=${mode}`);
          await expect(page.locator(".ck-chart").first()).toHaveAttribute("data-theme", `${theme}-${mode}`);
          await expect.poll(() => page.locator(".ck-svg").first().evaluate((svg) => Math.abs((svg as SVGSVGElement).viewBox.baseVal.width - svg.getBoundingClientRect().width))).toBeLessThan(1);
          const issues = await page.locator(".ck-chart").evaluateAll((charts) => charts.flatMap((chart) => {
            const bounds = chart.getBoundingClientRect();
            return [...chart.querySelectorAll("svg text")].flatMap((text) => {
              const style = getComputedStyle(text);
              if (style.display === "none" || style.visibility === "hidden") return [];
              const box = text.getBoundingClientRect();
              const matrix = (text as SVGGraphicsElement).getScreenCTM();
              const size = parseFloat(style.fontSize) * Math.hypot(matrix?.a ?? 1, matrix?.b ?? 0);
              const label = text.textContent;
              return [
                ...(size < 11.9 ? [`small text: ${label} (${size.toFixed(1)}px)`] : []),
                ...(box.left < bounds.left - 1 || box.right > bounds.right + 1 ? [`clipped text: ${label}`] : []),
              ];
            });
          }));
          expect(issues, `${family}/${theme}/${mode}/${width}`).toEqual([]);
          expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
          await page.locator(".variation-grid").screenshot({ path: testInfo.outputPath(`${family}-${theme}-${mode}-${width}.png`), animations: "disabled" });
          await testInfo.attach(`${family}-${theme}-${mode}-${width}`, { path: testInfo.outputPath(`${family}-${theme}-${mode}-${width}.png`), contentType: "image/png" });
        }
      }
      expect(errors).toEqual([]);
    });
  }
}

test("saved dark mode hydrates and an explicit URL mode wins", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("chartkit-site-theme", "dark"));
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Switch to light mode" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-site-theme", "dark");
  await page.goto("/?mode=light");
  await expect(page.getByRole("button", { name: "Switch to dark mode" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-site-theme", "light");
  expect(errors).toEqual([]);
});

test("gallery works when persistent storage is unavailable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Blocked", "SecurityError"); } });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-site-theme", "dark");
  expect(errors).toEqual([]);
});

test("chart tabs support arrow keys and Home/End", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Bar", exact: true }).press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Line", exact: true })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toHaveAccessibleName("Line");
  await page.getByRole("tab", { name: "Line", exact: true }).press("End");
  await expect(page.getByRole("tab", { name: "3D terrain", exact: true })).toBeFocused();
  await page.getByRole("tab", { name: "3D terrain", exact: true }).press("Home");
  await expect(page.getByRole("tab", { name: "Bar", exact: true })).toBeFocused();
});

test("edge tooltips fit the chart and dismiss with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?chart=line&theme=airform&mode=dark");
  const chart = page.locator(".ck-chart").first();
  const target = chart.locator(".ck-comparison-target").last();
  await target.focus();
  await expect(chart.getByRole("status")).toBeVisible();
  const tip = await chart.getByRole("status").boundingBox();
  const frame = await chart.boundingBox();
  expect(tip!.x).toBeGreaterThanOrEqual(frame!.x);
  expect(tip!.x + tip!.width).toBeLessThanOrEqual(frame!.x + frame!.width);
  await target.press("Escape");
  await expect(chart.getByRole("status")).toHaveCount(0);
});

for (const width of [390, 1280]) {
  test(`documentation fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/docs/');
    await expect(page.getByRole('heading', {name: 'Install Generative Charts', exact: true})).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({path: test.info().outputPath('docs.png'), fullPage: true});
  });
}
