/**
 * Shared utility functions for lint rules.
 *
 * @module linter/rules/utils
 */

/**
 * Checks if a line is a fenced code block delimiter.
 */
export function isCodeFence(line: string): boolean {
  return line.startsWith("```") || line.startsWith("~~~");
}

/**
 * Checks if a line is an indented code block (starts with 4+ spaces).
 */
export function isIndentedCodeBlock(line: string): boolean {
  return /^ {4,}/.test(line);
}
