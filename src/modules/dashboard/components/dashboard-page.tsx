"use client";

import { formatDistanceToNow } from "date-fns";
import {
  BellIcon,
  FileTextIcon,
  TrendingUpIcon,
  UserPlusIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DateRangePicker } from "@/components/date-range-picker";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardOverviewDto } from "@/modules/dashboard";
import { DateRangePreset } from "@/shared/dates";

interface DashboardPageProps {
  data: DashboardOverviewDto;
}

export function DashboardPage({ data }: DashboardPageProps) {
  const router = useRouter();
  const pathname = usePathname();

  const onRangeChange = (next: {
    preset: string;
    startDate: string;
    endDate: string;
  }) => {
    const params = new URLSearchParams();
    params.set("preset", next.preset);
    params.set("startDate", next.startDate);
    params.set("endDate", next.endDate);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of leads you can access for{" "}
              {data.range.label.toLowerCase()}.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            showPresets
            align="end"
            value={{
              preset:
                data.range.preset === DateRangePreset.THIS_WEEK ||
                data.range.preset === DateRangePreset.THIS_MONTH ||
                data.range.preset === DateRangePreset.THIS_YEAR ||
                data.range.preset === DateRangePreset.CUSTOM
                  ? data.range.preset
                  : DateRangePreset.THIS_MONTH,
              startDate: data.range.startDate,
              endDate: data.range.endDate,
            }}
            onChange={onRangeChange}
          />
          {data.capabilities.canInviteMember ? (
            <Button variant="outline" asChild>
              <Link href="/settings/members">
                <UserPlusIcon data-icon="inline-start" />
                Invite Member
              </Link>
            </Button>
          ) : null}
          {data.capabilities.canCreateLead ? (
            <Button variant="outline" asChild>
              <Link href="/leads/new">
                <FileTextIcon data-icon="inline-start" />
                New Lead
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader>
              <CardTitle>{metric.label}</CardTitle>
              <CardDescription>{metric.change}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardDescription>
              Lead distribution by stage in the selected range.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {data.pipeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pipeline statuses configured.
              </p>
            ) : (
              data.pipeline.map((stage) => (
                <div className="flex items-center gap-4" key={stage.stage}>
                  <span className="w-24 text-sm text-muted-foreground">
                    {stage.stage}
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: stage.width }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-medium">
                    {stage.value}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Leads</CardTitle>
            <CardDescription>
              Recently updated leads in this range.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.assignedLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No leads in this date range.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.assignedLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <Link
                          href={`/leads/${lead.id}`}
                          className="flex flex-col hover:underline"
                        >
                          <span className="font-medium">{lead.company}</span>
                          <span className="text-muted-foreground">
                            {lead.contact}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{lead.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Avatar size="sm">
                          <AvatarFallback>{lead.owner}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(lead.updatedAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest movement across leads you can see.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {data.activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No activity in this date range.
              </p>
            ) : (
              data.activity.map((item) => (
                <div className="flex items-start gap-3" key={item.id}>
                  <TrendingUpIcon className="mt-0.5 size-4 text-muted-foreground" />
                  <p className="text-sm">{item.summary}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Signals that help you act today.</CardDescription>
            <CardAction>
              <Badge variant="outline" asChild>
                <Link href="/notifications">
                  {data.unreadNotificationCount} unread
                </Link>
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {data.notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No notifications yet.
              </p>
            ) : (
              data.notifications.map((item, index) => (
                <div className="flex flex-col gap-3" key={item.id}>
                  <div className="flex items-start gap-3">
                    <BellIcon className="mt-0.5 size-4 text-muted-foreground" />
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.message}
                      </p>
                    </div>
                  </div>
                  {index < data.notifications.length - 1 ? <Separator /> : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
