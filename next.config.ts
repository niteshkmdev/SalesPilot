import type { NextConfig } from "next";

const cloudFrontHost = (() => {
  const raw = process.env.CLOUDFRONT_CDN_MEDIA_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      ...(cloudFrontHost
        ? [
            {
              protocol: "https" as const,
              hostname: cloudFrontHost,
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
