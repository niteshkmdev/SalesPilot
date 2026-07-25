import { CustomFieldType } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { slugifyCustomFieldName } from "@/modules/custom-fields/dto/custom-field.mapper";
import {
  isEmptyCustomValue,
  validateCustomFieldValue,
} from "@/modules/custom-fields/services/custom-field-value";
import { AppError } from "@/shared/api/errors";

describe("slugifyCustomFieldName", () => {
  it("slugifies names", () => {
    expect(slugifyCustomFieldName("Preferred Contact Time")).toBe(
      "preferred-contact-time",
    );
  });

  it("falls back for empty input", () => {
    expect(slugifyCustomFieldName("!!!")).toBe("field");
  });
});

describe("validateCustomFieldValue", () => {
  it("requires text when marked required", () => {
    expect(() =>
      validateCustomFieldValue(CustomFieldType.TEXT, "", {
        required: true,
        fieldName: "Industry",
      }),
    ).toThrow(AppError);
  });

  it("normalizes email values", () => {
    expect(
      validateCustomFieldValue(CustomFieldType.EMAIL, " a@b.com ", {
        required: true,
        fieldName: "Work email",
      }),
    ).toBe("a@b.com");
  });

  it("rejects invalid email", () => {
    expect(() =>
      validateCustomFieldValue(CustomFieldType.EMAIL, "nope", {
        required: true,
        fieldName: "Work email",
      }),
    ).toThrow(AppError);
  });

  it("parses numbers", () => {
    expect(
      validateCustomFieldValue(CustomFieldType.NUMBER, "42.5", {
        required: true,
        fieldName: "Budget",
      }),
    ).toBe(42.5);
  });

  it("rejects unsupported types", () => {
    expect(() =>
      validateCustomFieldValue(CustomFieldType.SELECT, "x", {
        required: false,
        fieldName: "Choice",
      }),
    ).toThrow(AppError);
  });

  it("treats empty optional as null", () => {
    expect(
      validateCustomFieldValue(CustomFieldType.TEXT, "  ", {
        required: false,
        fieldName: "Notes",
      }),
    ).toBeNull();
    expect(isEmptyCustomValue(null)).toBe(true);
  });
});
