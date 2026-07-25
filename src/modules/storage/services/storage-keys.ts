import { createId } from "@paralleldrive/cuid2";
import type { AllowedImageMimeType } from "@/modules/storage/dto/upload.dto";
import { UploadPurpose } from "@/modules/storage/dto/upload.dto";

const MIME_TO_EXT: Record<AllowedImageMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function extensionForMime(contentType: AllowedImageMimeType): string {
  return MIME_TO_EXT[contentType];
}

export function buildObjectKey(input: {
  purpose: UploadPurpose;
  organizationId?: string;
  userId: string;
  contentType: AllowedImageMimeType;
}): string {
  const ext = extensionForMime(input.contentType);
  const id = createId();

  if (input.purpose === UploadPurpose.ORG_LOGO) {
    if (!input.organizationId) {
      throw new Error("organizationId is required for org logo uploads.");
    }
    return `orgs/${input.organizationId}/logo/${id}.${ext}`;
  }

  return `users/${input.userId}/avatar/${id}.${ext}`;
}

export function buildPublicMediaUrl(
  cloudFrontBaseUrl: string,
  key: string,
): string {
  const base = cloudFrontBaseUrl.replace(/\/+$/, "");
  const path = key.replace(/^\/+/, "");
  return `${base}/${path}`;
}
