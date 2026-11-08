"use client";

import { Progress, Spinner } from "@nuvui/react";
import { useLinkStatus } from "next/link";
import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useState,
} from "react";

// Feedback while a navigation is on its way. The App Router has no global
// "route is changing" event, so anything that navigates reports its own
// pending state here: links through useLinkStatus, and router.push calls
// through the transition they run in. While anything is pending, a bar
// runs along the top of the page.

type Report = (delta: 1 | -1) => void;

const NavigationContext = createContext<Report>(() => {});

export function NavigationProgressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [pending, setPending] = useState(0);
  const report = useCallback<Report>(
    (delta) => setPending((count) => Math.max(0, count + delta)),
    [],
  );

  return (
    <NavigationContext value={report}>
      {pending > 0 ? (
        <div className="nav-progress">
          <Progress aria-label="Loading the page" size="sm" />
        </div>
      ) : null}
      {children}
    </NavigationContext>
  );
}

/** Shows the top bar while `pending` is true. */
export function useReportPending(pending: boolean) {
  const report = use(NavigationContext);
  useEffect(() => {
    if (!pending) return;
    report(1);
    return () => report(-1);
  }, [pending, report]);
}

/**
 * Goes inside a next/link. While that link's navigation is pending it runs
 * the top bar and swaps `icon` for a spinner, so the reader sees which
 * click is being worked on. Fast navigations finish before either shows:
 * both wait 150ms (see shell.css).
 */
export function LinkStatusIcon({
  icon,
  inline = false,
}: {
  /** What shows while nothing is pending. Left out, nothing does. */
  icon?: ReactNode;
  /** The spinner follows text, rather than standing in for an icon. */
  inline?: boolean;
}) {
  const { pending } = useLinkStatus();
  useReportPending(pending);

  if (pending) {
    return (
      <Spinner
        size="sm"
        label=""
        className={inline ? "link-status link-status--inline" : "link-status"}
      />
    );
  }
  return icon ?? null;
}
