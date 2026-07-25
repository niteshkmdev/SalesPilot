export const defaultLeadStatuses = [
  {
    name: "New",
    color: "blue",
    displayOrder: 10,
    isDefault: true,
    isClosed: false,
    isWon: false,
  },
  {
    name: "Qualified",
    color: "purple",
    displayOrder: 20,
    isDefault: false,
    isClosed: false,
    isWon: false,
  },
  {
    name: "Proposal Sent",
    color: "amber",
    displayOrder: 30,
    isDefault: false,
    isClosed: false,
    isWon: false,
  },
  {
    name: "Won",
    color: "green",
    displayOrder: 40,
    isDefault: false,
    isClosed: true,
    isWon: true,
  },
  {
    name: "Lost",
    color: "red",
    displayOrder: 50,
    isDefault: false,
    isClosed: true,
    isWon: false,
  },
];

export const defaultLeadSources = [
  { name: "Website", displayOrder: 10, active: true },
  { name: "Referral", displayOrder: 20, active: true },
  { name: "Walk-In", displayOrder: 30, active: true },
  { name: "Cold Call", displayOrder: 40, active: true },
];

export const ownerRoleName = "Owner";

export { systemRoleNames } from "@/modules/organizations/constants/default-roles";
