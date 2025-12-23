/**
 * Statistics calculation for diagnostics.
 *
 * @module linter/statistics
 */

import type { Diagnostic, Statistics } from "./types";

/**
 * Calculates statistics from a list of diagnostics.
 *
 * @param diagnostics - The diagnostics to analyze
 * @param lineCount - Optional total line count for compliance calculation
 * @returns Calculated statistics
 */
export function calculateStatistics(
  diagnostics: readonly Diagnostic[],
  lineCount = 1
): Statistics {
  let errors = 0;
  let warnings = 0;
  let infos = 0;

  for (const diagnostic of diagnostics) {
    switch (diagnostic.severity) {
      case "error":
        errors++;
        break;
      case "warning":
        warnings++;
        break;
      case "info":
        infos++;
        break;
    }
  }

  // Calculate compliance percentage
  const total = diagnostics.length;
  const compliance = lineCount > 0 ? Math.max(0, 100 - (total / lineCount) * 10) : 100;

  return {
    total,
    errors,
    warnings,
    infos,
    compliance: Math.round(compliance),
  };
}

/**
 * Formats statistics into a human-readable string.
 *
 * @param stats - The statistics to format
 * @returns Formatted string for display
 */
export function formatStatistics(stats: Statistics): string {
  if (stats.total === 0) {
    return "✓ No issues";
  }

  const parts: string[] = [];

  if (stats.errors > 0) {
    parts.push(`${stats.errors} error${stats.errors !== 1 ? "s" : ""}`);
  }

  if (stats.warnings > 0) {
    parts.push(`${stats.warnings} warning${stats.warnings !== 1 ? "s" : ""}`);
  }

  if (stats.infos > 0) {
    parts.push(`${stats.infos} info`);
  }

  return parts.join(", ");
}

/**
 * Formats detailed statistics.
 *
 * @param stats - The statistics to format
 * @returns Detailed formatted string
 */
export function formatDetailedStatistics(stats: Statistics): string {
  if (stats.total === 0) {
    return "No issues found";
  }

  const lines: string[] = [`Total: ${stats.total} issue${stats.total !== 1 ? "s" : ""}`];

  if (stats.errors > 0) {
    lines.push(`  Errors: ${stats.errors}`);
  }
  if (stats.warnings > 0) {
    lines.push(`  Warnings: ${stats.warnings}`);
  }
  if (stats.infos > 0) {
    lines.push(`  Info: ${stats.infos}`);
  }

  lines.push(`  Compliance: ${stats.compliance}%`);

  return lines.join("\n");
}
