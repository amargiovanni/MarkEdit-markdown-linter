/**
 * Tests for MD014: commands-show-output rule.
 *
 * @module tests/unit/rules/md014
 */

import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { md014 } from "../../../src/linter/rules/md014-commands-show-output";
import { createRuleConfig } from "../../../src/linter/types";

describe("MD014: commands-show-output", () => {
  describe("rule metadata", () => {
    it("should have correct ID", () => {
      expect(md014.id).toBe("MD014");
    });

    it("should have correct name", () => {
      expect(md014.name).toBe("commands-show-output");
    });

    it("should have tags", () => {
      expect(md014.tags).toContain("code");
    });
  });

  describe("check function", () => {
    const defaultConfig = createRuleConfig({ enabled: true });

    it("should not flag code blocks without dollar sign prefixes", () => {
      const doc = Text.of(["```bash", "echo hello", "ls -la", "```"]);
      const diagnostics = md014.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should flag code blocks with all lines having dollar sign prefix", () => {
      const doc = Text.of(["```bash", "$ echo hello", "$ ls -la", "```"]);
      const diagnostics = md014.check(doc, defaultConfig);
      expect(diagnostics.length).toBeGreaterThan(0);
    });

    it("should not flag mixed command and output", () => {
      const doc = Text.of(["```bash", "$ echo hello", "hello", "```"]);
      const diagnostics = md014.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should handle empty document", () => {
      const doc = Text.of([""]);
      const diagnostics = md014.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should handle code block with single command", () => {
      const doc = Text.of(["```", "$ npm install", "```"]);
      const diagnostics = md014.check(doc, defaultConfig);
      // Single command without output is flagged
      expect(diagnostics.length).toBeGreaterThan(0);
    });

    it("should not flag empty code blocks", () => {
      const doc = Text.of(["```", "```"]);
      const diagnostics = md014.check(doc, defaultConfig);
      expect(diagnostics).toHaveLength(0);
    });

    it("should handle multiple code blocks independently", () => {
      const doc = Text.of([
        "```",
        "$ command1",
        "output1",
        "```",
        "```",
        "$ command2",
        "$ command3",
        "```",
      ]);
      const diagnostics = md014.check(doc, defaultConfig);
      // Second block should be flagged
      expect(diagnostics.length).toBeGreaterThan(0);
    });
  });
});
