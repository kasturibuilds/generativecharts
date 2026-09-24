# Launch readiness

Updated 2026-09-24. The npm registry confirms `generative-charts@0.1.0` is published. This review covers the local working tree; hosted CI must pass for the commit being made public.

## Repository cleanup

- A root MIT license now covers the repository, matching the library license.
- The README links to the gallery, documentation, npm package, contribution guide, and release instructions.
- Package metadata includes the source repository, homepage, and issue tracker.
- Development instructions use Node.js 22 and `npm ci`, matching CI.
- CI includes the existing motion tests alongside gallery, readiness, and page-loading tests; visual tests run separately on macOS.
- A credential-pattern scan of 110 locally available commits and 1,226 unique blobs found no matches or sensitive credential filenames. This is a limited pattern scan, not a comprehensive security audit.

## Local validation

- `npm run release:check` passed: lint, package build, application/library TypeScript checks, all 44 unit tests, consumer compatibility, and package contents.
- Packed-library consumer checks passed with React 18 and React 19, strict NodeNext/Bundler TypeScript resolution, CSS exports, source maps, and client component boundaries.
- `npm run build:site` passed and exported the gallery, documentation, social metadata routes, and icons.
- `npm audit` reported zero vulnerabilities.
- All 302 Playwright checks passed against the static export, including gallery, readiness, page loading, motion, and visual regression coverage. No baselines were refreshed by this cleanup.

## Reproduce validation

```sh
npm ci
npm run release:check
npm run build:site
npx playwright install chromium
CHARTKIT_TEST_STATIC=1 npm run test:e2e
npm audit
```

Visual baselines are maintained on macOS. Follow the page and gallery review in [DESIGN.md](DESIGN.md) before updating them. Screenshot tests compare against recorded decisions; passing them does not replace design review.

## Before making the repository public

- Review and commit the pending chart fixes, tests, visual baselines, and repository cleanup, then verify hosted CI for that commit.
- Confirm the intended GitHub visibility and repository settings in GitHub. This local review did not verify authenticated settings or hosted CI results.
- Verify anonymous access to the gallery and documentation. The configured domain is `https://generativecharts.com`; requests from this review environment returned HTTP 403, so public access was not verified.

The published npm version remains `0.1.0`. The working tree includes unreleased changes; choose a new version before the next npm publication. See [RELEASING.md](RELEASING.md).
