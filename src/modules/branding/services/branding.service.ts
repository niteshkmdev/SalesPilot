import { requireAppContext } from "@/modules/auth/services/app-context.service";
import {
  findBrandingByOrganizationId,
  upsertBrandingLogo,
} from "@/modules/branding/repository/branding.repository";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { createAuthorizationService } from "@/modules/permissions/services/authorization.service";
import { prisma } from "@/server/db/prisma";
import { validationFailed } from "@/shared/api/errors";

export interface BrandingDto {
  logo: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
}

export async function getOrganizationBranding(): Promise<BrandingDto> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.BRANDING_READ,
  );

  const branding = await findBrandingByOrganizationId(
    prisma,
    ctx.organization.id,
  );

  return {
    logo: branding?.logo ?? null,
    primaryColor: branding?.primaryColor ?? null,
    secondaryColor: branding?.secondaryColor ?? null,
    accentColor: branding?.accentColor ?? null,
  };
}

export async function updateOrganizationLogo(
  logo: string | null,
): Promise<BrandingDto> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.BRANDING_UPDATE,
  );

  if (logo !== null) {
    const trimmed = logo.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      throw validationFailed("Logo must be a valid URL.");
    }
    logo = trimmed;
  }

  const branding = await upsertBrandingLogo(prisma, ctx.organization.id, logo);

  return {
    logo: branding.logo ?? null,
    primaryColor: branding.primaryColor ?? null,
    secondaryColor: branding.secondaryColor ?? null,
    accentColor: branding.accentColor ?? null,
  };
}
