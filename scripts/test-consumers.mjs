import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const work = mkdtempSync(join(tmpdir(), "chartkit-consumers-"));
const packDir = join(work, "pack");
mkdirSync(packDir);
const env = { ...process.env, npm_config_cache: join(work, "npm-cache") };

const output = execFileSync("npm", ["pack", "--workspace", "@chartkit/internal", "--pack-destination", packDir, "--json"], { cwd: root, env, encoding: "utf8" });
const [{ filename }] = JSON.parse(output.slice(output.indexOf("[")));
const tarball = join(packDir, filename);

for (const version of ["18.3.1", "19.2.0"]) {
  const fixture = join(work, `react-${version.split(".")[0]}`);
  mkdirSync(fixture);
  writeFileSync(join(fixture, "package.json"), JSON.stringify({ private: true, type: "module", dependencies: { "@chartkit/internal": `file:${tarball}`, react: version, "react-dom": version } }, null, 2));
  writeFileSync(join(fixture, "consumer.mjs"), `import React from "react";\nimport { renderToString } from "react-dom/server";\nimport { BarChart } from "@chartkit/internal";\nconst html = renderToString(React.createElement(BarChart, { data: [{ label: "A", value: 4 }], categoryKey: "label", series: [{ dataKey: "value", label: "Value" }], animate: false }));\nif (!html.includes("ck-chart") || !html.includes("role=\\"img\\"")) process.exit(1);\n`);
  execFileSync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: fixture, env, stdio: "inherit" });
  execFileSync("node", ["consumer.mjs"], { cwd: fixture, env, stdio: "inherit" });
  console.log(`React ${version.split(".")[0]} consumer passed`);
}
