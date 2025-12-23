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

// Pre-compiled regex patterns for better performance
const ATX_HEADING_PATTERN = /^#{1,6}\s/;
const SETEXT_H1_PATTERN = /^=+\s*$/;
const SETEXT_H2_PATTERN = /^-{3,}\s*$/;

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

    const headings: HeadingInfo[] = [];
    let inCodeBlock = false;
    let prevLineText: string | null = null;
    let prevLineInfo: { from: number; to: number } | null = null;

    for (let i = 1; i <= doc.lines; i++) {
      const lineInfo = doc.line(i);
      const line = lineInfo.text;

      // Track code block state - O(n) instead of O(n²)
      if (isCodeFence(line)) {
        inCodeBlock = !inCodeBlock;
        prevLineText = line;
        prevLineInfo = { from: lineInfo.from, to: lineInfo.to };
        continue;
      }

      // Skip code blocks
      if (inCodeBlock) {
        prevLineText = line;
        prevLineInfo = { from: lineInfo.from, to: lineInfo.to };
        continue;
      }

      // Check for ATX heading (# style)
      if (ATX_HEADING_PATTERN.test(line)) {
        headings.push({
          line: i,
          style: "atx",
          from: lineInfo.from,
          to: lineInfo.to,
        });
        prevLineText = line;
        prevLineInfo = { from: lineInfo.from, to: lineInfo.to };
        continue;
      }

      // Check for setext heading (underline style)
      if (prevLineText !== null && prevLineText.trim().length > 0 && prevLineInfo !== null) {
        if (SETEXT_H1_PATTERN.test(line)) {
          headings.push({
            line: i - 1,
            style: "setext",
            from: prevLineInfo.from,
            to: lineInfo.to,
          });
        } else if (SETEXT_H2_PATTERN.test(line)) {
          headings.push({
            line: i - 1,
            style: "setext",
            from: prevLineInfo.from,
            to: lineInfo.to,
          });
        }
      }

      prevLineText = line;
      prevLineInfo = { from: lineInfo.from, to: lineInfo.to };
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
