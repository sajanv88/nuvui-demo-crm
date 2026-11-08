import { HelpCircleIcon } from "@nuvui/icons";
import {
  Button,
  Empty,
  EmptyActions,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@nuvui/react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <main className="not-found">
      <Empty>
        <EmptyMedia>
          <HelpCircleIcon size={24} aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle asChild>
          <h1>Nothing here</h1>
        </EmptyTitle>
        <EmptyDescription>
          The page or contact you asked for doesn't exist, or has been removed.
        </EmptyDescription>
        <EmptyActions>
          <Button asChild>
            <Link href="/">Back to the overview</Link>
          </Button>
          <Button asChild intent="secondary">
            <Link href="/contacts">All contacts</Link>
          </Button>
        </EmptyActions>
      </Empty>
    </main>
  );
}
