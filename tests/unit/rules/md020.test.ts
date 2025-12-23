/**
 * Tests for MD020: no-missing-space-closed-atx rule.
 *
 * @module tests/unit/rules/md020
 */

import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { md020 } from "../../../src/linter/rules/md020-no-missing-space-closed-atx";
import { createRuleConfig } from "../../../src/linter/types";

describe("MD020: no-missing-space-closed-atx", () => {
  describe("rule metadata", () => {
    it("should have correct ID", () => {
      expect(md020.id).toBe("MD020");
    });

    it("should have correct name", () => {
      expect(md020.name).toBe("no-missing-space-closed-atx");
    });

    it("should have tags", () => {
      expect(md020.tags).toContain("headings");
      expect(md020.tags).toContain("atx_closed");
    });
  });

  describe("check function", () => {
    const defaultConfig = createRuleConfig({ enabled: true });

    it("should not flag properly spaced closed ATX headings", () => {
      const doc = Text.of(["# Heading #", "## Heading 2 ##"]);
      const diagnostics = md020.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should flag closed ATX with missing space at start", () => {
      const doc = Text.of(["#Heading #"]);
      const diagnostics = md020.check(doc, defaultConfig);
      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics[0]!.message).toContain("space");
    });

    it("should flag closed ATX with missing space at end", () => {
      const doc = Text.of(["# Heading#"]);
      const diagnostics = md020.check(doc, defaultConfig);
      expect(diagnostics.length).toBeGreaterThan(0);
    });

    it("should not flag regular ATX headings", () => {
      const doc = Text.of(["# Heading", "## Heading 2"]);
      const diagnostics = md020.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should handle empty document", () => {
      const doc = Text.of([""]);
      const diagnostics = md020.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should not flag headings in code blocks", () => {
      const doc = Text.of(["```", "#Heading#", "```"]);
      const diagnostics = md020.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });
  });
});
