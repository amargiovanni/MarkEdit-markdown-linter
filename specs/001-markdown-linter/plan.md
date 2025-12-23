# Implementation Plan: MarkEdit Markdown Linter & Formatter

**Branch**: `001-markdown-linter` | **Date**: 2025-12-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-markdown-linter/spec.md`

## Summary

Plugin CodeMirror 6 per MarkEdit che fornisce validazione Markdown in tempo reale, formattazione automatica e quick fix. Implementa 15 regole markdownlint (MD001-MD022) con feedback visivo tramite gutter markers, status bar per statistiche, e configurazione via `.markdownlintrc`.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: CodeMirror 6 (@codemirror/view, @codemirror/state, @codemirror/language)
**Storage**: File system (configurazione .markdownlintrc), nessun database
**Testing**: Vitest + jsdom per unit/integration tests
**Target Platform**: macOS (MarkEdit WebView), CodeMirror 6 compatible browsers
**Project Type**: Single project (library/extension)
**Performance Goals**: <500ms validation, <50ms input latency, <2s format for 1000 lines
**Constraints**: Must not block main thread, incremental parsing for large files
**Scale/Scope**: Documents up to 10,000 lines, 15 linting rules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | Vitest configured, TDD workflow planned |
| II. Performance-First Design | PASS | Debounced validation, async for large docs |
| III. User Experience Excellence | PASS | Gutter markers, tooltips, quick fix, zero-config |
| IV. Modularity & Separation | PASS | Rules isolated, engine separate from UI |
| V. CodeMirror 6 Compatibility | PASS | Extension, StateField, Decoration API |
| VI. Documentation Requirements | PASS | JSDoc, rule docs, README planned |
| VII. Observability & Debugging | PASS | Debug logging, error boundaries |

**Gate Result**: PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-markdown-linter/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (TypeScript interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── index.ts                 # Main extension entry point
├── extension.ts             # CodeMirror extension setup
├── linter/
│   ├── engine.ts            # Core linting engine
│   ├── types.ts             # Diagnostic, Rule, Config types
│   └── rules/
│       ├── index.ts         # Rule registry
│       ├── md001-heading-increment.ts
│       ├── md003-heading-style.ts
│       ├── md004-ul-style.ts
│       ├── md005-list-indent.ts
│       ├── md007-ul-indent.ts
│       ├── md009-no-trailing-spaces.ts
│       ├── md010-no-hard-tabs.ts
│       ├── md012-no-multiple-blanks.ts
│       ├── md013-line-length.ts
│       ├── md014-commands-show-output.ts
│       ├── md018-no-missing-space-atx.ts
│       ├── md019-no-multiple-space-atx.ts
│       ├── md020-no-missing-space-closed-atx.ts
│       ├── md021-no-multiple-space-closed-atx.ts
│       └── md022-blanks-around-headings.ts
├── formatter/
│   ├── formatter.ts         # Format document command
│   └── fixes.ts             # Auto-fix implementations
├── config/
│   ├── loader.ts            # Configuration file loading
│   ├── defaults.ts          # Default rule settings
│   └── schema.ts            # Config validation
├── ui/
│   ├── gutter.ts            # Gutter marker decorations
│   ├── tooltip.ts           # Hover tooltips
│   ├── statusbar.ts         # Status bar panel
│   └── quickfix.ts          # Quick fix menu
├── applescript/
│   └── bridge.ts            # AppleScript command bridge
└── utils/
    ├── debounce.ts          # Debounce utility
    ├── logger.ts            # Debug logging infrastructure
    └── position.ts          # Line/column helpers

tests/
├── unit/
│   ├── rules/               # Individual rule tests
│   │   ├── md001.test.ts
│   │   └── ...
│   ├── engine.test.ts
│   ├── formatter.test.ts
│   ├── config.test.ts
│   ├── inline-disable.test.ts  # Inline comment disable tests
│   └── applescript.test.ts     # AppleScript bridge tests
├── integration/
│   ├── extension.test.ts    # Full extension integration
│   ├── editor.test.ts       # CodeMirror integration
│   └── performance.test.ts  # Performance benchmark tests
└── fixtures/
    ├── valid.md             # Valid markdown samples
    ├── invalid.md           # Invalid markdown samples
    ├── unicode-emoji.md     # Unicode/emoji edge cases
    ├── large-10k.md         # Large document (10k lines)
    └── configs/             # Test configurations
```

**Structure Decision**: Single project structure optimized for a CodeMirror 6 extension. The `src/linter/rules/` directory follows Constitution Principle IV (one file per rule). UI components are decoupled in `src/ui/`.

## Complexity Tracking

> No violations detected. Design aligns with all constitution principles.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |
