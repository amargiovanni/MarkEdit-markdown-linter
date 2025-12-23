import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import {
  offsetToLineCol,
  lineColToOffset,
  getLineText,
  getLineCount,
  getLineRange,
} from "../../src/utils/position";

describe("position utilities", () => {
  describe("offsetToLineCol", () => {
    it("converts offset 0 to line 1, column 1", () => {
      const doc = Text.of(["Hello", "World"]);
      const pos = offsetToLineCol(doc, 0);
      expect(pos).toEqual({ line: 1, col: 1 });
    });

    it("handles offset within first line", () => {
      const doc = Text.of(["Hello", "World"]);
      const pos = offsetToLineCol(doc, 3);
      expect(pos).toEqual({ line: 1, col: 4 });
    });

    it("handles offset at start of second line", () => {
      const doc = Text.of(["Hello", "World"]);
      // "Hello\n" = 6 chars (0-5), then "World" starts at 6
      const pos = offsetToLineCol(doc, 6);
      expect(pos).toEqual({ line: 2, col: 1 });
    });

    it("handles offset within second line", () => {
      const doc = Text.of(["Hello", "World"]);
      const pos = offsetToLineCol(doc, 8);
      expect(pos).toEqual({ line: 2, col: 3 });
    });

    it("handles empty document", () => {
      const doc = Text.of([""]);
      const pos = offsetToLineCol(doc, 0);
      expect(pos).toEqual({ line: 1, col: 1 });
    });

    it("handles multiline document", () => {
      const doc = Text.of(["Line 1", "Line 2", "Line 3"]);
      const pos = offsetToLineCol(doc, 14); // Start of Line 3
      expect(pos).toEqual({ line: 3, col: 1 });
    });
  });

  describe("lineColToOffset", () => {
    it("converts line 1, col 1 to offset 0", () => {
      const doc = Text.of(["Hello", "World"]);
      const offset = lineColToOffset(doc, 1, 1);
      expect(offset).toBe(0);
    });

    it("converts position within first line", () => {
      const doc = Text.of(["Hello", "World"]);
      const offset = lineColToOffset(doc, 1, 4);
      expect(offset).toBe(3);
    });

    it("converts position at start of second line", () => {
      const doc = Text.of(["Hello", "World"]);
      const offset = lineColToOffset(doc, 2, 1);
      expect(offset).toBe(6);
    });

    it("clamps column to line length", () => {
      const doc = Text.of(["Hi", "World"]);
      // Line 1 has 2 chars, asking for col 10 should clamp
      const offset = lineColToOffset(doc, 1, 10);
      expect(offset).toBe(2); // End of "Hi"
    });

    it("clamps line number to document bounds", () => {
      const doc = Text.of(["Hello", "World"]);
      const offset = lineColToOffset(doc, 100, 1);
      expect(offset).toBe(doc.length);
    });
  });

  describe("getLineText", () => {
    it("returns text of specified line (1-indexed)", () => {
      const doc = Text.of(["First", "Second", "Third"]);
      expect(getLineText(doc, 1)).toBe("First");
      expect(getLineText(doc, 2)).toBe("Second");
      expect(getLineText(doc, 3)).toBe("Third");
    });

    it("returns empty string for out of bounds line", () => {
      const doc = Text.of(["Hello"]);
      expect(getLineText(doc, 0)).toBe("");
      expect(getLineText(doc, 5)).toBe("");
    });

    it("handles empty lines", () => {
      const doc = Text.of(["Hello", "", "World"]);
      expect(getLineText(doc, 2)).toBe("");
    });
  });

  describe("getLineCount", () => {
    it("returns correct line count", () => {
      expect(getLineCount(Text.of([""]))).toBe(1);
      expect(getLineCount(Text.of(["Hello"]))).toBe(1);
      expect(getLineCount(Text.of(["Hello", "World"]))).toBe(2);
      expect(getLineCount(Text.of(["A", "B", "C", "D"]))).toBe(4);
    });
  });

  describe("getLineRange", () => {
    it("returns start and end offsets for a line", () => {
      const doc = Text.of(["Hello", "World", "Test"]);

      const line1 = getLineRange(doc, 1);
      expect(line1).toEqual({ from: 0, to: 5 });

      const line2 = getLineRange(doc, 2);
      expect(line2).toEqual({ from: 6, to: 11 });

      const line3 = getLineRange(doc, 3);
      expect(line3).toEqual({ from: 12, to: 16 });
    });

    it("returns null for invalid line numbers", () => {
      const doc = Text.of(["Hello"]);
      expect(getLineRange(doc, 0)).toBeNull();
      expect(getLineRange(doc, 5)).toBeNull();
    });
  });
});
