# Launch readiness

Checked 2026-09-17. The website is prepared for an owner-private ChatGPT Sites preview. Public distribution of the npm package remains a separate release step.

## Verified

- Static export includes gallery, documentation, social image, sitemap, robots, and favicon.
- Lint, application/package TypeScript checks, and 27 unit tests pass.
- The packed library installs and server-renders under React 18 and React 19.
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

- Publish `generative-charts@0.1.0` to npm from an authorized maintainer account, then verify installation from the registry. Documentation currently identifies the package as coming to npm.
- Choose public access for the Sites preview when ready to share beyond the owner.
- Replace the “Coming to npm” notice only after registry installation succeeds.

The custom domain is not configured; metadata uses the ChatGPT Sites address.
