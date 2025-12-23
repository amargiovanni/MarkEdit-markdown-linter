/**
 * MD020: no-missing-space-closed-atx
 *
 * No space inside hashes on closed ATX style headings.
 *
 * @example
 * // Good
 * # Heading #
 *
 * @example
 * // Bad
 * #Heading#
 * # Heading#
 * #Heading #
 *
 * @module linter/rules/md020-no-missing-space-closed-atx
 */

import type { Text } from "@codemirror/state";
import type { LintRule, RuleConfig, Diagnostic } from "../types";
import { createDiagnostic } from "../types";
import { isCodeFence } from "./utils";

/**
 * Checks if a line is a closed ATX heading (has trailing hashes).
 */
function isClosedAtxHeading(line: string): boolean {
  // Must start with # and end with #
  return /^#{1,6}.*#\s*$/.test(line);
}

export const md020: LintRule = {
  id: "MD020",
  name: "no-missing-space-closed-atx",
  description: "No space inside hashes on closed ATX style headings",
  tags: ["headings", "atx_closed", "spaces"],
  severity: "warning",

  check(doc: Text, _config: RuleConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    let inCodeBlock = false;

    for (let i = 1; i <= doc.lines; i++) {
      const lineInfo = doc.line(i);
      const line = lineInfo.text;

      // Track code block state - O(n) instead of O(n²)
      if (isCodeFence(line)) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      // Skip code blocks
      if (inCodeBlock) {
        continue;
      }

      // Only check closed ATX headings
      if (!isClosedAtxHeading(line)) {
        continue;
      }

      // Check for missing space after opening hashes
      // Match all leading hashes, then a non-space, non-hash character
      const openMatch = line.match(/^(#{1,6})([^\s#])/);
      if (openMatch) {
        diagnostics.push(
          createDiagnostic({
            from: lineInfo.from,
            to: lineInfo.to,
            severity: "warning",
            message: "Missing space after opening hashes in closed ATX heading",
            source: "MD020",
          })
        );
        continue;
      }

      // Check for missing space before closing hashes
      // The pattern should match a non-space, non-hash character directly before the closing hashes
      const closeMatch = line.match(/([^\s#])(#+)\s*$/);
      if (closeMatch) {
        diagnostics.push(
          createDiagnostic({
            from: lineInfo.from,
            to: lineInfo.to,
            severity: "warning",
            message: "Missing space before closing hashes in closed ATX heading",
            source: "MD020",
          })
        );
      }
    }

    return diagnostics;
  },
};
