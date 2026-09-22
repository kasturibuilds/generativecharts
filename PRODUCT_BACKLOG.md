# Generative Charts product backlog

Research notes are recorded here so future improvement runs can build on prior findings instead of rediscovering them. Priority reflects the current product direction.

## NOW

| Opportunity | Why it is useful | Status |
| --- | --- | --- |
| Cohort retention chart | Shows return behavior by entry cohort without requiring product teams to assemble a heatmap manually. | Completed |
| Explicit missing-data semantics and development diagnostics | Prevents missing or malformed measurements from silently becoming invented zeroes. | Implemented on `codex/now-foundations`; awaiting review |
| Temporal and numeric Cartesian scales | Preserves truthful spacing for irregular numeric and time observations. | Implemented on `codex/now-foundations`; awaiting review |
| Better comparison tooltips and roving keyboard focus | Makes multi-series and period-over-period decisions faster without scanning legends or tabbing every mark. | Implemented on `codex/now-foundations`; awaiting review |
| Container-aware responsive chart grammar | Reflows density, ticks, labels, and figure metadata from the measured chart container. | Implemented on `codex/now-foundations`; awaiting review |
| Dark theme overhaul | Raises contrast, material quality, focus visibility, and consistency across every family. | Implemented on `codex/now-foundations`; awaiting review |

## SOON

| Opportunity | Why it is useful | Status |
| --- | --- | --- |
| Waterfall chart | Explains positive and negative contributors to a changing total. | Existing; polish and API review needed |
| Fintech theme | Gives financial products a dense, precise default with semantic gain/loss treatment. | Research needed |
| Chart annotations | Adds goals, thresholds, events, and decision context directly to charts. | Planned |
| Forecast regions | Communicates projected values and uncertainty without a custom renderer. | Planned |

## LATER

| Opportunity | Why it is useful | Status |
| --- | --- | --- |
| Sankey | Explains weighted flow through journeys and systems. | Existing; defer further polish |
| Figma library | Helps designers compose with the same chart language before implementation. | Planned |
| shadcn registry | Makes Generative Charts installation and source ownership fit modern React workflows. | Planned |

## Completed research notes

- Signed grouped and stacked bars follow a shared zero baseline and accumulate positive and negative stacks independently.
- Retention values are modeled by entry cohort and elapsed period; recent incomplete periods remain distinct from zero retention.
- The five foundational NOW priorities are implemented together on `codex/now-foundations`, including public API documentation and focused regression coverage. Visual review and integration into `main` remain explicit review steps.
