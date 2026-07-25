import type { OrganizationMember } from "@prisma/client";
import type { PermissionName } from "@/modules/permissions/constants/permissions";
import type { DatabaseClient } from "@/server/db/types";

export interface CreateMemberInput {
  organizationId: string;
  userId: string;
  roleId: string;
  isOwner: boolean;
}

export interface MemberWithContext extends OrganizationMember {
  organization: {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  };
  role: {
    id: string;
    organizationId: string;
    name: string;
    description: string | null;
    createdAt: Date;
    rolePermissions: Array<{
      permission: {
        name: string;
      };
    }>;
  };
}

export async function createMember(
  db: DatabaseClient,
  input: CreateMemberInput,
): Promise<OrganizationMember> {
  return db.organizationMember.create({ data: input });
}

export async function findFirstActiveMemberByUserId(
  db: DatabaseClient,
  userId: string,
): Promise<MemberWithContext | null> {
  return db.organizationMember.findFirst({
    where: { userId },
    include: {
      organization: true,
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });
}

export function getPermissionNamesFromMember(
  member: MemberWithContext,
): PermissionName[] {
  return member.role.rolePermissions.map(
    ({ permission }) => permission.name as PermissionName,
  );
}
