import type { PermissionName } from "@/modules/permissions/constants/permissions";
import { permissionDenied } from "@/shared/api/errors";

export interface AuthorizationService {
  can(permission: PermissionName): Promise<boolean>;
  canAll(permissions: PermissionName[]): Promise<boolean>;
  canAny(permissions: PermissionName[]): Promise<boolean>;
  require(permission: PermissionName): Promise<void>;
}

export function createAuthorizationService(
  permissions: PermissionName[],
): AuthorizationService {
  const permissionSet = new Set(permissions);

  return {
    async can(permission) {
      return permissionSet.has(permission);
    },
    async canAll(requiredPermissions) {
      return requiredPermissions.every((permission) =>
        permissionSet.has(permission),
      );
    },
    async canAny(requiredPermissions) {
      return requiredPermissions.some((permission) =>
        permissionSet.has(permission),
      );
    },
    async require(permission) {
      if (!permissionSet.has(permission)) {
        throw permissionDenied();
      }
    },
  };
}
