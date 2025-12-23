import { describe, it, expect, beforeEach } from "vitest";
import {
  registerRule,
  getRule,
  getAllRules,
  getRulesByTag,
  clearRegistry,
} from "../../src/linter/rules/index";
import type { LintRule } from "../../src/linter/types";

describe("rule registry", () => {
  // Create a mock rule for testing
  const createMockRule = (
    id: `MD${string}`,
    name: string,
    tags: string[] = []
  ): LintRule => ({
    id,
    name,
    description: `Test rule ${name}`,
    tags,
    severity: "error",
    check: () => [],
  });

  beforeEach(() => {
    clearRegistry();
  });

  describe("registerRule", () => {
    it("registers a new rule", () => {
      const rule = createMockRule("MD001", "heading-increment", ["headings"]);
      registerRule(rule);

      const retrieved = getRule("MD001");
      expect(retrieved).toBe(rule);
    });

    it("throws error for duplicate rule ID", () => {
      const rule1 = createMockRule("MD001", "rule-one");
      const rule2 = createMockRule("MD001", "rule-two");

      registerRule(rule1);
      expect(() => registerRule(rule2)).toThrow("already registered");
    });

    it("throws error for invalid rule ID", () => {
      const invalidRule = {
        ...createMockRule("MD001", "test"),
        id: "INVALID" as `MD${string}`,
      };
      expect(() => registerRule(invalidRule)).toThrow("Invalid rule ID");
    });
  });

  describe("getRule", () => {
    it("returns undefined for unregistered rule", () => {
      expect(getRule("MD999")).toBeUndefined();
    });

    it("returns the correct rule by ID", () => {
      const rule1 = createMockRule("MD001", "rule-one");
      const rule2 = createMockRule("MD009", "rule-nine");

      registerRule(rule1);
      registerRule(rule2);

      expect(getRule("MD001")).toBe(rule1);
      expect(getRule("MD009")).toBe(rule2);
    });
  });

  describe("getAllRules", () => {
    it("returns empty array when no rules registered", () => {
      expect(getAllRules()).toEqual([]);
    });

    it("returns all registered rules", () => {
      const rule1 = createMockRule("MD001", "rule-one");
      const rule2 = createMockRule("MD009", "rule-nine");

      registerRule(rule1);
      registerRule(rule2);

      const all = getAllRules();
      expect(all).toHaveLength(2);
      expect(all).toContain(rule1);
      expect(all).toContain(rule2);
    });

    it("returns rules sorted by ID", () => {
      const rule3 = createMockRule("MD022", "rule-three");
      const rule1 = createMockRule("MD001", "rule-one");
      const rule2 = createMockRule("MD009", "rule-two");

      registerRule(rule3);
      registerRule(rule1);
      registerRule(rule2);

      const all = getAllRules();
      expect(all[0]?.id).toBe("MD001");
      expect(all[1]?.id).toBe("MD009");
      expect(all[2]?.id).toBe("MD022");
    });
  });

  describe("getRulesByTag", () => {
    it("returns empty array for unknown tag", () => {
      expect(getRulesByTag("unknown")).toEqual([]);
    });

    it("returns rules matching the tag", () => {
      const rule1 = createMockRule("MD001", "rule-one", ["headings"]);
      const rule2 = createMockRule("MD009", "rule-two", ["whitespace"]);
      const rule3 = createMockRule("MD022", "rule-three", ["headings"]);

      registerRule(rule1);
      registerRule(rule2);
      registerRule(rule3);

      const headingRules = getRulesByTag("headings");
      expect(headingRules).toHaveLength(2);
      expect(headingRules).toContain(rule1);
      expect(headingRules).toContain(rule3);
    });

    it("handles rules with multiple tags", () => {
      const rule = createMockRule("MD001", "rule-one", [
        "headings",
        "structure",
      ]);
      registerRule(rule);

      expect(getRulesByTag("headings")).toContain(rule);
      expect(getRulesByTag("structure")).toContain(rule);
    });
  });

  describe("clearRegistry", () => {
    it("removes all registered rules", () => {
      registerRule(createMockRule("MD001", "rule-one"));
      registerRule(createMockRule("MD009", "rule-two"));

      expect(getAllRules()).toHaveLength(2);

      clearRegistry();

      expect(getAllRules()).toHaveLength(0);
    });
  });
});
