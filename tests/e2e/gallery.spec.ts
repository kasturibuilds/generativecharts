import { expect, test } from "@playwright/test";

test("theme taps replay chart entrance motion and respect reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?chart=bar&theme=neon-instruments");
  const chart = page.locator(".variation-example .ck-chart").first();
  const airform = page.getByRole("button", { name: "Airform", exact: true });
  for (let tap = 0; tap < 2; tap++) {
    await chart.evaluate((node) => node.getAnimations({ subtree: true }).forEach((animation) => animation.finish()));
    await airform.click();
    await expect(chart).toHaveAttribute("data-theme", "airform-dark");
    expect(await chart.evaluate((node) => node.getAnimations({ subtree: true }).some((animation) => animation.playState === "running"))).toBe(true);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await airform.click();
  expect(await chart.evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(0);
});

for (const width of [390, 1280]) {
  test(`theme previews select charts by keyboard at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(13, 14, 16)");
    await expect(page.locator(".site-nav")).toHaveCSS("color", "rgb(244, 244, 245)");
    await expect(page.locator(".control-label")).toHaveCount(0);
    if (width > 620) {
      for (const selector of [".family-tabs", ".theme-picker"]) {
        const offset = await page.locator(selector).evaluate((row) => {
          const bounds = row.getBoundingClientRect();
          const items = [...row.children].map((item) => item.getBoundingClientRect());
          const left = Math.min(...items.map((item) => item.left));
          const right = Math.max(...items.map((item) => item.right));
          return Math.abs((left + right) / 2 - (bounds.left + bounds.right) / 2);
        });
        expect(offset).toBeLessThan(1);
      }
    }
    const picker = page.getByRole("group", { name: "Chart theme" });
    await expect(picker.getByRole("button")).toHaveCount(3);
    for (const [name, id] of [["Mono Editorial", "mono-editorial"], ["Neon Instruments", "neon-instruments"], ["Airform", "airform"]]) {
      const option = picker.getByRole("button", { name, exact: true });
      await option.focus();
      await option.press("Enter");
      await expect(option).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".variation-example .ck-chart").first()).toHaveAttribute("data-theme", `${id}-dark`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
    await page.screenshot({ path: testInfo.outputPath(`themes-initial-dark-${width}.png`), fullPage: true });
    await page.getByRole("button", { name: "Switch to light mode" }).click();
    await expect(picker.locator('[data-preview-theme$="-light"]')).toHaveCount(3);
    await page.screenshot({ path: testInfo.outputPath(`themes-toggled-light-${width}.png`), fullPage: true });
  });
}

test("catalog, themes, variations, code, and docs work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Charts for React." })).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(18);
  await page.getByRole("button", { name: "Neon Instruments", exact: true }).click();
  await expect(page).toHaveURL(/theme=neon-instruments/);
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page).toHaveURL(/mode=light/);
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

for (const width of [390, 1280]) {
  test(`chart browsing keeps preview columns and scroll position stable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const firstChart = page.locator(".variation-example").first();
    const initial = await firstChart.boundingBox();
    expect(initial).not.toBeNull();
    const names = await page.getByRole("tab").allTextContents();
    for (const theme of ["Mono Editorial", "Neon Instruments", "Airform"]) {
      await page.getByRole("button", { name: theme, exact: true }).click();
      for (const name of names) {
        await page.getByRole("tab", { name, exact: true }).click();
        const bounds = await firstChart.boundingBox();
        if (await page.locator(".variation-example").count() === 1) {
          const grid = await page.locator(".variation-grid").boundingBox();
          expect(bounds!.x + bounds!.width / 2).toBeCloseTo(grid!.x + grid!.width / 2, 0);
        } else {
          expect(bounds!.x).toBeCloseTo(initial!.x, 0);
        }
        expect(bounds!.width).toBeCloseTo(initial!.width, 0);
        // Dense radial labels may need extra height on narrow screens.
        expect(bounds!.height).toBeGreaterThanOrEqual(initial!.height);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
      await page.screenshot({ path: testInfo.outputPath(`stable-gallery-${theme}-${width}.png`), fullPage: true });
    }
    await page.getByRole("tab", { name: "Bar", exact: true }).click();
    await page.locator(".gallery-toolbar").evaluate(node => window.scrollTo(0, node.getBoundingClientRect().top + window.scrollY));
    const scrollY = await page.evaluate(() => window.scrollY);
    await page.getByRole("tab", { name: "Treemap", exact: true }).click();
    expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(scrollY, 0);
    expect((await firstChart.boundingBox())!.height).toBeCloseTo(initial!.height, 0);
  });
}
