import { requireAppContext } from "@/modules/auth/services/app-context.service";
import {
  type OrganizationDto,
  toOrganizationDto,
} from "@/modules/organizations/dto/organization.dto";
import {
  type UpdateOrganizationInput,
  UpdateOrganizationSchema,
} from "@/modules/organizations/dto/organization-update.dto";
import { updateOrganizationName } from "@/modules/organizations/repository/organization.repository";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { createAuthorizationService } from "@/modules/permissions/services/authorization.service";
import { prisma } from "@/server/db/prisma";
import { validationFailed } from "@/shared/api/errors";

export async function updateCurrentOrganization(
  input: UpdateOrganizationInput,
): Promise<OrganizationDto> {
  const ctx = await requireAppContext();
  await createAuthorizationService(ctx.permissions).require(
    Permissions.ORGANIZATION_UPDATE,
  );

  const parsed = UpdateOrganizationSchema.safeParse(input);
  if (!parsed.success) {
    throw validationFailed(
      parsed.error.issues[0]?.message ?? "Invalid organization name.",
    );
  }

  const organization = await updateOrganizationName(
    prisma,
    ctx.organization.id,
    parsed.data.name,
  );

  return toOrganizationDto(organization);
}
