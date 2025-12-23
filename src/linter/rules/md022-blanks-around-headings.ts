/**
 * MD022: blanks-around-headings
 *
 * Headings should be surrounded by blank lines.
 *
 * @example
 * // Good
 * Some text
 *
 * # Heading
 *
 * More text
 *
 * @example
 * // Bad
 * Some text
 * # Heading
 * More text
 *
 * @module linter/rules/md022-blanks-around-headings
 */

import type { Text } from "@codemirror/state";
import type { LintRule, RuleConfig, Diagnostic } from "../types";
import { createDiagnostic } from "../types";
import { isCodeFence } from "./utils";

/**
 * Checks if a line is a blank line.
 */
function isBlankLine(line: string): boolean {
  return line.trim().length === 0;
}

/**
 * Checks if a line is an ATX heading.
 */
function isHeading(line: string): boolean {
  return /^#{1,6}\s/.test(line);
}

export const md022: LintRule = {
  id: "MD022",
  name: "blanks-around-headings",
  description: "Headings should be surrounded by blank lines",
  tags: ["headings", "blank_lines"],
  severity: "warning",

  check(doc: Text, _config: RuleConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const lines: string[] = [];

    // Collect all lines
    for (let i = 1; i <= doc.lines; i++) {
      lines.push(doc.line(i).text);
    }

    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const lineInfo = doc.line(i + 1);

      // Track code block state - O(n) instead of O(n²)
      if (isCodeFence(line)) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      // Skip code blocks
      if (inCodeBlock) {
        continue;
      }

      // Check for ATX heading
      if (!isHeading(line)) {
        continue;
      }

      // Check for blank line before (unless first line)
      if (i > 0) {
        const prevLine = lines[i - 1]!;
        if (!isBlankLine(prevLine) && !isCodeFence(prevLine)) {
          diagnostics.push(
            createDiagnostic({
              from: lineInfo.from,
              to: lineInfo.to,
              severity: "warning",
              message: "Heading should have a blank line before",
              source: "MD022",
            })
          );
        }
      }

      // Check for blank line after (unless last line)
      if (i < lines.length - 1) {
        const nextLine = lines[i + 1]!;
        if (!isBlankLine(nextLine) && !isCodeFence(nextLine)) {
          diagnostics.push(
            createDiagnostic({
              from: lineInfo.from,
              to: lineInfo.to,
              severity: "warning",
              message: "Heading should have a blank line after",
              source: "MD022",
            })
          );
        }
      }
    }

    return diagnostics;
  },

  fix(doc: Text, diagnostic: Diagnostic): { from: number; to: number; insert: string } | null {
    // Find the line with the heading
    const lineNumber = doc.lineAt(diagnostic.from).number;
    const lineInfo = doc.line(lineNumber);

    // Determine if we need to add blank before or after
    if (diagnostic.message.includes("before")) {
      // Insert blank line before the heading
      return {
        from: lineInfo.from,
        to: lineInfo.from,
        insert: "\n",
      };
    } else if (diagnostic.message.includes("after")) {
      // Insert blank line after the heading
      return {
        from: lineInfo.to,
        to: lineInfo.to,
        insert: "\n",
      };
    }

    return null;
  },
};
