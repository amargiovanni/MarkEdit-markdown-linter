/**
 * MarkEdit Markdown Linter - Extension Contract
 *
 * This file defines the public extension API contract.
 *
 * @module contracts/extension
 */

import type { Extension } from "@codemirror/state";
import type { LinterOptions, LinterAPI } from "./types";

// =============================================================================
// Extension Factory
// =============================================================================

/**
 * Creates the markdown linter CodeMirror extension.
 *
 * @param options - Configuration options
 * @returns CodeMirror extension array
 *
 * @example
 * ```typescript
 * import { markdownLinter } from "markedit-linter";
 *
 * const editor = new EditorView({
 *   extensions: [
 *     markdownLinter({
 *       debounceMs: 300,
 *       debug: false
 *     })
 *   ]
 * });
 * ```
 */
export declare function markdownLinter(options?: LinterOptions): Extension;

/**
 * Gets the linter API from an editor view.
 *
 * @param view - CodeMirror editor view
 * @returns Linter API or undefined if extension not installed
 *
 * @example
 * ```typescript
 * const api = getLinterAPI(view);
 * if (api) {
 *   api.format();
 *   console.log(api.getStatistics());
 * }
 * ```
 */
export declare function getLinterAPI(view: unknown): LinterAPI | undefined;

// =============================================================================
// Individual Extensions
// =============================================================================

/**
 * Core linter extension (validation only, no UI).
 * Use this for headless/testing scenarios.
 */
export declare function linterCore(options?: LinterOptions): Extension;

/**
 * Gutter markers extension.
 * Shows colored markers in the editor gutter.
 */
export declare function linterGutter(): Extension;

/**
 * Status bar extension.
 * Shows diagnostic counts at the bottom of the editor.
 */
export declare function linterStatusBar(): Extension;

/**
 * Tooltip extension.
 * Shows diagnostic details on hover.
 */
export declare function linterTooltips(): Extension;

// =============================================================================
// Commands
// =============================================================================

/**
 * Command: Format the entire document.
 * Applies all available auto-fixes.
 *
 * @example
 * ```typescript
 * import { formatDocument } from "markedit-linter";
 *
 * // In keymap
 * keymap.of([{ key: "Mod-Shift-f", run: formatDocument }])
 * ```
 */
export declare function formatDocument(view: unknown): boolean;

/**
 * Command: Show quick fix menu at cursor position.
 *
 * @example
 * ```typescript
 * import { showQuickFix } from "markedit-linter";
 *
 * // In keymap
 * keymap.of([{ key: "Mod-.", run: showQuickFix }])
 * ```
 */
export declare function showQuickFix(view: unknown): boolean;

/**
 * Command: Go to next diagnostic.
 */
export declare function nextDiagnostic(view: unknown): boolean;

/**
 * Command: Go to previous diagnostic.
 */
export declare function previousDiagnostic(view: unknown): boolean;

/**
 * Command: Toggle linter enabled state.
 */
export declare function toggleLinter(view: unknown): boolean;
