/**
 * MD013: line-length
 *
 * Lines should not exceed a configured length.
 *
 * @example
 * // Good (lines under 80 chars)
 * Short line here.
 *
 * @example
 * // Bad (line exceeds 80 chars)
 * This is a very long line that goes on and on and exceeds the maximum allowed line length.
 *
 * @module linter/rules/md013-line-length
 */

import type { Text } from "@codemirror/state";
import type { LintRule, RuleConfig, Diagnostic } from "../types";
import { createDiagnostic } from "../types";
import { isCodeFence } from "./utils";

const DEFAULT_LINE_LENGTH = 80;

// Pre-compiled regex patterns for better performance
const URL_PATTERN = /https?:\/\/\S+/;
const HEADING_PATTERN = /^#{1,6}\s/;

/**
 * Checks if a line contains a URL.
 */
function containsUrl(line: string): boolean {
  return URL_PATTERN.test(line);
}

/**
 * Checks if a line is a heading.
 */
function isHeading(line: string): boolean {
  return HEADING_PATTERN.test(line);
}

export const md013: LintRule = {
  id: "MD013",
  name: "line-length",
  description: "Line length should not exceed the configured limit",
  tags: ["formatting"],
  severity: "info",

  check(doc: Text, config: RuleConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const lineLength =
      (config.options["line_length"] as number | undefined) ?? DEFAULT_LINE_LENGTH;
    const checkCodeBlocks = (config.options["code_blocks"] as boolean | undefined) ?? true;
    const checkHeadings = (config.options["headings"] as boolean | undefined) ?? true;

    let inCodeBlock = false;

    for (let i = 1; i <= doc.lines; i++) {
      const lineInfo = doc.line(i);
      const line = lineInfo.text;

      // Track code block state - O(n) instead of O(n²)
      if (isCodeFence(line)) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      // Skip empty lines
      if (line.length === 0) {
        continue;
      }

      // Skip code blocks if configured
      if (inCodeBlock && !checkCodeBlocks) {
        continue;
      }

      // Skip headings if configured
      if (!checkHeadings && isHeading(line)) {
        continue;
      }

      // Skip lines with URLs (they often can't be broken)
      if (containsUrl(line)) {
        continue;
      }

      // Check line length
      if (line.length > lineLength) {
        diagnostics.push(
          createDiagnostic({
            from: lineInfo.from,
            to: lineInfo.to,
            severity: "info",
            message: `Line length is ${line.length}, expected ${lineLength} or less`,
            source: "MD013",
          })
        );
      }
    }

    return diagnostics;
  },
};
