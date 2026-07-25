import type { Prisma } from "@prisma/client";
import { LeadActivityAction, recordLeadActivity } from "@/modules/activity";
import { requireAppContext } from "@/modules/auth/services/app-context.service";
import { findBrandingByOrganizationId } from "@/modules/branding";
import {
  findCustomFieldsByIds,
  listCustomFieldRecords,
  mvpCustomFieldTypes,
  normalizeCustomValuesForOrganization,
  replaceLeadCustomValues,
  validateCustomFieldValue,
} from "@/modules/custom-fields";
import {
  type CreateLeadFormDto,
  coreFieldLabels,
  defaultFormFields,
  type FormFieldConfig,
  type LeadFormDetailDto,
  type LeadFormListItemDto,
  normalizeFormFieldsOrder,
  type PublicFormDto,
  type PublicFormFieldDto,
  type UpdateLeadFormDto,
} from "@/modules/lead-forms/dto/lead-form.dto";
import {
  createFormSubmissionRecord,
  createLeadFormRecord,
  findLeadFormById,
  findPublishedFormByOrgAndSlug,
  findWebsiteSource,
  formSlugExists,
  listLeadForms,
  parseFormFields,
  toLeadFormDetailDto,
  toLeadFormListItemDto,
  updateLeadFormRecord,
} from "@/modules/lead-forms/repository/lead-form.repository";
import { resolveFormBrandingDisplay } from "@/modules/lead-forms/services/form-branding-display";
import { assertPublicSubmitRateLimit } from "@/modules/lead-forms/services/rate-limit";
import {
  getTurnstileSiteKey,
  verifyTurnstileToken,
} from "@/modules/lead-forms/services/turnstile";
import { emptyToNull } from "@/modules/leads/dto/lead.dto";
import {
  createLead as createLeadRecord,
  findDuplicateCandidates,
  getDefaultStatus,
} from "@/modules/leads/repository/lead.repository";
import { systemRoleNames } from "@/modules/organizations/constants/default-roles";
import { findMemberById } from "@/modules/organizations/repository/member.repository";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { createAuthorizationService } from "@/modules/permissions/services/authorization.service";
import { prisma } from "@/server/db/prisma";
import {
  ApiErrorCode,
  AppError,
  notFound,
  validationFailed,
} from "@/shared/api/errors";
import { validateOptionalPhoneValue } from "@/shared/phone";

async function orgLogoUrl(organizationId: string): Promise<string | null> {
  const branding = await findBrandingByOrganizationId(prisma, organizationId);
  return branding?.logo ?? null;
}

function validateFieldsConfig(
  fields: FormFieldConfig[],
  knownCustomIds: Set<string>,
) {
  if (fields.length === 0) {
    throw validationFailed("Form must include at least one field.");
  }
  const keys = new Set<string>();
  for (const field of fields) {
    if (keys.has(field.key)) {
      throw validationFailed("Duplicate field keys in form config.");
    }
    keys.add(field.key);
    if (field.kind === "core") {
      if (!field.coreKey) {
        throw validationFailed("Core field is missing coreKey.");
      }
    } else {
      if (!field.customFieldId) {
        throw validationFailed("Custom field entry is missing customFieldId.");
      }
      if (!knownCustomIds.has(field.customFieldId)) {
        throw validationFailed("Form references an unknown custom field.");
      }
    }
  }
  const hasFirstName = fields.some(
    (f) => f.kind === "core" && f.coreKey === "firstName",
  );
  if (!hasFirstName) {
    throw validationFailed("Form must include first name.");
  }
  const emailField = fields.find(
    (f) => f.kind === "core" && f.coreKey === "email",
  );
  if (!emailField) {
    throw validationFailed(
      "Form must include email (used for duplicate detection).",
    );
  }
  if (!emailField.required) {
    throw validationFailed("Email must be required.");
  }
}

async function resolveKnownCustomIds(organizationId: string) {
  const fields = await listCustomFieldRecords(prisma, organizationId, {
    activeOnly: true,
  });
  return new Set(
    fields
      .filter((f) =>
        (mvpCustomFieldTypes as readonly string[]).includes(f.type),
      )
      .map((f) => f.id),
  );
}

async function assertManagerAssignee(
  organizationId: string,
  memberId: string | null,
) {
  if (!memberId) return;
  const member = await findMemberById(prisma, memberId);
  if (!member || member.organizationId !== organizationId) {
    throw validationFailed(
      "Default manager is not a member of this organization.",
    );
  }
  const allowed = new Set<string>([
    systemRoleNames.owner,
    systemRoleNames.admin,
    systemRoleNames.manager,
  ]);
  if (!allowed.has(member.role.name)) {
    throw validationFailed("Default assignee must be a manager-level member.");
  }
}

export async function listOrganizationLeadForms(filters?: {
  q?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}): Promise<LeadFormListItemDto[]> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.FORM_READ,
  );

  const forms = await listLeadForms(prisma, ctx.organization.id);
  const q = filters?.q?.trim().toLowerCase();

  return forms
    .filter((form) => {
      if (filters?.status && form.status !== filters.status) return false;
      if (!q) return true;
      return (
        form.name.toLowerCase().includes(q) ||
        form.slug.toLowerCase().includes(q)
      );
    })
    .map((form) => toLeadFormListItemDto(form, ctx.organization.slug));
}

export async function getLeadForm(formId: string): Promise<LeadFormDetailDto> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.FORM_READ,
  );

  const form = await findLeadFormById(prisma, ctx.organization.id, formId);
  if (!form) throw notFound("Form not found.");
  const logo = await orgLogoUrl(ctx.organization.id);
  return toLeadFormDetailDto(form, ctx.organization.slug, logo);
}

export async function createLeadForm(
  data: CreateLeadFormDto,
): Promise<LeadFormDetailDto> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.FORM_CREATE,
  );

  if (await formSlugExists(prisma, ctx.organization.id, data.slug)) {
    throw validationFailed("A form with this slug already exists.");
  }

  const fields = normalizeFormFieldsOrder(
    data.fields?.length ? data.fields : defaultFormFields(),
  );
  const known = await resolveKnownCustomIds(ctx.organization.id);
  validateFieldsConfig(fields, known);

  const managerId = emptyToNull(data.defaultAssignedManagerId);
  await assertManagerAssignee(ctx.organization.id, managerId);

  const logo = await orgLogoUrl(ctx.organization.id);
  const brandingDisplay = resolveFormBrandingDisplay(
    data.brandingDisplay,
    Boolean(logo),
  );

  const form = await createLeadFormRecord(prisma, {
    organizationId: ctx.organization.id,
    name: data.name.trim(),
    slug: data.slug.trim(),
    description: emptyToNull(data.description),
    fields,
    defaultAssignedManagerId: managerId,
    successMessage: emptyToNull(data.successMessage),
    allowIndexing: data.allowIndexing ?? false,
    brandingDisplay,
    createdBy: ctx.member.id,
  });

  return toLeadFormDetailDto(form, ctx.organization.slug, logo);
}

export async function updateLeadForm(
  formId: string,
  data: UpdateLeadFormDto,
): Promise<LeadFormDetailDto> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.FORM_UPDATE,
  );

  const existing = await findLeadFormById(prisma, ctx.organization.id, formId);
  if (!existing) throw notFound("Form not found.");

  if (data.slug && data.slug !== existing.slug) {
    if (await formSlugExists(prisma, ctx.organization.id, data.slug, formId)) {
      throw validationFailed("A form with this slug already exists.");
    }
  }

  if (data.fields) {
    const known = await resolveKnownCustomIds(ctx.organization.id);
    validateFieldsConfig(data.fields, known);
  }

  const normalizedFields = data.fields
    ? normalizeFormFieldsOrder(data.fields)
    : undefined;

  if (data.defaultAssignedManagerId !== undefined) {
    await assertManagerAssignee(
      ctx.organization.id,
      data.defaultAssignedManagerId,
    );
  }

  const logo = await orgLogoUrl(ctx.organization.id);
  const brandingDisplay =
    data.brandingDisplay !== undefined
      ? resolveFormBrandingDisplay(data.brandingDisplay, Boolean(logo))
      : undefined;

  const form = await updateLeadFormRecord(prisma, formId, ctx.member.id, {
    name: data.name?.trim(),
    slug: data.slug?.trim(),
    description:
      data.description === undefined
        ? undefined
        : data.description === null
          ? null
          : emptyToNull(data.description),
    fields: normalizedFields,
    defaultAssignedManagerId: data.defaultAssignedManagerId,
    successMessage:
      data.successMessage === undefined
        ? undefined
        : data.successMessage === null
          ? null
          : emptyToNull(data.successMessage),
    allowIndexing: data.allowIndexing,
    brandingDisplay,
  });

  return toLeadFormDetailDto(form, ctx.organization.slug, logo);
}

export async function publishLeadForm(
  formId: string,
): Promise<LeadFormDetailDto> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.FORM_PUBLISH,
  );

  const existing = await findLeadFormById(prisma, ctx.organization.id, formId);
  if (!existing) throw notFound("Form not found.");
  if (existing.status === "ARCHIVED") {
    throw validationFailed("Archived forms cannot be published.");
  }

  const form = await updateLeadFormRecord(prisma, formId, ctx.member.id, {
    status: "PUBLISHED",
  });
  const logo = await orgLogoUrl(ctx.organization.id);
  return toLeadFormDetailDto(form, ctx.organization.slug, logo);
}

export async function archiveLeadForm(
  formId: string,
): Promise<LeadFormDetailDto> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.FORM_ARCHIVE,
  );

  const existing = await findLeadFormById(prisma, ctx.organization.id, formId);
  if (!existing) throw notFound("Form not found.");

  const form = await updateLeadFormRecord(prisma, formId, ctx.member.id, {
    status: "ARCHIVED",
  });
  const logo = await orgLogoUrl(ctx.organization.id);
  return toLeadFormDetailDto(form, ctx.organization.slug, logo);
}

export async function unarchiveLeadForm(
  formId: string,
): Promise<LeadFormDetailDto> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.FORM_ARCHIVE,
  );

  const existing = await findLeadFormById(prisma, ctx.organization.id, formId);
  if (!existing) throw notFound("Form not found.");
  if (existing.status !== "ARCHIVED") {
    throw validationFailed("Only archived forms can be unarchived.");
  }

  const form = await updateLeadFormRecord(prisma, formId, ctx.member.id, {
    status: "DRAFT",
  });
  const logo = await orgLogoUrl(ctx.organization.id);
  return toLeadFormDetailDto(form, ctx.organization.slug, logo);
}

export async function softDeleteLeadForm(formId: string): Promise<void> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.FORM_DELETE,
  );

  const existing = await findLeadFormById(prisma, ctx.organization.id, formId);
  if (!existing) throw notFound("Form not found.");

  await updateLeadFormRecord(prisma, formId, ctx.member.id, {
    deletedAt: new Date(),
  });
}

export async function getFormCapabilities() {
  const ctx = await requireAppContext();
  const authz = createAuthorizationService(ctx.permissions);
  return {
    canRead: await authz.can(Permissions.FORM_READ),
    canCreate: await authz.can(Permissions.FORM_CREATE),
    canUpdate: await authz.can(Permissions.FORM_UPDATE),
    canPublish: await authz.can(Permissions.FORM_PUBLISH),
    canArchive: await authz.can(Permissions.FORM_ARCHIVE),
    canDelete: await authz.can(Permissions.FORM_DELETE),
  };
}

function toPublicInputType(type: string): PublicFormFieldDto["inputType"] {
  if (type === "TEXTAREA") return "textarea";
  if (type === "EMAIL") return "email";
  if (type === "PHONE") return "tel";
  if (type === "NUMBER") return "number";
  return "text";
}

export async function getPublicForm(
  orgSlug: string,
  formSlug: string,
): Promise<PublicFormDto> {
  const form = await findPublishedFormByOrgAndSlug(prisma, orgSlug, formSlug);
  if (!form) throw notFound("Form not found.");

  const configs = normalizeFormFieldsOrder(parseFormFields(form.fields));
  const customIds = configs
    .filter((c) => c.kind === "custom" && c.customFieldId)
    .map((c) => c.customFieldId as string);
  const customFields = await findCustomFieldsByIds(
    prisma,
    form.organizationId,
    customIds,
  );
  const customById = new Map(customFields.map((f) => [f.id, f]));

  const fields: PublicFormFieldDto[] = [];
  for (const config of configs) {
    if (config.kind === "core" && config.coreKey) {
      fields.push({
        key: config.key,
        kind: "core",
        label: coreFieldLabels[config.coreKey],
        inputType:
          config.coreKey === "email"
            ? "email"
            : config.coreKey === "phone"
              ? "tel"
              : config.coreKey === "description"
                ? "textarea"
                : "text",
        required: config.required,
        placeholder: null,
        helpText: null,
        displayOrder: config.displayOrder,
      });
      continue;
    }
    if (config.kind === "custom" && config.customFieldId) {
      const def = customById.get(config.customFieldId);
      if (!def || !def.active) continue;
      if (!(mvpCustomFieldTypes as readonly string[]).includes(def.type)) {
        continue;
      }
      fields.push({
        key: config.key,
        kind: "custom",
        label: def.name,
        inputType: toPublicInputType(def.type),
        required: config.required || def.required,
        placeholder: def.placeholder,
        helpText: def.helpText,
        displayOrder: config.displayOrder,
      });
    }
  }

  return {
    name: form.name,
    description: form.description,
    successMessage:
      form.successMessage ||
      "Thank you! Your information has been received. Our team will contact you soon.",
    allowIndexing: form.allowIndexing,
    brandingDisplay: resolveFormBrandingDisplay(
      form.brandingDisplay,
      Boolean(form.organization.branding?.logo),
    ),
    fields,
    branding: {
      logo: form.organization.branding?.logo ?? null,
      primaryColor: form.organization.branding?.primaryColor ?? null,
      accentColor: form.organization.branding?.accentColor ?? null,
    },
    turnstileSiteKey: getTurnstileSiteKey(),
    organizationName: form.organization.name,
  };
}

export async function submitPublicForm(input: {
  orgSlug: string;
  formSlug: string;
  values: Record<string, unknown>;
  turnstileToken?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{ leadId: string; submissionId: string }> {
  const rateKey = `${input.orgSlug}:${input.formSlug}:${input.ipAddress ?? "unknown"}`;
  try {
    assertPublicSubmitRateLimit(rateKey);
  } catch (error) {
    if (
      error instanceof Error &&
      (error as Error & { status?: number }).status === 429
    ) {
      throw new AppError(ApiErrorCode.VALIDATION_FAILED, error.message, 429);
    }
    throw error;
  }

  await verifyTurnstileToken(input.turnstileToken, input.ipAddress);

  const form = await findPublishedFormByOrgAndSlug(
    prisma,
    input.orgSlug,
    input.formSlug,
  );
  if (!form) throw notFound("Form not found.");

  const configs = parseFormFields(form.fields);
  const customIds = configs
    .filter((c) => c.kind === "custom" && c.customFieldId)
    .map((c) => c.customFieldId as string);
  const customFields = await findCustomFieldsByIds(
    prisma,
    form.organizationId,
    customIds,
  );
  const customById = new Map(customFields.map((f) => [f.id, f]));

  const core: Partial<Record<keyof typeof coreFieldLabels, string>> = {};
  const customRaw: Record<string, unknown> = {};

  for (const config of configs) {
    const raw = input.values[config.key];
    if (config.kind === "core" && config.coreKey) {
      const text = raw === undefined || raw === null ? "" : String(raw).trim();
      if (!text && config.required) {
        throw validationFailed(
          `${coreFieldLabels[config.coreKey]} is required.`,
        );
      }
      if (config.coreKey === "email" && text) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
          throw validationFailed("Email must be a valid email.");
        }
      }
      if (config.coreKey === "phone" && text) {
        const phoneCheck = validateOptionalPhoneValue(text);
        if (!phoneCheck.ok || !phoneCheck.e164) {
          throw validationFailed(
            phoneCheck.ok ? "Enter a valid phone number." : phoneCheck.message,
          );
        }
        core[config.coreKey] = phoneCheck.e164;
        continue;
      }
      core[config.coreKey] = text;
    } else if (config.kind === "custom" && config.customFieldId) {
      const def = customById.get(config.customFieldId);
      if (!def || !def.active) continue;
      const required = config.required || def.required;
      const normalized = validateCustomFieldValue(def.type, raw, {
        required,
        fieldName: def.name,
      });
      if (normalized !== null) {
        customRaw[def.id] = normalized;
      }
    }
  }

  if (!core.firstName?.trim()) {
    throw validationFailed("First name is required.");
  }

  const firstName = core.firstName.trim();
  let lastName = (core.lastName ?? "").trim();
  if (!lastName) {
    const lastConfig = configs.find(
      (c) => c.kind === "core" && c.coreKey === "lastName",
    );
    if (lastConfig?.required) {
      throw validationFailed("Last name is required.");
    }
    lastName = "-";
  }

  const defaultStatus = await getDefaultStatus(prisma, form.organizationId);
  if (!defaultStatus) {
    throw validationFailed("Organization is missing a default lead status.");
  }

  const websiteSource = await findWebsiteSource(prisma, form.organizationId);
  const email = emptyToNull(core.email);
  const phone = emptyToNull(core.phone);
  const duplicates = await findDuplicateCandidates(
    prisma,
    form.organizationId,
    email,
    phone,
  );

  const customValueRows = await normalizeCustomValuesForOrganization(
    form.organizationId,
    customRaw,
    { activeOnly: true, requireAllRequired: false },
  );

  const result = await prisma.$transaction(async (tx) => {
    const lead = await createLeadRecord(
      tx,
      form.organizationId,
      form.createdBy,
      {
        firstName,
        lastName,
        email: email ?? "",
        phone: phone ?? "",
        company: core.company ?? "",
        jobTitle: "",
        website: "",
        description: core.description ?? "",
        statusId: defaultStatus.id,
        sourceId: websiteSource?.id ?? "",
        assignedManagerId: form.defaultAssignedManagerId ?? "",
        assignedMemberId: "",
        isDuplicate: duplicates.length > 0,
      },
    );

    await replaceLeadCustomValues(tx, lead.id, customValueRows);

    const submission = await createFormSubmissionRecord(tx, {
      organizationId: form.organizationId,
      leadFormId: form.id,
      leadId: lead.id,
      payload: {
        values: input.values,
        core,
        custom: customRaw,
      } as Prisma.InputJsonValue,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    });

    await recordLeadActivity(tx, {
      organizationId: form.organizationId,
      actorId: form.createdBy,
      leadId: lead.id,
      action: LeadActivityAction.CREATED_FROM_FORM,
      metadata: {
        formId: form.id,
        submissionId: submission.id,
      },
    });

    return { leadId: lead.id, submissionId: submission.id };
  });

  return result;
}
