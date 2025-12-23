/**
 * Status bar panel for displaying linting statistics.
 *
 * @module ui/statusbar
 */

import {
  EditorView,
  Panel,
  showPanel,
  type ViewUpdate,
} from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import type { Statistics, Diagnostic } from "../linter/types";
import { calculateStatistics, formatStatistics } from "../linter/statistics";

/**
 * Creates the status bar text content.
 *
 * @param stats - The statistics to display
 * @returns Formatted status bar text
 */
export function createStatusBarContent(stats: Statistics): string {
  return formatStatistics(stats);
}

/**
 * Gets the appropriate CSS class for the status bar.
 *
 * @param stats - The statistics
 * @returns CSS class name
 */
export function getStatusBarClass(stats: Statistics): string {
  if (stats.total === 0) {
    return "cm-linter-status-success";
  }
  if (stats.errors > 0) {
    return "cm-linter-status-error";
  }
  if (stats.warnings > 0) {
    return "cm-linter-status-warning";
  }
  return "cm-linter-status-info";
}

/**
 * Creates a status bar panel function for CodeMirror.
 *
 * @param getDiagnostics - Function to get current diagnostics
 * @returns Panel creator function
 */
export function lintStatusBar(
  getDiagnostics: (view: EditorView) => readonly Diagnostic[]
): Extension {
  return showPanel.of((view: EditorView): Panel => {
    const dom = document.createElement("div");
    dom.className = "cm-linter-statusbar";

    function refresh() {
      const diagnostics = getDiagnostics(view);
      const stats = calculateStatistics(diagnostics);

      dom.textContent = createStatusBarContent(stats);
      dom.className = `cm-linter-statusbar ${getStatusBarClass(stats)}`;
    }

    refresh();

    return {
      dom,
      update(viewUpdate: ViewUpdate) {
        if (viewUpdate.docChanged || viewUpdate.startState !== viewUpdate.state) {
          // Re-run on document changes
          setTimeout(refresh, 0);
        }
      },
    };
  });
}

/**
 * Status bar styles theme.
 */
export const statusBarStyles = EditorView.baseTheme({
  ".cm-linter-statusbar": {
    padding: "4px 8px",
    fontSize: "12px",
    fontFamily: "system-ui, -apple-system, sans-serif",
    borderTop: "1px solid #ddd",
    cursor: "pointer",
  },
  ".cm-linter-status-success": {
    color: "#2e7d32",
    backgroundColor: "#e8f5e9",
  },
  ".cm-linter-status-error": {
    color: "#c62828",
    backgroundColor: "#ffebee",
  },
  ".cm-linter-status-warning": {
    color: "#ef6c00",
    backgroundColor: "#fff3e0",
  },
  ".cm-linter-status-info": {
    color: "#1565c0",
    backgroundColor: "#e3f2fd",
  },
  "&dark .cm-linter-statusbar": {
    borderTop: "1px solid #333",
  },
  "&dark .cm-linter-status-success": {
    color: "#81c784",
    backgroundColor: "#1b5e20",
  },
  "&dark .cm-linter-status-error": {
    color: "#ef9a9a",
    backgroundColor: "#b71c1c",
  },
  "&dark .cm-linter-status-warning": {
    color: "#ffb74d",
    backgroundColor: "#e65100",
  },
  "&dark .cm-linter-status-info": {
    color: "#90caf9",
    backgroundColor: "#0d47a1",
  },
});
