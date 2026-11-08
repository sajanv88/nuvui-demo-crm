import type { Metadata } from "next";
import {
  CompanyKindsTableCard,
  CompanyStructureCard,
} from "web/components/dashboard/sections";
import { PageHeader } from "web/components/shell/page-header";

export const metadata: Metadata = {
  title: "Companies",
  description: "How the companies contacts work at are set up.",
};

export default function CompaniesPage() {
  return (
    <>
      <PageHeader
        title="Companies"
        description="Partnerships, groups, LLCs and the rest."
      />
      <div className="shell__page">
        <div className="dashboard__row dashboard__row--side">
          <CompanyStructureCard />
          <CompanyKindsTableCard />
        </div>
      </div>
    </>
  );
}
