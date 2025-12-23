/**
 * Tests for MD007: ul-indent rule.
 *
 * @module tests/unit/rules/md007
 */

import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { md007 } from "../../../src/linter/rules/md007-ul-indent";
import { createRuleConfig } from "../../../src/linter/types";

describe("MD007: ul-indent", () => {
  describe("rule metadata", () => {
    it("should have correct ID", () => {
      expect(md007.id).toBe("MD007");
    });

    it("should have correct name", () => {
      expect(md007.name).toBe("ul-indent");
    });

    it("should have tags", () => {
      expect(md007.tags).toContain("lists");
      expect(md007.tags).toContain("indentation");
    });
  });

  describe("check function", () => {
    const defaultConfig = createRuleConfig({ enabled: true });

    it("should not flag lists with default 2-space indent", () => {
      const doc = Text.of(["- Item 1", "  - Nested 1", "    - Deep nested"]);
      const diagnostics = md007.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should flag nested lists with wrong indent", () => {
      const doc = Text.of(["- Item 1", "   - Wrong indent"]);
      const diagnostics = md007.check(doc, defaultConfig);
      expect(diagnostics.length).toBeGreaterThan(0);
    });

    it("should respect custom indent option", () => {
      const config = createRuleConfig({
        enabled: true,
        options: { indent: 4 },
      });
      const doc = Text.of(["- Item 1", "    - Nested with 4 spaces"]);
      const diagnostics = md007.check(doc, config);
      expect(diagnostics).toHaveLength(0);
    });

    it("should flag when custom indent is not used", () => {
      const config = createRuleConfig({
        enabled: true,
        options: { indent: 4 },
      });
      const doc = Text.of(["- Item 1", "  - Nested with 2 spaces"]);
      const diagnostics = md007.check(doc, config);
      expect(diagnostics.length).toBeGreaterThan(0);
    });

    it("should handle empty document", () => {
      const doc = Text.of([""]);
      const diagnostics = md007.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should not check list markers in code blocks", () => {
      const doc = Text.of(["- Item", "```", "   - wrong indent in code", "```"]);
      const diagnostics = md007.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should handle flat lists without nesting", () => {
      const doc = Text.of(["- Item 1", "- Item 2", "- Item 3"]);
      const diagnostics = md007.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });
  });
});
