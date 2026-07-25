import { requireAppContext } from "@/modules/auth/services/app-context.service";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { createAuthorizationService } from "@/modules/permissions/services/authorization.service";
import {
  type PresignUploadDto,
  type PresignUploadResult,
  UploadPurpose,
} from "@/modules/storage/dto/upload.dto";
import {
  assertStorageConfigured,
  createPresignedPutUrl,
} from "@/modules/storage/services/s3.client";
import {
  buildObjectKey,
  buildPublicMediaUrl,
} from "@/modules/storage/services/storage-keys";
import { permissionDenied } from "@/shared/api/errors";

export async function createImageUploadPresign(
  input: PresignUploadDto,
): Promise<PresignUploadResult> {
  const ctx = await requireAppContext();

  if (input.purpose === UploadPurpose.ORG_LOGO) {
    await createAuthorizationService(ctx.permissions).require(
      Permissions.BRANDING_UPDATE,
    );
  }

  if (input.purpose === UploadPurpose.USER_AVATAR) {
    // Any authenticated org member may update their own avatar.
    if (!ctx.user.id) {
      throw permissionDenied();
    }
  }

  const { cloudFrontUrl } = assertStorageConfigured();
  const key = buildObjectKey({
    purpose: input.purpose,
    organizationId: ctx.organization.id,
    userId: ctx.user.id,
    contentType: input.contentType,
  });

  const uploadUrl = await createPresignedPutUrl({
    key,
    contentType: input.contentType,
  });

  return {
    uploadUrl,
    publicUrl: buildPublicMediaUrl(cloudFrontUrl, key),
    key,
  };
}
