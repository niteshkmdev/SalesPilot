import {
  type CountryCode,
  getExampleNumber,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import {
  DEFAULT_PHONE_COUNTRY,
  getPhoneCountry,
  type PhoneCountry,
} from "@/shared/phone/countries";

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Max national significant number length for the country (typing clamp).
 * Falls back to example mobile length, then 15 (E.164 national max).
 */
export function getNationalMaxLength(iso2: string): number {
  const country = iso2.toUpperCase() as CountryCode;
  try {
    const example = getExampleNumber(country, examples);
    if (example) {
      return example.nationalNumber.length;
    }
  } catch {
    // ignore missing metadata
  }
  // India mobiles are 10 digits; hard-code as safety if examples fail.
  if (country === "IN") return 10;
  return 15;
}

export function clampNationalNumber(national: string, iso2: string): string {
  const digits = digitsOnly(national);
  const max = getNationalMaxLength(iso2);
  return digits.slice(0, max);
}

export function isValidNationalPhone(national: string, iso2: string): boolean {
  const digits = digitsOnly(national);
  if (!digits) return false;
  const country = iso2.toUpperCase() as CountryCode;
  return isValidPhoneNumber(digits, country);
}

/**
 * Build E.164 from national digits + country. Returns null if empty or invalid.
 */
export function normalizeToE164(national: string, iso2: string): string | null {
  const digits = digitsOnly(national);
  if (!digits) return null;
  const country = iso2.toUpperCase() as CountryCode;
  const parsed = parsePhoneNumberFromString(digits, country);
  if (!parsed || !parsed.isValid()) return null;
  return parsed.format("E.164");
}

export type ParsedStoredPhone = {
  iso2: string;
  national: string;
  e164: string | null;
  country: PhoneCountry;
};

/**
 * Parse a stored E.164 (or loose) phone for edit forms.
 * Unknown / invalid → default India with best-effort national digits.
 */
export function parseStoredPhone(
  value: string | null | undefined,
): ParsedStoredPhone {
  const defaultCountry = getPhoneCountry(DEFAULT_PHONE_COUNTRY);
  const raw = (value ?? "").trim();

  if (!raw) {
    return {
      iso2: DEFAULT_PHONE_COUNTRY,
      national: "",
      e164: null,
      country: defaultCountry,
    };
  }

  const parsed = parsePhoneNumberFromString(raw);
  if (parsed?.country && parsed.isValid()) {
    const iso2 = parsed.country;
    return {
      iso2,
      national: parsed.nationalNumber,
      e164: parsed.format("E.164"),
      country: getPhoneCountry(iso2),
    };
  }

  // Try as national number for default country
  const asDefault = parsePhoneNumberFromString(
    digitsOnly(raw),
    DEFAULT_PHONE_COUNTRY as CountryCode,
  );
  if (asDefault?.isValid()) {
    return {
      iso2: DEFAULT_PHONE_COUNTRY,
      national: asDefault.nationalNumber,
      e164: asDefault.format("E.164"),
      country: defaultCountry,
    };
  }

  return {
    iso2: DEFAULT_PHONE_COUNTRY,
    national: clampNationalNumber(raw, DEFAULT_PHONE_COUNTRY),
    e164: null,
    country: defaultCountry,
  };
}

export function phoneValidationMessage(iso2: string): string {
  const country = getPhoneCountry(iso2);
  const max = getNationalMaxLength(iso2);
  if (iso2.toUpperCase() === "IN") {
    return "Enter a valid 10-digit Indian mobile number";
  }
  return `Enter a valid ${max}-digit ${country.name} phone number`;
}

/**
 * Validate optional phone: empty → ok (null). Non-empty must be valid E.164 or national+country.
 * Accepts already-normalized E.164 strings from the client.
 */
export function validateOptionalPhoneValue(
  value: string | null | undefined,
): { ok: true; e164: string | null } | { ok: false; message: string } {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return { ok: true, e164: null };
  }

  if (isValidPhoneNumber(trimmed)) {
    const parsed = parsePhoneNumberFromString(trimmed);
    return { ok: true, e164: parsed?.format("E.164") ?? trimmed };
  }

  // National digits without country — assume India
  if (isValidNationalPhone(trimmed, DEFAULT_PHONE_COUNTRY)) {
    return {
      ok: true,
      e164: normalizeToE164(trimmed, DEFAULT_PHONE_COUNTRY),
    };
  }

  return {
    ok: false,
    message: phoneValidationMessage(DEFAULT_PHONE_COUNTRY),
  };
}

export function validateRequiredPhoneValue(
  value: string | null | undefined,
): { ok: true; e164: string } | { ok: false; message: string } {
  const result = validateOptionalPhoneValue(value);
  if (!result.ok) return result;
  if (!result.e164) {
    return { ok: false, message: "Phone number is required" };
  }
  return { ok: true, e164: result.e164 };
}
