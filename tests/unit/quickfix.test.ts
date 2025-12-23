/**
 * Tests for quick fix menu functionality.
 *
 * @module tests/unit/quickfix
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Text } from "@codemirror/state";
import type { Diagnostic } from "../../src/linter/types";
import { createDiagnostic } from "../../src/linter/types";
import {
  getQuickFixesForPosition,
  getQuickFixesForDiagnostic,
  type QuickFix,
} from "../../src/ui/quickfix";
import { registerRule, clearRegistry } from "../../src/linter/rules/index";
import { md009 } from "../../src/linter/rules/md009-no-trailing-spaces";
import { md018 } from "../../src/linter/rules/md018-no-missing-space-atx";
import { md001 } from "../../src/linter/rules/md001-heading-increment";

describe("Quick Fix", () => {
  beforeEach(() => {
    clearRegistry();
    registerRule(md009);
    registerRule(md018);
    registerRule(md001);
  });

  describe("getQuickFixesForDiagnostic", () => {
    it("should return quick fix for fixable diagnostic", () => {
      const doc = Text.of(["Hello World   "]);
      const diagnostic = createDiagnostic({
        from: 11,
        to: 14,
        severity: "error",
        message: "Trailing spaces",
        source: "MD009",
      });

      const fixes = getQuickFixesForDiagnostic(doc, diagnostic);

      expect(fixes.length).toBe(1);
      expect(fixes[0]!.label).toContain("Remove trailing");
    });

    it("should return empty array for non-fixable diagnostic", () => {
      const doc = Text.of(["# Heading 1", "### Heading 3"]);
      const diagnostic = createDiagnostic({
        from: 12,
        to: 25,
        severity: "error",
        message: "Heading levels should only increment by one level at a time",
        source: "MD001",
      });

      const fixes = getQuickFixesForDiagnostic(doc, diagnostic);

      expect(fixes.length).toBe(0);
    });

    it("should include the diagnostic source in fix label", () => {
      const doc = Text.of(["#Heading"]);
      const diagnostic = createDiagnostic({
        from: 0,
        to: 8,
        severity: "error",
        message: "Missing space after hash",
        source: "MD018",
      });

      const fixes = getQuickFixesForDiagnostic(doc, diagnostic);

      expect(fixes.length).toBe(1);
      expect(fixes[0]!.source).toBe("MD018");
    });
  });

  describe("getQuickFixesForPosition", () => {
    it("should return fixes for all diagnostics at position", () => {
      const diagnostics: Diagnostic[] = [
        createDiagnostic({
          from: 0,
          to: 10,
          severity: "error",
          message: "Trailing spaces",
          source: "MD009",
        }),
        createDiagnostic({
          from: 5,
          to: 15,
          severity: "warning",
          message: "Another issue",
          source: "MD009",
        }),
      ];

      const doc = Text.of(["Hello      World    "]);
      const fixes = getQuickFixesForPosition(doc, diagnostics, 7);

      // Position 7 is covered by both diagnostics
      expect(fixes.length).toBe(2);
    });

    it("should return empty array for position with no diagnostics", () => {
      const diagnostics: Diagnostic[] = [
        createDiagnostic({
          from: 10,
          to: 20,
          severity: "error",
          message: "Trailing spaces",
          source: "MD009",
        }),
      ];

      const doc = Text.of(["Hello World   "]);
      const fixes = getQuickFixesForPosition(doc, diagnostics, 5);

      expect(fixes.length).toBe(0);
    });

    it("should filter out non-fixable diagnostics", () => {
      const diagnostics: Diagnostic[] = [
        createDiagnostic({
          from: 0,
          to: 14,
          severity: "error",
          message: "Trailing spaces",
          source: "MD009",
        }),
        createDiagnostic({
          from: 0,
          to: 14,
          severity: "error",
          message: "Heading increment issue",
          source: "MD001",
        }),
      ];

      const doc = Text.of(["Hello World   "]);
      const fixes = getQuickFixesForPosition(doc, diagnostics, 5);

      // Only MD009 is fixable
      expect(fixes.length).toBe(1);
      expect(fixes[0]!.source).toBe("MD009");
    });
  });

  describe("QuickFix apply", () => {
    it("should apply fix correctly", () => {
      const doc = Text.of(["Hello World   "]);
      const diagnostic = createDiagnostic({
        from: 11,
        to: 14,
        severity: "error",
        message: "Trailing spaces",
        source: "MD009",
      });

      const fixes = getQuickFixesForDiagnostic(doc, diagnostic);
      expect(fixes.length).toBe(1);

      const fix = fixes[0]!;
      expect(fix.change).toBeDefined();

      // Verify the change removes trailing spaces
      const change = fix.change as { from: number; to: number; insert?: string };
      expect(change.from).toBe(11);
      expect(change.to).toBe(14);
      expect(change.insert ?? "").toBe("");
    });

    it("should apply MD018 fix correctly", () => {
      const doc = Text.of(["#Heading"]);
      const diagnostic = createDiagnostic({
        from: 1,
        to: 1,
        severity: "error",
        message: "Missing space after hash",
        source: "MD018",
      });

      const fixes = getQuickFixesForDiagnostic(doc, diagnostic);
      expect(fixes.length).toBe(1);

      const fix = fixes[0]!;
      const change = fix.change as { from: number; to: number; insert?: string };
      expect(change.insert).toBe(" ");
    });
  });

  describe("QuickFix structure", () => {
    it("should have required properties", () => {
      const doc = Text.of(["Hello World   "]);
      const diagnostic = createDiagnostic({
        from: 11,
        to: 14,
        severity: "error",
        message: "Trailing spaces",
        source: "MD009",
      });

      const fixes = getQuickFixesForDiagnostic(doc, diagnostic);
      const fix = fixes[0]!;

      expect(fix).toHaveProperty("label");
      expect(fix).toHaveProperty("source");
      expect(fix).toHaveProperty("diagnostic");
      expect(fix).toHaveProperty("change");
      expect(typeof fix.label).toBe("string");
      expect(typeof fix.source).toBe("string");
    });
  });
});
