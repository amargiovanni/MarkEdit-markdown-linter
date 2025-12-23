/**
 * MD021: no-multiple-space-closed-atx
 *
 * Multiple spaces inside hashes on closed ATX style headings.
 *
 * @example
 * // Good
 * # Heading #
 *
 * @example
 * // Bad
 * #  Heading #
 * # Heading  #
 *
 * @module linter/rules/md021-no-multiple-space-closed-atx
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
  return /^#{1,6}\s.*\s#\s*$/.test(line) || /^#{1,6}\s+#\s*$/.test(line);
}

export const md021: LintRule = {
  id: "MD021",
  name: "no-multiple-space-closed-atx",
  description: "Multiple spaces inside hashes on closed ATX style headings",
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

      // Check for multiple spaces after opening hashes
      const openMatch = line.match(/^(#{1,6})(\s{2,})/);
      if (openMatch) {
        diagnostics.push(
          createDiagnostic({
            from: lineInfo.from,
            to: lineInfo.to,
            severity: "warning",
            message: "Multiple spaces after opening hashes in closed ATX heading",
            source: "MD021",
          })
        );
        continue;
      }

      // Check for multiple spaces before closing hashes
      const closeMatch = line.match(/(\s{2,})(#+)\s*$/);
      if (closeMatch) {
        diagnostics.push(
          createDiagnostic({
            from: lineInfo.from,
            to: lineInfo.to,
            severity: "warning",
            message: "Multiple spaces before closing hashes in closed ATX heading",
            source: "MD021",
          })
        );
      }
    }

    return diagnostics;
  },
};
