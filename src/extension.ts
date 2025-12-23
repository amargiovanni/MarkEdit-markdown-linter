/**
 * CodeMirror 6 extension setup for the markdown linter.
 *
 * This module provides the main extension factory that integrates
 * all linter components into a single CodeMirror extension.
 *
 * @module extension
 */

import {
  StateField,
  StateEffect,
  type Extension,
  type EditorState,
} from "@codemirror/state";
import { EditorView, ViewPlugin, type ViewUpdate, keymap } from "@codemirror/view";
import type {
  LinterOptions,
  Diagnostic,
  Configuration,
  RuleId,
} from "./linter/types";
import { createRuleConfig } from "./linter/types";
import { LintingEngine, createDefaultConfiguration } from "./linter/engine";
import { Formatter } from "./formatter/formatter";
import { lintGutter } from "./ui/gutter";
import { lintTooltip } from "./ui/tooltip";
import { showQuickFixMenu } from "./ui/quickfix";
import { debounce } from "./utils/debounce";

// Register all rules
import { md001 } from "./linter/rules/md001-heading-increment";
import { md003 } from "./linter/rules/md003-heading-style";
import { md004 } from "./linter/rules/md004-ul-style";
import { md005 } from "./linter/rules/md005-list-indent";
import { md007 } from "./linter/rules/md007-ul-indent";
import { md009 } from "./linter/rules/md009-no-trailing-spaces";
import { md010 } from "./linter/rules/md010-no-hard-tabs";
import { md012 } from "./linter/rules/md012-no-multiple-blanks";
import { md013 } from "./linter/rules/md013-line-length";
import { md014 } from "./linter/rules/md014-commands-show-output";
import { md018 } from "./linter/rules/md018-no-missing-space-atx";
import { md019 } from "./linter/rules/md019-no-multiple-space-atx";
import { md020 } from "./linter/rules/md020-no-missing-space-closed-atx";
import { md021 } from "./linter/rules/md021-no-multiple-space-closed-atx";
import { md022 } from "./linter/rules/md022-blanks-around-headings";
import { registerRule, clearRegistry, getRuleCount } from "./linter/rules/index";

/**
 * Effect to update diagnostics in the state.
 */
const setDiagnosticsEffect = StateEffect.define<readonly Diagnostic[]>();

/**
 * State field holding current diagnostics.
 */
const diagnosticsField = StateField.define<readonly Diagnostic[]>({
  create: () => [],
  update(diagnostics, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setDiagnosticsEffect)) {
        return effect.value;
      }
    }
    return diagnostics;
  },
});

/**
 * Default linter options.
 */
const DEFAULT_OPTIONS: Required<Pick<LinterOptions, "debounceMs" | "debug">> = {
  debounceMs: 300,
  debug: false,
};

/**
 * Ensures all built-in rules are registered.
 */
function ensureRulesRegistered(): void {
  if (getRuleCount() === 0) {
    registerRule(md001);
    registerRule(md003);
    registerRule(md004);
    registerRule(md005);
    registerRule(md007);
    registerRule(md009);
    registerRule(md010);
    registerRule(md012);
    registerRule(md013);
    registerRule(md014);
    registerRule(md018);
    registerRule(md019);
    registerRule(md020);
    registerRule(md021);
    registerRule(md022);
  }
}

/**
 * Creates a configuration from linter options.
 */
function createConfiguration(options: LinterOptions): Configuration {
  ensureRulesRegistered();

  if (options.config?.rules) {
    const rules = new Map<RuleId, ReturnType<typeof createRuleConfig>>();

    for (const [id, value] of Object.entries(options.config.rules)) {
      if (typeof value === "boolean") {
        rules.set(id as RuleId, createRuleConfig({ enabled: value }));
      } else if (typeof value === "string") {
        rules.set(
          id as RuleId,
          createRuleConfig({ severity: value as "error" | "warning" | "info" })
        );
      } else {
        // Use destructuring to separate standard properties from rule-specific options
        const { enabled, severity, ...ruleOptions } = value;
        // Build config object conditionally to satisfy exactOptionalPropertyTypes
        const configInput: Parameters<typeof createRuleConfig>[0] = { options: ruleOptions };
        if (enabled !== undefined) {
          configInput.enabled = enabled;
        }
        if (severity !== undefined) {
          configInput.severity = severity as "error" | "warning" | "info";
        }
        rules.set(id as RuleId, createRuleConfig(configInput));
      }
    }

    return {
      rules,
      defaultEnabled: options.config.default ?? true,
    };
  }

  return createDefaultConfiguration();
}

/**
 * Gets diagnostics from the editor state.
 */
export function getDiagnostics(state: EditorState): readonly Diagnostic[] {
  return state.field(diagnosticsField, false) ?? [];
}

/**
 * Creates the markdown linter extension for CodeMirror 6.
 *
 * @param options - Configuration options for the linter
 * @returns CodeMirror extension array
 *
 * @example
 * ```typescript
 * import { EditorView, basicSetup } from "codemirror";
 * import { markdownLinter } from "markedit-linter";
 *
 * const editor = new EditorView({
 *   doc: "# Hello World",
 *   extensions: [basicSetup, markdownLinter()],
 *   parent: document.getElementById("editor")!
 * });
 * ```
 */
export function markdownLinter(options: LinterOptions = {}): Extension {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  ensureRulesRegistered();

  const config = createConfiguration(options);
  const engine = new LintingEngine(config);

  // Create the ViewPlugin that handles linting
  const linterPlugin = ViewPlugin.fromClass(
    class {
      private readonly debouncedLint: ReturnType<typeof debounce>;

      constructor(private view: EditorView) {
        this.debouncedLint = debounce(() => {
          this.lint();
        }, opts.debounceMs);

        // Initial lint
        this.lint();
      }

      update(update: ViewUpdate): void {
        if (update.docChanged) {
          this.debouncedLint();
        }
      }

      lint(): void {
        const diagnostics = engine.lint(this.view.state.doc);

        if (opts.debug) {
          console.log("[markedit-linter] Found", diagnostics.length, "diagnostics");
        }

        this.view.dispatch({
          effects: setDiagnosticsEffect.of(diagnostics),
        });

        if (opts.onDiagnosticsChange) {
          opts.onDiagnosticsChange(diagnostics);
        }
      }

      destroy(): void {
        this.debouncedLint.cancel();
      }
    }
  );

  // Create tooltip that reads from diagnostics field
  const tooltip = lintTooltip((view, pos) => {
    const diagnostics = getDiagnostics(view.state);
    return diagnostics.filter((d) => pos >= d.from && pos <= d.to);
  });

  // Style theme
  const theme = EditorView.baseTheme({
    "&light .cm-lint-marker-error": { backgroundColor: "#e53935" },
    "&light .cm-lint-marker-warning": { backgroundColor: "#fb8c00" },
    "&light .cm-lint-marker-info": { backgroundColor: "#1e88e5" },
    "&dark .cm-lint-marker-error": { backgroundColor: "#f44336" },
    "&dark .cm-lint-marker-warning": { backgroundColor: "#ff9800" },
    "&dark .cm-lint-marker-info": { backgroundColor: "#2196f3" },
    ".cm-lint-marker": {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      display: "inline-block",
      verticalAlign: "middle",
    },
    ".cm-lint-tooltip": {
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "13px",
      maxWidth: "400px",
      lineHeight: "1.4",
    },
    "&light .cm-lint-tooltip": {
      backgroundColor: "#f5f5f5",
      color: "#333",
      border: "1px solid #ddd",
    },
    "&dark .cm-lint-tooltip": {
      backgroundColor: "#1e1e1e",
      color: "#d4d4d4",
      border: "1px solid #333",
    },
  });

  // Format document command
  const formatter = new Formatter(engine);

  const linterKeymap = keymap.of([
    {
      key: "Mod-Shift-f",
      run: (view: EditorView) => {
        const result = formatter.format(view.state.doc);

        if (result.fixedCount > 0) {
          view.dispatch({
            changes: {
              from: 0,
              to: view.state.doc.length,
              insert: result.text,
            },
          });

          if (opts.debug) {
            console.log("[markedit-linter] Formatted document, applied", result.fixedCount, "fixes");
          }
        }

        return true;
      },
    },
    {
      key: "Mod-.",
      run: (view: EditorView) => {
        const diagnostics = getDiagnostics(view.state);
        const handled = showQuickFixMenu(view, diagnostics);

        if (opts.debug && handled) {
          console.log("[markedit-linter] Applied quick fix");
        }

        return handled;
      },
    },
  ]);

  return [diagnosticsField, linterPlugin, lintGutter(), tooltip, theme, linterKeymap];
}

/**
 * Formats the document in the given editor view.
 *
 * @param view - The CodeMirror editor view
 * @returns The format result with the new text and applied changes count
 */
export function formatDocument(view: EditorView): { text: string; fixedCount: number } {
  ensureRulesRegistered();
  const config = createDefaultConfiguration();
  const engine = new LintingEngine(config);
  const formatter = new Formatter(engine);
  const result = formatter.format(view.state.doc);

  if (result.fixedCount > 0) {
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: result.text,
      },
    });
  }

  return { text: result.text, fixedCount: result.fixedCount };
}

/**
 * Re-export for testing.
 */
export { clearRegistry as _clearRegistry, ensureRulesRegistered as _ensureRulesRegistered };
