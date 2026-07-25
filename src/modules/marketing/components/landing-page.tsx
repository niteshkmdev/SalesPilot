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
import Image from "next/image";
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
      "Organize every new, qualified, and won lead in one clean workspace with clear ownership.",
  },
  {
    icon: UsersIcon,
    title: "Team assignment",
    description:
      "Route work to managers and members without losing context on who owns the next step.",
  },
  {
    icon: FileTextIcon,
    title: "Custom lead forms",
    description:
      "Publish public forms that create leads instantly from campaigns, sites, and events.",
  },
  {
    icon: LockKeyholeIcon,
    title: "Role-based access",
    description:
      "Protect sensitive pipeline data with organization roles and permissions built in.",
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
      "See every note, status change, assignment, and follow-up in one continuous history.",
  },
];

const workflowSteps = [
  {
    title: "Capture",
    description:
      "Collect leads from public forms and manual entry into a shared organization workspace.",
  },
  {
    title: "Manage",
    description:
      "Assign owners, update status, and keep notes and activity visible to the whole team.",
  },
  {
    title: "Close",
    description:
      "Move deals through your pipeline with a live dashboard that shows what needs attention.",
  },
];

const pricingFeatures = [
  "Lead tracking and pipeline statuses",
  "Public lead forms and submissions",
  "Members, roles, and permissions",
  "Dashboard, search, and activity",
  "Secure authentication",
];

const faqs = [
  {
    question: "What is SalesPilot?",
    answer:
      "SalesPilot is a modern CRM workspace for small teams. Capture leads, assign ownership, track pipeline health, and keep every interaction visible from first touch to close.",
  },
  {
    question: "Can multiple users collaborate?",
    answer:
      "Yes. Each organization supports members with roles so managers and teammates can share leads, assignments, and activity without losing ownership context.",
  },
  {
    question: "Does it support custom lead forms?",
    answer:
      "Yes. Publish branded public lead forms that create leads in your workspace as soon as someone submits.",
  },
  {
    question: "How are permissions managed?",
    answer:
      "SalesPilot uses role-based access control. Owners and admins manage members and settings; managers and members work within the permissions set for your organization.",
  },
  {
    question: "Is data secure?",
    answer:
      "Yes. Access is gated by authentication and organization membership. Sensitive actions are authorized on the server so client input is never trusted alone.",
  },
  {
    question: "Can I upload files?",
    answer:
      "Yes. Attach files to leads so proposals, briefs, and supporting documents stay with the conversation history.",
  },
];

interface LandingPageProps {
  isAuthenticated?: boolean;
}

export function LandingPage({ isAuthenticated = false }: LandingPageProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <MarketingSiteHeader isAuthenticated={isAuthenticated} />

      <section className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-24 lg:grid lg:grid-cols-[1fr_1.05fr] lg:items-center">
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
              A focused CRM for capture, collaboration, visibility, and
              follow-up—without heavyweight enterprise clutter.
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

      <section
        id="product"
        className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-24"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-3 text-center">
          <Badge variant="outline" className="mx-auto w-fit">
            Product
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            See pipeline, priorities, and progress in one view.
          </h2>
          <p className="text-muted-foreground">
            Track stage distribution, assigned leads, recent activity, and
            notifications from a single dashboard built for daily sales work.
          </p>
        </div>
        <DashboardHeroImage />
        <div className="mx-auto grid max-w-4xl gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          {[
            "Live pipeline by stage",
            "Priority assigned leads",
            "Activity and alerts",
          ].map((item) => (
            <div
              className="flex items-center justify-center gap-2 rounded-lg border bg-card px-4 py-3"
              key={item}
            >
              <BadgeCheckIcon className="size-4 shrink-0 text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.75fr_1fr] lg:items-center">
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
              <Card key={step.title}>
                <CardContent className="flex items-start gap-4 pt-0">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto mb-10 flex max-w-3xl flex-col gap-3 text-center">
          <Badge variant="outline" className="mx-auto w-fit">
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Simple pricing for focused teams.
          </h2>
          <p className="text-muted-foreground">
            One clear plan with everything you need to run lead capture through
            close.
          </p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                Starter
              </Badge>
              <CardTitle className="text-3xl">Launch your lead desk</CardTitle>
              <CardDescription>
                Forms, dashboard, lead tracking, members, and role-aware access
                in one workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">$19</span>
                <span className="pb-1 text-muted-foreground">per seat</span>
              </div>
              <ul className="grid gap-2 text-sm">
                {pricingFeatures.map((item) => (
                  <li className="flex items-center gap-2" key={item}>
                    <BadgeCheckIcon className="size-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
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
                Included
              </Badge>
              <CardTitle>Built for growing sales teams</CardTitle>
              <CardDescription>
                Multi-tenant organizations, a permission registry, dashboard
                widgets, and public form submissions—ready as your team scales.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              {[
                "Organization workspaces",
                "Role-based permissions",
                "Pipeline dashboard",
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

      <section id="faq" className="border-y bg-muted/30">
        <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-24">
          <div className="flex flex-col gap-3 text-center">
            <Badge variant="outline" className="mx-auto w-fit">
              FAQ
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">
              Clear answers before you start.
            </h2>
          </div>
          <div className="grid gap-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border bg-card px-5 py-1 open:pb-4"
              >
                <summary className="cursor-pointer list-none py-4 font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {faq.question}
                    <span className="text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="pr-8 text-sm leading-6 text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col items-center gap-6 rounded-2xl border bg-muted/30 px-6 py-16 text-center md:px-12">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            Start managing leads today.
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Set up your workspace, invite your team, and run your pipeline from
            one modern CRM built for focused sales work.
          </p>
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link href="/dashboard">
                Open Dashboard
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link href="/signup">
                Get Started
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          )}
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

function DashboardHeroImage({ priority = false }: { priority?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/10 ring-1 ring-foreground/5">
      <Image
        src="/Hero.png"
        alt="SalesPilot dashboard showing pipeline stages, assigned leads, and workspace metrics"
        width={2880}
        height={1512}
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 56vw"
        className="h-auto w-full"
      />
    </div>
  );
}
