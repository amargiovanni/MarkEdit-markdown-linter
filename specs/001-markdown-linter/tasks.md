# Tasks: MarkEdit Markdown Linter & Formatter

**Input**: Design documents from `/specs/001-markdown-linter/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: TDD is MANDATORY per Constitution Principle I. Tests MUST be written FIRST and FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan (src/, tests/, package.json)
- [x] T002 Initialize TypeScript project with strict mode in tsconfig.json
- [x] T003 [P] Configure Vitest + jsdom in vitest.config.ts
- [x] T004 [P] Configure ESLint with TypeScript rules in eslint.config.js
- [x] T005 [P] Configure Prettier in .prettierrc
- [x] T006 [P] Configure Rollup bundler in rollup.config.js
- [x] T007 Install CodeMirror 6 dependencies (@codemirror/view, @codemirror/state, @codemirror/lint, @codemirror/language)
- [x] T008 Create test fixtures in tests/fixtures/valid.md and tests/fixtures/invalid.md

**Checkpoint**: Project builds and test runner works with empty test suite

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 **TEST FIRST**: Write tests for Diagnostic type validation in tests/unit/types.test.ts
- [x] T010 Implement core types (Severity, Diagnostic, Action, LintRule, RuleConfig) in src/linter/types.ts
- [x] T011 **TEST FIRST**: Write tests for debounce utility in tests/unit/debounce.test.ts
- [x] T012 [P] Implement debounce utility in src/utils/debounce.ts
- [x] T013 **TEST FIRST**: Write tests for position helpers in tests/unit/position.test.ts
- [x] T014 [P] Implement line/column position helpers in src/utils/position.ts
- [x] T015 **TEST FIRST**: Write tests for rule registry in tests/unit/rules-registry.test.ts
- [x] T016 Implement rule registry (getRule, getRulesByTag) in src/linter/rules/index.ts
- [x] T017 Create extension entry point scaffold in src/index.ts
- [x] T018 Create CodeMirror extension setup scaffold in src/extension.ts

**Checkpoint**: Foundation ready - core types tested, utilities working, user story implementation can begin

---

## Phase 3: User Story 1 - Real-time Markdown Validation (Priority: P1)

**Goal**: Users see validation markers in real-time as they type markdown

**Independent Test**: Open a file with known errors → markers appear in gutter within 500ms

### Tests for User Story 1

> **TDD REQUIRED: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T019 [P] [US1] Write tests for MD001 (heading-increment) in tests/unit/rules/md001.test.ts
- [x] T020 [P] [US1] Write tests for MD009 (no-trailing-spaces) in tests/unit/rules/md009.test.ts
- [x] T021 [P] [US1] Write tests for MD010 (no-hard-tabs) in tests/unit/rules/md010.test.ts
- [x] T022 [P] [US1] Write tests for MD018 (no-missing-space-atx) in tests/unit/rules/md018.test.ts
- [x] T023 [P] [US1] Write tests for linting engine in tests/unit/engine.test.ts
- [ ] T024 [US1] Write integration test for gutter markers in tests/integration/gutter.test.ts
- [ ] T025 [US1] Write integration test for tooltip display in tests/integration/tooltip.test.ts

### Implementation for User Story 1

- [x] T026 [P] [US1] Implement MD001 (heading-increment) rule in src/linter/rules/md001-heading-increment.ts
- [x] T027 [P] [US1] Implement MD009 (no-trailing-spaces) rule in src/linter/rules/md009-no-trailing-spaces.ts
- [x] T028 [P] [US1] Implement MD010 (no-hard-tabs) rule in src/linter/rules/md010-no-hard-tabs.ts
- [x] T029 [P] [US1] Implement MD018 (no-missing-space-atx) rule in src/linter/rules/md018-no-missing-space-atx.ts
- [x] T030 [US1] Implement linting engine (run rules, collect diagnostics) in src/linter/engine.ts
- [x] T031 [US1] Implement gutter marker decorations in src/ui/gutter.ts
- [x] T032 [US1] Implement hover tooltip component in src/ui/tooltip.ts
- [x] T033 [US1] Integrate linter with CodeMirror via ViewPlugin in src/extension.ts
- [x] T034 [US1] Add debounced document change listener in src/extension.ts

**Checkpoint**: US1 complete - typing in editor shows live validation markers with tooltips

---

## Phase 4: User Story 2 - Automatic Document Formatting (Priority: P1)

**Goal**: Users can format entire document with one command, fixing all auto-correctable issues

**Independent Test**: Document with multiple issues → Format command → All fixable issues resolved

### Tests for User Story 2

> **TDD REQUIRED: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T035 [P] [US2] Write tests for MD012 (no-multiple-blanks) in tests/unit/rules/md012.test.ts
- [x] T036 [P] [US2] Write tests for MD019 (no-multiple-space-atx) in tests/unit/rules/md019.test.ts
- [x] T037 [P] [US2] Write tests for formatter in tests/unit/formatter.test.ts
- [ ] T038 [US2] Write integration test for format command in tests/integration/format-command.test.ts

### Implementation for User Story 2

- [x] T039 [P] [US2] Implement MD012 (no-multiple-blanks) rule with fix in src/linter/rules/md012-no-multiple-blanks.ts
- [x] T040 [P] [US2] Implement MD019 (no-multiple-space-atx) rule with fix in src/linter/rules/md019-no-multiple-space-atx.ts
- [x] T041 [US2] Implement auto-fix collection in src/formatter/fixes.ts
- [x] T042 [US2] Implement formatDocument command in src/formatter/formatter.ts
- [x] T043 [US2] Register format command with CodeMirror keymap (Cmd+Shift+F) in src/extension.ts

**Checkpoint**: US2 complete - Cmd+Shift+F formats document, fixing trailing spaces, multiple blanks, etc.

---

## Phase 5: User Story 3 - Quick Fix for Single Issues (Priority: P2)

**Goal**: Users can fix individual issues via context menu without formatting entire document

**Independent Test**: Position cursor on error → Cmd+. → Select fix → Issue resolved, marker disappears

### Tests for User Story 3

> **TDD REQUIRED: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T044 [P] [US3] Write tests for quick fix menu in tests/unit/quickfix.test.ts
- [ ] T045 [US3] Write integration test for quick fix workflow in tests/integration/quickfix.test.ts

### Implementation for User Story 3

- [x] T046 [US3] Implement quick fix menu component in src/ui/quickfix.ts
- [x] T047 [US3] Implement showQuickFix command in src/ui/quickfix.ts
- [x] T048 [US3] Register quick fix command with keymap (Cmd+.) in src/extension.ts
- [x] T049 [US3] Add action buttons to diagnostics in src/linter/engine.ts

**Checkpoint**: US3 complete - Quick fix menu works for individual issues

---

## Phase 6: User Story 4 - Custom Rule Configuration (Priority: P2)

**Goal**: Users can customize rules via .markdownlintrc file

**Independent Test**: Create .markdownlintrc disabling MD013 → Open long-line file → No warnings shown

### Tests for User Story 4

> **TDD REQUIRED: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T050 [P] [US4] Write tests for config loader in tests/unit/config.test.ts
- [x] T051 [P] [US4] Write tests for config schema validation in tests/unit/config-schema.test.ts
- [ ] T052 [US4] Write integration test for config file loading in tests/integration/config.test.ts

### Implementation for User Story 4

- [x] T053 [P] [US4] Implement default rule configurations in src/config/defaults.ts
- [x] T054 [P] [US4] Implement config schema validation in src/config/schema.ts
- [x] T055 [US4] Implement config file loader (search order: cwd, home, defaults) in src/config/loader.ts
- [x] T056 [US4] Implement extends/preset inheritance in src/config/loader.ts
- [x] T057 [US4] Integrate config loading with linter engine in src/linter/engine.ts

**Checkpoint**: US4 complete - Configuration files are loaded and applied

---

## Phase 7: User Story 5 - Statistics Display (Priority: P3)

**Goal**: Users see error/warning counts in status bar, can click for details

**Independent Test**: Document with 5 errors, 3 warnings → Status bar shows "5 errors, 3 warnings"

### Tests for User Story 5

> **TDD REQUIRED: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T058 [P] [US5] Write tests for statistics calculation in tests/unit/statistics.test.ts
- [x] T059 [US5] Write tests for status bar component in tests/unit/statusbar.test.ts

### Implementation for User Story 5

- [x] T060 [P] [US5] Implement statistics calculation from diagnostics in src/linter/statistics.ts
- [x] T061 [US5] Implement status bar panel using CodeMirror Panel API in src/ui/statusbar.ts
- [x] T062 [US5] Implement click-to-expand details panel in src/ui/statusbar.ts
- [x] T063 [US5] Add status bar to extension bundle in src/extension.ts

**Checkpoint**: US5 complete - Status bar shows live statistics, click for details

---

## Phase 8: User Story 6 - AppleScript Integration (Priority: P3)

**Goal**: Power users can automate linting/formatting via AppleScript

**Independent Test**: Run AppleScript `run script "plugin:markdown-linter:format"` → Document formatted

### Tests for User Story 6

> **TDD REQUIRED: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T064 [US6] Write tests for AppleScript bridge in tests/unit/applescript.test.ts

### Implementation for User Story 6

- [x] T065 [US6] Implement AppleScript command bridge in src/applescript/bridge.ts
- [x] T066 [US6] Expose format command via AppleScript in src/applescript/bridge.ts
- [x] T067 [US6] Expose validate command (returns diagnostic count) via AppleScript in src/applescript/bridge.ts
- [x] T068 [US6] Register AppleScript handlers in src/index.ts

**Checkpoint**: US6 complete - AppleScript automation works

---

## Phase 9: Remaining Rules Implementation

**Purpose**: Complete the rule set with remaining MD rules

### Tests for Remaining Rules

- [x] T069 [P] Write tests for MD003 (heading-style) in tests/unit/rules/md003.test.ts
- [x] T070 [P] Write tests for MD004 (ul-style) in tests/unit/rules/md004.test.ts
- [x] T071 [P] Write tests for MD005 (list-indent) in tests/unit/rules/md005.test.ts
- [x] T072 [P] Write tests for MD007 (ul-indent) in tests/unit/rules/md007.test.ts
- [x] T073 [P] Write tests for MD013 (line-length) in tests/unit/rules/md013.test.ts
- [x] T074 [P] Write tests for MD014 (commands-show-output) in tests/unit/rules/md014.test.ts
- [x] T075 [P] Write tests for MD020 (no-missing-space-closed-atx) in tests/unit/rules/md020.test.ts
- [x] T076 [P] Write tests for MD021 (no-multiple-space-closed-atx) in tests/unit/rules/md021.test.ts
- [x] T077 [P] Write tests for MD022 (blanks-around-headings) in tests/unit/rules/md022.test.ts

### Implementation for Remaining Rules

- [x] T078 [P] Implement MD003 (heading-style) in src/linter/rules/md003-heading-style.ts
- [x] T079 [P] Implement MD004 (ul-style) in src/linter/rules/md004-ul-style.ts
- [x] T080 [P] Implement MD005 (list-indent) in src/linter/rules/md005-list-indent.ts
- [x] T081 [P] Implement MD007 (ul-indent) in src/linter/rules/md007-ul-indent.ts
- [x] T082 [P] Implement MD013 (line-length) in src/linter/rules/md013-line-length.ts
- [x] T083 [P] Implement MD014 (commands-show-output) in src/linter/rules/md014-commands-show-output.ts
- [x] T084 [P] Implement MD020 (no-missing-space-closed-atx) in src/linter/rules/md020-no-missing-space-closed-atx.ts
- [x] T085 [P] Implement MD021 (no-multiple-space-closed-atx) in src/linter/rules/md021-no-multiple-space-closed-atx.ts
- [x] T086 [P] Implement MD022 (blanks-around-headings) in src/linter/rules/md022-blanks-around-headings.ts

**Checkpoint**: All 15 rules implemented and tested

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T087 [P] Add JSDoc documentation to all public exports in src/index.ts
- [x] T088 [P] Update README.md with installation and usage instructions
- [ ] T089 **TEST FIRST**: Write tests for inline disable comments in tests/unit/inline-disable.test.ts
- [ ] T090 [P] Add inline disable comments support (<!-- markdownlint-disable -->) in src/linter/engine.ts
- [ ] T091 **TEST FIRST**: Write performance benchmark tests in tests/integration/performance.test.ts
- [ ] T092 Performance optimization: implement incremental linting for large documents in src/linter/engine.ts
- [ ] T093 [P] Add debug logging infrastructure in src/utils/logger.ts
- [ ] T094 Error boundary: wrap all handlers to prevent editor crashes in src/extension.ts
- [ ] T095 [P] Add edge case test fixtures (Unicode/emoji, empty doc, large doc) in tests/fixtures/
- [ ] T096 Run quickstart.md validation checklist
- [ ] T097 Final integration test: full extension in CodeMirror editor in tests/integration/extension.test.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 (P1) and US2 (P1) can proceed in parallel after Foundational
  - US3 depends on US1 (needs diagnostics with actions)
  - US4 can proceed independently after Foundational
  - US5 depends on US1 (needs diagnostics for statistics)
  - US6 can proceed independently after US2 (needs format command)
- **Remaining Rules (Phase 9)**: Can proceed after US1 complete (rule infrastructure in place)
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 2 (Foundational)
    │
    ├──────────────────────────────────┐
    │                                  │
    ▼                                  ▼
┌──────────┐                    ┌──────────┐
│ US1 (P1) │                    │ US4 (P2) │
│ Validate │                    │ Config   │
└────┬─────┘                    └──────────┘
     │
     ├─────────────┬─────────────┐
     │             │             │
     ▼             ▼             ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ US2 (P1) │ │ US3 (P2) │ │ US5 (P3) │
│ Format   │ │ QuickFix │ │ Stats    │
└────┬─────┘ └──────────┘ └──────────┘
     │
     ▼
┌──────────┐
│ US6 (P3) │
│ Apple    │
└──────────┘
```

### Parallel Opportunities

Within each phase, tasks marked [P] can run in parallel:

```bash
# Phase 1 Setup - All [P] tasks parallel:
T003, T004, T005, T006 can run simultaneously

# Phase 3 US1 Tests - All rule tests parallel:
T019, T020, T021, T022 can run simultaneously

# Phase 3 US1 Implementation - Rule implementations parallel:
T026, T027, T028, T029 can run simultaneously

# Phase 9 Remaining Rules - All tests and implementations parallel within their groups
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Real-time Validation)
4. **STOP and VALIDATE**: Test that markers appear in editor
5. Deploy/demo MVP - basic linting works

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test → Demo (MVP: live validation)
3. Add User Story 2 → Test → Demo (formatting works)
4. Add User Story 3 → Test → Demo (quick fixes work)
5. Add User Story 4 → Test → Demo (config files work)
6. Add User Story 5 → Test → Demo (statistics visible)
7. Add User Story 6 → Test → Demo (AppleScript works)
8. Add remaining rules → All 15 rules complete
9. Polish → Production ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- **TDD MANDATORY**: Write tests FIRST, verify they FAIL, then implement
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution Principle I requires 80%+ test coverage
