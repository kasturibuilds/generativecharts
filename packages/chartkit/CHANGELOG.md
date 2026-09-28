# Changelog

## 0.2.0

Public launch release.

### Migration from 0.1.0

Missing measurements are no longer treated as zero by default. Use `missingValueStrategy="zero"` to preserve explicit zero imputation. Numeric x-values now infer a linear axis; use `xScale={{ type: "category" }}` when those numbers are category labels.

### Changes

- Added explicit missing-value strategies and structured development diagnostics; renderers no longer silently invent zero measurements by default.
- Added categorical, linear, and temporal Cartesian x-scales with explicit domains, deterministic UTC formatting, and responsive tick counts.
- Added shared multi-series comparison tooltips, nearest-x pointer/touch tracking, roving keyboard focus, and controlled active-index callbacks to line, area, and combo charts.
- Added measured compact, standard, and wide container layouts with denser responsive behavior for axes, labels, legends, and figure metadata.
- Reworked all dark theme modes for stronger contrast, focus visibility, tooltip clarity, and sequential color floors.
- Fixed equal-weight treemap partitioning, zero-value radial rendering, non-finite histogram bin counts, and empty comparison-pointer candidate handling.
- Kept comparison inspection targets at least 24px wide and prevented empty histogram bins from fabricating datum interactions.

## 0.1.0

- Initial private preview with eighteen chart families, including 3D terrain.
- Added three theme families, universal light/dark appearance, and typed customization.
- Added responsive SVG rendering, keyboard tooltips, legends, animation, and empty states.
- Added an extruded 3D pie variant with depth walls and outside share labels.
- Fixed grouped and stacked bar charts so negative values render from a shared zero baseline, with theme-aware negative styling.
- Added a responsive, accessible cohort retention chart with exact values, cohort sizes, and distinct incomplete periods.
- Reflowed chart geometry and labels for narrow containers; kept tooltips inside chart bounds.
- Added keyboard gallery navigation, storage-safe appearance restoration, and static Sites hosting.
