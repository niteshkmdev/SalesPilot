import { getMyUnreadCount } from "@/modules/notifications";
import { handleApiError, ok } from "@/shared/api/responses";

/**
 * Lightweight unread count for the header badge.
 * Prefer this over a Server Action so polling does not POST to the current RSC page.
 */
export async function GET() {
  try {
    const count = await getMyUnreadCount();
    return ok({ count });
  } catch (error) {
    return handleApiError(error);
  }
}
