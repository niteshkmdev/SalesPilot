import { describe, expect, it } from "vitest";
import {
  type FormFieldConfig,
  normalizeFormFieldsOrder,
} from "@/modules/lead-forms/dto/lead-form.dto";

describe("normalizeFormFieldsOrder", () => {
  it("puts core fields before custom even when phone was toggled last", () => {
    const fields: FormFieldConfig[] = [
      {
        key: "core:firstName",
        kind: "core",
        coreKey: "firstName",
        required: true,
        displayOrder: 10,
      },
      {
        key: "core:email",
        kind: "core",
        coreKey: "email",
        required: true,
        displayOrder: 20,
      },
      {
        key: "core:company",
        kind: "core",
        coreKey: "company",
        required: false,
        displayOrder: 30,
      },
      {
        key: "custom:cf1",
        kind: "custom",
        customFieldId: "cf1",
        required: false,
        displayOrder: 40,
      },
      {
        key: "core:phone",
        kind: "core",
        coreKey: "phone",
        required: false,
        displayOrder: 50,
      },
    ];

    const normalized = normalizeFormFieldsOrder(fields);
    expect(normalized.map((f) => f.key)).toEqual([
      "core:firstName",
      "core:email",
      "core:phone",
      "core:company",
      "custom:cf1",
    ]);
    expect(normalized.every((f, i) => f.displayOrder === (i + 1) * 10)).toBe(
      true,
    );
  });
});
