import { CustomFieldType } from "@prisma/client";
import { z } from "zod";

/** Types exposed in MVP UI (DATE/SELECT/CHECKBOX deferred). */
export const mvpCustomFieldTypes = [
  CustomFieldType.TEXT,
  CustomFieldType.TEXTAREA,
  CustomFieldType.EMAIL,
  CustomFieldType.PHONE,
  CustomFieldType.NUMBER,
] as const;

export type MvpCustomFieldType = (typeof mvpCustomFieldTypes)[number];

export const MvpCustomFieldTypeSchema = z.enum(mvpCustomFieldTypes);

export const CreateCustomFieldSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  type: MvpCustomFieldTypeSchema,
  required: z.boolean().optional().default(false),
  placeholder: z.string().trim().max(160).optional().or(z.literal("")),
  helpText: z.string().trim().max(280).optional().or(z.literal("")),
});

export type CreateCustomFieldDto = z.infer<typeof CreateCustomFieldSchema>;

export const UpdateCustomFieldSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  required: z.boolean().optional(),
  placeholder: z.string().trim().max(160).optional().nullable(),
  helpText: z.string().trim().max(280).optional().nullable(),
  active: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export type UpdateCustomFieldDto = z.infer<typeof UpdateCustomFieldSchema>;

export const ReorderCustomFieldsSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export type ReorderCustomFieldsDto = z.infer<typeof ReorderCustomFieldsSchema>;

export interface CustomFieldDto {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  type: MvpCustomFieldType | CustomFieldType;
  required: boolean;
  placeholder: string | null;
  helpText: string | null;
  defaultValue: unknown;
  displayOrder: number;
  active: boolean;
}

export interface LeadCustomValueDto {
  fieldId: string;
  name: string;
  slug: string;
  type: CustomFieldType;
  required: boolean;
  active: boolean;
  value: unknown;
}

/** Map of fieldId → raw value from forms / actions. */
export const CustomValuesMapSchema = z
  .record(z.string(), z.unknown())
  .optional();

export type CustomValuesMap = z.infer<typeof CustomValuesMapSchema>;
