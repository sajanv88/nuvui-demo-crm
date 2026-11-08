import { SidebarTrigger } from "@nuvui/react";
import type { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";

/** The bar at the top of every page: the page's h1 and its actions. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="shell__bar">
      <SidebarTrigger />
      <div className="shell__heading">
        <h1 className="shell__title">{title}</h1>
        {description ? (
          <p className="shell__description">{description}</p>
        ) : null}
      </div>
      <div className="shell__actions">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  );
}
