import { PageHeader } from "@/components/layout/page-header";
import { requireAppContext } from "@/modules/auth/services/app-context.service";
import { Permissions } from "@/modules/permissions/constants/permissions";
import { createAuthorizationService } from "@/modules/permissions/services/authorization.service";
import { OrganizationForm } from "@/modules/settings/components/organization-form";

export default async function OrganizationSettingsPage() {
  const ctx = await requireAppContext();
  const authz = createAuthorizationService(ctx.permissions);
  const canUpdate = await authz.can(Permissions.ORGANIZATION_UPDATE);
  const canRead = await authz.can(Permissions.ORGANIZATION_READ);
  const canUpdateBranding = await authz.can(Permissions.BRANDING_UPDATE);

  if (!canRead && !canUpdate) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <PageHeader
          title="Organization Settings"
          subtitle="You do not have permission to view organization settings."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        title="Organization Settings"
        subtitle="Manage workspace details and branding."
      />

      {canUpdate ? (
        <OrganizationForm
          name={ctx.organization.name}
          slug={ctx.organization.slug}
          logo={ctx.organization.logo}
          canUpdateBranding={canUpdateBranding}
        />
      ) : (
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 text-sm">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-medium">{ctx.organization.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Slug</p>
            <p className="font-medium">{ctx.organization.slug}</p>
          </div>
        </div>
      )}
    </div>
  );
}
