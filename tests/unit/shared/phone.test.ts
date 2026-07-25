import { describe, expect, it } from "vitest";
import {
  clampNationalNumber,
  filterPhoneCountries,
  getNationalMaxLength,
  normalizeToE164,
  optionalPhoneSchema,
  parseStoredPhone,
  validateOptionalPhoneValue,
} from "@/shared/phone";

describe("getNationalMaxLength", () => {
  it("returns 10 for India", () => {
    expect(getNationalMaxLength("IN")).toBe(10);
  });
});

describe("clampNationalNumber", () => {
  it("strips non-digits and caps India at 10", () => {
    expect(clampNationalNumber("98765-43210-99", "IN")).toBe("9876543210");
  });
});

describe("normalizeToE164", () => {
  it("builds Indian E.164 from national digits", () => {
    expect(normalizeToE164("9876543210", "IN")).toBe("+919876543210");
  });

  it("returns null for incomplete India numbers", () => {
    expect(normalizeToE164("98765", "IN")).toBeNull();
  });
});

describe("parseStoredPhone", () => {
  it("parses E.164 back to India national", () => {
    const parsed = parseStoredPhone("+919876543210");
    expect(parsed.iso2).toBe("IN");
    expect(parsed.national).toBe("9876543210");
    expect(parsed.e164).toBe("+919876543210");
  });

  it("defaults empty to India", () => {
    const parsed = parseStoredPhone("");
    expect(parsed.iso2).toBe("IN");
    expect(parsed.national).toBe("");
  });
});

describe("filterPhoneCountries", () => {
  it("matches by country name", () => {
    const hits = filterPhoneCountries("indi");
    expect(hits.some((c) => c.iso2 === "IN")).toBe(true);
  });

  it("matches by dial code with or without plus", () => {
    expect(filterPhoneCountries("91").some((c) => c.iso2 === "IN")).toBe(true);
    expect(filterPhoneCountries("+91").some((c) => c.iso2 === "IN")).toBe(true);
  });

  it("matches by ISO code", () => {
    expect(filterPhoneCountries("in").some((c) => c.iso2 === "IN")).toBe(true);
  });
});

describe("validateOptionalPhoneValue", () => {
  it("allows empty", () => {
    expect(validateOptionalPhoneValue("")).toEqual({ ok: true, e164: null });
  });

  it("accepts E.164", () => {
    expect(validateOptionalPhoneValue("+919876543210")).toEqual({
      ok: true,
      e164: "+919876543210",
    });
  });

  it("rejects invalid", () => {
    const result = validateOptionalPhoneValue("+91123");
    expect(result.ok).toBe(false);
  });
});

describe("optionalPhoneSchema", () => {
  it("transforms empty to empty string", () => {
    expect(optionalPhoneSchema.parse("")).toBe("");
    expect(optionalPhoneSchema.parse(undefined)).toBe("");
  });

  it("normalizes valid E.164", () => {
    expect(optionalPhoneSchema.parse("+919876543210")).toBe("+919876543210");
  });

  it("rejects bad length with message", () => {
    const result = optionalPhoneSchema.safeParse("+91987");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/Indian|phone/i);
    }
  });
});
