/**
 * Tests for statistics calculation.
 *
 * @module tests/unit/statistics
 */

import { describe, it, expect } from "vitest";
import type { Diagnostic, Statistics } from "../../src/linter/types";
import { createDiagnostic } from "../../src/linter/types";
import { calculateStatistics, formatStatistics } from "../../src/linter/statistics";

describe("Statistics", () => {
  describe("calculateStatistics", () => {
    it("should return zero counts for empty diagnostics", () => {
      const stats = calculateStatistics([]);

      expect(stats.total).toBe(0);
      expect(stats.errors).toBe(0);
      expect(stats.warnings).toBe(0);
      expect(stats.infos).toBe(0);
    });

    it("should count errors correctly", () => {
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
          source: "MD009",
        }),
      ];

      const stats = calculateStatistics(diagnostics);

      expect(stats.errors).toBe(2);
      expect(stats.total).toBe(2);
    });

    it("should count warnings correctly", () => {
      const diagnostics: Diagnostic[] = [
        createDiagnostic({
          from: 0,
          to: 5,
          severity: "warning",
          message: "Warning 1",
          source: "MD012",
        }),
        createDiagnostic({
          from: 10,
          to: 15,
          severity: "warning",
          message: "Warning 2",
          source: "MD019",
        }),
        createDiagnostic({
          from: 20,
          to: 25,
          severity: "warning",
          message: "Warning 3",
          source: "MD022",
        }),
      ];

      const stats = calculateStatistics(diagnostics);

      expect(stats.warnings).toBe(3);
      expect(stats.total).toBe(3);
    });

    it("should count infos correctly", () => {
      const diagnostics: Diagnostic[] = [
        createDiagnostic({
          from: 0,
          to: 5,
          severity: "info",
          message: "Info 1",
          source: "MD013",
        }),
      ];

      const stats = calculateStatistics(diagnostics);

      expect(stats.infos).toBe(1);
      expect(stats.total).toBe(1);
    });

    it("should count mixed severities correctly", () => {
      const diagnostics: Diagnostic[] = [
        createDiagnostic({
          from: 0,
          to: 5,
          severity: "error",
          message: "Error",
          source: "MD001",
        }),
        createDiagnostic({
          from: 10,
          to: 15,
          severity: "warning",
          message: "Warning",
          source: "MD012",
        }),
        createDiagnostic({
          from: 20,
          to: 25,
          severity: "info",
          message: "Info",
          source: "MD013",
        }),
      ];

      const stats = calculateStatistics(diagnostics);

      expect(stats.errors).toBe(1);
      expect(stats.warnings).toBe(1);
      expect(stats.infos).toBe(1);
      expect(stats.total).toBe(3);
    });

    it("should calculate compliance percentage", () => {
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
      ];

      // 2 issues in 10 lines = 20% reduction in compliance
      const stats = calculateStatistics(diagnostics, 10);

      expect(stats.compliance).toBeLessThan(100);
      expect(stats.compliance).toBeGreaterThan(0);
    });
  });

  describe("formatStatistics", () => {
    it("should format zero statistics as checkmark", () => {
      const stats: Statistics = {
        total: 0,
        errors: 0,
        warnings: 0,
        infos: 0,
        compliance: 100,
      };

      const formatted = formatStatistics(stats);

      expect(formatted).toContain("✓");
    });

    it("should format errors only", () => {
      const stats: Statistics = {
        total: 5,
        errors: 5,
        warnings: 0,
        infos: 0,
        compliance: 50,
      };

      const formatted = formatStatistics(stats);

      expect(formatted).toContain("5");
      expect(formatted).toContain("error");
    });

    it("should format warnings only", () => {
      const stats: Statistics = {
        total: 3,
        errors: 0,
        warnings: 3,
        infos: 0,
        compliance: 70,
      };

      const formatted = formatStatistics(stats);

      expect(formatted).toContain("3");
      expect(formatted).toContain("warning");
    });

    it("should format errors and warnings", () => {
      const stats: Statistics = {
        total: 8,
        errors: 5,
        warnings: 3,
        infos: 0,
        compliance: 20,
      };

      const formatted = formatStatistics(stats);

      expect(formatted).toContain("5");
      expect(formatted).toContain("error");
      expect(formatted).toContain("3");
      expect(formatted).toContain("warning");
    });

    it("should handle plural correctly", () => {
      const singleError: Statistics = {
        total: 1,
        errors: 1,
        warnings: 0,
        infos: 0,
        compliance: 90,
      };

      expect(formatStatistics(singleError)).toBe("1 error");

      const multipleErrors: Statistics = {
        total: 2,
        errors: 2,
        warnings: 0,
        infos: 0,
        compliance: 80,
      };

      expect(formatStatistics(multipleErrors)).toContain("2 errors");
    });
  });
});
