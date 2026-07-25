import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ApiErrorCode } from "@/shared/api/errors";
import { formatZodFields, handleApiError } from "@/shared/api/responses";

describe("formatZodFields", () => {
  it("maps Zod issues to field-level messages", () => {
    const schema = z.object({
      email: z.email(),
      profile: z.object({
        name: z.string().min(2),
      }),
    });

    const result = schema.safeParse({
      email: "not-an-email",
      profile: { name: "" },
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(formatZodFields(result.error)).toEqual({
        email: ["Invalid email address"],
        "profile.name": ["Too small: expected string to have >=2 characters"],
      });
    }
  });
});

describe("handleApiError", () => {
  it("does not expose unknown server errors", async () => {
    const response = handleApiError(new Error("database exploded"));
    const body = (await response.json()) as {
      success: false;
      error: { code: string; message: string };
    };

    expect(response.status).toBe(500);
    expect(body).toEqual({
      success: false,
      error: {
        code: ApiErrorCode.INTERNAL_SERVER_ERROR,
        message: "Internal server error.",
      },
    });
  });
});
