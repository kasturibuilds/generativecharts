import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const work = mkdtempSync(join(tmpdir(), "chartkit-consumers-"));
const packDir = join(work, "pack");
mkdirSync(packDir);
const env = { ...process.env, npm_config_cache: join(work, "npm-cache") };

const output = execFileSync("npm", ["pack", "--workspace", "generative-charts", "--pack-destination", packDir, "--json"], { cwd: root, env, encoding: "utf8" });
const [{ filename, files }] = JSON.parse(output.slice(output.indexOf("[")));
const tarball = join(packDir, filename);
const paths = files.map(({ path }) => path);
for (const required of ["dist/index.js", "dist/index.d.ts", "dist/styles.css", "dist/styles.css.d.ts", "LICENSE", "README.md", "CHANGELOG.md"]) {
  assert(paths.includes(required), `Missing package file: ${required}`);
}
assert(paths.every((path) => /^(dist\/|src\/|package\.json$|README\.md$|LICENSE$|CHANGELOG\.md$)/.test(path)), "Unexpected file in package");
assert(!paths.some((path) => /(?:^|\/)\.(?:env|npmrc|git)/.test(path)), "Private configuration in package");

for (const version of ["18.3.1", "19.2.0"]) {
  const fixture = join(work, `react-${version.split(".")[0]}`);
  mkdirSync(fixture);
  const major = version.split(".")[0];
  writeFileSync(join(fixture, "package.json"), JSON.stringify({ private: true, type: "module", dependencies: { "generative-charts": `file:${tarball}`, react: version, "react-dom": version }, devDependencies: { typescript: "^5.9.0", "@types/react": `^${major}`, "@types/react-dom": `^${major}` } }, null, 2));
  writeFileSync(join(fixture, "consumer.mjs"), `import React from "react";\nimport { renderToString } from "react-dom/server";\nimport { BarChart } from "generative-charts";\nconst html = renderToString(React.createElement(BarChart, { data: [{ label: "A", value: 4 }], categoryKey: "label", series: [{ dataKey: "value", label: "Value" }], animate: false }));\nif (!html.includes("ck-chart") || !html.includes("role=\\"img\\"")) process.exit(1);\n`);
  execFileSync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: fixture, env, stdio: "inherit" });
  const installed = join(fixture, "node_modules/generative-charts");
  for (const file of files.filter(({ path }) => path.endsWith(".map"))) {
    const mapPath = join(installed, file.path);
    const map = JSON.parse(readFileSync(mapPath, "utf8"));
    for (const source of map.sources) assert(existsSync(resolve(mapPath, "..", source)), `Missing mapped source: ${source}`);
  }
  for (const file of ["charts.js", "advanced-charts.js", "responsive.js", "tooltip.js"]) {
    assert(readFileSync(join(installed, "dist", file), "utf8").startsWith('"use client";'), `Lost client boundary: ${file}`);
  }
  writeFileSync(join(fixture, "consumer.tsx"), `import { BarChart, LineChart, RadialChart, createTheme, type Series } from "generative-charts";
import "generative-charts/styles.css";
const data = [{ month: "Jan", revenue: 42 }];
const series: Series<(typeof data)[number]>[] = [{ dataKey: "revenue", label: "Revenue" }];
const theme = createTheme("airform", { id: "brand", name: "Brand", light: { palette: ["#123456"] } });
export const charts = <><BarChart data={data} categoryKey="month" series={series} theme={theme} /><LineChart data={data} xKey="month" series={series} /><RadialChart data={data} nameKey="month" valueKey="revenue" /></>;
// @ts-expect-error Series keys must exist in the row type.
const invalid: Series<(typeof data)[number]> = { dataKey: "missing", label: "Missing" };
void invalid;
`);
  for (const moduleResolution of ["NodeNext", "Bundler"]) {
    execFileSync(join(fixture, "node_modules/.bin/tsc"), ["--noEmit", "--strict", "--noUncheckedSideEffectImports", "--jsx", "react-jsx", "--target", "ES2022", "--module", moduleResolution === "NodeNext" ? "NodeNext" : "ESNext", "--moduleResolution", moduleResolution, "consumer.tsx"], { cwd: fixture, env, stdio: "inherit" });
  }
  execFileSync("node", ["consumer.mjs"], { cwd: fixture, env, stdio: "inherit" });
  console.log(`React ${major}: SSR, strict TypeScript (NodeNext/Bundler), CSS export, source maps, and client boundaries passed`);
}
