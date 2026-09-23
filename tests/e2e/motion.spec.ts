import { expect, test } from "@playwright/test";

const families = {
  funnel: ".ck-funnel-step",
  sankey: ".ck-sankey-reveal",
  treemap: ".ck-treemap-cell",
  waterfall: ".ck-waterfall-bar",
  combo: ".ck-combo-line",
  histogram: ".ck-histogram-bar",
  boxplot: ".ck-box-reveal",
  choropleth: ".ck-map-region",
  terrain: ".ck-terrain-trace",
};

for (const theme of ["mono-editorial", "neon-instruments", "airform"]) {
for (const [family, selector] of Object.entries(families)) {
  test(`${family} ${theme} entry motion resolves and respects reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`/?chart=${family}&theme=${theme}&mode=light`);
    const chart = page.locator(".variation-example .ck-chart").first();
    const mark = chart.locator(selector).first();
    await expect(chart).toBeVisible();
    await expect(mark).toBeAttached();
    await expect.poll(() => mark.evaluate((node) => getComputedStyle(node).animationName)).not.toBe("none");
    // Seek the actual CSS animation, avoiding timing-dependent screenshots.
    const frames = await mark.evaluate((node) => {
      const element = node as SVGElement;
      element.style.animation = "none";
      void getComputedStyle(element).animationName;
      element.style.animation = "";
      const animation = element.getAnimations()[0];
      if (!animation) throw new Error("Missing entry animation");
      animation.pause();
      const timing = animation.effect!.getTiming();
      const duration = Number(timing.duration);
      animation.currentTime = Number(timing.delay);
      const start = { clip: getComputedStyle(node).clipPath, dash: getComputedStyle(node).strokeDashoffset };
      animation.currentTime = Number(timing.delay) + duration / 2;
      const middle = { clip: getComputedStyle(node).clipPath, dash: getComputedStyle(node).strokeDashoffset };
      animation.finish();
      return { start, middle };
    });
    expect(frames.middle).not.toEqual(frames.start);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const animated = await chart.locator(".ck-svg *").evaluateAll((nodes) => nodes.filter((node) => getComputedStyle(node).animationName !== "none").map((node) => node.getAttribute("class")));
    expect(animated).toEqual([]);
    await expect(mark).toHaveCSS("clip-path", "none");
    await expect(mark).toHaveCSS("stroke-dashoffset", "0px");
  });
}
}
