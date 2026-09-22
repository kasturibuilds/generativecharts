# Launch readiness

Updated 2026-09-21. The npm package `generative-charts@0.1.0` is published. Fresh registry installation, chart server rendering, and CSS export resolution passed. Public Sites deployment is being prepared.

## Verified

- Static export includes gallery, documentation, social image, sitemap, robots, and favicon.
- Lint, application/package TypeScript checks, and 27 unit tests pass.
- The packed library installs and server-renders under React 18 and React 19.
- Release packaging also passes strict TypeScript consumer checks in NodeNext and Bundler modes, CSS export resolution, source-map target checks, and preserved client-component boundaries.
- 45 browser checks pass against the static export, covering all 18 chart families, three themes, two appearances, and mobile/desktop widths.
- Browser checks cover persisted appearance, explicit URL overrides, disabled storage, keyboard tabs, tooltip containment, copy code, navigation, and mobile documentation overflow.
- Visual regression checks cover 222 reviewed desktop/mobile snapshots, with a 100-pixel tolerance for curved-edge rasterization.
- Reviewed chart composition on desktop and mobile; plot wrappers stay transparent, figures own their boundary, and Mono Editorial bars remain outlines.
- Dependency audit reports zero vulnerabilities after compatible updates.

## Release checks

```sh
npm ci
npm run lint
npm run typecheck
npm run test:unit
npm run test:consumers
npm run build:site
CHARTKIT_TEST_STATIC=1 npm run test:e2e
npm run pack:package
npm audit
```

Visual baselines are maintained on macOS. CI runs structural/interaction checks on Linux and visual checks on macOS. Hosted CI has not been run from this local checkout.

## Before announcing general availability

- Completed: published `generative-charts@0.1.0` and verified installation from the public registry.
- Choose public access for the Sites preview when ready to share beyond the owner.
- Completed: updated the npm notice after registry installation succeeded.

The custom domain is not configured; metadata uses the ChatGPT Sites address.

## npm release handoff

`npm run release:check` passes and `npm run pack:release` produces the installable tarball. See [RELEASING.md](RELEASING.md) for publication and post-release verification. Published successfully as `kkasturi`; fresh public-registry installation, chart SSR, and CSS export checks passed.
