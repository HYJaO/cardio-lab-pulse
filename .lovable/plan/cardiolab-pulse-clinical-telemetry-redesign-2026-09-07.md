# CardioLab Pulse Clinical Telemetry Redesign

## Goal
Overhaul CardioLab Pulse into a high-end cardiovascular physiology and pathology laboratory while preserving every route, medical statement, formula, quiz question, mechanism, data model, and interactive behavior exactly as it exists.

## Design system
- **Direction:** Clinical Telemetry & Editorial Precision; dense, authoritative, instrument-like, and publication-grade rather than SaaS-like.
- **Palette:** obsidian base, deep graphite surfaces, restrained white hairlines, crimson for arterial/systolic signals, cyan for venous/oxygenation signals, amber for electrical activity, emerald for normal/correct states.
- **Typography:** Sora display hierarchy, Manrope clinical prose, JetBrains Mono for every value, unit, phase, time, pressure, volume, and status readout.
- **Craft:** 4–8px radii, low-opacity ECG graph paper, crisp borders, calibrated glow only on active traces, tactile controls, and reduced-motion-safe telemetry sweeps.
- **Layout:** asymmetric editorial homepage; high-density console layouts inside lessons; responsive stacking with no horizontal page overflow.

## Implementation

### 1. Global visual foundation
- Replace the current navy/gradient vocabulary in `src/styles.css` with the specified obsidian telemetry tokens and semantic aliases.
- Add reusable console, viewport, readout, chip, grid-paper, trace-glow, and instrument-control utilities.
- Normalize body typography, tabular numerics, focus states, range controls, scrollbars, selection, motion, and mobile overflow behavior.
- Keep all colors semantic and dark-mode native.

### 2. Navigation, hero, and homepage architecture
- Rebuild the sticky navigation as a compact frosted clinical command bar with a live pulse indicator and direct links to Cardiac Cycle, PV Loops, Heart Failure, and Atherosclerosis.
- Recompose the hero into an asymmetric editorial/monitor layout with the existing heart visualization, live sweep treatment, mission copy, CTAs, and existing factual content intact.
- Restyle topic cards as indexed clinical dossiers (`[MOD-01]`, etc.), preserve all topic copy/statuses, and add precise progress/availability telemetry.
- Refine the learning path, ECG preview, anatomy preview, CTA, sections, and footer to the same visual language without changing their text or purpose.

### 3. Shared lesson shell and assessments
- Upgrade `TopicPage` into a clinical lesson workspace with a stronger telemetry header, compact metadata, and clearer desktop/mobile section navigation.
- Restyle shared content blocks, taxonomy chips, active recall, and checkpoints as clinical evidence and assessment modules.
- Preserve disclosure behavior, answer correctness, explanations, focus order, announcements, and keyboard operation.

### 4. Simulation consoles
- Convert Cardiac Cycle, PV Loop, Starling, and Heart Failure instruments into consistent monitoring consoles.
- Add compact console headers and readout trays using only values already calculated by each lab.
- Increase graph contrast, use subtle glow on active traces/cursors, coordinate phase/state color, and refine legends without changing curves or formulas.
- Restyle playback, phase controls, sliders, presets, toggles, and reset actions as precision instruments while retaining all handlers and keyboard commands.

### 5. Diagnostic pathology workstations
- Reframe microscopic evidence and artery cross-section views as diagnostic inspection workstations with crosshair/grid overlays and clear pathology callouts.
- Present the existing normal-to-plaque comparison and stage linkage more clearly without replacing the licensed image, attribution, stage mapping, zoom, or mechanism behavior.
- Preserve all source/licence language and accessibility descriptions verbatim.

### 6. Verification
- Confirm all five existing routes render and every route link remains valid.
- Exercise playback, scrubbing, phase stepping, sliders, presets, toggles, quiz selection, recall reveal, histology expansion, detail view, and map-stage synchronization.
- Check desktop and mobile for clipping, horizontal overflow, unreadable graph labels, focus visibility, reduced motion, and text preservation.
- Compare route text before/after to ensure no educational content was deleted, summarized, or rewritten.

## Protected contracts
- No route additions, removals, or renames.
- No changes to medical models, constants, formulas, quiz data, explanatory prose, or educational sequencing.
- No removal of accessibility labels, attribution, citations, keyboard controls, or reduced-motion support.
- No backend or persistence work.
