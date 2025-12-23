/**
 * Configuration schema validation.
 *
 * @module config/schema
 */

/**
 * Validation error details.
 */
export interface ValidationError {
  /** Path to the invalid property */
  path: string;
  /** Error message */
  message: string;
}

/**
 * Validation result.
 */
export interface ValidationResult {
  /** Whether the configuration is valid */
  valid: boolean;
  /** List of validation errors */
  errors: ValidationError[];
}

/**
 * Valid severity values.
 */
const VALID_SEVERITIES = ["error", "warning", "info"];

/**
 * Validates a raw configuration object.
 *
 * @param config - The configuration to validate
 * @returns Validation result
 */
export function validateConfig(config: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (config === null || typeof config !== "object") {
    return {
      valid: false,
      errors: [{ path: "", message: "Configuration must be an object" }],
    };
  }

  const obj = config as Record<string, unknown>;

  // Validate 'default' property
  if ("default" in obj && typeof obj["default"] !== "boolean") {
    errors.push({
      path: "default",
      message: "Default must be a boolean",
    });
  }

  // Validate 'extends' property
  if ("extends" in obj) {
    const extendsValue = obj["extends"];
    if (typeof extendsValue !== "string") {
      errors.push({
        path: "extends",
        message: "Extends must be a string",
      });
    } else if (extendsValue !== "recommended") {
      errors.push({
        path: "extends",
        message: `Unknown preset: ${extendsValue}. Available: recommended`,
      });
    }
  }

  // Validate rule entries
  for (const [key, value] of Object.entries(obj)) {
    if (key === "default" || key === "extends") {
      continue;
    }

    // Only validate MD* keys as rules
    if (!key.startsWith("MD") && !key.startsWith("md")) {
      continue;
    }

    const path = key;

    // Validate rule value
    if (typeof value === "boolean") {
      // Valid: boolean
      continue;
    }

    if (typeof value === "string") {
      if (!VALID_SEVERITIES.includes(value)) {
        errors.push({
          path,
          message: `Invalid severity: ${value}. Must be error, warning, or info`,
        });
      }
      continue;
    }

    if (typeof value === "object" && value !== null) {
      // Valid: object with options
      validateRuleOptions(key, value as Record<string, unknown>, errors);
      continue;
    }

    errors.push({
      path,
      message: "Rule value must be boolean, severity string, or options object",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates rule-specific options.
 *
 * @param ruleId - The rule ID
 * @param options - The options object
 * @param errors - Array to collect errors
 */
function validateRuleOptions(
  ruleId: string,
  options: Record<string, unknown>,
  errors: ValidationError[]
): void {
  const id = ruleId.toUpperCase();

  // Validate known options for specific rules
  switch (id) {
    case "MD007":
      if ("indent" in options && typeof options["indent"] !== "number") {
        errors.push({
          path: `${ruleId}.indent`,
          message: "indent must be a number",
        });
      }
      break;

    case "MD012":
      if ("maximum" in options && typeof options["maximum"] !== "number") {
        errors.push({
          path: `${ruleId}.maximum`,
          message: "maximum must be a number",
        });
      }
      break;

    case "MD013":
      if ("line_length" in options && typeof options["line_length"] !== "number") {
        errors.push({
          path: `${ruleId}.line_length`,
          message: "line_length must be a number",
        });
      }
      if ("code_blocks" in options && typeof options["code_blocks"] !== "boolean") {
        errors.push({
          path: `${ruleId}.code_blocks`,
          message: "code_blocks must be a boolean",
        });
      }
      if ("tables" in options && typeof options["tables"] !== "boolean") {
        errors.push({
          path: `${ruleId}.tables`,
          message: "tables must be a boolean",
        });
      }
      break;
  }
}

/**
 * Formats validation errors into a human-readable message.
 *
 * @param result - The validation result
 * @returns Formatted error message or null if valid
 */
export function formatValidationErrors(result: ValidationResult): string | null {
  if (result.valid) {
    return null;
  }

  const lines = ["Configuration validation failed:"];
  for (const error of result.errors) {
    const path = error.path ? `${error.path}: ` : "";
    lines.push(`  - ${path}${error.message}`);
  }

  return lines.join("\n");
}
