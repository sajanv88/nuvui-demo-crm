import { ExternalLinkIcon } from "@nuvui/icons";
import { Button } from "@nuvui/react";
import { Suspense } from "react";
import { ContactDetails } from "web/components/contacts/contact-details";
import { ContactSheet } from "web/components/contacts/contact-sheet";
import { getContact } from "web/lib/data/contacts";

/**
 * /contacts/[id], intercepted: a contact chosen from inside the app opens in
 * a sheet over the page it was chosen on. Loading the URL directly skips
 * this and renders the full page in contacts/[id].
 */
async function ContactModal({
  params,
}: {
  params: PageProps<"/contacts/[id]">["params"];
}) {
  const { id } = await params;
  const contact = await getContact(id);
  if (!contact) return null;

  return (
    <ContactSheet
      title={contact.name}
      description={contact.company}
      footer={
        <Button asChild intent="secondary" size="sm">
          {/* A plain link, so the full page loads instead of this sheet. */}
          <a href={`/contacts/${contact.id}`}>
            <ExternalLinkIcon size={16} aria-hidden="true" />
            Open as a page
          </a>
        </Button>
      }
    >
      <ContactDetails contact={contact} />
    </ContactSheet>
  );
}

export default function InterceptedContactPage({
  params,
}: PageProps<"/contacts/[id]">) {
  return (
    <Suspense fallback={null}>
      <ContactModal params={params} />
    </Suspense>
  );
}
