/**
 * Tests for MD003: heading-style rule.
 *
 * @module tests/unit/rules/md003
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Text } from "@codemirror/state";
import { md003 } from "../../../src/linter/rules/md003-heading-style";
import { createRuleConfig } from "../../../src/linter/types";

describe("MD003: heading-style", () => {
  describe("rule metadata", () => {
    it("should have correct ID", () => {
      expect(md003.id).toBe("MD003");
    });

    it("should have correct name", () => {
      expect(md003.name).toBe("heading-style");
    });

    it("should have tags", () => {
      expect(md003.tags).toContain("headings");
    });
  });

  describe("check function", () => {
    const defaultConfig = createRuleConfig({ enabled: true });

    it("should not flag consistent ATX headings", () => {
      const doc = Text.of(["# Heading 1", "## Heading 2", "### Heading 3"]);
      const diagnostics = md003.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should flag inconsistent heading styles", () => {
      const doc = Text.of([
        "# ATX Heading",
        "",
        "Setext Heading",
        "==============",
      ]);
      const diagnostics = md003.check(doc, defaultConfig);
      expect(diagnostics.length).toBeGreaterThan(0);
    });

    it("should not flag ATX headings when style is atx", () => {
      const config = createRuleConfig({
        enabled: true,
        options: { style: "atx" },
      });
      const doc = Text.of(["# Heading 1", "## Heading 2"]);
      const diagnostics = md003.check(doc, config);
      expect(diagnostics).toHaveLength(0);
    });

    it("should handle empty document", () => {
      const doc = Text.of([""]);
      const diagnostics = md003.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should not flag headings in code blocks", () => {
      const doc = Text.of([
        "# Main Heading",
        "",
        "```",
        "# This is a comment in code",
        "```",
      ]);
      const diagnostics = md003.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });
  });
});
