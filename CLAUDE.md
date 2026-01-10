# MarkEdit Markdown Linter - Development Guidelines

A CodeMirror 6 extension for real-time Markdown linting and formatting, designed for the MarkEdit macOS text editor.

## Quick Reference

```bash
# Development commands
npm test                # Run all tests
npm run lint            # Run ESLint
npm run typecheck       # TypeScript type checking
npm run build           # Build for production
npm run test:coverage   # Run tests with coverage (80% threshold)

# Combined check (recommended before commits)
npm test && npm run lint
```

## Project Structure

```
src/
├── index.ts                 # Public API - all exports
├── extension.ts             # CodeMirror 6 integration & plugin factory
├── applescript/
│   └── bridge.ts            # AppleScript command bridge for macOS automation
├── config/
│   ├── defaults.ts          # Default severities & rule options
│   ├── loader.ts            # Config file parsing & merging
│   └── schema.ts            # Configuration validation
├── formatter/
│   ├── fixes.ts             # Auto-fix collection utilities
│   └── formatter.ts         # Document formatting engine
├── linter/
│   ├── engine.ts            # Core linting orchestrator
│   ├── statistics.ts        # Diagnostic statistics calculation
│   ├── types.ts             # Core type definitions (Diagnostic, LintRule, etc.)
│   └── rules/
│       ├── index.ts         # Rule registry (register/get/query rules)
│       ├── utils.ts         # Shared rule utilities (isCodeFence, etc.)
│       └── md*.ts           # Individual rule implementations (MD001-MD022)
├── ui/
│   ├── gutter.ts            # Visual gutter markers
│   ├── quickfix.ts          # Quick fix menu (Cmd+.)
│   ├── statusbar.ts         # Status bar with error/warning counts
│   └── tooltip.ts           # Diagnostic hover tooltips
└── utils/
    ├── debounce.ts          # Debounce utility for rate-limiting
    └── position.ts          # Line/column position utilities

tests/
├── setup.ts                 # Vitest global setup
├── fixtures/                # Sample markdown files
│   ├── valid.md
│   └── invalid.md
└── unit/
    ├── rules/               # One test file per rule (md001.test.ts, etc.)
    └── *.test.ts            # Module tests (engine, formatter, config, etc.)
```

## Architecture Overview

### Core Flow

1. **Extension** (`extension.ts`) creates CodeMirror StateField + ViewPlugin
2. **ViewPlugin** debounces document changes (300ms default)
3. **LintingEngine** (`engine.ts`) runs all enabled rules against the document
4. **Rules** (`rules/*.ts`) return `Diagnostic[]` with positions and messages
5. **UI components** display diagnostics in gutter, tooltips, and status bar
6. **Formatter** iteratively applies fixes until document is clean

### Key Types (`src/linter/types.ts`)

```typescript
type Severity = "error" | "warning" | "info";
type RuleId = `MD${string}`;  // Pattern: MD followed by 3 digits

interface Diagnostic {
  from: number;           // Start offset
  to: number;             // End offset
  severity: Severity;
  message: string;
  source: RuleId;
  actions?: Action[];     // Optional fixes
}

interface LintRule {
  id: RuleId;
  name: string;
  description: string;
  tags: string[];
  severity: Severity;
  check(doc: Text, config: RuleConfig): Diagnostic[];
  fix?(doc: Text, diagnostic: Diagnostic, config: RuleConfig): ChangeSpec | null;
}
```

## TypeScript Configuration

The project uses strict TypeScript with ALL checks enabled:

- `strict: true` with all strict flags individually enabled
- `noUnusedLocals` / `noUnusedParameters` - use `_` prefix for intentionally unused
- `noUncheckedIndexedAccess` - array/object access may be undefined
- `exactOptionalPropertyTypes` - optional props cannot be `undefined` explicitly
- `noPropertyAccessFromIndexSignature` - use bracket notation for index signatures

## Code Conventions

### Rule Implementation Pattern

```typescript
// src/linter/rules/md001-heading-increment.ts

import type { Text } from "@codemirror/state";
import type { LintRule, RuleConfig, Diagnostic } from "../types";
import { createDiagnostic } from "../types";
import { isCodeFence } from "./utils";

// Pre-compile regex patterns at module level for performance
const ATX_HEADING_PATTERN = /^(#{1,6})(?:\s|$)/;

export const md001: LintRule = {
  id: "MD001",
  name: "heading-increment",
  description: "Heading levels should only increment by one level at a time",
  tags: ["headings"],
  severity: "error",

  check(doc: Text, _config: RuleConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    // Track code block state to skip fenced code
    let inCodeBlock = false;

    for (let i = 1; i <= doc.lines; i++) {
      const lineInfo = doc.line(i);
      const line = lineInfo.text;

      if (isCodeFence(line)) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      if (!inCodeBlock) {
        // Check rule logic...
        diagnostics.push(createDiagnostic({
          from: lineInfo.from,
          to: lineInfo.to,
          severity: "error",
          message: "Description of the issue",
          source: "MD001",
        }));
      }
    }

    return diagnostics;
  },

  // Optional fix function
  fix(doc: Text, diagnostic: Diagnostic, _config: RuleConfig): ChangeSpec | null {
    return { from: diagnostic.from, to: diagnostic.to, insert: "fixed text" };
  },
};
```

### Test Pattern

```typescript
// tests/unit/rules/md001.test.ts

import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { md001 } from "../../../src/linter/rules/md001-heading-increment";
import { createRuleConfig } from "../../../src/linter/types";

describe("MD001: heading-increment", () => {
  const config = createRuleConfig({ enabled: true });

  it("should detect skipped heading levels", () => {
    const doc = Text.of(["# Heading 1", "### Heading 3"]);
    const diagnostics = md001.check(doc, config);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].source).toBe("MD001");
  });

  it("should pass for valid heading sequence", () => {
    const doc = Text.of(["# Heading 1", "## Heading 2"]);
    const diagnostics = md001.check(doc, config);

    expect(diagnostics).toHaveLength(0);
  });
});
```

### Unused Parameters

Use `_` prefix for intentionally unused parameters (ESLint configured):

```typescript
check(doc: Text, _config: RuleConfig): Diagnostic[] {
  // config is not used but required by interface
}
```

## Adding New Rules

1. Create rule file: `src/linter/rules/mdXXX-rule-name.ts`
2. Export rule object implementing `LintRule` interface
3. Register in `src/linter/rules/index.ts`:
   ```typescript
   import { mdXXX } from "./mdXXX-rule-name";
   registerRule(mdXXX);
   ```
4. Add default config in `src/config/defaults.ts`
5. Create test file: `tests/unit/rules/mdXXX.test.ts`

## Configuration System

### File Format (.markdownlintrc)

```json
{
  "extends": "recommended",
  "default": true,
  "rules": {
    "MD013": { "line_length": 120 },
    "MD010": false,
    "MD009": { "br_spaces": 2 }
  }
}
```

### Programmatic Configuration

```typescript
import { createDefaultConfiguration, parseConfig } from "markedit-linter";

// All rules with default settings
const config = createDefaultConfiguration();

// Custom configuration
const custom = parseConfig({
  rules: {
    MD013: { line_length: 100 },
    MD010: false,  // Disable rule
  }
});
```

## Performance Considerations

- **Pre-compile regex** at module level, not inside check functions
- **Cache sorted rules** in registry (invalidated on registration)
- **Debounce linting** - default 300ms to prevent jank during rapid edits
- **Skip code blocks** - track `inCodeBlock` state to avoid checking fenced code
- **Iterative formatting** - Formatter handles overlapping fixes via CodeMirror ChangeSet

## Peer Dependencies

These must be provided by the host application:

```json
{
  "@codemirror/language": "^6.0.0",
  "@codemirror/lint": "^6.0.0",
  "@codemirror/state": "^6.0.0",
  "@codemirror/view": "^6.0.0"
}
```

## Public API Exports

### Core Extension

```typescript
import { markdownLinter, getDiagnostics, formatDocument } from "markedit-linter";
```

### Engine & Formatter

```typescript
import { LintingEngine, Formatter, createDefaultConfiguration } from "markedit-linter";
```

### Rules

```typescript
import { registerRule, getRule, getAllRules, getRulesByTag } from "markedit-linter";
```

### UI Components

```typescript
import { lintGutter, lintTooltip, lintStatusBar, showQuickFixMenu } from "markedit-linter";
```

### Types

```typescript
import type { Diagnostic, LintRule, Configuration, Statistics } from "markedit-linter";
```

## Implemented Rules

| ID    | Name                        | Category   | Default  |
|-------|-----------------------------|------------|----------|
| MD001 | heading-increment           | headings   | error    |
| MD003 | heading-style               | headings   | warning  |
| MD004 | ul-style                    | lists      | warning  |
| MD005 | list-indent                 | lists      | error    |
| MD007 | ul-indent                   | lists      | warning  |
| MD009 | no-trailing-spaces          | whitespace | error    |
| MD010 | no-hard-tabs                | whitespace | error    |
| MD012 | no-multiple-blanks          | whitespace | warning  |
| MD013 | line-length                 | whitespace | info     |
| MD014 | commands-show-output        | code       | info     |
| MD018 | no-missing-space-atx        | headings   | error    |
| MD019 | no-multiple-space-atx       | headings   | warning  |
| MD020 | no-missing-space-closed-atx | headings   | error    |
| MD021 | no-multiple-space-closed-atx| headings   | warning  |
| MD022 | blanks-around-headings      | headings   | warning  |

## Common Pitfalls

1. **Don't forget code block tracking** - Rules must skip content inside fenced code blocks
2. **Use `createDiagnostic()`** - Factory function validates and sets defaults
3. **Line numbers are 1-indexed** in CodeMirror's `doc.line(i)`
4. **Positions are character offsets** - Use `lineInfo.from` and `lineInfo.to`
5. **Test both ATX and Setext headings** for heading-related rules
6. **Coverage threshold is 80%** per file - tests must meet this minimum

## Keyboard Shortcuts

| Action          | Shortcut       |
|-----------------|----------------|
| Quick Fix       | Cmd + .        |
| Format Document | Cmd + Shift + F|

## Related Documentation

- [README.md](./README.md) - User-facing documentation
- [specs/001-markdown-linter/](./specs/001-markdown-linter/) - Feature specifications
- [markdownlint rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md) - Rule reference
