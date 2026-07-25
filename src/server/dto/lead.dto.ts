import { z } from "zod";

const optionalString = z.string().optional().or(z.literal(""));

export const CreateLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: optionalString,
  company: optionalString,
  jobTitle: optionalString,
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  statusId: z.string().min(1, "Status is required"),
  sourceId: z.string().optional().or(z.literal("")),
  assignedManagerId: z.string().optional().or(z.literal("")),
  assignedMemberId: z.string().optional().or(z.literal("")),
});

export type CreateLeadDto = z.infer<typeof CreateLeadSchema>;

export const UpdateLeadSchema = CreateLeadSchema.partial().extend({
  isDuplicate: z.boolean().optional(),
});

export type UpdateLeadDto = z.infer<typeof UpdateLeadSchema>;

export const LeadListFiltersSchema = z.object({
  q: z.string().optional(),
  statusId: z.string().optional(),
  sourceId: z.string().optional(),
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
  createdAt: string;
}

export interface LeadDetailDto extends LeadListItemDto {
  organizationId: string;
  statusId: string;
  sourceId: string | null;
  website: string | null;
  description: string | null;
  assignedManager: LeadAssigneeDto | null;
  updatedAt: string;
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
