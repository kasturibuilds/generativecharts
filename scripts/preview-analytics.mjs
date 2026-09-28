// Local-only Worker preview. It never runs in production or contacts the hosted database.
// Access is restricted to loopback; the dashboard previews an empty in-memory database.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import worker from "../dist/server/index.js";

const sqlite = new DatabaseSync(":memory:");
for (const file of readdirSync("drizzle").filter((name) => name.endsWith(".sql")).sort()) sqlite.exec(readFileSync(`drizzle/${file}`, "utf8"));
class Query {
  constructor(sql, values = []) { this.sql = sql; this.values = values; }
  bind(...values) { return new Query(this.sql, values); }
  async first() { return sqlite.prepare(this.sql).get(...this.values) ?? null; }
  async all() { return { results: sqlite.prepare(this.sql).all(...this.values), success: true }; }
}
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".txt": "text/plain", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2" };
const root = path.resolve("dist/client");
const env = {
  ANALYTICS_OWNER_EMAIL: "preview@localhost", DB: {
    prepare: (sql) => new Query(sql),
    async batch(queries) { sqlite.exec("BEGIN"); try { const result = queries.map((q) => sqlite.prepare(q.sql).run(...q.values)); sqlite.exec("COMMIT"); return result; } catch (error) { sqlite.exec("ROLLBACK"); throw error; } },
  },
  ASSETS: { async fetch(request) {
    const pathname = decodeURIComponent(new URL(request.url).pathname);
    const base = path.resolve(root, "." + pathname);
    if (!base.startsWith(root + path.sep) && base !== root) return new Response("Forbidden", { status: 403 });
    for (const file of [base, path.join(base, "index.html")]) {
      try { return new Response(await readFile(file), { headers: { "Content-Type": types[path.extname(file)] ?? "application/octet-stream" } }); } catch { /* Try directory index. */ }
    }
    return new Response("Not found", { status: 404 });
  } },
};
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1:3187");
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) if (typeof value === "string") headers.set(key, value);
    // Explicit local preview identity; external listeners are never enabled.
    headers.set("oai-authenticated-user-id", "local-preview");
    headers.set("oai-authenticated-user-email", "preview@localhost");
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const response = await worker.fetch(new Request(url, { method: req.method, headers, ...(body.length ? { body } : {}) }), env);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(500); res.end("Preview unavailable"); }
});
server.listen(3187, "127.0.0.1", () => console.log("Analytics preview: http://127.0.0.1:3187/analytics/ (local data only)"));
