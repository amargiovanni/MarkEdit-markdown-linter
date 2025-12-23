import { describe, it, expect, beforeEach } from "vitest";
import { Text } from "@codemirror/state";
import { LintingEngine } from "../../src/linter/engine";
import { registerRule, clearRegistry } from "../../src/linter/rules/index";
import { md001 } from "../../src/linter/rules/md001-heading-increment";
import { md009 } from "../../src/linter/rules/md009-no-trailing-spaces";
import { md010 } from "../../src/linter/rules/md010-no-hard-tabs";
import { md018 } from "../../src/linter/rules/md018-no-missing-space-atx";
import type { Configuration, RuleId } from "../../src/linter/types";
import { createRuleConfig } from "../../src/linter/types";

describe("LintingEngine", () => {
  beforeEach(() => {
    clearRegistry();
    registerRule(md001);
    registerRule(md009);
    registerRule(md010);
    registerRule(md018);
  });

  const createDefaultConfig = (): Configuration => ({
    rules: new Map<RuleId, ReturnType<typeof createRuleConfig>>([
      ["MD001", createRuleConfig({})],
      ["MD009", createRuleConfig({})],
      ["MD010", createRuleConfig({})],
      ["MD018", createRuleConfig({})],
    ]),
    defaultEnabled: true,
  });

  describe("lint", () => {
    it("returns empty diagnostics for valid document", () => {
      const engine = new LintingEngine(createDefaultConfig());
      const doc = Text.of(["# Heading 1", "## Heading 2", "Some text"]);

      const diagnostics = engine.lint(doc);

      expect(diagnostics).toEqual([]);
    });

    it("returns diagnostics for invalid document", () => {
      const engine = new LintingEngine(createDefaultConfig());
      const doc = Text.of(["#NoSpace", "Text with trailing space "]);

      const diagnostics = engine.lint(doc);

      expect(diagnostics.length).toBeGreaterThan(0);
    });

    it("respects disabled rules", () => {
      const config: Configuration = {
        rules: new Map([
          ["MD009", createRuleConfig({ enabled: false })],
          ["MD018", createRuleConfig({})],
        ]),
        defaultEnabled: false,
      };
      const engine = new LintingEngine(config);
      const doc = Text.of(["# Valid", "Text with trailing space "]);

      const diagnostics = engine.lint(doc);

      // MD009 is disabled, so no trailing space error
      expect(diagnostics.every((d) => d.source !== "MD009")).toBe(true);
    });

    it("passes rule options to the check function", () => {
      const config: Configuration = {
        rules: new Map([
          ["MD009", createRuleConfig({ options: { brSpaces: 2 } })],
        ]),
        defaultEnabled: false,
      };
      const engine = new LintingEngine(config);
      const doc = Text.of(["Line with two spaces  ", "Next line"]);

      const diagnostics = engine.lint(doc);

      // With brSpaces: 2, exactly 2 trailing spaces are allowed
      expect(diagnostics).toEqual([]);
    });

    it("collects diagnostics from multiple rules", () => {
      const engine = new LintingEngine(createDefaultConfig());
      const doc = Text.of([
        "#NoSpace", // MD018
        "# Valid heading",
        "### Skipped level", // MD001 (skips from h1 to h3)
        "Text with trailing space ", // MD009
      ]);

      const diagnostics = engine.lint(doc);

      const sources = new Set(diagnostics.map((d) => d.source));
      expect(sources.has("MD018")).toBe(true);
      expect(sources.has("MD001")).toBe(true);
      expect(sources.has("MD009")).toBe(true);
    });

    it("sorts diagnostics by position", () => {
      const engine = new LintingEngine(createDefaultConfig());
      const doc = Text.of([
        "Line 1 with trailing ", // MD009 at end
        "# Valid heading",
        "Line 3 with trailing ", // MD009 at end
      ]);

      const diagnostics = engine.lint(doc);

      for (let i = 1; i < diagnostics.length; i++) {
        const prev = diagnostics[i - 1];
        const curr = diagnostics[i];
        expect(prev!.from).toBeLessThanOrEqual(curr!.from);
      }
    });
  });

  describe("updateConfig", () => {
    it("allows updating configuration", () => {
      const engine = new LintingEngine(createDefaultConfig());
      const doc = Text.of(["Text with trailing space "]);

      // Initially should find MD009 error
      let diagnostics = engine.lint(doc);
      expect(diagnostics.some((d) => d.source === "MD009")).toBe(true);

      // Disable MD009
      engine.updateConfig({
        rules: new Map([["MD009", createRuleConfig({ enabled: false })]]),
        defaultEnabled: false,
      });

      // Now should not find MD009 error
      diagnostics = engine.lint(doc);
      expect(diagnostics.some((d) => d.source === "MD009")).toBe(false);
    });
  });

  describe("getActiveRules", () => {
    it("returns list of active rules", () => {
      const engine = new LintingEngine(createDefaultConfig());
      const activeRules = engine.getActiveRules();

      expect(activeRules.length).toBeGreaterThan(0);
      expect(activeRules.some((r) => r.id === "MD001")).toBe(true);
    });

    it("excludes disabled rules", () => {
      const config: Configuration = {
        rules: new Map([
          ["MD001", createRuleConfig({ enabled: false })],
          ["MD009", createRuleConfig({})],
        ]),
        defaultEnabled: false,
      };
      const engine = new LintingEngine(config);
      const activeRules = engine.getActiveRules();

      expect(activeRules.some((r) => r.id === "MD001")).toBe(false);
      expect(activeRules.some((r) => r.id === "MD009")).toBe(true);
    });
  });

  describe("empty document", () => {
    it("handles empty document without errors", () => {
      const engine = new LintingEngine(createDefaultConfig());
      const doc = Text.of([""]);

      const diagnostics = engine.lint(doc);

      expect(diagnostics).toEqual([]);
    });
  });
});
