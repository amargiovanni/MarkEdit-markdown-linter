# Quickstart: MarkEdit Markdown Linter

**Feature**: 001-markdown-linter
**Date**: 2025-12-23

## Prerequisites

- Node.js 18+
- npm or pnpm
- MarkEdit installed (macOS)

## Installation

### From npm (when published)

```bash
npm install markedit-linter
```

### From source

```bash
git clone https://github.com/amargiovanni/MarkEdit-markdown-linter.git
cd MarkEdit-markdown-linter
npm install
npm run build
```

## Basic Usage

### In a CodeMirror 6 Editor

```typescript
import { EditorView, basicSetup } from "codemirror";
import { markdownLinter } from "markedit-linter";

const editor = new EditorView({
  doc: "# Hello World\n\nSome markdown content...",
  extensions: [
    basicSetup,
    markdownLinter()
  ],
  parent: document.getElementById("editor")!
});
```

### With Custom Configuration

```typescript
import { markdownLinter } from "markedit-linter";

const linter = markdownLinter({
  config: {
    rules: {
      "MD013": false,           // Disable line length
      "MD007": { indent: 4 }    // 4-space indent for lists
    }
  },
  debounceMs: 500,              // Wait 500ms before linting
  debug: true                   // Enable console logging
});
```

## Configuration File

Create `.markdownlintrc` in your project root:

```json
{
  "extends": "default",
  "rules": {
    "MD013": false,
    "MD007": {
      "indent": 4
    },
    "MD009": {
      "brSpaces": 2
    }
  }
}
```

### Configuration Lookup Order

1. `.markdownlintrc` in document directory
2. `.markdownlintrc` in home directory (`~/.markdownlintrc`)
3. Built-in defaults

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Format Document | `Cmd + Shift + F` |
| Quick Fix | `Cmd + .` |
| Next Diagnostic | `F8` |
| Previous Diagnostic | `Shift + F8` |
| Toggle Linter | `Cmd + Shift + L` |

### Custom Keybindings

```typescript
import { keymap } from "@codemirror/view";
import { formatDocument, showQuickFix } from "markedit-linter";

const customKeymap = keymap.of([
  { key: "Mod-Shift-f", run: formatDocument },
  { key: "Mod-.", run: showQuickFix }
]);
```

## API Reference

### Get Linter API

```typescript
import { getLinterAPI } from "markedit-linter";

const api = getLinterAPI(view);
if (api) {
  // Force lint
  api.lint();

  // Format document
  api.format();

  // Get statistics
  const stats = api.getStatistics();
  console.log(`${stats.errors} errors, ${stats.warnings} warnings`);

  // Get all diagnostics
  const diagnostics = api.getDiagnostics();
}
```

### Using Individual Extensions

```typescript
import {
  linterCore,
  linterGutter,
  linterStatusBar,
  linterTooltips
} from "markedit-linter";

// Minimal setup (validation only)
const minimalExtensions = [linterCore()];

// Full setup (all UI components)
const fullExtensions = [
  linterCore(),
  linterGutter(),
  linterStatusBar(),
  linterTooltips()
];
```

## Validation Example

Run the quickstart validation:

```bash
# 1. Start development server
npm run dev

# 2. Open http://localhost:5173 in browser

# 3. Type markdown with intentional errors:
#    - "# Test" followed by "### Skip" (MD001 error)
#    - Lines with trailing spaces (MD009 error)
#    - "#NoSpace" (MD018 error)

# 4. Verify:
#    - Red markers appear in gutter
#    - Hover shows error details
#    - Status bar shows "X errors, Y warnings"
#    - Cmd+Shift+F fixes auto-correctable issues
```

## Troubleshooting

### Linter not working

1. Check console for errors (`debug: true`)
2. Verify extension is included in EditorView
3. Check configuration file syntax (valid JSON)

### Performance issues

1. Increase `debounceMs` for large documents
2. Disable expensive rules (MD013 line-length)
3. Check document size (>10k lines may need async mode)

### Configuration not applied

1. Verify `.markdownlintrc` path
2. Check JSON validity
3. Rule IDs are case-sensitive ("MD001" not "md001")

## Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Building

```bash
# Development build
npm run build:dev

# Production build (minified)
npm run build

# Type checking
npm run typecheck
```
