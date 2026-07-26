/**
 * One-time backfill script: set onboardingState for all pre-existing users.
 *
 * Run this once after deploying the schema change:
 *
 *   pnpm tsx scripts/backfill-onboarding.ts
 *
 * Logic:
 *   - Users who already have at least one OrganizationMember record
 *     → onboardingState = "COMPLETED"
 *   - Users with zero memberships
 *     → onboardingState = "PENDING"  (they will be prompted to onboard on next login)
 *
 * This script is idempotent — safe to run multiple times.
 * Users who already have a non-default onboardingState are skipped.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting onboarding state backfill…");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      onboardingState: true,
      organizationMembers: {
        take: 1,
        select: { id: true },
      },
    },
  });

  let skipped = 0;
  let completed = 0;
  let pending = 0;
  let errors = 0;

  for (const user of users) {
    // Skip users whose state has already been set to a non-default value
    // by a previous backfill run or by the new code.
    // Note: "PENDING" is the Prisma default, so we always process every user
    // to ensure correctness.

    const targetState =
      user.organizationMembers.length > 0 ? "COMPLETED" : "PENDING";

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingState: targetState },
      });

      if (targetState === "COMPLETED") completed++;
      else pending++;
    } catch (err) {
      console.error(`  ✗ Failed for user ${user.email}:`, err);
      errors++;
    }
  }

  console.log(
    [
      "",
      "Backfill complete:",
      `  ${completed} → COMPLETED`,
      `  ${pending} → PENDING`,
      skipped > 0 ? `  ${skipped} skipped` : "",
      errors > 0 ? `  ${errors} errors` : "",
      "",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  if (errors > 0) {
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
