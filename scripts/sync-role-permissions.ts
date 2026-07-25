/**
 * Reconcile Owner/Admin/Manager/Member role permission sets for every org.
 *
 * Usage:
 *   npx tsx scripts/sync-role-permissions.ts
 */
import { syncSystemRolePermissions } from "@/modules/organizations/services/role-seed.service";
import { prisma } from "@/server/db/prisma";

async function main() {
  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { createdAt: "asc" },
  });

  if (organizations.length === 0) {
    console.log("No organizations found.");
    return;
  }

  for (const organization of organizations) {
    await syncSystemRolePermissions(prisma, organization.id);
    console.log(
      `Synced system role permissions for ${organization.name} (${organization.slug})`,
    );
  }

  console.log(`Done. Updated ${organizations.length} organization(s).`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
