/**
 * Linting engine that coordinates rule execution.
 *
 * @module linter/engine
 */

import type { Text } from "@codemirror/state";
import type { Configuration, Diagnostic, LintRule, RuleConfig, RuleId } from "./types";
import { createRuleConfig } from "./types";
import { getAllRules, getRule } from "./rules/index";

/**
 * The linting engine that runs rules against documents.
 */
export class LintingEngine {
  private config: Configuration;

  /**
   * Creates a new linting engine with the given configuration.
   *
   * @param config - The linter configuration
   */
  constructor(config: Configuration) {
    this.config = config;
  }

  /**
   * Lints a document and returns all diagnostics.
   *
   * @param doc - The CodeMirror document to lint
   * @returns Array of diagnostics sorted by position
   */
  lint(doc: Text): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const activeRules = this.getActiveRules();

    for (const rule of activeRules) {
      const ruleConfig = this.getRuleConfig(rule.id);
      const ruleDiagnostics = rule.check(doc, ruleConfig);

      // Apply severity override if configured
      if (ruleConfig.severity !== undefined) {
        for (const diag of ruleDiagnostics) {
          diagnostics.push({
            ...diag,
            severity: ruleConfig.severity,
          });
        }
      } else {
        diagnostics.push(...ruleDiagnostics);
      }
    }

    // Sort by position
    diagnostics.sort((a, b) => a.from - b.from);

    return diagnostics;
  }

  /**
   * Updates the engine configuration.
   *
   * @param config - New configuration to apply
   */
  updateConfig(config: Configuration): void {
    this.config = config;
  }

  /**
   * Gets the list of currently active (enabled) rules.
   *
   * @returns Array of active rules
   */
  getActiveRules(): LintRule[] {
    const allRules = getAllRules();
    const activeRules: LintRule[] = [];

    for (const rule of allRules) {
      const ruleConfig = this.config.rules.get(rule.id);

      if (ruleConfig !== undefined) {
        // Rule is explicitly configured
        if (ruleConfig.enabled) {
          activeRules.push(rule);
        }
      } else if (this.config.defaultEnabled) {
        // Rule uses default enabled state
        activeRules.push(rule);
      }
    }

    return activeRules;
  }

  /**
   * Gets the configuration for a specific rule.
   *
   * @param ruleId - The rule ID
   * @returns Rule configuration with defaults applied
   */
  getRuleConfig(ruleId: RuleId): RuleConfig {
    const explicitConfig = this.config.rules.get(ruleId);
    if (explicitConfig !== undefined) {
      return explicitConfig;
    }

    // Use rule's default severity from registration
    const rule = getRule(ruleId);
    const input: { enabled: boolean; severity?: "error" | "warning" | "info" } = {
      enabled: this.config.defaultEnabled,
    };

    if (rule?.severity !== undefined) {
      input.severity = rule.severity;
    }

    return createRuleConfig(input);
  }

  /**
   * Gets the current configuration.
   *
   * @returns Current configuration
   */
  getConfig(): Configuration {
    return this.config;
  }
}

/**
 * Creates a default configuration with all registered rules enabled.
 *
 * @returns Default configuration
 */
export function createDefaultConfiguration(): Configuration {
  const rules = new Map<RuleId, RuleConfig>();

  for (const rule of getAllRules()) {
    rules.set(rule.id, createRuleConfig({
      enabled: true,
      severity: rule.severity,
    }));
  }

  return {
    rules,
    defaultEnabled: true,
  };
}
