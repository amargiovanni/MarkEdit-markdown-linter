import { describe, it, expect } from "vitest";
import {
  type Severity,
  type Diagnostic,
  type Action,
  type LintRule,
  createDiagnostic,
  createRuleConfig,
  isValidRuleId,
  computeStatistics,
} from "../../src/linter/types";

describe("types", () => {
  describe("Severity", () => {
    it("supports error, warning, and info levels", () => {
      const severities: Severity[] = ["error", "warning", "info"];
      expect(severities).toHaveLength(3);
    });
  });

  describe("isValidRuleId", () => {
    it("returns true for valid rule IDs (MD followed by 3 digits)", () => {
      expect(isValidRuleId("MD001")).toBe(true);
      expect(isValidRuleId("MD013")).toBe(true);
      expect(isValidRuleId("MD022")).toBe(true);
      expect(isValidRuleId("MD999")).toBe(true);
    });

    it("returns false for invalid rule IDs", () => {
      expect(isValidRuleId("MD01")).toBe(false); // Too few digits
      expect(isValidRuleId("MD0001")).toBe(false); // Too many digits
      expect(isValidRuleId("md001")).toBe(false); // Lowercase
      expect(isValidRuleId("XX001")).toBe(false); // Wrong prefix
      expect(isValidRuleId("")).toBe(false);
      expect(isValidRuleId("MD")).toBe(false);
    });
  });

  describe("createDiagnostic", () => {
    it("creates a valid diagnostic with required fields", () => {
      const diagnostic = createDiagnostic({
        from: 0,
        to: 10,
        severity: "error",
        message: "Test error",
        source: "MD001",
      });

      expect(diagnostic.from).toBe(0);
      expect(diagnostic.to).toBe(10);
      expect(diagnostic.severity).toBe("error");
      expect(diagnostic.message).toBe("Test error");
      expect(diagnostic.source).toBe("MD001");
      expect(diagnostic.actions).toBeUndefined();
    });

    it("creates a diagnostic with optional actions", () => {
      const action: Action = {
        name: "Fix it",
        apply: () => {},
      };

      const diagnostic = createDiagnostic({
        from: 5,
        to: 15,
        severity: "warning",
        message: "Test warning",
        source: "MD009",
        actions: [action],
      });

      expect(diagnostic.actions).toHaveLength(1);
      expect(diagnostic.actions?.[0]?.name).toBe("Fix it");
    });

    it("throws error when from is negative", () => {
      expect(() =>
        createDiagnostic({
          from: -1,
          to: 10,
          severity: "error",
          message: "Test",
          source: "MD001",
        })
      ).toThrow("from must be >= 0");
    });

    it("throws error when to is less than from", () => {
      expect(() =>
        createDiagnostic({
          from: 10,
          to: 5,
          severity: "error",
          message: "Test",
          source: "MD001",
        })
      ).toThrow("to must be >= from");
    });

    it("throws error when message is empty", () => {
      expect(() =>
        createDiagnostic({
          from: 0,
          to: 10,
          severity: "error",
          message: "",
          source: "MD001",
        })
      ).toThrow("message must be non-empty");
    });

    it("throws error when source is invalid", () => {
      expect(() =>
        createDiagnostic({
          from: 0,
          to: 10,
          severity: "error",
          message: "Test",
          source: "INVALID" as `MD${string}`,
        })
      ).toThrow("source must be a valid rule ID");
    });
  });

  describe("createRuleConfig", () => {
    it("creates a rule config with defaults", () => {
      const config = createRuleConfig({});

      expect(config.enabled).toBe(true);
      expect(config.severity).toBeUndefined();
      expect(config.options).toEqual({});
    });

    it("creates a rule config with custom values", () => {
      const config = createRuleConfig({
        enabled: false,
        severity: "warning",
        options: { indent: 4 },
      });

      expect(config.enabled).toBe(false);
      expect(config.severity).toBe("warning");
      expect(config.options).toEqual({ indent: 4 });
    });
  });

  describe("computeStatistics", () => {
    it("returns zero statistics for empty diagnostics", () => {
      const stats = computeStatistics([]);

      expect(stats.total).toBe(0);
      expect(stats.errors).toBe(0);
      expect(stats.warnings).toBe(0);
      expect(stats.infos).toBe(0);
      expect(stats.compliance).toBe(100);
    });

    it("counts diagnostics by severity", () => {
      const diagnostics: Diagnostic[] = [
        createDiagnostic({
          from: 0,
          to: 5,
          severity: "error",
          message: "Error 1",
          source: "MD001",
        }),
        createDiagnostic({
          from: 10,
          to: 15,
          severity: "error",
          message: "Error 2",
          source: "MD001",
        }),
        createDiagnostic({
          from: 20,
          to: 25,
          severity: "warning",
          message: "Warning 1",
          source: "MD003",
        }),
        createDiagnostic({
          from: 30,
          to: 35,
          severity: "info",
          message: "Info 1",
          source: "MD013",
        }),
      ];

      const stats = computeStatistics(diagnostics);

      expect(stats.total).toBe(4);
      expect(stats.errors).toBe(2);
      expect(stats.warnings).toBe(1);
      expect(stats.infos).toBe(1);
    });

    it("calculates compliance as inverse of error density", () => {
      const diagnostics: Diagnostic[] = [
        createDiagnostic({
          from: 0,
          to: 5,
          severity: "error",
          message: "Error",
          source: "MD001",
        }),
      ];

      const stats = computeStatistics(diagnostics, 100); // 100 lines

      // With 1 error per 100 lines, compliance should be high
      expect(stats.compliance).toBeGreaterThan(90);
      expect(stats.compliance).toBeLessThanOrEqual(100);
    });
  });
});

describe("Action", () => {
  it("has name and apply function", () => {
    let applyCalled = false;
    const action: Action = {
      name: "Test Action",
      apply: () => {
        applyCalled = true;
      },
    };

    expect(action.name).toBe("Test Action");
    action.apply({} as never, 0, 10);
    expect(applyCalled).toBe(true);
  });
});

describe("LintRule interface", () => {
  it("defines required properties for a rule", () => {
    const rule: LintRule = {
      id: "MD001",
      name: "heading-increment",
      description: "Heading levels should increment by one level at a time",
      tags: ["headings"],
      severity: "error",
      check: () => [],
    };

    expect(rule.id).toBe("MD001");
    expect(rule.name).toBe("heading-increment");
    expect(rule.tags).toContain("headings");
    expect(rule.severity).toBe("error");
    expect(typeof rule.check).toBe("function");
    expect(rule.fix).toBeUndefined();
  });

  it("supports optional fix function", () => {
    const rule: LintRule = {
      id: "MD009",
      name: "no-trailing-spaces",
      description: "No trailing spaces",
      tags: ["whitespace"],
      severity: "error",
      check: () => [],
      fix: () => null,
    };

    expect(typeof rule.fix).toBe("function");
  });
});
