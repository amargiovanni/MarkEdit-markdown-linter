/**
 * MarkEdit Markdown Linter - Rule Contracts
 *
 * This file defines the contract for individual rules.
 * Each rule implementation MUST export an object conforming to LintRule.
 *
 * @module contracts/rules
 */

import type { LintRule, RuleId } from "./types";

// =============================================================================
// Rule Registry Contract
// =============================================================================

/**
 * Registry of all available linting rules.
 */
export declare const rules: ReadonlyMap<RuleId, LintRule>;

/**
 * Get a rule by ID.
 *
 * @param id - Rule identifier (e.g., "MD001")
 * @returns Rule definition or undefined if not found
 */
export declare function getRule(id: RuleId): LintRule | undefined;

/**
 * Get all rules matching a tag.
 *
 * @param tag - Tag to filter by (e.g., "headings", "whitespace")
 * @returns Array of matching rules
 */
export declare function getRulesByTag(tag: string): readonly LintRule[];

// =============================================================================
// Rule Definitions (for reference)
// =============================================================================

/**
 * MD001: Heading levels should only increment by one level at a time.
 *
 * Tags: headings
 * Default severity: error
 * Fixable: no
 *
 * @example
 * // Bad
 * # Heading 1
 * ### Heading 3  // Should be ##
 *
 * // Good
 * # Heading 1
 * ## Heading 2
 */
export declare const md001: LintRule;

/**
 * MD003: Heading style should be consistent.
 *
 * Tags: headings
 * Default severity: warning
 * Fixable: yes
 *
 * Options:
 * - style: "atx" | "setext" | "consistent" (default: "consistent")
 */
export declare const md003: LintRule;

/**
 * MD004: Unordered list style should be consistent.
 *
 * Tags: lists
 * Default severity: warning
 * Fixable: yes
 *
 * Options:
 * - style: "-" | "*" | "+" | "consistent" (default: "consistent")
 */
export declare const md004: LintRule;

/**
 * MD005: List indentation should be consistent.
 *
 * Tags: lists
 * Default severity: error
 * Fixable: yes
 */
export declare const md005: LintRule;

/**
 * MD007: Unordered list indentation.
 *
 * Tags: lists
 * Default severity: warning
 * Fixable: yes
 *
 * Options:
 * - indent: number (default: 2)
 * - startIndented: boolean (default: false)
 */
export declare const md007: LintRule;

/**
 * MD009: No trailing spaces.
 *
 * Tags: whitespace
 * Default severity: error
 * Fixable: yes
 *
 * Options:
 * - brSpaces: number (default: 0) - Allowed trailing spaces for line break
 */
export declare const md009: LintRule;

/**
 * MD010: No hard tabs.
 *
 * Tags: whitespace
 * Default severity: error
 * Fixable: yes
 *
 * Options:
 * - codeBlocks: boolean (default: true) - Include code blocks
 */
export declare const md010: LintRule;

/**
 * MD012: No multiple consecutive blank lines.
 *
 * Tags: whitespace
 * Default severity: warning
 * Fixable: yes
 *
 * Options:
 * - maximum: number (default: 1)
 */
export declare const md012: LintRule;

/**
 * MD013: Line length limit.
 *
 * Tags: formatting
 * Default severity: info
 * Fixable: no
 *
 * Options:
 * - lineLength: number (default: 80)
 * - codeBlocks: boolean (default: true) - Include code blocks
 * - tables: boolean (default: true) - Include tables
 */
export declare const md013: LintRule;

/**
 * MD014: Code blocks should not start with shell prompt.
 *
 * Tags: code
 * Default severity: info
 * Fixable: yes
 */
export declare const md014: LintRule;

/**
 * MD018: No missing space after hash in ATX heading.
 *
 * Tags: headings
 * Default severity: error
 * Fixable: yes
 *
 * @example
 * // Bad
 * #Heading
 *
 * // Good
 * # Heading
 */
export declare const md018: LintRule;

/**
 * MD019: No multiple spaces after hash in ATX heading.
 *
 * Tags: headings
 * Default severity: warning
 * Fixable: yes
 */
export declare const md019: LintRule;

/**
 * MD020: No missing space inside closed ATX heading.
 *
 * Tags: headings
 * Default severity: error
 * Fixable: yes
 */
export declare const md020: LintRule;

/**
 * MD021: No multiple spaces inside closed ATX heading.
 *
 * Tags: headings
 * Default severity: warning
 * Fixable: yes
 */
export declare const md021: LintRule;

/**
 * MD022: Headings should be surrounded by blank lines.
 *
 * Tags: headings
 * Default severity: warning
 * Fixable: yes
 *
 * Options:
 * - linesAbove: number (default: 1)
 * - linesBelow: number (default: 1)
 */
export declare const md022: LintRule;
