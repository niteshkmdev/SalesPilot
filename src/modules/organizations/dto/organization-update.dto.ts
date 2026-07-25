import { z } from "zod";

export const UpdateOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .max(100),
});

export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
