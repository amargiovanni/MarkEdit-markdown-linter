/**
 * MD018: no-missing-space-atx
 *
 * ATX-style headings require a space after the hash characters.
 *
 * @example
 * // Bad
 * #Heading
 *
 * @example
 * // Good
 * # Heading
 *
 * @module linter/rules/md018-no-missing-space-atx
 */

import type { Text, ChangeSpec } from "@codemirror/state";
import type { LintRule, RuleConfig, Diagnostic } from "../types";
import { createDiagnostic } from "../types";
import { isCodeFence } from "./utils";

export const md018: LintRule = {
  id: "MD018",
  name: "no-missing-space-atx",
  description: "No space after hash on ATX style heading",
  tags: ["headings"],
  severity: "error",

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

      // Match ATX heading without space after #
      // Pattern: 1-6 hashes followed immediately by non-space, non-# character
      const match = /^(#{1,6})([^\s#])/.exec(line);
      if (match?.[1] && match[2]) {
        const hashCount = match[1].length;

        diagnostics.push(
          createDiagnostic({
            from: lineInfo.from,
            to: lineInfo.from + hashCount + 1,
            severity: "error",
            message: `No space after ${hashCount} hash character${hashCount > 1 ? "s" : ""} in ATX heading`,
            source: "MD018",
          })
        );
      }
    }

    return diagnostics;
  },

  fix(doc: Text, diagnostic: Diagnostic, _config: RuleConfig): ChangeSpec | null {
    // Find where to insert the space (after the # characters)
    const lineInfo = doc.lineAt(diagnostic.from);
    const line = lineInfo.text;
    const match = /^(#{1,6})/.exec(line);

    if (match?.[1]) {
      const insertPos = lineInfo.from + match[1].length;
      return {
        from: insertPos,
        to: insertPos,
        insert: " ",
      };
    }

    return null;
  },
};
