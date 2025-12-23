/**
 * Gutter markers for displaying diagnostic indicators.
 *
 * @module ui/gutter
 */

import {
  GutterMarker,
  gutter,
  type EditorView,
} from "@codemirror/view";
import { RangeSet, type Extension } from "@codemirror/state";
import type { Diagnostic, Severity } from "../linter/types";

/**
 * CSS classes for severity levels.
 */
const SEVERITY_CLASSES: Record<Severity, string> = {
  error: "cm-lint-marker-error",
  warning: "cm-lint-marker-warning",
  info: "cm-lint-marker-info",
};

/**
 * CSS for gutter markers.
 */
export const gutterStyles = `
.cm-lint-gutter {
  width: 1.2em;
}

.cm-lint-marker {
  width: 0.8em;
  height: 0.8em;
  border-radius: 50%;
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;
}

.cm-lint-marker-error {
  background-color: #e53935;
}

.cm-lint-marker-warning {
  background-color: #fb8c00;
}

.cm-lint-marker-info {
  background-color: #1e88e5;
}
`;

/**
 * A gutter marker that displays a colored dot for diagnostics.
 */
class LintGutterMarker extends GutterMarker {
  private readonly severity: Severity;
  private readonly diagnostics: readonly Diagnostic[];

  constructor(severity: Severity, diagnostics: readonly Diagnostic[]) {
    super();
    this.severity = severity;
    this.diagnostics = diagnostics;
  }

  override eq(other: GutterMarker): boolean {
    return (
      other instanceof LintGutterMarker &&
      other.severity === this.severity &&
      other.diagnostics.length === this.diagnostics.length
    );
  }

  override toDOM(): HTMLElement {
    const marker = document.createElement("div");
    marker.className = `cm-lint-marker ${SEVERITY_CLASSES[this.severity]}`;
    marker.title = this.diagnostics
      .map((d) => `[${d.source}] ${d.message}`)
      .join("\n");
    return marker;
  }
}

/**
 * Gets the highest severity from a list of diagnostics.
 */
function getHighestSeverity(diagnostics: readonly Diagnostic[]): Severity {
  if (diagnostics.some((d) => d.severity === "error")) {
    return "error";
  }
  if (diagnostics.some((d) => d.severity === "warning")) {
    return "warning";
  }
  return "info";
}

/**
 * Creates gutter markers from diagnostics.
 *
 * @param view - The editor view
 * @param diagnostics - List of diagnostics to display
 * @returns RangeSet of gutter markers
 */
export function createGutterMarkers(
  view: EditorView,
  diagnostics: readonly Diagnostic[]
): RangeSet<GutterMarker> {
  // Group diagnostics by line
  const byLine = new Map<number, Diagnostic[]>();

  for (const diag of diagnostics) {
    const line = view.state.doc.lineAt(diag.from).number;
    const existing = byLine.get(line);
    if (existing) {
      existing.push(diag);
    } else {
      byLine.set(line, [diag]);
    }
  }

  // Create markers sorted by line
  const markers: Array<{ from: number; marker: GutterMarker }> = [];

  for (const [lineNum, lineDiags] of byLine) {
    const line = view.state.doc.line(lineNum);
    const severity = getHighestSeverity(lineDiags);
    markers.push({
      from: line.from,
      marker: new LintGutterMarker(severity, lineDiags),
    });
  }

  // Sort by position
  markers.sort((a, b) => a.from - b.from);

  return RangeSet.of(
    markers.map((m) => m.marker.range(m.from))
  );
}

/**
 * Creates the lint gutter extension.
 *
 * @returns CodeMirror gutter extension
 */
export function lintGutter(): Extension {
  return gutter({
    class: "cm-lint-gutter",
    markers: () => RangeSet.empty,
  });
}
