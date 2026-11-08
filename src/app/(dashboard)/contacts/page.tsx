import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nuvui/react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactsTable } from "web/components/contacts/contacts-table";
import { TableSkeleton } from "web/components/dashboard/skeletons";
import { PageHeader } from "web/components/shell/page-header";
import { parseContactsQuery } from "web/lib/contacts-query";
import { queryContacts } from "web/lib/data/contacts";

export const metadata: Metadata = {
  title: "Contacts",
  description: "Every contact: search, filter, sort and page through them.",
};

/**
 * Reads the URL and fetches one page. It's the only part of this route that
 * depends on the request, so it's the only part behind Suspense: the header
 * and the card around it are in the prerendered shell.
 */
async function ContactsResults({
  searchParams,
}: {
  searchParams: PageProps<"/contacts">["searchParams"];
}) {
  const query = parseContactsQuery(await searchParams);
  const result = await queryContacts(query);

  return (
    <ContactsTable
      rows={result.rows}
      total={result.total}
      // The page served, which may be lower than the one in the URL when
      // the URL asks for a page past the end.
      query={{ ...query, page: result.page }}
    />
  );
}

export default function ContactsPage({ searchParams }: PageProps<"/contacts">) {
  return (
    <>
      <PageHeader title="Contacts" description="Everyone in the list." />
      <div className="shell__page">
        <Card className="dashboard__card">
          <CardHeader>
            <CardTitle asChild>
              <h2 id="contacts-title">All contacts</h2>
            </CardTitle>
            <CardDescription>
              Search, filter by provider, sort any column, or open a contact.
              Everything is in the URL, so any view can be shared.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={<TableSkeleton rows={10} label="Loading contacts" />}
            >
              <ContactsResults searchParams={searchParams} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
