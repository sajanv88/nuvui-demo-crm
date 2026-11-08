import { ArrowLeftIcon } from "@nuvui/icons";
import {
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardContent,
  Skeleton,
} from "@nuvui/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContactDetails } from "web/components/contacts/contact-details";
import { ListSkeleton } from "web/components/dashboard/skeletons";
import { LinkStatusIcon } from "web/components/shell/navigation-progress";
import { PageHeader } from "web/components/shell/page-header";
import { getContact, getContactIds } from "web/lib/data/contacts";

type Params = PageProps<"/contacts/[id]">["params"];

// Every contact known at build time is prerendered. One added later is
// rendered on its first request and cached from then on.
export async function generateStaticParams() {
  const ids = await getContactIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/contacts/[id]">): Promise<Metadata> {
  const { id } = await params;
  const contact = await getContact(id);
  if (!contact) return { title: "Contact not found" };
  return {
    title: contact.name,
    description: `${contact.name} at ${contact.company}.`,
  };
}

/** The contact the URL names. getContact is cached, so callers share it. */
async function contactFrom(params: Params) {
  const { id } = await params;
  const contact = await getContact(id);
  if (!contact) notFound();
  return contact;
}

const backLink = (
  <Button asChild intent="ghost" size="sm">
    <Link href="/contacts">
      <LinkStatusIcon icon={<ArrowLeftIcon size={16} aria-hidden="true" />} />
      All contacts
    </Link>
  </Button>
);

async function ContactHeader({ params }: { params: Params }) {
  const contact = await contactFrom(params);
  return (
    <PageHeader
      title={contact.name}
      description={contact.company}
      actions={backLink}
    />
  );
}

async function ContactCard({ params }: { params: Params }) {
  const contact = await contactFrom(params);
  return (
    <Card>
      <CardContent className="contact-page">
        <Avatar size="lg">
          <AvatarFallback aria-hidden="true">{contact.initials}</AvatarFallback>
        </Avatar>
        <ContactDetails contact={contact} />
      </CardContent>
    </Card>
  );
}

/**
 * The page itself doesn't read `params`, so its frame is in the prerendered
 * shell and a navigation here shows it at once. The two parts that need the
 * contact read the URL behind their own Suspense boundaries.
 */
export default function ContactPage({ params }: PageProps<"/contacts/[id]">) {
  return (
    <>
      <Suspense
        fallback={<PageHeader title="Loading contact…" actions={backLink} />}
      >
        <ContactHeader params={params} />
      </Suspense>
      <div className="shell__page shell__page--narrow">
        <Suspense
          fallback={
            <Card aria-busy="true">
              <CardContent className="contact-page">
                <Skeleton shape="circle" className="skeleton__avatar-lg" />
                <ListSkeleton rows={3} label="Loading contact" />
              </CardContent>
            </Card>
          }
        >
          <ContactCard params={params} />
        </Suspense>
      </div>
    </>
  );
}
