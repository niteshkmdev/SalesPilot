import type { CustomField, CustomFieldType } from "@prisma/client";
import type {
  CustomFieldDto,
  LeadCustomValueDto,
  MvpCustomFieldType,
} from "@/modules/custom-fields/dto/custom-field.dto";

export function toCustomFieldDto(field: CustomField): CustomFieldDto {
  return {
    id: field.id,
    organizationId: field.organizationId,
    name: field.name,
    slug: field.slug,
    type: field.type as MvpCustomFieldType | CustomFieldType,
    required: field.required,
    placeholder: field.placeholder,
    helpText: field.helpText,
    defaultValue: field.defaultValue,
    displayOrder: field.displayOrder,
    active: field.active,
  };
}

export function toLeadCustomValueDto(
  field: CustomField,
  value: unknown,
): LeadCustomValueDto {
  return {
    fieldId: field.id,
    name: field.name,
    slug: field.slug,
    type: field.type,
    required: field.required,
    active: field.active,
    value,
  };
}

export function slugifyCustomFieldName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return base || "field";
}
