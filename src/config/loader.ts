/**
 * Configuration file loader.
 *
 * Handles loading and merging of .markdownlintrc configuration files.
 *
 * @module config/loader
 */

/**
 * Raw configuration value for a rule.
 * Can be boolean, severity string, or object with options.
 */
export type RuleConfigValue =
  | boolean
  | "error"
  | "warning"
  | "info"
  | Record<string, unknown>;

/**
 * Parsed configuration structure.
 */
export interface ParsedConfig {
  /** Rule configurations */
  rules: Record<string, RuleConfigValue>;
  /** Default enabled state for rules not explicitly configured */
  default?: boolean;
  /** Preset to extend */
  extends?: string;
}

/**
 * Resolved configuration with all defaults applied.
 */
export interface ResolvedConfig {
  /** Rule configurations */
  rules: Record<string, RuleConfigValue>;
  /** Default enabled state (always defined after resolution) */
  default: boolean;
}

/**
 * Recommended preset configuration.
 */
const RECOMMENDED_PRESET: ParsedConfig = {
  rules: {
    MD001: true,
    MD003: true,
    MD004: true,
    MD005: true,
    MD007: true,
    MD009: true,
    MD010: true,
    MD012: true,
    MD013: { line_length: 80 },
    MD014: true,
    MD018: true,
    MD019: true,
    MD020: true,
    MD021: true,
    MD022: true,
  },
  default: true,
};

/**
 * Available presets.
 */
const PRESETS: Record<string, ParsedConfig> = {
  recommended: RECOMMENDED_PRESET,
};

/**
 * Parses a raw configuration object into a ParsedConfig.
 *
 * @param raw - The raw configuration object
 * @returns Parsed configuration
 */
export function parseConfig(raw: Record<string, unknown>): ParsedConfig {
  const rules: Record<string, RuleConfigValue> = {};
  let defaultEnabled: boolean | undefined;
  let extendsPreset: string | undefined;

  for (const [key, value] of Object.entries(raw)) {
    if (key === "default") {
      if (typeof value === "boolean") {
        defaultEnabled = value;
      }
      continue;
    }

    if (key === "extends") {
      if (typeof value === "string") {
        extendsPreset = value;
      }
      continue;
    }

    // Skip non-rule keys
    if (!key.startsWith("MD") && !key.startsWith("md")) {
      continue;
    }

    // Normalize rule ID to uppercase
    const ruleId = key.toUpperCase();

    if (typeof value === "boolean") {
      rules[ruleId] = value;
    } else if (
      typeof value === "string" &&
      (value === "error" || value === "warning" || value === "info")
    ) {
      rules[ruleId] = value;
    } else if (typeof value === "object" && value !== null) {
      rules[ruleId] = value as Record<string, unknown>;
    }
  }

  const result: ParsedConfig = { rules };

  if (defaultEnabled !== undefined) {
    result.default = defaultEnabled;
  }

  if (extendsPreset !== undefined) {
    result.extends = extendsPreset;
  }

  return result;
}

/**
 * Merges two configurations, with override taking precedence.
 *
 * @param base - The base configuration
 * @param override - The override configuration
 * @returns Merged configuration
 */
export function mergeConfigs(
  base: ParsedConfig,
  override: ParsedConfig
): ParsedConfig {
  const result: ParsedConfig = {
    rules: { ...base.rules, ...override.rules },
  };

  // Use override's default if defined, otherwise use base's
  if (override.default !== undefined) {
    result.default = override.default;
  } else if (base.default !== undefined) {
    result.default = base.default;
  }

  // Don't inherit extends
  return result;
}

/**
 * Resolves a configuration by applying presets and defaults.
 *
 * @param config - The parsed configuration
 * @returns Fully resolved configuration
 */
export function resolveConfig(config: ParsedConfig): ResolvedConfig {
  let baseConfig: ParsedConfig = { rules: {}, default: true };

  // Apply extends preset if specified
  if (config.extends) {
    const preset = PRESETS[config.extends];
    if (preset) {
      baseConfig = mergeConfigs(baseConfig, preset);
    }
  }

  // Merge user config over base/preset
  const merged = mergeConfigs(baseConfig, config);

  return {
    rules: merged.rules,
    default: merged.default ?? true,
  };
}

/**
 * Parses a JSON configuration string.
 *
 * @param json - The JSON string to parse
 * @returns Parsed configuration or null if invalid
 */
export function parseConfigJson(json: string): ParsedConfig | null {
  try {
    const raw = JSON.parse(json) as Record<string, unknown>;
    return parseConfig(raw);
  } catch {
    return null;
  }
}
