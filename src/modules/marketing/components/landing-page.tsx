import {
  ActivityIcon,
  ArrowRightIcon,
  BadgeCheckIcon,
  BellIcon,
  ClipboardListIcon,
  FileTextIcon,
  LockKeyholeIcon,
  SearchIcon,
  SparklesIcon,
  UsersIcon,
  WorkflowIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MarketingSiteFooter,
  MarketingSiteHeader,
} from "@/modules/marketing/components/marketing-site-chrome";

const features = [
  {
    icon: ClipboardListIcon,
    title: "Lead management",
    description:
      "Keep every new, qualified, and won lead organized in one clean workspace.",
  },
  {
    icon: UsersIcon,
    title: "Team assignment",
    description:
      "Route work to managers and team members without losing ownership context.",
  },
  {
    icon: FileTextIcon,
    title: "Custom forms",
    description:
      "Publish public forms that create leads instantly from every campaign.",
  },
  {
    icon: LockKeyholeIcon,
    title: "Role-based access",
    description:
      "Protect sensitive sales data with permissions designed for growing teams.",
  },
  {
    icon: SearchIcon,
    title: "Fast search",
    description:
      "Find people, companies, forms, and activity without digging through tabs.",
  },
  {
    icon: ActivityIcon,
    title: "Activity timeline",
    description:
      "See every note, status change, assignment, and follow-up in context.",
  },
];

const workflowSteps = [
  "Capture leads from polished public forms.",
  "Assign owners and prioritize follow-up.",
  "Track movement from first touch to closed deal.",
];

const faqs = [
  {
    question: "Is SalesPilot built for teams?",
    answer:
      "Yes. The product model includes organizations, members, roles, and permissions from the foundation.",
  },
  {
    question: "Can I publish lead forms?",
    answer:
      "Public lead forms are on the SalesPilot MVP roadmap and will create leads directly from every campaign.",
  },
  {
    question: "Does the dashboard show live pipeline data?",
    answer:
      "Lead management is live today. Dashboard charts and notifications still use sample data while the live overview ships next.",
  },
];

interface LandingPageProps {
  isAuthenticated?: boolean;
}

export function LandingPage({ isAuthenticated = false }: LandingPageProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <MarketingSiteHeader isAuthenticated={isAuthenticated} />

      <section className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-24 lg:grid lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-5">
            <Badge variant="secondary" className="w-fit">
              <SparklesIcon data-icon="inline-start" />
              Built for modern lead teams
            </Badge>
            <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Manage every lead from one modern workspace.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              SalesPilot helps small teams capture leads, assign ownership,
              monitor pipeline health, and keep every interaction visible from
              first touch to close.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {isAuthenticated ? (
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Open Dashboard
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/signup">
                    Get Started
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard">Live Demo</Link>
                </Button>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {["Secure authentication", "Role-based access", "Fast setup"].map(
              (item) => (
                <span className="flex items-center gap-2" key={item}>
                  <BadgeCheckIcon className="size-4 text-primary" />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        <DashboardPreview />
      </section>

      <section id="features" className="border-y bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-24">
          <div className="flex max-w-3xl flex-col gap-3">
            <Badge variant="outline" className="w-fit">
              Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything your team needs to move faster.
            </h2>
            <p className="text-muted-foreground">
              A focused CRM foundation for capture, collaboration, visibility,
              and follow-up without heavyweight enterprise clutter.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="size-5 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.75fr_1fr] lg:items-center">
        <div className="flex flex-col gap-6">
          <Badge variant="secondary" className="w-fit">
            Workflow
          </Badge>
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              From form submission to follow-up in three steps.
            </h2>
            <p className="text-muted-foreground">
              SalesPilot keeps the process obvious so every lead has a clear
              owner, next action, and historical context.
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          {workflowSteps.map((step, index) => (
            <Card key={step}>
              <CardContent className="flex items-center gap-4 pt-0">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {index + 1}
                </span>
                <p className="text-sm font-medium">{step}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-24 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                Starter
              </Badge>
              <CardTitle className="text-3xl">Launch your lead desk</CardTitle>
              <CardDescription>
                Everything needed for the MVP: forms, dashboard, lead tracking,
                members, and role-aware access.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">$19</span>
                <span className="pb-1 text-muted-foreground">per seat</span>
              </div>
              <Button asChild>
                <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
                  {isAuthenticated ? "Open Dashboard" : "Start Free"}
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                Product preview
              </Badge>
              <CardTitle>Built to scale after the MVP</CardTitle>
              <CardDescription>
                The architecture leaves room for billing, organization
                switching, automation, analytics, and AI scoring later.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              {[
                "Multi-tenant foundation",
                "Permission registry",
                "Dashboard widgets",
                "Public form submissions",
              ].map((item) => (
                <div className="flex items-center gap-2" key={item}>
                  <BadgeCheckIcon className="size-4 text-primary" />
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-6 py-24">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3 text-center">
            <Badge variant="outline" className="mx-auto w-fit">
              FAQ
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">
              Clear answers before you start.
            </h2>
          </div>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardHeader>
                  <CardTitle>{faq.question}</CardTitle>
                  <CardDescription>{faq.answer}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <MarketingSiteFooter />
    </main>
  );
}

function DashboardPreview() {
  return (
    <Card className="shadow-2xl shadow-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Pipeline overview</CardTitle>
            <CardDescription>Acme Growth · This month</CardDescription>
          </div>
          <Badge variant="secondary">
            <BellIcon data-icon="inline-start" />3 alerts
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Total leads", "248"],
            ["Qualified", "84"],
            ["Won", "31"],
          ].map(([label, value]) => (
            <div className="rounded-lg bg-muted p-4" key={label}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {[
            ["New", "82%"],
            ["Qualified", "64%"],
            ["Proposal", "46%"],
            ["Won", "28%"],
          ].map(([label, width]) => (
            <div className="flex items-center gap-3" key={label}>
              <span className="w-20 text-xs text-muted-foreground">
                {label}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width }}
                />
              </div>
            </div>
          ))}
        </div>
        <Separator />
        <div className="grid gap-3 text-sm">
          {[
            "Call scheduled with Northstar",
            "New form submission",
            "Lead assigned to Maya",
          ].map((item) => (
            <div className="flex items-center gap-3" key={item}>
              <WorkflowIcon className="size-4 text-muted-foreground" />
              {item}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
