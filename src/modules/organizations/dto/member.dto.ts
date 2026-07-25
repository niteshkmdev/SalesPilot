import { z } from "zod";
import type { MemberListRow } from "@/modules/organizations/repository/member.repository";

export const MemberListFiltersSchema = z.object({
  q: z.string().trim().optional(),
  roleId: z.string().trim().min(1).optional(),
});

export type MemberListFilters = z.infer<typeof MemberListFiltersSchema>;

export function hasActiveMemberFilters(
  filters: Pick<MemberListFilters, "roleId">,
): boolean {
  return Boolean(filters.roleId);
}

export const InviteMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .transform((value) => value.toLowerCase()),
  roleId: z.string().min(1, "Select a role"),
});

export const UpdateMemberRoleSchema = z.object({
  memberId: z.string().min(1),
  roleId: z.string().min(1),
});

export const MemberIdSchema = z.object({
  memberId: z.string().min(1),
});

export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;

export interface MemberDto {
  id: string;
  organizationId: string;
  userId: string;
  roleId: string;
  roleName: string;
  isOwner: boolean;
  joinedAt: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
}

export interface RoleOptionDto {
  id: string;
  name: string;
  description: string | null;
}

export function toMemberDto(member: MemberListRow): MemberDto {
  return {
    id: member.id,
    organizationId: member.organizationId,
    userId: member.userId,
    roleId: member.roleId,
    roleName: member.isOwner ? "Owner" : member.role.name,
    isOwner: member.isOwner,
    joinedAt: member.joinedAt.toISOString(),
    name: member.user.name,
    email: member.user.email,
    emailVerified: member.user.emailVerified,
    image: member.user.image,
  };
}
