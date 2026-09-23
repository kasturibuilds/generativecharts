import { expect, test } from "@playwright/test";

const regions = ".catalog-hero h1, .install-pill, .gallery-toolbar, .variation-grid";

test("page content is available before the application JavaScript loads", async ({ page }) => {
  let releaseScripts!: () => void;
  const scriptsReady = new Promise<void>((resolve) => { releaseScripts = resolve; });
  await page.route(/\/_next\/.*\.js(?:\?.*)?$/, async (route) => {
    await scriptsReady;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "commit" });
    await expect(page.getByRole("heading", { name: "Charts for React." })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Bar", exact: true })).toBeVisible();
    await expect(page.locator(".ck-chart").first()).toBeVisible();
    await expect(page.getByText("Loading Generative Charts…", { exact: true })).toHaveCount(0);
  } finally {
    releaseScripts();
  }
  await expect(page.locator("html")).toHaveAttribute("data-site-theme", "dark");
});

test("page entrance settles once and chart selections animate independently", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".ck-chart.ck-animate")).toHaveCount(0);
  await expect.poll(() => page.locator(regions).evaluateAll((nodes) => nodes.every((node) => {
    const style = getComputedStyle(node);
    return style.opacity === "1" && style.transform === "none" && style.filter === "none";
  }))).toBe(true);
  await page.getByRole("button", { name: "Airform", exact: true }).click();
  await expect(page.locator(".ck-chart").first()).toHaveAttribute("data-theme", "airform-dark");
  await expect(page.locator(".ck-chart.ck-animate").first()).toBeVisible();
  expect(await page.locator(regions).evaluateAll((nodes) => nodes.some((node) => node.getAnimations().some((animation) => animation.playState === "running")))).toBe(false);
  await page.getByRole("tab", { name: "Line", exact: true }).click();
  await expect(page.locator(".ck-chart.ck-animate").first()).toHaveAttribute("data-family", "line");
});

test("reduced motion presents the page immediately without blur or movement", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const selector of regions.split(", ")) {
    await expect(page.locator(selector)).toHaveCSS("opacity", "1");
    await expect(page.locator(selector)).toHaveCSS("transform", "none");
    await expect(page.locator(selector)).toHaveCSS("filter", "none");
    await expect(page.locator(selector)).toHaveCSS("animation-name", "none");
  }
});

test("shared selections hydrate without replacing the page shell", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/?theme=airform&mode=light&chart=pie");
  await expect(page.getByRole("heading", { name: "Charts for React." })).toHaveCount(1);
  await expect(page.getByRole("tab", { name: "Pie", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".ck-chart").first()).toHaveAttribute("data-theme", "airform-light");
  await expect(page.locator("html")).toHaveAttribute("data-site-theme", "light");
  expect(errors).toEqual([]);
});
