/**
 * MD014: commands-show-output
 *
 * Dollar signs used before commands without showing output.
 * If every line in a code block starts with $, the $ characters are unnecessary.
 *
 * @example
 * // Good - shows output
 * ```bash
 * $ echo hello
 * hello
 * ```
 *
 * @example
 * // Bad - no output shown
 * ```bash
 * $ echo hello
 * $ ls -la
 * ```
 *
 * @module linter/rules/md014-commands-show-output
 */

import type { Text } from "@codemirror/state";
import type { LintRule, RuleConfig, Diagnostic } from "../types";
import { createDiagnostic } from "../types";

interface CodeBlock {
  startLine: number;
  endLine: number;
  from: number;
  to: number;
  lines: string[];
}

/**
 * Finds all fenced code blocks in the document.
 */
function findCodeBlocks(doc: Text): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const lines: string[] = [];

  for (let i = 1; i <= doc.lines; i++) {
    lines.push(doc.line(i).text);
  }

  let inBlock = false;
  let blockStart = 0;
  let blockStartPos = 0;
  let currentLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const lineInfo = doc.line(i + 1);

    if (line.startsWith("```") || line.startsWith("~~~")) {
      if (!inBlock) {
        inBlock = true;
        blockStart = i + 1;
        blockStartPos = lineInfo.from;
        currentLines = [];
      } else {
        blocks.push({
          startLine: blockStart,
          endLine: i + 1,
          from: blockStartPos,
          to: lineInfo.to,
          lines: currentLines,
        });
        inBlock = false;
        currentLines = [];
      }
    } else if (inBlock) {
      currentLines.push(line);
    }
  }

  return blocks;
}

/**
 * Checks if a line looks like a shell command with $ prefix.
 */
function isCommandLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("$ ");
}

export const md014: LintRule = {
  id: "MD014",
  name: "commands-show-output",
  description: "Dollar signs used before commands without showing output",
  tags: ["code"],
  severity: "info",

  check(doc: Text, _config: RuleConfig): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const codeBlocks = findCodeBlocks(doc);

    for (const block of codeBlocks) {
      // Skip empty blocks
      if (block.lines.length === 0) {
        continue;
      }

      // Filter out empty lines
      const nonEmptyLines = block.lines.filter((line) => line.trim().length > 0);

      if (nonEmptyLines.length === 0) {
        continue;
      }

      // Check if ALL non-empty lines start with $
      const allCommands = nonEmptyLines.every((line) => isCommandLine(line));

      if (allCommands) {
        diagnostics.push(
          createDiagnostic({
            from: block.from,
            to: block.to,
            severity: "info",
            message:
              "All command lines start with $ but no output is shown. Consider removing $ or showing command output.",
            source: "MD014",
          })
        );
      }
    }

    return diagnostics;
  },
};
