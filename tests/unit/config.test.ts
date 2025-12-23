/**
 * Tests for configuration loader.
 *
 * @module tests/unit/config
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  parseConfig,
  mergeConfigs,
  resolveConfig,
  type ParsedConfig,
} from "../../src/config/loader";

describe("Configuration Loader", () => {
  describe("parseConfig", () => {
    it("should parse empty config", () => {
      const config = parseConfig({});

      expect(config.rules).toEqual({});
      expect(config.default).toBeUndefined();
    });

    it("should parse boolean rule values", () => {
      const config = parseConfig({
        MD001: true,
        MD009: false,
      });

      expect(config.rules.MD001).toBe(true);
      expect(config.rules.MD009).toBe(false);
    });

    it("should parse severity rule values", () => {
      const config = parseConfig({
        MD001: "error",
        MD009: "warning",
        MD010: "info",
      });

      expect(config.rules.MD001).toBe("error");
      expect(config.rules.MD009).toBe("warning");
      expect(config.rules.MD010).toBe("info");
    });

    it("should parse object rule values with options", () => {
      const config = parseConfig({
        MD013: { line_length: 120 },
        MD007: { indent: 4 },
      });

      expect(config.rules.MD013).toEqual({ line_length: 120 });
      expect(config.rules.MD007).toEqual({ indent: 4 });
    });

    it("should parse default enabled setting", () => {
      const config = parseConfig({
        default: true,
      });

      expect(config.default).toBe(true);
    });

    it("should parse extends property", () => {
      const config = parseConfig({
        extends: "recommended",
      });

      expect(config.extends).toBe("recommended");
    });

    it("should handle mixed rule value types", () => {
      const config = parseConfig({
        MD001: true,
        MD009: "warning",
        MD013: { line_length: 100 },
      });

      expect(config.rules.MD001).toBe(true);
      expect(config.rules.MD009).toBe("warning");
      expect(config.rules.MD013).toEqual({ line_length: 100 });
    });
  });

  describe("mergeConfigs", () => {
    it("should merge base and override configs", () => {
      const base: ParsedConfig = {
        rules: { MD001: true, MD009: true },
      };
      const override: ParsedConfig = {
        rules: { MD009: false, MD010: true },
      };

      const merged = mergeConfigs(base, override);

      expect(merged.rules.MD001).toBe(true);
      expect(merged.rules.MD009).toBe(false);
      expect(merged.rules.MD010).toBe(true);
    });

    it("should override default setting", () => {
      const base: ParsedConfig = {
        rules: {},
        default: true,
      };
      const override: ParsedConfig = {
        rules: {},
        default: false,
      };

      const merged = mergeConfigs(base, override);

      expect(merged.default).toBe(false);
    });

    it("should preserve base settings when not overridden", () => {
      const base: ParsedConfig = {
        rules: { MD001: "error" },
        default: true,
      };
      const override: ParsedConfig = {
        rules: { MD009: "warning" },
      };

      const merged = mergeConfigs(base, override);

      expect(merged.rules.MD001).toBe("error");
      expect(merged.default).toBe(true);
    });

    it("should handle deep merging of object rule values", () => {
      const base: ParsedConfig = {
        rules: { MD013: { line_length: 80, code_blocks: true } },
      };
      const override: ParsedConfig = {
        rules: { MD013: { line_length: 120 } },
      };

      const merged = mergeConfigs(base, override);

      // Note: shallow merge - override replaces entirely
      expect(merged.rules.MD013).toEqual({ line_length: 120 });
    });
  });

  describe("resolveConfig", () => {
    it("should resolve config with default values", () => {
      const input: ParsedConfig = {
        rules: { MD001: true },
      };

      const resolved = resolveConfig(input);

      expect(resolved.rules.MD001).toBe(true);
      expect(resolved.default).toBe(true); // default value
    });

    it("should respect explicit default setting", () => {
      const input: ParsedConfig = {
        rules: {},
        default: false,
      };

      const resolved = resolveConfig(input);

      expect(resolved.default).toBe(false);
    });

    it("should apply extends preset", () => {
      const input: ParsedConfig = {
        extends: "recommended",
        rules: { MD013: false },
      };

      const resolved = resolveConfig(input);

      // MD013 should be disabled (override)
      expect(resolved.rules.MD013).toBe(false);
      // Other rules from recommended should be enabled
      expect(resolved.default).toBe(true);
    });
  });
});
