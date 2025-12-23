/**
 * Tests for MD022: blanks-around-headings rule.
 *
 * @module tests/unit/rules/md022
 */

import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { md022 } from "../../../src/linter/rules/md022-blanks-around-headings";
import { createRuleConfig } from "../../../src/linter/types";

describe("MD022: blanks-around-headings", () => {
  describe("rule metadata", () => {
    it("should have correct ID", () => {
      expect(md022.id).toBe("MD022");
    });

    it("should have correct name", () => {
      expect(md022.name).toBe("blanks-around-headings");
    });

    it("should have tags", () => {
      expect(md022.tags).toContain("headings");
    });
  });

  describe("check function", () => {
    const defaultConfig = createRuleConfig({ enabled: true });

    it("should not flag headings with blank lines around them", () => {
      const doc = Text.of([
        "Some text",
        "",
        "# Heading",
        "",
        "More text",
      ]);
      const diagnostics = md022.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should flag heading without blank line before", () => {
      const doc = Text.of([
        "Some text",
        "# Heading",
        "",
        "More text",
      ]);
      const diagnostics = md022.check(doc, defaultConfig);
      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics[0]!.message).toContain("before");
    });

    it("should flag heading without blank line after", () => {
      const doc = Text.of([
        "Some text",
        "",
        "# Heading",
        "More text",
      ]);
      const diagnostics = md022.check(doc, defaultConfig);
      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics[0]!.message).toContain("after");
    });

    it("should not flag heading at start of document", () => {
      const doc = Text.of([
        "# Heading",
        "",
        "Some text",
      ]);
      const diagnostics = md022.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should not flag heading at end of document", () => {
      const doc = Text.of([
        "Some text",
        "",
        "# Heading",
      ]);
      const diagnostics = md022.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should handle multiple headings", () => {
      const doc = Text.of([
        "# Heading 1",
        "",
        "Text",
        "",
        "## Heading 2",
        "",
        "More text",
      ]);
      const diagnostics = md022.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should flag consecutive headings without blank between", () => {
      const doc = Text.of([
        "# Heading 1",
        "## Heading 2",
        "",
        "Text",
      ]);
      const diagnostics = md022.check(doc, defaultConfig);
      expect(diagnostics.length).toBeGreaterThan(0);
    });

    it("should handle empty document", () => {
      const doc = Text.of([""]);
      const diagnostics = md022.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should not flag headings in code blocks", () => {
      const doc = Text.of([
        "Text",
        "```",
        "# Not a heading",
        "```",
        "More text",
      ]);
      const diagnostics = md022.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });
  });

  describe("fix function", () => {
    const defaultConfig = createRuleConfig({ enabled: true });

    it("should provide fix for missing blank line", () => {
      const doc = Text.of([
        "Some text",
        "# Heading",
        "",
        "More text",
      ]);
      const diagnostics = md022.check(doc, defaultConfig);
      expect(diagnostics.length).toBeGreaterThan(0);

      if (md022.fix) {
        const fix = md022.fix(doc, diagnostics[0]!);
        expect(fix).not.toBeNull();
      }
    });
  });
});
