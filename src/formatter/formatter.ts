/**
 * Document formatter that applies all available fixes.
 *
 * @module formatter/formatter
 */

import { Text, ChangeSet, type ChangeSpec } from "@codemirror/state";
import type { Diagnostic } from "../linter/types";
import { LintingEngine } from "../linter/engine";
import { collectFixes, isFixable, type Fix } from "./fixes";

/**
 * Result of a format operation.
 */
export interface FormatResult {
  /** The formatted text */
  readonly text: string;
  /** List of changes that were applied */
  readonly changes: readonly ChangeSpec[];
  /** Number of fixes applied */
  readonly fixedCount: number;
}

/**
 * Document formatter that applies all available auto-fixes.
 */
export class Formatter {
  private readonly engine: LintingEngine;

  /**
   * Creates a new formatter.
   *
   * @param engine - The linting engine to use for finding issues
   */
  constructor(engine: LintingEngine) {
    this.engine = engine;
  }

  /**
   * Formats a document by applying all available fixes.
   *
   * Fixes are applied iteratively since one fix may affect the positions
   * of subsequent diagnostics.
   *
   * @param doc - The document to format
   * @param maxIterations - Maximum number of fix iterations (default: 10)
   * @returns The format result with the new text and applied changes
   */
  format(doc: Text, maxIterations = 10): FormatResult {
    const allChanges: ChangeSpec[] = [];
    let currentDoc = doc;
    let iteration = 0;

    while (iteration < maxIterations) {
      const diagnostics = this.engine.lint(currentDoc);
      const fixes = collectFixes(currentDoc, diagnostics);

      if (fixes.length === 0) {
        break;
      }

      // Use ChangeSet to properly handle overlapping/adjacent fixes
      const changes = fixes.map((f) => f.change);
      const changeSet = ChangeSet.of(changes, currentDoc.length);
      allChanges.push(...changes);
      currentDoc = changeSet.apply(currentDoc);
      iteration++;
    }

    return {
      text: currentDoc.toString(),
      changes: allChanges,
      fixedCount: allChanges.length,
    };
  }

  /**
   * Gets all diagnostics that can be auto-fixed.
   *
   * @param doc - The document to check
   * @returns List of fixable diagnostics
   */
  getFixableDiagnostics(doc: Text): Diagnostic[] {
    const diagnostics = this.engine.lint(doc);
    return diagnostics.filter(isFixable);
  }

  /**
   * Applies a single fix to a document.
   *
   * @param doc - The document
   * @param fix - The fix to apply
   * @returns New document text
   */
  applySingleFix(doc: Text, fix: Fix): string {
    const changeSet = ChangeSet.of([fix.change], doc.length);
    return changeSet.apply(doc).toString();
  }
}
