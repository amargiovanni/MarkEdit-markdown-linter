/**
 * MarkEdit Markdown Linter - Core Types
 *
 * This module defines all type definitions for the linter.
 *
 * @module linter/types
 */

import type { EditorView } from "@codemirror/view";
import type { Text, ChangeSpec } from "@codemirror/state";

// =============================================================================
// Core Types
// =============================================================================

/**
 * Severity levels for diagnostics.
 * Maps to visual indicators: error (red), warning (yellow), info (blue)
 */
export type Severity = "error" | "warning" | "info";

/**
 * Rule identifier pattern: MD followed by 3 digits
 * @example "MD001", "MD013", "MD022"
 */
export type RuleId = `MD${string}`;

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validates that a string is a valid rule ID (MD followed by exactly 3 digits).
 *
 * @param id - The string to validate
 * @returns True if the string matches the pattern MD\d{3}
 */
export function isValidRuleId(id: string): id is RuleId {
  return /^MD\d{3}$/.test(id);
}

// =============================================================================
// Diagnostic Types
// =============================================================================

/**
 * Quick fix action that can be applied to resolve a diagnostic.
 */
export interface Action {
  /** Display label shown in quick fix menu */
  readonly name: string;

  /**
   * Apply the fix to the editor.
   * @param view - CodeMirror editor view
   * @param from - Diagnostic start position
   * @param to - Diagnostic end position
   */
  apply(view: EditorView, from: number, to: number): void;
}

/**
 * A single linting issue found in the document.
 * Compatible with @codemirror/lint Diagnostic type.
 */
export interface Diagnostic {
  /** Start position (character offset from document start) */
  readonly from: number;

  /** End position (character offset) */
  readonly to: number;

  /** Visual severity level */
  readonly severity: Severity;

  /** Human-readable description of the issue */
  readonly message: string;

  /** Rule ID that generated this diagnostic */
  readonly source: RuleId;

  /** Optional quick fix actions */
  readonly actions?: readonly Action[];
}

/**
 * Input parameters for creating a diagnostic.
 */
export interface DiagnosticInput {
  from: number;
  to: number;
  severity: Severity;
  message: string;
  source: RuleId;
  actions?: readonly Action[];
}

/**
 * Creates a validated diagnostic object.
 *
 * @param input - The diagnostic parameters
 * @returns A validated Diagnostic object
 * @throws Error if validation fails
 */
export function createDiagnostic(input: DiagnosticInput): Diagnostic {
  if (input.from < 0) {
    throw new Error("from must be >= 0");
  }
  if (input.to < input.from) {
    throw new Error("to must be >= from");
  }
  if (input.message.length === 0) {
    throw new Error("message must be non-empty");
  }
  if (!isValidRuleId(input.source)) {
    throw new Error("source must be a valid rule ID (MD followed by 3 digits)");
  }

  const result: Diagnostic = {
    from: input.from,
    to: input.to,
    severity: input.severity,
    message: input.message,
    source: input.source,
  };

  if (input.actions !== undefined) {
    return { ...result, actions: input.actions };
  }

  return result;
}

// =============================================================================
// Rule Types
// =============================================================================

/**
 * Configuration options for a single rule.
 */
export interface RuleConfig {
  /** Whether the rule is enabled */
  readonly enabled: boolean;

  /** Override default severity */
  readonly severity?: Severity;

  /** Rule-specific options */
  readonly options: Readonly<Record<string, unknown>>;
}

/**
 * Input parameters for creating a rule config.
 */
export interface RuleConfigInput {
  enabled?: boolean;
  severity?: Severity;
  options?: Record<string, unknown>;
}

/**
 * Creates a rule configuration with defaults.
 *
 * @param input - Optional configuration parameters
 * @returns A RuleConfig object with defaults applied
 */
export function createRuleConfig(input: RuleConfigInput): RuleConfig {
  const result: RuleConfig = {
    enabled: input.enabled ?? true,
    options: input.options ?? {},
  };

  if (input.severity !== undefined) {
    return { ...result, severity: input.severity };
  }

  return result;
}

/**
 * Function signature for rule check implementation.
 * MUST be a pure function with no side effects.
 *
 * @param doc - CodeMirror document to lint
 * @param config - Rule configuration
 * @returns Array of diagnostics found
 */
export type CheckFunction = (doc: Text, config: RuleConfig) => Diagnostic[];

/**
 * Function signature for auto-fix implementation.
 *
 * @param doc - CodeMirror document
 * @param diagnostic - The diagnostic to fix
 * @param config - Rule configuration (for accessing rule-specific options)
 * @returns Change specification or null if unfixable
 */
export type FixFunction = (
  doc: Text,
  diagnostic: Diagnostic,
  config: RuleConfig
) => ChangeSpec | null;

/**
 * Definition of a linting rule.
 */
export interface LintRule {
  /** Unique rule identifier (e.g., "MD001") */
  readonly id: RuleId;

  /** Human-readable name in kebab-case (e.g., "heading-increment") */
  readonly name: string;

  /** Description of what the rule checks */
  readonly description: string;

  /** Categories for grouping (e.g., ["headings", "structure"]) */
  readonly tags: readonly string[];

  /** Default severity level */
  readonly severity: Severity;

  /** Function that checks the document and returns diagnostics */
  readonly check: CheckFunction;

  /** Optional function to auto-fix issues */
  readonly fix?: FixFunction;
}

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * JSON configuration file format (.markdownlintrc)
 */
export interface ConfigFile {
  /** Base preset to inherit from */
  extends?: string;

  /** Enable/disable all rules by default */
  default?: boolean;

  /** Per-rule configuration */
  rules?: {
    [id: string]: boolean | Severity | RuleOptions;
  };
}

/**
 * Rule-specific options in config file.
 */
export interface RuleOptions {
  enabled?: boolean;
  severity?: Severity;
  [key: string]: unknown;
}

/**
 * Complete resolved configuration.
 */
export interface Configuration {
  /** Source preset name (if any) */
  readonly extends?: string;

  /** Per-rule configurations */
  readonly rules: ReadonlyMap<RuleId, RuleConfig>;

  /** Default enabled state for unlisted rules */
  readonly defaultEnabled: boolean;
}

// =============================================================================
// State Types
// =============================================================================

/**
 * Runtime state for the linter extension.
 */
export interface LinterState {
  /** Current diagnostics */
  readonly diagnostics: readonly Diagnostic[];

  /** Active configuration */
  readonly config: Configuration;

  /** Timestamp of last lint run (ms since epoch) */
  readonly lastUpdate: number;

  /** Whether lint operation is in progress */
  readonly isLinting: boolean;
}

/**
 * Aggregated statistics for UI display.
 */
export interface Statistics {
  /** Total diagnostic count */
  readonly total: number;

  /** Error count */
  readonly errors: number;

  /** Warning count */
  readonly warnings: number;

  /** Info count */
  readonly infos: number;

  /** Compliance percentage (0-100) */
  readonly compliance: number;
}

/**
 * Computes statistics from a list of diagnostics.
 *
 * @param diagnostics - Array of diagnostics to analyze
 * @param lineCount - Optional total line count for compliance calculation
 * @returns Statistics object
 */
export function computeStatistics(
  diagnostics: readonly Diagnostic[],
  lineCount = 1
): Statistics {
  let errors = 0;
  let warnings = 0;
  let infos = 0;

  for (const d of diagnostics) {
    switch (d.severity) {
      case "error":
        errors++;
        break;
      case "warning":
        warnings++;
        break;
      case "info":
        infos++;
        break;
    }
  }

  const total = errors + warnings + infos;

  // Compliance: 100% when no errors, decreases with error density
  // Formula: 100 - (errors / lineCount * 100), clamped to 0-100
  const errorDensity = lineCount > 0 ? errors / lineCount : 0;
  const compliance = Math.max(0, Math.min(100, 100 - errorDensity * 100));

  return {
    total,
    errors,
    warnings,
    infos,
    compliance: Math.round(compliance * 10) / 10, // Round to 1 decimal
  };
}

// =============================================================================
// Extension API Types
// =============================================================================

/**
 * Options for creating the linter extension.
 */
export interface LinterOptions {
  /** Custom configuration (overrides file-based config) */
  config?: Partial<ConfigFile>;

  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;

  /** Enable debug logging */
  debug?: boolean;

  /** Callback when diagnostics update */
  onDiagnosticsChange?: (diagnostics: readonly Diagnostic[]) => void;
}

/**
 * Public API returned by the extension factory.
 */
export interface LinterAPI {
  /** Force a lint operation */
  lint(): void;

  /** Format the document (apply all auto-fixes) */
  format(): void;

  /** Get current diagnostics */
  getDiagnostics(): readonly Diagnostic[];

  /** Get current statistics */
  getStatistics(): Statistics;

  /** Update configuration */
  setConfig(config: Partial<ConfigFile>): void;
}
