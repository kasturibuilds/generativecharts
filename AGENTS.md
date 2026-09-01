<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ChartKit design contract

Read `DESIGN.md` before changing any layout, surface, chart renderer, gallery card, drawer, documentation example, or visual test.

The composition rules are required, especially:

- one semantic object gets one visual boundary;
- layout wrappers provide spacing, not decoration;
- a parent and child must not both draw the same surface;
- Mono Editorial bars remain unfilled outlines;
- do not refresh visual baselines until the page and gallery review in `DESIGN.md` passes.
