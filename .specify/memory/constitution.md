<!--
  SYNC IMPACT REPORT
  ==================
  Version change: 0.0.0 → 1.0.0

  Modified principles: N/A (initial creation)

  Added sections:
  - Core Principles (7 principles)
  - Technology Constraints
  - Development Workflow
  - Governance

  Removed sections: N/A

  Templates requiring updates:
  - .specify/templates/plan-template.md: OK (no changes needed)
  - .specify/templates/spec-template.md: OK (no changes needed)
  - .specify/templates/tasks-template.md: OK (no changes needed)

  Follow-up TODOs: None
-->

# MarkEdit Markdown Linter Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

TDD is mandatory for all feature development:

- Tests MUST be written before implementation code
- Tests MUST fail before implementation begins (red phase)
- Implementation MUST only satisfy failing tests (green phase)
- Refactoring MUST not change behavior (refactor phase)
- No pull request is accepted without corresponding tests
- Test coverage MUST be maintained above 80% for new code

**Rationale**: Early defect detection reduces rework cost by 10x. Tests serve as executable documentation.

### II. Performance-First Design

Performance is a feature, not an afterthought:

- Validation MUST complete within 500ms of user input (debounced)
- Format operations MUST complete within 2 seconds for 1000-line documents
- Input latency MUST remain below 50ms during active editing
- Large documents (10,000+ lines) MUST be handled via incremental/async processing
- Memory footprint MUST remain reasonable (no unbounded growth)

**Rationale**: A linter that slows down the editor defeats its purpose. Users abandon laggy tools.

### III. User Experience Excellence

The plugin MUST enhance, never impede, the writing experience:

- Visual feedback MUST be clear and non-intrusive (gutter markers, not inline noise)
- Error messages MUST be actionable (what's wrong + how to fix)
- Quick fixes MUST be available for all auto-correctable issues
- Configuration MUST work with sensible defaults (zero-config start)
- The plugin MUST gracefully degrade when encountering edge cases

**Rationale**: Writers use Markdown for simplicity. The linter should preserve that simplicity.

### IV. Modularity & Separation of Concerns

Code MUST be organized into focused, single-responsibility modules:

- Rules MUST be self-contained (one file per rule, independent testing)
- Core linting engine MUST be separate from CodeMirror integration
- Configuration loading MUST be separate from rule execution
- UI components (markers, tooltips, status bar) MUST be decoupled from logic

**Rationale**: Modularity enables parallel development, easier testing, and rule extensibility.

### V. CodeMirror 6 Compatibility

The plugin MUST follow CodeMirror 6 patterns and best practices:

- Use CodeMirror's Extension system for all integrations
- Use StateField/StateEffect for state management
- Use Decoration API for visual markers
- Use ViewPlugin for DOM interactions
- Avoid direct DOM manipulation outside ViewPlugin context
- Follow CodeMirror's transaction-based update model

**Rationale**: Fighting the framework leads to bugs and maintenance burden. Align with CM6 idioms.

### VI. Documentation Requirements

All public interfaces MUST be documented:

- Each rule MUST have: ID, description, rationale, examples (good/bad), configuration options
- Public functions MUST have JSDoc comments with @param and @returns
- README MUST include: installation, quick start, configuration reference
- Architecture decisions MUST be recorded in ADRs when non-obvious

**Rationale**: Undocumented code is unusable code. Users and contributors need clear guidance.

### VII. Observability & Debugging

The plugin MUST be debuggable in production:

- Errors MUST be caught and reported gracefully (never crash the editor)
- Console logging MUST be available in debug mode
- Configuration errors MUST produce clear diagnostic messages
- Performance metrics SHOULD be accessible for troubleshooting

**Rationale**: Users cannot debug what they cannot see. Support teams need diagnostic tools.

## Technology Constraints

- **Language**: TypeScript (strict mode enabled)
- **Target**: CodeMirror 6 extension (ES modules)
- **Build**: Rollup or esbuild for bundling
- **Testing**: Vitest or Jest with jsdom for DOM simulation
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with consistent config
- **Node**: Version 18+ for development tooling

## Development Workflow

### Branch Strategy

- Feature branches: `###-feature-name` (e.g., `001-markdown-linter`)
- All work happens on feature branches
- Main branch is protected; requires PR approval

### Code Review Requirements

- All PRs require at least one approval
- Tests MUST pass before merge
- Linting MUST pass before merge
- Constitution compliance MUST be verified

### Quality Gates

Before any PR can be merged:

1. All tests pass (unit, integration)
2. No linting errors
3. Test coverage threshold met (80%+)
4. Documentation updated if public API changed
5. Performance benchmarks not regressed

## Governance

- This constitution supersedes all other development practices for this project
- Amendments require: documented rationale, PR approval, version bump
- Version follows semver: MAJOR (breaking), MINOR (additions), PATCH (fixes)
- All contributors MUST read and acknowledge this constitution

**Version**: 1.0.0 | **Ratified**: 2025-12-23 | **Last Amended**: 2025-12-23
