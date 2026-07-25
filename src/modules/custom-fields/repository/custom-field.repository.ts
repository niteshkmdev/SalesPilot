import type { Prisma } from "@prisma/client";
import type {
  CreateCustomFieldDto,
  UpdateCustomFieldDto,
} from "@/modules/custom-fields/dto/custom-field.dto";
import type { DatabaseClient } from "@/server/db/types";

export async function listCustomFields(
  db: DatabaseClient,
  organizationId: string,
  options?: { activeOnly?: boolean },
) {
  return db.customField.findMany({
    where: {
      organizationId,
      ...(options?.activeOnly ? { active: true } : {}),
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
}

export async function findCustomFieldById(
  db: DatabaseClient,
  organizationId: string,
  fieldId: string,
) {
  return db.customField.findFirst({
    where: { id: fieldId, organizationId },
  });
}

export async function findCustomFieldsByIds(
  db: DatabaseClient,
  organizationId: string,
  fieldIds: string[],
) {
  if (fieldIds.length === 0) return [];
  return db.customField.findMany({
    where: { organizationId, id: { in: fieldIds } },
  });
}

export async function countCustomFieldValues(
  db: DatabaseClient,
  fieldId: string,
) {
  return db.leadCustomFieldValue.count({ where: { fieldId } });
}

export async function getNextDisplayOrder(
  db: DatabaseClient,
  organizationId: string,
) {
  const last = await db.customField.findFirst({
    where: { organizationId },
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });
  return (last?.displayOrder ?? 0) + 10;
}

export async function createCustomField(
  db: DatabaseClient,
  organizationId: string,
  data: CreateCustomFieldDto & { slug: string; displayOrder: number },
) {
  return db.customField.create({
    data: {
      organizationId,
      name: data.name.trim(),
      slug: data.slug,
      type: data.type,
      required: data.required ?? false,
      placeholder: data.placeholder?.trim() || null,
      helpText: data.helpText?.trim() || null,
      displayOrder: data.displayOrder,
      active: true,
    },
  });
}

export async function updateCustomField(
  db: DatabaseClient,
  fieldId: string,
  data: UpdateCustomFieldDto & { slug?: string },
) {
  const patch: Prisma.CustomFieldUpdateInput = {};
  if (data.name !== undefined) patch.name = data.name.trim();
  if (data.slug !== undefined) patch.slug = data.slug;
  if (data.required !== undefined) patch.required = data.required;
  if (data.placeholder !== undefined) {
    patch.placeholder =
      data.placeholder === null ? null : data.placeholder.trim() || null;
  }
  if (data.helpText !== undefined) {
    patch.helpText =
      data.helpText === null ? null : data.helpText.trim() || null;
  }
  if (data.active !== undefined) patch.active = data.active;
  if (data.displayOrder !== undefined) patch.displayOrder = data.displayOrder;

  return db.customField.update({
    where: { id: fieldId },
    data: patch,
  });
}

export async function reorderCustomFields(
  db: DatabaseClient,
  organizationId: string,
  orderedIds: string[],
) {
  await Promise.all(
    orderedIds.map((id, index) =>
      db.customField.updateMany({
        where: { id, organizationId },
        data: { displayOrder: (index + 1) * 10 },
      }),
    ),
  );
}

export async function findCustomValuesForLead(
  db: DatabaseClient,
  leadId: string,
) {
  return db.leadCustomFieldValue.findMany({
    where: { leadId },
    include: { field: true },
  });
}

export async function replaceLeadCustomValues(
  db: DatabaseClient,
  leadId: string,
  values: Array<{ fieldId: string; value: Prisma.InputJsonValue }>,
) {
  await db.leadCustomFieldValue.deleteMany({ where: { leadId } });
  if (values.length === 0) return;
  await db.leadCustomFieldValue.createMany({
    data: values.map((entry) => ({
      leadId,
      fieldId: entry.fieldId,
      value: entry.value,
    })),
  });
}

export async function upsertLeadCustomValues(
  db: DatabaseClient,
  leadId: string,
  values: Array<{ fieldId: string; value: Prisma.InputJsonValue | null }>,
) {
  for (const entry of values) {
    if (entry.value === null) {
      await db.leadCustomFieldValue.deleteMany({
        where: { leadId, fieldId: entry.fieldId },
      });
      continue;
    }
    const existing = await db.leadCustomFieldValue.findFirst({
      where: { leadId, fieldId: entry.fieldId },
    });
    if (existing) {
      await db.leadCustomFieldValue.update({
        where: { id: existing.id },
        data: { value: entry.value },
      });
    } else {
      await db.leadCustomFieldValue.create({
        data: {
          leadId,
          fieldId: entry.fieldId,
          value: entry.value,
        },
      });
    }
  }
}

export async function slugExists(
  db: DatabaseClient,
  organizationId: string,
  slug: string,
  excludeId?: string,
) {
  const existing = await db.customField.findFirst({
    where: {
      organizationId,
      slug,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(existing);
}
