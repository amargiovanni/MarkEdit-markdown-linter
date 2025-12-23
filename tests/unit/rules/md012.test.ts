import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { md012 } from "../../../src/linter/rules/md012-no-multiple-blanks";
import { createRuleConfig } from "../../../src/linter/types";

describe("MD012: no-multiple-blanks", () => {
  const config = createRuleConfig({});

  describe("rule metadata", () => {
    it("has correct ID and name", () => {
      expect(md012.id).toBe("MD012");
      expect(md012.name).toBe("no-multiple-blanks");
    });

    it("has warning severity by default", () => {
      expect(md012.severity).toBe("warning");
    });

    it("is tagged as whitespace", () => {
      expect(md012.tags).toContain("whitespace");
    });
  });

  describe("valid documents", () => {
    it("returns no diagnostics for single blank lines", () => {
      const doc = Text.of(["Line 1", "", "Line 2", "", "Line 3"]);
      const diagnostics = md012.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("returns no diagnostics for no blank lines", () => {
      const doc = Text.of(["Line 1", "Line 2", "Line 3"]);
      const diagnostics = md012.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("returns no diagnostics for empty document", () => {
      const doc = Text.of([""]);
      const diagnostics = md012.check(doc, config);
      expect(diagnostics).toEqual([]);
    });
  });

  describe("invalid documents", () => {
    it("detects two consecutive blank lines", () => {
      const doc = Text.of(["Line 1", "", "", "Line 2"]);
      const diagnostics = md012.check(doc, config);

      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0]?.source).toBe("MD012");
      expect(diagnostics[0]?.severity).toBe("warning");
    });

    it("detects three consecutive blank lines", () => {
      const doc = Text.of(["Line 1", "", "", "", "Line 2"]);
      const diagnostics = md012.check(doc, config);

      expect(diagnostics.length).toBeGreaterThanOrEqual(1);
    });

    it("detects multiple groups of consecutive blank lines", () => {
      const doc = Text.of(["Line 1", "", "", "Line 2", "", "", "Line 3"]);
      const diagnostics = md012.check(doc, config);

      expect(diagnostics).toHaveLength(2);
    });
  });

  describe("maximum option", () => {
    it("allows configured number of consecutive blanks", () => {
      const configMax2 = createRuleConfig({ options: { maximum: 2 } });
      const doc = Text.of(["Line 1", "", "", "Line 2"]);
      const diagnostics = md012.check(doc, configMax2);

      expect(diagnostics).toEqual([]);
    });

    it("detects exceeding configured maximum", () => {
      const configMax2 = createRuleConfig({ options: { maximum: 2 } });
      const doc = Text.of(["Line 1", "", "", "", "Line 2"]);
      const diagnostics = md012.check(doc, configMax2);

      expect(diagnostics).toHaveLength(1);
    });
  });

  describe("fix function", () => {
    it("has a fix function", () => {
      expect(md012.fix).toBeDefined();
    });

    it("removes extra blank lines", () => {
      const doc = Text.of(["Line 1", "", "", "Line 2"]);
      const diagnostics = md012.check(doc, config);
      expect(diagnostics).toHaveLength(1);

      const fix = md012.fix?.(doc, diagnostics[0]!);
      expect(fix).toBeDefined();
    });
  });
});
