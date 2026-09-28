# Launch readiness

Updated 2026-09-28. The public launch candidate is `generative-charts@0.2.0`. The npm registry currently serves `0.1.0`; preparation does not publish the candidate.

## Validated

- `npm run release:check` passed: lint, application/library TypeScript, 44 unit tests, packed consumer compatibility, and package contents.
- `npm run build:site` passed.
- All 302 Playwright checks passed against the production static export, covering eighteen chart families, all three themes, light/dark modes, desktop/mobile, keyboard interaction, page loading, motion, and visual regression. No baselines were refreshed.
- React 18 and React 19 consumer checks passed, including SSR, strict NodeNext/Bundler TypeScript resolution, CSS exports, source maps, and preserved client directives. These checks were repeated for the 0.2.0 candidate after updating package metadata.
- `npm audit` reported zero vulnerabilities, including development dependencies.
- Anonymous requests to the homepage, documentation, robots.txt, sitemap.xml, and social image returned HTTP 200.
- GitHub CI passed for the audited base commit `986454046ff8406bce3273d74c4795ae6eeeb6dd`. The launch commit must also pass hosted CI.
- A scan of 117 reachable commits and 1,494 blobs found no common credential-pattern matches. This is a limited pattern scan, not a comprehensive security audit.

## Launch preparation

- MIT licensing, contribution instructions, package exports, issue tracker metadata, and public documentation are present.
- GitHub Sponsors is linked from the gallery navigation and mobile-accessible footer, repository/package READMEs, npm funding metadata, and `.github/FUNDING.yml`.
- The repository About section points to `https://generativecharts.com` and includes React, TypeScript, charts, SVG, accessibility, and data-visualization topics.
- Version 0.2.0 and its lockfile are prepared. The changelog documents missing-value and numeric-axis migration from 0.1.0.

## Final publication gates

1. Confirm hosted CI for the launch commit.
2. Make `kasturikhanke/generativecharts` public and verify anonymous repository access. It was confirmed private during this audit; anonymous requests returned HTTP 404.
3. Publish the validated 0.2.0 package and verify the registry tarball in a fresh consumer. Version 0.1.0 cannot be overwritten.
4. Publish the matching GitHub release after registry verification.

The website is already public. Publish the launch website changes through its existing Sites project while preserving that audience. GitHub visibility and npm publication are separate operations.

## Reproduce validation

```sh
npm ci
npm run release:check
npm run build:site
npx playwright install chromium
CHARTKIT_TEST_STATIC=1 CHARTKIT_TEST_PORT=3101 npm run test:e2e
npm audit
```

Visual baselines are maintained on macOS. Follow the page and gallery review in [DESIGN.md](DESIGN.md) before updating them. See [RELEASING.md](RELEASING.md) for package publication.
