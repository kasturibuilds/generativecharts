import { expect, test } from "@playwright/test";

const families = ["bar", "line", "area", "scatter", "pie", "radar", "heatmap", "cohort", "terrain"];
const themes = ["mono-editorial", "neon-instruments", "airform"];
const modes = ["light", "dark"];

for (const family of families) {
  for (const theme of themes) {
    for (const mode of modes) {
      test(`${family} in ${theme} ${mode}`, async ({ page }) => {
        await page.goto(`/?chart=${family}&theme=${theme}&mode=${mode}`);
        const chart = page.locator(".variation-example .ck-chart").first();
        await expect(chart).toBeVisible();
        await page.waitForTimeout(100);
        await expect(chart).toHaveScreenshot(`${family}-${theme}-${mode}.png`, { animations: "disabled" });
      });
    }
  }
}

for (const theme of themes) {
  for (const mode of modes) {
    test(`extruded pie in ${theme} ${mode}`, async ({ page }) => {
      await page.goto(`/?chart=pie&theme=${theme}&mode=${mode}`);
      const chart = page.locator(".variation-example .ck-chart").nth(2);
      await expect(chart).toBeVisible();
      await expect(chart).toHaveScreenshot(`extruded-pie-${theme}-${mode}.png`, { animations: "disabled" });
    });
  }
}
