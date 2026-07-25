import { PageHeader } from "@/components/layout/page-header";
import { NotificationCenter } from "@/modules/notifications/components/notification-center";

export default function NotificationsPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        backHref="/dashboard"
        backLabel="Back to dashboard"
        title="Notifications"
        subtitle="Assignment and status updates for leads that need your attention."
      />
      <NotificationCenter />
    </div>
  );
}
