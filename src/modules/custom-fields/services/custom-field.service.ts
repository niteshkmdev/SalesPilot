import type { Prisma } from "@prisma/client";
import { requireAppContext } from "@/modules/auth/services/app-context.service";
import type {
  CreateCustomFieldDto,
  CustomFieldDto,
  LeadCustomValueDto,
  ReorderCustomFieldsDto,
  UpdateCustomFieldDto,
} from "@/modules/custom-fields/dto/custom-field.dto";
import { mvpCustomFieldTypes } from "@/modules/custom-fields/dto/custom-field.dto";
import {
  slugifyCustomFieldName,
  toCustomFieldDto,
  toLeadCustomValueDto,
} from "@/modules/custom-fields/dto/custom-field.mapper";
import {
  createCustomField as createCustomFieldRecord,
  deleteCustomFieldRecord,
  deleteCustomFieldValues,
  findCustomFieldById,
  findCustomValuesForLead,
  getNextDisplayOrder,
  listCustomFields as listCustomFieldRecords,
  reorderCustomFields as reorderCustomFieldRecords,
  slugExists,
  updateCustomField as updateCustomFieldRecord,
} from "@/modules/custom-fields/repository/custom-field.repository";
import {
  isEmptyCustomValue,
  validateCustomFieldValue,
} from "@/modules/custom-fields/services/custom-field-value";
import { FormFieldsConfigSchema } from "@/modules/lead-forms/dto/lead-form.dto";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { createAuthorizationService } from "@/modules/permissions/services/authorization.service";
import { prisma } from "@/server/db/prisma";
import { notFound, validationFailed } from "@/shared/api/errors";

async function uniqueSlug(
  organizationId: string,
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = slugifyCustomFieldName(name);
  let candidate = base;
  let suffix = 2;
  while (await slugExists(prisma, organizationId, candidate, excludeId)) {
    candidate = `${base}-${suffix}`.slice(0, 64);
    suffix += 1;
  }
  return candidate;
}

export async function listCustomFields(options?: {
  activeOnly?: boolean;
}): Promise<CustomFieldDto[]> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.CUSTOM_FIELD_READ,
  );

  const fields = await listCustomFieldRecords(prisma, ctx.organization.id, {
    activeOnly: options?.activeOnly,
  });
  return fields.map(toCustomFieldDto);
}

export async function listActiveCustomFieldsForLeads(): Promise<
  CustomFieldDto[]
> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.LEAD_READ,
  );

  const fields = await listCustomFieldRecords(prisma, ctx.organization.id, {
    activeOnly: true,
  });
  return fields
    .filter((field) =>
      (mvpCustomFieldTypes as readonly string[]).includes(field.type),
    )
    .map(toCustomFieldDto);
}

export async function createCustomField(
  data: CreateCustomFieldDto,
): Promise<CustomFieldDto> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.CUSTOM_FIELD_MANAGE,
  );

  if (!(mvpCustomFieldTypes as readonly string[]).includes(data.type)) {
    throw validationFailed("Unsupported custom field type.");
  }

  const slug = await uniqueSlug(ctx.organization.id, data.name);
  const displayOrder = await getNextDisplayOrder(prisma, ctx.organization.id);
  const field = await createCustomFieldRecord(prisma, ctx.organization.id, {
    ...data,
    slug,
    displayOrder,
  });
  return toCustomFieldDto(field);
}

export async function updateCustomField(
  fieldId: string,
  data: UpdateCustomFieldDto,
): Promise<CustomFieldDto> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.CUSTOM_FIELD_MANAGE,
  );

  const existing = await findCustomFieldById(
    prisma,
    ctx.organization.id,
    fieldId,
  );
  if (!existing) {
    throw notFound("Custom field not found.");
  }

  let slug: string | undefined;
  if (data.name !== undefined && data.name.trim() !== existing.name) {
    slug = await uniqueSlug(ctx.organization.id, data.name, fieldId);
  }

  if (data.active === false) {
    // Soft-deactivate is always allowed.
  }

  const field = await updateCustomFieldRecord(prisma, fieldId, {
    ...data,
    slug,
  });
  return toCustomFieldDto(field);
}

export async function deactivateCustomField(
  fieldId: string,
): Promise<CustomFieldDto> {
  return updateCustomField(fieldId, { active: false });
}

export async function deleteCustomField(fieldId: string): Promise<void> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.CUSTOM_FIELD_MANAGE,
  );

  const existing = await findCustomFieldById(
    prisma,
    ctx.organization.id,
    fieldId,
  );
  if (!existing) throw notFound("Custom field not found.");
  if (existing.active) {
    throw validationFailed("Deactivate the field before deleting it.");
  }

  await prisma.$transaction(async (tx) => {
    await deleteCustomFieldValues(tx, fieldId);

    const forms = await tx.leadForm.findMany({
      where: {
        organizationId: ctx.organization.id,
        OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
      },
      select: { id: true, fields: true },
    });
    for (const form of forms) {
      const parsed = FormFieldsConfigSchema.safeParse(form.fields);
      if (!parsed.success) continue;
      const next = parsed.data.filter(
        (entry) =>
          !(entry.kind === "custom" && entry.customFieldId === fieldId),
      );
      if (next.length !== parsed.data.length) {
        await tx.leadForm.update({
          where: { id: form.id },
          data: { fields: next as unknown as Prisma.InputJsonValue },
        });
      }
    }

    await deleteCustomFieldRecord(tx, fieldId);
  });
}

export async function reorderCustomFields(
  data: ReorderCustomFieldsDto,
): Promise<CustomFieldDto[]> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.CUSTOM_FIELD_MANAGE,
  );

  const existing = await listCustomFieldRecords(prisma, ctx.organization.id);
  const existingIds = new Set(existing.map((field) => field.id));
  for (const id of data.orderedIds) {
    if (!existingIds.has(id)) {
      throw validationFailed("Unknown custom field in reorder list.");
    }
  }

  await reorderCustomFieldRecords(prisma, ctx.organization.id, data.orderedIds);

  const fields = await listCustomFieldRecords(prisma, ctx.organization.id);
  return fields.map(toCustomFieldDto);
}

export async function getLeadCustomValues(
  leadId: string,
): Promise<LeadCustomValueDto[]> {
  const rows = await findCustomValuesForLead(prisma, leadId);
  return rows.map((row) => toLeadCustomValueDto(row.field, row.value));
}

/**
 * Validate a map of fieldId → value against org field definitions.
 * Returns normalized values ready for JSON persistence (skips empty optional).
 */
export async function normalizeCustomValuesForOrganization(
  organizationId: string,
  values: Record<string, unknown> | undefined,
  options?: { activeOnly?: boolean; requireAllRequired?: boolean },
): Promise<Array<{ fieldId: string; value: Prisma.InputJsonValue }>> {
  const fields = await listCustomFieldRecords(prisma, organizationId, {
    activeOnly: options?.activeOnly ?? true,
  });
  const byId = new Map(fields.map((field) => [field.id, field]));
  const incoming = values ?? {};

  for (const fieldId of Object.keys(incoming)) {
    if (!byId.has(fieldId)) {
      throw validationFailed("Unknown custom field.");
    }
  }

  const result: Array<{ fieldId: string; value: Prisma.InputJsonValue }> = [];

  for (const field of fields) {
    if (!(mvpCustomFieldTypes as readonly string[]).includes(field.type)) {
      continue;
    }
    const raw = incoming[field.id];
    const hasKey = Object.hasOwn(incoming, field.id);

    if (!hasKey) {
      if (options?.requireAllRequired && field.required) {
        throw validationFailed(`${field.name} is required.`);
      }
      continue;
    }

    const normalized = validateCustomFieldValue(field.type, raw, {
      required: field.required,
      fieldName: field.name,
    });

    if (isEmptyCustomValue(normalized) || normalized === null) {
      continue;
    }

    result.push({
      fieldId: field.id,
      value: normalized as Prisma.InputJsonValue,
    });
  }

  return result;
}

export async function assertCanManageCustomFields(): Promise<boolean> {
  const ctx = await requireAppContext();
  return createAuthorizationService(ctx.permissions).can(
    Permissions.CUSTOM_FIELD_MANAGE,
  );
}
