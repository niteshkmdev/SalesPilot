import type { CustomFieldType } from "@prisma/client";
import { validationFailed } from "@/shared/api/errors";

function asTrimmedString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Validates and normalizes a custom field value for persistence as JSON.
 * Empty optional values become `null` (caller may skip writing).
 */
export function validateCustomFieldValue(
  type: CustomFieldType,
  value: unknown,
  options: { required: boolean; fieldName: string },
): unknown {
  const label = options.fieldName;

  if (
    type === "TEXT" ||
    type === "TEXTAREA" ||
    type === "EMAIL" ||
    type === "PHONE"
  ) {
    const text = asTrimmedString(value);
    if (text === null) {
      if (options.required) {
        throw validationFailed(`${label} is required.`);
      }
      return null;
    }
    if (type === "EMAIL") {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
      if (!emailOk) {
        throw validationFailed(`${label} must be a valid email.`);
      }
    }
    if (type === "PHONE" && text.length > 40) {
      throw validationFailed(`${label} is too long.`);
    }
    if (text.length > 2000) {
      throw validationFailed(`${label} is too long.`);
    }
    return text;
  }

  if (type === "NUMBER") {
    if (value === undefined || value === null || value === "") {
      if (options.required) {
        throw validationFailed(`${label} is required.`);
      }
      return null;
    }
    const num =
      typeof value === "number" ? value : Number(String(value).trim());
    if (!Number.isFinite(num)) {
      throw validationFailed(`${label} must be a number.`);
    }
    return num;
  }

  // DATE / SELECT / CHECKBOX not in MVP UI — reject if somehow submitted.
  throw validationFailed(`${label} uses an unsupported field type.`);
}

export function isEmptyCustomValue(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}
