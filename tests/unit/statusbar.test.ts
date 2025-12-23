/**
 * Tests for status bar component.
 *
 * @module tests/unit/statusbar
 */

import { describe, it, expect } from "vitest";
import type { Statistics } from "../../src/linter/types";
import {
  createStatusBarContent,
  getStatusBarClass,
} from "../../src/ui/statusbar";

describe("Status Bar", () => {
  describe("createStatusBarContent", () => {
    it("should show checkmark for no issues", () => {
      const stats: Statistics = {
        total: 0,
        errors: 0,
        warnings: 0,
        infos: 0,
        compliance: 100,
      };

      const content = createStatusBarContent(stats);

      expect(content).toContain("✓");
    });

    it("should show error count", () => {
      const stats: Statistics = {
        total: 5,
        errors: 5,
        warnings: 0,
        infos: 0,
        compliance: 50,
      };

      const content = createStatusBarContent(stats);

      expect(content).toContain("5 errors");
    });

    it("should show warning count", () => {
      const stats: Statistics = {
        total: 3,
        errors: 0,
        warnings: 3,
        infos: 0,
        compliance: 70,
      };

      const content = createStatusBarContent(stats);

      expect(content).toContain("3 warnings");
    });

    it("should show both errors and warnings", () => {
      const stats: Statistics = {
        total: 8,
        errors: 5,
        warnings: 3,
        infos: 0,
        compliance: 20,
      };

      const content = createStatusBarContent(stats);

      expect(content).toContain("5 errors");
      expect(content).toContain("3 warnings");
    });
  });

  describe("getStatusBarClass", () => {
    it("should return success class for no issues", () => {
      const stats: Statistics = {
        total: 0,
        errors: 0,
        warnings: 0,
        infos: 0,
        compliance: 100,
      };

      expect(getStatusBarClass(stats)).toBe("cm-linter-status-success");
    });

    it("should return error class for errors", () => {
      const stats: Statistics = {
        total: 5,
        errors: 5,
        warnings: 0,
        infos: 0,
        compliance: 50,
      };

      expect(getStatusBarClass(stats)).toBe("cm-linter-status-error");
    });

    it("should return warning class for warnings only", () => {
      const stats: Statistics = {
        total: 3,
        errors: 0,
        warnings: 3,
        infos: 0,
        compliance: 70,
      };

      expect(getStatusBarClass(stats)).toBe("cm-linter-status-warning");
    });

    it("should prioritize error over warning", () => {
      const stats: Statistics = {
        total: 8,
        errors: 5,
        warnings: 3,
        infos: 0,
        compliance: 20,
      };

      expect(getStatusBarClass(stats)).toBe("cm-linter-status-error");
    });

    it("should return info class for info only", () => {
      const stats: Statistics = {
        total: 2,
        errors: 0,
        warnings: 0,
        infos: 2,
        compliance: 80,
      };

      expect(getStatusBarClass(stats)).toBe("cm-linter-status-info");
    });
  });
});
