/**
 * MD019: no-multiple-space-atx
 *
 * ATX-style headings should have only one space after the hash characters.
 *
 * @example
 * // Bad
 * #  Heading
 *
 * @example
 * // Good
 * # Heading
 *
 * @module linter/rules/md019-no-multiple-space-atx
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

export const md019: LintRule = {
  id: "MD019",
  name: "no-multiple-space-atx",
  description: "Multiple spaces after hash on ATX style heading",
  tags: ["headings"],
  severity: "warning",

  check(doc: Text, _config: RuleConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const lines: string[] = [];

    // Collect all lines
    for (let i = 1; i <= doc.lines; i++) {
      lines.push(doc.line(i).text);
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const lineInfo = doc.line(i + 1);

      // Skip indented lines
      if (line.startsWith(" ") || line.startsWith("\t")) {
        continue;
      }

      // Skip lines in code blocks
      if (isInCodeBlock(i, lines)) {
        continue;
      }

      // Match ATX heading with multiple spaces after #
      // Pattern: 1-6 hashes followed by 2+ spaces, then content
      const match = /^(#{1,6})( {2,})(\S)/.exec(line);
      if (match?.[1] && match[2] && match[3]) {
        const hashCount = match[1].length;
        const spaceCount = match[2].length;

        diagnostics.push(
          createDiagnostic({
            from: lineInfo.from + hashCount,
            to: lineInfo.from + hashCount + spaceCount,
            severity: "warning",
            message: `Multiple spaces after hash${hashCount > 1 ? "es" : ""} in ATX heading (found ${spaceCount}, expected 1)`,
            source: "MD019",
          })
        );
      }
    }

    return diagnostics;
  },

  fix(_doc: Text, diagnostic: Diagnostic): ChangeSpec | null {
    // Replace multiple spaces with single space
    return {
      from: diagnostic.from,
      to: diagnostic.to,
      insert: " ",
    };
  },
};
