/**
 * Tests for MD005: list-indent rule.
 *
 * @module tests/unit/rules/md005
 */

import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { md005 } from "../../../src/linter/rules/md005-list-indent";
import { createRuleConfig } from "../../../src/linter/types";

describe("MD005: list-indent", () => {
  describe("rule metadata", () => {
    it("should have correct ID", () => {
      expect(md005.id).toBe("MD005");
    });

    it("should have correct name", () => {
      expect(md005.name).toBe("list-indent");
    });

    it("should have tags", () => {
      expect(md005.tags).toContain("lists");
      expect(md005.tags).toContain("indentation");
    });
  });

  describe("check function", () => {
    const defaultConfig = createRuleConfig({ enabled: true });

    it("should not flag properly indented lists", () => {
      const doc = Text.of(["- Item 1", "- Item 2", "- Item 3"]);
      const diagnostics = md005.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should not flag consistently indented nested lists", () => {
      const doc = Text.of(["- Item 1", "  - Nested 1", "  - Nested 2", "- Item 2"]);
      const diagnostics = md005.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should flag inconsistent indentation at same level", () => {
      const doc = Text.of(["- Item 1", " - Item 2", "- Item 3"]);
      const diagnostics = md005.check(doc, defaultConfig);
      expect(diagnostics.length).toBeGreaterThan(0);
    });

    it("should handle empty document", () => {
      const doc = Text.of([""]);
      const diagnostics = md005.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should not flag ordered lists", () => {
      const doc = Text.of(["1. Item 1", "2. Item 2", "3. Item 3"]);
      const diagnostics = md005.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should not flag list markers in code blocks", () => {
      const doc = Text.of(["- Item", "```", " - bad indent in code", "```", "- Item 2"]);
      const diagnostics = md005.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });
  });
});
