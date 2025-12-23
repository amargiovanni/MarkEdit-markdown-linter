/**
 * Rule registry for managing linting rules.
 *
 * @module linter/rules
 */

import type { LintRule, RuleId } from "../types";
import { isValidRuleId } from "../types";

/**
 * Internal registry storing all rules by ID.
 */
const registry = new Map<RuleId, LintRule>();

/**
 * Registers a new linting rule.
 *
 * @param rule - The rule to register
 * @throws Error if rule ID is invalid or already registered
 */
export function registerRule(rule: LintRule): void {
  if (!isValidRuleId(rule.id)) {
    throw new Error(
      `Invalid rule ID: ${rule.id}. Must be MD followed by 3 digits.`
    );
  }

  if (registry.has(rule.id)) {
    throw new Error(`Rule ${rule.id} is already registered.`);
  }

  registry.set(rule.id, rule);
}

/**
 * Retrieves a rule by its ID.
 *
 * @param id - The rule ID to look up
 * @returns The rule if found, undefined otherwise
 */
export function getRule(id: RuleId): LintRule | undefined {
  return registry.get(id);
}

/**
 * Gets all registered rules, sorted by ID.
 *
 * @returns Array of all registered rules
 */
export function getAllRules(): LintRule[] {
  return [...registry.values()].sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Gets all rules that have a specific tag.
 *
 * @param tag - The tag to filter by
 * @returns Array of rules with the specified tag
 */
export function getRulesByTag(tag: string): LintRule[] {
  return [...registry.values()].filter((rule) => rule.tags.includes(tag));
}

/**
 * Clears all registered rules.
 * Primarily for testing purposes.
 */
export function clearRegistry(): void {
  registry.clear();
}

/**
 * Gets the count of registered rules.
 *
 * @returns Number of registered rules
 */
export function getRuleCount(): number {
  return registry.size;
}
