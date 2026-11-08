import { DownloadIcon } from "@nuvui/icons";
import { Button } from "@nuvui/react";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  ActivityCard,
  CompanyStructureCard,
  FiguresSection,
  GrowthCard,
  LatestSignupsCard,
  ProvidersCard,
} from "web/components/dashboard/sections";
import { PageHeader } from "web/components/shell/page-header";
import { getSummary } from "web/lib/data/contacts";

export const metadata: Metadata = {
  title: "Overview",
  description: "Contacts at a glance: growth, latest sign-ups and audience.",
};

async function Period() {
  const { range } = await getSummary();
  return (
    <>
      {range.from} – {range.to}
    </>
  );
}

export default function OverviewPage() {
  return (
    <>
      <PageHeader
        title="Overview"
        description={
          <Suspense fallback="Loading the period">
            <Period />
          </Suspense>
        }
        actions={
          <Button asChild intent="secondary" size="sm">
            <a href="/api/contacts/export" download>
              <DownloadIcon size={16} aria-hidden="true" />
              Export CSV
            </a>
          </Button>
        }
      />
      <div className="shell__page">
        <FiguresSection />
        <div className="dashboard__row dashboard__row--main">
          <GrowthCard href="/growth" />
          <LatestSignupsCard />
        </div>
        <div className="dashboard__row dashboard__row--three">
          <ProvidersCard href="/audience" />
          <ActivityCard />
          <CompanyStructureCard href="/companies" />
        </div>
      </div>
    </>
  );
}
