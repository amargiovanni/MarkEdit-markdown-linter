/**
 * MD009: no-trailing-spaces
 *
 * Lines should not have trailing spaces.
 *
 * @example
 * // Bad
 * Some text with trailing spaces
 *
 * @example
 * // Good
 * Some text without trailing spaces
 *
 * @module linter/rules/md009-no-trailing-spaces
 */

import type { Text, ChangeSpec } from "@codemirror/state";
import type { LintRule, RuleConfig, Diagnostic } from "../types";
import { createDiagnostic } from "../types";

export const md009: LintRule = {
  id: "MD009",
  name: "no-trailing-spaces",
  description: "Trailing spaces are not allowed",
  tags: ["whitespace"],
  severity: "error",

  check(doc: Text, config: RuleConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const brSpaces = (config.options["brSpaces"] as number | undefined) ?? 0;

    for (let i = 1; i <= doc.lines; i++) {
      const lineInfo = doc.line(i);
      const line = lineInfo.text;

      // Find trailing whitespace
      const match = /(\s+)$/.exec(line);
      if (match?.[1]) {
        const trailingLength = match[1].length;

        // Allow exactly brSpaces trailing spaces (for hard line breaks)
        if (brSpaces > 0 && trailingLength === brSpaces) {
          continue;
        }

        const from = lineInfo.to - trailingLength;
        const to = lineInfo.to;

        diagnostics.push(
          createDiagnostic({
            from,
            to,
            severity: "error",
            message: `Trailing spaces found (${trailingLength} character${trailingLength > 1 ? "s" : ""})`,
            source: "MD009",
          })
        );
      }
    }

    return diagnostics;
  },

  fix(_doc: Text, diagnostic: Diagnostic, _config: RuleConfig): ChangeSpec | null {
    return {
      from: diagnostic.from,
      to: diagnostic.to,
      insert: "",
    };
  },
};
