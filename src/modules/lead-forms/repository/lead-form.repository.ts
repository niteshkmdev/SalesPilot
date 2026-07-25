import type { LeadForm, LeadFormStatus, Prisma } from "@prisma/client";
import {
  type FormFieldConfig,
  FormFieldsConfigSchema,
  type LeadFormDetailDto,
  type LeadFormListItemDto,
  publicFormPath,
} from "@/modules/lead-forms/dto/lead-form.dto";
import type { DatabaseClient } from "@/server/db/types";

/**
 * MongoDB: `deletedAt: null` alone excludes forms that never had the field written.
 * Match both explicit null and unset.
 */
const notDeleted: Prisma.LeadFormWhereInput = {
  OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
};

export function parseFormFields(value: Prisma.JsonValue): FormFieldConfig[] {
  const parsed = FormFieldsConfigSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function toLeadFormListItemDto(
  form: LeadForm,
  organizationSlug: string,
): LeadFormListItemDto {
  return {
    id: form.id,
    name: form.name,
    slug: form.slug,
    status: form.status,
    updatedAt: form.updatedAt.toISOString(),
    publicPath: publicFormPath(organizationSlug, form.slug),
  };
}

export function toLeadFormDetailDto(
  form: LeadForm,
  organizationSlug: string,
  organizationLogo: string | null = null,
): LeadFormDetailDto {
  return {
    id: form.id,
    organizationId: form.organizationId,
    organizationSlug,
    name: form.name,
    slug: form.slug,
    description: form.description,
    status: form.status,
    brandingDisplay: form.brandingDisplay,
    fields: parseFormFields(form.fields),
    defaultAssignedManagerId: form.defaultAssignedManagerId,
    successMessage: form.successMessage,
    allowIndexing: form.allowIndexing,
    createdAt: form.createdAt.toISOString(),
    updatedAt: form.updatedAt.toISOString(),
    publicPath: publicFormPath(organizationSlug, form.slug),
    organizationLogo,
  };
}

export async function listLeadForms(
  db: DatabaseClient,
  organizationId: string,
) {
  return db.leadForm.findMany({
    where: { organizationId, ...notDeleted },
    orderBy: { updatedAt: "desc" },
  });
}

export async function findLeadFormById(
  db: DatabaseClient,
  organizationId: string,
  formId: string,
) {
  return db.leadForm.findFirst({
    where: { id: formId, organizationId, ...notDeleted },
  });
}

export async function findLeadFormBySlug(
  db: DatabaseClient,
  organizationId: string,
  slug: string,
) {
  return db.leadForm.findFirst({
    where: { organizationId, slug, ...notDeleted },
  });
}

export async function findPublishedFormByOrgAndSlug(
  db: DatabaseClient,
  orgSlug: string,
  formSlug: string,
) {
  return db.leadForm.findFirst({
    where: {
      slug: formSlug,
      status: "PUBLISHED" satisfies LeadFormStatus,
      ...notDeleted,
      organization: { slug: orgSlug },
    },
    include: {
      organization: {
        include: { branding: true },
      },
    },
  });
}

export async function formSlugExists(
  db: DatabaseClient,
  organizationId: string,
  slug: string,
  excludeId?: string,
) {
  const existing = await db.leadForm.findFirst({
    where: {
      organizationId,
      slug,
      ...notDeleted,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function createLeadFormRecord(
  db: DatabaseClient,
  data: {
    organizationId: string;
    name: string;
    slug: string;
    description: string | null;
    fields: FormFieldConfig[];
    defaultAssignedManagerId: string | null;
    successMessage: string | null;
    allowIndexing: boolean;
    brandingDisplay?: import("@prisma/client").FormBrandingDisplay;
    createdBy: string;
  },
) {
  return db.leadForm.create({
    data: {
      organizationId: data.organizationId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      fields: data.fields as unknown as Prisma.InputJsonValue,
      defaultAssignedManagerId: data.defaultAssignedManagerId,
      successMessage: data.successMessage,
      allowIndexing: data.allowIndexing,
      brandingDisplay: data.brandingDisplay ?? "BOTH",
      status: "DRAFT",
      deletedAt: null,
      createdBy: data.createdBy,
    },
  });
}

export async function updateLeadFormRecord(
  db: DatabaseClient,
  formId: string,
  updatedById: string,
  data: {
    name?: string;
    slug?: string;
    description?: string | null;
    fields?: FormFieldConfig[];
    defaultAssignedManagerId?: string | null;
    successMessage?: string | null;
    allowIndexing?: boolean;
    brandingDisplay?: import("@prisma/client").FormBrandingDisplay;
    status?: LeadFormStatus;
    deletedAt?: Date | null;
  },
) {
  const patch: Prisma.LeadFormUpdateInput = {
    updater: { connect: { id: updatedById } },
  };
  if (data.name !== undefined) patch.name = data.name;
  if (data.slug !== undefined) patch.slug = data.slug;
  if (data.description !== undefined) patch.description = data.description;
  if (data.fields !== undefined) {
    patch.fields = data.fields as unknown as Prisma.InputJsonValue;
  }
  if (data.defaultAssignedManagerId !== undefined) {
    patch.defaultAssignedManager = data.defaultAssignedManagerId
      ? { connect: { id: data.defaultAssignedManagerId } }
      : { disconnect: true };
  }
  if (data.successMessage !== undefined) {
    patch.successMessage = data.successMessage;
  }
  if (data.allowIndexing !== undefined) {
    patch.allowIndexing = data.allowIndexing;
  }
  if (data.brandingDisplay !== undefined) {
    patch.brandingDisplay = data.brandingDisplay;
  }
  if (data.status !== undefined) patch.status = data.status;
  if (data.deletedAt !== undefined) patch.deletedAt = data.deletedAt;

  return db.leadForm.update({
    where: { id: formId },
    data: patch,
  });
}

export async function createFormSubmissionRecord(
  db: DatabaseClient,
  data: {
    organizationId: string;
    leadFormId: string;
    leadId: string;
    payload: Prisma.InputJsonValue;
    ipAddress: string | null;
    userAgent: string | null;
  },
) {
  return db.formSubmission.create({
    data: {
      organizationId: data.organizationId,
      leadFormId: data.leadFormId,
      leadId: data.leadId,
      payload: data.payload,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });
}

export async function findWebsiteSource(
  db: DatabaseClient,
  organizationId: string,
) {
  return db.organizationLeadSource.findFirst({
    where: {
      organizationId,
      active: true,
      name: { equals: "Website", mode: "insensitive" },
    },
  });
}
