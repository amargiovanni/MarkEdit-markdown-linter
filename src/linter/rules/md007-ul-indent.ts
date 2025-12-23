/**
 * MD007: ul-indent
 *
 * Unordered list indentation should use the configured number of spaces.
 *
 * @example
 * // Good (2-space indent)
 * - Item 1
 *   - Nested item
 *
 * @example
 * // Bad (3-space indent when 2 expected)
 * - Item 1
 *    - Nested item
 *
 * @module linter/rules/md007-ul-indent
 */

import type { Text } from "@codemirror/state";
import type { LintRule, RuleConfig, Diagnostic } from "../types";
import { createDiagnostic } from "../types";
import { isCodeFence } from "./utils";

const DEFAULT_INDENT = 2;

/**
 * Checks if a line is an unordered list item.
 */
function isUnorderedListItem(line: string): boolean {
  const trimmed = line.trimStart();
  return (
    trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("+ ")
  );
}

/**
 * Gets the indentation level of a line.
 */
function getIndent(line: string): number {
  const match = line.match(/^(\s*)/);
  return match ? match[1]!.length : 0;
}

export const md007: LintRule = {
  id: "MD007",
  name: "ul-indent",
  description: "Unordered list indentation should be consistent",
  tags: ["lists", "indentation"],
  severity: "warning",

  check(doc: Text, config: RuleConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const expectedIndent =
      (config.options["indent"] as number | undefined) ?? DEFAULT_INDENT;
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

      if (!isUnorderedListItem(line)) {
        continue;
      }

      const indent = getIndent(line);

      // Skip top-level items (indent 0)
      if (indent === 0) {
        continue;
      }

      // Check if indent is a multiple of expected indent
      if (indent % expectedIndent !== 0) {
        const nearestValid = Math.round(indent / expectedIndent) * expectedIndent;
        diagnostics.push(
          createDiagnostic({
            from: lineInfo.from,
            to: lineInfo.to,
            severity: "warning",
            message: `List indent ${indent} is not a multiple of ${expectedIndent}, expected ${nearestValid}`,
            source: "MD007",
          })
        );
      }
    }

    return diagnostics;
  },
};
