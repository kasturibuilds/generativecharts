import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([...nextVitals, ...nextTs, globalIgnores([".next/**", ".next-export/**", "out/**", "dist/**", "packages/chartkit/dist/**", ".automation-worktrees/**", "test-results/**", "playwright-report/**"])]);
