import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { build } from "esbuild";

const html = await readFile("out/analytics/index.html", "utf8");
await rm("dist", { recursive: true, force: true });
await mkdir("dist/server", { recursive: true });
await cp("out", "dist/client", { recursive: true });
// Private entry documents only exist inside the Worker; ASSETS cannot bypass auth.
await rm("dist/client/analytics", { recursive: true, force: true });
await rm("dist/client/analytics.html", { force: true });
await rm("dist/client/analytics.txt", { force: true });
await build({ entryPoints: ["worker/index.ts"], outfile: "dist/server/index.js", bundle: true, format: "esm", platform: "browser", target: "es2022", define: { ANALYTICS_HTML: JSON.stringify(html) } });
await mkdir("dist/.openai", { recursive: true });
await cp(".openai/hosting.json", "dist/.openai/hosting.json");
