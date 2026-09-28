# Private analytics

Open `/analytics/` and sign in with ChatGPT using the account configured in the
Sites runtime variable `ANALYTICS_OWNER_EMAIL`. Missing configuration fails closed.
The public gallery and docs do not require sign-in. The Worker checks verified
Sites identity on every dashboard and report request; it never trusts client
state. Private HTML is excluded from the public assets and all private responses
use `Cache-Control: private, no-store`.

## What is counted

- Page views on `/` and `/docs`, including client-side navigation.
- Estimated daily visitors using random browser IDs that rotate each UTC day.
  Period totals sum daily visitors, not distinct people across the entire period.
- Successful install-command and chart-code copies, GitHub/npm link clicks,
  explicit chart/theme selections, and light/dark changes. Copied text is never sent.
- Categorized referrers and sanitized `utm_source` / `utm_campaign` attribution.
- npm package downloads for the preceding 7 or 30 complete UTC days. These can
  include automated and repeat downloads and are not attributed conversions.

Do Not Track, Global Privacy Control, recognized bots, local previews, analytics
pages, and the signed-in owner are excluded. Raw IP addresses, emails, full URLs,
and copied code are not stored in the analytics database. Tracking is best effort:
blocked scripts, disabled storage, and ingestion limits can reduce counts.

Reports cover the last 7 or 30 days including today (UTC). Older aggregate and
visitor rows are removed in bounded batches as new traffic arrives; dormant data
may remain until traffic resumes. Visitor IDs stored in the browser are replaced
on the next visit after a day changes. Ingestion accepts only known events and
values, limits request bodies to 2 KiB, and caps accepted events at 600/minute and
50,000/day for the site. These limits bound abuse; they are not fraud detection.

## Hosting and development

The Next.js gallery remains statically rendered. The publishing build bundles
`worker/index.ts` into `dist/server/index.js`, copies public output into
`dist/client`, and embeds the private dashboard shell into the Worker. The
`.openai/hosting.json` manifest declares the logical `DB` binding. Sites provisions
D1 and applies the checked-in Drizzle migration before publishing.

- `npm run db:generate` generates schema migrations from `db/schema.ts`.
- `npm run test:analytics` tests ingestion and auth against in-memory SQLite;
  Node 22.13+ is recommended. CI uses Node 22.
- `npm run build:site` builds the gallery and hosting Worker.
- `node --experimental-sqlite scripts/preview-analytics.mjs` runs the built Worker
  at `http://127.0.0.1:3187/analytics/` with an empty in-memory database and an
  explicit local preview identity. It never accesses production data. The server
  binds only to loopback. Closing it discards local data.
- `CHARTKIT_TEST_PORT=3187 npm run test:e2e -- tests/e2e/analytics.spec.ts` checks the
  dashboard UI with test-only report fixtures. No fixture data is deployed.

No separate analytics subscription is required by this implementation; it uses the
existing Sites hosting and its D1 binding. Runtime settings are configured through
Sites, not committed into the repository. Keep database migrations append-only
after publication. The npm package itself contains no tracker.

`npm run build` now produces the complete hosting artifact by default. `npm start`
serves the public static export for gallery checks; use `npm run start:analytics`
for the local dashboard/backend preview. `npm run dev` remains the existing Next.js
gallery development workflow. All previews use local data, never the hosted DB.
