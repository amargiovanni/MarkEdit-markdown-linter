import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { md010 } from "../../../src/linter/rules/md010-no-hard-tabs";
import { createRuleConfig } from "../../../src/linter/types";

describe("MD010: no-hard-tabs", () => {
  const config = createRuleConfig({});

  describe("rule metadata", () => {
    it("has correct ID and name", () => {
      expect(md010.id).toBe("MD010");
      expect(md010.name).toBe("no-hard-tabs");
    });

    it("has error severity by default", () => {
      expect(md010.severity).toBe("error");
    });

    it("is tagged as whitespace", () => {
      expect(md010.tags).toContain("whitespace");
    });
  });

  describe("valid documents", () => {
    it("returns no diagnostics for document with spaces only", () => {
      const doc = Text.of(["    indented with spaces", "  more spaces"]);
      const diagnostics = md010.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("returns no diagnostics for empty document", () => {
      const doc = Text.of([""]);
      const diagnostics = md010.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("returns no diagnostics for document without indentation", () => {
      const doc = Text.of(["No indentation", "Plain text"]);
      const diagnostics = md010.check(doc, config);
      expect(diagnostics).toEqual([]);
    });
  });

  describe("invalid documents", () => {
    it("detects tab at start of line", () => {
      const doc = Text.of(["\tIndented with tab"]);
      const diagnostics = md010.check(doc, config);

      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0]?.source).toBe("MD010");
      expect(diagnostics[0]?.severity).toBe("error");
    });

    it("detects tab in middle of line", () => {
      const doc = Text.of(["Text\twith\ttabs"]);
      const diagnostics = md010.check(doc, config);

      expect(diagnostics.length).toBeGreaterThanOrEqual(1);
    });

    it("detects multiple tabs on multiple lines", () => {
      const doc = Text.of(["\tFirst line", "\tSecond line"]);
      const diagnostics = md010.check(doc, config);

      expect(diagnostics).toHaveLength(2);
    });

    it("positions diagnostic at the tab character", () => {
      const doc = Text.of(["\tHello"]);
      const diagnostics = md010.check(doc, config);

      expect(diagnostics).toHaveLength(1);
      const diag = diagnostics[0];
      expect(diag?.from).toBe(0);
      expect(diag?.to).toBe(1);
    });
  });

  describe("code blocks", () => {
    it("allows tabs in fenced code blocks by default", () => {
      const doc = Text.of(["```", "\tcode with tab", "```"]);
      const diagnostics = md010.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("detects tabs in code blocks when codeBlocks option is false", () => {
      const strictConfig = createRuleConfig({ options: { codeBlocks: false } });
      const doc = Text.of(["```", "\tcode with tab", "```"]);
      const diagnostics = md010.check(doc, strictConfig);

      expect(diagnostics).toHaveLength(1);
    });

    it("allows tabs in indented code blocks", () => {
      const doc = Text.of(["Some text", "    \tindented code"]);
      const diagnostics = md010.check(doc, config);
      // Indented code blocks (4 spaces) are treated as code
      expect(diagnostics).toEqual([]);
    });
  });

  describe("fix function", () => {
    it("has a fix function", () => {
      expect(md010.fix).toBeDefined();
    });

    it("replaces tab with spaces", () => {
      const doc = Text.of(["\tHello"]);
      const diagnostics = md010.check(doc, config);
      expect(diagnostics).toHaveLength(1);

      const fix = md010.fix?.(doc, diagnostics[0]!);
      expect(fix).toBeDefined();
      expect(fix).toEqual({
        from: 0,
        to: 1,
        insert: "    ", // 4 spaces by default
      });
    });
  });
});
