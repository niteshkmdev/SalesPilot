import type { LeadFormStatus } from "@prisma/client";
import { z } from "zod";

export const formCoreKeys = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "company",
  "description",
] as const;

export type FormCoreKey = (typeof formCoreKeys)[number];

export const FormFieldConfigSchema = z.object({
  key: z.string().min(1),
  kind: z.enum(["core", "custom"]),
  coreKey: z.enum(formCoreKeys).optional(),
  customFieldId: z.string().min(1).optional(),
  required: z.boolean(),
  displayOrder: z.number().int().min(0),
});

export type FormFieldConfig = z.infer<typeof FormFieldConfigSchema>;

export const FormFieldsConfigSchema = z.array(FormFieldConfigSchema);

export function defaultFormFields(): FormFieldConfig[] {
  return [
    {
      key: "core:firstName",
      kind: "core",
      coreKey: "firstName",
      required: true,
      displayOrder: 10,
    },
    {
      key: "core:lastName",
      kind: "core",
      coreKey: "lastName",
      required: true,
      displayOrder: 20,
    },
    {
      key: "core:email",
      kind: "core",
      coreKey: "email",
      required: true,
      displayOrder: 30,
    },
    {
      key: "core:phone",
      kind: "core",
      coreKey: "phone",
      required: false,
      displayOrder: 40,
    },
    {
      key: "core:company",
      kind: "core",
      coreKey: "company",
      required: false,
      displayOrder: 50,
    },
    {
      key: "core:description",
      kind: "core",
      coreKey: "description",
      required: false,
      displayOrder: 60,
    },
  ];
}

export const CreateLeadFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  fields: FormFieldsConfigSchema.optional(),
  defaultAssignedManagerId: z.string().optional().or(z.literal("")),
  successMessage: z.string().trim().max(500).optional().or(z.literal("")),
  allowIndexing: z.boolean().optional().default(false),
});

export type CreateLeadFormDto = z.infer<typeof CreateLeadFormSchema>;

export const UpdateLeadFormSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().trim().max(500).optional().nullable(),
  fields: FormFieldsConfigSchema.optional(),
  defaultAssignedManagerId: z.string().optional().nullable(),
  successMessage: z.string().trim().max(500).optional().nullable(),
  allowIndexing: z.boolean().optional(),
});

export type UpdateLeadFormDto = z.infer<typeof UpdateLeadFormSchema>;

export const PublicFormSubmitSchema = z.object({
  values: z.record(z.string(), z.unknown()),
  turnstileToken: z.string().optional(),
});

export type PublicFormSubmitDto = z.infer<typeof PublicFormSubmitSchema>;

export interface LeadFormListItemDto {
  id: string;
  name: string;
  slug: string;
  status: LeadFormStatus;
  updatedAt: string;
  publicPath: string;
}

export interface LeadFormDetailDto {
  id: string;
  organizationId: string;
  organizationSlug: string;
  name: string;
  slug: string;
  description: string | null;
  status: LeadFormStatus;
  fields: FormFieldConfig[];
  defaultAssignedManagerId: string | null;
  successMessage: string | null;
  allowIndexing: boolean;
  createdAt: string;
  updatedAt: string;
  publicPath: string;
}

export interface PublicFormFieldDto {
  key: string;
  kind: "core" | "custom";
  label: string;
  inputType: "text" | "email" | "tel" | "number" | "textarea";
  required: boolean;
  placeholder: string | null;
  helpText: string | null;
  displayOrder: number;
}

export interface PublicFormDto {
  name: string;
  description: string | null;
  successMessage: string | null;
  allowIndexing: boolean;
  fields: PublicFormFieldDto[];
  branding: {
    logo: string | null;
    primaryColor: string | null;
    accentColor: string | null;
  };
  turnstileSiteKey: string | null;
  organizationName: string;
}

export function slugifyFormName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "form";
}

export function publicFormPath(orgSlug: string, formSlug: string): string {
  return `/forms/${orgSlug}/${formSlug}`;
}

export const coreFieldLabels: Record<FormCoreKey, string> = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone",
  company: "Company",
  description: "Message",
};
