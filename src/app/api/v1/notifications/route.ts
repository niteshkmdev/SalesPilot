import { listMyNotifications } from "@/modules/notifications";
import { handleApiError, ok } from "@/shared/api/responses";

export async function GET() {
  try {
    const notifications = await listMyNotifications({ limit: 50 });
    return ok({ notifications });
  } catch (error) {
    return handleApiError(error);
  }
}
