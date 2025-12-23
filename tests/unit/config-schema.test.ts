/**
 * Tests for configuration schema validation.
 *
 * @module tests/unit/config-schema
 */

import { describe, it, expect } from "vitest";
import {
  validateConfig,
  formatValidationErrors,
  type ValidationResult,
} from "../../src/config/schema";

describe("Configuration Schema Validation", () => {
  describe("validateConfig", () => {
    it("should accept empty config", () => {
      const result = validateConfig({});

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject null config", () => {
      const result = validateConfig(null);

      expect(result.valid).toBe(false);
      expect(result.errors[0]!.message).toContain("must be an object");
    });

    it("should reject non-object config", () => {
      const result = validateConfig("string");

      expect(result.valid).toBe(false);
    });

    describe("default property", () => {
      it("should accept boolean default", () => {
        const result = validateConfig({ default: true });

        expect(result.valid).toBe(true);
      });

      it("should reject non-boolean default", () => {
        const result = validateConfig({ default: "yes" });

        expect(result.valid).toBe(false);
        expect(result.errors[0]!.path).toBe("default");
      });
    });

    describe("extends property", () => {
      it("should accept valid preset name", () => {
        const result = validateConfig({ extends: "recommended" });

        expect(result.valid).toBe(true);
      });

      it("should reject unknown preset", () => {
        const result = validateConfig({ extends: "unknown-preset" });

        expect(result.valid).toBe(false);
        expect(result.errors[0]!.message).toContain("Unknown preset");
      });

      it("should reject non-string extends", () => {
        const result = validateConfig({ extends: 123 });

        expect(result.valid).toBe(false);
      });
    });

    describe("rule values", () => {
      it("should accept boolean rule value", () => {
        const result = validateConfig({ MD001: true });

        expect(result.valid).toBe(true);
      });

      it("should accept valid severity string", () => {
        const result = validateConfig({ MD001: "error" });
        expect(result.valid).toBe(true);

        const result2 = validateConfig({ MD001: "warning" });
        expect(result2.valid).toBe(true);

        const result3 = validateConfig({ MD001: "info" });
        expect(result3.valid).toBe(true);
      });

      it("should reject invalid severity string", () => {
        const result = validateConfig({ MD001: "critical" });

        expect(result.valid).toBe(false);
        expect(result.errors[0]!.message).toContain("Invalid severity");
      });

      it("should accept object rule value", () => {
        const result = validateConfig({ MD013: { line_length: 120 } });

        expect(result.valid).toBe(true);
      });

      it("should reject invalid rule value type", () => {
        const result = validateConfig({ MD001: 123 });

        expect(result.valid).toBe(false);
      });
    });

    describe("rule-specific options", () => {
      it("should validate MD007 indent option", () => {
        const valid = validateConfig({ MD007: { indent: 4 } });
        expect(valid.valid).toBe(true);

        const invalid = validateConfig({ MD007: { indent: "four" } });
        expect(invalid.valid).toBe(false);
        expect(invalid.errors[0]!.path).toBe("MD007.indent");
      });

      it("should validate MD012 maximum option", () => {
        const valid = validateConfig({ MD012: { maximum: 2 } });
        expect(valid.valid).toBe(true);

        const invalid = validateConfig({ MD012: { maximum: "two" } });
        expect(invalid.valid).toBe(false);
      });

      it("should validate MD013 options", () => {
        const valid = validateConfig({
          MD013: { line_length: 100, code_blocks: false, tables: true },
        });
        expect(valid.valid).toBe(true);

        const invalidLength = validateConfig({
          MD013: { line_length: "hundred" },
        });
        expect(invalidLength.valid).toBe(false);

        const invalidCodeBlocks = validateConfig({
          MD013: { code_blocks: "no" },
        });
        expect(invalidCodeBlocks.valid).toBe(false);
      });
    });

    describe("case insensitivity", () => {
      it("should validate lowercase rule IDs", () => {
        const result = validateConfig({ md001: true });

        expect(result.valid).toBe(true);
      });
    });
  });

  describe("formatValidationErrors", () => {
    it("should return null for valid config", () => {
      const result: ValidationResult = { valid: true, errors: [] };

      expect(formatValidationErrors(result)).toBeNull();
    });

    it("should format single error", () => {
      const result: ValidationResult = {
        valid: false,
        errors: [{ path: "MD001", message: "Invalid value" }],
      };

      const formatted = formatValidationErrors(result);

      expect(formatted).toContain("Configuration validation failed");
      expect(formatted).toContain("MD001: Invalid value");
    });

    it("should format multiple errors", () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          { path: "MD001", message: "Invalid value" },
          { path: "default", message: "Must be boolean" },
        ],
      };

      const formatted = formatValidationErrors(result);

      expect(formatted).toContain("MD001: Invalid value");
      expect(formatted).toContain("default: Must be boolean");
    });

    it("should handle errors without path", () => {
      const result: ValidationResult = {
        valid: false,
        errors: [{ path: "", message: "Configuration must be an object" }],
      };

      const formatted = formatValidationErrors(result);

      expect(formatted).toContain("Configuration must be an object");
    });
  });
});
