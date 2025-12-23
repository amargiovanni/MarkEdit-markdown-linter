/**
 * MD005: list-indent
 *
 * Inconsistent indentation for list items at the same level.
 *
 * @example
 * // Good
 * - Item 1
 * - Item 2
 *   - Nested item
 *
 * @example
 * // Bad
 * - Item 1
 *  - Item 2 (wrong indent)
 *
 * @module linter/rules/md005-list-indent
 */

import type { Text } from "@codemirror/state";
import type { LintRule, RuleConfig, Diagnostic } from "../types";
import { createDiagnostic } from "../types";

interface ListItemInfo {
  line: number;
  indent: number;
  from: number;
  to: number;
}

/**
 * Checks if a line is inside a fenced code block.
 */
function isInCodeBlock(lineIndex: number, lines: string[]): boolean {
  let inCode = false;
  for (let i = 0; i < lineIndex; i++) {
    const line = lines[i];
    if (line?.startsWith("```") || line?.startsWith("~~~")) {
      inCode = !inCode;
    }
  }
  return inCode;
}

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

export const md005: LintRule = {
  id: "MD005",
  name: "list-indent",
  description: "Inconsistent indentation for list items at the same level",
  tags: ["lists", "indentation"],
  severity: "warning",

  check(doc: Text, _config: RuleConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const lines: string[] = [];

    // Collect all lines
    for (let i = 1; i <= doc.lines; i++) {
      lines.push(doc.line(i).text);
    }

    const listItems: ListItemInfo[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const lineInfo = doc.line(i + 1);

      // Skip code blocks
      if (isInCodeBlock(i, lines)) {
        continue;
      }

      if (isUnorderedListItem(line)) {
        listItems.push({
          line: i + 1,
          indent: getIndent(line),
          from: lineInfo.from,
          to: lineInfo.to,
        });
      }
    }

    if (listItems.length <= 1) {
      return diagnostics;
    }

    // Group list items by indent level and count occurrences
    const indentCounts = new Map<number, number>();
    for (const item of listItems) {
      indentCounts.set(item.indent, (indentCounts.get(item.indent) ?? 0) + 1);
    }

    // Find the most common indent at each rough level (0, ~2, ~4, etc.)
    // Group indents that are close together (within 1-2 spaces)
    const sortedIndents = Array.from(indentCounts.keys()).sort((a, b) => a - b);

    // Build expected indent levels based on most common values
    const expectedLevels: number[] = [];
    for (const indent of sortedIndents) {
      // Check if this indent is close to an existing expected level
      let foundClose = false;
      for (const expected of expectedLevels) {
        if (Math.abs(indent - expected) <= 2) {
          foundClose = true;
          break;
        }
      }
      if (!foundClose) {
        // This is a new level - use the most common indent at this rough level
        expectedLevels.push(indent);
      }
    }

    // Now check each item - if its indent is close to an expected level but not exact, flag it
    for (const item of listItems) {
      // Find the closest expected level
      let closestExpected = expectedLevels[0]!;
      let minDiff = Math.abs(item.indent - closestExpected);

      for (const expected of expectedLevels) {
        const diff = Math.abs(item.indent - expected);
        if (diff < minDiff) {
          minDiff = diff;
          closestExpected = expected;
        }
      }

      // If close but not exact, flag it
      if (minDiff > 0 && minDiff <= 2) {
        // Check if the closest level is more common than this indent
        const closestCount = indentCounts.get(closestExpected) ?? 0;
        const thisCount = indentCounts.get(item.indent) ?? 0;

        if (closestCount > thisCount) {
          diagnostics.push(
            createDiagnostic({
              from: item.from,
              to: item.to,
              severity: "warning",
              message: `List item indent ${item.indent} doesn't match expected ${closestExpected}`,
              source: "MD005",
            })
          );
        }
      }
    }

    return diagnostics;
  },
};
