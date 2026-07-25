import { z } from "zod";

export const UploadPurpose = {
  ORG_LOGO: "org_logo",
  USER_AVATAR: "user_avatar",
} as const;

export type UploadPurpose = (typeof UploadPurpose)[keyof typeof UploadPurpose];

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const MAX_IMAGE_UPLOAD_BYTES = 2 * 1024 * 1024;

export const PresignUploadSchema = z.object({
  purpose: z.enum([UploadPurpose.ORG_LOGO, UploadPurpose.USER_AVATAR]),
  contentType: z.enum(ALLOWED_IMAGE_MIME_TYPES),
  fileName: z.string().min(1).max(255),
  size: z.number().int().positive().max(MAX_IMAGE_UPLOAD_BYTES),
});

export type PresignUploadDto = z.infer<typeof PresignUploadSchema>;

export interface PresignUploadResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}
