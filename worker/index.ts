import { database, type Env } from "./database";
import { recordAnalytics } from "./ingestion";
import { report } from "./report";

// Inlined from the Next.js export by build-worker.mjs. Contains no private data.
declare const ANALYTICS_HTML: string;
const privateHeaders = { "Cache-Control": "private, no-store", "Vary": "Cookie", "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff" };
function privateResponse(response: Response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(privateHeaders)) headers.set(key, value);
  return new Response(response.body, { status: response.status, headers });
}
function authorize(request: Request, env: Env) {
  // Sites dispatch strips client-supplied identity and forwards verified SIWC headers.
  const id = request.headers.get("oai-authenticated-user-id");
  const email = request.headers.get("oai-authenticated-user-email");
  if (!id || !email) return 401;
  const owner = env.ANALYTICS_OWNER_EMAIL?.trim().toLowerCase();
  return owner && email.trim().toLowerCase() === owner ? 200 : 403;
}
const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (path === "/api/analytics/events") {
      if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
      // Exclude the signed-in owner without persisting identity in analytics.
      if (authorize(request, env) === 200) return new Response(null, { status: 204 });
      return privateResponse(await recordAnalytics(request, env.DB));
    }
    const isReport = path === "/api/analytics/report";
    const isDashboard = path === "/analytics" || path.startsWith("/analytics/") || path === "/analytics.txt" || path === "/analytics.html";
    if (isReport || isDashboard) {
      const access = authorize(request, env);
      if (access !== 200) {
        if (access === 401 && isDashboard) return privateResponse(new Response(null, { status: 302, headers: { Location: "/signin-with-chatgpt?return_to=%2Fanalytics%2F" } }));
        return privateResponse(Response.json({ error: access === 401 ? "Sign in to view analytics" : "This dashboard is private" }, { status: access }));
      }
      if (request.method !== "GET" && request.method !== "HEAD") return privateResponse(new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } }));
      if (isDashboard) return privateResponse(new Response(request.method === "HEAD" ? null : ANALYTICS_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } }));
      const days = Number(url.searchParams.get("days") ?? "30");
      if (days !== 7 && days !== 30) return privateResponse(Response.json({ error: "Choose 7 or 30 days" }, { status: 400 }));
      try {
        const data = await report(database(env), days);
        return privateResponse(request.method === "HEAD" ? new Response(null) : Response.json(data));
      } catch {
        console.error("Analytics report unavailable");
        return privateResponse(Response.json({ error: "Analytics is temporarily unavailable. Please retry." }, { status: 503 }));
      }
    }
    if (path.startsWith("/api/analytics/")) return privateResponse(new Response("Not found", { status: 404 }));
    return env.ASSETS.fetch(request);
  },
};

export default worker;
