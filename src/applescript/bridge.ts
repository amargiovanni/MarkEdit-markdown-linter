/**
 * AppleScript command bridge for MarkEdit integration.
 *
 * Provides a simple command interface that can be invoked from AppleScript
 * to perform linting, formatting, and statistics operations.
 *
 * @module applescript/bridge
 */

import { Text } from "@codemirror/state";
import { LintingEngine, createDefaultConfiguration } from "../linter/engine";
import { Formatter } from "../formatter/formatter";
import { calculateStatistics } from "../linter/statistics";

/**
 * Available AppleScript commands.
 */
export type AppleScriptCommand = "validate" | "format" | "getStatistics";

/**
 * Input parameters for AppleScript commands.
 */
export interface AppleScriptInput {
  /** The document content to process */
  content?: string;
}

/**
 * Result of an AppleScript command execution.
 */
export interface AppleScriptResult<T = unknown> {
  /** Whether the command succeeded */
  success: boolean;
  /** Result data (if successful) */
  data?: T;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Bridge interface for AppleScript commands.
 */
export interface AppleScriptBridge {
  /**
   * Executes a command with the given input.
   *
   * @param command - The command to execute
   * @param input - Input parameters
   * @returns Command result
   */
  execute<T = unknown>(
    command: AppleScriptCommand,
    input: AppleScriptInput
  ): AppleScriptResult<T>;

  /**
   * Gets the list of available commands.
   *
   * @returns Array of command names
   */
  getAvailableCommands(): AppleScriptCommand[];
}

/**
 * Validate command result.
 */
interface ValidateResult {
  total: number;
  errors: number;
  warnings: number;
  infos: number;
}

/**
 * Format command result.
 */
interface FormatResult {
  formatted: string;
  fixedCount: number;
}

/**
 * Creates the AppleScript bridge.
 *
 * @returns AppleScript bridge instance
 */
export function createAppleScriptBridge(): AppleScriptBridge {
  const config = createDefaultConfiguration();
  const engine = new LintingEngine(config);
  const formatter = new Formatter(engine);

  return {
    execute<T = unknown>(
      command: AppleScriptCommand,
      input: AppleScriptInput
    ): AppleScriptResult<T> {
      try {
        // Check if command is valid
        const validCommands: AppleScriptCommand[] = ["validate", "format", "getStatistics"];
        if (!validCommands.includes(command)) {
          return {
            success: false,
            error: `Unknown command: ${command}`,
          };
        }

        // Validate input
        if (!input.content && input.content !== "") {
          return {
            success: false,
            error: "Missing required parameter: content",
          };
        }

        const doc = Text.of(input.content.split("\n"));

        switch (command) {
          case "validate": {
            const diagnostics = engine.lint(doc);
            const stats = calculateStatistics(diagnostics, doc.lines);
            const result: ValidateResult = {
              total: stats.total,
              errors: stats.errors,
              warnings: stats.warnings,
              infos: stats.infos,
            };
            return { success: true, data: result as T };
          }

          case "format": {
            const formatResult = formatter.format(doc);
            const result: FormatResult = {
              formatted: formatResult.text,
              fixedCount: formatResult.fixedCount,
            };
            return { success: true, data: result as T };
          }

          case "getStatistics": {
            const diagnostics = engine.lint(doc);
            const stats = calculateStatistics(diagnostics, doc.lines);
            return { success: true, data: stats as T };
          }

          default:
            return {
              success: false,
              error: `Unknown command: ${command}`,
            };
        }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    },

    getAvailableCommands(): AppleScriptCommand[] {
      return ["validate", "format", "getStatistics"];
    },
  };
}
