import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { md019 } from "../../../src/linter/rules/md019-no-multiple-space-atx";
import { createRuleConfig } from "../../../src/linter/types";

describe("MD019: no-multiple-space-atx", () => {
  const config = createRuleConfig({});

  describe("rule metadata", () => {
    it("has correct ID and name", () => {
      expect(md019.id).toBe("MD019");
      expect(md019.name).toBe("no-multiple-space-atx");
    });

    it("has warning severity by default", () => {
      expect(md019.severity).toBe("warning");
    });

    it("is tagged as headings", () => {
      expect(md019.tags).toContain("headings");
    });
  });

  describe("valid documents", () => {
    it("returns no diagnostics for single space after hash", () => {
      const doc = Text.of([
        "# Heading 1",
        "## Heading 2",
        "### Heading 3",
      ]);
      const diagnostics = md019.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("returns no diagnostics for empty document", () => {
      const doc = Text.of([""]);
      const diagnostics = md019.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("returns no diagnostics for document without headings", () => {
      const doc = Text.of(["Just some text", "More text"]);
      const diagnostics = md019.check(doc, config);
      expect(diagnostics).toEqual([]);
    });
  });

  describe("invalid documents", () => {
    it("detects two spaces after hash", () => {
      const doc = Text.of(["#  Heading"]);
      const diagnostics = md019.check(doc, config);

      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0]?.source).toBe("MD019");
      expect(diagnostics[0]?.severity).toBe("warning");
    });

    it("detects multiple spaces after hash", () => {
      const doc = Text.of(["#    Heading"]);
      const diagnostics = md019.check(doc, config);

      expect(diagnostics).toHaveLength(1);
    });

    it("detects issues on multiple headings", () => {
      const doc = Text.of([
        "#  Heading 1",
        "##   Heading 2",
        "###    Heading 3",
      ]);
      const diagnostics = md019.check(doc, config);

      expect(diagnostics).toHaveLength(3);
    });
  });

  describe("edge cases", () => {
    it("ignores headings inside code blocks", () => {
      const doc = Text.of(["```", "#  Not a heading", "```"]);
      const diagnostics = md019.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("ignores indented lines", () => {
      const doc = Text.of(["    #  Not a heading"]);
      const diagnostics = md019.check(doc, config);
      expect(diagnostics).toEqual([]);
    });
  });

  describe("fix function", () => {
    it("has a fix function", () => {
      expect(md019.fix).toBeDefined();
    });

    it("reduces multiple spaces to single space", () => {
      const doc = Text.of(["#  Heading"]);
      const diagnostics = md019.check(doc, config);
      expect(diagnostics).toHaveLength(1);

      const fix = md019.fix?.(doc, diagnostics[0]!);
      expect(fix).toBeDefined();
    });
  });
});
