"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Brand } from "../components/brand";
import { AppearanceToggle } from "../components/appearance-toggle";
import type { AnalyticsReport, NamedCount } from "../lib/analytics-events";

const format = (value: number) => new Intl.NumberFormat("en-US").format(value);
const names: Record<string, string> = { install_copy: "Install copies", github_click: "GitHub clicks", npm_click: "npm clicks", code_copy: "Code copies", chart_select: "Chart selections", theme_select: "Theme selections", appearance_select: "Appearance changes", "mono-editorial": "Mono Editorial", "neon-instruments": "Neon Instruments", airform: "Airform", direct: "Direct", internal: "Internal", other: "Other" };
function label(name: string) { return names[name] ?? name; }
function Ranking({ title, rows, empty = "No activity yet." }: { title: string; rows: NamedCount[]; empty?: string }) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return <section className="analytics-section"><h2>{title}</h2>{rows.length ? <ol className="analytics-ranking">{rows.map((row) => <li key={row.name}><span>{label(row.name)}</span><span aria-hidden="true" className="analytics-meter"><i style={{ width: `${row.count / max * 100}%` }} /></span><strong>{format(row.count)}</strong></li>)}</ol> : <p className="analytics-muted">{empty}</p>}</section>;
}
export function AnalyticsDashboard() {
  const [days, setDays] = useState(30);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ data?: AnalyticsReport; error?: string; access?: number }>({});
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/analytics/report?days=${days}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) { setState({ error: response.status === 401 ? "Sign in to view your analytics." : response.status === 403 ? "This dashboard is only available to its owner." : "Could not load analytics. Please try again.", access: response.status }); return; }
        setState({ data: await response.json() as AnalyticsReport });
      }).catch((error: Error) => { if (error.name !== "AbortError") setState({ error: "Could not load analytics. Please try again." }); });
    return () => controller.abort();
  }, [days, revision]);
  const data = state.data;
  function refresh() { setState({}); setRevision((value) => value + 1); }
  return <main className="analytics-page">
    <nav className="site-nav shell"><Brand /><div className="nav-links"><Link href="/">Gallery</Link><Link href="/docs/">Docs</Link></div><div className="nav-actions"><AppearanceToggle /><a className="analytics-signout" href="/signout-with-chatgpt?return_to=%2F">Sign out</a></div></nav>
    <div className="analytics-content shell">
      <header className="analytics-heading"><div><p className="analytics-muted">Private · Generative Charts</p><h1>Analytics</h1></div><div className="analytics-controls"><label>Period <select value={days} onChange={(event) => { setState({}); setDays(Number(event.target.value)); }}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option></select></label><button onClick={refresh} type="button">Refresh</button></div></header>
      {!data && !state.error && <p role="status" className="analytics-notice">Loading analytics…</p>}
      {state.error && <div role="alert" className="analytics-notice"><p>{state.error}</p>{state.access === 401 ? <a href="/signin-with-chatgpt?return_to=%2Fanalytics%2F" target="_top">Sign in with ChatGPT</a> : state.access !== 403 && <button onClick={refresh} type="button">Try again</button>}</div>}
      {data && <>
        <dl className="analytics-summary">
          <div><dt>Page views</dt><dd>{format(data.daily.reduce((sum, row) => sum + row.views, 0))}</dd></div>
          <div><dt>Daily visitors, summed</dt><dd>{format(data.daily.reduce((sum, row) => sum + row.visitors, 0))}</dd></div>
          <div><dt>Install copies</dt><dd>{format(data.actions.find((row) => row.name === "install_copy")?.count ?? 0)}</dd></div>
          <div><dt>npm downloads</dt><dd>{data.downloads ? format(data.downloads.total) : "Unavailable"}</dd></div>
        </dl>
        <section className="analytics-section analytics-traffic"><div className="analytics-section-heading"><h2>Traffic by day</h2><span>UTC · today is partial</span></div>
          {data.daily.some((row) => row.views > 0) ? <div className="analytics-table-scroll"><table><caption className="analytics-sr-only">Page views and estimated daily visitors for each UTC day</caption><thead><tr><th scope="col">Date</th><th scope="col">Page views</th><th scope="col">Daily visitors</th><th scope="col" className="analytics-bar-heading">Trend</th></tr></thead><tbody>{[...data.daily].reverse().map((row) => <tr key={row.day}><th scope="row">{row.day}</th><td>{format(row.views)}</td><td>{format(row.visitors)}</td><td className="analytics-table-bar"><span aria-hidden="true" style={{ width: `${row.views / Math.max(...data.daily.map((day) => day.views), 1) * 100}%` }} /></td></tr>)}</tbody></table></div> : <p className="analytics-muted">No visits recorded yet. Traffic will appear after people visit the gallery or docs.</p>}
        </section>
        <div className="analytics-grid"><Ranking title="Top pages" rows={data.pages} /><Ranking title="Referrals" rows={data.referrers} /><Ranking title="Actions" rows={data.actions} /><Ranking title="Charts selected" rows={data.charts} /><Ranking title="Themes selected" rows={data.themes} /><Ranking title="Light / dark choices" rows={data.appearances} /><Ranking title="Campaigns" rows={data.campaigns} empty="Add utm_source and utm_campaign to shared links to compare campaigns." />
          <section className="analytics-section"><h2>npm distribution</h2>{data.downloads ? <><p className="analytics-download-total">{format(data.downloads.total)} <span>downloads</span></p><p className="analytics-muted">{data.downloads.start} – {data.downloads.end} · complete UTC days</p><p className="analytics-muted">Downloads include automated installs and repeat downloads. They are not unique users or website conversions.</p></> : <p className="analytics-muted">npm download data is temporarily unavailable. Website tracking is separate.</p>}<a href="https://www.npmjs.com/package/generative-charts" target="_blank" rel="noreferrer">View package ↗</a></section>
        </div>
        <footer className="analytics-notes"><p>Updated {new Date(data.updatedAt).toLocaleTimeString()}. Refresh to see new activity.</p><p>Reports cover the last 30 days. Visitor IDs rotate daily; the same person can count again on another day or device. Counts exclude recognized bots, privacy opt-outs, local previews, and the signed-in owner. Referrers are grouped; unrecognized sources appear as “Other”.</p><p>Chart and theme counts measure explicit selections, not default impressions. Tracking is best effort and may be blocked or limited. No raw IP addresses, email addresses, copied code, or full referrer URLs are stored.</p></footer>
      </>}
    </div>
  </main>;
}
