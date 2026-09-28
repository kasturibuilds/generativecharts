import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "node", execArgv: ["--experimental-sqlite"], include: ["tests/analytics/**/*.test.ts"], restoreMocks: true }, define: { ANALYTICS_HTML: JSON.stringify("<!doctype html><title>Private analytics</title>") } });
