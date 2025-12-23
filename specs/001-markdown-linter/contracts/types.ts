/**
 * MarkEdit Markdown Linter - Type Contracts
 *
 * This file defines the public API contracts for the linter.
 * Implementation MUST conform to these interfaces.
 *
 * @module contracts/types
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
 * @returns Change specification or null if unfixable
 */
export type FixFunction = (
  doc: Text,
  diagnostic: Diagnostic
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

// =============================================================================
// Extension API
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
