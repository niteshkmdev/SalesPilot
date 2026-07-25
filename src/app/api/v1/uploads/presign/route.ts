import { PresignUploadSchema } from "@/modules/storage";
import { createImageUploadPresign } from "@/modules/storage/services/storage.service";
import { handleApiError, ok } from "@/shared/api/responses";

export async function POST(request: Request) {
  try {
    const body = PresignUploadSchema.parse(await request.json());
    const result = await createImageUploadPresign(body);
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
