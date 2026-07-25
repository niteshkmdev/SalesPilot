"use client";

import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_UPLOAD_BYTES,
  type UploadPurpose,
} from "@/modules/storage/dto/upload.dto";

export async function uploadImageViaPresign(input: {
  file: File;
  purpose: UploadPurpose;
}): Promise<string> {
  if (
    !ALLOWED_IMAGE_MIME_TYPES.includes(
      input.file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
    )
  ) {
    throw new Error("Only PNG, JPEG, WebP, or GIF images are allowed.");
  }
  if (input.file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error("Image must be 2MB or smaller.");
  }

  const presignResponse = await fetch("/api/v1/uploads/presign", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      purpose: input.purpose,
      contentType: input.file.type,
      fileName: input.file.name,
      size: input.file.size,
    }),
  });

  const presignJson = (await presignResponse.json()) as {
    success?: boolean;
    data?: { uploadUrl?: string; publicUrl?: string };
    error?: { message?: string };
  };

  if (
    !presignResponse.ok ||
    !presignJson.success ||
    !presignJson.data?.uploadUrl ||
    !presignJson.data.publicUrl
  ) {
    throw new Error(
      presignJson.error?.message ?? "Failed to prepare image upload.",
    );
  }

  const putResponse = await fetch(presignJson.data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": input.file.type },
    body: input.file,
  });

  if (!putResponse.ok) {
    const detail = await putResponse.text().catch(() => "");
    const codeMatch = detail.match(/<Code>([^<]+)<\/Code>/i);
    const messageMatch = detail.match(/<Message>([^<]+)<\/Message>/i);
    const code = codeMatch?.[1];
    const message = messageMatch?.[1];
    if (code === "AccessDenied") {
      throw new Error(
        "S3 denied the upload (AccessDenied). Grant s3:PutObject to the app IAM user on this bucket.",
      );
    }
    throw new Error(
      message
        ? `Failed to upload image to storage (${code ?? putResponse.status}): ${message}`
        : `Failed to upload image to storage (${putResponse.status}).`,
    );
  }

  return presignJson.data.publicUrl;
}
