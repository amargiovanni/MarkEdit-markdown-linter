# MarkEdit Markdown Linter & Formatter

> Automatic validation and formatting of Markdown according to best practices.

A plugin for [MarkEdit](https://github.com/MarkEdit-app/MarkEdit) that keeps your Markdown clean, consistent, and standards-compliant, with real-time automatic corrections.

## Features

### Real-Time Validation
- Checks Markdown quality as you type
- Highlights issues and suggests corrections
- Supports custom configurations for different styles

### Supported Rules
- **Headings**: Consistent styles (#, spaces, hierarchical order)
- **Lists**: Consistent format (-, *, +), correct indentation
- **Links**: Valid URLs, descriptive text, avoid broken links
- **Images**: Required alt text, relative paths
- **Code**: Code block syntax, indentation
- **Formatting**: Bold/Italic, spaces, line endings
- **Whitespace**: Blank lines, trailing spaces, indentation
- **Structure**: Markdown tables, blockquotes, horizontal rules

### Automatic Formatting
- Automatically fixes common issues
- Unifies document style
- Preserves content meaning
- Command: `Format Document` (Cmd+Shift+F)

### Configuration
Customize rules through `.markdownlintrc`:
```json
{
  "rules": {
    "MD001": true,
    "MD003": { "style": "consistent" },
    "MD004": { "style": "consistent" },
    "MD007": { "indent": 2 }
  },
  "extends": "default"
}
```

## Installation

### Via GitHub
1. Download the latest release from the [repository](https://github.com/amargiovanni/MarkEdit-markdown-linter)
2. Extract the `.zip` file
3. Copy to `~/Library/Application Support/MarkEdit/extensions/`
4. Restart MarkEdit

### Via Homebrew
```bash
brew install markedit-markdown-linter
```

## Quick Start

1. **Open a Markdown file** in MarkEdit
2. **View issues** in the gutter (colored markers on the left side)
3. **Use Quick Fix** (Cmd+.) for automatic corrections
4. **Format the document** with Cmd+Shift+F

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Quick Fix | `Cmd + .` |
| Format Document | `Cmd + Shift + F` |
| Toggle Plugin | `Cmd + Shift + L` |
| Open Settings | `Cmd + Shift + ,` |

## Available Rules

### Severity Levels
- **Error** - Critical issues
- **Warning** - Recommended fixes
- **Info** - Optional suggestions

| ID | Name | Description | Default |
|----|------|-------------|---------|
| MD001 | heading-increment | Headings increase by 1 level at a time | Error |
| MD003 | heading-style | Consistent heading style | Warning |
| MD004 | ul-style | Consistent list style | Warning |
| MD005 | list-indent | Consistent list indentation | Error |
| MD007 | ul-indent | List indented correctly | Warning |
| MD009 | no-trailing-spaces | No trailing spaces | Error |
| MD010 | no-hard-tabs | No tabs, only spaces | Error |
| MD012 | no-multiple-blanks | Max 1 consecutive blank line | Warning |
| MD013 | line-length | Max 80 characters per line | Info |
| MD014 | commands-show-output | Code blocks don't start with `$` | Info |
| MD018 | no-missing-space-atx | Space after `#` in heading | Error |
| MD019 | no-multiple-space-atx | Single space after `#` | Warning |
| MD020 | no-missing-space-closed-atx | Space before closing `#` | Error |
| MD021 | no-multiple-space-closed-atx | Single space before closing `#` | Warning |
| MD022 | blanks-around-headings | Blank lines around headings | Warning |

## Use Cases

### For Bloggers
Keep your blog consistent with a uniform style across all articles.

### For Technical Documentation
Ensure documentation follows project standards.

### For Teams
Share `.markdownlintrc` in the repository to maintain the same style across the team.

### For Students/Researchers
Write well-structured academic documents with automatic formatting rules.

## Integration

### AppleScript
Control the plugin from macOS automations:
```applescript
tell application "MarkEdit"
    activate
    run script "plugin:markdown-linter:format"
end tell
```

### Shortcuts
Create automations through the native macOS Shortcuts app.

## Statistics

The plugin also provides useful metrics:
- Total number of issues
- Issues by category
- Compliance percentage
- Average correction time

## Advanced Configuration

### Style Profiles

#### Google Style
```json
{
  "extends": "google",
  "rules": {
    "MD013": false,
    "MD024": false
  }
}
```

#### CommonMark Style
```json
{
  "extends": "commonmark"
}
```

### Ignoring Code Blocks
```markdown
<!-- markdownlint-disable MD013 -->
This text will ignore the MD013 rule
<!-- markdownlint-enable MD013 -->
```

## Troubleshooting

### The plugin won't start
1. Verify MarkEdit is updated to the latest version
2. Check the logs: `~/Library/Logs/MarkEdit/`
3. Recreate the configuration: delete `~/.markdownlintrc`

### Rules are not being applied
1. Verify the configuration file
2. Reload the plugin: Preferences > Extensions > Reload
3. Make sure the Markdown file is saved

### Performance issues with large files
1. Disable unnecessary rules
2. Increase `debounce` in configuration
3. Reduce complexity of custom regex patterns

## Developer API

### Using as a Library

Install from npm:
```bash
npm install markedit-linter
```

### Basic Usage with CodeMirror 6

```typescript
import { EditorView, basicSetup } from "codemirror";
import { markdownLinter } from "markedit-linter";

const editor = new EditorView({
  doc: "# Hello World\n\nSome markdown content",
  extensions: [
    basicSetup,
    markdownLinter({
      debounceMs: 300,
      config: {
        rules: {
          MD013: { line_length: 120 },
          MD010: false, // disable hard tabs rule
        }
      }
    })
  ],
  parent: document.getElementById("editor")!
});
```

### Programmatic Linting

```typescript
import { LintingEngine, createDefaultConfiguration } from "markedit-linter";
import { Text } from "@codemirror/state";

const config = createDefaultConfiguration();
const engine = new LintingEngine(config);
const doc = Text.of(["# Hello", "", "Some text"]);
const diagnostics = engine.lint(doc);

console.log(`Found ${diagnostics.length} issues`);
```

### Custom Rules

```typescript
import { registerRule, LintRule, createDiagnostic } from "markedit-linter";

const myRule: LintRule = {
  id: "MY001",
  name: "custom-rule",
  description: "My custom rule",
  tags: ["custom"],
  severity: "warning",

  check(doc, config) {
    const diagnostics = [];
    // Your rule logic here
    return diagnostics;
  },

  fix(doc, diagnostic) {
    // Optional: return a fix object
    return null;
  }
};

registerRule(myRule);
```

### API Reference

| Export | Description |
|--------|-------------|
| `markdownLinter(options?)` | Creates CodeMirror extension |
| `getDiagnostics(state)` | Gets diagnostics from editor state |
| `formatDocument(view)` | Formats document in editor |
| `LintingEngine` | Core linting engine class |
| `Formatter` | Document formatting class |
| `createAppleScriptBridge()` | AppleScript integration |
| `calculateStatistics(diagnostics)` | Get error/warning counts |

## Full Documentation

For advanced guides, examples, and extension development, visit the [official wiki](https://github.com/yourusername/MarkEdit-markdown-linter/wiki).

## Contributing

Help us improve!

- **Report bugs**: Open an [issue](https://github.com/yourusername/MarkEdit-markdown-linter/issues)
- **Suggest features**: Open a [discussion](https://github.com/yourusername/MarkEdit-markdown-linter/discussions)
- **Contribute code**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Translations**: Help us localize to other languages

## License

This plugin is released under the **MIT** license, in line with MarkEdit.

```
MIT License

Copyright (c) 2025 MarkEdit Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## Useful Links

- **MarkEdit GitHub**: https://github.com/MarkEdit-app/MarkEdit
- **markdownlint**: https://github.com/DavidAnson/markdownlint
- **CodeMirror 6**: https://codemirror.net/
- **MarkEdit API**: https://github.com/MarkEdit-app/MarkEdit/wiki

## Support

- **Email**: support@example.com
- **Mastodon**: [@MarkEditApp](https://mastodon.social/@MarkEditApp)
- **GitHub Discussions**: [Community Forum](https://github.com/yourusername/MarkEdit-markdown-linter/discussions)

---

**Made with love for the MarkEdit community**

Version: 1.0.0 | Last updated: December 2025
