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

// Pre-compiled regex patterns for better performance
const ATX_HEADING_PATTERN = /^(#{1,6})(?:\s|$)/;
const SETEXT_H1_PATTERN = /^=+\s*$/;
const SETEXT_H2_PATTERN = /^-{3,}\s*$/;

/**
 * Extracts heading info from a line.
 * Returns the heading level (1-6) or 0 if not a heading.
 */
function getHeadingLevel(line: string, prevLine: string | null): number {
  // Skip if line has leading whitespace (indented = not a heading in strict MD)
  if (line.startsWith(" ")) {
    return 0;
  }

  // ATX-style headings: # through ######
  const atxMatch = ATX_HEADING_PATTERN.exec(line);
  if (atxMatch?.[1]) {
    return atxMatch[1].length;
  }

  // Setext-style headings: underlined with = or -
  if (prevLine !== null && prevLine.trim().length > 0) {
    if (SETEXT_H1_PATTERN.test(line)) {
      return 1; // h1
    }
    if (SETEXT_H2_PATTERN.test(line)) {
      return 2; // h2
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

    let prevLevel = 0;
    let inCodeBlock = false;
    let prevLineText: string | null = null;

    for (let i = 1; i <= doc.lines; i++) {
      const lineInfo = doc.line(i);
      const line = lineInfo.text;

      // Track code block state - O(n) instead of O(n²)
      if (isCodeFence(line)) {
        inCodeBlock = !inCodeBlock;
        prevLineText = line;
        continue;
      }

      // Skip lines in code blocks
      if (!inCodeBlock) {
        const level = getHeadingLevel(line, prevLineText);

        if (level > 0) {
          // Check for skipped levels
          if (prevLevel > 0 && level > prevLevel + 1) {
            diagnostics.push(
              createDiagnostic({
                from: lineInfo.from,
                to: lineInfo.to,
                severity: "error",
                message: `Heading level should not skip from h${prevLevel} to h${level}`,
                source: "MD001",
              })
            );
          }
          prevLevel = level;
        }
      }

      prevLineText = line;
    }

    return diagnostics;
  },
};
