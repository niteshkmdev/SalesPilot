import {
  getDashboardOverview,
  resolveDashboardQuery,
} from "@/modules/dashboard";
import { DashboardPage } from "@/modules/dashboard/components/dashboard-page";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = resolveDashboardQuery({
    preset: typeof params.preset === "string" ? params.preset : null,
    startDate: typeof params.startDate === "string" ? params.startDate : null,
    endDate: typeof params.endDate === "string" ? params.endDate : null,
  });

  const data = await getDashboardOverview(query);

  return <DashboardPage data={data} />;
}
