# Visual baseline review

Reviewed on 2026-09-23 against application commit `a4535f9`.

The previous baselines came from `c579bfa`, before equal-height gallery rows,
compact chart spacing, updated dark styling, and centered choropleth geometry.
Those changes explain the widespread size and pixel differences in CI run
[35907172108](https://github.com/kasturikhanke/generativecharts/actions/runs/35907172108).

Before refreshing the baselines, the static production export passed all 48
gallery and readiness tests. The review covered all 18 chart families, three
themes, both modes, and widths of 390px and 1280px. Gallery contact sheets were
inspected for surface ownership, duplicate frames, theme identity, and outline
Mono Editorial bars. Full-page desktop and mobile layouts were also reviewed.
No drawer is present in the current gallery.

The visual suite retains its 100-pixel tolerance. It now waits for the selected
theme, loaded fonts, and responsive SVG width instead of a fixed 100ms delay.
Baseline updates must continue to follow the review requirements in `DESIGN.md`.

The first CI verification exposed OS-dependent monospace metrics: all 74 Mono
Editorial captures and four extruded-pie captions differed from the local Mac.
The gallery now uses its already bundled Geist Mono font for these elements.
This keeps application typography consistent across hosts while leaving the
published package's consumer font defaults unchanged. The updated typography
was reviewed again before refreshing the affected captures. The font review also exposed compact header padding
overriding the gallery copy-button clearance; the gallery rule now takes
precedence, and the readiness audit checks that titles do not overlap copy buttons.

## Page entrance review

The gallery now ships complete static markup rather than a loading fallback.
Desktop entrance frames and the settled mobile layout were reviewed: the header
stays still, the headline clears a subtle blur, controls rise slightly, and the
chart region fades without moving its cards. Reduced motion skips the reveal.
The 52 loading, gallery, and readiness checks pass across all chart families and
documentation layouts. Existing composition, outline bars, and theme treatments
are preserved. Four desktop Mono Editorial pie baselines were reviewed side by
side and refreshed for minor edge rasterization differences; the other 218
snapshots were unchanged. The visual tolerance remains unchanged.
