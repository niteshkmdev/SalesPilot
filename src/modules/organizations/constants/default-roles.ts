import {
  allPermissionNames,
  type PermissionName,
  Permissions,
} from "@/modules/permissions/constants/permissions";

export const systemRoleNames = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  member: "Member",
} as const;

export type SystemRoleName =
  (typeof systemRoleNames)[keyof typeof systemRoleNames];

/** Roles that can be assigned via invite / role change (never Owner). */
export const assignableRoleNames = [
  systemRoleNames.admin,
  systemRoleNames.manager,
  systemRoleNames.member,
] as const;

export type AssignableRoleName = (typeof assignableRoleNames)[number];

export interface DefaultRoleDefinition {
  name: SystemRoleName;
  description: string;
  permissions: PermissionName[];
}

const managerPermissions: PermissionName[] = [
  Permissions.DASHBOARD_READ,
  Permissions.ORGANIZATION_READ,
  Permissions.LEAD_READ,
  Permissions.LEAD_CREATE,
  Permissions.LEAD_UPDATE,
  Permissions.LEAD_DELETE,
  Permissions.LEAD_ASSIGN,
  Permissions.CUSTOM_FIELD_READ,
  Permissions.FORM_READ,
  Permissions.ACTIVITY_READ,
  Permissions.NOTIFICATION_READ,
  Permissions.NOTIFICATION_UPDATE,
];

const memberPermissions: PermissionName[] = [
  Permissions.DASHBOARD_READ,
  Permissions.ORGANIZATION_READ,
  Permissions.LEAD_READ,
  Permissions.LEAD_CREATE,
  Permissions.LEAD_UPDATE,
  Permissions.CUSTOM_FIELD_READ,
  Permissions.ACTIVITY_READ,
  Permissions.NOTIFICATION_READ,
  Permissions.NOTIFICATION_UPDATE,
];

/** System roles created for every organization (Owner handled separately at provision). */
export const defaultNonOwnerRoles: DefaultRoleDefinition[] = [
  {
    name: systemRoleNames.admin,
    description: "Organization admin with nearly full access.",
    permissions: [...allPermissionNames],
  },
  {
    name: systemRoleNames.manager,
    description: "Supervises assigned leads and team members.",
    permissions: managerPermissions,
  },
  {
    name: systemRoleNames.member,
    description: "Standard sales member access.",
    permissions: memberPermissions,
  },
];

export const INVITATION_EXPIRY_DAYS = 7;
