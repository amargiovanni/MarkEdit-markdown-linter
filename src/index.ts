/**
 * MarkEdit Markdown Linter
 *
 * A CodeMirror 6 extension for real-time Markdown linting and formatting.
 * Provides validation against markdownlint rules (MD001-MD022), automatic
 * formatting, quick fixes, and AppleScript integration.
 *
 * @packageDocumentation
 * @module markedit-linter
 *
 * @example
 * ```typescript
 * import { EditorView, basicSetup } from "codemirror";
 * import { markdownLinter } from "markedit-linter";
 *
 * const editor = new EditorView({
 *   doc: "# Hello World",
 *   extensions: [basicSetup, markdownLinter()],
 *   parent: document.getElementById("editor")!
 * });
 * ```
 */

/** Current version of the library */
export const VERSION = "1.0.0";

// ============================================================================
// Core Types
// ============================================================================

/**
 * Core types for the linter system.
 * These types define the fundamental data structures used throughout the library.
 */
export type {
  /** Severity level of a diagnostic (error, warning, info) */
  Severity,
  /** Identifier for a rule (e.g., "MD001", "MD022") */
  RuleId,
  /** An action that can be applied to fix a diagnostic */
  Action,
  /** A diagnostic message produced by a linting rule */
  Diagnostic,
  /** Configuration for a single rule */
  RuleConfig,
  /** Definition of a linting rule */
  LintRule,
  /** Configuration file format (.markdownlintrc) */
  ConfigFile,
  /** Complete linter configuration */
  Configuration,
  /** Current state of the linter */
  LinterState,
  /** Statistics about diagnostics */
  Statistics,
  /** Options for the linter extension */
  LinterOptions,
  /** Public API of the linter */
  LinterAPI,
  /** Function signature for rule check functions */
  CheckFunction,
  /** Function signature for rule fix functions */
  FixFunction,
} from "./linter/types";

// ============================================================================
// Type Utilities
// ============================================================================

/**
 * Utility functions for working with linter types.
 */
export {
  /** Validates that a string is a valid rule ID */
  isValidRuleId,
  /** Creates a diagnostic with default values */
  createDiagnostic,
  /** Creates a rule configuration with default values */
  createRuleConfig,
  /** Computes statistics from an array of diagnostics */
  computeStatistics,
} from "./linter/types";

// ============================================================================
// Rule Registry
// ============================================================================

/**
 * Functions for managing the rule registry.
 * Rules must be registered before they can be used by the linter.
 */
export {
  /** Registers a new rule with the linter */
  registerRule,
  /** Retrieves a rule by its ID */
  getRule,
  /** Gets all registered rules */
  getAllRules,
  /** Gets rules that have a specific tag */
  getRulesByTag,
} from "./linter/rules/index";

// ============================================================================
// Utilities
// ============================================================================

/**
 * General-purpose utility functions.
 */
export { debounce } from "./utils/debounce";
export type { DebouncedFunction } from "./utils/debounce";

export {
  /** Converts a character offset to line and column numbers */
  offsetToLineCol,
  /** Converts line and column numbers to a character offset */
  lineColToOffset,
  /** Gets the text content of a specific line */
  getLineText,
  /** Gets the total number of lines in a document */
  getLineCount,
  /** Gets the start and end offsets of a line */
  getLineRange,
} from "./utils/position";
export type { LineCol, LineRange } from "./utils/position";

// ============================================================================
// Extension
// ============================================================================

/**
 * Main CodeMirror 6 extension entry points.
 */
export {
  /** Creates the markdown linter extension for CodeMirror 6 */
  markdownLinter,
  /** Gets current diagnostics from the editor state */
  getDiagnostics,
  /** Formats the document in the given editor view */
  formatDocument,
} from "./extension";

// ============================================================================
// Linting Engine
// ============================================================================

/**
 * Core linting engine for running rules and collecting diagnostics.
 */
export {
  /** The linting engine class */
  LintingEngine,
  /** Creates a default configuration with all rules enabled */
  createDefaultConfiguration,
} from "./linter/engine";

// ============================================================================
// Formatter
// ============================================================================

/**
 * Document formatting functionality.
 */
export { Formatter } from "./formatter/formatter";
export type { FormatResult } from "./formatter/formatter";

// ============================================================================
// UI Components
// ============================================================================

/**
 * UI components for displaying diagnostics in the editor.
 */
export {
  /** Creates gutter markers for diagnostics */
  lintGutter,
  /** Creates gutter marker decorations */
  createGutterMarkers,
} from "./ui/gutter";

export {
  /** Creates tooltips for diagnostics */
  lintTooltip,
  /** Gets diagnostics at a specific position */
  getDiagnosticsAtPosition,
} from "./ui/tooltip";

export {
  /** Gets quick fixes for a specific diagnostic */
  getQuickFixesForDiagnostic,
  /** Gets quick fixes at a specific position */
  getQuickFixesForPosition,
  /** Applies a quick fix to the editor */
  applyQuickFix,
  /** Shows the quick fix menu */
  showQuickFixMenu,
} from "./ui/quickfix";
export type { QuickFix } from "./ui/quickfix";

export {
  /** Creates the status bar panel */
  lintStatusBar,
  /** Creates status bar content HTML */
  createStatusBarContent,
  /** Gets the CSS class for the status bar */
  getStatusBarClass,
} from "./ui/statusbar";

// ============================================================================
// Statistics
// ============================================================================

/**
 * Functions for calculating diagnostic statistics.
 */
export { calculateStatistics } from "./linter/statistics";

// ============================================================================
// Configuration
// ============================================================================

/**
 * Configuration loading and validation.
 */
export {
  /** Parses a configuration object */
  parseConfig,
  /** Merges multiple configurations */
  mergeConfigs,
  /** Resolves a configuration with extends/preset inheritance */
  resolveConfig,
} from "./config/loader";
export type { ParsedConfig, ResolvedConfig } from "./config/loader";

export {
  /** Validates a configuration object */
  validateConfig,
  /** Formats validation errors as a string */
  formatValidationErrors,
} from "./config/schema";
export type { ValidationResult, ValidationError } from "./config/schema";

export {
  DEFAULT_SEVERITIES,
  DEFAULT_OPTIONS,
  getDefaultConfig,
  getDefaultOptions,
  getDefaultSeverity,
} from "./config/defaults";

// ============================================================================
// AppleScript Integration
// ============================================================================

/**
 * AppleScript integration for macOS automation.
 */
export {
  /** Creates an AppleScript bridge for automation */
  createAppleScriptBridge,
} from "./applescript/bridge";
export type {
  AppleScriptBridge,
  AppleScriptCommand,
  AppleScriptResult,
} from "./applescript/bridge";
