/**
 * Tests for MD013: line-length rule.
 *
 * @module tests/unit/rules/md013
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Text } from "@codemirror/state";
import { md013 } from "../../../src/linter/rules/md013-line-length";
import { createRuleConfig } from "../../../src/linter/types";

describe("MD013: line-length", () => {
  describe("rule metadata", () => {
    it("should have correct ID", () => {
      expect(md013.id).toBe("MD013");
    });

    it("should have correct name", () => {
      expect(md013.name).toBe("line-length");
    });

    it("should have tags", () => {
      expect(md013.tags).toContain("formatting");
    });

    it("should have info severity by default", () => {
      expect(md013.severity).toBe("info");
    });
  });

  describe("check function", () => {
    const defaultConfig = createRuleConfig({ enabled: true });

    it("should not flag lines within limit", () => {
      const doc = Text.of(["Short line", "Another short line"]);
      const diagnostics = md013.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should flag lines exceeding default limit (80)", () => {
      const longLine = "a".repeat(81);
      const doc = Text.of([longLine]);
      const diagnostics = md013.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0]!.message).toContain("81");
    });

    it("should respect custom line length", () => {
      const config = createRuleConfig({
        enabled: true,
        options: { line_length: 100 },
      });
      const line90 = "a".repeat(90);
      const line101 = "a".repeat(101);

      const doc = Text.of([line90, line101]);
      const diagnostics = md013.check(doc, config);

      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0]!.from).toBe(doc.line(2).from);
    });

    it("should skip code blocks when configured", () => {
      const config = createRuleConfig({
        enabled: true,
        options: { code_blocks: false },
      });
      const longLine = "a".repeat(100);
      const doc = Text.of(["```", longLine, "```"]);
      const diagnostics = md013.check(doc, config);
      expect(diagnostics).toHaveLength(0);
    });

    it("should check code blocks when configured", () => {
      const config = createRuleConfig({
        enabled: true,
        options: { code_blocks: true },
      });
      const longLine = "a".repeat(100);
      const doc = Text.of(["```", longLine, "```"]);
      const diagnostics = md013.check(doc, config);
      expect(diagnostics).toHaveLength(1);
    });

    it("should handle empty document", () => {
      const doc = Text.of([""]);
      const diagnostics = md013.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should exclude URLs from line length", () => {
      const config = createRuleConfig({
        enabled: true,
        options: { line_length: 50 },
      });
      // A line with a long URL should not be flagged
      const doc = Text.of(["See https://example.com/very/long/url/that/exceeds/limit"]);
      const diagnostics = md013.check(doc, config);
      // URL lines are typically excluded
      expect(diagnostics).toHaveLength(0);
    });

    it("should not flag headings by default", () => {
      const config = createRuleConfig({
        enabled: true,
        options: { line_length: 50, headings: false },
      });
      const doc = Text.of(["# This is a very long heading that exceeds the limit"]);
      const diagnostics = md013.check(doc, config);
      expect(diagnostics).toHaveLength(0);
    });
  });
});
