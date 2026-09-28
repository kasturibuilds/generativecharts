# Generative Charts

Accessible React charts with eighteen chart families, three themes, and light and dark modes.

[Gallery](https://generativecharts.com) · [Documentation](https://generativecharts.com/docs) · [npm](https://www.npmjs.com/package/generative-charts) · [Sponsor](https://github.com/sponsors/kasturibuilds)

## Use the library

```bash
npm install generative-charts
```

Import `generative-charts/styles.css` once at your application root. See the [package README](packages/chartkit/README.md) for usage, components, and compatibility. The published package supports React 18 and React 19.

## Run locally

Use Node.js 22 and npm, matching CI.

```bash
git clone https://github.com/kasturikhanke/generativecharts.git
cd generativecharts
npm ci
npm run dev
```

Open `http://localhost:3000` for the gallery and `/docs` for documentation. No API keys or environment variables are required for local development.

The library lives in `packages/chartkit`; the Next.js gallery and documentation live in `app` and use the library's public workspace exports.

## Validate changes

```bash
npm run release:check
npm run build:site
npx playwright install chromium
CHARTKIT_TEST_STATIC=1 npm run test:e2e
```

Visual baselines are maintained on macOS. Read [CONTRIBUTING.md](CONTRIBUTING.md) for development guidance and [DESIGN.md](DESIGN.md) before visual changes. Complete its page and gallery review before refreshing screenshots.

See [RELEASING.md](RELEASING.md) for package releases and [RELEASE_READINESS.md](RELEASE_READINESS.md) for validation status.

## License

[MIT](LICENSE) © 2026 Kasturi Khanke.
