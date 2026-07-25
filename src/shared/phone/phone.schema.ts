import { z } from "zod";
import { DEFAULT_PHONE_COUNTRY } from "@/shared/phone/countries";
import {
  phoneValidationMessage,
  validateOptionalPhoneValue,
} from "@/shared/phone/phone";

/**
 * Optional phone: empty string → "". Valid values normalized to E.164.
 */
export const optionalPhoneSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .superRefine((value, ctx) => {
    const result = validateOptionalPhoneValue(value);
    if (!result.ok) {
      ctx.addIssue({
        code: "custom",
        message: result.message,
      });
    }
  })
  .transform((value) => {
    const result = validateOptionalPhoneValue(value);
    if (result.ok && result.e164) return result.e164;
    return "";
  });

export const requiredPhoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .superRefine((value, ctx) => {
    const result = validateOptionalPhoneValue(value);
    if (!result.ok || !result.e164) {
      ctx.addIssue({
        code: "custom",
        message: result.ok ? "Phone number is required" : result.message,
      });
    }
  })
  .transform((value) => {
    const result = validateOptionalPhoneValue(value);
    if (result.ok && result.e164) return result.e164;
    return value;
  });

export function optionalPhoneFieldError(
  value: string | null | undefined,
): string | null {
  const result = validateOptionalPhoneValue(value);
  if (!result.ok) return result.message;
  return null;
}

export function getDefaultPhoneErrorMessage(): string {
  return phoneValidationMessage(DEFAULT_PHONE_COUNTRY);
}
