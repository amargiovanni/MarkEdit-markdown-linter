/**
 * Tests for MD021: no-multiple-space-closed-atx rule.
 *
 * @module tests/unit/rules/md021
 */

import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { md021 } from "../../../src/linter/rules/md021-no-multiple-space-closed-atx";
import { createRuleConfig } from "../../../src/linter/types";

describe("MD021: no-multiple-space-closed-atx", () => {
  describe("rule metadata", () => {
    it("should have correct ID", () => {
      expect(md021.id).toBe("MD021");
    });

    it("should have correct name", () => {
      expect(md021.name).toBe("no-multiple-space-closed-atx");
    });

    it("should have tags", () => {
      expect(md021.tags).toContain("headings");
      expect(md021.tags).toContain("atx_closed");
    });
  });

  describe("check function", () => {
    const defaultConfig = createRuleConfig({ enabled: true });

    it("should not flag properly spaced closed ATX headings", () => {
      const doc = Text.of(["# Heading #", "## Heading 2 ##"]);
      const diagnostics = md021.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should flag closed ATX with multiple spaces at start", () => {
      const doc = Text.of(["#  Heading #"]);
      const diagnostics = md021.check(doc, defaultConfig);
      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics[0]!.message).toContain("Multiple");
    });

    it("should flag closed ATX with multiple spaces at end", () => {
      const doc = Text.of(["# Heading  #"]);
      const diagnostics = md021.check(doc, defaultConfig);
      expect(diagnostics.length).toBeGreaterThan(0);
    });

    it("should not flag regular ATX headings", () => {
      const doc = Text.of(["# Heading", "## Heading 2"]);
      const diagnostics = md021.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should handle empty document", () => {
      const doc = Text.of([""]);
      const diagnostics = md021.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should not flag headings in code blocks", () => {
      const doc = Text.of(["```", "#  Heading  #", "```"]);
      const diagnostics = md021.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });
  });
});
