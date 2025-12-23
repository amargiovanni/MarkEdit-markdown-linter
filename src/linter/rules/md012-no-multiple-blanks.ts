/**
 * MD012: no-multiple-blanks
 *
 * Multiple consecutive blank lines should not be used.
 *
 * @example
 * // Bad
 * Line 1
 *
 *
 * Line 2
 *
 * @example
 * // Good
 * Line 1
 *
 * Line 2
 *
 * @module linter/rules/md012-no-multiple-blanks
 */

import type { Text, ChangeSpec } from "@codemirror/state";
import type { LintRule, RuleConfig, Diagnostic } from "../types";
import { createDiagnostic } from "../types";

export const md012: LintRule = {
  id: "MD012",
  name: "no-multiple-blanks",
  description: "Multiple consecutive blank lines should not be used",
  tags: ["whitespace"],
  severity: "warning",

  check(doc: Text, config: RuleConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const maximum = (config.options["maximum"] as number | undefined) ?? 1;

    let consecutiveBlanks = 0;
    let blankStartOffset = 0;

    for (let i = 1; i <= doc.lines; i++) {
      const lineInfo = doc.line(i);
      const line = lineInfo.text;

      if (line.trim() === "") {
        if (consecutiveBlanks === 0) {
          blankStartOffset = lineInfo.from;
        }
        consecutiveBlanks++;
      } else {
        if (consecutiveBlanks > maximum) {
          diagnostics.push(
            createDiagnostic({
              from: blankStartOffset,
              to: lineInfo.from - 1, // End before current line's newline
              severity: "warning",
              message: `Multiple consecutive blank lines (found ${consecutiveBlanks}, maximum allowed ${maximum})`,
              source: "MD012",
            })
          );
        }
        consecutiveBlanks = 0;
      }
    }

    // Handle trailing blanks at end of document
    if (consecutiveBlanks > maximum) {
      diagnostics.push(
        createDiagnostic({
          from: blankStartOffset,
          to: doc.length,
          severity: "warning",
          message: `Multiple consecutive blank lines (found ${consecutiveBlanks}, maximum allowed ${maximum})`,
          source: "MD012",
        })
      );
    }

    return diagnostics;
  },

  fix(doc: Text, diagnostic: Diagnostic, config: RuleConfig): ChangeSpec | null {
    // Replace multiple blank lines with maximum allowed blank lines
    const maximum = (config.options["maximum"] as number | undefined) ?? 1;

    // Find the first blank line in the range
    const lineStart = doc.lineAt(diagnostic.from);

    // Keep maximum blank lines, remove the rest
    // A blank line is represented by a newline character
    const blankLines = "\n".repeat(maximum);

    return {
      from: lineStart.from,
      to: diagnostic.to,
      insert: blankLines,
    };
  },
};
