import { requireAppContext } from "@/modules/auth/services/app-context.service";
import {
  assertCanManageCustomFields,
  listCustomFields,
} from "@/modules/custom-fields";
import { syncSystemRolePermissions } from "@/modules/organizations/services/role-seed.service";
import { CustomFieldsManager } from "@/modules/settings/components/custom-fields-manager";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { createAuthorizationService } from "@/modules/permissions/services/authorization.service";
import { prisma } from "@/server/db/prisma";
import { redirect } from "next/navigation";

export default async function CustomFieldsSettingsPage() {
  // Repair role permission sets when new permissions ship (e.g. customfield.*).
  const ctx = await requireAppContext();
  await syncSystemRolePermissions(prisma, ctx.organization.id);

  // Re-load context so authz sees permissions added by sync.
  const refreshed = await requireAppContext();
  const canRead = await createAuthorizationService(
    refreshed.permissions,
  ).can(Permissions.CUSTOM_FIELD_READ);
  if (!canRead) {
    redirect("/dashboard");
  }

  const [fields, canManage] = await Promise.all([
    listCustomFields(),
    assertCanManageCustomFields(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Custom fields</h1>
        <p className="text-muted-foreground">
          Extra lead fields for your organization.
        </p>
      </div>
      <CustomFieldsManager fields={fields} canManage={canManage} />
    </div>
  );
}
