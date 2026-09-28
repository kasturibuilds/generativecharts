# Launch readiness

Launched 2026-09-28. `generative-charts@0.2.0` is published on npm, the GitHub repository is public, and the updated website is live at https://generativecharts.com.

## Validated

- `npm run release:check` passed: lint, application/library TypeScript, 44 unit tests, packed consumer compatibility, and package contents.
- `npm run build:site` passed.
- All 302 Playwright checks passed against the production static export, covering eighteen chart families, all three themes, light/dark modes, desktop/mobile, keyboard interaction, page loading, motion, and visual regression. No baselines were refreshed.
- React 18 and React 19 consumer checks passed, including SSR, strict NodeNext/Bundler TypeScript resolution, CSS exports, source maps, and preserved client directives. These checks were repeated for the 0.2.0 candidate after updating package metadata.
- `npm audit` reported zero vulnerabilities, including development dependencies.
- Anonymous requests to the homepage, documentation, robots.txt, sitemap.xml, and social image returned HTTP 200.
- Both GitHub CI runs passed for release candidate `46dbd2535283fcfc9f91a898ad403bdc9a4040f6`. PR #1 was merged as `850a6d6c967697957fd131461aecdbc97cddb16e` without changing the tested source tree.
- A scan of 117 reachable commits and 1,494 blobs found no common credential-pattern matches. This is a limited pattern scan, not a comprehensive security audit.

## Launch preparation

- MIT licensing, contribution instructions, package exports, issue tracker metadata, and public documentation are present.
- GitHub Sponsors is linked from the gallery navigation and mobile-accessible footer, repository/package READMEs, npm funding metadata, and `.github/FUNDING.yml`.
- The repository About section points to `https://generativecharts.com` and includes React, TypeScript, charts, SVG, accessibility, and data-visualization topics.
- Version 0.2.0 and its lockfile are prepared. The changelog documents missing-value and numeric-axis migration from 0.1.0.

## Publication verified

- [PR #1](https://github.com/kasturikhanke/generativecharts/pull/1) is merged, and anonymous GitHub repository access returns HTTP 200.
- npm `latest` is `0.2.0`. Its registry tarball SHA-1 is `d1173deec9c69617675e44a86745531c91d0e328`, matching the validated local package.
- A fresh registry installation passed stylesheet-export and BarChart/LineChart server-rendering checks.
- [GitHub release v0.2.0](https://github.com/kasturikhanke/generativecharts/releases/tag/v0.2.0) is published and anonymously accessible.
- Sites version 11 successfully deployed commit `850a6d6c967697957fd131461aecdbc97cddb16e`, including the Sponsors links. The public custom domain remains `https://generativecharts.com`.

The release was prepared in an isolated checkout. Concurrent, uncommitted chart-renderer edits in the original shared checkout were not included.

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
