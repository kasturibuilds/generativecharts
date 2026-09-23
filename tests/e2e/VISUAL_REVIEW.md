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
