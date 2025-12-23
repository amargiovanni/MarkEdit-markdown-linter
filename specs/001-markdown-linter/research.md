# Research: MarkEdit Markdown Linter

**Feature**: 001-markdown-linter
**Date**: 2025-12-23
**Status**: Complete

## Research Areas

### 1. CodeMirror 6 Linter Integration

**Decision**: Use `@codemirror/lint` package with custom linter source function

**Rationale**:
- CodeMirror 6 provides a first-class linter extension via `@codemirror/lint` (v6.9.2)
- The `linter()` function accepts a source that returns diagnostics with `from`, `to`, `severity`, and `message`
- `lintGutter()` provides gutter markers (our primary visual feedback)
- `setDiagnostics()` allows imperative updates for async linting
- Actions can be attached to diagnostics for quick fixes

**Alternatives Considered**:
- **Custom decoration-only approach**: Rejected - would duplicate CodeMirror's proven linter infrastructure
- **External linter process**: Rejected - adds latency and complexity for a client-side plugin

**Implementation Pattern**:
```typescript
import { linter, lintGutter, Diagnostic } from "@codemirror/lint";

const markdownLinter = linter((view) => {
  const diagnostics: Diagnostic[] = [];
  // Run rules against view.state.doc
  return diagnostics;
});

// Extension bundle
export const linterExtension = [markdownLinter, lintGutter()];
```

**Sources**:
- [CodeMirror Lint Example](https://codemirror.net/examples/lint/)
- [@codemirror/lint on npm](https://www.npmjs.com/package/@codemirror/lint)

---

### 2. Markdownlint Rules Architecture

**Decision**: Implement custom rules inspired by markdownlint patterns, but optimized for CodeMirror

**Rationale**:
- markdownlint (by DavidAnson) uses micromark parser - good reference but heavy dependency
- Our rules need to operate on CodeMirror's document model for performance
- Each rule should be a self-contained module with: id, name, description, check function, fix function
- Rules return diagnostics in CodeMirror format directly

**Alternatives Considered**:
- **Use markdownlint library directly**: Rejected - adds ~500KB dependency, requires document conversion
- **Use markdown-it parser**: Rejected - legacy approach, not needed for simple lint rules

**Rule Interface**:
```typescript
interface LintRule {
  id: string;           // e.g., "MD001"
  name: string;         // e.g., "heading-increment"
  description: string;
  severity: "error" | "warning" | "info";
  check: (doc: Text, config: RuleConfig) => Diagnostic[];
  fix?: (doc: Text, diagnostic: Diagnostic) => ChangeSpec;
}
```

**Sources**:
- [markdownlint GitHub](https://github.com/DavidAnson/markdownlint)
- [markdownlint Rules Documentation](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
- [Custom Rules Guide](https://github.com/DavidAnson/markdownlint/blob/HEAD/doc/CustomRules.md)

---

### 3. Performance Strategy for Large Documents

**Decision**: Debounced validation + incremental updates + web worker for >5000 lines

**Rationale**:
- Validation must complete within 500ms (constitution requirement)
- Debounce at 300ms prevents excessive recalculation during typing
- For documents >5000 lines, offload to web worker to avoid blocking UI
- Use `requestIdleCallback` for non-critical updates

**Implementation Pattern**:
```typescript
// Debounce configuration
const DEBOUNCE_MS = 300;
const LARGE_DOC_THRESHOLD = 5000; // lines

// ViewPlugin for reactive updates
const linterPlugin = ViewPlugin.fromClass(class {
  update(update: ViewUpdate) {
    if (update.docChanged) {
      this.scheduleLint();
    }
  }

  scheduleLint() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.runLint(), DEBOUNCE_MS);
  }
});
```

**Alternatives Considered**:
- **Lint on every keystroke**: Rejected - causes jank on large documents
- **Lint only on save**: Rejected - loses real-time feedback value proposition

---

### 4. Configuration File Loading

**Decision**: JSON-based `.markdownlintrc` with extends support, loaded via fetch/FileReader

**Rationale**:
- Standard markdownlint config format ensures familiarity
- Search order: document directory → home directory → defaults
- `extends` property allows preset inheritance (e.g., "google", "commonmark")
- JSON schema validation for config files

**Configuration Schema**:
```typescript
interface MarkdownlintConfig {
  extends?: string;           // Preset name or path
  rules?: {
    [ruleId: string]: boolean | RuleOptions;
  };
  default?: boolean;          // Enable/disable all rules
}

// Example .markdownlintrc
{
  "extends": "default",
  "rules": {
    "MD013": false,
    "MD007": { "indent": 4 }
  }
}
```

**Alternatives Considered**:
- **YAML config**: Rejected - adds parser dependency, JSON is sufficient
- **JS config**: Rejected - security concerns in WebView context

---

### 5. Status Bar Implementation

**Decision**: Use CodeMirror Panel API for status bar

**Rationale**:
- `showPanel` from `@codemirror/view` provides standard panel integration
- Panel can be positioned at bottom of editor
- Reactive updates via StateField tracking diagnostic counts

**Implementation Pattern**:
```typescript
import { showPanel, Panel } from "@codemirror/view";

const statusBarPanel = showPanel.of((view) => {
  const dom = document.createElement("div");
  dom.className = "cm-linter-status";
  return { dom, update(update) { /* refresh counts */ } };
});
```

**Sources**:
- [CodeMirror Panel Documentation](https://codemirror.net/docs/ref/#view.showPanel)

---

### 6. Quick Fix Actions

**Decision**: Use Diagnostic actions with CodeMirror transactions

**Rationale**:
- `@codemirror/lint` Diagnostic type supports `actions` array
- Each action has `name` and `apply` function
- Apply function dispatches transaction to fix the issue

**Implementation Pattern**:
```typescript
const diagnostic: Diagnostic = {
  from: pos,
  to: pos + length,
  severity: "error",
  message: "Missing space after #",
  actions: [{
    name: "Add space",
    apply(view, from, to) {
      view.dispatch({
        changes: { from: from + 1, insert: " " }
      });
    }
  }]
};
```

---

## Technology Stack Summary

| Component | Choice | Version |
|-----------|--------|---------|
| Language | TypeScript | 5.x |
| Editor Framework | CodeMirror 6 | 6.x |
| Lint Infrastructure | @codemirror/lint | 6.9.x |
| Build Tool | Rollup | 4.x |
| Test Framework | Vitest | 2.x |
| Test Environment | jsdom | latest |

## Dependencies

```json
{
  "dependencies": {
    "@codemirror/view": "^6.0.0",
    "@codemirror/state": "^6.0.0",
    "@codemirror/lint": "^6.9.0",
    "@codemirror/language": "^6.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^2.0.0",
    "jsdom": "^24.0.0",
    "rollup": "^4.0.0",
    "@rollup/plugin-typescript": "^11.0.0"
  }
}
```

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| How to integrate with MarkEdit specifically? | CodeMirror 6 extension - MarkEdit loads extensions via WebView |
| Parser for Markdown? | Line-by-line regex for simple rules; no full AST needed for MD001-MD022 |
| Config file access in WebView? | Use fetch() for file access, fallback to localStorage for user prefs |
