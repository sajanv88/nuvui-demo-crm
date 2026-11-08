import type { Metadata } from "next";
import {
  ActivityCard,
  GrowthCard,
  MonthlyTableCard,
} from "web/components/dashboard/sections";
import { PageHeader } from "web/components/shell/page-header";

export const metadata: Metadata = {
  title: "Growth",
  description: "How the contact list has grown, month by month.",
};

export default function GrowthPage() {
  return (
    <>
      <PageHeader
        title="Growth"
        description="How the list has grown, and when people join."
      />
      <div className="shell__page">
        <GrowthCard />
        <div className="dashboard__row dashboard__row--main">
          <MonthlyTableCard />
          <ActivityCard />
        </div>
      </div>
    </>
  );
}
