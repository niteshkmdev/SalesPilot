import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/server/env";
import { validationFailed } from "@/shared/api/errors";

let cachedClient: S3Client | null = null;

export function assertStorageConfigured(): {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  cloudFrontUrl: string;
} {
  const bucket = env.S3_BUCKET?.trim();
  const region = env.S3_REGION?.trim();
  const accessKeyId = env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = env.S3_SECRET_ACCESS_KEY?.trim();
  const cloudFrontUrl = env.CLOUDFRONT_CDN_MEDIA_URL?.trim();

  if (
    !bucket ||
    !region ||
    !accessKeyId ||
    !secretAccessKey ||
    !cloudFrontUrl
  ) {
    throw validationFailed(
      "File uploads are not configured. Set S3 and CLOUDFRONT_CDN_MEDIA_URL.",
    );
  }

  return { bucket, region, accessKeyId, secretAccessKey, cloudFrontUrl };
}

function getS3Client(config: {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}): S3Client {
  if (cachedClient) return cachedClient;

  cachedClient = new S3Client({
    region: config.region,
    endpoint: env.S3_ENDPOINT || undefined,
    forcePathStyle: Boolean(env.S3_ENDPOINT),
    // Browser PUTs cannot supply the SDK's default CRC32 checksum headers;
    // leaving them on breaks presigned uploads with 403.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return cachedClient;
}

export async function createPresignedPutUrl(input: {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}): Promise<string> {
  const { bucket, region, accessKeyId, secretAccessKey } =
    assertStorageConfigured();
  const client = getS3Client({ region, accessKeyId, secretAccessKey });
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: input.key,
    ContentType: input.contentType,
  });

  return getSignedUrl(client, command, {
    expiresIn: input.expiresInSeconds ?? 60 * 5,
    signableHeaders: new Set(["content-type"]),
  });
}
