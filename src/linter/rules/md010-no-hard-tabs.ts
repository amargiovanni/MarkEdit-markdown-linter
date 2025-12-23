/**
 * MD010: no-hard-tabs
 *
 * Hard tabs should not be used; use spaces instead.
 *
 * @example
 * // Bad
 * \tIndented with tab
 *
 * @example
 * // Good
 *     Indented with spaces
 *
 * @module linter/rules/md010-no-hard-tabs
 */

import type { Text, ChangeSpec } from "@codemirror/state";
import type { LintRule, RuleConfig, Diagnostic } from "../types";
import { createDiagnostic } from "../types";

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
 * Checks if a line is an indented code block (starts with 4+ spaces).
 */
function isIndentedCodeBlock(line: string): boolean {
  return /^ {4,}/.test(line);
}

export const md010: LintRule = {
  id: "MD010",
  name: "no-hard-tabs",
  description: "Hard tabs should not be used",
  tags: ["whitespace"],
  severity: "error",

  check(doc: Text, config: RuleConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const checkCodeBlocks = (config.options["codeBlocks"] as boolean | undefined) ?? true;
    const lines: string[] = [];

    // Collect all lines
    for (let i = 1; i <= doc.lines; i++) {
      lines.push(doc.line(i).text);
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const lineInfo = doc.line(i + 1);

      // Skip code blocks unless codeBlocks option is false
      if (checkCodeBlocks) {
        if (isInCodeBlock(i, lines) || isIndentedCodeBlock(line)) {
          continue;
        }
      }

      // Find tabs in the line
      let pos = 0;
      for (const char of line) {
        if (char === "\t") {
          diagnostics.push(
            createDiagnostic({
              from: lineInfo.from + pos,
              to: lineInfo.from + pos + 1,
              severity: "error",
              message: "Hard tab character found",
              source: "MD010",
            })
          );
        }
        pos++;
      }
    }

    return diagnostics;
  },

  fix(_doc: Text, diagnostic: Diagnostic): ChangeSpec | null {
    // Replace tab with 4 spaces
    return {
      from: diagnostic.from,
      to: diagnostic.to,
      insert: "    ",
    };
  },
};
