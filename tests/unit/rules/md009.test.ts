import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { md009 } from "../../../src/linter/rules/md009-no-trailing-spaces";
import { createRuleConfig } from "../../../src/linter/types";

describe("MD009: no-trailing-spaces", () => {
  const config = createRuleConfig({});

  describe("rule metadata", () => {
    it("has correct ID and name", () => {
      expect(md009.id).toBe("MD009");
      expect(md009.name).toBe("no-trailing-spaces");
    });

    it("has error severity by default", () => {
      expect(md009.severity).toBe("error");
    });

    it("is tagged as whitespace", () => {
      expect(md009.tags).toContain("whitespace");
    });
  });

  describe("valid documents", () => {
    it("returns no diagnostics for clean lines", () => {
      const doc = Text.of(["Line without trailing spaces", "Another clean line"]);
      const diagnostics = md009.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("returns no diagnostics for empty document", () => {
      const doc = Text.of([""]);
      const diagnostics = md009.check(doc, config);
      expect(diagnostics).toEqual([]);
    });

    it("returns no diagnostics for empty lines", () => {
      const doc = Text.of(["Some text", "", "More text"]);
      const diagnostics = md009.check(doc, config);
      expect(diagnostics).toEqual([]);
    });
  });

  describe("invalid documents", () => {
    it("detects single trailing space", () => {
      const doc = Text.of(["Line with trailing space "]);
      const diagnostics = md009.check(doc, config);

      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0]?.source).toBe("MD009");
      expect(diagnostics[0]?.severity).toBe("error");
    });

    it("detects multiple trailing spaces", () => {
      const doc = Text.of(["Line with many spaces   "]);
      const diagnostics = md009.check(doc, config);

      expect(diagnostics).toHaveLength(1);
    });

    it("detects trailing spaces on multiple lines", () => {
      const doc = Text.of(["First line ", "Second line  ", "Third line   "]);
      const diagnostics = md009.check(doc, config);

      expect(diagnostics).toHaveLength(3);
    });

    it("positions diagnostic at trailing spaces", () => {
      const doc = Text.of(["Hello  "]);
      const diagnostics = md009.check(doc, config);

      expect(diagnostics).toHaveLength(1);
      const diag = diagnostics[0];
      expect(diag?.from).toBe(5); // Position of first trailing space
      expect(diag?.to).toBe(7); // End of line
    });

    it("detects trailing tabs", () => {
      const doc = Text.of(["Line with trailing tab\t"]);
      const diagnostics = md009.check(doc, config);

      expect(diagnostics).toHaveLength(1);
    });
  });

  describe("fix function", () => {
    it("has a fix function", () => {
      expect(md009.fix).toBeDefined();
    });

    it("removes trailing spaces", () => {
      const doc = Text.of(["Hello  "]);
      const diagnostics = md009.check(doc, config);
      expect(diagnostics).toHaveLength(1);

      const fix = md009.fix?.(doc, diagnostics[0]!);
      expect(fix).toBeDefined();
      expect(fix).toEqual({
        from: 5,
        to: 7,
        insert: "",
      });
    });
  });

  describe("brSpaces option", () => {
    it("allows 2 trailing spaces when brSpaces is 2", () => {
      const configWithBr = createRuleConfig({ options: { brSpaces: 2 } });
      const doc = Text.of(["Line with line break  ", "Next line"]);
      const diagnostics = md009.check(doc, configWithBr);

      expect(diagnostics).toEqual([]);
    });

    it("still detects 3+ spaces when brSpaces is 2", () => {
      const configWithBr = createRuleConfig({ options: { brSpaces: 2 } });
      const doc = Text.of(["Line with extra spaces   "]);
      const diagnostics = md009.check(doc, configWithBr);

      expect(diagnostics).toHaveLength(1);
    });

    it("still detects 1 space when brSpaces is 2", () => {
      const configWithBr = createRuleConfig({ options: { brSpaces: 2 } });
      const doc = Text.of(["Line with one space "]);
      const diagnostics = md009.check(doc, configWithBr);

      expect(diagnostics).toHaveLength(1);
    });
  });
});
