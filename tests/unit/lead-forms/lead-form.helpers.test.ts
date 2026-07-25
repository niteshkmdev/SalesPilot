import { describe, expect, it } from "vitest";
import {
  defaultFormFields,
  FormFieldsConfigSchema,
  publicFormPath,
  slugifyFormName,
} from "@/modules/lead-forms/dto/lead-form.dto";
import { assertPublicSubmitRateLimit } from "@/modules/lead-forms/services/rate-limit";

describe("lead form dto helpers", () => {
  it("builds default core fields with firstName required", () => {
    const fields = defaultFormFields();
    expect(fields.some((f) => f.coreKey === "firstName" && f.required)).toBe(
      true,
    );
    expect(FormFieldsConfigSchema.parse(fields)).toHaveLength(6);
  });

  it("slugifies form names and builds public paths", () => {
    expect(slugifyFormName("Contact Us!")).toBe("contact-us");
    expect(publicFormPath("acme", "contact-us")).toBe("/forms/acme/contact-us");
  });
});

describe("assertPublicSubmitRateLimit", () => {
  it("allows a burst under the limit then blocks", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 12; i += 1) {
      expect(() => assertPublicSubmitRateLimit(key)).not.toThrow();
    }
    expect(() => assertPublicSubmitRateLimit(key)).toThrow(
      /Too many submissions/,
    );
  });
});
