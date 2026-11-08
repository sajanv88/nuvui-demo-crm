import { Skeleton, Stat, VisuallyHidden } from "@nuvui/react";

// Suspense fallbacks. Each takes the shape of what it stands in for, so the
// page doesn't move when the content streams in.

function Busy({ label }: { label: string }) {
  return (
    <output>
      <VisuallyHidden>{label}</VisuallyHidden>
    </output>
  );
}

export function ChartSkeleton({
  label = "Loading chart",
  variant = "default",
}: {
  label?: string;
  variant?: "default" | "wide" | "round";
}) {
  return (
    <div aria-busy="true" className="skeleton">
      <Busy label={label} />
      <Skeleton className={`skeleton__chart skeleton__chart--${variant}`} />
    </div>
  );
}

export function ListSkeleton({
  rows = 5,
  label = "Loading",
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <div aria-busy="true" className="skeleton skeleton--list">
      <Busy label={label} />
      {Array.from({ length: rows }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no identity
        <div key={index} className="skeleton__row">
          <Skeleton shape="circle" className="skeleton__avatar" />
          <div className="skeleton__lines">
            <Skeleton shape="text" className="skeleton__line--short" />
            <Skeleton shape="text" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 6,
  label = "Loading table",
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <div aria-busy="true" className="skeleton skeleton--table">
      <Busy label={label} />
      <Skeleton className="skeleton__toolbar" />
      {Array.from({ length: rows }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no identity
        <Skeleton key={index} className="skeleton__table-row" />
      ))}
    </div>
  );
}

export function FiguresSkeleton() {
  return (
    <ul className="dashboard__figures" aria-busy="true">
      {["one", "two", "three", "four"].map((key) => (
        <li key={key}>
          <Stat className="dashboard__figure">
            <Skeleton shape="text" className="skeleton__line--short" />
            <Skeleton className="skeleton__value" />
            <Skeleton shape="text" />
            <Skeleton className="skeleton__spark" />
          </Stat>
        </li>
      ))}
      <li className="skeleton__status">
        <Busy label="Loading figures" />
      </li>
    </ul>
  );
}
