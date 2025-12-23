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

const DEFAULT_LINE_LENGTH = 80;

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
 * Checks if a line contains a URL.
 */
function containsUrl(line: string): boolean {
  return /https?:\/\/\S+/.test(line);
}

/**
 * Checks if a line is a heading.
 */
function isHeading(line: string): boolean {
  return /^#{1,6}\s/.test(line);
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

    const lines: string[] = [];

    // Collect all lines
    for (let i = 1; i <= doc.lines; i++) {
      lines.push(doc.line(i).text);
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const lineInfo = doc.line(i + 1);

      // Skip empty lines
      if (line.length === 0) {
        continue;
      }

      // Skip code blocks if configured
      const inCodeBlock = isInCodeBlock(i, lines);
      if (inCodeBlock && !checkCodeBlocks) {
        continue;
      }

      // Skip code fence lines themselves
      if (line.startsWith("```") || line.startsWith("~~~")) {
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
