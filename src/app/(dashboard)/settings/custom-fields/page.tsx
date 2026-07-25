import { redirect } from "next/navigation";
import { requireAppContext } from "@/modules/auth/services/app-context.service";
import {
  assertCanManageCustomFields,
  listCustomFields,
} from "@/modules/custom-fields";
import { syncSystemRolePermissions } from "@/modules/organizations/services/role-seed.service";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { createAuthorizationService } from "@/modules/permissions/services/authorization.service";
import {
  CustomFieldsAddButton,
  CustomFieldsManager,
} from "@/modules/settings/components/custom-fields-manager";
import { prisma } from "@/server/db/prisma";

export default async function CustomFieldsSettingsPage() {
  // Repair role permission sets when new permissions ship (e.g. customfield.*).
  const ctx = await requireAppContext();
  await syncSystemRolePermissions(prisma, ctx.organization.id);

  // Re-load context so authz sees permissions added by sync.
  const refreshed = await requireAppContext();
  const canRead = await createAuthorizationService(refreshed.permissions).can(
    Permissions.CUSTOM_FIELD_READ,
  );
  if (!canRead) {
    redirect("/dashboard");
  }

  const [fields, canManage] = await Promise.all([
    listCustomFields(),
    assertCanManageCustomFields(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custom fields</h1>
          <p className="text-muted-foreground">
            Extra lead fields for your organization. {fields.length} field
            {fields.length === 1 ? "" : "s"}.
          </p>
        </div>
        <CustomFieldsAddButton canManage={canManage} />
      </div>
      <CustomFieldsManager fields={fields} canManage={canManage} />
    </div>
  );
}
