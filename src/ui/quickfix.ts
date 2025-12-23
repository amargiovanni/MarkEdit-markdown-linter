/**
 * Quick fix menu component for applying individual fixes.
 *
 * @module ui/quickfix
 */

import type { Text, ChangeSpec } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import type { Diagnostic } from "../linter/types";
import { getRule } from "../linter/rules/index";

/**
 * Represents a single quick fix action.
 */
export interface QuickFix {
  /** Human-readable label for the fix */
  readonly label: string;
  /** Rule ID that generated this fix */
  readonly source: string;
  /** The diagnostic being fixed */
  readonly diagnostic: Diagnostic;
  /** The change to apply */
  readonly change: ChangeSpec;
}

/**
 * Gets available quick fixes for a specific diagnostic.
 *
 * @param doc - The document
 * @param diagnostic - The diagnostic to get fixes for
 * @returns Array of available quick fixes
 */
export function getQuickFixesForDiagnostic(
  doc: Text,
  diagnostic: Diagnostic
): QuickFix[] {
  const rule = getRule(diagnostic.source);
  if (!rule?.fix) {
    return [];
  }

  const change = rule.fix(doc, diagnostic);
  if (!change) {
    return [];
  }

  // Generate a human-readable label based on the rule
  const label = generateFixLabel(diagnostic.source, rule.description);

  return [
    {
      label,
      source: diagnostic.source,
      diagnostic,
      change,
    },
  ];
}

/**
 * Gets all available quick fixes for diagnostics at a specific position.
 *
 * @param doc - The document
 * @param diagnostics - All diagnostics in the document
 * @param pos - The cursor position
 * @returns Array of available quick fixes at the position
 */
export function getQuickFixesForPosition(
  doc: Text,
  diagnostics: readonly Diagnostic[],
  pos: number
): QuickFix[] {
  const fixes: QuickFix[] = [];

  // Find all diagnostics that cover the position
  for (const diagnostic of diagnostics) {
    if (pos >= diagnostic.from && pos <= diagnostic.to) {
      const diagFixes = getQuickFixesForDiagnostic(doc, diagnostic);
      fixes.push(...diagFixes);
    }
  }

  return fixes;
}

/**
 * Generates a human-readable label for a fix action.
 *
 * @param ruleId - The rule ID
 * @param description - The rule description
 * @returns A user-friendly label
 */
function generateFixLabel(ruleId: string, description: string): string {
  // Create fix-oriented labels from rule descriptions
  const fixLabels: Record<string, string> = {
    MD001: "Fix heading level increment",
    MD003: "Fix heading style",
    MD004: "Fix list style",
    MD005: "Fix list indentation",
    MD007: "Fix unordered list indentation",
    MD009: "Remove trailing spaces",
    MD010: "Replace tabs with spaces",
    MD012: "Remove extra blank lines",
    MD013: "Wrap long line",
    MD014: "Remove leading dollar sign",
    MD018: "Add space after hash",
    MD019: "Remove extra spaces after hash",
    MD020: "Add space before closing hash",
    MD021: "Remove extra spaces before closing hash",
    MD022: "Add blank lines around heading",
  };

  return fixLabels[ruleId] ?? `Fix: ${description}`;
}

/**
 * Applies a quick fix to the editor.
 *
 * @param view - The editor view
 * @param fix - The quick fix to apply
 */
export function applyQuickFix(view: EditorView, fix: QuickFix): void {
  view.dispatch({
    changes: fix.change,
  });
}

/**
 * Shows the quick fix menu at the cursor position.
 *
 * @param view - The editor view
 * @param diagnostics - All diagnostics in the document
 * @returns True if the command was handled
 */
export function showQuickFixMenu(
  view: EditorView,
  diagnostics: readonly Diagnostic[]
): boolean {
  const pos = view.state.selection.main.head;
  const fixes = getQuickFixesForPosition(view.state.doc, diagnostics, pos);

  if (fixes.length === 0) {
    return false;
  }

  // If only one fix available, apply it directly
  if (fixes.length === 1) {
    applyQuickFix(view, fixes[0]!);
    return true;
  }

  // For multiple fixes, apply the first one (in a real implementation,
  // this would show a menu for the user to choose)
  // TODO: Implement proper menu UI
  applyQuickFix(view, fixes[0]!);
  return true;
}
