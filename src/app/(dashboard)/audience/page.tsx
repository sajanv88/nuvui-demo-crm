import type { Metadata } from "next";
import {
  DomainsCard,
  ProvidersCard,
  ProviderTableCard,
} from "web/components/dashboard/sections";
import { PageHeader } from "web/components/shell/page-header";

export const metadata: Metadata = {
  title: "Audience",
  description: "Which email providers and web domains contacts use.",
};

export default function AudiencePage() {
  return (
    <>
      <PageHeader
        title="Audience"
        description="Email providers and website domains."
      />
      <div className="shell__page">
        <div className="dashboard__row dashboard__row--halves">
          <ProvidersCard />
          <DomainsCard />
        </div>
        <ProviderTableCard />
      </div>
    </>
  );
}
