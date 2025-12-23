/**
 * Position utilities for line/column calculations.
 *
 * @module utils/position
 */

import type { Text } from "@codemirror/state";

/**
 * Line and column position (1-indexed).
 */
export interface LineCol {
  /** 1-indexed line number */
  readonly line: number;
  /** 1-indexed column number */
  readonly col: number;
}

/**
 * Line range with start and end offsets.
 */
export interface LineRange {
  /** Start offset (inclusive) */
  readonly from: number;
  /** End offset (exclusive of newline) */
  readonly to: number;
}

/**
 * Converts a character offset to line and column position.
 *
 * @param doc - The CodeMirror Text document
 * @param offset - Character offset from document start
 * @returns Line and column (1-indexed)
 */
export function offsetToLineCol(doc: Text, offset: number): LineCol {
  const line = doc.lineAt(offset);
  return {
    line: line.number,
    col: offset - line.from + 1,
  };
}

/**
 * Converts a line and column to character offset.
 *
 * @param doc - The CodeMirror Text document
 * @param line - 1-indexed line number
 * @param col - 1-indexed column number
 * @returns Character offset from document start
 */
export function lineColToOffset(doc: Text, line: number, col: number): number {
  // Clamp line to valid range
  const clampedLine = Math.min(Math.max(1, line), doc.lines);
  const lineInfo = doc.line(clampedLine);

  // If line was out of bounds (above max), return end of document
  if (line > doc.lines) {
    return doc.length;
  }

  // Clamp column to line length
  const lineLength = lineInfo.to - lineInfo.from;
  const clampedCol = Math.min(Math.max(1, col), lineLength + 1);

  return lineInfo.from + clampedCol - 1;
}

/**
 * Gets the text content of a specific line.
 *
 * @param doc - The CodeMirror Text document
 * @param line - 1-indexed line number
 * @returns Line text, or empty string if line is out of bounds
 */
export function getLineText(doc: Text, line: number): string {
  if (line < 1 || line > doc.lines) {
    return "";
  }
  return doc.line(line).text;
}

/**
 * Gets the total number of lines in the document.
 *
 * @param doc - The CodeMirror Text document
 * @returns Number of lines
 */
export function getLineCount(doc: Text): number {
  return doc.lines;
}

/**
 * Gets the start and end offsets for a line.
 *
 * @param doc - The CodeMirror Text document
 * @param line - 1-indexed line number
 * @returns LineRange with from/to, or null if line is out of bounds
 */
export function getLineRange(doc: Text, line: number): LineRange | null {
  if (line < 1 || line > doc.lines) {
    return null;
  }
  const lineInfo = doc.line(line);
  return {
    from: lineInfo.from,
    to: lineInfo.to,
  };
}
