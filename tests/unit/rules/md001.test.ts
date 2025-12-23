import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { md001 } from "../../../src/linter/rules/md001-heading-increment";
import { createRuleConfig } from "../../../src/linter/types";

describe("MD001: heading-increment", () => {
  const config = createRuleConfig({});

  describe("rule metadata", () => {
    it("has correct ID and name", () => {
      expect(md001.id).toBe("MD001");
      expect(md001.name).toBe("heading-increment");
    });

    it("has error severity by default", () => {
      expect(md001.severity).toBe("error");
    });

    it("is tagged as headings", () => {
      expect(md001.tags).toContain("headings");
    });
  });

  describe("valid documents", () => {
    it("returns no diagnostics for sequential headings", () => {
      const doc = Text.of([
        "# Heading 1",
        "## Heading 2",
        "### Heading 3",
        "#### Heading 4",
      ]);
      const diagnostics = md001.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("returns no diagnostics for single heading", () => {
      const doc = Text.of(["# Only Heading"]);
      const diagnostics = md001.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("returns no diagnostics for empty document", () => {
      const doc = Text.of([""]);
      const diagnostics = md001.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("returns no diagnostics for document without headings", () => {
      const doc = Text.of(["Just some text", "More text", "No headings here"]);
      const diagnostics = md001.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("allows going back up in heading levels", () => {
      const doc = Text.of([
        "# Heading 1",
        "## Heading 2",
        "### Heading 3",
        "## Back to 2",
        "# Back to 1",
      ]);
      const diagnostics = md001.check(doc, config);
      expect(diagnostics).toEqual([]);
    });
  });

  describe("invalid documents", () => {
    it("detects skip from h1 to h3", () => {
      const doc = Text.of(["# Heading 1", "### Heading 3"]);
      const diagnostics = md001.check(doc, config);

      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0]?.source).toBe("MD001");
      expect(diagnostics[0]?.severity).toBe("error");
      expect(diagnostics[0]?.message).toContain("skip");
    });

    it("detects skip from h2 to h4", () => {
      const doc = Text.of(["## Heading 2", "#### Heading 4"]);
      const diagnostics = md001.check(doc, config);

      expect(diagnostics).toHaveLength(1);
    });

    it("detects multiple skips", () => {
      const doc = Text.of([
        "# Heading 1",
        "### Heading 3", // Skip
        "##### Heading 5", // Skip
      ]);
      const diagnostics = md001.check(doc, config);

      expect(diagnostics).toHaveLength(2);
    });

    it("positions diagnostic at the problematic heading", () => {
      const doc = Text.of(["# Heading 1", "### Heading 3"]);
      const diagnostics = md001.check(doc, config);

      expect(diagnostics).toHaveLength(1);
      const diag = diagnostics[0];
      expect(diag?.from).toBe(12); // Start of line 2 (after "# Heading 1\n")
    });

    it("detects skip when first heading is not h1", () => {
      const doc = Text.of(["## Heading 2", "#### Heading 4"]);
      const diagnostics = md001.check(doc, config);

      expect(diagnostics).toHaveLength(1);
    });
  });

  describe("edge cases", () => {
    it("ignores headings inside code blocks", () => {
      const doc = Text.of([
        "# Heading 1",
        "```",
        "### Not a heading",
        "```",
        "## Heading 2",
      ]);
      const diagnostics = md001.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("handles text that looks like headings but has leading space", () => {
      const doc = Text.of([
        "# Heading 1",
        " ### Not a heading (indented)",
        "## Heading 2",
      ]);
      const diagnostics = md001.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("handles setext-style headings", () => {
      const doc = Text.of(["Heading 1", "=========", "### Heading 3"]);
      const diagnostics = md001.check(doc, config);
      expect(diagnostics).toHaveLength(1);
    });
  });
});
