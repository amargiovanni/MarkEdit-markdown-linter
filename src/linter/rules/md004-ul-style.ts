/**
 * MD004: ul-style
 *
 * Unordered list style should be consistent.
 *
 * @example
 * // Good (consistent dash)
 * - Item 1
 * - Item 2
 *
 * @example
 * // Bad (mixed styles)
 * - Item 1
 * * Item 2
 * + Item 3
 *
 * @module linter/rules/md004-ul-style
 */

import type { Text } from "@codemirror/state";
import type { LintRule, RuleConfig, Diagnostic } from "../types";
import { createDiagnostic } from "../types";
import { isCodeFence } from "./utils";

type BulletStyle = "dash" | "asterisk" | "plus" | "consistent";

interface ListItemInfo {
  line: number;
  style: "dash" | "asterisk" | "plus";
  from: number;
  to: number;
}

/**
 * Detects the bullet style of a line.
 */
function detectBulletStyle(line: string): "dash" | "asterisk" | "plus" | null {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("- ")) return "dash";
  if (trimmed.startsWith("* ")) return "asterisk";
  if (trimmed.startsWith("+ ")) return "plus";
  return null;
}

export const md004: LintRule = {
  id: "MD004",
  name: "ul-style",
  description: "Unordered list style should be consistent",
  tags: ["bullet", "lists"],
  severity: "warning",

  check(doc: Text, config: RuleConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const style = (config.options["style"] as BulletStyle | undefined) ?? "consistent";
    const lines: string[] = [];

    // Collect all lines
    for (let i = 1; i <= doc.lines; i++) {
      lines.push(doc.line(i).text);
    }

    const listItems: ListItemInfo[] = [];
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const lineInfo = doc.line(i + 1);

      // Track code block state - O(n) instead of O(n²)
      if (isCodeFence(line)) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      // Skip code blocks
      if (inCodeBlock) {
        continue;
      }

      const bulletStyle = detectBulletStyle(line);
      if (bulletStyle) {
        listItems.push({
          line: i + 1,
          style: bulletStyle,
          from: lineInfo.from,
          to: lineInfo.to,
        });
      }
    }

    if (listItems.length === 0) {
      return diagnostics;
    }

    // Determine expected style
    let expectedStyle: "dash" | "asterisk" | "plus";

    if (style === "consistent") {
      expectedStyle = listItems[0]!.style;
    } else {
      expectedStyle = style;
    }

    // Check all list items against expected style
    for (const item of listItems) {
      if (item.style !== expectedStyle) {
        diagnostics.push(
          createDiagnostic({
            from: item.from,
            to: item.to,
            severity: "warning",
            message: `List style should be ${expectedStyle}, found ${item.style}`,
            source: "MD004",
          })
        );
      }
    }

    return diagnostics;
  },
};
