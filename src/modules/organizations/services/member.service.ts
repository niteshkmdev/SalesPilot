import { requireAppContext } from "@/modules/auth/services/app-context.service";
import {
  assignableRoleNames,
  systemRoleNames,
} from "@/modules/organizations/constants/default-roles";
import {
  type MemberDto,
  type RoleOptionDto,
  toMemberDto,
} from "@/modules/organizations/dto/member.dto";
import {
  deleteMember,
  findMemberById,
  listMembersByOrganization,
  updateMemberRole,
} from "@/modules/organizations/repository/member.repository";
import {
  findRoleById,
  listRolesByOrganization,
} from "@/modules/organizations/repository/role.repository";
import { syncSystemRolePermissions } from "@/modules/organizations/services/role-seed.service";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { createAuthorizationService } from "@/modules/permissions/services/authorization.service";
import { prisma } from "@/server/db/prisma";
import {
  conflict,
  notFound,
  permissionDenied,
  validationFailed,
} from "@/shared/api/errors";

export async function listOrganizationMembers(): Promise<MemberDto[]> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.MEMBER_READ,
  );

  const members = await listMembersByOrganization(prisma, ctx.organization.id);
  return members.map(toMemberDto);
}

function toRoleOption(role: {
  id: string;
  name: string;
  description: string | null;
}): RoleOptionDto {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
  };
}

export async function listOrganizationRoles(): Promise<RoleOptionDto[]> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.MEMBER_READ,
  );

  await syncSystemRolePermissions(prisma, ctx.organization.id);
  const roles = await listRolesByOrganization(prisma, ctx.organization.id);
  return roles.map(toRoleOption);
}

export async function listAssignableRoles(): Promise<RoleOptionDto[]> {
  const roles = await listOrganizationRoles();
  return roles.filter((role) =>
    (assignableRoleNames as readonly string[]).includes(role.name),
  );
}

export async function changeMemberRole(
  memberId: string,
  roleId: string,
): Promise<MemberDto> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.MEMBER_UPDATE,
  );

  const member = await findMemberById(prisma, memberId);
  if (!member || member.organizationId !== ctx.organization.id) {
    throw notFound("Member not found.");
  }
  if (member.isOwner || member.role.name === systemRoleNames.owner) {
    throw conflict("The organization owner role cannot be changed.");
  }

  const role = await findRoleById(prisma, roleId);
  if (!role || role.organizationId !== ctx.organization.id) {
    throw notFound("Role not found.");
  }
  if (!(assignableRoleNames as readonly string[]).includes(role.name)) {
    throw validationFailed("You can only assign Admin, Manager, or Member.");
  }

  await updateMemberRole(prisma, memberId, roleId);
  const updated = await findMemberById(prisma, memberId);
  if (!updated) throw notFound("Member not found.");
  return toMemberDto(updated);
}

export async function removeMember(memberId: string): Promise<void> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.MEMBER_REMOVE,
  );

  const member = await findMemberById(prisma, memberId);
  if (!member || member.organizationId !== ctx.organization.id) {
    throw notFound("Member not found.");
  }
  if (member.isOwner) {
    throw conflict("The organization owner cannot be removed.");
  }
  if (member.id === ctx.member.id) {
    throw conflict("You cannot remove yourself.");
  }
  if (
    member.role.name === systemRoleNames.admin &&
    !ctx.member.isOwner &&
    ctx.member.roleName !== systemRoleNames.owner
  ) {
    throw permissionDenied();
  }

  await deleteMember(prisma, memberId);
}
