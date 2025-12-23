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
import { isCodeFence, isIndentedCodeBlock } from "./utils";

export const md010: LintRule = {
  id: "MD010",
  name: "no-hard-tabs",
  description: "Hard tabs should not be used",
  tags: ["whitespace"],
  severity: "error",

  check(doc: Text, config: RuleConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const checkCodeBlocks = (config.options["codeBlocks"] as boolean | undefined) ?? true;

    // Track code block state inline - O(n) instead of O(n²)
    let inCodeBlock = false;

    for (let i = 1; i <= doc.lines; i++) {
      const lineInfo = doc.line(i);
      const line = lineInfo.text;

      // Toggle code block state on fence lines
      if (isCodeFence(line)) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      // Skip code blocks unless codeBlocks option is false
      if (checkCodeBlocks) {
        if (inCodeBlock || isIndentedCodeBlock(line)) {
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

  fix(_doc: Text, diagnostic: Diagnostic, _config: RuleConfig): ChangeSpec | null {
    // Replace tab with 4 spaces
    return {
      from: diagnostic.from,
      to: diagnostic.to,
      insert: "    ",
    };
  },
};
