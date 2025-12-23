/**
 * MD003: heading-style
 *
 * Ensures all headings use a consistent style (ATX or setext).
 *
 * @example
 * // Good (consistent ATX)
 * # Heading 1
 * ## Heading 2
 *
 * @example
 * // Bad (mixed styles)
 * # Heading 1
 *
 * Setext Heading
 * ==============
 *
 * @module linter/rules/md003-heading-style
 */

import type { Text } from "@codemirror/state";
import type { LintRule, RuleConfig, Diagnostic } from "../types";
import { createDiagnostic } from "../types";
import { isCodeFence } from "./utils";

type HeadingStyle = "atx" | "atx_closed" | "setext" | "consistent";

interface HeadingInfo {
  line: number;
  style: "atx" | "setext";
  from: number;
  to: number;
}

export const md003: LintRule = {
  id: "MD003",
  name: "heading-style",
  description: "Heading style should be consistent",
  tags: ["headings"],
  severity: "warning",

  check(doc: Text, config: RuleConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const style = (config.options["style"] as HeadingStyle | undefined) ?? "consistent";
    const lines: string[] = [];

    // Collect all lines
    for (let i = 1; i <= doc.lines; i++) {
      lines.push(doc.line(i).text);
    }

    const headings: HeadingInfo[] = [];
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

      // Check for ATX heading (# style)
      if (/^#{1,6}\s/.test(line)) {
        headings.push({
          line: i + 1,
          style: "atx",
          from: lineInfo.from,
          to: lineInfo.to,
        });
        continue;
      }

      // Check for setext heading (underline style)
      if (i > 0) {
        const prevLine = lines[i - 1]!;
        if (/^=+\s*$/.test(line) && prevLine.trim().length > 0) {
          const prevLineInfo = doc.line(i);
          headings.push({
            line: i,
            style: "setext",
            from: prevLineInfo.from,
            to: lineInfo.to,
          });
          continue;
        }
        if (/^-+\s*$/.test(line) && prevLine.trim().length > 0 && line.length >= 3) {
          const prevLineInfo = doc.line(i);
          headings.push({
            line: i,
            style: "setext",
            from: prevLineInfo.from,
            to: lineInfo.to,
          });
        }
      }
    }

    if (headings.length === 0) {
      return diagnostics;
    }

    // Determine expected style
    let expectedStyle: "atx" | "setext";

    if (style === "consistent") {
      // Use the style of the first heading
      expectedStyle = headings[0]!.style;
    } else if (style === "atx" || style === "atx_closed") {
      expectedStyle = "atx";
    } else {
      expectedStyle = "setext";
    }

    // Check all headings against expected style
    for (const heading of headings) {
      if (heading.style !== expectedStyle) {
        diagnostics.push(
          createDiagnostic({
            from: heading.from,
            to: heading.to,
            severity: "warning",
            message: `Heading style should be ${expectedStyle}, found ${heading.style}`,
            source: "MD003",
          })
        );
      }
    }

    return diagnostics;
  },
};
