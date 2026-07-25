import { z } from "zod";
import { DATE_RANGE_PRESET_VALUES, DateRangePreset } from "@/shared/dates";

export const DashboardQuerySchema = z
  .object({
    preset: z.enum(DATE_RANGE_PRESET_VALUES).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .superRefine((value, ctx) => {
    if (value.startDate > value.endDate) {
      ctx.addIssue({
        code: "custom",
        message: "Start date must be on or before end date.",
        path: ["startDate"],
      });
    }
  });

export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;

export interface DashboardMetricDto {
  label: string;
  value: string;
  change: string;
}

export interface DashboardPipelineStageDto {
  stage: string;
  value: number;
  width: string;
}

export interface DashboardAssignedLeadDto {
  id: string;
  company: string;
  contact: string;
  status: string;
  owner: string;
  updatedAt: string;
}

export interface DashboardActivityItemDto {
  id: string;
  summary: string;
  createdAt: string;
}

export interface DashboardNotificationItemDto {
  id: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  leadId: string | null;
}

export interface DashboardOverviewDto {
  range: {
    preset: (typeof DATE_RANGE_PRESET_VALUES)[number];
    startDate: string;
    endDate: string;
    label: string;
  };
  metrics: DashboardMetricDto[];
  pipeline: DashboardPipelineStageDto[];
  assignedLeads: DashboardAssignedLeadDto[];
  activity: DashboardActivityItemDto[];
  notifications: DashboardNotificationItemDto[];
  unreadNotificationCount: number;
  capabilities: {
    canCreateLead: boolean;
    canInviteMember: boolean;
  };
}

export const DEFAULT_DASHBOARD_PRESET = DateRangePreset.THIS_MONTH;
