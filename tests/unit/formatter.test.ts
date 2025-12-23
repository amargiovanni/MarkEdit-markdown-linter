import { describe, it, expect, beforeEach } from "vitest";
import { Text } from "@codemirror/state";
import { Formatter } from "../../src/formatter/formatter";
import { LintingEngine } from "../../src/linter/engine";
import { registerRule, clearRegistry } from "../../src/linter/rules/index";
import { md009 } from "../../src/linter/rules/md009-no-trailing-spaces";
import { md010 } from "../../src/linter/rules/md010-no-hard-tabs";
import { md012 } from "../../src/linter/rules/md012-no-multiple-blanks";
import { md018 } from "../../src/linter/rules/md018-no-missing-space-atx";
import { md019 } from "../../src/linter/rules/md019-no-multiple-space-atx";
import type { Configuration, RuleId } from "../../src/linter/types";
import { createRuleConfig } from "../../src/linter/types";

describe("Formatter", () => {
  beforeEach(() => {
    clearRegistry();
    registerRule(md009);
    registerRule(md010);
    registerRule(md012);
    registerRule(md018);
    registerRule(md019);
  });

  const createDefaultConfig = (): Configuration => ({
    rules: new Map<RuleId, ReturnType<typeof createRuleConfig>>([
      ["MD009", createRuleConfig({})],
      ["MD010", createRuleConfig({})],
      ["MD012", createRuleConfig({})],
      ["MD018", createRuleConfig({})],
      ["MD019", createRuleConfig({})],
    ]),
    defaultEnabled: true,
  });

  describe("format", () => {
    it("returns unchanged text for valid document", () => {
      const config = createDefaultConfig();
      const engine = new LintingEngine(config);
      const formatter = new Formatter(engine);

      const doc = Text.of(["# Valid Document", "", "No issues here."]);
      const result = formatter.format(doc);

      expect(result.text).toBe(doc.toString());
      expect(result.changes).toHaveLength(0);
    });

    it("removes trailing spaces", () => {
      const config = createDefaultConfig();
      const engine = new LintingEngine(config);
      const formatter = new Formatter(engine);

      const doc = Text.of(["Line with trailing space ", "Clean line"]);
      const result = formatter.format(doc);

      expect(result.text).toBe("Line with trailing space\nClean line");
      expect(result.changes.length).toBeGreaterThan(0);
    });

    it("replaces tabs with spaces", () => {
      const config = createDefaultConfig();
      const engine = new LintingEngine(config);
      const formatter = new Formatter(engine);

      const doc = Text.of(["\tIndented with tab"]);
      const result = formatter.format(doc);

      expect(result.text).toBe("    Indented with tab");
    });

    it("adds space after hash in headings", () => {
      const config = createDefaultConfig();
      const engine = new LintingEngine(config);
      const formatter = new Formatter(engine);

      const doc = Text.of(["#NoSpace"]);
      const result = formatter.format(doc);

      expect(result.text).toBe("# NoSpace");
    });

    it("reduces multiple spaces after hash to one", () => {
      const config = createDefaultConfig();
      const engine = new LintingEngine(config);
      const formatter = new Formatter(engine);

      const doc = Text.of(["#   TooManySpaces"]);
      const result = formatter.format(doc);

      expect(result.text).toBe("# TooManySpaces");
    });

    it("applies multiple fixes in correct order", () => {
      const config = createDefaultConfig();
      const engine = new LintingEngine(config);
      const formatter = new Formatter(engine);

      const doc = Text.of([
        "#NoSpace ",
        "\tTabbed line",
      ]);
      const result = formatter.format(doc);

      expect(result.text).toBe("# NoSpace\n    Tabbed line");
    });

    it("reports the number of fixes applied", () => {
      const config = createDefaultConfig();
      const engine = new LintingEngine(config);
      const formatter = new Formatter(engine);

      const doc = Text.of([
        "Line 1 ",
        "Line 2 ",
        "Line 3 ",
      ]);
      const result = formatter.format(doc);

      expect(result.changes).toHaveLength(3);
      expect(result.fixedCount).toBe(3);
    });
  });

  describe("getFixableDiagnostics", () => {
    it("returns only diagnostics that have fixes", () => {
      const config = createDefaultConfig();
      const engine = new LintingEngine(config);
      const formatter = new Formatter(engine);

      const doc = Text.of(["Line with trailing space "]);
      const fixable = formatter.getFixableDiagnostics(doc);

      expect(fixable.length).toBeGreaterThan(0);
      expect(fixable.every((d) => d.source === "MD009")).toBe(true);
    });
  });
});
