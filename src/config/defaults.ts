/**
 * Default rule configurations.
 *
 * @module config/defaults
 */

import type { ResolvedConfig } from "./loader";

/**
 * Default severity for each rule.
 */
export const DEFAULT_SEVERITIES: Record<string, "error" | "warning" | "info"> = {
  MD001: "error",
  MD003: "warning",
  MD004: "warning",
  MD005: "error",
  MD007: "warning",
  MD009: "error",
  MD010: "error",
  MD012: "warning",
  MD013: "info",
  MD014: "info",
  MD018: "error",
  MD019: "warning",
  MD020: "error",
  MD021: "warning",
  MD022: "warning",
};

/**
 * Default options for rules that have configurable parameters.
 */
export const DEFAULT_OPTIONS: Record<string, Record<string, unknown>> = {
  MD007: { indent: 2 },
  MD012: { maximum: 1 },
  MD013: { line_length: 80, code_blocks: true, tables: true },
};

/**
 * Creates the default configuration.
 *
 * @returns Default resolved configuration
 */
export function getDefaultConfig(): ResolvedConfig {
  return {
    rules: {},
    default: true,
  };
}

/**
 * Gets the default options for a rule.
 *
 * @param ruleId - The rule ID
 * @returns Default options or empty object
 */
export function getDefaultOptions(ruleId: string): Record<string, unknown> {
  return DEFAULT_OPTIONS[ruleId] ?? {};
}

/**
 * Gets the default severity for a rule.
 *
 * @param ruleId - The rule ID
 * @returns Default severity
 */
export function getDefaultSeverity(
  ruleId: string
): "error" | "warning" | "info" {
  return DEFAULT_SEVERITIES[ruleId] ?? "warning";
}
