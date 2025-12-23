/**
 * Tests for MD004: ul-style rule.
 *
 * @module tests/unit/rules/md004
 */

import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { md004 } from "../../../src/linter/rules/md004-ul-style";
import { createRuleConfig } from "../../../src/linter/types";

describe("MD004: ul-style", () => {
  describe("rule metadata", () => {
    it("should have correct ID", () => {
      expect(md004.id).toBe("MD004");
    });

    it("should have correct name", () => {
      expect(md004.name).toBe("ul-style");
    });

    it("should have tags", () => {
      expect(md004.tags).toContain("bullet");
      expect(md004.tags).toContain("lists");
    });
  });

  describe("check function", () => {
    const defaultConfig = createRuleConfig({ enabled: true });

    it("should not flag consistent dash style", () => {
      const doc = Text.of(["- Item 1", "- Item 2", "- Item 3"]);
      const diagnostics = md004.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should not flag consistent asterisk style", () => {
      const doc = Text.of(["* Item 1", "* Item 2", "* Item 3"]);
      const diagnostics = md004.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should not flag consistent plus style", () => {
      const doc = Text.of(["+ Item 1", "+ Item 2", "+ Item 3"]);
      const diagnostics = md004.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should flag mixed bullet styles", () => {
      const doc = Text.of(["- Item 1", "* Item 2", "+ Item 3"]);
      const diagnostics = md004.check(doc, defaultConfig);
      expect(diagnostics.length).toBeGreaterThan(0);
    });

    it("should respect dash style option", () => {
      const config = createRuleConfig({
        enabled: true,
        options: { style: "dash" },
      });
      const doc = Text.of(["* Item 1", "* Item 2"]);
      const diagnostics = md004.check(doc, config);
      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics[0]!.message).toContain("dash");
    });

    it("should respect asterisk style option", () => {
      const config = createRuleConfig({
        enabled: true,
        options: { style: "asterisk" },
      });
      const doc = Text.of(["- Item 1", "- Item 2"]);
      const diagnostics = md004.check(doc, config);
      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics[0]!.message).toContain("asterisk");
    });

    it("should handle empty document", () => {
      const doc = Text.of([""]);
      const diagnostics = md004.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should handle nested lists with consistent style", () => {
      const doc = Text.of(["- Item 1", "  - Nested 1", "  - Nested 2", "- Item 2"]);
      const diagnostics = md004.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should not flag list markers in code blocks", () => {
      const doc = Text.of(["- Item", "```", "* code comment", "```", "- Item 2"]);
      const diagnostics = md004.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });
  });
});
