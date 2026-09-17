# Generative Charts Design Standard

**Status: required.** This is the design contract for the package, gallery, documentation, and examples. A change is not finished because it compiles or resembles a screenshot. It is finished when it follows this document and passes the review checklist.

This document is the visual contract for Generative Charts. It exists to keep the package simple to use without allowing its charts to become generic.

Generative Charts should not look like the same SVG recolored three times. Every chart must have sound information design, deliberate composition, and a recognizable material treatment in each theme. The data API stays small; polish belongs in the defaults.

## The short version

When making a design decision, use these rules first:

1. One semantic object gets one visual boundary.
2. A parent and its child must not both draw the same surface.
3. Layout wrappers provide spacing, not decoration.
4. The chart is the content. Interface chrome must recede.
5. Text must explain a choice, value, or action. Otherwise remove it.
6. Theme changes material, not information hierarchy.
7. Do not invent a new treatment when a canonical Generative Charts treatment already exists.

If a design needs several borders, backgrounds, radii, or shadows to feel organized, its hierarchy is not resolved yet.

## Non-negotiable composition rules

### One-container rule

A bordered or filled container establishes ownership of a visual region. Only one layer may own that region.

- A chart may have one outer figure boundary.
- If the chart owns the boundary, its gallery card, drawer preview, and comparison cell are unframed layout regions.
- If a host surface must own the boundary, the chart renders frameless inside it.
- Never place a bordered chart inside a bordered preview inside a bordered card.
- Never use an inset pseudo-element to repeat an existing figure border.
- Never add a rounded plot frame merely because the outer figure is rounded.
- Nested containers are allowed only when the inner object has a different semantic role, such as a code sample, tooltip, control group, or annotation. The distinction must remain clear with color removed.

The maximum normal depth from page to plot is:

```text
page
└── section or overlay surface
    └── chart figure
        └── plot geometry
```

`section or overlay surface` and `chart figure` must not both appear as decorative cards. One is structural; one may be visual.

### Surface ownership by context

Use these responsibilities consistently:

| Context | Owns | Must not add |
| --- | --- | --- |
| Page section | spacing, reading order, optional divider | card chrome around every child |
| Gallery card | click target, label, focus state | another border around an already framed chart |
| Drawer | the overlay surface and scroll behavior | a second panel around the main preview |
| Drawer preview | available size and placement | border, radius, background, shadow, inset frame |
| Chart figure | title, plot, optional legend/source, at most one boundary | a repeated inner figure boundary |
| Plot | axes, grid, marks, annotations | decorative card treatment |
| Mode comparison | mode label and layout | wrapper border when each chart already has one |

The current implementation selectors should follow the same contract:

- `.chart-drawer` may own the drawer surface.
- `.drawer-preview` is a layout wrapper and should be visually transparent.
- `.chart-card` may own the interaction but should not duplicate `.ck-chart` chrome.
- `.ck-chart` may own one figure boundary.
- `.ck-chart::before` must not create a second frame.
- `.ck-plot` should be unframed when `.ck-chart` is framed; use gridlines and whitespace to define the plotting area.

### The box test

Before adding a border, fill, radius, shadow, or backdrop blur, answer all five questions:

1. What semantic boundary does this communicate?
2. Does an ancestor already communicate that boundary?
3. Does a child already communicate that boundary?
4. Would spacing or a single rule create the hierarchy more clearly?
5. Does the design still work if every radius and shadow is removed?

If the answer to question 1 is vague, do not add the box. If question 2 or 3 is yes, remove one of the competing surfaces.

### Content restraint

Generative Charts should say less and show more.

- Prefer a clear noun or verb over product jargon.
- Do not add explanatory copy when the label and visual already communicate the idea.
- Keep headings short. Descriptions are optional, not structural filler.
- Repeated source lines, signatures, watermarks, and brand labels are noise. Show them once where provenance or export context requires them.
- Do not place a Generative Charts watermark on every gallery card.
- Controls use direct labels such as `Vertical`, `Grouped`, and `Dark`; supporting text is used only when it changes the choice.
- Empty metadata slots collapse. They never leave decorative bands behind.

### Interaction restraint

- Do not animate or elevate an entire card when the chart marks are already interactive.
- Hover, focus, and selection belong to the smallest actionable object.
- A chart card may show a focus outline for keyboard access, but it should not compete with datum hover states.
- Tooltips appear only when they add information not already printed beside the mark.
- Close buttons, tabs, and copy controls may have their own compact hit surfaces; these do not justify framing the content around them.

## Product promise

Generative Charts gives a React developer a chart they can ship before they have a visualization designer on the team.

A default chart must therefore be:

- immediately readable;
- visually complete without configuration;
- restrained enough to fit a product interface;
- distinctive enough that choosing a theme matters;
- accessible by pointer, keyboard, touch, and screen reader;
- deterministic during server rendering and hydration.

The package is not a chart-building DSL. Developers provide data, keys, series, and a few intentional choices. Generative Charts owns layout, scale padding, label placement, mark treatment, interaction, and responsive behavior.

## What was missing

The first Generative Charts package pass established the correct component families and interaction model, but reduced themes primarily to palette, corner radius, and shadow changes. The original `dataviz` work had more layers:

- chart titles and supporting information were composed as part of the figure;
- plots had deliberate spacing and stronger baseline geometry;
- lines used under-strokes, endpoint emphasis, gradients, and latest-value callouts;
- themes changed the material of marks and surfaces, not only their color;
- annotation and summary treatments helped explain the data;
- spacing was allocated by chart grammar rather than one shared margin object.

Those qualities should return without bringing back the studio, recommendation engine, or a large configuration surface.

## Design model

Every Generative Charts render has three layers.

### 1. Chart grammar

Grammar is invariant across themes. It includes scale choice, zero-baseline rules, tick density, label collision handling, series order, mark geometry, and the relative position of title, plot, legend, and source.

Theme changes must never move a zero line, change the meaning of a scale, reorder series, or reduce legibility.

### 2. Figure composition

A chart is a complete figure, not marks placed in an empty card. Its available anatomy is:

1. title;
2. description or subtitle;
3. optional summary or primary value;
4. legend when it is more useful than direct labels;
5. plot;
6. annotation or latest-value label when the chart has an obvious focus;
7. source or caption.

Only provided or safely derived information is shown. Empty slots collapse cleanly. The plot receives the remaining space; it should never be squeezed by decorative chrome.

### 3. Theme material

Material is how the same grammar feels in Mono Editorial, Neon Instruments, and Airform. It includes surface treatment, mark construction, outlines, highlights, glow, depth, type emphasis, and motion character.

## Universal layout rules

- Meaningful chart text is at least `12px`. Titles should normally be `18–26px` depending on figure size.
- Use no more than five labeled y ticks and six labeled x ticks by default.
- Prefer fewer, clearer ticks over dense scaffolding.
- Align tick labels exactly with their gridlines.
- A visible zero line and the origin of positive bars must be the same coordinate.
- Reserve separate vertical rows for title, description, summary, legend, plot, axis labels, and source.
- Use optical plot padding. Labels and marks must not touch the figure frame.
- Do not use reduced opacity as the only way to distinguish interactive state.
- Keep a minimum `24px` pointer hit target around small marks without visually enlarging them.
- Truncate only as a last resort. First reduce tick count, wrap category labels, or switch to a compact layout.
- Source and caption belong to the figure and stay visible when the chart is exported.

## Theme direction

### Mono Editorial

Mono Editorial is a binary black-and-white archival figure plate, not a grayscale dashboard.

- Pure black or white surfaces. Light and dark mode invert the same figure system.
- Hairline rules, precise baselines, and mostly unfilled marks.
- Bar marks use outlines, never solid interior fills. Multiple series are separated with stroke value, line style, or hard patterns—not color, gradients, or opacity.
- Filled marks are exceptional and must come from the canonical renderer for that chart family; they are not a default emphasis device.
- Mark outlines and small technical labels provide structure.
- Gradients, translucency, glow, blur, and shadows are forbidden.
- Gray is reserved for structural scaffolding and deliberate secondary stroke encoding; it is never an arbitrary categorical palette.
- Animation is quiet and mechanical.

Light and dark modes are exact ink inversions of the same system.

### Neon Instruments

Neon Instruments is a calm health dashboard, not a cyberpunk telemetry display.

- Use warm white or charcoal system surfaces with soft separators and no decorative coordinate-grid overlay.
- Activity pink is the lead signal; exercise green and stand cyan are the primary supporting channels. Orange, purple, and blue are reserved for additional series.
- Color communicates metrics and state. It does not tint titles, borders, shadows, or the whole figure.
- Marks are rounded, clean, and mostly flat. Subtle tonal fades may add depth, but white gloss and colored drop shadows are not default material.
- Glow is limited to active points, focus, and selected data. Static titles, bars, and lines remain crisp.
- Supporting text and gridlines stay quiet so the current value and trend read first.
- Motion resolves smoothly and directly without bounce or theatrical scan effects.

Light and dark modes use the same health-and-fitness hierarchy: neutral system surfaces, highly legible text, and a small set of saturated activity colors.

### Airform

Airform is an editorial sky poster made from inflated data objects, not a blue gradient card.

- Atmospheric sky depth is built from layered gradients, not a flat background.
- Marks have satin highlights, translucent edges, and soft cast shadows.
- White and pale-blue marks establish hierarchy; cobalt is the focused accent.
- Gridlines remain quiet and crisp beneath the dimensional marks.
- Gloss and depth may not obscure exact boundaries or contrast.
- Animation uses a slow, settled lift rather than springy motion.

Dark mode becomes a deep night-sky instrument while preserving the same inflated material.

## Theme token requirements

Themes need semantic tokens for all of the following, even when multiple tokens share a value:

- figure background and plot background;
- primary, muted, and subtle text;
- surface, raised surface, and muted surface;
- border, strong border, grid, and zero line;
- lead, supporting, positive, negative, and sequential marks;
- mark stroke, mark highlight, and mark shadow;
- line, line under-stroke, area start, and area end;
- point fill, point stroke, point halo, and active halo;
- tooltip surface, tooltip border, tooltip text, and focus ring;
- figure radius, mark radius, shadow, and font family;
- motion duration and easing.

The implementation should compile these tokens to component-scoped CSS variables. Custom themes may override a subset through `createTheme()`.

## Family standards

### Bar

- Vertical bars start at the visible baseline for non-negative data.
- Horizontal bars reserve enough label space before shrinking text.
- Group spacing is visibly larger than spacing between bars in a group.
- Stacked segments receive a thin separator when adjacent contrast is weak.
- Mono Editorial bars are always unfilled outlines in vertical, horizontal, grouped, and stacked layouts. Series use dark and muted strokes or dash patterns.
- Neon Instruments and Airform may use restrained theme-specific material variation, but never categorical rainbow coloring by default.
- Bar radius is theme-specific and cannot exceed half the mark thickness.
- Value labels appear when the plot is sparse enough to support them; otherwise values remain in the tooltip.
- Entry motion grows bars from the baseline.

### Line

- The y domain does not automatically start at zero unless zero is meaningful.
- The primary line uses a sharp `2.5–3px` stroke. Themes may add an under-stroke or halo underneath it.
- Endpoints receive more emphasis than intermediate points.
- Points are hidden by default for dense series and revealed on interaction.
- Multiple series prefer line-end labels when they fit; use the legend as fallback.
- An optional latest-value label is anchored near the final point and stays inside the frame.
- Entry motion draws the line along its path; it does not scale the path from its center.

### Area

- Area charts use a vertical fade or material gradient rather than a flat low-opacity fill.
- The boundary line remains legible above the fill.
- A single area starts at zero unless deviation is explicitly requested.
- Stacked areas preserve series order and prevent seams between layers.
- Entry motion reveals the area horizontally while the boundary resolves.

### Scatter

- Numeric domains receive proportional padding so edge points do not touch the frame.
- Size encoding uses area-based scaling, not raw radius scaling.
- Points have a visible edge against both the plot and overlapping points.
- Selected points receive a halo; unselected points remain readable rather than disappearing.
- Dense plots reduce point opacity and increase hit areas independently.
- Axis titles are shown when keys alone would be ambiguous.

### Pie and donut

- Use a consistent start angle and stable input order.
- Segment gaps and corner radii are subtle and theme-specific.
- Donuts show a primary value and a small contextual label in the center when supplied.
- Labels favor a compact legend; direct labels are used only when collision-free.
- Very small slices remain discoverable through keyboard focus and tooltip.
- Entry motion sweeps around the circumference.
- The optional extruded variant projects the pie as a shallow ellipse, adds only visible front depth walls, and labels the three largest shares outside the figure.

### Radar

- Rings, spokes, labels, and series polygons have separate contrast levels.
- The domain is shared across series and communicated consistently.
- Category labels sit outside the outer ring with optical alignment.
- Fills remain translucent enough to compare overlapping profiles.
- Vertices use small points with larger invisible hit targets.
- Entry motion expands from the center along each axis.

### Heatmap

- Cells strive for square proportions and use a consistent gap.
- A continuous scale legend communicates low and high values.
- Sequential color ramps preserve perceptual ordering in light and dark modes.
- Missing values use a distinct neutral treatment, never the low-value color.
- Cell values may appear when cells are large enough and text contrast can be guaranteed.
- Entry motion resolves in a short row or diagonal sequence.

### 3D terrain

- Use an oblique projected surface for three continuous dimensions: x, depth, and elevation.
- Preserve a readable wireframe so peaks, valleys, ridges, and falloff remain exact.
- Plot source observations as keyboard-focusable control points; interpolated surface points are decorative.
- Label the highest peak and lowest point without obscuring the surface.
- Density and smoothing change resolution, never the underlying values or axis meaning.
- Entry motion resolves the surface without rotating the camera.

## Tooltips and focus

The tooltip is attached to the datum, not fixed at the top of the chart.

- Position beside the active mark and flip at plot edges.
- Show category, series, formatted value, and optional comparison.
- Use a small marker that matches the active series.
- Mouse hover, keyboard focus, and touch activation expose the same information.
- Focus rings remain visible in every theme.
- On Cartesian charts, an optional guide line may connect the active datum to its axis.
- Interactive legends dim hidden or de-emphasized series while retaining accessible state.

## Responsive behavior

Responsive design means recomposing the figure, not scaling desktop SVG text until it becomes tiny.

- Maintain the `12px` semantic text floor.
- Reduce tick count as width decreases.
- Move legends below the plot when horizontal space is constrained.
- Prefer horizontal bars when categorical labels no longer fit a vertical layout; do not silently change the requested variant.
- Hide secondary annotations before hiding primary labels.
- Tooltips remain inside the viewport and work without hover.
- Charts support container resizing without unstable IDs or hydration changes.

## Motion

Motion explains how marks enter and change. Each chart family has its own reveal grammar.

- Default duration: `480–700ms` depending on theme.
- Stagger is subtle and capped so large datasets do not animate for several seconds.
- Updates interpolate from previous geometry when feasible.
- Hover and focus transitions complete within `120–180ms`.
- `animate={false}` removes entry and update motion.
- `prefers-reduced-motion` disables nonessential motion.

## API discipline

Polish must not create a large configuration object. The default public API remains data plus keys plus series:

```tsx
<LineChart
  data={revenue}
  xKey="month"
  series={[{ dataKey: "revenue", label: "Revenue" }]}
  theme="airform"
  appearance="light"
  title="Monthly revenue"
/>
```

Add props only for meaningful product choices. Good candidates include `showValues`, `showPoints`, `summary`, `annotation`, `domain`, and axis titles. Theme material, collision avoidance, tick selection, mark construction, and responsive composition remain internal responsibilities.

## Implementation order

1. Expand semantic theme tokens and rebuild the shared figure frame.
2. Replace the fixed tooltip with datum-anchored interaction and shared hit-target helpers.
3. Polish Bar and Line as reference implementations across all six theme/mode combinations.
4. Apply the same grammar/material separation to Area, Scatter, Pie, Radar, and Heatmap.
5. Add compact responsive layouts and family-specific motion.
6. Update the gallery datasets so each example demonstrates the intended visual behavior.
7. Refresh visual baselines only after every acceptance check passes.

## Acceptance checklist

A chart family is not finished until:

- every semantic object has one visual boundary and no repeated frame;
- layout wrappers are visually transparent unless they own a distinct interaction or status;
- the page-to-plot path passes the box test with no decorative container nesting;
- its default render looks complete without extra props;
- it is readable at desktop and narrow mobile widths;
- all meaningful text is at least `12px`;
- every mark works with keyboard focus and pointer interaction;
- tooltips remain attached to active data near plot edges;
- light and dark variants preserve the identity of all three themes;
- theme differences go beyond palette and container radius;
- animation matches the chart family and respects reduced motion;
- malformed, missing, and non-finite data produce stable output;
- SSR and hydration are deterministic;
- visual regression coverage includes representative sparse, dense, long-label, and multi-series data.

### Page and gallery review

Before merging any page-level change, inspect the full page and every opened drawer at desktop and mobile widths. Confirm:

- no box-in-a-box-in-a-box composition;
- no duplicate border from an element and its pseudo-element;
- no wrapper border around a chart that already owns a frame;
- no card-level hover effect competing with chart interaction;
- no repeated watermark, signature, source, or description;
- controls remain discoverable without overpowering the content;
- removing all shadows does not collapse the hierarchy;
- each theme still looks intentional without changing chart meaning.

Do not refresh screenshots until this audit passes. A visual baseline records a decision; it does not validate one.

## Non-goals

- Rebuilding the `dataviz` studio.
- Adding chart recommendation or automatic storytelling.
- Exposing every SVG attribute as a prop.
- Decorative effects that reduce accuracy or readability.
- Theme-specific chart grammar.
- Copying historical implementations unchanged when a smaller package-quality primitive can express the same idea.

## Source study

This standard distills the useful visual decisions from the earlier `dataviz` project, especially:

- `docs/design.md` for typography and baseline geometry;
- `docs/chart-guidelines.md` for chart grammar;
- `lib/data-studio/themes.ts` for material direction;
- `registry/revenue-line/revenue-line-chart.tsx` for figure composition, layered strokes, gradient area, summary, endpoint emphasis, and latest-value annotation.

Those files are references, not runtime dependencies. Generative Charts should express the same care through a smaller, reusable component system.

### Porting rule

The `dataviz` generator renderers are the canonical visual source. When an equivalent renderer already exists there, port its geometry and drawing primitives before simplifying its data contract. Do not recreate the appearance from screenshots or reduce the implementation to theme tokens.

For Mono Editorial radial charts, preserve the isometric projection, value-driven slice height, outer and inner walls, boundary step faces, deterministic paint order, dashed type encoding, label rails, collision handling, solid tonal faces, and technical typography from `MonoGeneratorRadialPreview`.
