# Contributing to ChartKit

ChartKit is an npm workspace: the package lives in `packages/chartkit` and the Next.js gallery and documentation live in `app`.

Read [DESIGN.md](./DESIGN.md) before making visual or interaction changes. It is the acceptance contract for both the chart package and the product site.

## Setup

```bash
npm install
npm run dev
```

## Validation

Before opening a pull request, run:

```bash
npm test
npm run lint
npm run pack:package
```

Visual changes must remain readable in all three themes in light and dark mode and preserve keyboard, server-rendering, and reduced-motion behavior.

Before updating visual snapshots, complete the page and gallery review in `DESIGN.md`. In particular, verify that each semantic object has one visual boundary and that no layout wrapper adds a redundant border, background, radius, or shadow around a framed child.
