"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CustomFieldDto } from "@/modules/custom-fields/dto/custom-field.dto";

interface CustomFieldsFormSectionProps {
  fields: CustomFieldDto[];
  /** fieldId → display value for edit mode */
  initialValues?: Record<string, unknown>;
  disabled?: boolean;
  namePrefix?: string;
}

function defaultStringValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export function CustomFieldsFormSection({
  fields,
  initialValues = {},
  disabled = false,
  namePrefix = "custom",
}: CustomFieldsFormSectionProps) {
  const sorted = useMemo(
    () => [...fields].sort((a, b) => a.displayOrder - b.displayOrder),
    [fields],
  );

  if (sorted.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium">Additional fields</h3>
        <p className="text-sm text-muted-foreground">
          Organization-specific fields for this lead.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {sorted.map((field) => {
          const inputName = `${namePrefix}.${field.id}`;
          const defaultValue = defaultStringValue(initialValues[field.id]);
          const id = `custom-field-${field.id}`;

          if (field.type === "TEXTAREA") {
            return (
              <div key={field.id} className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor={id}>
                  {field.name}
                  {field.required ? " *" : ""}
                </Label>
                <Textarea
                  id={id}
                  name={inputName}
                  placeholder={field.placeholder ?? undefined}
                  defaultValue={defaultValue}
                  required={field.required}
                  disabled={disabled}
                  rows={3}
                />
                {field.helpText ? (
                  <p className="text-xs text-muted-foreground">
                    {field.helpText}
                  </p>
                ) : null}
              </div>
            );
          }

          const inputType =
            field.type === "EMAIL"
              ? "email"
              : field.type === "PHONE"
                ? "tel"
                : field.type === "NUMBER"
                  ? "number"
                  : "text";

          return (
            <div key={field.id} className="flex flex-col gap-2">
              <Label htmlFor={id}>
                {field.name}
                {field.required ? " *" : ""}
              </Label>
              <Input
                id={id}
                name={inputName}
                type={inputType}
                placeholder={field.placeholder ?? undefined}
                defaultValue={defaultValue}
                required={field.required}
                disabled={disabled}
              />
              {field.helpText ? (
                <p className="text-xs text-muted-foreground">
                  {field.helpText}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Extract `custom.<fieldId>` entries from FormData into a map. */
export function collectCustomValuesFromFormData(
  formData: FormData,
  namePrefix = "custom",
): Record<string, unknown> {
  const prefix = `${namePrefix}.`;
  const values: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith(prefix)) continue;
    const fieldId = key.slice(prefix.length);
    if (!fieldId) continue;
    values[fieldId] = typeof value === "string" ? value : String(value);
  }
  return values;
}
