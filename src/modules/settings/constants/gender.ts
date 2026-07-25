export const USER_GENDER_OPTIONS = [
  { value: "blank", label: "—" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

export const USER_GENDER_VALUES = [
  "male",
  "female",
  "other",
  "prefer_not_to_say",
] as const;

export type UserGender = (typeof USER_GENDER_VALUES)[number];

export function normalizeGenderSelectValue(
  value: string | null | undefined,
): string {
  if (!value) return "blank";
  const normalized = value.trim().toLowerCase();
  if (
    normalized === "male" ||
    normalized === "female" ||
    normalized === "other" ||
    normalized === "prefer_not_to_say"
  ) {
    return normalized;
  }
  return "blank";
}

export function genderFromSelectValue(value: string): string | null {
  if (!value || value === "blank") return null;
  if (
    value === "male" ||
    value === "female" ||
    value === "other" ||
    value === "prefer_not_to_say"
  ) {
    return value;
  }
  return null;
}
