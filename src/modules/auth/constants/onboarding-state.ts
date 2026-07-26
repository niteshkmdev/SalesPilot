/**
 * Onboarding state constants for the User model.
 *
 * Stored as a String field in the database for MongoDB compatibility
 * (no native enum support in the Prisma MongoDB provider).
 *
 * Used exclusively server-side. Never exposed to the client session payload.
 */
export const OnboardingState = {
  /** User has not finished the onboarding wizard.
   *  May be a brand-new user OR a user who abandoned the flow mid-way. */
  PENDING: "PENDING",
  /** User completed the onboarding wizard at least once. */
  COMPLETED: "COMPLETED",
} as const;

export type OnboardingState =
  (typeof OnboardingState)[keyof typeof OnboardingState];
