import { z } from "zod";
import { optionalPhoneSchema } from "@/shared/phone";

const optionalString = z.string().optional().or(z.literal(""));

export const CreateLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: optionalPhoneSchema,
  company: optionalString,
  jobTitle: optionalString,
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  statusId: z.string().min(1, "Status is required"),
  sourceId: z.string().optional().or(z.literal("")),
  assignedManagerId: z.string().optional().or(z.literal("")),
  assignedMemberId: z.string().optional().or(z.literal("")),
  customValues: z.record(z.string(), z.unknown()).optional(),
});

export type CreateLeadDto = z.infer<typeof CreateLeadSchema>;

export const UpdateLeadSchema = CreateLeadSchema.partial().extend({
  isDuplicate: z.boolean().optional(),
});

export type UpdateLeadDto = z.infer<typeof UpdateLeadSchema>;

export const AssignLeadSchema = z.object({
  assignedMemberId: z.string().nullable().optional(),
  assignedManagerId: z.string().nullable().optional(),
});

export type AssignLeadDto = z.infer<typeof AssignLeadSchema>;

const optionalBoolean = z
  .union([z.boolean(), z.literal("true"), z.literal("false"), z.literal("")])
  .optional()
  .transform((value) => {
    if (value === undefined || value === "") return undefined;
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return undefined;
  });

const optionalDateString = z
  .string()
  .optional()
  .transform((value) => {
    if (!value?.trim()) return undefined;
    return value.trim();
  });

export const LeadListFiltersSchema = z.object({
  q: z.string().optional(),
  statusId: z.string().optional(),
  sourceId: z.string().optional(),
  assignedMemberId: z.string().optional(),
  assignedManagerId: z.string().optional(),
  createdFrom: optionalDateString,
  createdTo: optionalDateString,
  updatedFrom: optionalDateString,
  updatedTo: optionalDateString,
  isDuplicate: optionalBoolean,
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  sort: z
    .enum(["createdAt", "updatedAt", "firstName", "company"])
    .optional()
    .default("updatedAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type LeadListFilters = z.infer<typeof LeadListFiltersSchema>;

export interface LeadStatusDto {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
}

export interface LeadSourceDto {
  id: string;
  name: string;
}

export interface LeadAssigneeDto {
  id: string;
  name: string;
}

export interface LeadAssigneeOptionDto {
  id: string;
  name: string;
  email: string;
  roleName: string;
}

export interface LeadListItemDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  status: LeadStatusDto | null;
  source: LeadSourceDto | null;
  assignedMember: LeadAssigneeDto | null;
  assignedMemberId: string | null;
  assignedManager: LeadAssigneeDto | null;
  assignedManagerId: string | null;
  createdBy: string;
  isDuplicate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadDetailDto extends LeadListItemDto {
  organizationId: string;
  statusId: string;
  sourceId: string | null;
  website: string | null;
  description: string | null;
  customValues: Array<{
    fieldId: string;
    name: string;
    slug: string;
    type: string;
    required: boolean;
    active: boolean;
    value: unknown;
  }>;
}

export interface LeadListResultDto {
  leads: LeadListItemDto[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  sort: LeadListFilters["sort"];
  order: LeadListFilters["order"];
}

/** Map named status tokens (from org defaults) to hex for badge styles. */
export function resolveStatusColor(color: string | null | undefined): string {
  if (!color) return "#64748b";
  if (color.startsWith("#")) return color;

  const map: Record<string, string> = {
    blue: "#2563eb",
    purple: "#9333ea",
    amber: "#d97706",
    green: "#16a34a",
    red: "#dc2626",
    emerald: "#059669",
    slate: "#64748b",
  };

  return map[color.toLowerCase()] ?? color;
}

export function emptyToNull(value: string | undefined | null): string | null {
  if (value === undefined || value === null || value.trim() === "") return null;
  return value.trim();
}

export function normalizeLeadPayload<T extends Record<string, unknown>>(
  data: T,
): T {
  const optionalKeys = [
    "email",
    "phone",
    "company",
    "jobTitle",
    "website",
    "description",
    "sourceId",
    "assignedManagerId",
    "assignedMemberId",
  ] as const;

  const next = { ...data };
  for (const key of optionalKeys) {
    if (key in next && typeof next[key] === "string") {
      const normalized = emptyToNull(next[key] as string);
      (next as Record<string, unknown>)[key] = normalized ?? undefined;
    }
  }
  return next;
}

export function hasActiveListFilters(
  filters: Pick<
    LeadListFilters,
    | "q"
    | "statusId"
    | "sourceId"
    | "assignedMemberId"
    | "assignedManagerId"
    | "createdFrom"
    | "createdTo"
    | "updatedFrom"
    | "updatedTo"
    | "isDuplicate"
  >,
): boolean {
  return Boolean(
    filters.q?.trim() ||
      filters.statusId ||
      filters.sourceId ||
      filters.assignedMemberId ||
      filters.assignedManagerId ||
      filters.createdFrom ||
      filters.createdTo ||
      filters.updatedFrom ||
      filters.updatedTo ||
      filters.isDuplicate !== undefined,
  );
}
