// The dashboard's cards. Each card's frame (title, description, link) is
// rendered at once, and only the part that needs data waits for it, behind
// its own Suspense boundary. Every data read is a cached server function,
// so these are Server Components; the charts inside are client leaves.

import { ArrowRightIcon } from "@nuvui/icons";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Timeline,
  TimelineContent,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
  Trend,
  VisuallyHidden,
} from "@nuvui/react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@nuvui/table";
import type { Route } from "next";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { LinkStatusIcon } from "web/components/shell/navigation-progress";
import {
  getActivity,
  getCompanyKinds,
  getContactCount,
  getDomainBreakdown,
  getFigures,
  getLatestContacts,
  getMonthlyGrowth,
  getProviderBreakdown,
} from "web/lib/data/contacts";
import { formatPercent, formatShortDateTime } from "web/lib/format";
import { providerIntent, providerLabels } from "web/lib/labels";
import {
  ActivityChart,
  DomainChart,
  GrowthChart,
  ProviderChart,
} from "./charts";
import { Figures } from "./figures";
import {
  ChartSkeleton,
  FiguresSkeleton,
  ListSkeleton,
  TableSkeleton,
} from "./skeletons";

/* A card with a heading at the right level and an optional link. */

function SectionCard({
  id,
  title,
  description,
  href,
  linkLabel = "Details",
  children,
}: {
  id?: string;
  title: string;
  description: ReactNode;
  href?: Route;
  linkLabel?: string;
  children: ReactNode;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <Card className="dashboard__card">
      <CardHeader>
        <CardTitle asChild>
          <h2 id={headingId}>{title}</h2>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        {href ? (
          <CardAction>
            <Button asChild intent="ghost" size="sm">
              <Link href={href}>
                {linkLabel}
                <LinkStatusIcon
                  icon={<ArrowRightIcon size={14} aria-hidden="true" />}
                />
              </Link>
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/* Figures */

async function FiguresData() {
  return <Figures figures={await getFigures()} />;
}

export function FiguresSection() {
  return (
    <section aria-labelledby="figures-title" className="dashboard__section">
      <h2 id="figures-title" className="dashboard__section-title">
        At a glance
      </h2>
      <Suspense fallback={<FiguresSkeleton />}>
        <FiguresData />
      </Suspense>
    </section>
  );
}

/* Growth */

async function GrowthData() {
  return <GrowthChart months={await getMonthlyGrowth()} />;
}

export function GrowthCard({ href }: { href?: Route }) {
  return (
    <SectionCard
      id="growth"
      title="Contact growth"
      description="New contacts each month, and the running total."
      href={href}
    >
      <Suspense fallback={<ChartSkeleton variant="wide" />}>
        <GrowthData />
      </Suspense>
    </SectionCard>
  );
}

async function MonthlyTableData() {
  const months = await getMonthlyGrowth();
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Month</TableHead>
            <TableHead align="end">New contacts</TableHead>
            <TableHead>Against the month before</TableHead>
            <TableHead align="end">Running total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {months.toReversed().map((row, index, all) => {
            const before = all[index + 1];
            return (
              <TableRow key={row.label}>
                <TableCell rowHeader>{row.label}</TableCell>
                <TableCell align="end" className="dashboard__number">
                  {row.signups}
                </TableCell>
                <TableCell>
                  {before && before.signups > 0 ? (
                    <Trend
                      value={(row.signups - before.signups) / before.signups}
                    />
                  ) : (
                    <span className="dashboard__muted">—</span>
                  )}
                </TableCell>
                <TableCell align="end" className="dashboard__number">
                  {row.total}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function MonthlyTableCard() {
  return (
    <SectionCard
      id="monthly"
      title="Month by month"
      description="Newest first. The current month is still open."
    >
      <Suspense fallback={<TableSkeleton rows={8} />}>
        <MonthlyTableData />
      </Suspense>
    </SectionCard>
  );
}

/* Latest sign-ups */

async function LatestData({ count }: { count: number }) {
  const latest = await getLatestContacts(count);
  return (
    <Timeline aria-labelledby="latest-title">
      {latest.map((contact, index) => (
        <TimelineItem key={contact.id}>
          <TimelineMarker intent={index === 0 ? "primary" : "neutral"} />
          <TimelineContent>
            <TimelineTitle className="dashboard__person">
              <Avatar size="sm">
                <AvatarFallback aria-hidden="true">
                  {contact.initials}
                </AvatarFallback>
              </Avatar>
              <Link
                href={`/contacts/${contact.id}`}
                className="dashboard__link"
              >
                {contact.name}
                <LinkStatusIcon inline />
              </Link>
            </TimelineTitle>
            <TimelineDescription>{contact.company}</TimelineDescription>
            <TimelineTime dateTime={contact.createdAt}>
              {formatShortDateTime.format(new Date(contact.createdAt))} UTC
            </TimelineTime>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

export function LatestSignupsCard({ count = 6 }: { count?: number }) {
  return (
    <SectionCard
      id="latest"
      title="Latest sign-ups"
      description={`The ${count} newest contacts.`}
      href="/contacts"
      linkLabel="All"
    >
      <Suspense
        fallback={<ListSkeleton rows={count} label="Loading contacts" />}
      >
        <LatestData count={count} />
      </Suspense>
    </SectionCard>
  );
}

/* Email providers */

async function ProvidersData() {
  return <ProviderChart providers={await getProviderBreakdown()} />;
}

export function ProvidersCard({ href }: { href?: Route }) {
  return (
    <SectionCard
      id="providers"
      title="Email providers"
      description="Where contacts keep their inbox."
      href={href}
    >
      <Suspense fallback={<ChartSkeleton variant="round" />}>
        <ProvidersData />
      </Suspense>
    </SectionCard>
  );
}

async function ProviderTableData() {
  const [providers, total] = await Promise.all([
    getProviderBreakdown(),
    getContactCount(),
  ]);
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead align="end">Contacts</TableHead>
            <TableHead>Share</TableHead>
            <TableHead align="end">
              <VisuallyHidden>Filter</VisuallyHidden>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((row) => (
            <TableRow key={row.provider}>
              <TableCell rowHeader>
                <Badge intent={providerIntent[row.provider]} variant="outline">
                  {providerLabels[row.provider]}
                </Badge>
              </TableCell>
              <TableCell align="end" className="dashboard__number">
                {row.contacts}
              </TableCell>
              <TableCell>
                <div className="dashboard__share">
                  <Progress
                    aria-label={`${providerLabels[row.provider]} share`}
                    value={row.contacts}
                    max={total}
                    size="sm"
                  />
                  <span className="dashboard__muted">
                    {formatPercent(row.contacts, total)}
                  </span>
                </div>
              </TableCell>
              <TableCell align="end">
                <Button asChild intent="ghost" size="sm">
                  <Link href={`/contacts?provider=${row.provider}`}>
                    View
                    <VisuallyHidden>
                      {" "}
                      {providerLabels[row.provider]} contacts
                    </VisuallyHidden>
                    <LinkStatusIcon inline />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function ProviderTableCard() {
  return (
    <SectionCard
      id="provider-table"
      title="Providers in detail"
      description="Open the contacts list filtered to one provider."
    >
      <Suspense fallback={<TableSkeleton rows={3} />}>
        <ProviderTableData />
      </Suspense>
    </SectionCard>
  );
}

/* Activity */

async function ActivityData() {
  const { weekdays, dayparts } = await getActivity();
  return <ActivityChart weekdays={weekdays} dayparts={dayparts} />;
}

export function ActivityCard() {
  return (
    <SectionCard
      id="activity"
      title="Sign-up activity"
      description="When people join, in UTC."
    >
      <Suspense fallback={<ChartSkeleton />}>
        <ActivityData />
      </Suspense>
    </SectionCard>
  );
}

/* Website domains */

async function DomainsData() {
  return <DomainChart domains={await getDomainBreakdown()} />;
}

export function DomainsCard() {
  return (
    <SectionCard
      id="domains"
      title="Website domains"
      description="Top-level domain of each contact's site."
    >
      <Suspense fallback={<ChartSkeleton />}>
        <DomainsData />
      </Suspense>
    </SectionCard>
  );
}

/* Company structure */

async function CompanyStructureData() {
  const [kinds, total] = await Promise.all([
    getCompanyKinds(),
    getContactCount(),
  ]);
  return (
    <ul className="dashboard__breakdown">
      {kinds.map((kind) => (
        <li key={kind.kind} className="dashboard__breakdown-item">
          <div className="dashboard__breakdown-text">
            <span id={`kind-${kind.kind}`}>{kind.label}</span>
            <span className="dashboard__muted" aria-hidden="true">
              {kind.contacts}
            </span>
          </div>
          <Progress
            aria-labelledby={`kind-${kind.kind}`}
            value={kind.contacts}
            max={total}
            size="sm"
          />
        </li>
      ))}
    </ul>
  );
}

export function CompanyStructureCard({ href }: { href?: Route }) {
  return (
    <SectionCard
      id="structure"
      title="Company structure"
      description="How the companies are set up, judged by their names."
      href={href}
    >
      <Suspense fallback={<ListSkeleton rows={6} label="Loading companies" />}>
        <CompanyStructureData />
      </Suspense>
    </SectionCard>
  );
}

async function CompanyKindsTableData() {
  const [kinds, total] = await Promise.all([
    getCompanyKinds(),
    getContactCount(),
  ]);
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Structure</TableHead>
            <TableHead align="end">Companies</TableHead>
            <TableHead align="end">Share</TableHead>
            <TableHead>For example</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kinds.map((kind) => (
            <TableRow key={kind.kind}>
              <TableCell rowHeader>{kind.label}</TableCell>
              <TableCell align="end" className="dashboard__number">
                {kind.contacts}
              </TableCell>
              <TableCell align="end" className="dashboard__number">
                {formatPercent(kind.contacts, total)}
              </TableCell>
              <TableCell className="dashboard__muted">
                {kind.examples.join(" · ")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function CompanyKindsTableCard() {
  return (
    <SectionCard
      id="kinds-table"
      title="Structures in detail"
      description="Each contact works at a different company."
    >
      <Suspense fallback={<TableSkeleton rows={6} />}>
        <CompanyKindsTableData />
      </Suspense>
    </SectionCard>
  );
}
