export const Permissions = {
  DASHBOARD_READ: "dashboard.read",
  ORGANIZATION_READ: "organization.read",
  ORGANIZATION_UPDATE: "organization.update",
  MEMBER_READ: "member.read",
  MEMBER_INVITE: "member.invite",
  MEMBER_UPDATE: "member.update",
  MEMBER_REMOVE: "member.remove",
  ROLE_READ: "role.read",
  ROLE_CREATE: "role.create",
  ROLE_UPDATE: "role.update",
  ROLE_DELETE: "role.delete",
  LEAD_READ: "lead.read",
  LEAD_CREATE: "lead.create",
  LEAD_UPDATE: "lead.update",
  LEAD_DELETE: "lead.delete",
  LEAD_ASSIGN: "lead.assign",
  FORM_READ: "form.read",
  FORM_CREATE: "form.create",
  FORM_UPDATE: "form.update",
  FORM_PUBLISH: "form.publish",
  FORM_ARCHIVE: "form.archive",
  ACTIVITY_READ: "activity.read",
  NOTIFICATION_READ: "notification.read",
  NOTIFICATION_UPDATE: "notification.update",
  BRANDING_READ: "branding.read",
  BRANDING_UPDATE: "branding.update",
} as const;

export type PermissionName = (typeof Permissions)[keyof typeof Permissions];

export interface PermissionDefinition {
  name: PermissionName;
  description: string;
  group: string;
}

export const permissionDefinitions: PermissionDefinition[] = [
  {
    name: Permissions.DASHBOARD_READ,
    description: "View dashboard widgets and summary data.",
    group: "Dashboard",
  },
  {
    name: Permissions.ORGANIZATION_READ,
    description: "View organization settings.",
    group: "Organization",
  },
  {
    name: Permissions.ORGANIZATION_UPDATE,
    description: "Update organization settings.",
    group: "Organization",
  },
  {
    name: Permissions.MEMBER_READ,
    description: "View organization members.",
    group: "Members",
  },
  {
    name: Permissions.MEMBER_INVITE,
    description: "Invite new organization members.",
    group: "Members",
  },
  {
    name: Permissions.MEMBER_UPDATE,
    description: "Update organization members.",
    group: "Members",
  },
  {
    name: Permissions.MEMBER_REMOVE,
    description: "Remove organization members.",
    group: "Members",
  },
  {
    name: Permissions.ROLE_READ,
    description: "View roles and permissions.",
    group: "Roles",
  },
  {
    name: Permissions.ROLE_CREATE,
    description: "Create roles.",
    group: "Roles",
  },
  {
    name: Permissions.ROLE_UPDATE,
    description: "Update roles.",
    group: "Roles",
  },
  {
    name: Permissions.ROLE_DELETE,
    description: "Delete roles.",
    group: "Roles",
  },
  {
    name: Permissions.LEAD_READ,
    description: "View leads.",
    group: "Leads",
  },
  {
    name: Permissions.LEAD_CREATE,
    description: "Create leads.",
    group: "Leads",
  },
  {
    name: Permissions.LEAD_UPDATE,
    description: "Update leads.",
    group: "Leads",
  },
  {
    name: Permissions.LEAD_DELETE,
    description: "Delete leads.",
    group: "Leads",
  },
  {
    name: Permissions.LEAD_ASSIGN,
    description: "Assign leads to members.",
    group: "Leads",
  },
  {
    name: Permissions.FORM_READ,
    description: "View lead forms.",
    group: "Forms",
  },
  {
    name: Permissions.FORM_CREATE,
    description: "Create lead forms.",
    group: "Forms",
  },
  {
    name: Permissions.FORM_UPDATE,
    description: "Update lead forms.",
    group: "Forms",
  },
  {
    name: Permissions.FORM_PUBLISH,
    description: "Publish lead forms.",
    group: "Forms",
  },
  {
    name: Permissions.FORM_ARCHIVE,
    description: "Archive lead forms.",
    group: "Forms",
  },
  {
    name: Permissions.ACTIVITY_READ,
    description: "View activity timelines.",
    group: "Activity",
  },
  {
    name: Permissions.NOTIFICATION_READ,
    description: "View notifications.",
    group: "Notifications",
  },
  {
    name: Permissions.NOTIFICATION_UPDATE,
    description: "Update notification read state.",
    group: "Notifications",
  },
  {
    name: Permissions.BRANDING_READ,
    description: "View branding settings.",
    group: "Branding",
  },
  {
    name: Permissions.BRANDING_UPDATE,
    description: "Update branding settings.",
    group: "Branding",
  },
];

export const allPermissionNames = permissionDefinitions.map(({ name }) => name);
