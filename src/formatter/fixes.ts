/**
 * Auto-fix collection utilities.
 *
 * @module formatter/fixes
 */

import type { Text, ChangeSpec } from "@codemirror/state";
import type { Diagnostic, RuleConfig, RuleId } from "../linter/types";
import { createRuleConfig } from "../linter/types";
import { getRule } from "../linter/rules/index";

/**
 * A change to apply to the document.
 */
export interface Fix {
  /** The diagnostic being fixed */
  readonly diagnostic: Diagnostic;
  /** The change to apply */
  readonly change: ChangeSpec;
}

/**
 * Gets the fix for a diagnostic if one is available.
 *
 * @param doc - The document
 * @param diagnostic - The diagnostic to fix
 * @param configMap - Optional map of rule configurations
 * @returns The fix or null if not fixable
 */
export function getFixForDiagnostic(
  doc: Text,
  diagnostic: Diagnostic,
  configMap?: ReadonlyMap<RuleId, RuleConfig>
): Fix | null {
  const rule = getRule(diagnostic.source);
  if (!rule?.fix) {
    return null;
  }

  // Get the rule config from the map, or create a default one
  const config = configMap?.get(diagnostic.source) ?? createRuleConfig({
    enabled: true,
    severity: rule.severity,
  });

  const change = rule.fix(doc, diagnostic, config);
  if (!change) {
    return null;
  }

  return {
    diagnostic,
    change,
  };
}

/**
 * Collects all available fixes for a list of diagnostics.
 *
 * @param doc - The document
 * @param diagnostics - List of diagnostics
 * @param configMap - Optional map of rule configurations
 * @returns Array of available fixes
 */
export function collectFixes(
  doc: Text,
  diagnostics: readonly Diagnostic[],
  configMap?: ReadonlyMap<RuleId, RuleConfig>
): Fix[] {
  const fixes: Fix[] = [];

  for (const diag of diagnostics) {
    const fix = getFixForDiagnostic(doc, diag, configMap);
    if (fix) {
      fixes.push(fix);
    }
  }

  return fixes;
}

/**
 * Checks if a diagnostic is fixable.
 *
 * @param diagnostic - The diagnostic to check
 * @returns True if the diagnostic can be auto-fixed
 */
export function isFixable(diagnostic: Diagnostic): boolean {
  const rule = getRule(diagnostic.source);
  return rule?.fix !== undefined;
}
