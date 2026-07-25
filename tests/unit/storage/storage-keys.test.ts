import { describe, expect, it } from "vitest";
import { UploadPurpose } from "@/modules/storage";
import {
  buildObjectKey,
  buildPublicMediaUrl,
  extensionForMime,
} from "@/modules/storage/services/storage-keys";

describe("extensionForMime", () => {
  it("maps common image MIME types", () => {
    expect(extensionForMime("image/png")).toBe("png");
    expect(extensionForMime("image/jpeg")).toBe("jpg");
    expect(extensionForMime("image/webp")).toBe("webp");
    expect(extensionForMime("image/gif")).toBe("gif");
  });
});

describe("buildObjectKey", () => {
  it("builds org logo keys under orgs/{id}/logo/", () => {
    const key = buildObjectKey({
      purpose: UploadPurpose.ORG_LOGO,
      organizationId: "org_123",
      userId: "user_1",
      contentType: "image/png",
    });
    expect(key).toMatch(/^orgs\/org_123\/logo\/[a-z0-9]+\.png$/);
  });

  it("builds user avatar keys under users/{id}/avatar/", () => {
    const key = buildObjectKey({
      purpose: UploadPurpose.USER_AVATAR,
      userId: "user_42",
      contentType: "image/webp",
    });
    expect(key).toMatch(/^users\/user_42\/avatar\/[a-z0-9]+\.webp$/);
  });

  it("requires organizationId for org logos", () => {
    expect(() =>
      buildObjectKey({
        purpose: UploadPurpose.ORG_LOGO,
        userId: "user_1",
        contentType: "image/jpeg",
      }),
    ).toThrow(/organizationId/);
  });
});

describe("buildPublicMediaUrl", () => {
  it("joins CloudFront base and key without duplicate slashes", () => {
    expect(
      buildPublicMediaUrl("https://cdn.example.com/", "orgs/1/logo/abc.png"),
    ).toBe("https://cdn.example.com/orgs/1/logo/abc.png");
  });
});
