import {
  BellIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  TrendingUpIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
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

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { label: "Leads", href: "/leads", icon: ClipboardListIcon },
  { label: "Lead Forms", href: "/lead-forms", icon: FileTextIcon },
  { label: "Members", href: "/members", icon: UsersIcon },
  { label: "Notifications", href: "/notifications", icon: BellIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

const metrics = [
  { label: "Total Leads", value: "248", change: "+18 this month" },
  { label: "Qualified Leads", value: "84", change: "34% of pipeline" },
  { label: "Won Leads", value: "31", change: "12.5% conversion" },
  { label: "Conversion Rate", value: "12.5%", change: "+2.1 from last month" },
];

const pipeline = [
  { stage: "New", value: 92, width: "86%" },
  { stage: "Contacted", value: 61, width: "64%" },
  { stage: "Qualified", value: 42, width: "48%" },
  { stage: "Proposal", value: 22, width: "28%" },
  { stage: "Won", value: 31, width: "36%" },
];

const leads = [
  {
    company: "Northstar Labs",
    contact: "Avery Brooks",
    status: "Qualified",
    owner: "MK",
    value: "$18,400",
  },
  {
    company: "Brightline Studio",
    contact: "Rina Patel",
    status: "Contacted",
    owner: "DL",
    value: "$9,200",
  },
  {
    company: "Orbit Foods",
    contact: "Jon Bell",
    status: "New",
    owner: "AS",
    value: "$6,750",
  },
];

const activity = [
  "Maya qualified Northstar Labs",
  "Drew assigned Brightline Studio",
  "New website form submitted by Orbit Foods",
  "Avery Brooks added a follow-up note",
];

const notifications = [
  "3 leads need follow-up today",
  "Lead form conversion is up this week",
  "2 invitations are still pending",
];

export function DashboardPage() {
  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r bg-background lg:block">
          <div className="flex h-full flex-col gap-6 p-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                S
              </span>
              SalesPilot
            </Link>
            <nav aria-label="Dashboard navigation" className="grid gap-1">
              {navigation.map((item) => (
                <Link
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  href={item.href}
                  key={item.label}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <Card className="mt-auto" size="sm">
              <CardHeader>
                <CardTitle>UI preview mode</CardTitle>
                <CardDescription>
                  Static data now. Backend wiring comes after UI completion.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          <header className="sticky top-0 border-b bg-background/90 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-4 px-6">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar>
                  <AvatarFallback>AG</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">Acme Growth</p>
                  <p className="truncate text-xs text-muted-foreground">
                    Manager workspace
                  </p>
                </div>
              </div>
              <div className="hidden flex-1 justify-center md:flex">
                <div className="flex w-full max-w-md items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
                  <SearchIcon className="size-4" />
                  Search leads, forms, members...
                </div>
              </div>
              <Button>
                <PlusIcon data-icon="inline-start" />
                New Lead
              </Button>
            </div>
          </header>

          <div className="flex flex-col gap-6 p-6">
            <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-2">
                <Badge variant="secondary" className="w-fit">
                  <CalendarDaysIcon data-icon="inline-start" />
                  This Month
                </Badge>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    See what needs attention and how the pipeline is moving.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline">
                  <UserPlusIcon data-icon="inline-start" />
                  Invite Member
                </Button>
                <Button variant="outline">
                  <FileTextIcon data-icon="inline-start" />
                  Create Lead Form
                </Button>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
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
                    Current lead distribution by stage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {pipeline.map((stage) => (
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
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Assigned Leads</CardTitle>
                  <CardDescription>
                    Highest-priority leads needing movement.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow key={lead.company}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {lead.company}
                              </span>
                              <span className="text-muted-foreground">
                                {lead.contact}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{lead.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Avatar size="sm">
                              <AvatarFallback>{lead.owner}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {lead.value}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    The latest movement across leads and forms.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {activity.map((item) => (
                    <div className="flex items-start gap-3" key={item}>
                      <TrendingUpIcon className="mt-0.5 size-4 text-muted-foreground" />
                      <p className="text-sm">{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Signals that help the team act today.
                  </CardDescription>
                  <CardAction>
                    <Badge variant="outline">3 unread</Badge>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {notifications.map((item, index) => (
                    <div className="flex flex-col gap-3" key={item}>
                      <div className="flex items-start gap-3">
                        <BellIcon className="mt-0.5 size-4 text-muted-foreground" />
                        <p className="text-sm">{item}</p>
                      </div>
                      {index < notifications.length - 1 ? <Separator /> : null}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
