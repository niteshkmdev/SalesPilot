import type { DatabaseClient } from "@/server/db/types";

export async function findBrandingByOrganizationId(
  db: DatabaseClient,
  organizationId: string,
) {
  return db.branding.findUnique({
    where: { organizationId },
  });
}

export async function upsertBrandingLogo(
  db: DatabaseClient,
  organizationId: string,
  logo: string | null,
) {
  return db.branding.upsert({
    where: { organizationId },
    create: {
      organizationId,
      logo,
    },
    update: {
      logo,
    },
  });
}
