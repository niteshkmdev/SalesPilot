import {
  DashboardQuerySchema,
  getDashboardOverview,
} from "@/modules/dashboard";
import { handleApiError, ok } from "@/shared/api/responses";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = DashboardQuerySchema.parse({
      preset: searchParams.get("preset") ?? undefined,
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    });
    const overview = await getDashboardOverview(parsed);
    return ok(overview);
  } catch (error) {
    return handleApiError(error);
  }
}
