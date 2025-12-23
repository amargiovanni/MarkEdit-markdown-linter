/**
 * Tooltip component for displaying diagnostic details on hover.
 *
 * @module ui/tooltip
 */

import {
  hoverTooltip,
  type EditorView,
  type Tooltip,
} from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import type { Diagnostic, Severity } from "../linter/types";

/**
 * CSS classes for severity badges.
 */
const SEVERITY_BADGE_CLASSES: Record<Severity, string> = {
  error: "cm-lint-tooltip-badge-error",
  warning: "cm-lint-tooltip-badge-warning",
  info: "cm-lint-tooltip-badge-info",
};

/**
 * CSS for tooltips.
 */
export const tooltipStyles = `
.cm-lint-tooltip {
  padding: 4px 8px;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 4px;
  font-size: 13px;
  max-width: 400px;
  line-height: 1.4;
}

.cm-lint-tooltip-item {
  margin: 4px 0;
}

.cm-lint-tooltip-badge {
  display: inline-block;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  margin-right: 6px;
}

.cm-lint-tooltip-badge-error {
  background: #e53935;
  color: white;
}

.cm-lint-tooltip-badge-warning {
  background: #fb8c00;
  color: white;
}

.cm-lint-tooltip-badge-info {
  background: #1e88e5;
  color: white;
}

.cm-lint-tooltip-message {
  display: inline;
}

.cm-lint-tooltip-source {
  color: #808080;
  font-size: 11px;
  margin-left: 4px;
}
`;

/**
 * Function type for getting diagnostics at a position.
 */
export type DiagnosticsProvider = (
  view: EditorView,
  pos: number
) => readonly Diagnostic[];

/**
 * Creates the tooltip DOM for a list of diagnostics.
 *
 * @param diagnostics - Diagnostics to display
 * @returns DOM element for the tooltip
 */
function createTooltipDOM(diagnostics: readonly Diagnostic[]): HTMLElement {
  const container = document.createElement("div");
  container.className = "cm-lint-tooltip";

  for (const diag of diagnostics) {
    const item = document.createElement("div");
    item.className = "cm-lint-tooltip-item";

    const badge = document.createElement("span");
    badge.className = `cm-lint-tooltip-badge ${SEVERITY_BADGE_CLASSES[diag.severity]}`;
    badge.textContent = diag.severity.toUpperCase();
    item.appendChild(badge);

    const message = document.createElement("span");
    message.className = "cm-lint-tooltip-message";
    message.textContent = diag.message;
    item.appendChild(message);

    const source = document.createElement("span");
    source.className = "cm-lint-tooltip-source";
    source.textContent = `(${diag.source})`;
    item.appendChild(source);

    container.appendChild(item);
  }

  return container;
}

/**
 * Creates a hover tooltip extension for diagnostics.
 *
 * @param getDiagnostics - Function to get diagnostics at a position (should already be filtered by position)
 * @returns CodeMirror hover tooltip extension
 */
export function lintTooltip(getDiagnostics: DiagnosticsProvider): Extension {
  return hoverTooltip((view: EditorView, pos: number): Tooltip | null => {
    // getDiagnostics should return diagnostics already filtered by position
    const diagnostics = getDiagnostics(view, pos);

    if (diagnostics.length === 0) {
      return null;
    }

    return {
      pos: diagnostics[0]!.from,
      above: true,
      create: () => ({
        dom: createTooltipDOM(diagnostics),
      }),
    };
  });
}

/**
 * Gets diagnostics at a specific position.
 *
 * @param diagnostics - All diagnostics
 * @param pos - Position to check
 * @returns Diagnostics that contain the position
 */
export function getDiagnosticsAtPosition(
  diagnostics: readonly Diagnostic[],
  pos: number
): readonly Diagnostic[] {
  return diagnostics.filter((d) => pos >= d.from && pos <= d.to);
}
