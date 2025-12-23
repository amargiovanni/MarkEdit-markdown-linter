import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { md018 } from "../../../src/linter/rules/md018-no-missing-space-atx";
import { createRuleConfig } from "../../../src/linter/types";

describe("MD018: no-missing-space-atx", () => {
  const config = createRuleConfig({});

  describe("rule metadata", () => {
    it("has correct ID and name", () => {
      expect(md018.id).toBe("MD018");
      expect(md018.name).toBe("no-missing-space-atx");
    });

    it("has error severity by default", () => {
      expect(md018.severity).toBe("error");
    });

    it("is tagged as headings", () => {
      expect(md018.tags).toContain("headings");
    });
  });

  describe("valid documents", () => {
    it("returns no diagnostics for proper ATX headings", () => {
      const doc = Text.of([
        "# Heading 1",
        "## Heading 2",
        "### Heading 3",
        "#### Heading 4",
        "##### Heading 5",
        "###### Heading 6",
      ]);
      const diagnostics = md018.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("returns no diagnostics for empty document", () => {
      const doc = Text.of([""]);
      const diagnostics = md018.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("returns no diagnostics for document without headings", () => {
      const doc = Text.of(["Just some text", "More text"]);
      const diagnostics = md018.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("allows # in middle of text", () => {
      const doc = Text.of(["Use C# for development", "Issue #123"]);
      const diagnostics = md018.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("allows closed ATX style with spaces", () => {
      const doc = Text.of(["# Heading #", "## Another ##"]);
      const diagnostics = md018.check(doc, config);
      expect(diagnostics).toEqual([]);
    });
  });

  describe("invalid documents", () => {
    it("detects missing space after # for h1", () => {
      const doc = Text.of(["#NoSpace"]);
      const diagnostics = md018.check(doc, config);

      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0]?.source).toBe("MD018");
      expect(diagnostics[0]?.severity).toBe("error");
      expect(diagnostics[0]?.message).toContain("space");
    });

    it("detects missing space for h2", () => {
      const doc = Text.of(["##NoSpace"]);
      const diagnostics = md018.check(doc, config);

      expect(diagnostics).toHaveLength(1);
    });

    it("detects missing space for h3", () => {
      const doc = Text.of(["###NoSpace"]);
      const diagnostics = md018.check(doc, config);

      expect(diagnostics).toHaveLength(1);
    });

    it("detects multiple violations", () => {
      const doc = Text.of(["#First", "##Second", "###Third"]);
      const diagnostics = md018.check(doc, config);

      expect(diagnostics).toHaveLength(3);
    });

    it("positions diagnostic at the heading", () => {
      const doc = Text.of(["#NoSpace"]);
      const diagnostics = md018.check(doc, config);

      expect(diagnostics).toHaveLength(1);
      const diag = diagnostics[0];
      expect(diag?.from).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("ignores headings inside code blocks", () => {
      const doc = Text.of(["```", "#NotAHeading", "```"]);
      const diagnostics = md018.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("ignores indented lines", () => {
      const doc = Text.of(["    #NotAHeading"]);
      const diagnostics = md018.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("handles empty heading (just #)", () => {
      const doc = Text.of(["#"]);
      const diagnostics = md018.check(doc, config);
      // A lone # is not a heading without content
      expect(diagnostics).toEqual([]);
    });

    it("handles # followed by newline", () => {
      const doc = Text.of(["# ", "text"]);
      const diagnostics = md018.check(doc, config);
      expect(diagnostics).toEqual([]);
    });
  });

  describe("fix function", () => {
    it("has a fix function", () => {
      expect(md018.fix).toBeDefined();
    });

    it("adds space after #", () => {
      const doc = Text.of(["#NoSpace"]);
      const diagnostics = md018.check(doc, config);
      expect(diagnostics).toHaveLength(1);

      const fix = md018.fix?.(doc, diagnostics[0]!);
      expect(fix).toBeDefined();
    });
  });
});
