/**
 * Tests for AppleScript bridge.
 *
 * @module tests/unit/applescript
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Text } from "@codemirror/state";
import {
  createAppleScriptBridge,
  type AppleScriptBridge,
  type AppleScriptCommand,
} from "../../src/applescript/bridge";
import { registerRule, clearRegistry } from "../../src/linter/rules/index";
import { md009 } from "../../src/linter/rules/md009-no-trailing-spaces";
import { md001 } from "../../src/linter/rules/md001-heading-increment";

describe("AppleScript Bridge", () => {
  let bridge: AppleScriptBridge;

  beforeEach(() => {
    clearRegistry();
    registerRule(md009);
    registerRule(md001);
    bridge = createAppleScriptBridge();
  });

  describe("validate command", () => {
    it("should return diagnostics count for valid document", () => {
      const result = bridge.execute("validate", {
        content: "# Hello World",
      });

      expect(result.success).toBe(true);
      expect(result.data.total).toBe(0);
    });

    it("should return diagnostics count for invalid document", () => {
      const result = bridge.execute("validate", {
        content: "# Hello World   ",
      });

      expect(result.success).toBe(true);
      expect(result.data.total).toBeGreaterThan(0);
    });

    it("should return error counts by severity", () => {
      const result = bridge.execute("validate", {
        content: "# Heading 1\n### Heading 3", // MD001 violation
      });

      expect(result.success).toBe(true);
      expect(result.data.errors).toBeGreaterThan(0);
    });
  });

  describe("format command", () => {
    it("should format document with issues", () => {
      const result = bridge.execute("format", {
        content: "Hello World   \n",
      });

      expect(result.success).toBe(true);
      expect(result.data.formatted).toBe("Hello World\n");
      expect(result.data.fixedCount).toBeGreaterThan(0);
    });

    it("should return unchanged document if no issues", () => {
      const result = bridge.execute("format", {
        content: "# Hello World\n",
      });

      expect(result.success).toBe(true);
      expect(result.data.formatted).toBe("# Hello World\n");
      expect(result.data.fixedCount).toBe(0);
    });
  });

  describe("getStatistics command", () => {
    it("should return complete statistics", () => {
      const result = bridge.execute("getStatistics", {
        content: "# Hello World   ",
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("total");
      expect(result.data).toHaveProperty("errors");
      expect(result.data).toHaveProperty("warnings");
      expect(result.data).toHaveProperty("infos");
      expect(result.data).toHaveProperty("compliance");
    });
  });

  describe("error handling", () => {
    it("should return error for unknown command", () => {
      const result = bridge.execute("unknownCommand" as AppleScriptCommand, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown command");
    });

    it("should return error for missing content", () => {
      const result = bridge.execute("validate", {});

      expect(result.success).toBe(false);
      expect(result.error).toContain("content");
    });
  });

  describe("getAvailableCommands", () => {
    it("should return list of available commands", () => {
      const commands = bridge.getAvailableCommands();

      expect(commands).toContain("validate");
      expect(commands).toContain("format");
      expect(commands).toContain("getStatistics");
    });
  });
});
