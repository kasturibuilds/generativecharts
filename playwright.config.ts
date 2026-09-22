import { defineConfig } from "@playwright/test";
const port = process.env.CHARTKIT_TEST_PORT ?? "3100";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  // Allow a small rasterization variance along curved SVG edges.
  expect: { toHaveScreenshot: { maxDiffPixels: 100 } },
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 1280, height: 900 },
    contextOptions: { reducedMotion: "reduce" },
    trace: "retain-on-failure",
  },
  webServer: {
    command: process.env.CHARTKIT_TEST_STATIC === "1" ? `npm run start:site -- --port ${port}` : `npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
