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
    branding: {
      logo: string | null;
    } | null;
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

const memberListInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
    },
  },
  role: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

export type MemberListRow = OrganizationMember & {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
  };
  role: {
    id: string;
    name: string;
  };
};

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
      organization: {
        include: { branding: true },
      },
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

export async function listMembersByOrganization(
  db: DatabaseClient,
  organizationId: string,
): Promise<MemberListRow[]> {
  return db.organizationMember.findMany({
    where: { organizationId },
    include: memberListInclude,
    orderBy: { joinedAt: "asc" },
  });
}

export async function findMemberById(
  db: DatabaseClient,
  memberId: string,
): Promise<MemberListRow | null> {
  return db.organizationMember.findUnique({
    where: { id: memberId },
    include: memberListInclude,
  });
}

export async function findMemberByUserAndOrg(
  db: DatabaseClient,
  organizationId: string,
  userId: string,
): Promise<OrganizationMember | null> {
  return db.organizationMember.findUnique({
    where: {
      organizationId_userId: { organizationId, userId },
    },
  });
}

export async function updateMemberRole(
  db: DatabaseClient,
  memberId: string,
  roleId: string,
): Promise<OrganizationMember> {
  return db.organizationMember.update({
    where: { id: memberId },
    data: { roleId, isOwner: false },
  });
}

export async function deleteMember(
  db: DatabaseClient,
  memberId: string,
): Promise<void> {
  await db.organizationMember.delete({ where: { id: memberId } });
}

export function getPermissionNamesFromMember(
  member: MemberWithContext,
): PermissionName[] {
  return member.role.rolePermissions.map(
    ({ permission }) => permission.name as PermissionName,
  );
}
