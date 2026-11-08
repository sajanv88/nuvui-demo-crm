import { Skeleton, VisuallyHidden } from "@nuvui/react";
import { ChartSkeleton } from "web/components/dashboard/skeletons";

/** Shown while a page that isn't prerendered is on its way. */
export default function Loading() {
  return (
    <div aria-busy="true">
      <output>
        <VisuallyHidden>Loading the page</VisuallyHidden>
      </output>
      <div className="shell__bar">
        <Skeleton className="skeleton__title" />
      </div>
      <div className="shell__page">
        <ChartSkeleton variant="wide" />
      </div>
    </div>
  );
}
