import type { FormBrandingDisplay } from "@prisma/client";

/** Logo/Both require an org logo; otherwise force NAME. */
export function resolveFormBrandingDisplay(
  requested: FormBrandingDisplay | undefined,
  hasLogo: boolean,
): FormBrandingDisplay {
  const mode = requested ?? "BOTH";
  if (!hasLogo && mode !== "NAME") {
    return "NAME";
  }
  return mode;
}
