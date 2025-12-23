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
import { isCodeFence } from "./utils";

export const md019: LintRule = {
  id: "MD019",
  name: "no-multiple-space-atx",
  description: "Multiple spaces after hash on ATX style heading",
  tags: ["headings"],
  severity: "warning",

  check(doc: Text, _config: RuleConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    let inCodeBlock = false;

    for (let i = 1; i <= doc.lines; i++) {
      const lineInfo = doc.line(i);
      const line = lineInfo.text;

      // Track code block state - O(n) instead of O(n²)
      if (isCodeFence(line)) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      // Skip indented lines
      if (line.startsWith(" ") || line.startsWith("\t")) {
        continue;
      }

      // Skip lines in code blocks
      if (inCodeBlock) {
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

  fix(_doc: Text, diagnostic: Diagnostic, _config: RuleConfig): ChangeSpec | null {
    // Replace multiple spaces with single space
    return {
      from: diagnostic.from,
      to: diagnostic.to,
      insert: " ",
    };
  },
};
