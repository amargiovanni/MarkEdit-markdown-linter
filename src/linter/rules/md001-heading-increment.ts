/**
 * MD001: heading-increment
 *
 * Headings should only increment by one level at a time.
 *
 * @example
 * // Bad
 * # Heading 1
 * ### Heading 3  // Skips level 2
 *
 * @example
 * // Good
 * # Heading 1
 * ## Heading 2
 * ### Heading 3
 *
 * @module linter/rules/md001-heading-increment
 */

import type { Text } from "@codemirror/state";
import type { LintRule, RuleConfig, Diagnostic } from "../types";
import { createDiagnostic } from "../types";
import { isCodeFence } from "./utils";

/**
 * Extracts heading info from a line.
 * Returns the heading level (1-6) or 0 if not a heading.
 */
function getHeadingLevel(line: string, lineNum: number, lines: string[]): number {
  const trimmed = line.trimStart();

  // Skip if line has leading whitespace (indented = not a heading in strict MD)
  if (line !== trimmed && line.startsWith(" ")) {
    return 0;
  }

  // ATX-style headings: # through ######
  const atxMatch = /^(#{1,6})(?:\s|$)/.exec(line);
  if (atxMatch?.[1]) {
    return atxMatch[1].length;
  }

  // Setext-style headings: underlined with = or -
  if (lineNum > 0) {
    const prevLine = lines[lineNum - 1];
    if (prevLine && prevLine.trim().length > 0) {
      if (/^=+\s*$/.test(line)) {
        return 1; // h1
      }
      if (/^-+\s*$/.test(line) && line.length >= 3) {
        return 2; // h2
      }
    }
  }

  return 0;
}

export const md001: LintRule = {
  id: "MD001",
  name: "heading-increment",
  description: "Heading levels should only increment by one level at a time",
  tags: ["headings"],
  severity: "error",

  check(doc: Text, _config: RuleConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const lines: string[] = [];

    // Collect all lines
    for (let i = 1; i <= doc.lines; i++) {
      lines.push(doc.line(i).text);
    }

    let prevLevel = 0;
    let offset = 0;
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const lineLength = line.length;

      // Track code block state - O(n) instead of O(n²)
      if (isCodeFence(line)) {
        inCodeBlock = !inCodeBlock;
        offset += lineLength + 1;
        continue;
      }

      // Skip lines in code blocks
      if (!inCodeBlock) {
        const level = getHeadingLevel(line, i, lines);

        if (level > 0) {
          // Check for skipped levels
          if (prevLevel > 0 && level > prevLevel + 1) {
            diagnostics.push(
              createDiagnostic({
                from: offset,
                to: offset + lineLength,
                severity: "error",
                message: `Heading level should not skip from h${prevLevel} to h${level}`,
                source: "MD001",
              })
            );
          }
          prevLevel = level;
        }
      }

      // Move offset past this line (including newline)
      offset += lineLength + 1;
    }

    return diagnostics;
  },
};
