export type {
  DashboardActivityItemDto,
  DashboardAssignedLeadDto,
  DashboardMetricDto,
  DashboardNotificationItemDto,
  DashboardOverviewDto,
  DashboardPipelineStageDto,
  DashboardQuery,
} from "@/modules/dashboard/dto/dashboard.dto";
export {
  DashboardQuerySchema,
  DEFAULT_DASHBOARD_PRESET,
} from "@/modules/dashboard/dto/dashboard.dto";
export {
  getDashboardOverview,
  resolveDashboardQuery,
} from "@/modules/dashboard/services/dashboard.service";
