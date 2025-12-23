# Data Model: MarkEdit Markdown Linter

**Feature**: 001-markdown-linter
**Date**: 2025-12-23

## Core Entities

### Diagnostic

Represents a single linting issue found in the document.

| Field | Type | Description |
|-------|------|-------------|
| `from` | `number` | Start position (character offset from document start) |
| `to` | `number` | End position (character offset) |
| `severity` | `"error" \| "warning" \| "info"` | Visual severity level |
| `message` | `string` | Human-readable description of the issue |
| `source` | `string` | Rule ID that generated this diagnostic (e.g., "MD001") |
| `actions` | `Action[]` | Optional quick fix actions |

**Validation Rules**:
- `from` MUST be >= 0
- `to` MUST be >= `from`
- `message` MUST be non-empty
- `source` MUST match pattern `/^MD\d{3}$/`

**State Transitions**: N/A (immutable value object)

---

### Action

Represents a quick fix action for a diagnostic.

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Display label (e.g., "Add space after #") |
| `apply` | `(view: EditorView, from: number, to: number) => void` | Function to apply the fix |

---

### LintRule

Defines a linting rule's behavior and metadata.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique rule identifier (e.g., "MD001") |
| `name` | `string` | Human-readable name (e.g., "heading-increment") |
| `description` | `string` | What the rule checks |
| `tags` | `string[]` | Categories (e.g., ["headings", "structure"]) |
| `severity` | `Severity` | Default severity level |
| `check` | `CheckFunction` | Function that returns diagnostics |
| `fix` | `FixFunction \| undefined` | Optional auto-fix function |

**Validation Rules**:
- `id` MUST match pattern `/^MD\d{3}$/`
- `name` MUST be lowercase with hyphens (kebab-case)
- `check` MUST be a pure function

---

### RuleConfig

Configuration for a single rule.

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | `boolean` | Whether rule is active |
| `severity` | `Severity \| undefined` | Override default severity |
| `options` | `Record<string, unknown>` | Rule-specific options |

**Example**:
```typescript
// MD007 (ul-indent) config
{
  enabled: true,
  severity: "warning",
  options: {
    indent: 4,
    startIndented: false
  }
}
```

---

### Configuration

Complete linter configuration loaded from file or defaults.

| Field | Type | Description |
|-------|------|-------------|
| `extends` | `string \| undefined` | Base preset to inherit from |
| `rules` | `Map<string, RuleConfig>` | Per-rule configurations |
| `default` | `boolean` | Enable/disable all rules by default |

**Presets**:
- `"default"` - All rules enabled with default severity
- `"relaxed"` - Only error-level rules
- `"strict"` - All rules as errors

---

### LinterState

Runtime state maintained in CodeMirror StateField.

| Field | Type | Description |
|-------|------|-------------|
| `diagnostics` | `Diagnostic[]` | Current diagnostic list |
| `config` | `Configuration` | Active configuration |
| `lastUpdate` | `number` | Timestamp of last lint run |
| `isLinting` | `boolean` | Whether lint is in progress |

**State Transitions**:
```
IDLE → LINTING (on document change after debounce)
LINTING → IDLE (on lint complete)
IDLE → CONFIG_CHANGED (on config file change)
CONFIG_CHANGED → LINTING (re-lint with new config)
```

---

### Statistics

Aggregated diagnostic statistics for status bar.

| Field | Type | Description |
|-------|------|-------------|
| `total` | `number` | Total diagnostic count |
| `errors` | `number` | Error count |
| `warnings` | `number` | Warning count |
| `infos` | `number` | Info count |
| `compliance` | `number` | Percentage (0-100) |

**Computed From**: `LinterState.diagnostics`

---

## Entity Relationships

```
┌─────────────────┐
│  Configuration  │
└────────┬────────┘
         │ contains
         ▼
┌─────────────────┐
│   RuleConfig    │ ────────────┐
└────────┬────────┘             │
         │ configures           │
         ▼                      │
┌─────────────────┐             │
│    LintRule     │             │
└────────┬────────┘             │
         │ produces             │
         ▼                      │
┌─────────────────┐             │
│   Diagnostic    │◄────────────┘
└────────┬────────┘      (filtered by)
         │ contains
         ▼
┌─────────────────┐
│     Action      │
└─────────────────┘

┌─────────────────┐
│   LinterState   │ ──── aggregates ──── Statistics
└─────────────────┘
```

---

## Type Definitions (TypeScript)

```typescript
// Severity levels
type Severity = "error" | "warning" | "info";

// Check function signature
type CheckFunction = (
  doc: Text,
  config: RuleConfig
) => Diagnostic[];

// Fix function signature
type FixFunction = (
  doc: Text,
  diagnostic: Diagnostic
) => ChangeSpec | null;

// Configuration file format (JSON)
interface ConfigFile {
  extends?: string;
  default?: boolean;
  rules?: {
    [id: string]: boolean | Severity | RuleOptions;
  };
}

// Rule-specific options
interface RuleOptions {
  enabled?: boolean;
  severity?: Severity;
  [key: string]: unknown;
}
```

---

## Rule Registry

All 15 supported rules with their configuration options:

| ID | Name | Tags | Default | Options |
|----|------|------|---------|---------|
| MD001 | heading-increment | headings | error | - |
| MD003 | heading-style | headings | warning | `style: "atx" \| "setext" \| "consistent"` |
| MD004 | ul-style | lists | warning | `style: "-" \| "*" \| "+" \| "consistent"` |
| MD005 | list-indent | lists | error | - |
| MD007 | ul-indent | lists | warning | `indent: number, startIndented: boolean` |
| MD009 | no-trailing-spaces | whitespace | error | `brSpaces: number` |
| MD010 | no-hard-tabs | whitespace | error | `codeBlocks: boolean` |
| MD012 | no-multiple-blanks | whitespace | warning | `maximum: number` |
| MD013 | line-length | formatting | info | `lineLength: number, codeBlocks: boolean` |
| MD014 | commands-show-output | code | info | - |
| MD018 | no-missing-space-atx | headings | error | - |
| MD019 | no-multiple-space-atx | headings | warning | - |
| MD020 | no-missing-space-closed-atx | headings | error | - |
| MD021 | no-multiple-space-closed-atx | headings | warning | - |
| MD022 | blanks-around-headings | headings | warning | `linesAbove: number, linesBelow: number` |
